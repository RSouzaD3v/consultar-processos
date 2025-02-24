import { db } from "@/lib/db";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return NextResponse.json(
                { error: true, message: "Você precisa estar logado!" },
                { status: 401 }
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

        // Pegando os parâmetros da URL
        const { searchParams } = new URL(req.url);
        const order = searchParams.get("order") || "asc"; // Padrão 'asc'
        const searchQuery = searchParams.get("search") || ""; // Padrão ''

        // Buscar consultas com ordenação e filtro por nome
        const getConsultations = await db.consultation.findMany({
            where: {
                userId: getUser.id,
                OR: searchQuery
                    ? [
                          { custom_name: { contains: searchQuery, mode: "insensitive" } },
                          { name: { contains: searchQuery, mode: "insensitive" } }
                      ]
                    : undefined
            },
            orderBy: {
                createdAt: order === "desc" ? "desc" : "asc"
            }
        });

        return NextResponse.json(getConsultations, { status: 200 });

    } catch (e) {
        console.error("Erro na consulta:", e);
        return NextResponse.json(
            { error: true, message: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}
