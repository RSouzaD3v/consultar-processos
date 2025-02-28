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

export interface DataCompanyTypes {
    MatchKeys: string;
    Lawsuits: ProcessesTypes;
}