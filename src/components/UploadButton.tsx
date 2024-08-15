"use client"

import React from "react"
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog"
import { Button } from "./ui/button"
import Dropzone from "react-dropzone"
import { File, FileInput } from "lucide-react"
import { Progress } from "./ui/progress"
import { useUploadThing } from "@/lib/uploadthing"

const UploadZone = () => {

    const [loading, setLoading] = React.useState<boolean>(true)
    const [uploadProgress, setUploadProgress] = React.useState<number>(0)
    
    const { startUpload } = useUploadThing("pdfUploader")
    
    const startSimulatedProgress = () => {
        setUploadProgress(0)

        const interval = setInterval(() => {
            setUploadProgress((prev) => {
                if(prev >= 95) {
                    return prev
                } else {
                    return prev + 5
                }
            })
        }, 500)

        return interval
    }

    return (
        
        <Dropzone multiple={false} onDrop={async (acceptedFile) => {
            setLoading(true)
            const simulateProgress = startSimulatedProgress()

            const res = await startUpload(acceptedFile)

            clearInterval(simulateProgress)
            setUploadProgress(100)
        }}>
            {({getRootProps, getInputProps, acceptedFiles}) =>(
                <div {...getRootProps()} className="border h-64 m-4 rounded-md border-dashed border-gray-300"> 
                    <div className="flex items-center justify-center h-full w-full">
                        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-full cursor-pointer rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                            <div className="flex flex-col justify-center items-center pt-4 pb-5">
                                <FileInput className="h-8 w-8 text-zinc-500 mb-2"/>
                                <p className="mb-1 text-sm text-gray-700">
                                    Upload your PDF. <span className="text-zinc-500">(up to 4MB)</span>
                                </p>
                                <p className="mb-2 text-sm text-gray-500">
                                    Click here or drag and drop
                                </p>
                            </div>

                            {acceptedFiles && acceptedFiles[0] ?(
                                <div className="max-w-xs bg-white flex items-center rounded-md overflow-hidden outline outline-[1px] outline-zinc-200 divide-x divide-zinc-200">
                                    <div className="px-3 py-2 h-full grid place-items-center">
                                        <File className="h-4 w-4 text-blue-500"/>
                                    </div>
                                    <div className="px-3 py-2 h-full text-sm truncate ">
                                        {acceptedFiles[0].name}
                                    </div>
                                </div>
                            ) : null}

                            {loading ? (
                                <div className="w-full mt-4 max-w-xs mx-auto">
                                    <Progress value={uploadProgress} className="h-1 w-full bg-zinc-200"/>
                                </div>
                            ) : null}
                        </label>
                    </div>
                </div>
            )}
        </Dropzone>
       
    )
}

export const UploadButton = () => {
    const [isOpen, setIsOpen] = React.useState<boolean>(false)

    return (
        <div>
            <Dialog open={isOpen} onOpenChange={(v: boolean) => {if(!v){setIsOpen((v))}}}>
                <DialogTrigger asChild onClick={() => setIsOpen(true)}>
                    <Button>
                        Upload PDF
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <UploadZone/>
                </DialogContent>
            </Dialog>
        </div>
    )
}