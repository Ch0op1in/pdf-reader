'use client'
import { Loader2 } from 'lucide-react';
import React from 'react';
import { pdfjs, Document, Page } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { useToast } from './ui/use-toast';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface PdfRendereProps{
    url: string
}

const PdfRenderer = ({url}: PdfRendereProps) => {

    const { toast } = useToast()
    
    return(
        <div className="w-full bg-white rounded-md shadow flex flex-col items-center">
            <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2">
                <div className="flex items-center gap-1.5">
                    Top Bar
                </div>
            </div>

            <div className="flex-1 w-full max-h-screen ">
            <Document 
            loading={
                <div>
                    <Loader2 className='my-24 h-6 w-6 animate-spin'/>
                </div>
            } 
            onLoadError={() => {
                toast({
                    title: "Something went wrong",
                    description: "Please try again, or reaload the page",
                    variant: "destructive"
                })
            }}
            file={url}
            >
                <Page pageNumber={1} />
            </Document>
             {/* <iframe src={url} className='h-full w-full flex-1 flex-col'/> */}
            
            </div>
        </div>
    )
}

export default PdfRenderer