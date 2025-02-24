"use client";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  custom_name: z.string().nonempty("O nome não pode estar vazio"),
  doc: z.string().min(11, "Documento deve ter no mínimo 14 caracteres").max(19, "Documento deve ter no máximo 19 caracteres"),
});

type FormData = z.infer<typeof schema>;

export default function ConsultationPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch("/api/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log(result);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="md:ml-[200px] ml-[50px] p-5">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <h1>Adicione um nome para identificar a consulta</h1>
          <input className="text-black border p-2 w-full" {...register("custom_name")} type="text" placeholder="Nome customizado" />
          {errors.custom_name && <p className="text-red-500">{errors.custom_name.message}</p>}
        </div>

        <div>
          <h1>Digite o documento <b className="text-red-500">(Somente Números)</b></h1>
          <input className="text-black border p-2 w-full" {...register("doc")} type="text" placeholder="123456789101112" />
          {errors.doc && <p className="text-red-500">{errors.doc.message}</p>}
        </div>

        <button className="bg-blue-500 text-white p-2 rounded" type="submit">
          Consultar
        </button>
      </form>
    </div>
  );
}
