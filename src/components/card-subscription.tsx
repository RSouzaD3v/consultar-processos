import { PaymentButton } from "./payment-button"
import { Check } from "lucide-react"

export const CardSubscription = () => {
    return (
        <div className="bg-slate-100 p-2 text-black rounded-md flex gap-3 flex-col">
            <div>
                <h1 className="text-xl font-bold">Plano Premium - PRO</h1>
                <p>Assinar para ter todas nossas funcionalidades</p>
            </div>

            <h1><b className="text-2xl">R$29.90</b>/mês</h1>

            <div>
                <div className="flex items-center gap-2">
                    <Check className="text-green-500" />
                    <h1>Consultar Empresas</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Check className="text-green-500" />
                    <h1>Consultar Pessoas Físicas</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Check className="text-green-500" />
                    <h1>Monitoramento de processos</h1>
                </div>
            </div>

            <PaymentButton>
                Assinar já
            </PaymentButton>
        </div>
    )
}