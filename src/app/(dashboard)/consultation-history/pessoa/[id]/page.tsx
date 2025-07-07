'use client';

import { ProcessesTypes } from "@/types/ConsultationPersonTypes";
import axios from "axios";
import { useEffect, useState } from "react";
import { ViewConsultationPerson } from "@/app/(dashboard)/consultation/_components/view-consultation-person";

interface ResultApiTypes {
    Result: string
}

interface ConsultationByQuery {
    QueryDate: string;
    QueryId: string;
    Result: ResultApiTypes[]
}

interface ApiResponseConsultationTypes {
    data: {
        consultationByQuery: ConsultationByQuery
    }
}

interface JsonConsultationTypes {
    Processes: ProcessesTypes;
    MatchKeys: string;
}

export default function ConsultationHistoryById ({ params }: { params: Promise<{id: string}>}) {
    const [loading, setLoading] = useState<boolean>(true);
    const [data, setData] = useState<JsonConsultationTypes[] | null>(null);

    useEffect(() => {
        const fetchConsultation = async () => {
            setLoading(false);
            const { id } = await params;
            try {
                const response: ApiResponseConsultationTypes = await axios.get(`/api/consultation-history/${id}`);

                console.log(JSON.parse(response.data.consultationByQuery.Result[0].Result));
                setData(JSON.parse(response.data.consultationByQuery.Result[0].Result));
                setLoading(false);
            } catch (e) {
                console.log(e);
                setLoading(false);
            } finally {
                setLoading(false);
            }
        }

        fetchConsultation();
    }, [params]);

    if(loading) {
        return (
            <div className="md:ml-[250px] ml-[50px] p-5">
                <div className="flex flex-col items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
                    <span className="mt-4 text-blue-700 text-lg font-semibold">Carregando dados...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="md:ml-[250px] ml-[50px] p-5">
                <div className="flex flex-col gap-3 mt-8">
                  <section>
                    {data && (
                      <div>
                        {/* GRID DE CARDS COM MÉTRICAS */}
                        <div className="grid md:grid-cols-4 md:grid-rows-2 gap-5">
                          <div className="bg-secondColor text-white p-2 rounded-md">
                            <h1>Total Processos:</h1>
                            <h1 className="text-3xl font-bold">
                              {data[0]?.Processes?.TotalLawsuits ?? "Não informado"}
                            </h1>
                          </div>
                          <div className="bg-secondColor text-white p-2 rounded-md">
                            <h1>Processos como Autor:</h1>
                            <h1 className="text-3xl font-bold">
                              {data[0]?.Processes?.TotalLawsuitsAsAuthor ?? "Não informado"}
                            </h1>
                          </div>
                          <div className="bg-secondColor text-white p-2 rounded-md">
                            <h1>Processos como Defensor:</h1>
                            <h1 className="text-3xl font-bold">
                              {data[0]?.Processes?.TotalLawsuitsAsDefendant ?? "Não informado"}
                            </h1>
                          </div>
                          <div className="bg-secondColor text-white p-2 rounded-md">
                            <h1>Últimos 180 dias:</h1>
                            <h1 className="text-3xl font-bold">
                              {data[0]?.Processes?.Last180DaysLawsuits ?? "Não informado"}
                            </h1>
                          </div>
                          <div className="bg-secondColor text-white p-2 rounded-md">
                            <h1>Últimos 30 dias:</h1>
                            <h1 className="text-3xl font-bold">
                              {data[0]?.Processes?.Last30DaysLawsuits ?? "Não informado"}
                            </h1>
                          </div>
                          <div className="bg-secondColor text-white p-2 rounded-md">
                            <h1>Últimos 365 dias:</h1>
                            <h1 className="text-3xl font-bold">
                              {data[0]?.Processes?.Last365DaysLawsuits ?? "Não informado"}
                            </h1>
                          </div>
                          <div className="bg-secondColor text-white p-2 rounded-md">
                            <h1>Últimos 90 dias:</h1>
                            <h1 className="text-3xl font-bold">
                              {data[0]?.Processes?.Last90DaysLawsuits ?? "Não informado"}
                            </h1>
                          </div>
                        </div>
                    
                        <ViewConsultationPerson data={data[0]} />
                      </div>
                    )}
                  </section>

                </div>
        </div>
    )
}