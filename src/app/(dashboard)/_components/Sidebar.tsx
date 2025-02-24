"use client";
import Image from "next/image";
import Link from "next/link";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { Home, SearchIcon, BriefcaseBusiness } from "lucide-react";

export const menuItems = [
    { name: "Overview", icon: Home, href: "/overview", description: null },
    { name: "Consultar", icon: SearchIcon, href: "/consultation", description: "Aqui você poderá consultar processos de pessoas físicas e jurídicas" },
    { name: "Ver Consultas", icon: BriefcaseBusiness, href: "/view-consultation", description: "Aqui você poderá consultar processos de pessoas físicas e jurídicas" },
];

export const Sidebar = () => {

    const pathname = usePathname();

    return (
        <div className="bg-black md:w-[200px] w-[60px] overflow-hidden flex flex-col justify-between h-screen fixed top-0 left-0 p-3">
            <div>
                <div className="flex items-center gap-2">
                    <Image src="/logo.svg" alt="Logo" width={30} height={30} />
                    <h3 className="hidden md:block">Consulte</h3>
                </div>

                <hr className="my-2 opacity-15" />

                <div>
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        const IconComponent = item.icon;
                        
                        return (
                            <Link
                                key={item.href}
                                title={item.name}
                                href={item.href}
                                className={`flex items-center gap-2 p-2 rounded-md hover:bg-gray-800 ${isActive ? "bg-gray-800" : ""}`}
                            >
                                <IconComponent size={20} />
                                <h4 className="md:block hidden">{item.name}</h4>
                            </Link>
                        );
                    })}
                </div>
            </div>

            <div className="flex gap-2 justify-center text-center w-full">
                <SignedIn>
                    <UserButton />
                </SignedIn>
                <h1 className="md:block hidden">Minha conta</h1>
            </div>
        </div>
    );
};
