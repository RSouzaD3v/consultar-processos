import { db } from "@/lib/db";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

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

        const getUser = await db.user.findFirst({
            where: { clerkId: userId }
        });

        if (!getUser) {
            return NextResponse.json(
                { error: true, message: "Usuário não encontrado" },
                { status: 404 }
            );
        }

        let responseData;

        if (doc.length === 11) {
            const cleanedValue = doc.replace(/[^\d]/g, "");
            const [personConsultation, personBasicData] = await Promise.all([
                axios.post(`${process.env.NEXT_PUBLIC_URL_BIGDATA}/pessoas`, {
                    Datasets: "processes.limit(50)",
                    q: `doc{${cleanedValue}}`
                }, {
                    headers: {
                        "Content-Type": "application/json",
                        "TokenId": process.env.NEXT_PUBLIC_TOKEN_ID,
                        "AccessToken": process.env.NEXT_PUBLIC_ACCESS_TOKEN
                    }
                }),

                axios.post(`${process.env.NEXT_PUBLIC_URL_BIGDATA}/pessoas`, {
                    Datasets: "basic_data",
                    q: `doc{${cleanedValue}}`
                }, {
                    headers: {
                        "Content-Type": "application/json",
                        "TokenId": process.env.NEXT_PUBLIC_TOKEN_ID,
                        "AccessToken": process.env.NEXT_PUBLIC_ACCESS_TOKEN
                    }
                })
            ]);

            const save = await db.consultation.create({
                data: {
                    custom_name: custom_name,
                    queryDate: personConsultation.data.QueryDate,
                    queryId: personConsultation.data.QueryId,
                    name: personBasicData.data.Result[0].BasicData.Name,
                    document: personBasicData.data.Result[0].BasicData.TaxIdNumber,
                    userId: getUser.id,
                    type_consultation: "Pessoa"
                }
            })

            responseData = {
                personConsultation: personConsultation.data,
                personBasicData: personBasicData.data,
                saveInDb: save
            };

        } else if (doc.length === 14) {
            const cleanedValue = doc.replace(/[^\d]/g, "");
            const [consultationBusiness, basicDataBusiness] = await Promise.all([
                axios.post(`${process.env.NEXT_PUBLIC_URL_BIGDATA}/empresas`, {
                    Datasets: "processes",
                    q: `doc{${cleanedValue}}`
                }, {
                    headers: {
                        "Content-Type": "application/json",
                        "TokenId": process.env.NEXT_PUBLIC_TOKEN_ID,
                        "AccessToken": process.env.NEXT_PUBLIC_ACCESS_TOKEN
                    }
                }),

                axios.get(`https://www.empresaqui.com.br/api/86b1e1c80081651781715693aa2299d93720b5d7/${cleanedValue}`)
            ]);

            console.log("Dados basicos empresa", basicDataBusiness.data);

            const save = await db.consultation.create({
                data: {
                    custom_name: custom_name,
                    queryDate: consultationBusiness.data.QueryDate,
                    queryId: consultationBusiness.data.QueryId,
                    name: basicDataBusiness.data.razao,
                    document: basicDataBusiness.data.cnpj,
                    userId: getUser.id,
                    type_consultation: "Empresa"
                }
            })

            responseData = {
                consultationBusiness: consultationBusiness.data,
                basicDataBusiness: basicDataBusiness.data,
                saveInDb: save
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
