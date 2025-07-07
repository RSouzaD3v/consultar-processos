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

        const { nextPageId, doc } = await req.json();

        const getUser = await db.user.findFirst({
            where: { clerkId: userId }
        });

        if (!getUser) {
            return NextResponse.json(
                { error: true, message: "Usuário não encontrado" },
                { status: 404 }
            );
        }

        const cleanedValue = doc.replace(/[^\d]/g, "");

        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_URL_BIGDATA}/pessoas`,
            {
                Datasets: `processes.next(${nextPageId})`,
                q: `doc{${cleanedValue}}`
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "TokenId": process.env.NEXT_PUBLIC_TOKEN_ID,
                    "AccessToken": process.env.NEXT_PUBLIC_ACCESS_TOKEN
                }
            }
        );

        // Retornar apenas os dados da resposta
        return NextResponse.json({ nextPage: response.data });

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
