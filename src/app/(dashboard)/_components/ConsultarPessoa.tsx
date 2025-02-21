"use client";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User2 } from "lucide-react";
import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const schema = z.object({
  title: z.string().nonempty(),
  cpf: z.string().min(11).max(11),
});

type FormData = z.infer<typeof schema>;

type ProcessStatus = {
  Code: number;
  Message: string;
};

type Status = {
  processes: ProcessStatus[];
};

type LawsuitData = {
  Last30DaysLawsuits: number;
  Last90DaysLawsuits: number;
  Last180DaysLawsuits: number;
  Last365DaysLawsuits: number;
  TotalLawsuits: number;
  TotalLawsuitsAsAuthor: number;
  TotalLawsuitsAsDefendant: number;
  TotalLawsuitsAsOther: number;
  Lawsuits?: unknown[]; // Substituir por tipagem específica caso necessário
};

type ResultItem = {
  MatchKeys: string;
  Processes: LawsuitData;
};

type ApiResponse = {
  Result: ResultItem[];
  QueryId: string;
  ElapsedMilliseconds: number;
  QueryDate: string;
  Status: Status;
};

// const dadosFicticios = {
//     Result: [
//         {
//             MatchKeys: "12345678910",
//             Processes: {
//                 Last30DaysLawsuits: 5,
//                 Last90DaysLawsuits: 10,
//                 Last180DaysLawsuits: 15,
//                 Last365DaysLawsuits: 20,
//                 TotalLawsuits: 50,
//                 TotalLawsuitsAsAuthor: 25,
//                 TotalLawsuitsAsDefendant: 20,
//                 TotalLawsuitsAsOther: 5,
//             },
//         },
//     ],
//     QueryId: "dummy-query-id",
//     ElapsedMilliseconds: 123,
//     QueryDate: new Date().toISOString(),
//     Status: {
//         processes: [
//             {
//                 Code: 200,
//                 Message: "Success",
//             },
//         ],
//     },
// }

export const FormConPessoa = () => {
  const { register, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const [loading, setLoading] = useState(false);
const [consultation, setConsultation] = useState<ApiResponse | null>(null);
  const pdfRef = useRef<HTMLDivElement>(null);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_BIGDATA}/pessoas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          TokenId: process.env.NEXT_PUBLIC_TOKEN_ID || "",
          AccessToken: process.env.NEXT_PUBLIC_ACCESS_TOKEN || "",
          accept: "application/json",
        },
        body: JSON.stringify({
          q: `doc{${data.cpf}}`,
          Datasets: "processes",
          Limit: 1,
        }),
      });

      const result: ApiResponse = await response.json();
      setConsultation(result);
    } catch (e) {
      console.error("Erro ao buscar dados:", e);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    if (!pdfRef.current) return;

    const canvas = await html2canvas(pdfRef.current);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save("ConsultaProcessos.pdf");
  };

  function formatarCPF(cpf: string) {
    return cpf
        .replace(/\D/g, '') // Remove todos os caracteres não numéricos
        .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'); // Formata o CPF
}

  return (
    <div className="flex items-center justify-center flex-col w-full">
      <div className="flex items-center justify-center flex-col">
        <User2 size={40} />
        <h1 className="text-3xl font-bold my-2">Consultar processos de pessoas</h1>
        <p>Descubra todos os processos já distribuídos no passado até a data atual</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="md:min-w-[500px] mt-5 flex flex-col">
        <div>
          <h2>Identificação Personalizada:</h2>
          <input {...register("title")} placeholder="Escolha uma identificação para consulta" className="border text-white w-full p-3 rounded-lg border-white bg-black/10" />
        </div>

        <div className="mt-5">
          <h2>Insira um CPF: (somente números)</h2>
          <input  {...register("cpf")} placeholder="12345678910" className="border text-white w-full p-3 rounded-lg border-white bg-black/10" />
        </div>

        <button type="submit" className="mt-7 bg-blue-500 text-white p-2 rounded-md flex items-center justify-center" disabled={loading}>
          {loading ? <span className="animate-spin h-5 w-5 mr-3 border-t-2 border-white rounded-full" /> : "Consultar"}
        </button>
      </form>

      <div className="w-full my-10">
        <hr className="w-full" />
        {consultation ? (
          <div>
            <button onClick={generatePDF} className="mt-4 bg-green-500 text-white px-4 py-2 rounded">
              Baixar PDF
            </button>
            <div ref={pdfRef} className="bg-white p-3 rounded-md text-black mt-5">
              <h1 className="text-2xl font-bold my-5">Processos listados do CPF: {formatarCPF(consultation.Result[0]?.MatchKeys) || 0}</h1>
              <div>
                <div className="bg-gray-100 p-4 rounded-lg shadow-md">
                    <h1>Documento: {formatarCPF(consultation.Result[0]?.MatchKeys) || "XXXXXXXXXXX"}</h1>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-100 p-4 rounded-lg shadow-md">
                        <h1>Total de Ações Judiciais: {consultation.Result[0]?.Processes.TotalLawsuits || 0}</h1>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg shadow-md">
                        <h1>Total como Autor: {consultation.Result[0]?.Processes.TotalLawsuitsAsAuthor || 0}</h1>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg shadow-md">
                        <h1>Total como Réu: {consultation.Result[0]?.Processes.TotalLawsuitsAsDefendant || 0}</h1>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg shadow-md">
                        <h1>Total como Outro: {consultation.Result[0]?.Processes.TotalLawsuitsAsOther || 0}</h1>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg shadow-md">
                        <h1>Últimos 30 dias: {consultation.Result[0]?.Processes.Last30DaysLawsuits || 0}</h1>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg shadow-md">
                        <h1>Últimos 90 dias: {consultation.Result[0]?.Processes.Last90DaysLawsuits || 0}</h1>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg shadow-md">
                        <h1>Últimos 180 dias: {consultation.Result[0]?.Processes.Last180DaysLawsuits || 0}</h1>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg shadow-md">
                        <h1>Últimos 365 dias: {consultation.Result[0]?.Processes.Last365DaysLawsuits || 0}</h1>
                    </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full text-center my-10">
            <h1 className="text-xl opacity-25">Faça a consulta para os dados aparecerem aqui!</h1>
          </div>
        )}
      </div>
    </div>
  );
};