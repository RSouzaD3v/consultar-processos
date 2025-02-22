"use client"
import React, { useCallback, useState } from "react"
import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js"

type PaymentButtonProps = {
    children: React.ReactNode
}

export const PaymentButton = ({ children }: PaymentButtonProps) => {
    const [ isOpen, setIsOpen ] = useState(false);
    const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '');

    const fetchClientSecret = useCallback(() => {
        return fetch("/api/checkout", {
            method: "POST",
            headers: {
                'Content-Type':'application/json'
            }
        })
        .then((res) => res.json())
        .then((data) => {
            console.log("Resposta da API:", data);
            return data.client_secret
        });
    }, []);

    const options = {fetchClientSecret};

    return (
        <section>
            {!isOpen && (
                <button onClick={() => setIsOpen((prev) => !prev)} className="bg-blue-500 text-white p-3 rounded-md">
                    {children}
                </button>
            )}

            {isOpen && (
                <div>
                    <div className="bg-white">
                        <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
                            <EmbeddedCheckout />
                        </EmbeddedCheckoutProvider>
                    </div>
                </div>
            )}
        </section>
    )
}