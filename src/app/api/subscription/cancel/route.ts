import { db } from "@/lib/db";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '');

export async function DELETE(req: NextRequest) {
        const { userId } = getAuth(req);
    
        // const data = await req.json();
        // const {  } = data;

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
        });

        if (!getUser) {
            return NextResponse.json(
                { error: true, message: "Não contém sua conta ou não está logado!" },
                { status: 401 }
            );
        }

        const customers = await stripe.customers.list({
            email: getUser.email,
            limit: 1,
            expand: ["data"]
        });

        if (customers.data.length === 0) {
            return NextResponse.json({ message: "Não contém assinatura" });
        }
    
        const subscription = await stripe.subscriptions.list({
            limit: 1,
            customer: customers.data[0].id
        });
    
        if (subscription.data.length === 0) {
            return NextResponse.json({ message: "Não contém assinatura" });;
        }

        const subscriptionCancel = await stripe.subscriptions.cancel(
            subscription.data[0].id.toString()
        );

        return NextResponse.json({ message: "Assinatura Cancelada", subscriptionCancel });
}