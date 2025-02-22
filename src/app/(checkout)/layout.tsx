import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

export default function Layout({children}: {children: ReactNode}) {
    return (
        <section className="flex flex-col items-center">
            <Link href={""}>
                <Image width={80} height={80} src={"/logo.svg"} alt="" />
            </Link>
            {children}
        </section>
    )
}