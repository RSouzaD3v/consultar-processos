"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface ListConsultationTypes {
    custom_name: string;
    document: string;
    queryDate: string;
    id: string;
}

export default function ListOfConsultations() {
  const [listConsultation, setListConsultation] = useState<ListConsultationTypes[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchBy, setFetchBy] = useState<"Pessoa" | "Empresa">("Pessoa");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Função para buscar consultas da API
  const fetchConsultations = async (reset = false) => {
    setLoading(true);
    if (!hasMore && !reset) return;

    try {
      const params = new URLSearchParams({
        limit: "10",
        type: fetchBy,
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(cursor && !reset ? { cursor } : {}),
      });

      const response = await fetch(`/api/consultations?${params.toString()}`);
      const { data, nextCursor } = await response.json();

      setListConsultation((prev) => (reset ? data : [...prev, ...data]));
      setCursor(nextCursor);
      setHasMore(!!nextCursor);
    } catch (error) {
      console.error("Erro ao buscar consultas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultations(true);
  }, [fetchBy, debouncedSearch]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <div className="ml-5 md:ml-[200px]">
      {/* Painel de controle de pesquisa */}
      <div className="bg-white/5 p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFetchBy("Pessoa")}
            className={`p-2 border border-white ${
              fetchBy === "Pessoa" ? "bg-white/10" : ""
            }`}
          >
            Por Pessoa
          </button>
          <button
            onClick={() => setFetchBy("Empresa")}
            className={`p-2 border border-white ${
              fetchBy === "Empresa" ? "bg-white/10" : ""
            }`}
          >
            Por Empresa
          </button>
        </div>

        <div className="bg-white flex items-center text-black rounded overflow-hidden">
          <label htmlFor="search" className="cursor-pointer p-2">
            <Search className="text-black" />
          </label>
          <input
            className="outline-none border-none p-2 w-full"
            type="text"
            placeholder="Pesquise por nome"
            name="search"
            id="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Tabela de consultas */}
      <div className="mt-5 bg-white/10 p-5 rounded-lg text-black shadow-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome customizado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Documento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data da pesquisa
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ação
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {listConsultation.length > 0 ? (
              listConsultation.map((consultation, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">{consultation.custom_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{consultation.document}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{consultation.queryDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link href={`/consultation/${consultation.id}`} className="text-blue-500">
                      Ver Consulta
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-4 text-gray-500">
                  Nenhuma consulta encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Botão "Carregar mais" */}
      {hasMore && (
        <div className="mt-5 flex justify-center">
          <button
            onClick={() => fetchConsultations()}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Carregando..." : "Carregar mais"}
          </button>
        </div>
      )}
    </div>
  );
}
