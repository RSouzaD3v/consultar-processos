"use client";
import Link from "next/link";
import { useUser } from "@clerk/nextjs"; // Importando o hook do Clerk
import { menuItems } from "../_components/Sidebar";
import Image from "next/image";

export default function OverviewPage() { 
    const { user } = useUser();
    const overviewItems = menuItems.filter((item) => item.description !== null);

    return (
        <div className="md:ml-[250px] ml-[50px] p-5">
            <div className="text-center flex items-center justify-center flex-col gap-5">
                <div className="bg-white rounded-full flex items-center justify-center overflow-hidden 
                w-[80px] h-[80px]
                sm:w-[200px] sm:h-[200px] p-5
                shadow-lg shadow-black/20
                ">
                    <Image width={100} height={100} src={"/tribunal.svg"} alt="" />
                </div>

                <div>
                    <h1 className="text-5xl font-bold">Olá, {user?.fullName || "Usuário"}</h1>
                    <p className="text-xl mt-1">
                        explore as informações judiciais de todos os tribunais do Brasil.
                    </p>
                </div>
            </div>

            <div className="grid justify-center w-full mt-5 md:grid-cols-2 grid-rows-2 gap-4 md:gap-10">
                {overviewItems.map((item, index) => (
                    <Link href={item.href} key={index} className="bg-secondColor border p-5 rounded-lg text-primaryColor hover:scale-105 transition-all ease-in-out duration-100">
                        <div className="flex items-center gap-2 mb-2">
                            <item.icon className="text-secondColor" size={40} />
                            <div>
                               <h3 className="text-2xl font-bold">{item.name}</h3>
                            </div>
                        </div>
                        <div className="min-h-[100px]">
                            <p>{item.description}</p>
                        </div>

                        {(item.cpf || item.cnpj) && (
                            <div className="flex items-center justify-end">
                                <div className="flex items-center gap-2">
                                    {item.cpf && (
                                        <div className="bg-supportOrange/20 w-[80px] p-1 rounded-md text-white flex items-center justify-center border-supportOrange">
                                            <h1>
                                                CPF
                                            </h1>
                                        </div>
                                    )}

                                    {item.cnpj && (
                                        <div className="bg-supportOrange/20  w-[80px] p-1 rounded-md text-white flex items-center justify-center border-supportOrange">
                                            <h1>
                                                CNPJ
                                            </h1>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </Link>
                ))}
            </div>
        </div>
    );
};
