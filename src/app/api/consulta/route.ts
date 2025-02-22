import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { db } from "@/lib/db";

// TokenId: process.env.NEXT_PUBLIC_TOKEN_ID || "",
// AccessToken: process.env.NEXT_PUBLIC_ACCESS_TOKEN || "",

export async function POST(req: NextRequest) {
    const { userId } = getAuth(req);

    const data = await req.json();
    const { q, Datasets, Limit, custom_name } = data;

    if (!userId) {
        return NextResponse.json(
            { error: true, message: "Não contém seu ID ou não está logado!" },
            { status: 401 }
        );
    };

    const getUser = await db.user.findFirst({
        where: {
            clerkId: userId
        }
    })

    console.log(q, Datasets, Limit, custom_name);
    console.log("tamanho do q: ", q.length);

    if (q.length == 16) {
        const consultaCpf = await axios.post(`${process.env.NEXT_PUBLIC_URL_BIGDATA}/pessoas`, {
            q: q,
            Datasets: Datasets,
            Limit: Limit
        }, 
        {
            headers: {
                'TokenId': process.env.NEXT_PUBLIC_TOKEN_ID || "",
                'AccessToken': process.env.NEXT_PUBLIC_ACCESS_TOKEN || ""
            }
        });

        const consultationSave = await db.consultation.create({
            data: {
                customer_Id: getUser?.id as string,
                custom_name: custom_name as string,
                document: q as string,
                queryDate: new Date(consultaCpf.data.QueryDate), 
                queryId: consultaCpf.data.QueryId as string,
                type_consultation: "Pessoa",
                result: JSON.stringify(consultaCpf.data.Result) as string,
                user: { connect: { id: getUser?.id as string } } 
            }
        })
        
        return NextResponse.json({data: consultaCpf.data, saveInDb: consultationSave});
    } else if (q.length == 19) {
        const consultaCnpj = await axios.post(`${process.env.NEXT_PUBLIC_URL_BIGDATA}/empresas`, {
            q: q,
            Datasets: Datasets,
            Limit: Limit
        }, 
        {
            headers: {
                'TokenId': process.env.NEXT_PUBLIC_TOKEN_ID || "",
                'AccessToken': process.env.NEXT_PUBLIC_ACCESS_TOKEN || ""
            }
        });

         const consultationSave = await db.consultation.create({
            data: {
                customer_Id: getUser?.id as string,
                custom_name: custom_name,
                document: q as string,
                queryDate: new Date(consultaCnpj.data.QueryDate), 
                queryId: consultaCnpj.data.QueryId as string,
                type_consultation: "Empresa",
                result: JSON.stringify(consultaCnpj.data.Result) as string,
                user: { connect: { id: getUser?.id as string } } 
            }
        })
        
        return NextResponse.json({data: consultaCnpj.data, saveInDb: consultationSave});
    } else {
        return NextResponse.json({ error: true, message: "Erro na consulta." })
    }


}