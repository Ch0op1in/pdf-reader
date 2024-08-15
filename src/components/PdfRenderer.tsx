"use client"
import {Document, Page, pdfjs} from "react-pdf"
import "react-pdf/dist/cjs/Page/AnnotationLayer.css"
import "react-pdf/dist/cjs/Page/TextLayer.css"
import * as pdfjsLib from 'pdfjs-dist/webpack';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;



interface PdfRendereProps{
    url: string
}

const PdfRenderer = ({url}: PdfRendereProps) => {
    
    return(
        <div className="w-full bg-white rounded-md shadow flex flex-col items-center">
            <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2">
                <div className="flex items-center gap-1.5">
                    Top Bar
                </div>
            </div>

            <div className="flex-1 w-full max-h-screen ">
                <div>
                    <Document file={url} className="max-h-full">
                        <Page pageNumber={1} />
                    </Document>
                </div>
            </div>
        </div>
    )
}

export default PdfRenderer