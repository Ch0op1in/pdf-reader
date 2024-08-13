import { ReactNode } from "react"

const MawWidthWrapper = ({
    className,
    children
}: {
    className?: string
    children: ReactNode
    
}) => {
    <div className="mx-auto w-full max-w-screen-xl px-2.5 md:px-20">
        {children}
    </div>
}

export default MawWidthWrapper  