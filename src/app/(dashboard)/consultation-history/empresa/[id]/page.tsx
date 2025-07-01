'use client';

import { ProcessesTypes } from "@/types/ConsultationCompanyTypes";
import axios from "axios";
import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

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
    Lawsuits: ProcessesTypes;
    MatchKeys: string;
}

export default function ConsultationHistoryById ({ params }: { params: Promise<{id: string}>}) {
    const [loading, setLoading] = useState<boolean>(true);
    const [loadingNext, setLoadingNext] = useState<boolean>(false);
    const [data, setData] = useState<JsonConsultationTypes[] | null>(null);

    useEffect(() => {
        const fetchConsultation = async () => {
            setLoading(true);
            const { id } = await params;
            try {
                const response: ApiResponseConsultationTypes = await axios.get(`/api/consultation-history/${id}`);

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

      const nextPageClick = async () => {
        if (data) {
          setLoadingNext(true);
          try {
            const response = await fetch("/api/consultation/next-page", {
              method: "POST",
              body: JSON.stringify({
                nextPageId: data[0].Lawsuits.NextPageId,
                doc: data[0].MatchKeys
              })
            });
    
            const dataJson = await response.json();
            setData(dataJson.nextPage.Result[0]);
          } catch (e) {
            console.log(e);
          } finally {
            setLoadingNext(false);
          }
        }
      };
    
      const handleDownloadPDF = () => {
        if (!data) return;
    
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const marginLeft = 10;
        const maxWidth = pageWidth - 20;
        let y = 10;
        const safetyMargin = 30;
    
        const checkPageBreak = (requiredSpace: number) => {
          if (y + requiredSpace > pageHeight - safetyMargin) {
            doc.addPage();
            y = 10;
          }
        };
    
        doc.setFont("helvetica", "bold");
        doc.text("Relatório de Consultas", marginLeft, y);
        y += 10;
        doc.setFont("helvetica", "normal");
    
        if (data) {
          const infoTexts = [
            `Total Processos: ${data[0].Lawsuits.TotalLawsuits}`,
            `Processos como Autor: ${data[0].Lawsuits.TotalLawsuitsAsAuthor}`,
            `Processos como Defensor: ${data[0].Lawsuits.TotalLawsuitsAsDefendant}`,
            `Últimos 180 dias: ${data[0].Lawsuits.Last180DaysLawsuits}`,
            `Últimos 30 dias: ${data[0].Lawsuits.Last30DaysLawsuits}`,
            `Últimos 365 dias: ${data[0].Lawsuits.Last365DaysLawsuits}`,
            `Últimos 90 dias: ${data[0].Lawsuits.Last90DaysLawsuits}`
          ];
    
          infoTexts.forEach(text => {
            checkPageBreak(10);
            doc.text(text, marginLeft, y);
            y += 10;
          });
        }
    
        checkPageBreak(10);
        doc.text("Os processos da página:", marginLeft, y);
        y += 10;
    
        data[0].Lawsuits.Lawsuits.forEach((val, i) => {
          checkPageBreak(50);
          doc.setFont("helvetica", "bold");
          doc.text(`${i + 1}. ${val.Number}`, marginLeft, y);
          y += 8;
          doc.setFont("helvetica", "normal");
    
          const processData = [
            { label: "Assunto", value: val.MainSubject },
            { label: "Status", value: `(${val.Status})` },
            { label: "Nome do Tribunal", value: val.CourtName },
            { label: "Tipo de Tribunal", value: val.CourtType },
            { label: "Nível do Tribunal", value: val.CourtLevel },
            { label: "Corpo Julgador", value: val.JudgingBody },
            { label: "Estado", value: val.State }
          ];
    
          processData.forEach(({ label, value }) => {
            const lines = doc.splitTextToSize(`${label}: ${value}`, maxWidth);
            checkPageBreak(lines.length * 6);
            doc.text(lines, marginLeft + 10, y);
            y += lines.length * 6;
          });
    
          y += 5;
        });
    
        doc.save("relatorio-consulta.pdf");
      };
    
      const handleDownloadExcel = () => {
        if (!data) return;
        const dataForExcel = data[0].Lawsuits.Lawsuits.map((val) => ({
          "Nº Processo": val.Number,
          "Assunto Principal": val.MainSubject,
          "Status": val.Status,
          "Última Atualização": val.LastUpdate,
          "Nome do tribunal": val.CourtName,
          "Tipo do tribunal": val.CourtType,
          "Nível do tribunal": val.CourtLevel,
          "Corpo Julgador": val.JudgingBody,
          "Estado": val.State,
          "Total de Processos": data[0]?.Lawsuits.TotalLawsuits,
          "Total de Processos como Autor": data[0]?.Lawsuits.TotalLawsuitsAsAuthor,
          "Total de Processos como Defensor": data[0]?.Lawsuits.TotalLawsuitsAsDefendant,
          "Total de Processos como Outros": data[0]?.Lawsuits.TotalLawsuitsAsOther
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Consultas");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const dataE = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });
        saveAs(dataE, "relatorio-consulta.xlsx");
      };

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
                            {data && (
                                <div className="grid md:grid-cols-4 md:grid-rows-2 gap-5">
                                <div className="bg-secondColor text-white p-2 rounded-md">
                                    <h1>Total Processos:</h1>
                                    <h1 className="text-3xl font-bold">{data[0].Lawsuits.TotalLawsuits}</h1>
                                </div>
                                <div className="bg-secondColor text-white p-2 rounded-md">
                                    <h1>Processos como Autor:</h1>
                                    <h1 className="text-3xl font-bold">{data[0].Lawsuits.TotalLawsuitsAsAuthor}</h1>
                                </div>
                                <div className="bg-secondColor text-white p-2 rounded-md">
                                    <h1>Processos como Defensor:</h1>
                                    <h1 className="text-3xl font-bold">{data[0].Lawsuits.TotalLawsuitsAsDefendant}</h1>
                                </div>
                                <div className="bg-secondColor text-white p-2 rounded-md">
                                    <h1>Últimos 180 dias:</h1>
                                    <h1 className="text-3xl font-bold">{data[0].Lawsuits.Last180DaysLawsuits}</h1>
                                </div>
                                <div className="bg-secondColor text-white p-2 rounded-md">
                                    <h1>Últimos 30 dias:</h1>
                                    <h1 className="text-3xl font-bold">{data[0].Lawsuits.Last30DaysLawsuits}</h1>
                                </div>
                                <div className="bg-secondColor text-white p-2 rounded-md">
                                    <h1>Últimos 365 dias:</h1>
                                    <h1 className="text-3xl font-bold">{data[0].Lawsuits.Last365DaysLawsuits}</h1>
                                </div>
                                <div className="bg-secondColor text-white p-2 rounded-md">
                                    <h1>Últimos 90 dias:</h1>
                                    <h1 className="text-3xl font-bold">{data[0].Lawsuits.Last90DaysLawsuits}</h1>
                                </div>
                                </div>
                            )}

                            {/* TABELA AJUSTADA */}
                            <div className="overflow-x-auto rounded-lg border my-5">
                                <table className="min-w-[1000px] w-full text-sm text-left border-collapse">
                                <thead className="bg-secondColor text-white">
                                    <tr>
                                    <th className="px-4 py-2 whitespace-nowrap">Última Atualização</th>
                                    <th className={`px-4 py-2 min-w-[300px]`}>Assunto Principal</th>
                                    <th className="px-4 py-2 whitespace-nowrap">Nº do Processo</th>
                                    <th className="px-4 py-2 whitespace-nowrap">Status</th>
                                    <th className="px-4 py-2 whitespace-nowrap">Nome do Tribunal</th>
                                    <th className="px-4 py-2 whitespace-nowrap">Nível Tribunal</th>
                                    <th className="px-4 py-2 whitespace-nowrap">Tipo Tribunal</th>
                                    <th className="px-4 py-2 min-w-[300px]">Corpo Julgador</th>
                                    <th className="px-4 py-2 whitespace-nowrap">Estado</th>
                                    <th className="px-4 py-2 min-w-[200px]">Tipo</th>
                                    <th className="px-4 py-2">Valor</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data[0].Lawsuits.Lawsuits.map((val, i) => (
                                    <tr
                                        key={i}
                                        className={i % 2 === 0 ? "bg-white" : "bg-blueColor/10"}
                                    >
                                        <td className="px-4 py-2 whitespace-nowrap">{val.LastUpdate.slice(0, 10).split("-").reverse().join('-')}</td>
                                        <td className="px-4 py-2">{val.MainSubject}</td>
                                        <td className="px-4 py-2 whitespace-nowrap">{val.Number}</td>
                                        <td className="px-4 py-2 whitespace-nowrap">{val.Status}</td>
                                        <td className="px-4 py-2 whitespace-nowrap">{val.CourtName}</td>
                                        <td className="px-4 py-2 whitespace-nowrap">{val.CourtLevel}</td>
                                        <td className="px-4 py-2 whitespace-nowrap">{val.CourtType}</td>
                                        <td className="px-4 py-2">{val.JudgingBody}</td>
                                        <td className="px-4 py-2 whitespace-nowrap">{val.State}</td>
                                        <td className="px-4 py-2">{val.Type}</td>
                                        <td className="px-4 py-2 min-w-[120px]">R${val.Value.toFixed(2)}</td>
                                    </tr>
                                    ))}
                                </tbody>
                                </table>
                            </div>

                            <div className="flex gap-2 mt-4">
                                {data[0].Lawsuits.NextPageId && (
                                <button
                                    disabled={loadingNext}
                                    onClick={nextPageClick}
                                    className="bg-blue-500 disabled:bg-gray-600 p-2 rounded-md text-white"
                                >
                                    {loadingNext ? <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div> : "Próxima Página"}
                                </button>
                                )}

                                <button
                                onClick={handleDownloadPDF}
                                className="bg-green-500 p-2 rounded-md text-white"
                                >
                                Baixar PDF
                                </button>

                                <button
                                onClick={handleDownloadExcel}
                                className="bg-yellow-500 p-2 rounded-md text-white"
                                >
                                Baixar Excel
                                </button>
                            </div>
                            </div>
                        )}
                    </section>
                </div>
        </div>
    )
}