'use client'
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import React from 'react';
import { pdfjs, Document, Page } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { useToast } from './ui/use-toast';
import { useResizeDetector } from "react-resize-detector"
import { Button } from './ui/button';
import { Input } from './ui/input';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface PdfRendereProps{
    url: string
}

const PdfRenderer = ({url}: PdfRendereProps) => {

    const { toast } = useToast()
    const { width, ref } = useResizeDetector()
    const [numPage, setNumPage] = React.useState<number>()
    const [curPage, setCurPage] = React.useState<number>(1)
    
    return(
        <div className="w-full bg-white rounded-md shadow flex flex-col items-center">
            <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2">
                <div className="flex items-center gap-1.5">
                    <Button disabled={numPage === undefined || curPage === 1} variant="ghost" aria-label='previous page' onClick={() => setCurPage((prev) => prev - 1 > 1 ? prev - 1 : 1)} >
                        <ChevronDown className='h-4 w-4'/>
                    </Button>
                    <div className='flex items-center gap-1.5'>
                        <Input className='w-12 h-8' value={curPage}/>
                        <p className='text-zinc-700 text-sm space-x-1 ml-1'>
                            <span> /</span>
                            <span>{numPage ?? "..."}</span>
                        </p>
                    </div>
                    <Button disabled={numPage === undefined || curPage === numPage} variant="ghost" aria-label='next page'>
                        <ChevronUp className='h-4 w-4' onClick={() => setCurPage((prev) => prev + 1 >= numPage! ? numPage! : prev + 1)}/>
                    </Button>
                </div>
            </div>

            <div ref={ref} className="flex-1 w-full max-h-screen">
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
            file={url}
            >
                <Page width={width ? width : 1} pageNumber={curPage} />
            </Document>
             {/* <iframe src={url} className='h-full w-full flex-1 flex-col'/> */}
            
            </div>
        </div>
    )
}

export default PdfRenderer