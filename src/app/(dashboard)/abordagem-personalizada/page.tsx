/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { Send } from "lucide-react";

/*───────────────────────────────────────────────────────────
  Wrappers Tailwind simples (Card, Button, Input, ScrollArea)
───────────────────────────────────────────────────────────*/
const Card = ({
  children,
  className = "",
}: React.PropsWithChildren<{ className?: string }>) => (
  <div className={`rounded-lg bg-white shadow p-4 ${className}`}>{children}</div>
);

const CardHeader = ({ children }: React.PropsWithChildren) => (
  <div className="mb-2">{children}</div>
);

const CardTitle = ({ children }: React.PropsWithChildren) => (
  <h3 className="text-xl font-semibold">{children}</h3>
);

const CardContent = ({
  children,
  className = "",
}: React.PropsWithChildren<{ className?: string }>) => (
  <div className={className}>{children}</div>
);

const Button = (
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }
) => (
  <button
    {...props}
    className={`px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2 ${props.className ?? ""}`}
  >
    {props.children}
  </button>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-600 ${props.className ?? ""}`}
  />
);

const ScrollArea = ({
  children,
  className = "",
}: React.PropsWithChildren<{ className?: string }>) => (
  <div className={`overflow-y-auto ${className}`}>{children}</div>
);

/*───────────────────────────────────────────────────────────
  Utilidades auxiliares
───────────────────────────────────────────────────────────*/
const formatDate = (yyyymmdd?: string) => {
  if (!yyyymmdd || yyyymmdd === "00000000") return "—";
  const d = new Date(
    Number(yyyymmdd.slice(0, 4)),
    Number(yyyymmdd.slice(4, 6)) - 1,
    Number(yyyymmdd.slice(6, 8))
  );
  return d.toLocaleDateString("pt-BR");
};

const situacaoCadastral = (cod: string) =>
  (
    {
      "1": "Nula",
      "2": "Ativa",
      "3": "Suspensa",
      "4": "Inapta",
      "8": "Baixada",
    } as Record<string, string>
  )[cod] ?? "—";

const porteEmpresa = (cod: string) =>
  (
    {
      "1": "MEI",
      "3": "Pequeno Porte",
      "5": "Médio Porte",
      "7": "Grande Porte",
    } as Record<string, string>
  )[cod] ?? "—";

const formatMensagemEmpresa = (e: any) => `
**CNPJ**: ${e.cnpj}
**Razão Social**: ${e.razao}
**Nome Fantasia**: ${e.fantasia}
**Telefone**: ${e.ddd_1 ?? ""} ${e.tel_1 ?? ""}
**E-mail**: ${e.email}
**Endereço**: ${e.log_tipo} ${e.log_nome}, ${e.log_num} - ${e.log_bairro}, ${e.log_municipio}/${e.log_uf}
**CNAE Principal**: ${e.cnae_principal}
**Situação Cadastral**: ${situacaoCadastral(e.situacao_cadastral)}
**Data Situação**: ${formatDate(e.data_sit_cad)}
**Natureza Jurídica**: ${e.natureza_juridica}
**Data Abertura**: ${formatDate(e.data_abertura)}
**Opção SIMPLES**: ${e.opcao_simples === "S" ? "Sim" : "Não"}
**Porte**: ${porteEmpresa(e.porte)}
**Capital Social**: R$ ${Number(e.capital_social).toLocaleString("pt-BR", {
  minimumFractionDigits: 2,
})}`.trim();

/*───────────────────────────────────────────────────────────
  Card da Empresa
───────────────────────────────────────────────────────────*/
const CompanyCard = ({ data }: { data: any }) => (
  <Card className="max-w-3xl mx-auto">
    <CardHeader>
      <CardTitle>{data.razao}</CardTitle>
      <p className="text-sm text-zinc-500">{data.cnpj}</p>
    </CardHeader>
    <CardContent className="space-y-2 text-sm leading-relaxed">
      <p>
        <strong>Nome Fantasia:</strong> {data.fantasia || "—"}
      </p>
      <p>
        <strong>Situação Cadastral:</strong>{" "}
        {situacaoCadastral(data.situacao_cadastral)}
      </p>
      <p>
        <strong>Data Situação:</strong> {formatDate(data.data_sit_cad)}
      </p>
      <p>
        <strong>Capital Social:</strong>{" "}
        {Number(data.capital_social).toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
        })}
      </p>
      <p>
        <strong>Porte:</strong> {porteEmpresa(data.porte)}
      </p>
      <p>
        <strong>Endereço:</strong>{" "}
        {`${data.log_tipo} ${data.log_nome}, ${data.log_num} - ${data.log_bairro}, ${data.log_municipio}/${data.log_uf}`}
      </p>
    </CardContent>
  </Card>
);

/*───────────────────────────────────────────────────────────
  Chat IA
───────────────────────────────────────────────────────────*/
interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}
const ChatBox = ({ company }: { company: any }) => {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [threadId, setThreadId] = useState<string | null>(null);
  const [waiting, setWaiting] = useState(false);

  // cria thread inicial
  useEffect(() => {
    (async () => {
      const payload = formatMensagemEmpresa(company);

      /* 🔐  Altere /api/openai/start para sua rota server-side */
      const res = await fetch("/api/openai/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensagem: payload }),
      });
      const data = await res.json();
      if (data.threadId && data.firstAnswer) {
        setThreadId(data.threadId);
        setMessages([{ role: "assistant", content: data.firstAnswer }]);
      }
    })();
  }, [company]);

  const sendMessage = async () => {
    if (!input.trim() || !threadId) return;

    const userMsg: ChatMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setWaiting(true);

    /* 🔐  Altere /api/openai/chat para sua rota server-side */
    const res = await fetch("/api/openai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ threadId, message: userMsg.content }),
    });
    const data = await res.json();
    if (data.answer) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer },
      ]);
    }
    setWaiting(false);
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Converse com a IA sobre o cliente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="h-72 rounded-md border p-4 bg-zinc-50">
          {messages.map((m, i) => (
            <p key={i} className="mb-2 text-sm whitespace-pre-wrap">
              <strong className="capitalize">{m.role}:</strong> {m.content}
            </p>
          ))}
          {waiting && <p className="text-sm text-zinc-500">Aguarde...</p>}
        </ScrollArea>

        <div className="flex gap-2">
          <Input
            placeholder="Digite sua pergunta..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <Button
            onClick={sendMessage}
            disabled={waiting || !input.trim()}
            title="Enviar"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

/*───────────────────────────────────────────────────────────
  Página principal
───────────────────────────────────────────────────────────*/
export default function AbordagemPersonalizadaPage() {
  const [cnpj, setCnpj] = useState<string | null>(null);
  const [company, setCompany] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // extrai CNPJ da URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const _cnpj = params.get("cnpj");
    if (_cnpj) setCnpj(_cnpj);
    else setError("Forneça um CNPJ na URL (?cnpj=...)");
  }, []);

  // consulta empresa
  useEffect(() => {
    if (!cnpj) return;
    (async () => {
      setLoading(true);
      try {
        /*  Altere para seu endpoint PHP ou rota Next API */
        const res = await fetch(
          `https://www.quadros.adv.br/integration/proxy-cnpj.php?cnpj=${cnpj}`
        );
        if (!res.ok) throw new Error("Erro ao consultar empresa");
        const data = await res.json();
        setCompany(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [cnpj]);

  return (
    <main className="container mx-auto px-4 py-10 flex flex-col gap-10">
      <header className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-blue-600">
          Abordagem Personalizada
        </h1>
        <h2 className="text-lg text-zinc-500">
          Utilizar como ponto de contato com o lead
        </h2>
      </header>

      {loading && <p className="text-center">Consultando empresa...</p>}
      {error && (
        <p className="text-center text-red-600 font-medium">{error}</p>
      )}
      {company && <CompanyCard data={company} />}
      {company && <ChatBox company={company} />}
    </main>
  );
}
