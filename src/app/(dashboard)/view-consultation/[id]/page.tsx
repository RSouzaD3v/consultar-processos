"use client";

import { useEffect, useState } from "react";
import { ViewPeople } from "./_components/ViewPeople";
import { ViewBussiness } from "./_components/ViewBussiness";

interface ResultTypes {
    API: "people" | "companies";
    Datasets: string;
    Domain: string;
    Parameters: string;
    QueryDate: string;
    QueryId: string;
    QueryOrigin: string;
    Result: string;
    TotalEllapsedTime: string;
    UserIp: string;
    UserName: string;
}


interface DataTypes {
    consultationByQuery: {
        QueryDate: string;
        QueryId: string;
        Result: ResultTypes[];
        Status: {
            Code: number; 
            Message: string;
        }
    }
}

export default function DetailsConsultation({ params }: {params: Promise<{ id: string }>}) {
    const [consultation, setConsultation] = useState<DataTypes | null>(null);
    const [loading, setLoding] = useState<boolean>(true);
    const [paramsId, setParamsId] = useState<string>("");

    useEffect(() => {
        const resolveParams = async () => {
            const { id } = await params;
            setParamsId(id);
        }

        resolveParams();
    }, [params]);

    useEffect(() => {
        console.log(paramsId);
        if(paramsId) {
            const fetchConsultation = async () => {
                setLoding(true)
                try {
                    const response = await fetch(`/api/view-consultation/${paramsId}`);
                    const data = await response.json();
                    setConsultation(data);

                    console.log("Data: ", data);
                    // console.log(data.consultationByQuery.Result[0].API);
                    // // console.log(data.consultationByQuery.Result[0].Result);
                    // console.log(JSON.parse(data.consultationByQuery.Result[0].Result));
                    setLoding(false)
                    
                } catch (e) {
                    console.log(e);
                    setLoding(false);
                } finally {
                    setLoding(false);
                }
            };
    
            fetchConsultation();
        }
    }, [paramsId]);


    return (
        <div className="ml-[50px] md:ml-[200px]">
            {loading ? (
                    <div className="flex items-center mt-20 justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                        <p className="ml-2">Carregando...</p>
                    </div>
            ) : (
                <div>
                    {consultation != null && (
                        <div>
                            {(consultation.consultationByQuery?.Result.length > 0 && !loading) && (
                            <div>
                                {consultation.consultationByQuery.Result[0] && consultation.consultationByQuery.Result[0].API === "people" && (
                                    <ViewPeople dataJson={JSON.parse(consultation.consultationByQuery.Result[0].Result)} />
                                )}
                
                                {consultation.consultationByQuery.Result[0]?.API === "companies" && (
                                    <ViewBussiness dataJson={JSON.parse(consultation.consultationByQuery.Result[0].Result)}/>
                                )}
                            </div>
                            )}

                        </div>
                    )}
                </div>
            )}

        </div>
    );
}