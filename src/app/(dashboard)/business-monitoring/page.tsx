import { FormConsultation } from "./_components/FormConsultation";

export default function BusinessMonitoringPage() {
    return(
        <div className="ml-[50px] md:ml-[250px] flex items-center justify-center flex-col my-5 px-5">
            <h1 className="text-5xl font-bold mt-10">Consultar Novas Informações</h1>
            <p className="text-xl">Coloque Cnpj para saber mais sobre uma empresa.</p>
            <FormConsultation />
        </div>
    )
}