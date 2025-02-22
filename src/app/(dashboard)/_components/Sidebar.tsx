"use client";
import Image from "next/image";

import Link from "next/link";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { menuItems } from "./menuItems";
import { usePathname } from "next/navigation";


export const Sidebar = () => {
    const pathname = usePathname();
    const parts = pathname.split('/').filter(Boolean); // Divide a URL e remove strings vazias
    const slug = parts.pop();

  return (
    <div className="bg-black md:w-[200px] w-[60px] overflow-hidden flex flex-col justify-between h-screen fixed top-0 left-0 p-3">
        <div>
            <div className="flex items-center gap-2">
                <Image src="/logo.svg" alt="Logo" width={30} height={30} />
                <h3 className="hidden md:block">Consulte</h3>
            </div>

            <hr className="my-2 opacity-15"/>

            <div>
                {menuItems.map((item, index) => (
                    <Link title={item.name} key={index} href={item.href} className={`flex items-center gap-2 
                    p-2 rounded-md hover:bg-gray-800 ${"/" + slug === item.href ? "bg-gray-800" : ""}`}>
                        <item.icon size={20} />
                        <h4 className="md:block hidden">{item.name}</h4>
                    </Link>
                ))}
            </div>
        </div>

        <div className="flex gap-2 justify-center text-center 
        w-full">
            <SignedIn>
                <UserButton />
            </SignedIn>
            <h1 className="md:block hidden">Minha conta</h1>
        </div>
    </div>
  );
};