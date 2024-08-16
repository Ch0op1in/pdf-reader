"use client"
import React from "react"
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog"
import { Button } from "./ui/button"
import { Expand, Loader2 } from "lucide-react"
import SimpleBar from "simplebar-react"
import { pdfjs, Document, Page } from 'react-pdf';
import { toast, useToast } from "./ui/use-toast"
import { useResizeDetector } from "react-resize-detector"

interface PdfFullScreenProps{
    fileUrl: string
}

const PdfFullScreen = ({fileUrl}: PdfFullScreenProps) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const {toast} = useToast()

    const [numPage, setNumPage] = React.useState<number>()
    const [curPage, setCurPage] = React.useState<number>(1)
    const [scale, setScale] = React.useState<number>(1)
    const [rotation, setRotation] = React.useState<number>(0)

    const { width, ref } = useResizeDetector()

    return (
        <Dialog 
        open={isOpen} 
        onOpenChange={(v) => {
            if(!v){
                setIsOpen(v)
            }
        }}>
            <DialogTrigger onClick={() => setIsOpen(true)} asChild>
                <Button 
                variant="ghost" 
                className="gap-1.5"
                >
                    <Expand className="h-4 w-4"/>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-7xl w-full">
                <SimpleBar autoHide={false} className="max-h-[calc(100vh-10rem)] mt-6">
                <div ref={ref} >
                <Document 
                loading={
                    <div>
                        <Loader2 className='my-24 h-6 w-6 animate-spin'/>
                    </div>
                } 
                onLoadSuccess={({numPages}) => {
                    setNumPage(numPages)
                }}
                onLoadError={() => {
                    toast({
                        title: "Something went wrong",
                        description: "Please try again, or reaload the page",
                        variant: "destructive"
                    })
                }}
                file={fileUrl}
                >
                    {new Array(numPage).fill(0).map((_, i) => (
                         <Page 
                         key={i}
                         width={width ? width : 1} 
                         pageNumber={i + 1} 
                        />
                    ))}
                </Document>
                {/* <iframe src={url} className='h-full w-full flex-1 flex-col'/> */}
                
                </div>
                </SimpleBar>
            </DialogContent>
        </Dialog>
    )
}

export default PdfFullScreen