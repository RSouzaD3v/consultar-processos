export interface PartiesTypes {
    Doc: string;
    IsInference: boolean;
    IsPartyActive: boolean;
    LastCaptureDate: string
    Name: string
    PartyDetails: {SpecificType: string}
    Polarity: string
    Type: string
}

export interface DecisionTypes {
    DecisionContent: string;
    DecisionDate: string;
}

export interface UpdatesTypes {
    CaptureDate: string
    Content: string;
    PublishDate: string;
}

export interface LawsuitsTypes {
    AverageNumberOfUpdatesPerMonth: number;
    CaptureDate: string;
    CloseDate: string;
    CourtDistrict: string;
    CourtLevel: string | number;
    CourtName: string;
    CourtType: string;
    Decisions: DecisionTypes[];
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
    Parties: PartiesTypes[];
    Petitions: [];
    PublicationDate: string;
    ReasonForConcealedData: number;
    RedistributionDate: string;
    ResJudicataDate: string;
    State: string;
    Status: string;
    Type: string;
    Updates: UpdatesTypes[];
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
    NextPageId?: string;
    TotalLawsuits: number;
    TotalLawsuitsAsAuthor: number;
    TotalLawsuitsAsDefendant: number;
    TotalLawsuitsAsOther: number;
}

export interface DataCompanyTypes {
    MatchKeys: string;
    Lawsuits: ProcessesTypes;
}

export interface ApiReturnDataCompanyTypes {
    Result: DataCompanyTypes[];
    QueryDate: string;
    QueryId: string;
}

export interface SocioTypes {
    socios_cpf_cnpj: string;
    socios_entrada: string;
    socios_faixa_etaria: string;
    socios_nome: string;
    socios_qualificacao: string;
}

export interface BasicDataCompanyTypes {
    socios?: SocioTypes[]; // Lista de sócios, se houver
    capital_social: string;
    cnae_principal: string;
    cnae_secundario: string;
    cnpj: string;
    data_abertura: string;
    data_exc_mei: string;
    data_exc_simples: string;
    data_mei: string;
    data_simples: string | null;
    data_sit_cad: string;
    ddd_1: string;
    ddd_2: string | null;
    email: string | null;
    fantasia: string;
    faturamento: string;
    log_bairro: string;
    log_cep: string;
    log_comp: string;
    log_municipio: string;
    log_nome: string;
    log_num: string;
    log_tipo: string;
    log_uf: string;
    matriz: string;
    natureza_juridica: string;
    opcao_mei: string;
    opcao_simples: string;
    porte: string;
    programas_especiais: []; // Especifique melhor se souber o tipo
    quadro_funcionarios: string;
    razao: string;
    regime_tributario: string;
    site: string;
    situacao_cadastral: string;
    tel_1: string;
    tel_2: string | null;
}
