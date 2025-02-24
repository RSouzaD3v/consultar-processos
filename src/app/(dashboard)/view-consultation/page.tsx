"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Folder } from "lucide-react";

interface Consultation {
    id: string;
    queryDate: string;
    queryId: string;
    custom_name: string;
    name: string;
    document: string;
    userId: string;
    createdAt: string;
    type_consultation: string;
}

export default function ViewConsultation() {
    const [consultations, setConsultations] = useState<Consultation[]>([]);
    const [search, setSearch] = useState("");
    const [order, setOrder] = useState("asc");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Função para buscar os dados da API
    const fetchConsultations = async () => {
        setLoading(true);
        setError("");

        try {
            const params = new URLSearchParams();
            if (search) params.append("search", search);
            if (order) params.append("order", order);

            const res = await fetch(`/api/view-consultation?${params.toString()}`);

            if (!res.ok) {
                throw new Error("Erro ao buscar consultas");
            }

            const data = await res.json();
            setConsultations(data);
        } catch (e) {
            console.log(e);
            setError("erro");
        } finally {
            setLoading(false);
        }
    };

    // Chamar a API ao carregar e ao alterar filtros
    useEffect(() => {
        fetchConsultations();
    }, [search, order]);

    // Filtrar consultas por empresas e por pessoas
    const companyConsultations = consultations.filter(c => c.type_consultation === "Empresa");
    const personConsultations = consultations.filter(c => c.type_consultation === "Pessoa");

    return (
        <div className="ml-[50px] md:ml-[200px]">
            <div className="w-full md:p-10 p-3 flex items-center justify-center md:gap-10 gap-4 flex-wrap">
                <div className="w-full md:w-[350px] p-5 bg-blue-950/50 text-white rounded-md">
                    <h5 className="text-gray-600">Consultas Realizadas</h5>
                    <h1 className="text-4xl font-bold">{consultations.length}</h1>
                </div>
                <div className="w-full md:w-[350px] p-5 bg-blue-950/50 text-white rounded-md">
                    <h5 className="text-gray-600">Consultas por Empresa</h5>
                    <h1 className="text-4xl font-bold">{companyConsultations.length}</h1>
                </div>
                <div className="w-full md:w-[350px] p-5 bg-blue-950/50 text-white rounded-md">
                    <h5 className="text-gray-600">Consultas por Pessoa</h5>
                    <h1 className="text-4xl font-bold">{personConsultations.length}</h1>
                </div>
            </div>

            <div className="my-20 mx-auto p-6 bg-blue-950/50 text-white rounded-lg shadow-md">
                <h1 className="text-xl font-bold mb-4">Total de consultas: {loading ? <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white inline-block"></div> : consultations.length}</h1>

                {/* Barra de pesquisa */}
                <input
                    type="text"
                    placeholder="Pesquisar consulta..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full p-2 border rounded-md mb-4"
                />

                {/* Botão de alternância de ordem */}
                <button
                    onClick={() => setOrder(order === "asc" ? "desc" : "asc")}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md mb-4"
                >
                    {order === "asc" ? "Mais Antigas" : "Mais recentes"}
                </button>

                {/* Mensagem de carregamento ou erro */}
                {loading && (
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                        <p className="ml-2">Carregando...</p>
                    </div>
                )}
                {error && <p className="text-red-500">{error}</p>}

                {/* Lista de consultas */}
                <ul className="">
                    {consultations.length > 0 ? (
                        consultations.map((consultation) => (
                            <Link href={`view-consultation/${consultation.id}`} key={consultation.id} >
                                <li className="bg-white/5 hover:bg-white/10 mt-2 shadow-md p-2 rounded-md flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-semibold">{consultation.custom_name}</h2>
                                        <p className="text-gray-500">Criado em: {new Date(consultation.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="md:w-[400px] max-w-[400px]">
                                        <h2 className="font-bold">{consultation.name}</h2>
                                        <p className="text-white/20">{consultation.document}</p>
                                    </div>
                                    <div>
                                        <div className="bg-blue-500/10 text-white p-2 rounded-md">
                                            <Folder />
                                        </div>
                                    </div>
                                </li>
                            </Link>
                        ))
                    ) : (
                        <p className="text-gray-500">{loading ? "" : "Não contém nenhuma consulta"}</p>
                    )}
                </ul>
            </div>
        </div>
    );
}