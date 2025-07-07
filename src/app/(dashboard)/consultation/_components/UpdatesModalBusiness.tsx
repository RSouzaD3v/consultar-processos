"use client";
import { X, List } from "lucide-react";
import { UpdatesTypes } from "@/types/ConsultationCompanyTypes";

interface UpdatesModalProps {
  updates: UpdatesTypes[];
  onClose: () => void;
}

export const UpdatesModalBusiness = ({ updates, onClose }: UpdatesModalProps) => {
  const formatDateBR = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
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
            <List className="w-6 h-6 text-purple-500" />
            Atualizações
          </h1>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-red-100 transition" aria-label="Fechar">
            <X className="w-6 h-6 text-red-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto">
          {updates && updates.length > 0 ? (
            <div className="divide-y">
              {updates.map((u, i) => (
                <div key={i} className="flex items-start gap-3 p-4 hover:bg-gray-50 transition">
                  <List className="w-5 h-5 text-purple-400 mt-1" />
                  <div className="flex-1">
                    <p className="text-gray-800">{u.Content}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Publicação: {formatDateBR(u.PublishDate)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Captura: {formatDateBR(u.CaptureDate)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              <p>Não contém nenhuma atualização.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
