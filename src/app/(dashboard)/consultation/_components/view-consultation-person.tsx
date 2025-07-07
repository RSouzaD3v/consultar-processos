"use client";
import { useState } from "react";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { DataPersonTypes, Decision, Parties, Updates } from "@/types/ConsultationPersonTypes";
import { DecisionModal } from "./DecisionModal";
import { PartiesModal } from "./PartiesModal";
import { UpdatesModal } from "./UpdatesModal";

export const ViewConsultationPerson = ({ data }: { data: DataPersonTypes | null }) => {
    const [dataReceive, setDataReceive] = useState(data);
    const [loadingNext, setLoadingNext] = useState<boolean>(false);

    const [decisionData, setDecisionData] = useState<Decision[] | null>(null);
    const [partiesData, setPartiesData] = useState<Parties[] | null>(null);
    const [updatesData, setUpdatesData] = useState<Updates[] | null>(null);

    const nextPageClick = async () => {
        if (dataReceive && dataReceive.Processes.NextPageId) {
            setLoadingNext(true);
            try {
                const response = await fetch("/api/consultation/next-page-person", {
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
                setLoadingNext(false);
            }
        } else {
            console.log("Não contém outras páginas");
        }
    };

  const formatDateBR = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch {
      return dateStr;
    }
  };

    // Função para gerar e baixar o PDF
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

  // Título
  doc.setFont("helvetica", "bold");
  doc.text("Relatório de Consultas", marginLeft, y);
  y += 10;
  doc.setFont("helvetica", "normal");

  // Resumo geral
  if (dataReceive) {
    const infoTexts = [
      `Total Processos: ${dataReceive.Processes.TotalLawsuits}`,
      `Processos como Autor: ${dataReceive.Processes.TotalLawsuitsAsAuthor}`,
      `Processos como Defensor: ${dataReceive.Processes.TotalLawsuitsAsDefendant}`,
      `Últimos 180 dias: ${dataReceive.Processes.Last180DaysLawsuits}`,
      `Últimos 30 dias: ${dataReceive.Processes.Last30DaysLawsuits}`,
      `Últimos 365 dias: ${dataReceive.Processes.Last365DaysLawsuits}`,
      `Últimos 90 dias: ${dataReceive.Processes.Last90DaysLawsuits}`
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

  // Para cada processo
  dataReceive.Processes.Lawsuits.forEach((val, i) => {
    checkPageBreak(20);

    // Número do processo
    doc.setFont("helvetica", "bold");
    doc.text(`${i + 1}. ${val.Number}`, marginLeft, y);
    y += 8;
    doc.setFont("helvetica", "normal");

    // Dados principais
    const processData = [
      { label: "Assunto", value: val.MainSubject },
      { label: "Status", value: val.Status },
      { label: "Nome do Tribunal", value: val.CourtName },
      { label: "Tipo de Tribunal", value: val.CourtType },
      { label: "Nível do Tribunal", value: val.CourtLevel },
      { label: "Corpo Julgador", value: val.JudgingBody },
      { label: "Estado", value: val.State },
      { label: "Última Atualização", value: val.LastUpdate },
      { label: "Tipo", value: val.Type },
      { label: "Distrito Judicial", value: val.CourtDistrict },
      { label: "Último Movimento", value: val.LastMovementDate },
      { label: "Idade do Processo (dias)", value: val.LawSuitAge?.toString() },
      { label: "Valor", value: val.Value != null ? `R$ ${val.Value.toFixed(2)}` : "Não informado" }
    ];

    processData.forEach(({ label, value }) => {
      const lines = doc.splitTextToSize(`${label}: ${value ?? "Não informado"}`, maxWidth);
      checkPageBreak(lines.length * 6);
      doc.text(lines, marginLeft + 10, y);
      y += lines.length * 6;
    });

    y += 5;

    // Decisions
    if (val.Decisions?.length) {
      printSectionTitle("* Decisions:");
      val.Decisions.forEach((d, idx) => {
        printLines([`${idx + 1}. ${d.DecisionDate}: ${d.DecisionContent}`]);
      });
    } else {
      printSectionTitle("* Decisions: Nenhuma");
    }

    y += 5;

    // Parties
    if (val.Parties?.length) {
      printSectionTitle("* Parties:");
      val.Parties.forEach((p, idx) => {
        const line = `${idx + 1}. ${p.Name} (${p.Type}, Polaridade: ${p.Polarity}, Ativo: ${p.IsPartyActive ? "Sim" : "Não"}, Inferência: ${p.IsInference ? "Sim" : "Não"}, Doc: ${p.Doc})`;
        printLines([line]);
      });
    } else {
      printSectionTitle("* Parties: Nenhuma");
    }

    y += 5;

    // Updates
    if (val.Updates?.length) {
      printSectionTitle("* Updates:");
      val.Updates.forEach((u, idx) => {
        const line = `${idx + 1}. ${u.PublishDate}: ${u.Content}`;
        printLines([line]);
      });
    } else {
      printSectionTitle("* Updates: Nenhuma");
    }

    y += 10;
  });

  doc.save("relatorio-consulta-completo.pdf");
};

    

const MAX_CELL_LENGTH = 30000;

const truncateCell = (text: string) => {
  if (!text) return "Não informado";
  return text.length > MAX_CELL_LENGTH
    ? text.slice(0, MAX_CELL_LENGTH) + " ... (truncado)"
    : text;
};

const handleDownloadExcel = () => {
  if (!dataReceive) return;

  // ✅ 1. Planilha principal
  const processSheetData = dataReceive.Processes.Lawsuits.map(val => ({
    "Nº Processo": val.Number,
    "Assunto Principal": truncateCell(val.MainSubject),
    "Status": truncateCell(val.Status),
    "Última Atualização": truncateCell(val.LastUpdate),
    "Nome do Tribunal": truncateCell(val.CourtName),
    "Tipo do Tribunal": truncateCell(val.CourtType),
    "Nível do Tribunal": truncateCell(val.CourtLevel),
    "Corpo Julgador": truncateCell(val.JudgingBody),
    "Estado": truncateCell(val.State),
    "Tipo": truncateCell(val.Type),
    "Distrito Judicial": truncateCell(val.CourtDistrict),
    "Assunto CNJ Amplo Inferido": truncateCell(val.InferredBroadCNJSubjectName),
    "Número do Assunto CNJ Amplo Inferido": val.InferredBroadCNJSubjectNumber,
    "Tipo de Procedimento CNJ Inferido": truncateCell(val.InferredCNJProcedureTypeName),
    "Número do Tipo de Procedimento CNJ Inferido": val.InferredCNJProcedureTypeNumber,
    "Assunto CNJ Inferido": truncateCell(val.InferredCNJSubjectName),
    "Número do Assunto CNJ Inferido": val.InferredCNJSubjectNumber,
    "Último Movimento": truncateCell(val.LastMovementDate),
    "Idade do Processo (dias)": val.LawSuitAge,
    "Serviço Hospedeiro": truncateCell(val.LawsuitHostService),
    "Tipo de Correspondência": truncateCell(val.LawsuitMatchType),
    "Data de Notificação": truncateCell(val.NoticeDate),
    "Número de Páginas": val.NumberOfPages,
    "Número de Partes": val.NumberOfParties,
    "Número de Atualizações": val.NumberOfUpdates,
    "Número de Volumes": val.NumberOfVolumes,
    "Data de Captura": truncateCell(val.CaptureDate),
    "Valor": val.Value != null ? `R$ ${val.Value.toFixed(2)}` : "Não informado",
    "Motivo de Dados Ocultos": val.ReasonForConcealedData,
  }));

  // ✅ 2. Decisions
  const decisionsSheetData = dataReceive.Processes.Lawsuits.flatMap(val =>
    (val.Decisions || []).map(decision => ({
      "Nº Processo": val.Number,
      "Decision Content": truncateCell(decision.DecisionContent),
      "Decision Date": truncateCell(decision.DecisionDate),
    }))
  );

  // ✅ 3. Parties
  const partiesSheetData = dataReceive.Processes.Lawsuits.flatMap(val =>
    (val.Parties || []).map(party => ({
      "Nº Processo": val.Number,
      "Nome": truncateCell(party.Name),
      "Tipo": truncateCell(party.Type),
      "Polaridade": truncateCell(party.Polarity),
      "Inferência": party.IsInference ? "Sim" : "Não",
      "Ativo": party.IsPartyActive ? "Sim" : "Não",
      "Tipo Específico": truncateCell(party.PartyDetails?.SpecificType ?? "Não informado"),
      "Última Captura": truncateCell(party.LastCaptureDate),
      "Documento": truncateCell(party.Doc),
    }))
  );

  // ✅ 4. Updates
  const updatesSheetData = dataReceive.Processes.Lawsuits.flatMap(val =>
    (val.Updates || []).map(update => ({
      "Nº Processo": val.Number,
      "Conteúdo": truncateCell(update.Content),
      "Data de Publicação": truncateCell(update.PublishDate),
      "Data de Captura": truncateCell(update.CaptureDate),
    }))
  );

  // ✅ Workbook
  const workbook = XLSX.utils.book_new();

  const processSheet = XLSX.utils.json_to_sheet(processSheetData);
  XLSX.utils.book_append_sheet(workbook, processSheet, "Consultas");

  if (decisionsSheetData.length > 0) {
    const decisionsSheet = XLSX.utils.json_to_sheet(decisionsSheetData);
    XLSX.utils.book_append_sheet(workbook, decisionsSheet, "Decisions");
  }

  if (partiesSheetData.length > 0) {
    const partiesSheet = XLSX.utils.json_to_sheet(partiesSheetData);
    XLSX.utils.book_append_sheet(workbook, partiesSheet, "Parties");
  }

  if (updatesSheetData.length > 0) {
    const updatesSheet = XLSX.utils.json_to_sheet(updatesSheetData);
    XLSX.utils.book_append_sheet(workbook, updatesSheet, "Updates");
  }

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const data = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8"
  });
  saveAs(data, "relatorio-consulta-completo.xlsx");
};




    const onCloseDecisionModal = () => {
      setDecisionData(null);
    }

    const onClosePartiesModal = () => {
      setPartiesData(null);
    }

    const onCloseUpdatesModal = () => {
      setUpdatesData(null);
    }

    return (
        <section>
            <hr className="my-5"/>
                {decisionData && <DecisionModal decision={decisionData} onClose={onCloseDecisionModal}/>}
                {partiesData && <PartiesModal parties={partiesData} onClose={onClosePartiesModal} />}
                {updatesData && <UpdatesModal updates={updatesData} onClose={onCloseUpdatesModal} />}

                <div className="my-5">
                    <h1 className="font-bold text-2xl">Cada página retorna no máximo 30 a 500 processos.</h1>
                    <p>Se precisar ver mais processos, aperte no botão de próxima página</p>
                </div>
                <section>
                    {data && (
                      <div>
                        {/* GRID DE CARDS COM MÉTRICAS */}
                        <div className="grid md:grid-cols-4 md:grid-rows-2 gap-5">
                          <div className="bg-secondColor text-white p-2 rounded-md">
                            <h1>Total Processos:</h1>
                            <h1 className="text-3xl font-bold">
                              {data?.Processes?.TotalLawsuits ?? "Não informado"}
                            </h1>
                          </div>
                          <div className="bg-secondColor text-white p-2 rounded-md">
                            <h1>Processos como Autor:</h1>
                            <h1 className="text-3xl font-bold">
                              {data?.Processes?.TotalLawsuitsAsAuthor ?? "Não informado"}
                            </h1>
                          </div>
                          <div className="bg-secondColor text-white p-2 rounded-md">
                            <h1>Processos como Defensor:</h1>
                            <h1 className="text-3xl font-bold">
                              {data?.Processes?.TotalLawsuitsAsDefendant ?? "Não informado"}
                            </h1>
                          </div>
                          <div className="bg-secondColor text-white p-2 rounded-md">
                            <h1>Total processos com Outros:</h1>
                            <h1 className="text-3xl font-bold">
                              {data?.Processes?.TotalLawsuitsAsOther ?? "Não informado"}
                            </h1>
                          </div>
                          <div className="bg-secondColor text-white p-2 rounded-md">
                            <h1>Últimos 180 dias:</h1>
                            <h1 className="text-3xl font-bold">
                              {data?.Processes?.Last180DaysLawsuits ?? "Não informado"}
                            </h1>
                          </div>
                          <div className="bg-secondColor text-white p-2 rounded-md">
                            <h1>Últimos 30 dias:</h1>
                            <h1 className="text-3xl font-bold">
                              {data?.Processes?.Last30DaysLawsuits ?? "Não informado"}
                            </h1>
                          </div>
                          <div className="bg-secondColor text-white p-2 rounded-md">
                            <h1>Últimos 365 dias:</h1>
                            <h1 className="text-3xl font-bold">
                              {data?.Processes?.Last365DaysLawsuits ?? "Não informado"}
                            </h1>
                          </div>
                          <div className="bg-secondColor text-white p-2 rounded-md">
                            <h1>Últimos 90 dias:</h1>
                            <h1 className="text-3xl font-bold">
                              {data?.Processes?.Last90DaysLawsuits ?? "Não informado"}
                            </h1>
                          </div>
                        </div>
                    
                        {/* TABELA DE PROCESSOS */}
                        <div className="overflow-x-auto rounded-lg border my-5">
                          <table className="min-w-[1000px] w-full text-sm text-left border-collapse">
                            <thead className="bg-secondColor text-white">
                              <tr>
                                <th className="px-4 py-2">Desisões</th>
                                <th className="px-4 py-2">Parties</th>
                                <th className="px-4 py-2">Atualizações</th>


                                <th className="px-4 py-2">Última Atualização</th>
                                <th className="px-4 py-2 min-w-[500px]">Assunto Principal</th>
                                <th className="px-4 py-2">Número do Processo</th>
                                <th className="px-4 py-2">Status</th>
                                <th className="px-4 py-2">Nome do Tribunal</th>
                                <th className="px-4 py-2">Nível do Tribunal</th>
                                <th className="px-4 py-2">Tipo de Tribunal</th>
                                <th className="px-4 py-2 min-w-[300px]">Corpo Julgador</th>
                                <th className="px-4 py-2">Estado</th>
                                <th className="px-4 py-2">Tipo</th>
                                <th className="px-4 py-2">Distrito Judicial</th>
                                <th className="px-4 py-2">Assunto CNJ Amplo Inferido</th>
                                <th className="px-4 py-2">Número do Assunto CNJ Amplo Inferido</th>
                                <th className="px-4 py-2">Tipo de Procedimento CNJ Inferido</th>
                                <th className="px-4 py-2">Número do Tipo de Procedimento CNJ Inferido</th>
                                <th className="px-4 py-2">Assunto CNJ Inferido</th>
                                <th className="px-4 py-2">Número do Assunto CNJ Inferido</th>
                                <th className="px-4 py-2">Último Movimento</th>
                                <th className="px-4 py-2">Idade do Processo (dias)</th>
                                <th className="px-4 py-2">Serviço Hospedeiro</th>
                                <th className="px-4 py-2">Tipo de Correspondência</th>
                                <th className="px-4 py-2">Data de Notificação</th>
                                <th className="px-4 py-2">Número de Páginas</th>
                                <th className="px-4 py-2">Número de Partes</th>
                                <th className="px-4 py-2">Número de Atualizações</th>
                                <th className="px-4 py-2">Número de Volumes</th>
                                <th className="px-4 py-2">Data de Captura</th>
                                <th className="px-4 py-2">Valor</th>
                                <th className="px-4 py-2">Motivo de Dados Ocultos</th>
                              </tr>
                            </thead>
                            <tbody>
                              {dataReceive && dataReceive?.Processes?.Lawsuits?.length > 0 ? (
                                dataReceive.Processes.Lawsuits.map((val, i) => (
                                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-blueColor/10"}>
                                    <td
                                      className="px-4 py-2"
                                    >
                                      <button
                                        onClick={() => setDecisionData(val.Decisions)}
                                        className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-blue-100 text-blue-600 font-semibold                                     text-sm hover:bg-blue-200 transition cursor-pointer"
                                        title="Ver decisões"
                                      >
                                        {val?.Decisions?.length || 0}
                                      </button>
                                    </td>

                                    <td
                                      className="px-4 py-2"
                                    >
                                      <button
                                        onClick={() => setPartiesData(val.Parties)}
                                        className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-green-100 text-green-600 font-semibold                                     text-sm hover:bg-green-200 transition cursor-pointer"
                                        title="Ver partes"
                                      >
                                        {val?.Parties?.length || 0}
                                      </button>
                                    </td>

                                    <td
                                      className="px-4 py-2"
                                    >
                                      <button
                                        onClick={() => setUpdatesData(val.Updates)}
                                        className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-purple-100 text-purple-600 font-semibold                                     text-sm hover:bg-purple-200 transition cursor-pointer"
                                        title="Ver atualizações"
                                      >
                                        {val?.Updates?.length || 0}
                                      </button>
                                    </td>

                              


                                    <td className="px-4 py-2">{formatDateBR(val?.LastUpdate) ?? "Não informado"}</td>
                                    <td className="px-4 py-2">{val?.MainSubject ?? "Não informado"}</td>
                                    <td className="px-4 py-2">{val?.Number ?? "Não informado"}</td>
                                    <td className="px-4 py-2">{val?.Status ?? "Não informado"}</td>
                                    <td className="px-4 py-2">{val?.CourtName ?? "Não informado"}</td>
                                    <td className="px-4 py-2">{val?.CourtLevel ?? "Não informado"}</td>
                                    <td className="px-4 py-2">{val?.CourtType ?? "Não informado"}</td>
                                    <td className="px-4 py-2">{val?.JudgingBody ?? "Não informado"}</td>
                                    <td className="px-4 py-2">{val?.State ?? "Não informado"}</td>
                                    <td className="px-4 py-2">{val?.Type ?? "Não informado"}</td>
                                    <td className="px-4 py-2">{val?.CourtDistrict ?? "Não informado"}</td>
                                    <td className="px-4 py-2">{val?.InferredBroadCNJSubjectName ?? "Não informado"}</td>
                                    <td className="px-4 py-2">{val?.InferredBroadCNJSubjectNumber ?? "Não informado"}</td>
                                    <td className="px-4 py-2">{val?.InferredCNJProcedureTypeName ?? "Não informado"}</td>
                                    <td className="px-4 py-2">{val?.InferredCNJProcedureTypeNumber ?? "Não informado"}</td>
                                    <td className="px-4 py-2">{val?.InferredCNJSubjectName ?? "Não informado"}</td>
                                    <td className="px-4 py-2">{val?.InferredCNJSubjectNumber ?? "Não informado"}</td>
                                    <td className="px-4 py-2">{formatDateBR(val?.LastMovementDate) ?? "Não informado"}</td>
                                    <td className="px-4 py-2">{val?.LawSuitAge ?? "Não informado"}</td>
                                    <td className="px-4 py-2">{val?.LawsuitHostService ?? "Não informado"}</td>
                                    <td className="px-4 py-2">{val?.LawsuitMatchType ?? "Não informado"}</td>
                                    <td className="px-4 py-2">{formatDateBR(val?.NoticeDate) ?? "Não informado"}</td>
                                    <td className="px-4 py-2">{val?.NumberOfPages ?? "Não informado"}</td>
                                    <td className="px-4 py-2">{val?.NumberOfParties ?? "Não informado"}</td>
                                    <td className="px-4 py-2">{val?.NumberOfUpdates ?? "Não informado"}</td>
                                    <td className="px-4 py-2">{val?.NumberOfVolumes ?? "Não informado"}</td>
                                    <td className="px-4 py-2">{formatDateBR(val?.CaptureDate) ?? "Não informado"}</td>
                                    <td className="px-4 py-2">{val?.Value != null ? `R$${val.Value.toFixed(2)}` : "Não informado"}</td>
                                    <td className="px-4 py-2">{val?.ReasonForConcealedData ?? "Não informado"}</td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={29} className="text-center py-4">
                                    Nenhum processo encontrado.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>

                            
                        {/* BOTÕES */}
                        <div className="flex gap-2 mt-4">
                          {dataReceive?.Processes?.NextPageId && (
                            <button
                              disabled={loadingNext}
                              onClick={nextPageClick}
                              className="bg-blue-500 disabled:bg-gray-600 p-2 rounded-md text-white"
                            >
                              {loadingNext ? (
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                              ) : (
                                "Próxima Página"
                              )}
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
        </section>
    );
};
