"use client";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User2 } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

const schema = z.object({
  title: z.string().nonempty(),
  cpfCnpj: z.string().min(11).max(14),
});

type FormData = z.infer<typeof schema>;

// type ProcessStatus = {
//   Code: number;
//   Message: string;
// };

// type Status = {
//   processes: ProcessStatus[];
// };

type LawsuitData = {
  Last30DaysLawsuits: number;
  Last90DaysLawsuits: number;
  Last180DaysLawsuits: number;
  Last365DaysLawsuits: number;
  TotalLawsuits: number;
  TotalLawsuitsAsAuthor: number;
  TotalLawsuitsAsDefendant: number;
  TotalLawsuitsAsOther: number;
};

type ResultItem = {
  MatchKeys: string;
  Processes?: LawsuitData;
  Lawsuits?: LawsuitData;
};

type ApiResponse = {
  data: ResultItem;
  saveInDb: {
        customer_Id: string;
        custom_name: string;
        document: string;
        queryDate: Date | string; 
        queryId: string
        type_consultation: string;
        result: string;
        id: string;
  }
};

export const Consultation = () => {
  const { register, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const [loading, setLoading] = useState(false);
  const [consultation, setConsultation] = useState<ApiResponse | null>(null);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setConsultation(null);
    try {
      const response = await fetch(`/api/consulta`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          q: `doc{${data.cpfCnpj}}`,
          Datasets: "processes.limit(10)",
          Limit: 1,
          custom_name: data.title
        }),
      });
      const result: ApiResponse = await response.json();
      console.log(result.saveInDb);
      setConsultation(result);
    } catch (e) {
      console.error("Erro ao buscar dados:", e);
    } finally {
      setLoading(false);
    }
  };

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
          <h2>Insira um CPF/CNPJ: (somente números)</h2>
          <input  {...register("cpfCnpj")} placeholder="12345678910" className="border text-white w-full p-3 rounded-lg border-white bg-black/10" />
        </div>

        <button type="submit" className="mt-7 bg-blue-500 text-white p-2 rounded-md flex items-center justify-center" disabled={loading}>
          {loading ? <span className="animate-spin h-5 w-5 mr-3 border-t-2 border-white rounded-full" /> : "Consultar"}
        </button>

        {consultation && (
          <Link href={`/lista-consultas/${consultation.saveInDb.id}`}>Clique aqui pra visualizar a consulta. /lista-consultas/{consultation.saveInDb.id}</Link>
        )}
      </form>
    </div>
  );
};