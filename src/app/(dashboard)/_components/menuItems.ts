import { Home, User2, CreditCard, History, SearchSlash } from "lucide-react";

export const menuItems = [
    { name: "Overview", icon: Home, href: "/overview", description: null },
    { name: "Consultar", icon: User2, href: "/consultar", description: "Aqui você poderá consultar processos de pessoas físicas e juridicas" },
    { name: "Assinaturas", icon: CreditCard, href: "/subscription", description: "Verificar sua assinatura" },
    { name: "His. de consultas", icon: History, href: "/history-consultations", description: "Verificar consultas que já foram feitas." },
    { name: "Lista de consultas", icon: SearchSlash, href: "/lista-de-consultas", description: "Verificar consultas que já foram feitas." },
];