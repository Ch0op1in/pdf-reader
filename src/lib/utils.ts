import clsx from "clsx";

export function cn(...inputs: ClassValue[]){
    return twMerge(clsx(inputs))
}