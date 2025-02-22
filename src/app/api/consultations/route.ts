import { db } from "@/lib/db";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        // Autenticação do usuário
        const { userId } = getAuth(req);
        if (!userId) {
            return NextResponse.json(
                { error: true, message: "Não está autenticado." },
                { status: 401 }
            );
        }

        // Obter o usuário no banco
        const user = await db.user.findFirst({
            where: { clerkId: userId }
        });

        if (!user) {
            return NextResponse.json(
                { error: true, message: "Usuário não encontrado." },
                { status: 404 }
            );
        }

        // Obtendo parâmetros da query
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get("limit") || "10", 10);
        const cursor = searchParams.get("cursor");
        const type = searchParams.get("type"); // "Pessoa" ou "Empresa"
        const search = searchParams.get("search") || "";

        if (!type || (type !== "Pessoa" && type !== "Empresa")) {
            return NextResponse.json(
                { error: true, message: "Tipo de consulta inválido." },
                { status: 400 }
            );
        }

        // Consulta ao banco de dados com paginação e pesquisa
        const consultations = await db.consultation.findMany({
            where: {
                type_consultation: type,
                customer_Id: user.id,
                custom_name: {
                    contains: search, // Pesquisa parcial pelo nome
                    mode: "insensitive" // Case insensitive
                }
            },
            take: limit,
            skip: cursor ? 1 : 0,
            cursor: cursor ? { id: cursor } : undefined,
            orderBy: { queryDate: "desc" }
        });

        // Pegando o próximo cursor (se houver mais registros)
        const nextCursor = consultations.length === limit ? consultations[consultations.length - 1].id : null;

        return NextResponse.json({ data: consultations, nextCursor });
    } catch (error) {
        console.error("Erro ao buscar consultas:", error);
        return NextResponse.json(
            { error: true, message: "Erro interno do servidor." },
            { status: 500 }
        );
    }
}
