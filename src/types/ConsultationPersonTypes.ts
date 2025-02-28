export interface ProcessesTypes {
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

export interface DataPersonTypes {
    MatchKeys: string;
    Processes: ProcessesTypes;
}