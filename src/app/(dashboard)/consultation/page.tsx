"use client";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SearchCheck, ScreenShareIcon } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { ViewConsultationTemporary } from "./_components/view-consultation-temporary";
import { DataJsonTypes } from "../view-consultation/[id]/_components/ViewBussiness";

const schema = z.object({
  custom_name: z.string().nonempty("O nome não pode estar vazio"),
  doc: z.string().min(11, "Documento deve ter no mínimo 11 caracteres").max(14, "Documento deve ter no máximo 14 caracteres"),
});

type FormData = z.infer<typeof schema>;

export default function ConsultationPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });
  const [ loading, setLoading ] = useState<boolean>(false);
  const [ idSaved, setIdSaved ] = useState<string | null>(null);
  const [ data, setData ] = useState<DataJsonTypes | null>(null);

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      const response = await fetch("/api/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log(result.consultationBusiness.Result[0]);
      setData(result.consultationBusiness.Result[0]);
      setIdSaved(result.saveInDb.id);
    } catch (e) {
      console.log(e);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="md:ml-[200px] ml-[50px] p-5 px-10">
      <div className="w-full flex items-center justify-center">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-center justify-center flex-col">
            <SearchCheck size={50} className="my-5 text-3xl"/>
            <h1 className="text-3xl">Nova consulta de processos</h1>
            <p>Descubra todos os processos relacionados ao documento consultado.</p>
          </div>
          <div>
            <h1>Adicione um nome para identificar a consulta</h1>
            <input className="text-black border rounded-md p-2 w-full" {...register("custom_name")} type="text" placeholder="Nome customizado" />
            {errors.custom_name && <p className="text-red-500">{errors.custom_name.message}</p>}
          </div>

          <div>
            <h1>Digite o documento <b className="text-red-500">(Somente Números)</b></h1>
            <input className="text-black border rounded-md p-2 w-full" {...register("doc")} type="text" placeholder="123456789101112" />
            {errors.doc && <p className="text-red-500">{errors.doc.message}</p>}
          </div>

          <button disabled={loading} className="bg-blue-500 w-full disabled:bg-gray-600 flex items-center justify-center text-white p-2 rounded" type="submit">
            {loading ? <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div> : "Consultar"}
          </button>

          <div>
            {idSaved && (
              <Link className="text-blue-500 font-bold my-5 flex items-center gap-2" href={`/view-consultation/${idSaved}`}>
                Visualizar consulta
                <ScreenShareIcon />
              </Link>
            )}
          </div>
        </form>

      </div>
      {data && (
        <ViewConsultationTemporary data={data} />
      )}
    </div>
  );
}
