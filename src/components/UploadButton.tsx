"use client"

import React from "react"
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog"
import { Button } from "./ui/button"

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
                    Content
                </DialogContent>
            </Dialog>
        </div>
    )
}