import { Folder } from "lucide-react";

export interface LawsuitsTypes {
    AverageNumberOfUpdatesPerMonth: number;
    CaptureDate: string;
    CloseDate: string;
    CourtDistrict: string;
    CourtLevel: string | number;
    CourtName: string;
    CourtType: string;
    Decisions: [];
    InferredBroadCNJSubjectName: string;
    InferredBroadCNJSubjectNumber: number;
    InferredCNJProcedureTypeName: string;
    InferredCNJProcedureTypeNumber: number;
    InferredCNJSubjectName: string;
    InferredCNJSubjectNumber: number;
    JudgingBody: string;
    LastMovementDate: string;
    LastUpdate: string;
    LawSuitAge: number;
    LawsuitHostService: string;
    MainSubject: string;
    NoticeDate: string;
    Number: string;
    NumberOfPages: number;
    NumberOfParties: number;
    NumberOfUpdates: number;
    NumberOfVolumes: number;
    OtherSubjects: string[];
    Parties: object[];
    Petitions: [];
    PublicationDate: string;
    ReasonForConcealedData: number;
    RedistributionDate: string;
    ResJudicataDate: string;
    State: string;
    Status: string;
    Type: string;
    Updates: object[];
    Value: number;
}

export interface ProcessesTypes {
    FirstLawsuitDate: string;
    Last30DaysLawsuits: number;
    Last90DaysLawsuits: number;
    Last180DaysLawsuits: number;
    Last365DaysLawsuits: number;
    LastLawsuitDate: string;
    Lawsuits: LawsuitsTypes[];
    NextPageId: string;
    TotalLawsuits: number;
    TotalLawsuitsAsAuthor: number;
    TotalLawsuitsAsDefendant: number;
    TotalLawsuitsAsOther: number;
}

export interface DataJsonTypes {
    MatchKeys: string;
    Lawsuits: ProcessesTypes;
}

export const ViewBussiness = ({ dataJson }: { dataJson: DataJsonTypes[] }) => {
    // console.log("Lado do view Bussiness", dataJson[0].Lawsuits.Lawsuits[0]);

    return (
        <section className="p-5">
            <h1 className="text-3xl font-bold">Processos</h1>
            <div className="grid md:grid-cols-4 md:grid-rows-2 gap-5">
                <div className="bg-blue-950/50 text-white p-5 rounded-md">
                    <h1 className="text-white/40">Últimos 30 dias</h1>
                    <h1 className="text-3xl font-bold">{dataJson[0].Lawsuits.Last30DaysLawsuits}</h1>
                </div>
                <div className="bg-blue-950/50 text-white p-5 rounded-md">
                    <h1 className="text-white/40">Últimos 90 dias</h1>
                    <h1 className="text-3xl font-bold">{dataJson[0].Lawsuits.Last90DaysLawsuits}</h1>
                </div>
                <div className="bg-blue-950/50 text-white p-5 rounded-md">
                    <h1 className="text-white/40">Últimos 180 dias</h1>
                    <h1 className="text-3xl font-bold">{dataJson[0].Lawsuits.Last180DaysLawsuits}</h1>
                </div>
                <div className="bg-blue-950/50 text-white p-5 rounded-md">
                    <h1 className="text-white/40">Últimos 365 dias</h1>
                    <h1 className="text-3xl font-bold">{dataJson[0].Lawsuits.Last365DaysLawsuits}</h1>
                </div>
                <div className="bg-blue-950/50 text-white p-5 rounded-md">
                    <h1 className="text-white/40">Total de processos</h1>
                    <h1 className="text-3xl font-bold">{dataJson[0].Lawsuits.TotalLawsuits}</h1>
                </div>
                <div className="bg-blue-950/50 text-white p-5 rounded-md">
                    <h1 className="text-white/40">Total como author</h1>
                    <h1 className="text-3xl font-bold">{dataJson[0].Lawsuits.TotalLawsuitsAsAuthor}</h1>
                </div>
                <div className="bg-blue-950/50 text-white p-5 rounded-md">
                    <h1 className="text-white/40">Total como defensor</h1>
                    <h1 className="text-3xl font-bold">{dataJson[0].Lawsuits.TotalLawsuitsAsDefendant}</h1>
                </div>
                <div className="bg-blue-950/50 text-white p-5 rounded-md">
                    <h1 className="text-white/40">Total entre outros</h1>
                    <h1 className="text-3xl font-bold">{dataJson[0].Lawsuits.TotalLawsuitsAsOther}</h1>
                </div>
            </div>
            
            <div className="bg-blue-950/50 my-5 p-5 rounded-md">
                <div className="flex items-center justify-between">
                    <h1>Total de {dataJson[0].Lawsuits.Lawsuits.length} processos por páginas</h1>
                </div>

                <div className="text-center my-5">
                    {dataJson[0].Lawsuits.Lawsuits.length > 0 ? (
                        <div>
                            {dataJson[0].Lawsuits.Lawsuits.map((val, i) => (
                                <div className="flex sm:items-center sm:flex-row flex-col items-start sm:justify-between p-3 bg-white/5 my-3" key={i}>
                                    <div className="text-sm text-left opacity-50">
                                        <h1>{val.LastUpdate}</h1>
                                        <h1>Ultima atualização</h1>
                                    </div>
                                    <div className="text-left md:w-[400px] max-w-[400px]">
                                        <h1 className="text-sm font-bold">{val.MainSubject}</h1>
                                        <h1 className="text-sm text-white/20">{val.Number}</h1>
                                    </div>
                                    <div>
                                        <div className="bg-blue-500/10 my-2 sm:my-0 text-white p-2 rounded-md">
                                            <Folder />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div>
                            <h1>No lawsuits found</h1>
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}