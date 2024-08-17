import { trpc } from "@/app/_trpc/client"
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query"
import { keepPreviousData } from "@tanstack/react-query"
import { Loader2, MessageSquare, MessageSquareIcon } from "lucide-react"
import Skeleton from "react-loading-skeleton"


interface MessageProps{
    fileId: string
}


const Message = ({fileId} : MessageProps) => {

    const {data, isLoading, fetchNextPage} = trpc.getFileMessages.useInfiniteQuery({
        fileId,
        limit: INFINITE_QUERY_LIMIT
    }, {
        getNextPageParam: (lastPage) => lastPage?.nextCursor
    })

    const messages = data?.pages.flatMap((page) => page.messages)

    const loadingMessage = {
        id: 'loadind-message',
        createdAt: new Date().toISOString(),
        text: (
            <span className="flex h-full items-center justify-center">
                <Loader2 className="w-4 h4 text-zinc-600 animate-spin"/>
            </span>
        ),
        isUserMessage: false
    }

    const combinedMessage = [
        ...(true ? [loadingMessage] : []),
        ...(messages ?? [])
    ]


    return (
        <div className="flex max-h-[calc(100vh-3.5rem-7rem)] border-zinc-200 flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto  scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch">
            {combinedMessage && combinedMessage.length > 0 ? (
                combinedMessage.map((mes, i) => {
                    //Check If double text
                    const isNextMessageSamePerson = combinedMessage[i - 1]?.isUserMessage === combinedMessage[i]?.isUserMessage

                    if(i === combinedMessage.length - 1){
                        return <Message/>
                    } else {
                        return <Message/>
                    }
                })
            ) : isLoading ? (
            <div className="w-full flex flex-col gap-2">
                <Skeleton className="h-16"/>
                <Skeleton className="h-16"/>
                <Skeleton className="h-16"/>
                <Skeleton className="h-16"/>
            </div>) : (
                <div className="flex-1 flex flex-col justify-center items-center gap-2">
                    <MessageSquareIcon className="w-8 h-8 text-zinc-800"/>
                    <h3 className="font-semibold text-xl">Your PDF is ready !</h3>
                    <p className="text-sm text-zinc-500">Ask any question to your PDF</p>
                </div>)}
        </div>
    )
}

export default Message