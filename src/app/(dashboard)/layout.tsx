import { currentUser } from "@clerk/nextjs/server";
import { Sidebar } from "./_components/Sidebar";
import { fetchSubscriptionByEmail } from "@/lib/stripe";
import { CardSubscription } from "@/components/card-subscription";
import { AlertTriangle } from "lucide-react";

export default async function DashboardLayout({children,}: Readonly<{children: React.ReactNode;}>) {
  const user = await currentUser(); // Obtém os detalhes do usuário
  const email = user?.emailAddresses[0]?.emailAddress as string;

  const subscription = await fetchSubscriptionByEmail(email);

  if(!subscription?.isActive) {
    return (
      <div>
        <Sidebar />
        <div className="md:ml-[200px] my-20 ml-[50px] text-black flex items-center justify-center flex-col">
          <div className="flex items-center gap-3 text-yellow-500 bg-yellow-100 my-10 p-5 rounded-md">
            <AlertTriangle />
            <h1>Você precisa renovar a sua assinatura para ter acesso ao nosso sistema.</h1>
          </div>
          <div>
            <CardSubscription />
          </div>
        </div>
      </div>
    )
  }

  return (
    <main>
        <Sidebar />
        {children}
    </main>
  );
}
