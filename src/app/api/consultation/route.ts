import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const apiClient = axios.create({
    timeout: 9500,
    headers: {
        "Content-Type": "application/json",
        "TokenId": process.env.NEXT_PUBLIC_TOKEN_ID,
        "AccessToken": process.env.NEXT_PUBLIC_ACCESS_TOKEN
    }
});

export async function POST(req: NextRequest) {
    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return NextResponse.json(
                { error: true, message: "Você precisa estar logado!" },
                { status: 401 }
            );
        }

        const { doc, custom_name } = await req.json();

        if (!doc || !custom_name) {
            return NextResponse.json(
                { error: true, message: "Campos obrigatórios não preenchidos" },
                { status: 400 }
            );
        }

        let responseData;
        const cleanedValue = doc.replace(/[^\d]/g, "");

        if (doc.length === 11) {
            const [personConsultation, personBasicData] = await Promise.allSettled([
                apiClient.post(`${process.env.NEXT_PUBLIC_URL_BIGDATA}/pessoas`, {
                    Datasets: "processes.limit(50)",
                    q: `doc{${cleanedValue}}`
                }),

                apiClient.post(`${process.env.NEXT_PUBLIC_URL_BIGDATA}/pessoas`, {
                    Datasets: "basic_data",
                    q: `doc{${cleanedValue}}`
                })
            ]);

            responseData = {
                personConsultation: personConsultation.status === "fulfilled" ? personConsultation.value.data : { error: true, message: "Erro na consulta de processos" },
                personBasicData: personBasicData.status === "fulfilled" ? personBasicData.value.data : { error: true, message: "Erro na consulta de dados básicos" }
            };

        } else if (doc.length === 14) {
            const [consultationBusiness, basicDataBusiness] = await Promise.allSettled([
                apiClient.post(`${process.env.NEXT_PUBLIC_URL_BIGDATA}/empresas`, {
                    Datasets: "processes.limit(30)",
                    q: `doc{${cleanedValue}}`
                }),

                axios.get(`https://www.empresaqui.com.br/api/86b1e1c80081651781715693aa2299d93720b5d7/${cleanedValue}`, { timeout: 9500 })
            ]);

            responseData = {
                consultationBusiness: consultationBusiness.status === "fulfilled" ? consultationBusiness.value.data : { error: true, message: "Erro na consulta de processos da empresa" },
                basicDataBusiness: basicDataBusiness.status === "fulfilled" ? basicDataBusiness.value.data : { error: true, message: "Erro na consulta de dados básicos da empresa" }
            };

        } else {
            return NextResponse.json(
                { error: true, message: "Documento inválido. Deve ter 11 ou 14 caracteres." },
                { status: 400 }
            );
        }

        return NextResponse.json(responseData, { status: 200 });

    } catch (e) {
        console.error("Erro na consulta:", e);

        return NextResponse.json(
            { error: true, message: "Erro na consulta", messageServer: e instanceof Error ? e.message : "Erro desconhecido" },
            { status: 500 }
        );
    }
}
