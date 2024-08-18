import React, { useRef } from "react"
import { createContext, ReactNode } from "react"
import { useToast } from "../ui/use-toast"
import { useMutation } from "@tanstack/react-query"
import { trpc } from "@/app/_trpc/client"
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query"
import PdfRenderer from "../PdfRenderer"

type StreamResponse = {
    addMessage: () => void
    message: string
    handleInputChange: (
      event: React.ChangeEvent<HTMLTextAreaElement>
    ) => void
    isLoading: boolean
  }
  
  export const ChatContext = createContext<StreamResponse>({
    addMessage: () => {},
    message: '',
    handleInputChange: () => {},
    isLoading: false,
  })

interface ChatContextProvider {
    fileId: string,
    children: ReactNode
}

export const ChatContextProvider = ({fileId, children}: ChatContextProvider) => {
    const [message, setMessage] = React.useState<string>("")
    const [isLoading, setIsLoading] = React.useState<boolean>(false)

    const utils = trpc.useContext()

    const { toast } = useToast()

    const backupMessage = useRef('')

    const { mutate: sendMessage } = useMutation({
        mutationFn: async ({message} : {message: string}) => {
            const response = await fetch("/api/message", {
                method: "POST",
                body: JSON.stringify({fileId, message})
            })

            if(!response.ok){
                throw new Error("Failed to send message")
            }

            return response.body
        },
        onMutate: async ({ message }) => {
            backupMessage.current = message
            setMessage('')

            //Step 1
            await utils.getFileMessages.cancel()

            //Step 2
            const previousMessages = utils.getFileMessages.getInfiniteData()

            //Step 3
            utils.getFileMessages.setInfiniteData({
                fileId,
                limit: INFINITE_QUERY_LIMIT
            }, (old) => {
                if(!old){
                    return {
                        pages: [],
                        pageParams: []
                    }
                }

                let newPages = [...old.pages]
                let latestPage = newPages[0]!

                latestPage.messages = [
                    {
                        createdAt: new Date().toISOString(),
                        id: crypto.randomUUID(),
                        text: message,
                        isUserMessage: true
                    },
                    ...latestPage.messages
                ]

                newPages[0] = latestPage

                return {
                    ...old,
                    pages: newPages
                }
            }
            )
            setIsLoading(true)

            return {
                previousMessages: previousMessages?.pages.flatMap((page) => page.messages) ?? []
            }
        },
        onSuccess: async (stream) => {
            setIsLoading(false);
        
            if (!stream) {
                return toast({
                    title: 'There was a problem sending this message',
                    description: 'Please refresh this page and try again',
                    variant: 'destructive',
                });
            }
        
            const reader = stream.getReader();
            const decoder = new TextDecoder('utf-8');
            let done = false;
        
            // Accumulated response
            let accResponse = '';
        
            while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;
                const chunkValue = decoder.decode(value, { stream: true });
        
                // Append chunk to accumulated response
                accResponse += chunkValue;
        
                // Extract text between 0:" and "
                const matches = accResponse.match(/0:"(.*?)"/g);
                const result = matches ? matches.map(match => match.slice(3, -1)).join('') : '';
        
                // Update message with the extracted result
                utils.getFileMessages.setInfiniteData(
                    { fileId, limit: INFINITE_QUERY_LIMIT },
                    (old) => {
                        if (!old) return { pages: [], pageParams: [] };
        
                        let isAiResponseCreated = old.pages.some(
                            (page) =>
                                page.messages.some(
                                    (message) => message.id === 'ai-response'
                                )
                        );
        
                        let updatedPages = old.pages.map((page) => {
                            if (page === old.pages[0]) {
                                let updatedMessages;
        
                                if (!isAiResponseCreated) {
                                    updatedMessages = [
                                        {
                                            createdAt: new Date().toISOString(),
                                            id: 'ai-response',
                                            text: result,  // Use the extracted text
                                            isUserMessage: false,
                                        },
                                        ...page.messages,
                                    ];
                                } else {
                                    updatedMessages = page.messages.map(
                                        (message) => {
                                            if (message.id === 'ai-response') {
                                                return {
                                                    ...message,
                                                    text: result,  // Update the message with the extracted text
                                                };
                                            }
                                            return message;
                                        }
                                    );
                                }
        
                                return {
                                    ...page,
                                    messages: updatedMessages,
                                };
                            }
        
                            return page;
                        });
        
                        return { ...old, pages: updatedPages };
                    }
                );
            }
        },
        
        onError: (_, __, context) => {
            setMessage(backupMessage.current)
            utils.getFileMessages.setData(
                {fileId},
                {messages: context?.previousMessages || []}
            )
        },
        onSettled: async () => {
            setIsLoading(false)

            await utils.getFileMessages.invalidate({fileId})
        }
    })
    
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value)
    }

    const addMessage = () => {
        sendMessage({message})
    }


    return (
        <ChatContext.Provider value={{
            addMessage,
            message, 
            handleInputChange, 
            isLoading
        }}>
            {children}
        </ChatContext.Provider>
    )

}