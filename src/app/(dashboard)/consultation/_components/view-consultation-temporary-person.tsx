"use client";
import { useState } from "react";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { DataPersonTypes } from "@/types/ConsultationPersonTypes";

export const ViewConsultationTemporaryPerson = ({ data }: { data: DataPersonTypes | null }) => {
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
        const pageWidth = doc.internal.pageSize.getWidth(); // Largura da página
        const pageHeight = doc.internal.pageSize.getHeight(); // Altura da página
        const marginLeft = 10;
        const maxWidth = pageWidth - 20; // Define a largura máxima do texto
        let y = 10; // Posição vertical inicial
        const safetyMargin = 30; // Margem de segurança antes de pular de página
    
        const checkPageBreak = (requiredSpace: number) => {
            if (y + requiredSpace > pageHeight - safetyMargin) {
                doc.addPage();
                y = 10; // Reinicia a posição no topo da nova página
            }
        };
    
        doc.setFont("helvetica", "bold");
        doc.text("Relatório de Consultas", marginLeft, y);
        y += 10;
        doc.setFont("helvetica", "normal");
    
        if (data) {
            const infoTexts = [
                `Total Processos: ${data.Processes.TotalLawsuits}`,
                `Processos como Autor: ${data.Processes.TotalLawsuitsAsAuthor}`,
                `Processos como Defensor: ${data.Processes.TotalLawsuitsAsDefendant}`,
                `Últimos 180 dias: ${data.Processes.Last180DaysLawsuits}`,
                `Últimos 30 dias: ${data.Processes.Last30DaysLawsuits}`,
                `Últimos 365 dias: ${data.Processes.Last365DaysLawsuits}`,
                `Últimos 90 dias: ${data.Processes.Last90DaysLawsuits}`
            ];
    
            infoTexts.forEach(text => {
                checkPageBreak(10); // Garante que há espaço antes de escrever
                doc.text(text, marginLeft, y);
                y += 10;
            });
        }
    
        checkPageBreak(10);
        doc.text("Os processos da página:", marginLeft, y);
        y += 10;
    
        dataReceive.Processes.Lawsuits.forEach((val, i) => {
            checkPageBreak(50); // Verifica se há espaço para o bloco do processo
    
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
                checkPageBreak(lines.length * 6); // Checa antes de adicionar cada item
                doc.text(lines, marginLeft + 10, y);
                y += lines.length * 6;
            });
    
            y += 5; // Espaço extra entre registros
        });
    
        doc.save("relatorio-consulta.pdf");
    };
    

    const handleDownloadExcel = () => {
        if (!dataReceive) return;
        const dataForExcel = dataReceive.Processes.Lawsuits.map((val) => ({
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
