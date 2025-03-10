"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
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

type FormData = z.infer<typeof schema>

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

            console.log(response.data);
            setData(response.data);
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full flex mt-10 items-center justify-center flex-col">
            <form onSubmit={handleSubmit(onSubmit)} className="flex md:max-w-[700px] w-full items-center justify-center flex-col">
                <div className="w-full">
                    <h1>Digite o CNPJ que deseja consultar:</h1>
                    <input {...register("cnpj")}  type="text" name="cnpj" placeholder="12345678910111" className="bg-secondColor border md:p-3 p-2 outline-none rounded-md w-full"/>
                    {errors.cnpj && <p className="text-red-500">Deve conter no min. 14 caracteres e no máximo 18.</p>}
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
                    <div className="bg-blue-950 text-white rounded-md p-5">
                        <h1 className="text-xl font-bold">Dados Básicos</h1>
                        
                        <div className="mt-5">
                            <h1><b>Razão Social:</b> {data?.informationCompany.razao}</h1>
                            <h1><b>CNPJ:</b> {data?.informationCompany.cnpj}</h1>
                            <h1><b>Nome Fantasia:</b> {data?.informationCompany.fantasia || "Não informado"}</h1>
                            <h1><b>Natureza Jurídica:</b> {data?.informationCompany.natureza_juridica}</h1>
                            <h1><b>Regime Tributário:</b> {data?.informationCompany.regime_tributario}</h1>
                            <h1><b>Funcionários:</b> {data?.informationCompany.quadro_funcionarios}</h1>
                            <h1><b>Cnae Principal:</b> {data?.informationCompany.cnae_principal}</h1>
                            <h1><b>Cnae Secundário:</b> {data?.informationCompany.cnae_secundario || "Não informado"}</h1>
                            <h1>
                                <b>Data de abertura: </b> 
                                {data?.informationCompany.data_abertura &&
                                `${data.informationCompany.data_abertura.slice(6, 8)}/${data.informationCompany.data_abertura.slice(4, 6)}/${data.informationCompany.data_abertura.slice(0, 4)}`}
                            </h1>
                            <h1><b>Capital Social:</b> {data?.informationCompany.capital_social || "Não informado"}</h1>
                            <h1><b>Faturamento:</b> {data?.informationCompany.faturamento || "Não informado"}</h1>

                            <h1 className="my-3 text-xl font-bold">Contatos e Endereços</h1>
                            
                            <h1><b>Email: </b> {data?.informationCompany.email || "Não informado"}</h1>
                            <h1><b>Telefone 1: </b> {data?.informationCompany.tel_1 || "Não informado"}</h1>
                            <h1><b>Telefone 2: </b> {data?.informationCompany.tel_2 || "Não informado"}</h1>
                            <h1><b>Cidade: </b> {data?.informationCompany.log_municipio || "Não informado"}</h1>
                            <h1><b>CEP: </b> {data?.informationCompany.log_cep || "Não informado"}</h1>
                            <h1><b>Bairro: </b> {data?.informationCompany.log_bairro || "Não informado"}</h1>
                            <h1><b>Número: </b> {data?.informationCompany.log_num || "Não informado"}</h1>
                            <h1><b>Tipo: </b> {data?.informationCompany.log_tipo || "Não informado"}</h1>
                            <h1><b>Nome: </b> {data?.informationCompany.log_nome || "Não informado"}</h1>
                            <h1><b>UF: </b> {data?.informationCompany.log_uf || "Não informado"}</h1>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
};