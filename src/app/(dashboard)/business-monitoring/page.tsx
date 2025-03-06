import { FormConsultation } from "./_components/FormConsultation";

export default function BusinessMonitoringPage() {
    return(
        <div className="ml-[50px] md:ml-[200px] flex items-center justify-center flex-col my-5 px-5">
            <h1 className="text-2xl font-bold">Consulte sobre a empresa pelo CNPJ.</h1>
            <FormConsultation />
        </div>
    )
}