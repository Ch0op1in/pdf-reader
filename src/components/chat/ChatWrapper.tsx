"use client"
import ChatInput from "./ChatInput"
import { trpc } from "@/app/_trpc/client"
import { BotIcon, ChevronLeft, Ghost, Loader2 } from "lucide-react"
import React from "react"
import Link from "next/link"
import { buttonVariants } from "../ui/button"
import { ChatContextProvider } from "./ChatContext"
import Messages from "./Messages"

interface ChatWrapperProps{
    fileId: string
}


const ChatWrapper = ({ fileId } : ChatWrapperProps) => {

    const { data, isLoading, refetch } = trpc.getFileUploadStatus.useQuery({ fileId });
    const [refetchInterval, setRefetchInterval] = React.useState<number | false>(500);

    // Utilisation de useEffect pour gérer l'intervalle de rafraîchissement
    React.useEffect(() => {
        if (data?.status === "SUCCESS" || data?.status === "FAILED") {
            setRefetchInterval(false); // Arrête le rafraîchissement
        } else {
            setRefetchInterval(500); // Continue à rafraîchir toutes les 500 ms
        }
    }, [data?.status]);

    // Exécution manuelle de refetch basée sur l'intervalle
    React.useEffect(() => {
        if (typeof refetchInterval === 'number') {
            const intervalId = setInterval(() => {
                refetch();
            }, refetchInterval);
            return () => clearInterval(intervalId);
        }
    }, [refetchInterval, refetch]);
        
    if(isLoading){
        return(
            <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
                <div className="flex-1 flex justify-center items-center flex-col mb-28">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin"/>
                        <h3 className="font-semibold text-xl">Loading...</h3>
                        <p className="text-zinc-500 text-sm">We&apos;re preparing your PDF.</p>
                    </div>
                </div>
                <ChatInput isDisabled />
            </div>
        )
    }

    if(data?.status === "PROCESSING"){
        return(
            <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
                <div className="flex-1 flex justify-center items-center flex-col mb-28">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin"/>
                        <h3 className="font-semibold text-xl">Processing PDF...</h3>
                        <p className="text-zinc-500 text-sm">AI is reading your pdf. (Takes few seconds)</p>
                    </div>
                </div>
                <ChatInput isDisabled />
            </div>
        )
    }


    if(data?.status === "FAILED"){
        return(
            <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
                <div className="flex-1 flex justify-center items-center flex-col mb-28">
                    <div className="flex flex-col items-center gap-2">
                        <BotIcon className="h-8 w-8 text-red-500"/>
                        <h3 className="font-semibold text-xl">PDF too big.</h3>
                        <p className="text-zinc-500 text-sm">Upgrade to our Pro plan.</p>
                        <Link href="/dashboard" className={buttonVariants({variant: "secondary", className: "mt-4"})}>
                        <ChevronLeft className="h-4 w-4 mr-1.5"/>
                        Back
                        </Link>
                    </div>
                </div>
                <ChatInput isDisabled />
            </div>
        )
    }

    return (
        <ChatContextProvider fileId={fileId}>
        <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
            <div className="flex-1 justify-between flex flex-col mb-28">
                <Messages fileId={fileId}/>
            </div>
            <ChatInput />
        </div>
        </ChatContextProvider>
    )
}

export default ChatWrapper