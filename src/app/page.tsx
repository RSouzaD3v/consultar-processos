import { Container } from "@/components/Container";
import Header from "@/components/Header";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <Header />

      <main className="flex items-center w-full h-screen justify-center">
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
            <Link href={"/overview"}>
              <button className="bg-blue-500 rounded-md p-3 px-5 border border-white text-white hover:bg-blue-600">Começar</button>
            </Link>
            <Link href={"/overview"}>
             <button className="rounded-md p-3 px-5 border-white/50 border border-gray-400 hover:bg-blue-500 hover:text-white">Saiba Mais</button>
            </Link>
          </div>
        </Container>
      </main>
    </div>
  );
}
