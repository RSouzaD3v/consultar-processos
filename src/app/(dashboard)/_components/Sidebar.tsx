"use client";
import Image from "next/image";
import Link from "next/link";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { Scale, SearchIcon, Grid, Eye, BarChart2, PenLine } from "lucide-react";

export const menuItems = [
    { 
        name: "Overview",
        icon: Grid, href: "/overview", 
        description: null,
        cpf: false,
        cnpj: false
    },
    {
        name: "Dívidas",
        icon: BarChart2,
        href: "/dividas-processos",
        description: "Dashboard interativo de dívidas fiscais federais e processos judiciais",
        cpf: false,
        cnpj: true,
    },
    { name: "Processos", 
        icon: Scale, 
        href: "/consultation", 
        description: `Aqui você poderá ter detalhes de processos judiciais de uma empresa específica ou pessoa.`,
        cpf: true,
        cnpj: true
    },
    { 
        name: "Consultar Empresas",
        icon: SearchIcon, 
        href: "/business-monitoring", 
        description: `Aqui você poderá consultar sobre uma empresa específica.`,
        cpf: false,
        cnpj: true
    },
    {
        name: "Monitoramento",
        icon: Eye,                         
        href: "/monitoramento-processos", 
        description: "Módulo de monitoramento de processos em tempo real",
        cpf: false,
        cnpj: true,
    },

    {
        name: "Abordagem personalizada",
        icon: PenLine,
        href: "/abordagem-personalizada",          // mesmo nome da pasta
        description: "Módulo para gerar aborgadem personalizada com o cliente.",
        cpf: false,
        cnpj: true,
    },
];

export const Sidebar = () => {

    const pathname = usePathname();

    return (
        <div className="bg-secondColor text-primaryColor md:w-[250px] w-[60px] overflow-hidden flex flex-col justify-between h-screen fixed top-0 left-0 p-3">
            <div>
                <div className="flex items-center gap-2 my-5">
                    <Image src="/logo.svg" alt="Logo" width={35} height={35} />
                    <h3 className="hidden text-xl md:block">Neosimplify</h3>
                </div>

                <hr className="my-10 opacity-15" />

                <div className="flex flex-col gap-3">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        const IconComponent = item.icon;
                        
                        return (
                            <Link
                                key={item.href}
                                title={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 p-2 rounded-md hover:bg-gray-800 ${isActive ? "bg-white/10" : ""}`}
                            >
                                <IconComponent className="text-secondColor" size={28} />
                                <h4 className="md:block hidden text-xl">{item.name}</h4>
                            </Link>
                        );
                    })}
                </div>
            </div>

            <div className="flex gap-2 text-center w-full">
                <SignedIn>
                    <UserButton />
                </SignedIn>
                <h1 className="md:block hidden">Minha conta</h1>
            </div>
        </div>
    );
};
