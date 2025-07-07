"use client";
import { X, Users } from "lucide-react";
import { PartiesTypes } from "@/types/ConsultationCompanyTypes";

interface PartiesModalProps {
  parties: PartiesTypes[];
  onClose: () => void;
}

export const PartiesModalBusiness = ({ parties, onClose }: PartiesModalProps) => {
  const formatDateBR = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-5 md:p-20">
      <section className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-xl shadow-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-green-500" />
            Partes do Processo
          </h1>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-red-100 transition" aria-label="Fechar">
            <X className="w-6 h-6 text-red-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto">
          {parties && parties.length > 0 ? (
            <div className="divide-y">
              {parties.map((p, i) => (
                <div key={i} className="flex flex-col gap-1 p-4 hover:bg-gray-50 transition">
                  <p className="font-semibold">{p.Name} ({p.Type}, Polaridade: {p.Polarity})</p>
                  <p className="text-sm text-gray-500">Inferência: {p.IsInference ? "Sim" : "Não"} | Ativo: {p.IsPartyActive ? "Sim" : "Não"}</p>
                  <p className="text-sm text-gray-500">Tipo Específico: {p.PartyDetails?.SpecificType ?? "Não informado"}</p>
                  <p className="text-sm text-gray-500">Documento: {p.Doc}</p>
                  <p className="text-sm text-gray-500">Última Captura: {formatDateBR(p.LastCaptureDate)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              <p>Não contém nenhuma parte cadastrada.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
