import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface ContainerProps {
    children: ReactNode;
    className?: string;
}

export function Container ({children, className}: ContainerProps) {
    const defaultClass = "w-full max-w-container px-auto";
    const combinedClass = twMerge(defaultClass, className);

    return (
        <div className={combinedClass}>
            {children}
        </div>
    )
}