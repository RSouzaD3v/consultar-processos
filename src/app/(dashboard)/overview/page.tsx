import Link from "next/link";
import { Home, User2, CreditCard, History, SearchSlash } from "lucide-react";

export default function OverviewPage() { 
    const menuItems = [
        { name: "Overview", icon: Home, href: "/overview", description: null },
        { name: "Consultar", icon: User2, href: "/", description: "Aqui você poderá consultar processos de pessoas físicas e juridicas" },
        { name: "Assinaturas", icon: CreditCard, href: "/", description: "Verificar sua assinatura" },
        { name: "His. de consultas", icon: History, href: "/", description: "Verificar consultas que já foram feitas." },
        { name: "Lista de consultas", icon: SearchSlash, href: "/", description: "Verificar consultas que já foram feitas." },
    ];
    const overviewItems = menuItems.filter((item) => item.description !== null);
    
    return (
        <div className="md:ml-[200px] ml-[50px] p-5">
            <h1 className="text-3xl my-5 font-bold">Overview</h1>
            <div className="grid md:grid-cols-4 grid-rows-2 gap-5">
                {overviewItems.map((item, index) => (
                    <Link href={item.href} key={index} className="bg-gray-800 p-5 rounded-md 
                    transition ease-in-out duration-200 hover:bg-gray-700 hover:scale-105">
                        <div className="flex items-center gap-2 mb-2">
                            <item.icon size={25} />
                            <h3 className="text-xl font-bold">{item.name}</h3>
                        </div>
                        <p>{item.description}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
};