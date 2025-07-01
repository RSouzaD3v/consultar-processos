interface Decision {
    DecisionContent: string;
    DecisionDate: string;
}

interface Parties {
    Doc: string;
    IsInference: boolean;
    IsPartyActive: boolean;
    LastCaptureDate: string;
    Name: string;
    PartyDetails: {
        SpecificType: string;
    };
    Polarity: string;
    Type: string;
}

interface Updates {
    CaptureDate: string;
    Content: string;
    PublishDate: string;
}

export interface Lawsuits {
    AverageNumberOfUpdatesPerMonth: number;
    CaptureDate: string;
    CloseDate: string;
    CourtDistrict: string;
    CourtLevel: string;
    CourtName: string;
    CourtType: string;
    Decisions: Decision[]; // Defina uma interface para Decision se possível
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
    LawsuitMatchType: string;
    MainSubject: string;
    NoticeDate: string;
    Number: string;
    NumberOfPages: number;
    NumberOfParties: number;
    NumberOfUpdates: number;
    NumberOfVolumes: number;
    OtherSubjects: string[];
    Parties: Parties[]; // Defina uma interface para Party se possível
    Petitions: []; // Defina uma interface para Petition se possível
    PublicationDate: string;
    ReasonForConcealedData: number;
    RedistributionDate: string;
    ResJudicataDate: string;
    State: string;
    Status: string;
    Type: string;
    Updates: Updates[]; // Defina uma interface para Update se possível
    Value: number;
}

export interface ProcessesTypes {
    Last30DaysLawsuits: number;
    Last90DaysLawsuits: number;
    Last180DaysLawsuits: number;
    Last365DaysLawsuits: number;
    Lawsuits: Lawsuits[]; //Temporáriamente esta com essa tipagem. Mas será alterado.
    NextPageId: string;
    TotalLawsuits: number;
    TotalLawsuitsAsAuthor: number;
    TotalLawsuitsAsDefendant: number;
    TotalLawsuitsAsOther: number;
}

export interface DataPersonTypes {
    MatchKeys: string;
    Processes: ProcessesTypes
}