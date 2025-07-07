"use client";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { ViewConsultationBussiness } from "./_components/view-consultation-bussiness";
import { ViewConsultationPerson } from "./_components/view-consultation-person";
import { DataCompanyTypes } from "@/types/ConsultationCompanyTypes";
import { DataPersonTypes } from "@/types/ConsultationPersonTypes";


const schema = z.object({
  custom_name: z.string().nonempty("O nome não pode estar vazio"),
  doc: z
    .string()
    .refine(value => {
      // Aceita CNPJ ou CPF com ou sem formatação
      const cleanedValue = value.replace(/[^\d]/g, ""); // Remove tudo que não for dígito
      return cleanedValue.length === 11 || cleanedValue.length === 14;
    }, "Documento inválido")
    .transform(value => value.replace(/[^\d]/g, "")), // Remove tudo que não for dígito
});

type FormData = z.infer<typeof schema>;

export default function ConsultationPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const [loading, setLoading] = useState<boolean>(false);
  const [dataBussiness, setDataBussiness] = useState<DataCompanyTypes | null>(null);
  const [dataPerson, setDataPerson] = useState<DataPersonTypes | null>(null);

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      const cleanedData = {
        ...data,
        doc: data.doc.replace(/[^\d]/g, ""), // Remove pontos e barras do documento
      };

      const response = await fetch("/api/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanedData),
      });

      const result = await response.json();

      if (data.doc.length === 14) {
        console.log(result.consultationBusiness?.Result[0]);
        setDataBussiness(result.consultationBusiness?.Result[0]);
        setDataPerson(null);
      } else if (data.doc.length === 11) {
        console.log(result.personConsultation?.Result[0]);
        setDataPerson(result.personConsultation?.Result[0]);
        setDataBussiness(null);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="md:ml-[250px] ml-[50px] p-5">
      <div className="w-full flex flex-col mt-10 items-center justify-center">

        <div className="text-center">
          <h1 className="text-5xl font-bold">Solicitar Nova Consulta</h1>
          <p className="text-xl">Coloque cpf ou cnpj para verificar históricos de processos judiciais.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-10 flex flex-col md:max-w-[700px] w-full gap-5">
          <div>
            <h1>Adicione um nome para identificar a consulta</h1>
            <input
              className="text-white outline-none bg-secondColor rounded-md md:p-3 p-2 w-full"
              {...register("custom_name")}
              type="text"
              placeholder="Nome customizado"
            />
            {errors.custom_name && <p className="text-red-500">{errors.custom_name.message}</p>}
          </div>
          <div>
            <h1>
              Digite o documento
            </h1>
            <input
              className="text-white outline-none bg-secondColor rounded-md md:p-3 p-2 w-full"
              {...register("doc")}
              type="text"
              placeholder="000.000.000-00 ou 00000000000"
            />
            {errors.doc && <p className="text-red-500">{errors.doc.message}</p>}
          </div>
          <button
            disabled={loading}
            className="bg-blue-500 w-full text-xl font-bold disabled:bg-gray-600 flex items-center justify-center text-white p-2 rounded"
            type="submit"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
            ) : (
              "Consultar"
            )}
          </button>
        </form>
      </div>
      <div className="flex flex-col gap-3 mt-8">
        {(dataBussiness && !dataPerson) && <ViewConsultationBussiness data={dataBussiness} />}
        {(dataPerson && !dataBussiness) && <ViewConsultationPerson data={dataPerson} />}
      </div>
    </div>
  );
}
