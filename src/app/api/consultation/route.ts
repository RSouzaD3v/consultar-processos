import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { db } from "@/lib/db";
import { ApiReturnDataCompanyTypes, BasicDataCompanyTypes } from "@/types/ConsultationCompanyTypes";

const apiClient = axios.create({
  timeout: 360000, // 6 minutos
  headers: {
    "Content-Type": "application/json",
    TokenId: process.env.NEXT_PUBLIC_TOKEN_ID,
    AccessToken: process.env.NEXT_PUBLIC_ACCESS_TOKEN
  }
});

const BIGDATA_URL = process.env.NEXT_PUBLIC_URL_BIGDATA;

/**
 * Consulta dados de pessoa (processos e dados básicos)
 */
async function performPersonConsultation(cleanedValue: string) {
  const [consultationResult, basicDataResult] = await Promise.allSettled([
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
    personConsultation:
      consultationResult.status === "fulfilled"
        ? consultationResult.value.data
        : { error: true, message: "Erro na consulta de processos" },

    personBasicData:
      basicDataResult.status === "fulfilled"
        ? basicDataResult.value.data
        : { error: true, message: "Erro na consulta de dados básicos" }
  };
}

/**
 * Consulta dados de empresa (processos e dados básicos)
 */
async function performBusinessConsultation(cleanedValue: string) {
  const [consultationResult, basicDataResult] = await Promise.allSettled([
    apiClient.post(`${BIGDATA_URL}/empresas`, {
      Datasets: "processes.limit(30)",
      q: `doc{${cleanedValue}}`
    }),
    axios.get(
      `https://www.empresaqui.com.br/api/86b1e1c80081651781715693aa2299d93720b5d7/${cleanedValue}`,
      { timeout: 9500 }
    )
  ]);

  return {
    consultationBusiness:
      consultationResult.status === "fulfilled"
        ? consultationResult.value.data
        : { error: true, message: "Erro na consulta de processos da empresa" },

    basicDataBusiness:
      basicDataResult.status === "fulfilled"
        ? basicDataResult.value.data
        : { error: true, message: "Erro na consulta de dados básicos da empresa" }
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
    console.log("Payload", { doc: doc, customName: custom_name });

    if (!doc || !custom_name) {
      return NextResponse.json(
        { error: true, message: "Campos obrigatórios não preenchidos" },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId }
    });

    console.log("User", user);

    if (!user) {
      return NextResponse.json(
        { error: true, message: "Usuário não encontrado." },
        { status: 404 }
      );
    }

    const cleanedValue = doc.replace(/[^\d]/g, "");

    console.log("Documento limpo: ", cleanedValue);

    if (doc.length === 11) {
      return await handlePersonRequest(cleanedValue);
    }

    if (doc.length === 14) {
      return await handleBusinessRequest(cleanedValue);
    }

    return NextResponse.json(
      { error: true, message: "Documento inválido. Deve ter 11 ou 14 caracteres." },
      { status: 400 }
    );

  } catch (e) {
    console.error("Erro na consulta:", e);

    return NextResponse.json(
      {
        error: true,
        message: "Erro na consulta",
        messageServer: e instanceof Error ? e.message : "Erro desconhecido"
      },
      { status: 500 }
    );
  }
}

/**
 * Handler para consulta de pessoa
 */
async function handlePersonRequest(cleanedValue: string) {
  const responseData = await performPersonConsultation(cleanedValue);

  if (!responseData.personConsultation?.Result?.length) {
    return NextResponse.json(
      { error: true, message: "Nenhum resultado de processos para este documento" },
      { status: 404 }
    );
  }

  // Persistência no banco (desativado)
  // await db.consultation.create({
  //   data: {
  //     custom_name: customName,
  //     userId,
  //     document: responseData.personConsultation.Result[0].MatchKeys,
  //     name: responseData.personBasicData?.Result?.[0]?.BasicData?.Name,
  //     queryDate: responseData.personConsultation.QueryDate,
  //     queryId: responseData.personConsultation.QueryId,
  //     type_consultation: 'Pessoa',
  //   }
  // });

  return NextResponse.json(responseData, { status: 200 });
}

/**
 * Handler para consulta de empresa
 */
async function handleBusinessRequest(cleanedValue: string) {
  const responseData: { consultationBusiness: ApiReturnDataCompanyTypes, basicDataBusiness: BasicDataCompanyTypes } =
    await performBusinessConsultation(cleanedValue);

    console.log("DATA: ", responseData.consultationBusiness);

  if (!responseData.consultationBusiness?.Result?.length) {
    return NextResponse.json(
      { error: true, message: "Nenhum resultado de processos para este documento" },
      { status: 404 }
    );
  }

  // Persistência no banco (desativado)
  // await db.consultation.create({
  //   data: {
  //     custom_name: customName,
  //     userId,
  //     document: responseData.consultationBusiness.Result[0].MatchKeys,
  //     name: responseData.basicDataBusiness.razao,
  //     queryDate: responseData.consultationBusiness.QueryDate,
  //     queryId: responseData.consultationBusiness.QueryId,
  //     type_consultation: 'Empresa',
  //   }
  // });

  return NextResponse.json(responseData, { status: 200 });
}
