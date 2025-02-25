import { Container } from "@/components/Container";
import Header from "@/components/Header";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <div className="fixed -z-50 top-0 left-0 w-screen h-screen overflow-hidden">
        <div className="bg-blue-500 fixed top-0 -left-10 w-[250px] h-[250px] animate-pulse rounded-full blur-3xl"></div>
        <div className="bg-blue-500 fixed bottom-0 -right-10 w-[250px] h-[250px] animate-pulse rounded-full blur-3xl"></div>
      </div>

      <Header />

      <main className="flex items-center w-full h-screen justify-center bg-black/60 backdrop-blur-[15px]">
        <Container className="flex items-center justify-center flex-col gap-3">
          <div className="flex items-center gap-2">
            <Image width={100} height={100} src={"/avatar-group.png"} alt="" />
            <p>300+ Clientes Felizes</p>
          </div>

          <h1 className="md:text-3xl text-2xl font-bold text-center">
            Acompanhe seus processos em tempo <br /> 
            real de forma simples e rápida.
          </h1>
          <p className="text-center text-sm">
            Tenha acesso rápido e fácil às informações dos seus processos. Consulte, <br />
            monitore e fique sempre atualizado em poucos cliques.
          </p>

          <div className="flex items-center gap-2 mt-5">
            <button className="bg-blue-500 rounded-md p-3 px-5 border border-white hover:bg-blue-600">Começar</button>
            <button className="rounded-md p-3 px-5 border border-white/50 hover:bg-blue-500">Saiba Mais</button>
          </div>
        </Container>
      </main>
    </div>
  );
}
