import Header from "@/components/Header";

export default function Home() {
  return (
    <div>
      <Header />

      <main className="w-full h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl">Sua Plantaforma de dados Jurídicos</h1>
          <p className="text-xl">Solução para monitoramento de processos, e invação na área de rastreamento de dados</p>
        </div>
      </main>
    </div>
  );
}
