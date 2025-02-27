"use client";
import Link from "next/link";
import { useUser } from "@clerk/nextjs"; // Importando o hook do Clerk
import { menuItems } from "../_components/Sidebar";
import Image from "next/image";

export default function OverviewPage() { 
    const { user } = useUser(); // Obtendo os dados do usuário logado
    const overviewItems = menuItems.filter((item) => item.description !== null);

    return (
        <div className="md:ml-[200px] ml-[50px] p-5">
            <div className="text-center flex items-center justify-center flex-col gap-5">
                <div className="bg-white rounded-full flex items-center justify-center overflow-hidden 
                w-[80px] h-[80px]
                sm:w-[200px] sm:h-[200px] p-5
                shadow-lg shadow-black/20
                ">
                    <Image width={100} height={100} src={"/tribunal.png"} alt="" />
                </div>

                <div>
                    <h1 className="text-3xl font-bold">Olá, {user?.fullName || "Usuário"}</h1>
                    <p className="text-lg my-3">
                        explore as informações judiciais de todos os tribunais do Brasil.
                    </p>
                </div>
            </div>

            <div className="grid justify-center w-full mt-5 md:grid-cols-2 grid-rows-2 gap-4 md:gap-10">
                {overviewItems.map((item, index) => (
                    <Link href={item.href} key={index} className="bg-gray-800 border-blue-700 border p-5 rounded-md 
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
