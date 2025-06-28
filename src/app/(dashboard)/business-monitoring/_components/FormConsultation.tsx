"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

interface DataCompany {
  capital_social: string;
  cnae_principal: string;
  cnae_secundario: string | null;
  cnpj: string;
  data_abertura: string;
  data_exc_mei: string;
  data_exc_simples: string;
  data_mei: string;
  data_simples: string | null;
  data_sit_cad: string;
  ddd_1: string;
  ddd_2: string | null;
  email: string;
  fantasia: string | null;
  faturamento: string;
  log_bairro: string;
  log_cep: string;
  log_comp: string | null;
  log_municipio: string;
  log_nome: string;
  log_num: string;
  log_tipo: string;
  log_uf: string;
  matriz: string;
  natureza_juridica: string;
  opcao_mei: string;
  opcao_simples: string;
  porte: string;
  quadro_funcionarios: string;
  razao: string;
  regime_tributario: string;
  site: string | null;
  situacao_cadastral: string;
  tel_1: string;
  tel_2: string | null;
}

interface ResponseData {
  informationCompany: DataCompany;
}

const schema = z.object({
  cnpj: z.string().nonempty().min(14).max(18)
});

type FormData = z.infer<typeof schema>;

export const FormConsultation = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema)
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<ResponseData | null>(null);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const cleanedCnpj = data.cnpj.replace(/\D/g, "");
    try {
      const response = await axios.post("/api/information-company", {
        cnpj: cleanedCnpj
      });
      setData(response.data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex mt-10 items-center justify-center flex-col">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex md:max-w-[700px] w-full items-center justify-center flex-col"
      >
        <div className="w-full">
          <h1 className="mb-2 font-semibold">Digite o CNPJ que deseja consultar:</h1>
          <input
            {...register("cnpj")}
            type="text"
            placeholder="12345678910111"
            className="bg-white border md:p-3 p-2 outline-none rounded-md w-full"
          />
          {errors.cnpj && (
            <p className="text-red-500 mt-1">
              Deve conter no mínimo 14 caracteres e no máximo 18.
            </p>
          )}
        </div>

        <button className="bg-blueColor text-xl font-bold w-full text-white p-2 my-5 rounded-md">
          {loading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
          ) : (
            "Consultar Empresa"
          )}
        </button>
      </form>

      {data && (
        <div className="w-full bg-white rounded-md text-black p-5">
          <h1 className="text-xl font-bold mb-4">Dados da Empresa</h1>
          <div className="overflow-x-auto rounded-md border">
            <table className="min-w-full border-collapse text-sm table-auto">
              <tbody>
                {[
                  { label: "CNPJ", value: data.informationCompany.cnpj },
                  { label: "Razão Social", value: data.informationCompany.razao },
                  { label: "Nome Fantasia", value: data.informationCompany.fantasia },
                  { label: "Natureza Jurídica", value: data.informationCompany.natureza_juridica },
                  { label: "Regime Tributário", value: data.informationCompany.regime_tributario },
                  { label: "Porte", value: data.informationCompany.porte },
                  { label: "Situação Cadastral", value: data.informationCompany.situacao_cadastral },
                  { label: "Matriz", value: data.informationCompany.matriz },
                  { label: "Opção MEI", value: data.informationCompany.opcao_mei },
                  { label: "Opção Simples", value: data.informationCompany.opcao_simples },
                  { label: "CNAE Principal", value: data.informationCompany.cnae_principal },
                  { label: "CNAE Secundário", value: data.informationCompany.cnae_secundario },
                  { label: "Capital Social", value: data.informationCompany.capital_social },
                  { label: "Faturamento", value: data.informationCompany.faturamento },
                  { label: "Quantidade de Funcionários", value: data.informationCompany.quadro_funcionarios },
                  {
                    label: "Data de Abertura",
                    value: data.informationCompany.data_abertura
                      ? `${data.informationCompany.data_abertura.slice(6,8)}/${data.informationCompany.data_abertura.slice(4,6)}/${data.informationCompany.data_abertura.slice(0,4)}`
                      : ""
                  },
                  { label: "Data Exclusão MEI", value: data.informationCompany.data_exc_mei },
                  { label: "Data Exclusão Simples", value: data.informationCompany.data_exc_simples },
                  { label: "Data MEI", value: data.informationCompany.data_mei },
                  { label: "Data Simples", value: data.informationCompany.data_simples },
                  { label: "Data Situação Cadastral", value: data.informationCompany.data_sit_cad },
                  { label: "DDD 1", value: data.informationCompany.ddd_1 },
                  { label: "DDD 2", value: data.informationCompany.ddd_2 },
                  { label: "Telefone 1", value: data.informationCompany.tel_1 },
                  { label: "Telefone 2", value: data.informationCompany.tel_2 },
                  { label: "Email", value: data.informationCompany.email },
                  {
                    label: "Site",
                    value: data.informationCompany.site
                      ? <Link
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                          href={data.informationCompany.site.startsWith('http') ? data.informationCompany.site : `https://${data.informationCompany.site}`}>
                          {data.informationCompany.site}
                        </Link>
                      : "Não informado"
                  },
                  {
                    label: "Endereço",
                    value: `${data.informationCompany.log_tipo || ""} ${data.informationCompany.log_nome || ""}, ${data.informationCompany.log_num || ""} - ${data.informationCompany.log_bairro || ""}, ${data.informationCompany.log_municipio || ""}/${data.informationCompany.log_uf || ""} - ${data.informationCompany.log_cep || ""}`
                  },
                  { label: "Complemento", value: data.informationCompany.log_comp },
                ].map((item, index) => (
                  <tr key={index} className="even:bg-gray-50 border-b">
                    <td className="px-4 py-3 font-bold text-lg text-gray-700 bg-gray-100">{item.label}</td>
                    <td className="px-4 text-lg py-3">{item.value || "Não informado"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
