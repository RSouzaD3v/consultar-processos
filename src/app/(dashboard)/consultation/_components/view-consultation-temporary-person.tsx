"use client";
import { useState } from "react";
import { jsPDF } from "jspdf";
import { LawsuitsTypes } from "../../view-consultation/[id]/_components/ViewBussiness";

interface ProcessesTypes {
    Last30DaysLawsuits: number
    Last90DaysLawsuits: number;
    Last180DaysLawsuits: number;
    Last365DaysLawsuits: number;
    Lawsuits: [LawsuitsTypes];
    NextPageId: string;
    TotalLawsuits: number;
    TotalLawsuitsAsAuthor: number;
    TotalLawsuitsAsDefendant: number;
    TotalLawsuitsAsOther: number;
}

export interface DataJsonTypesPerson {
    MatchKeys: string;
    Processes: ProcessesTypes;
}

export const ViewConsultationTemporaryPerson = ({ data }: { data: DataJsonTypesPerson | null }) => {
    const [dataReceive, setDataReceive] = useState(data);
    const [loading, setLoading] = useState<boolean>(false);

    const nextPageClick = async () => {
        if (dataReceive && dataReceive.Processes.NextPageId) {
            setLoading(true);
            try {
                const response = await fetch("/api/consultation/next-page", {
                    method: "POST",
                    body: JSON.stringify({
                        nextPageId: dataReceive.Processes.NextPageId,
                        doc: dataReceive.MatchKeys
                    })
                });

                const dataJson = await response.json();
                setDataReceive(dataJson.nextPage.Result[0]);
            } catch (e) {
                console.log(e);
            } finally {
                setLoading(false);
            }
        } else {
            console.log("Não contém outras páginas");
        }
    };

    // Função para gerar e baixar o PDF
    const handleDownloadPDF = () => {
        if (!dataReceive) return;

        const doc = new jsPDF();
        doc.setFont("helvetica", "bold");
        doc.text("Relatório de Consultas", 10, 10);
        doc.setFont("helvetica", "normal");
        if(data) {
            doc.text(`Total Processos: ${data.Processes.TotalLawsuits}`, 10, 20);
            doc.text(`Processos como Autor: ${data.Processes.TotalLawsuitsAsAuthor}`, 10, 30);
            doc.text(`Processos como Defensor: ${data.Processes.TotalLawsuitsAsDefendant}`, 10, 40);
            doc.text(`Últimos 180 dias: ${data.Processes.Last180DaysLawsuits}`, 10, 50);
            doc.text(`Últimos 30 dias: ${data.Processes.Last30DaysLawsuits}`, 10, 60);
            doc.text(`Últimos 365 dias: ${data.Processes.Last365DaysLawsuits}`, 10, 70);
            doc.text(`Últimos 90 dias: ${data.Processes.Last90DaysLawsuits}`, 10, 80);
        }

        doc.text("Os 10 processos da página:", 10, 100);
        if(dataReceive.Processes.Lawsuits.length > 0 ){
            dataReceive.Processes.Lawsuits.forEach((val, i) => {
                const y = 110 + i * 10;
                if (y > 270) {
                    doc.addPage();
                }
                doc.text(`${i + 1}. ${val.Number} - ${val.MainSubject} (${val.Status})`, 10, y);
            });
        } else {
            doc.text("Não contém lista.", 10, 110 + 1 * 10)
        }
        doc.save("relatorio-consulta.pdf");
    };

    return (
        <section>
            <hr className="my-5"/>
            {dataReceive && (
                <div>
                    {data && (
                        <div className="grid md:grid-cols-4 md:grid-rows-2 gap-5">
                            <div className="bg-blue-950/50 text-white p-2 rounded-md">
                                <h1>Total Processos:</h1>
                                <h1>{data.Processes.TotalLawsuits}</h1>
                            </div>
                            <div className="bg-blue-950/50 text-white p-2 rounded-md">
                                <h1>Processos como Autor:</h1>
                                <h1>{data.Processes.TotalLawsuitsAsAuthor}</h1>
                            </div>
                            <div className="bg-blue-950/50 text-white p-2 rounded-md">
                                <h1>Processos como Defensor:</h1>
                                <h1>{data.Processes.TotalLawsuitsAsDefendant}</h1>
                            </div>
                            <div className="bg-blue-950/50 text-white p-2 rounded-md">
                                <h1>Últimos 180 dias:</h1>
                                <h1>{data.Processes.Last180DaysLawsuits}</h1>
                            </div>
                            <div className="bg-blue-950/50 text-white p-2 rounded-md">
                                <h1>Últimos 30 dias:</h1>
                                <h1>{data.Processes.Last30DaysLawsuits}</h1>
                            </div>
                            <div className="bg-blue-950/50 text-white p-2 rounded-md">
                                <h1>Últimos 365 dias:</h1>
                                <h1>{data.Processes.Last365DaysLawsuits}</h1>
                            </div>
                            <div className="bg-blue-950/50 text-white p-2 rounded-md">
                                <h1>Últimos 90 dias:</h1>
                                <h1>{data.Processes.Last90DaysLawsuits}</h1>
                            </div>
                        </div>
                    )}

                    <div>
                        {dataReceive.Processes.Lawsuits.map((val, i) => (
                            <div key={i} className="flex sm:items-center sm:flex-row flex-col items-start sm:justify-between p-3 my-3 bg-blue-950/50">
                                <div>
                                    <h1 className="font-bold">{val.LastUpdate}</h1>
                                    <h4 className="text-white/50">Última Atualização</h4>
                                </div>

                                <div className="sm:w-[400px] my-2">
                                    <h1>{val.MainSubject}</h1>
                                    <h4>{val.Number}</h4>
                                </div>

                                <div>
                                    <h1>{val.Status}</h1>
                                    <h4>Status</h4>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-2 mt-4">
                       

                        {data?.Processes?.NextPageId && (
                            <button
                                disabled={loading}
                                onClick={nextPageClick}
                                className="bg-blue-500 disabled:bg-gray-600 p-2 rounded-md text-white"
                            >
                                {loading ? <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div> : "Próxima Página"}
                            </button>
                        )}
                        <button
                            onClick={handleDownloadPDF}
                            className="bg-green-500 p-2 rounded-md text-white"
                        >
                            Baixar PDF
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
};
