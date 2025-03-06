import { getAuth } from "@clerk/nextjs/server";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
        const { userId } = getAuth(req);

        const { cnpj } = await req.json();

        if(!cnpj) {
            return NextResponse.json({ error: true });
        }
        const cleanedCnpj = cnpj.replace(/\D/g, "");

        if (!userId) {
            return NextResponse.json(
                { error: true, message: "Você precisa estar logado!" },
                { status: 401 }
            );
        };

        try {
            const response = await axios.get(`https://www.empresaqui.com.br/api/${process.env.NEXT_PUBLIC_TOKEN_BASIC_INFORMATION}/${cleanedCnpj}`);

            return NextResponse.json({ informationCompany: response.data });
        } catch (e) {
            return NextResponse.json({ error: true, message: e });
        }
}