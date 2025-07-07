"use client";
import { useState } from "react";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { DataCompanyTypes, DecisionTypes, PartiesTypes, UpdatesTypes } from "@/types/ConsultationCompanyTypes";
import { DecisionModalBusiness } from "./DecisionModalBusiness";
import { PartiesModalBusiness } from "./PartiesModalBusiness";
import { UpdatesModalBusiness } from "./UpdatesModalBusiness";

export const ViewConsultationBusiness = ({ data }: { data: DataCompanyTypes | null }) => {
  const [dataReceive, setDataReceive] = useState(data);
  const [loading, setLoading] = useState(false);

  const [decisionData, setDecisionData] = useState<DecisionTypes[] | null>(null);
  const [partiesData, setPartiesData] = useState<PartiesTypes[] | null>(null);
  const [updatesData, setUpdatesData] = useState<UpdatesTypes[] | null>(null);

  const nextPageClick = async () => {
    if (!dataReceive) return;
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
      console.error(e);
    } finally {
      setLoading(false);
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

  const printSectionTitle = (title: string) => {
    checkPageBreak(10);
    doc.setFont("helvetica", "bold");
    doc.text(title, marginLeft + 5, y);
    y += 8;
    doc.setFont("helvetica", "normal");
  };

  const printLines = (lines: string[]) => {
    lines.forEach(line => {
      const splitLines = doc.splitTextToSize(line, maxWidth - 10);
      checkPageBreak(splitLines.length * 6);
      doc.text(splitLines, marginLeft + 10, y);
      y += splitLines.length * 6;
    });
  };

  doc.setFont("helvetica", "bold");
  doc.text("Relatório de Consultas - Empresas", marginLeft, y);
  y += 10;
  doc.setFont("helvetica", "normal");

  const resumo = [
    `Total Processos: ${dataReceive.Lawsuits.TotalLawsuits}`,
    `Autor: ${dataReceive.Lawsuits.TotalLawsuitsAsAuthor}`,
    `Defensor: ${dataReceive.Lawsuits.TotalLawsuitsAsDefendant}`,
    `Outros: ${dataReceive.Lawsuits.TotalLawsuitsAsOther}`,
    `Últimos 180 dias: ${dataReceive.Lawsuits.Last180DaysLawsuits}`,
    `Últimos 30 dias: ${dataReceive.Lawsuits.Last30DaysLawsuits}`,
    `Últimos 365 dias: ${dataReceive.Lawsuits.Last365DaysLawsuits}`,
    `Últimos 90 dias: ${dataReceive.Lawsuits.Last90DaysLawsuits}`
  ];

  resumo.forEach(text => {
    checkPageBreak(10);
    doc.text(text, marginLeft, y);
    y += 10;
  });

  checkPageBreak(10);
  doc.text("Processos:", marginLeft, y);
  y += 10;

  dataReceive.Lawsuits.Lawsuits.forEach((val, i) => {
    checkPageBreak(20);
    doc.setFont("helvetica", "bold");
    doc.text(`${i + 1}. ${val.Number}`, marginLeft, y);
    y += 8;
    doc.setFont("helvetica", "normal");

    // 🟢 Print *all* fields
    const allFields = [
      { label: "Assunto", value: val.MainSubject },
      { label: "Status", value: val.Status },
      { label: "Valor", value: val.Value != null ? `R$ ${val.Value.toFixed(2)}` : "Não informado" },
      { label: "Última Atualização", value: val.LastUpdate },
      { label: "CaptureDate", value: val.CaptureDate },
      { label: "CloseDate", value: val.CloseDate },
      { label: "CourtDistrict", value: val.CourtDistrict },
      { label: "Nome do Tribunal", value: val.CourtName },
      { label: "Tipo do Tribunal", value: val.CourtType },
      { label: "Nível do Tribunal", value: val.CourtLevel },
      { label: "Corpo Julgador", value: val.JudgingBody },
      { label: "Estado", value: val.State },
      { label: "Tipo", value: val.Type },
      { label: "AverageNumberOfUpdatesPerMonth", value: val.AverageNumberOfUpdatesPerMonth },
      { label: "LastMovementDate", value: val.LastMovementDate },
      { label: "LawSuitAge", value: val.LawSuitAge },
      { label: "LawsuitHostService", value: val.LawsuitHostService },
      { label: "NoticeDate", value: val.NoticeDate },
      { label: "NumberOfPages", value: val.NumberOfPages },
      { label: "NumberOfParties", value: val.NumberOfParties },
      { label: "NumberOfUpdates", value: val.NumberOfUpdates },
      { label: "NumberOfVolumes", value: val.NumberOfVolumes },
      { label: "PublicationDate", value: val.PublicationDate },
      { label: "ReasonForConcealedData", value: val.ReasonForConcealedData },
      { label: "RedistributionDate", value: val.RedistributionDate },
      { label: "ResJudicataDate", value: val.ResJudicataDate },
      { label: "InferredBroadCNJSubjectName", value: val.InferredBroadCNJSubjectName },
      { label: "InferredBroadCNJSubjectNumber", value: val.InferredBroadCNJSubjectNumber },
      { label: "InferredCNJProcedureTypeName", value: val.InferredCNJProcedureTypeName },
      { label: "InferredCNJProcedureTypeNumber", value: val.InferredCNJProcedureTypeNumber },
      { label: "InferredCNJSubjectName", value: val.InferredCNJSubjectName },
      { label: "InferredCNJSubjectNumber", value: val.InferredCNJSubjectNumber },
      { label: "OtherSubjects", value: val.OtherSubjects?.join(", ") || "Nenhum" }
    ];

    allFields.forEach(({ label, value }) => {
      const lines = doc.splitTextToSize(`${label}: ${value ?? "Não informado"}`, maxWidth);
      checkPageBreak(lines.length * 6);
      doc.text(lines, marginLeft + 10, y);
      y += lines.length * 6;
    });

    y += 5;

    // 🟣 Decisions
    if (val.Decisions?.length) {
      printSectionTitle("* Decisions:");
      val.Decisions.forEach((d, idx) => {
        printLines([`${idx + 1}. ${d.DecisionDate}: ${d.DecisionContent}`]);
      });
    } else {
      printSectionTitle("* Decisions: Nenhuma");
    }

    y += 5;

    // 🟢 Parties
    if (val.Parties?.length) {
      printSectionTitle("* Parties:");
      val.Parties.forEach((p, idx) => {
        const line = `${idx + 1}. ${p.Name} (${p.Type}, Polaridade: ${p.Polarity}, Ativo: ${p.IsPartyActive ? "Sim" : "Não"}, Inferência: ${p.IsInference ? "Sim" : "Não"}, Tipo Específico: ${p.PartyDetails?.SpecificType ?? "Não informado"}, Doc: ${p.Doc}, Última Captura: ${p.LastCaptureDate})`;
        printLines([line]);
      });
    } else {
      printSectionTitle("* Parties: Nenhuma");
    }

    y += 5;

    // 🟣 Updates
    if (val.Updates?.length) {
      printSectionTitle("* Updates:");
      val.Updates.forEach((u, idx) => {
        const line = `${idx + 1}. Publicação: ${u.PublishDate}, Captura: ${u.CaptureDate}, Conteúdo: ${u.Content}`;
        printLines([line]);
      });
    } else {
      printSectionTitle("* Updates: Nenhuma");
    }

    y += 10;
  });

  doc.save("relatorio-consulta-empresas.pdf");
};


const handleDownloadExcel = () => {
  if (!dataReceive) return;

  // 🟢 1. Aba principal com TODOS os campos de LawsuitsTypes
  const processSheetData = dataReceive.Lawsuits.Lawsuits.map(val => ({
    "Nº Processo": val.Number,
    "Assunto Principal": val.MainSubject,
    "Status": val.Status,
    "Última Atualização": val.LastUpdate,
    "Nome do Tribunal": val.CourtName,
    "Tipo do Tribunal": val.CourtType,
    "Nível do Tribunal": val.CourtLevel,
    "Corpo Julgador": val.JudgingBody,
    "Estado": val.State,
    "Tipo": val.Type,
    "Valor": val.Value != null ? `R$ ${val.Value.toFixed(2)}` : "Não informado",
    "CaptureDate": val.CaptureDate,
    "CloseDate": val.CloseDate,
    "CourtDistrict": val.CourtDistrict,
    "AverageNumberOfUpdatesPerMonth": val.AverageNumberOfUpdatesPerMonth,
    "InferredBroadCNJSubjectName": val.InferredBroadCNJSubjectName,
    "InferredBroadCNJSubjectNumber": val.InferredBroadCNJSubjectNumber,
    "InferredCNJProcedureTypeName": val.InferredCNJProcedureTypeName,
    "InferredCNJProcedureTypeNumber": val.InferredCNJProcedureTypeNumber,
    "InferredCNJSubjectName": val.InferredCNJSubjectName,
    "InferredCNJSubjectNumber": val.InferredCNJSubjectNumber,
    "LastMovementDate": val.LastMovementDate,
    "LawSuitAge": val.LawSuitAge,
    "LawsuitHostService": val.LawsuitHostService,
    "NoticeDate": val.NoticeDate,
    "NumberOfPages": val.NumberOfPages,
    "NumberOfParties": val.NumberOfParties,
    "NumberOfUpdates": val.NumberOfUpdates,
    "NumberOfVolumes": val.NumberOfVolumes,
    "OtherSubjects": val.OtherSubjects?.join(", ") || "",
    "PublicationDate": val.PublicationDate,
    "ReasonForConcealedData": val.ReasonForConcealedData,
    "RedistributionDate": val.RedistributionDate,
    "ResJudicataDate": val.ResJudicataDate
  }));

  // 🟣 2. Aba Decisions
  const decisionsSheetData = dataReceive.Lawsuits.Lawsuits.flatMap(val =>
    (val.Decisions || []).map(d => ({
      "Nº Processo": val.Number,
      "Decision Content": d.DecisionContent,
      "Decision Date": d.DecisionDate
    }))
  );

  // 🟢 3. Aba Parties
  const partiesSheetData = dataReceive.Lawsuits.Lawsuits.flatMap(val =>
    (val.Parties || []).map(p => ({
      "Nº Processo": val.Number,
      "Nome": p.Name,
      "Tipo": p.Type,
      "Polaridade": p.Polarity,
      "Inferência": p.IsInference ? "Sim" : "Não",
      "Ativo": p.IsPartyActive ? "Sim" : "Não",
      "Tipo Específico": p.PartyDetails?.SpecificType ?? "Não informado",
      "Última Captura": p.LastCaptureDate,
      "Documento": p.Doc
    }))
  );

  // 🟣 4. Aba Updates
  const updatesSheetData = dataReceive.Lawsuits.Lawsuits.flatMap(val =>
    (val.Updates || []).map(u => ({
      "Nº Processo": val.Number,
      "Conteúdo": u.Content,
      "Data de Publicação": u.PublishDate,
      "Data de Captura": u.CaptureDate
    }))
  );

  // 🟠 5. Monta o Workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(processSheetData), "Consultas");

  if (decisionsSheetData.length > 0) {
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(decisionsSheetData), "Decisions");
  }
  if (partiesSheetData.length > 0) {
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(partiesSheetData), "Parties");
  }
  if (updatesSheetData.length > 0) {
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(updatesSheetData), "Updates");
  }

  // 🟣 6. Salva
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const dataE = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8"
  });
  saveAs(dataE, "relatorio-consulta-empresas.xlsx");
};


  return (
    <section>
      {decisionData && <DecisionModalBusiness decisions={decisionData} onClose={() => setDecisionData(null)} />}
      {partiesData && <PartiesModalBusiness parties={partiesData} onClose={() => setPartiesData(null)} />}
      {updatesData && <UpdatesModalBusiness updates={updatesData} onClose={() => setUpdatesData(null)} />}

      <hr className="my-5" />
      <div className="my-5">
        <h1 className="font-bold text-2xl">Cada página retorna no máximo 30 a 500 processos.</h1>
        <p>Se precisar ver mais processos, aperte no botão de próxima página</p>
      </div>

      {dataReceive && (
        <div>

          {/* AQUI SUA TABELA, incluindo os 3 botões-badge para Decisions, Parties, Updates! */}
<div className="overflow-x-auto rounded-lg border my-5">
  <table className="min-w-[2000px] w-full text-sm text-left border-collapse">
    <thead className="bg-secondColor text-white">
      <tr>
        <th className="px-4 py-2">Decisões</th>
        <th className="px-4 py-2">Partes</th>
        <th className="px-4 py-2">Atualizações</th>
        <th className="px-4 py-2">Nº do Processo</th>
        <th className="px-4 py-2">Assunto Principal</th>
        <th className="px-4 py-2">Status</th>
        <th className="px-4 py-2">Última Atualização</th>
        <th className="px-4 py-2">Data de Captura</th>
        <th className="px-4 py-2">Data de Encerramento</th>
        <th className="px-4 py-2">Distrito Judicial</th>
        <th className="px-4 py-2">Nome do Tribunal</th>
        <th className="px-4 py-2">Tipo do Tribunal</th>
        <th className="px-4 py-2">Nível do Tribunal</th>
        <th className="px-4 py-2">Corpo Julgador</th>
        <th className="px-4 py-2">Estado</th>
        <th className="px-4 py-2">Tipo</th>
        <th className="px-4 py-2">Valor</th>
        <th className="px-4 py-2">Média Atualizações/Mês</th>
        <th className="px-4 py-2">Data do Último Movimento</th>
        <th className="px-4 py-2">Idade do Processo (dias)</th>
        <th className="px-4 py-2">Serviço Hospedeiro</th>
        <th className="px-4 py-2">Data de Notificação</th>
        <th className="px-4 py-2">Número de Páginas</th>
        <th className="px-4 py-2">Número de Partes</th>
        <th className="px-4 py-2">Número de Atualizações</th>
        <th className="px-4 py-2">Número de Volumes</th>
        <th className="px-4 py-2">Data de Publicação</th>
        <th className="px-4 py-2">Motivo dos Dados Ocultos</th>
        <th className="px-4 py-2">Data de Redistribuição</th>
        <th className="px-4 py-2">Data de Coisa Julgada</th>
        <th className="px-4 py-2">Outros Assuntos</th>
        <th className="px-4 py-2">Assunto CNJ Amplo Inferido</th>
        <th className="px-4 py-2">Número do Assunto CNJ Amplo Inferido</th>
        <th className="px-4 py-2">Tipo de Procedimento CNJ Inferido</th>
        <th className="px-4 py-2">Número do Tipo de Procedimento CNJ Inferido</th>
        <th className="px-4 py-2">Assunto CNJ Inferido</th>
        <th className="px-4 py-2">Número do Assunto CNJ Inferido</th>
      </tr>
    </thead>

    <tbody>
      {dataReceive.Lawsuits.Lawsuits.map((val, i) => (
        <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-blueColor/10"}>
          <td className="px-4 py-2">
            <button
              onClick={() => setDecisionData(val.Decisions)}
              className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm hover:bg-blue-200 transition cursor-pointer"
              title="Ver decisões"
            >
              {val?.Decisions?.length || 0}
            </button>
          </td>
          <td className="px-4 py-2">
            <button
              onClick={() => setPartiesData(val.Parties)}
              className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-green-100 text-green-600 font-semibold text-sm hover:bg-green-200 transition cursor-pointer"
              title="Ver partes"
            >
              {val?.Parties?.length || 0}
            </button>
          </td>
          <td className="px-4 py-2">
            <button
              onClick={() => setUpdatesData(val.Updates)}
              className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-purple-100 text-purple-600 font-semibold text-sm hover:bg-purple-200 transition cursor-pointer"
              title="Ver atualizações"
            >
              {val?.Updates?.length || 0}
            </button>
          </td>
          <td className="px-4 py-2">{val.Number ?? "Não informado"}</td>
          <td className="px-4 py-2">{val.MainSubject ?? "Não informado"}</td>
          <td className="px-4 py-2">{val.Status ?? "Não informado"}</td>
          <td className="px-4 py-2">{val.LastUpdate ?? "Não informado"}</td>
          <td className="px-4 py-2">{val.CaptureDate ?? "Não informado"}</td>
          <td className="px-4 py-2">{val.CloseDate ?? "Não informado"}</td>
          <td className="px-4 py-2">{val.CourtDistrict ?? "Não informado"}</td>
          <td className="px-4 py-2">{val.CourtName ?? "Não informado"}</td>
          <td className="px-4 py-2">{val.CourtType ?? "Não informado"}</td>
          <td className="px-4 py-2">{val.CourtLevel ?? "Não informado"}</td>
          <td className="px-4 py-2">{val.JudgingBody ?? "Não informado"}</td>
          <td className="px-4 py-2">{val.State ?? "Não informado"}</td>
          <td className="px-4 py-2">{val.Type ?? "Não informado"}</td>
          <td className="px-4 py-2">{val.Value != null ? `R$ ${val.Value.toFixed(2)}` : "Não informado"}</td>
          <td className="px-4 py-2">{val.AverageNumberOfUpdatesPerMonth ?? "Não informado"}</td>
          <td className="px-4 py-2">{val.LastMovementDate ?? "Não informado"}</td>
          <td className="px-4 py-2">{val.LawSuitAge ?? "Não informado"}</td>
          <td className="px-4 py-2">{val.LawsuitHostService ?? "Não informado"}</td>
          <td className="px-4 py-2">{val.NoticeDate ?? "Não informado"}</td>
          <td className="px-4 py-2">{val.NumberOfPages ?? "Não informado"}</td>
          <td className="px-4 py-2">{val.NumberOfParties ?? "Não informado"}</td>
          <td className="px-4 py-2">{val.NumberOfUpdates ?? "Não informado"}</td>
          <td className="px-4 py-2">{val.NumberOfVolumes ?? "Não informado"}</td>
          <td className="px-4 py-2">{val.PublicationDate ?? "Não informado"}</td>
          <td className="px-4 py-2">{val.ReasonForConcealedData ?? "Não informado"}</td>
          <td className="px-4 py-2">{val.RedistributionDate ?? "Não informado"}</td>
          <td className="px-4 py-2">{val.ResJudicataDate ?? "Não informado"}</td>
          <td className="px-4 py-2">{val.OtherSubjects?.join(", ") || "Nenhum"}</td>
          <td className="px-4 py-2">{val.InferredBroadCNJSubjectName ?? "Não informado"}</td>
          <td className="px-4 py-2">{val.InferredBroadCNJSubjectNumber ?? "Não informado"}</td>
          <td className="px-4 py-2">{val.InferredCNJProcedureTypeName ?? "Não informado"}</td>
          <td className="px-4 py-2">{val.InferredCNJProcedureTypeNumber ?? "Não informado"}</td>
          <td className="px-4 py-2">{val.InferredCNJSubjectName ?? "Não informado"}</td>
          <td className="px-4 py-2">{val.InferredCNJSubjectNumber ?? "Não informado"}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>


          <div className="flex gap-2 mb-5">
            {dataReceive.Lawsuits.NextPageId && (
              <button disabled={loading} onClick={nextPageClick} className="bg-blue-500 disabled:bg-gray-600 p-2 rounded-md text-white">
                {loading ? <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div> : "Próxima Página"}
              </button>
            )}
            <button onClick={handleDownloadPDF} className="bg-green-500 p-2 rounded-md text-white">
              Baixar PDF
            </button>
            <button onClick={handleDownloadExcel} className="bg-yellow-500 p-2 rounded-md text-white">
              Baixar Excel
            </button>
          </div>

        </div>
      )}
    </section>
  );
};
