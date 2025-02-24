interface ProcessesTypes {
    Last30DaysLawsuits: number;
    Last90DaysLawsuits: number;
    Last180DaysLawsuits: number;
    Last365DaysLawsuits: number;
    Lawsuits: []
    TotalLawsuits: number;
    TotalLawsuitsAsAuthor: number;
    TotalLawsuitsAsDefendant: number;
    TotalLawsuitsAsOther: number;
}

interface DataJsonTypes {
    MatchKeys: string;
    Processes: ProcessesTypes;
}


export const ViewPeople = ({ dataJson }: {dataJson: DataJsonTypes[]}) => {
    // console.log("Lado do view", dataJson[0].Processes);

    return (
        <section className="p-5">
            <h1 className="text-3xl font-bold">Processos</h1>
            <div className="grid md:grid-cols-4 md:grid-rows-2 gap-5">
                <div className="bg-blue-950/50 text-white p-5 rounded-md">
                    <h1 className="text-white/40">Últimos 30 dias</h1>
                    <h1 className="text-3xl font-bold">{dataJson[0].Processes.Last30DaysLawsuits}</h1>
                </div>
                <div className="bg-blue-950/50 text-white p-5 rounded-md">
                    <h1 className="text-white/40">Últimos 90 dias</h1>
                    <h1 className="text-3xl font-bold">{dataJson[0].Processes.Last90DaysLawsuits}</h1>
                </div>
                <div className="bg-blue-950/50 text-white p-5 rounded-md">
                    <h1 className="text-white/40">Últimos 180 dias</h1>
                    <h1 className="text-3xl font-bold">{dataJson[0].Processes.Last180DaysLawsuits}</h1>
                </div>
                <div className="bg-blue-950/50 text-white p-5 rounded-md">
                    <h1 className="text-white/40">Últimos 365 dias</h1>
                    <h1 className="text-3xl font-bold">{dataJson[0].Processes.Last365DaysLawsuits}</h1>
                </div>
                <div className="bg-blue-950/50 text-white p-5 rounded-md">
                    <h1 className="text-white/40">Total de processos</h1>
                    <h1 className="text-3xl font-bold">{dataJson[0].Processes.TotalLawsuits}</h1>
                </div>
                <div className="bg-blue-950/50 text-white p-5 rounded-md">
                    <h1 className="text-white/40">Total como author</h1>
                    <h1 className="text-3xl font-bold">{dataJson[0].Processes.TotalLawsuitsAsAuthor}</h1>
                </div>
                <div className="bg-blue-950/50 text-white p-5 rounded-md">
                    <h1 className="text-white/40">Total como defensor</h1>
                    <h1 className="text-3xl font-bold">{dataJson[0].Processes.TotalLawsuitsAsDefendant}</h1>
                </div>
                <div className="bg-blue-950/50 text-white p-5 rounded-md">
                    <h1 className="text-white/40">Total entre outros</h1>
                    <h1 className="text-3xl font-bold">{dataJson[0].Processes.TotalLawsuitsAsOther}</h1>
                </div>
            </div>
            
            <div className="bg-blue-950/50 my-5 p-5 rounded-md">
                <div className="flex sm:items-center sm:flex-row flex-col items-start sm:justify-between p-3 bg-white/5 my-3">
                    <h1>Total de {dataJson[0].Processes.Lawsuits.length} processos</h1>
                    {/* <div className="flex items-center text-black">
                        <label htmlFor="search" className="cursor-pointer rounded-l-md sm:p-2 p-1 bg-white">
                            <Search />
                        </label>
                        <input className="text-black outline-none sm:p-2 p-1 rounded-r-md" type="text" name="search" />
                    </div> */}

                </div>

                <div className="text-center my-5">
                    <h1 className="text-xl opacity-50">Não contém Processos!</h1>
                </div>
            </div>
        </section>
    )
}