'use client';
import { useEffect, useState } from "react"
import axios from "axios";

interface ConsultationHistoryTypes {
    id: string;
    userId: string;
    queryId: string;
    name: string;
    custom_name: string;
    document: string;
    type_consultation: string;
    queryDate: string;
    createdAt: string;
    updatedAt: string;
}

export default function ConsultationHistory () {
    const [consultations, setConsultations] = useState<ConsultationHistoryTypes[] | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConsultations = async () => {
            try {
                const response = await axios.get("/api/consultation-history/get-all");
                setConsultations(response.data.consultations);
            } catch (e) {
                console.log(e);
            } finally {
                setLoading(false);
            }
        };

        fetchConsultations();
    }, []);

    return (
        <div className="md:ml-[250px] ml-[50px] p-5">
            <div className="w-full flex flex-col mt-10 items-center justify-center">
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-bold">Histórico de consultas</h1>
                    <p className="text-xl">Aqui ficará registrado todas suas consultas de processos.</p>
                </div>

                {loading && <p className="text-lg">Carregando...</p>}

                {!loading && consultations && consultations.length > 0 && (
                    <div className="overflow-x-auto w-full max-w-6xl">
                        <table className="min-w-full border border-gray-300">
                            <thead>
                                <tr className="bg-secondColor text-white">
                                    {/* <th className="px-4 py-2 border">ID</th> */}
                                    <th className="px-4 py-2 border">Nome</th>
                                    <th className="px-4 py-2 border">Nome Personalizado</th>
                                    <th className="px-4 py-2 border">Documento</th>
                                    <th className="px-4 py-2 border">Tipo</th>
                                    <th className="px-4 py-2 border">Data Consulta</th>
                                </tr>
                            </thead>
                            <tbody>
                                {consultations.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="hover:bg-blueColor/20 cursor-pointer"
                                        onClick={() => window.location.href = `/consultation-history/${item.type_consultation.toLowerCase()}/${item.id}`}
                                    >
                                        {/* <td className="px-4 py-2 border">{item.id}</td> */}
                                        <td className="px-4 py-2 border min-w-[400px]">{item.name}</td>
                                        <td className="px-4 py-2 border">{item.custom_name}</td>
                                        <td className="px-4 py-2 border max-w-[200px]">{item.document}</td>
                                        <td className="px-4 py-2 border">{item.type_consultation}</td>
                                        <td className="px-4 py-2 border">{new Date(item.queryDate).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && consultations && consultations.length === 0 && (
                    <p className="text-lg">Nenhuma consulta encontrada.</p>
                )}

                {!loading && !consultations && (
                    <p className="text-lg text-red-500">Erro ao carregar consultas.</p>
                )}
            </div>
        </div>
    )
}
