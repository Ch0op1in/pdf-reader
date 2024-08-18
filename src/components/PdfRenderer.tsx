'use client'
import { ChevronDown, ChevronUp, Ghost, Loader2, RotateCw, SearchIcon } from 'lucide-react';
import React from 'react';
import { pdfjs, Document, Page } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { useToast } from './ui/use-toast';
import { useResizeDetector } from "react-resize-detector"
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useForm } from 'react-hook-form'
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import SimpleBar from 'simplebar-react'
import "simplebar-react/dist/simplebar.min.css"
import PdfFullScreen from './PdfFullScren';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

interface PdfRendereProps{
    url: string
}

const PdfRenderer = ({url}: PdfRendereProps) => {

    const [numPage, setNumPage] = React.useState<number>()
    const [curPage, setCurPage] = React.useState<number>(1)
    const [scale, setScale] = React.useState<number>(1)
    const [rotation, setRotation] = React.useState<number>(0)
    const [renderedScale, setRenderedScale] = React.useState<number | null>(null)

    const isLoading = renderedScale !== scale

    const customPageInput = z.object({
        page: z.string().refine((num) => Number(num) > 0 &&  Number(num) <= numPage!)
    })

    type TcustomPageInput = z.infer<typeof customPageInput>

    const { register, handleSubmit, formState: {errors}, setValue } = useForm<TcustomPageInput>({
        defaultValues: {
            page: "1"
        },
        resolver: zodResolver(customPageInput)
    })

    const { toast } = useToast()
    const { width, ref } = useResizeDetector()

    const handlePageSubmit = ({page,}: TcustomPageInput) => {
        setCurPage(Number(page))
        setValue("page", String(page))
    }

    
    return(
        <div className="w-full bg-white rounded-md shadow flex flex-col items-center">
            <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2">
                <div className="flex items-center gap-1.5">
                    <Button disabled={numPage === undefined || curPage === 1} variant="ghost" aria-label='previous page' onClick={() => {setCurPage((prev) => prev - 1 > 1 ? prev - 1 : 1); setValue("page", String(curPage - 1))}} >
                        <ChevronDown className='h-4 w-4'/>
                    </Button>
                    <div className='flex items-center gap-1.5'>
                        <Input {...register("page")} className={cn('w-12 h-8', errors.page && 'focus-visible:ring-red-500')}
                        onKeyDown={(e) => {
                            if(e.key === "Enter"){
                                handleSubmit(handlePageSubmit)()
                            }
                        }}/>
                        <p className='text-zinc-700 text-sm space-x-1 ml-1'>
                            <span> /</span>
                            <span>{numPage ?? "..."}</span>
                        </p>
                    </div>
                    <Button disabled={numPage === undefined || curPage === numPage} variant="ghost" aria-label='next page'>
                        <ChevronUp className='h-4 w-4' onClick={() => {setCurPage((prev) => prev + 1 >= numPage! ? numPage! : prev + 1); setValue("page", String(curPage + 1))}}/>
                    </Button>
                </div>
                <div className='space-x-2'>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className='gap-1.5' variant='ghost'>
                                <SearchIcon className='h-4 w-4'/>
                                {scale * 100}%
                                <ChevronDown className='h-4 w-4 opacity-50'/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onSelect={() => {setScale(1)}}>
                                100%
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => {setScale(1.25)}}>
                                125%
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => {setScale(1.5)}}>
                                150%
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => {setScale(1.75)}}>
                                175%
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => {setScale(2)}}>
                                200%
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="ghost" onClick={() => {setRotation((prev) => prev + 90)}}>
                        <RotateCw className='h-4 w-4'/>
                    </Button>
                    <PdfFullScreen fileUrl={url}/>
                </div>
            </div>

        <div className="flex-1 w-full max-h-screen">
            <SimpleBar autoHide={false} className='max-h-[calc(100vh-10rem)]'>
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
                file={url}
                >
                   {isLoading && renderedScale ? 
                   
                   <Page 
                    width={width ? width : 1} 
                    pageNumber={curPage} 
                    scale={scale}
                    key={"@" + renderedScale}
                    rotate={rotation}/> 
                    
                    : null}

                    <Page 
                    className={cn(isLoading ? "hidden" : "")}
                    width={width ? width : 1} 
                    pageNumber={curPage} 
                    scale={scale}
                    rotate={rotation}
                    loading={
                        <div className='flex justify-center'>
                            <Loader2 className='my-24 h-6 w-6 animate-spin'/>
                        </div>
                    }
                    onRenderSuccess={() => setRenderedScale(scale)}
                    key={"@" + scale}
                    /> 
                    
                </Document>
                {/* <iframe src={url} className='h-full w-full flex-1 flex-col'/> */}
                
                </div>
            </SimpleBar>
            </div>
        </div>
    )
}

export default PdfRenderer