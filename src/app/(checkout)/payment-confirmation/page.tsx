import { ShoppingBag } from "lucide-react"
import Link from "next/link"

export default async function CheckoutReturnPage() {
    return (
        <section>
            <div className="bg-white text-black p-5 rounded-md">
                <div className="mb-5">
                    <ShoppingBag />
                    <h1 className="text-xl">Assinatura Confirmada</h1>
                    <p>Obrigado por se juntar a melhore plantaforma de consultas</p>
                </div>

                <div>
                    <Link className="bg-blue-500 text-white font-bold p-2 rounded-sm" href={"/overview"}>
                        Ir para plantaforma
                    </Link>
                </div>
            </div>
        </section>
    )
}