"use client";
import { useState } from "react";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { DataJsonTypes } from "../../view-consultation/[id]/_components/ViewBussiness";

export const ViewConsultationTemporary = ({ data }: { data: DataJsonTypes | null }) => {
    const [dataReceive, setDataReceive] = useState(data);
    const [loading, setLoading] = useState<boolean>(false);

    const nextPageClick = async () => {
        if (dataReceive) {
            setLoading(true);
            try {
                const response = await fetch("/api/consultation/next-page", {
                    method: "POST",
                    body: JSON.stringify({
                        nextPageId: dataReceive.Lawsuits.NextPageId,
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
        }
    };

    // Função para gerar e baixar o PDF
    const handleDownloadPDF = () => {
        if (!dataReceive) return;
    
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth(); // Largura da página
        const marginLeft = 10;
        const maxWidth = pageWidth - 20; // Define a largura máxima do texto para evitar corte
        let y = 10; // Posição vertical inicial
    
        doc.setFont("helvetica", "bold");
        doc.text("Relatório de Consultas", marginLeft, y);
        y += 10;
        doc.setFont("helvetica", "normal");
    
        if (data) {
            doc.text(`Total Processos: ${data.Lawsuits.TotalLawsuits}`, marginLeft, y);
            y += 10;
            doc.text(`Processos como Autor: ${data.Lawsuits.TotalLawsuitsAsAuthor}`, marginLeft, y);
            y += 10;
            doc.text(`Processos como Defensor: ${data.Lawsuits.TotalLawsuitsAsDefendant}`, marginLeft, y);
            y += 10;
            doc.text(`Últimos 180 dias: ${data.Lawsuits.Last180DaysLawsuits}`, marginLeft, y);
            y += 10;
            doc.text(`Últimos 30 dias: ${data.Lawsuits.Last30DaysLawsuits}`, marginLeft, y);
            y += 10;
            doc.text(`Últimos 365 dias: ${data.Lawsuits.Last365DaysLawsuits}`, marginLeft, y);
            y += 10;
            doc.text(`Últimos 90 dias: ${data.Lawsuits.Last90DaysLawsuits}`, marginLeft, y);
            y += 10;
        }
    
        doc.text("Os processos da página:", marginLeft, y);
        y += 10;
    
        dataReceive.Lawsuits.Lawsuits.forEach((val, i) => {
            if (y > 270) {
                doc.addPage();
                y = 10;
            }
    
            doc.setFont("helvetica", "bold");
            doc.text(`${i + 1}. ${val.Number}`, marginLeft, y);
            y += 8;
            doc.setFont("helvetica", "normal");
    
            const mainSubjectLines = doc.splitTextToSize(`Assunto: ${val.MainSubject}`, maxWidth);
            doc.text(mainSubjectLines, marginLeft + 10, y);
            y += mainSubjectLines.length * 6;
    
            const statusLines = doc.splitTextToSize(`Status: (${val.Status})`, maxWidth);
            doc.text(statusLines, marginLeft + 10, y);
            y += statusLines.length * 6;
    
            const courtNameLines = doc.splitTextToSize(`Nome do Tribunal: ${val.CourtName}`, maxWidth);
            doc.text(courtNameLines, marginLeft + 10, y);
            y += courtNameLines.length * 6;
    
            const courtTypeLines = doc.splitTextToSize(`Tipo de Tribunal: ${val.CourtType}`, maxWidth);
            doc.text(courtTypeLines, marginLeft + 10, y);
            y += courtTypeLines.length * 6;
    
            const courtLevelLines = doc.splitTextToSize(`Nível do Tribunal: ${val.CourtLevel}`, maxWidth);
            doc.text(courtLevelLines, marginLeft + 10, y);
            y += courtLevelLines.length * 6;
    
            const judgingBodyLines = doc.splitTextToSize(`Corpo Julgador: ${val.JudgingBody}`, maxWidth);
            doc.text(judgingBodyLines, marginLeft + 10, y);
            y += judgingBodyLines.length * 6;
    
            const stateLines = doc.splitTextToSize(`Estado: ${val.State}`, maxWidth);
            doc.text(stateLines, marginLeft + 10, y);
            y += stateLines.length * 6;
    
            y += 5; // Espaço extra entre registros
        });
    
        doc.save("relatorio-consulta.pdf");
    };
    
    

    const handleDownloadExcel = () => {
        if (!dataReceive) return;
        const dataForExcel = dataReceive.Lawsuits.Lawsuits.map((val) => ({
            "Nº Processo": val.Number,
            "Assunto Principal": val.MainSubject,
            "Status": val.Status,
            "Última Atualização": val.LastUpdate,
            "Nome do tribunal": val.CourtName,
            "Tipo do tribunal": val.CourtType,
            "Nível do tribunal": val.CourtLevel,
            "Corpo Julgador": val.JudgingBody,
            "Estado": val.State,
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Consultas");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });
        saveAs(data, "relatorio-consulta.xlsx");
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
                                <h1>{data.Lawsuits.TotalLawsuits}</h1>
                            </div>
                            <div className="bg-blue-950/50 text-white p-2 rounded-md">
                                <h1>Processos como Autor:</h1>
                                <h1>{data.Lawsuits.TotalLawsuitsAsAuthor}</h1>
                            </div>
                            <div className="bg-blue-950/50 text-white p-2 rounded-md">
                                <h1>Processos como Defensor:</h1>
                                <h1>{data.Lawsuits.TotalLawsuitsAsDefendant}</h1>
                            </div>
                            <div className="bg-blue-950/50 text-white p-2 rounded-md">
                                <h1>Últimos 180 dias:</h1>
                                <h1>{data.Lawsuits.Last180DaysLawsuits}</h1>
                            </div>
                            <div className="bg-blue-950/50 text-white p-2 rounded-md">
                                <h1>Últimos 30 dias:</h1>
                                <h1>{data.Lawsuits.Last30DaysLawsuits}</h1>
                            </div>
                            <div className="bg-blue-950/50 text-white p-2 rounded-md">
                                <h1>Últimos 365 dias:</h1>
                                <h1>{data.Lawsuits.Last365DaysLawsuits}</h1>
                            </div>
                            <div className="bg-blue-950/50 text-white p-2 rounded-md">
                                <h1>Últimos 90 dias:</h1>
                                <h1>{data.Lawsuits.Last90DaysLawsuits}</h1>
                            </div>
                        </div>
                    )}

                    <div className="">
                        {dataReceive.Lawsuits.Lawsuits.map((val, i) => (
                            <div key={i} className="flex items-center overflow-x-auto my-3 p-5 bg-blue-950/50 gap-5">
                                <div className="min-w-[200px]">
                                    <h1 className="font-bold whitespace-nowrap">{val.LastUpdate}</h1>
                                    <h4 className="text-white/50 whitespace-nowrap" >Última Atualização</h4>
                                </div>

                                <div className="min-w-[500px]">
                                    <h1 className="whitespace-normal">{val.MainSubject}</h1>
                                    <h4 className="text-white/50 whitespace-nowrap">{val.Number}</h4>
                                </div>

                                <div className="min-w-[220px]">
                                    <h1 className="whitespace-nowrap">{val.Status}</h1>
                                    <h4 className="text-white/50 whitespace-nowrap">Status</h4>
                                </div>

                                <div className="min-w-[200px]">
                                    <h1 className="whitespace-nowrap">{val.CourtName}</h1>
                                    <h4 className="text-white/50 whitespace-nowrap">Nome Tribunal</h4>
                                </div>

                                <div className="min-w-[200px]">
                                    <h1 className="whitespace-nowrap">{val.CourtLevel}</h1>
                                    <h4 className="text-white/50 whitespace-nowrap">Nível de Tribunal</h4>
                                </div>

                                <div className="min-w-[200px]">
                                    <h1 className="whitespace-nowrap">{val.CourtType}</h1>
                                    <h4 className="text-white/50 whitespace-nowrap">Tipo de Tribunal</h4>
                                </div>

                                <div className="min-w-[450px]">
                                    <h1 className="whitespace-nowrap">{val.JudgingBody}</h1>
                                    <h4 className="text-white/50 whitespace-nowrap">Corpo Julgador</h4>
                                </div>

                                <div className="min-w-[100px]">
                                    <h1 className="whitespace-nowrap">{val.State}</h1>
                                    <h4 className="text-white/50 whitespace-nowrap">Estado</h4> 
                                </div>

                                <div className="min-w-[150px]">
                                    <h1 className="whitespace-normal">{val.Type}</h1>
                                    <h4 className="text-white/50 whitespace-nowrap">Tipo</h4> 
                                </div>

                                <div className="min-w-[150px]">
                                    <h1 className="whitespace-normal">{val.Value}</h1>
                                    <h4 className="text-white/50 whitespace-nowrap">Valor</h4> 
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-2 mt-4">
                        <button
                            disabled={loading}
                            onClick={nextPageClick}
                            className="bg-blue-500 disabled:bg-gray-600 p-2 rounded-md text-white"
                        >
                            {loading ? <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div> : "Próxima Página"}
                        </button>

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
    );
};
