import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return NextResponse.json(
                { error: true, message: "Você precisa estar logado!" },
                { status: 401 }
            );
        }

        const user = await db.user.findUnique({
            where: {
                clerkId: userId
            }
        });

        if (!user) {
            return NextResponse.json({
                error: true, message: "Usuário não encontrado."
            })
        }

        const getAllConsultation = await db.consultation.findMany({
            where: {
                userId: user.id
            }
        });

        return NextResponse.json({ consultations: getAllConsultation })
    } catch (e) {
        return NextResponse.json({ error: true, details: e })
    }
}