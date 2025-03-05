import { LawsuitsTypes } from "./ConsultationCompanyTypes";

export interface ProcessesTypes {
    Last30DaysLawsuits: number;
    Last90DaysLawsuits: number;
    Last180DaysLawsuits: number;
    Last365DaysLawsuits: number;
    Lawsuits: [LawsuitsTypes]; //Temporáriamente esta com essa tipagem. Mas será alterado.
    NextPageId: string;
    TotalLawsuits: number;
    TotalLawsuitsAsAuthor: number;
    TotalLawsuitsAsDefendant: number;
    TotalLawsuitsAsOther: number;
}

export interface DataPersonTypes {
    MatchKeys: string;
    Processes: ProcessesTypes;
}