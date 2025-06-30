'use client';

import { useEffect, useState } from "react";

export default function ConsultationHistoryById ({ params }: { params: {id: string} }) {
    const [paramsId, setParamsId] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const resolveParam = async () => {
            const { id } = await params;

            setParamsId(id);
            setLoading(false);
        }

        resolveParam();
    }, [params]);

    return (
        <div className="md:ml-[250px] ml-[50px] p-5">
            <div className="w-full flex flex-col mt-10 items-center justify-center">
                <h1>Consultas por ID Histórico.</h1>

                {!loading ? (
                    <h1>{paramsId}</h1>
                ) : (
                    <span>Carregando...</span>
                )}
            </div>
        </div>
    )
}