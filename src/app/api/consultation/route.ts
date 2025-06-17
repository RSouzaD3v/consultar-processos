import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const apiClient = axios.create({
    timeout: 59000,
    headers: {
        "Content-Type": "application/json",
        "TokenId": process.env.NEXT_PUBLIC_TOKEN_ID,
        "AccessToken": process.env.NEXT_PUBLIC_ACCESS_TOKEN
    }
});

const BIGDATA_URL = process.env.NEXT_PUBLIC_URL_BIGDATA;

async function performPersonConsultation(cleanedValue: string) {
    const [personConsultation, personBasicData] = await Promise.allSettled([
        apiClient.post(`${BIGDATA_URL}/pessoas`, {
            Datasets: "processes.limit(50)",
            q: `doc{${cleanedValue}}`
        }),

        apiClient.post(`${BIGDATA_URL}/pessoas`, {
            Datasets: "basic_data",
            q: `doc{${cleanedValue}}`
        })
    ]);

    return {
        personConsultation: personConsultation.status === "fulfilled" ? personConsultation.value.data : { error: true, message: "Erro na consulta de processos" },
        personBasicData: personBasicData.status === "fulfilled" ? personBasicData.value.data : { error: true, message: "Erro na consulta de dados básicos" }
    };
}

async function performBusinessConsultation(cleanedValue: string) {
    const [consultationBusiness, basicDataBusiness] = await Promise.allSettled([
        apiClient.post(`${BIGDATA_URL}/empresas`, {
            Datasets: "processes.limit(30)",
            q: `doc{${cleanedValue}}`
        }),

        axios.get(`https://www.empresaqui.com.br/api/86b1e1c80081651781715693aa2299d93720b5d7/${cleanedValue}`, { timeout: 9500 })
    ]);

    return {
        consultationBusiness: consultationBusiness.status === "fulfilled" ? consultationBusiness.value.data : { error: true, message: "Erro na consulta de processos da empresa" },
        basicDataBusiness: basicDataBusiness.status === "fulfilled" ? basicDataBusiness.value.data : { error: true, message: "Erro na consulta de dados básicos da empresa" }
    };
}

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

        const cleanedValue = doc.replace(/[^\d]/g, "");

        if (doc.length === 11) {
            const responseData = await performPersonConsultation(cleanedValue);
            return NextResponse.json(responseData, { status: 200 });
        } else if (doc.length === 14) {
            const responseData = await performBusinessConsultation(cleanedValue);
            return NextResponse.json(responseData, { status: 200 });
        } else {
            return NextResponse.json(
                { error: true, message: "Documento inválido. Deve ter 11 ou 14 caracteres." },
                { status: 400 }
            );
        }

    } catch (e) {
        console.error("Erro na consulta:", e);

        return NextResponse.json(
            { error: true, message: "Erro na consulta", messageServer: e instanceof Error ? e.message : "Erro desconhecido" },
            { status: 500 }
        );
    }
}
