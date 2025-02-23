"use client";
import { useRouter } from "next/navigation"
export function CancelSubBtn() {
    const router = useRouter();

    const cancelSubscription = async () => {
        try {
            const response = await fetch("/api/subscription/cancel", {
                method: "DELETE"
            });

            const data = await response.json();

            console.log(data);
            router.refresh();
        } catch (e) {
            console.log(e)
        }
    }

    return (
        <div>
            <button onClick={() => cancelSubscription()} className="bg-red-500 text-white font-bold p-3 rounded-md">
                Cancelar Assinatura
            </button>
        </div>
    )
}