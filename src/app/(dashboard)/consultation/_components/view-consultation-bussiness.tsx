"use client";
import { useState } from "react";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { DataCompanyTypes } from "@/types/ConsultationCompanyTypes";

export const ViewConsultationBussiness = ({ data }: { data: DataCompanyTypes | null }) => {
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

  const handleDownloadPDF = () => {
    if (!dataReceive) return;

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
        `Total Processos: ${data.Lawsuits.TotalLawsuits}`,
        `Processos como Autor: ${data.Lawsuits.TotalLawsuitsAsAuthor}`,
        `Processos como Defensor: ${data.Lawsuits.TotalLawsuitsAsDefendant}`,
        `Últimos 180 dias: ${data.Lawsuits.Last180DaysLawsuits}`,
        `Últimos 30 dias: ${data.Lawsuits.Last30DaysLawsuits}`,
        `Últimos 365 dias: ${data.Lawsuits.Last365DaysLawsuits}`,
        `Últimos 90 dias: ${data.Lawsuits.Last90DaysLawsuits}`
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

    dataReceive.Lawsuits.Lawsuits.forEach((val, i) => {
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
      "Total de Processos": data?.Lawsuits.TotalLawsuits,
      "Total de Processos como Autor": data?.Lawsuits.TotalLawsuitsAsAuthor,
      "Total de Processos como Defensor": data?.Lawsuits.TotalLawsuitsAsDefendant,
      "Total de Processos como Outros": data?.Lawsuits.TotalLawsuitsAsOther
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Consultas");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const dataE = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });
    saveAs(dataE, "relatorio-consulta.xlsx");
  };

  return (
    <section>
      <hr className="my-5" />
      <div className="my-5">
        <h1 className="font-bold text-2xl">Cada página retorna no máximo 30 a 500 processos.</h1>
        <p>Se precisar ver mais processos, aperte no botão de próxima página</p>
      </div>

      {dataReceive && (
        <div>
          {data && (
            <div className="grid md:grid-cols-4 md:grid-rows-2 gap-5">
              <div className="bg-secondColor text-white p-2 rounded-md">
                <h1>Total Processos:</h1>
                <h1 className="text-3xl font-bold">{data.Lawsuits.TotalLawsuits}</h1>
              </div>
              <div className="bg-secondColor text-white p-2 rounded-md">
                <h1>Processos como Autor:</h1>
                <h1 className="text-3xl font-bold">{data.Lawsuits.TotalLawsuitsAsAuthor}</h1>
              </div>
              <div className="bg-secondColor text-white p-2 rounded-md">
                <h1>Processos como Defensor:</h1>
                <h1 className="text-3xl font-bold">{data.Lawsuits.TotalLawsuitsAsDefendant}</h1>
              </div>
              <div className="bg-secondColor text-white p-2 rounded-md">
                <h1>Últimos 180 dias:</h1>
                <h1 className="text-3xl font-bold">{data.Lawsuits.Last180DaysLawsuits}</h1>
              </div>
              <div className="bg-secondColor text-white p-2 rounded-md">
                <h1>Últimos 30 dias:</h1>
                <h1 className="text-3xl font-bold">{data.Lawsuits.Last30DaysLawsuits}</h1>
              </div>
              <div className="bg-secondColor text-white p-2 rounded-md">
                <h1>Últimos 365 dias:</h1>
                <h1 className="text-3xl font-bold">{data.Lawsuits.Last365DaysLawsuits}</h1>
              </div>
              <div className="bg-secondColor text-white p-2 rounded-md">
                <h1>Últimos 90 dias:</h1>
                <h1 className="text-3xl font-bold">{data.Lawsuits.Last90DaysLawsuits}</h1>
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
                {dataReceive.Lawsuits.Lawsuits.map((val, i) => (
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
            {dataReceive.Lawsuits.NextPageId && (
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
