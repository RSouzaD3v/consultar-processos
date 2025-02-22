import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";


export async function POST(req: NextRequest) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '')
    
    try {
        const session = await stripe.checkout.sessions.create({
            ui_mode: "embedded",
            line_items: [
                {
                    quantity: 1,
                    price: process.env.STRIPE_PRICE_ID
                }
            ],
            mode: "subscription",
            payment_method_types: ['card'],
            return_url: `${req.headers.get('origin')}/payment-confirmation?session_id={CHECKOUT_SESSION_ID}`
        })

        return NextResponse.json({
            id: session.id,
            client_secret: session.client_secret
        })
    } catch (e) {
        console.log(e);
        return NextResponse.json(e, { status: 400 })
    }
}