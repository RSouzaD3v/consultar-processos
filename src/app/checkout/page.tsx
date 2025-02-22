import { CardSubscription } from "@/components/card-subscription";
import { fetchSubscriptionByEmail } from "@/lib/stripe";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function CheckoutPublic() {
    const user = await currentUser(); // Obtém os detalhes do usuário
    const email = user?.emailAddresses[0]?.emailAddress as string;

    const subscription = await fetchSubscriptionByEmail(email);

    if (subscription) {
        return (
            <div className="w-screen h-screen flex items-center justify-center flex-col gap-1">
                <h1 className="text-3xl">Você já tem assinatura!</h1>
                <Link className="p-2 bg-blue-500 text-xl text-white font-bold" href={"/overview"}>
                    Voltar ao OverView
                </Link>
            </div>
        )
    }

    return (
        <section>
            <CardSubscription />
        </section>
    )
};