import { db } from "@/lib/db";
import { getAuth } from "@clerk/nextjs/server";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        // Autenticação
        const { userId } = getAuth(req);

        if (!userId) {
            return NextResponse.json(
                { error: true, message: "Você precisa estar logado!" },
                { status: 401 }
            );
        }

        // Busca o usuário no banco de dados
        const getUser = await db.user.findFirst({
            where: { clerkId: userId }
        });

        if (!getUser) {
            return NextResponse.json(
                { error: true, message: "Usuário não encontrado" },
                { status: 404 }
            );
        }

        
        // Extraindo o ID da URL corretamente
        const idUrl = req.nextUrl.pathname.split("/").pop();

        if (!idUrl) {
            return NextResponse.json(
                { error: true, message: "A URL não tem o ID correspondente." },
                { status: 400 }
            );
        }

        // // Busca a consulta no banco de dados
        const getConsultation = await db.consultation.findFirst({
            where: { id: idUrl }
        });

        
        if (!getConsultation || !getConsultation.queryId) {
            return NextResponse.json(
                { error: true, message: "Consulta não encontrada." },
                { status: 404 }
            );
        }
        
        // // Fazendo a requisição à API externa
        const getConsultationByQuery = await axios.post(
            "https://plataforma.bigdatacorp.com.br/log/",
            { QueryId: getConsultation.queryId },
            {
                headers: {
                    "Content-Type": "application/json",
                    "AccessToken": process.env.NEXT_PUBLIC_ACCESS_TOKEN,
                    "TokenId": process.env.NEXT_PUBLIC_TOKEN_ID
                }
            }
        );
        
        return NextResponse.json({ consultationByQuery: getConsultationByQuery.data });
        
    } catch (e) {
        console.error("Erro na consulta:", e);
        return NextResponse.json(
            { error: true, message: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}
