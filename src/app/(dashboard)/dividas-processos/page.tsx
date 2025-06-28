/* ----------------------------------------------------------------
   src/app/(dashboard)/dividas-processos/page.tsx
   – Dashboard de dívidas federais + processos judiciais
-----------------------------------------------------------------*/
"use client";

import { useCallback, useEffect, useRef, FormEvent } from "react";
import Chart from "chart.js/auto";
import type { Chart as ChartJS } from "chart.js";

/* libs pesadas só quando precisar -----------------------------------------*/
const importHtml2Canvas = () => import("html2canvas");
const importJsPDF       = () => import("jspdf").then((m) => m.jsPDF);

/* ----------------------------------------------------------------
   Tipagens auxiliares
-----------------------------------------------------------------*/
type Json = Record<string, unknown>;

interface DividaApi {
  dividas_numero?: unknown;
  dividas_tipo_devedor?: string;
  dividas_tipo_situacao?: string;
  dividas_inscricao?: string;
  dividas_receita?: string;
  dividas_data?: string;           // dd/mm/aaaa
  dividas_indicador?: string;
  dividas_valor?: string;
}

interface LawsuitsDistributionData {
  TotalLawsuits               : number;
  TypeDistribution            : Record<string, number>;
  CourtNameDistribution       : Record<string, number>;
  StatusDistribution          : Record<string, number>;
  StateDistribution           : Record<string, number>;
  PartyTypeDistribution       : Record<string, number>;
  CourtTypeDistribution       : Record<string, number>;
  CourtLevelDistribution      : Record<string, number>;
  CnjProcedureTypeDistribution: Record<string, number>;
  CnjSubjectDistribution      : Record<string, number>;
  CnjBroadSubjectDistribution : Record<string, number>;
}

/* ----------------------------------------------------------------
   Helpers de formatação
-----------------------------------------------------------------*/
const formatDate = (src: unknown) =>
  typeof src === "string" && src !== "00000000"
    ? src.replace(/^(\d{4})(\d{2})(\d{2})$/, "$3/$2/$1")
    : "Não informado";

const matrizOuFilial   = (c: unknown) => (c === "1" ? "Matriz" : "Filial");
const situacaoCadastral= (c: unknown) =>
  ({ "1":"Nula","2":"Ativa","3":"Suspensa","4":"Inapta","8":"Baixada" } as Record<string,string>)
    [String(c)] ?? "Desconhecida";

/* paleta fixa para doughnuts/pies */
const palette = ["#4caf50","#ff9800","#2196f3","#f44336","#9c27b0",
                 "#00bcd4","#8bc34a","#ffeb3b","#795548","#607d8b"];

/* ----------------------------------------------------------------
   Canvas wrapper (mantém 288 px de altura e 100 % de largura)
-----------------------------------------------------------------*/
const CanvasBox = ({ id }: { id: string }) => (
  <div className="relative w-full h-72">
    <canvas id={id} className="absolute inset-0 !w-full !h-full" />
  </div>
);

/* ----------------------------------------------------------------
   Tipo p/ definição de gráficos de dívida
-----------------------------------------------------------------*/
type DebtChartDef = {
  id   : string;
  title: string;
  field: keyof DividaApi;
  opts?: { year?:boolean; numeric?:boolean; ignoreCase?:boolean; sumSort?:boolean };
  type?: "bar" | "pie" | "doughnut";
  table?: string;
};

/* ----------------------------------------------------------------
   Componente
-----------------------------------------------------------------*/
export default function DividasProcessosPage() {
  /* refs mutáveis ----------------------------------------------------------*/
  const chartsRef   = useRef<Record<string, ChartJS>>({});
  const dividasRef  = useRef<DividaApi[]>([]);
  const filteredRef = useRef<DividaApi[]>([]);

  /* -------------------- chamadas às APIs ----------------------------------*/
  const consultarEmpresa = async (cnpj: string): Promise<Json> => {
    const r = await fetch(
      `https://www.quadros.adv.br/integration/proxy-cnpj.php?cnpj=${cnpj}`
    );
    if (!r.ok) throw new Error("Erro ao consultar empresa");
    return r.json();
  };

  const consultarProcessos = async (cnpj: string): Promise<LawsuitsDistributionData> => {
    const r = await fetch("https://plataforma.bigdatacorp.com.br/empresas",{
      method:"POST",
      headers:{
        AccessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiQ09OVEFUT0BRVUFEUk9TLkFEVi5CUiIsImp0aSI6IjE5NDY4ZmNjLTE4MWQtNDdkYS05ZTBmLTYwZWExY2E0NWU1OSIsIm5hbWVVc2VyIjoiUGF0cmljayBRdWFkcm9zIiwidW5pcXVlX25hbWUiOiJDT05UQVRPQFFVQURST1MuQURWLkJSIiwiZG9tYWluIjoiUVVBRFJPUyBBRFZPR0FET1MiLCJwcm9kdWN0cyI6WyJCSUdCT09TVCIsIkJJR0lEIl0sIm5iZiI6MTczNDM3MjU3NiwiZXhwIjoxNzY1OTA4NTc2LCJpYXQiOjE3MzQzNzI1NzYsImlzcyI6IkJpZyBEYXRhIENvcnAuIn0.MPYGXz99gJAJRS9lhrtP9BMJv0YoWQuFvYYXnVB9lcM",
        TokenId    :"67606ce03e60943f7cf2cbf7",
        "Content-Type":"application/json",
      },
      body: JSON.stringify({ Datasets:"lawsuits_distribution_data", q:`doc{${cnpj}}` }),
    });
    if (!r.ok) throw new Error("Erro ao consultar processos");
    const j = (await r.json()) as { Result:[{ LawsuitsDistributionData: LawsuitsDistributionData }] };
    return j.Result[0].LawsuitsDistributionData;
  };

  /* -------------------- limpeza de estado ---------------------------------*/
  const resetDashboard = () => {
    Object.values(chartsRef.current).forEach(c => c.destroy());
    chartsRef.current = {};

    [
      "empresa-details","total-debitos","totalLawsuits",
      /* tabelas */
      "typeTable","courtTable","statusTable","stateTable","partyTypeTable",
      "courtTypeTable","courtLevelTable","cnjProcedureTypeTable",
      "cnjSubjectTable","cnjBroadSubjectTable","receitaPrincipalTable",
    ].forEach(id => { const el = document.getElementById(id); if (el) el.innerHTML = ""; });

    document.getElementById("dashboard-content")?.classList.add("hidden");
  };

  /* -------------------- helpers de gráfico --------------------------------*/
  const colors = (n: number) => Array.from({length:n},(_,i)=>palette[i%palette.length]);

  const upsertChart = (id:string,cfg:ChartJS["config"]) => {
    const cvs = document.getElementById(id) as HTMLCanvasElement | null;
    if (!cvs) return;
    chartsRef.current[id]?.destroy();
    chartsRef.current[id] = new Chart(cvs,{
      ...cfg,
      options:{ ...cfg.options, responsive:true, maintainAspectRatio:false },
    });
  };

  /* -------------------- preparação de dados -------------------------------*/
  const prepDebt = (
    data:DividaApi[], field:keyof DividaApi,
    o:DebtChartDef["opts"]={}
  )=>{
    const {year,numeric,ignoreCase,sumSort}=o;

    if (numeric) {
      const vals = data.map(d=>Number(d[field]??0)).filter(v=>!isNaN(v)).sort((a,b)=>b-a);
      return { labels: vals.map((_,i)=>`CDA ${i+1}`), values: vals, sum: vals.reduce((a,b)=>a+b,0) };
    }

    const cnt:Record<string,number> = {};
    data.forEach(d=>{
      let k = String(d[field]??"");
      if (!k) return;
      if (year)     k = k.split("/")[2] ?? "Ano ?";
      if (ignoreCase) k = k.toLowerCase();
      cnt[k]=(cnt[k]??0)+1;
    });

    let ent = Object.entries(cnt);
    if (sumSort) ent = ent.sort((a,b)=>b[1]-a[1]);

    return {
      labels: ent.map(e=>e[0]),
      values: ent.map(e=>e[1]),
      sum   : ent.reduce((s, [, v]) => s + v, 0),
    };
  };

  const prepProc = (dist:Record<string,number>)=>{
    const sorted = Object.entries(dist).sort((a,b)=>b[1]-a[1]);
    const values = sorted.map(([,v])=>v);
    const total  = values.reduce((a,b)=>a+b,0);
    return {
      labels: sorted.map(e=>e[0]),
      values,
      perc  : values.map(v=>((v/total)*100).toFixed(2)),
    };
  };

  const table = (id:string,l:string[],v:number[],p:string[])=>{
    const el=document.getElementById(id);
    if(!el) return;
    el.innerHTML=`
      <table class="table table-bordered text-sm">
        <thead><tr><th>Categoria</th><th>Qtd</th><th>%</th></tr></thead>
        <tbody>${l.map((lab,i)=>`<tr><td>${lab}</td><td>${v[i]}</td><td>${p[i]}%</td></tr>`).join("")}</tbody>
      </table>`;
  };

  /* -------------------- fluxo principal -----------------------------------*/
  const displayData = useCallback(async(cnpj:string)=>{
    resetDashboard();

    const [emp,proc] = await Promise.all([ consultarEmpresa(cnpj), consultarProcessos(cnpj) ]);

    /* dívidas */
    dividasRef.current = Object.values<unknown>(emp).filter(
      (v):v is DividaApi => typeof v==="object" && v!==null && "dividas_numero" in v
    );
    filteredRef.current=[...dividasRef.current];
    document.getElementById("total-debitos")!.textContent =
      `Quantidade de CDAs: ${filteredRef.current.length}`;

    /* detalhes da empresa */
    document.getElementById("empresa-details")!.innerHTML = `
      <table class="table table-bordered text-xs md:text-sm">
        <tr><th>CNPJ</th><td>${emp.cnpj}</td><th>Razão Social</th><td>${emp.razao}</td></tr>
        <tr><th>Fantasia</th><td>${emp.fantasia||"–"}</td><th>Email</th><td>${emp.email||"–"}</td></tr>
        <tr><th>Endereço</th><td colspan="3">${emp.log_tipo} ${emp.log_nome}, ${emp.log_num} – ${emp.log_municipio}/${emp.log_uf}</td></tr>
        <tr><th>Matriz/Filial</th><td>${matrizOuFilial(emp.matriz)}</td><th>Situação</th><td>${situacaoCadastral(emp.situacao_cadastral)}</td></tr>
        <tr><th>Data Situação</th><td>${formatDate(emp.data_sit_cad)}</td><th>Data Abertura</th><td>${formatDate(emp.data_abertura)}</td></tr>
      </table>`;

    /* processos (total) */
    document.getElementById("totalLawsuits")!.textContent = String(proc.TotalLawsuits);

    /* helper p/ gráficos de processos */
    const mkProc = (cv:string,tb:string,dist:Record<string,number>,ttl:string,typ:"bar"|"pie"|"doughnut")=>{
      const {labels,values,perc}=prepProc(dist);
      upsertChart(cv,{
        type:typ,
        data:{ labels, datasets:[{ data:values, backgroundColor: typ==="bar" ? "rgba(54,162,235,.6)" : colors(values.length) }]},
        options:{
          plugins:{
            title:{display:true,text:ttl},
            legend:{display:typ!=="bar"},
            tooltip:{callbacks:{label:c=>`${c.raw} (${perc[c.dataIndex]}%)`}},
          },
          scales: typ==="bar"?{y:{beginAtZero:true},x:{ticks:{display:false}}}:{},
        },
      });
      table(tb,labels,values,perc);
    };

    mkProc("typeChart","typeTable",proc.TypeDistribution,"Tipo de Ação","bar");
    mkProc("courtNameChart","courtTable",proc.CourtNameDistribution,"Tribunal","bar");
    mkProc("statusChart","statusTable",proc.StatusDistribution,"Status do Processo","pie");
    mkProc("stateChart","stateTable",proc.StateDistribution,"Estado","bar");
    mkProc("partyTypeChart","partyTypeTable",proc.PartyTypeDistribution,"Tipo de Parte","doughnut");
    mkProc("courtTypeChart","courtTypeTable",proc.CourtTypeDistribution,"Tipo de Tribunal","doughnut");
    mkProc("courtLevelChart","courtLevelTable",proc.CourtLevelDistribution,"Nível do Tribunal","doughnut");
    mkProc("cnjProcedureTypeChart","cnjProcedureTypeTable",proc.CnjProcedureTypeDistribution,"Procedimento CNJ","bar");
    mkProc("cnjSubjectChart","cnjSubjectTable",proc.CnjSubjectDistribution,"Assunto CNJ","bar");
    mkProc("cnjBroadSubjectChart","cnjBroadSubjectTable",proc.CnjBroadSubjectDistribution,"Assunto Amplo CNJ","doughnut");

    /* gráficos de dívidas --------------------------------------------------*/
    const debtDefs: DebtChartDef[] = [
      { id:"chartValor",title:"Valor (Ordenado)",field:"dividas_valor",opts:{numeric:true,sumSort:true},type:"bar" },
      { id:"chartTipoDevedor",title:"Tipo Devedor",field:"dividas_tipo_devedor",opts:{ignoreCase:true},type:"doughnut" },
      { id:"chartTipoSituacao",title:"Tipo Situação",field:"dividas_tipo_situacao" },
      { id:"chartDetalheSituacao",title:"Detalhe Situação",field:"dividas_inscricao" },
      { id:"chartAjuizado",title:"Ajuizado",field:"dividas_indicador" },
      { id:"chartAnoInscricao",title:"Ano de Inscrição",field:"dividas_data",opts:{year:true},type:"pie" },
      { id:"chartReceitaPrincipal",title:"Receita Principal",field:"dividas_receita",opts:{ignoreCase:true,sumSort:true},type:"bar",table:"receitaPrincipalTable"},
    ];

    debtDefs.forEach(def=>{
      const {labels,values,sum} = prepDebt(filteredRef.current,def.field,def.opts);

      upsertChart(def.id,{
        type: def.type ?? "doughnut",
        data:{ labels, datasets:[{ data:values, backgroundColor: def.type==="bar" ? "rgba(75,192,192,.4)" : colors(values.length) }]},
        options:{
          plugins:{
            legend:{display:def.type!=="bar"},
            title:{display:true,text:
              def.id==="chartValor"
                ? `${def.title} - Total R$ ${sum.toLocaleString("pt-BR",{minimumFractionDigits:2})}`
                : def.title},
            tooltip:{callbacks:{label:c=>`${c.raw} (${((c.raw as number)/sum*100).toFixed(2)}%)`}},
          },
          scales: def.type==="bar"?{y:{beginAtZero:true},x:{ticks:{display:false}}}:{},
        },
      });

      if (def.table)
        table(def.table,labels,values,values.map(v=>((v/sum)*100).toFixed(2)));
    });

    document.getElementById("dashboard-content")!.classList.remove("hidden");
  },[]);

  /* esc = reset filtros ----------------------------------------------------*/
  useEffect(()=>{
    const esc = (e:KeyboardEvent)=>{
      if(e.key!=="Escape")return;
      const raw=(document.getElementById("cnpj") as HTMLInputElement).value;
      const cnpj=raw.replace(/\D/g,"");
      if(cnpj.length===14) displayData(cnpj);
    };
    document.addEventListener("keydown",esc);
    return()=>document.removeEventListener("keydown",esc);
  },[displayData]);

  /* form submit ------------------------------------------------------------*/
  const onSubmit = (e:FormEvent)=>{
    e.preventDefault();
    const raw=(document.getElementById("cnpj") as HTMLInputElement).value;
    const cnpj=raw.replace(/\D/g,"");
    if(cnpj.length!==14) return alert("CNPJ inválido");
    displayData(cnpj);
  };

  /* PDF --------------------------------------------------------------------*/
  const savePDF = async ()=>{
    const [{default:html2canvas},jsPDF] = await Promise.all([importHtml2Canvas(),importJsPDF()]);
    const root=document.getElementById("dashboard-root")!;
    const cvs = await html2canvas(root,{scale:2,useCORS:true});
    const pdf=new jsPDF("p","pt","a4");
    const w=pdf.internal.pageSize.getWidth();
    const h=(cvs.height*w)/cvs.width;
    const img=cvs.toDataURL("image/png");
    pdf.addImage(img,"PNG",0,0,w,h);
    for(let y=h-pdf.internal.pageSize.getHeight(),pos=-pdf.internal.pageSize.getHeight();y>0;y-=pdf.internal.pageSize.getHeight(),pos-=pdf.internal.pageSize.getHeight()){
      pdf.addPage(); pdf.addImage(img,"PNG",0,pos,w,h);
    }
    pdf.save(`dividas-${Date.now()}.pdf`);
  };

  /* JSX --------------------------------------------------------------------*/
  return (
    <div id="dashboard-root" className="md:ml-[250px] ml-[60px] p-4 min-h-screen bg-gray-50">
      <div className="container mx-auto bg-white shadow rounded p-4 md:p-8">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">
          Dashboard Interativo de Dívidas
        </h2>

        <form onSubmit={onSubmit} className="flex flex-wrap gap-2 mb-6">
          <input id="cnpj" className="border p-2 flex-1 rounded text-sm md:text-base" placeholder="Digite o CNPJ"/>
          <button className="btn btn-primary">Consultar</button>
          <button type="button" className="btn btn-success" onClick={savePDF}>Download PDF</button>
        </form>

        <div id="empresa-details" className="mb-6 overflow-x-auto text-xs md:text-sm"/>

        {/* DASHBOARD --------------------------------------------------------*/}
        <div id="dashboard-content" className="hidden">
          <p id="total-debitos" className="text-center mb-4 font-medium"/>
          <p className="text-center mb-4 font-medium">
            <strong>Total de Processos: </strong><span id="totalLawsuits">0</span>
          </p>

          {/* GRÁFICOS DE DÍVIDAS */}
          <h3 className="text-xl font-semibold text-center mb-2">Dívidas Detalhadas</h3>
          <div className="grid lg:grid-cols-2 gap-6">
            <CanvasBox id="chartValor"/>
            <CanvasBox id="chartTipoDevedor"/>
            <CanvasBox id="chartTipoSituacao"/>
            <CanvasBox id="chartDetalheSituacao"/>
            <CanvasBox id="chartAjuizado"/>
            <CanvasBox id="chartAnoInscricao"/>
            <div>
              <CanvasBox id="chartReceitaPrincipal"/>
              <div id="receitaPrincipalTable" className="small-table mt-2"/>
            </div>
          </div>

          <hr className="my-8"/>

          {/* PROCESSOS */}
          <h3 className="text-xl font-semibold text-center mb-4">Processos Judiciais</h3>

          {/* linha 1 */}
          <div className="grid lg:grid-cols-2 gap-6">
            <CanvasBox id="typeChart"/><div id="typeTable" className="small-table"/>
            <CanvasBox id="courtNameChart"/><div id="courtTable" className="small-table"/>
          </div>

          {/* linha 2 */}
          <div className="grid lg:grid-cols-2 gap-6 mt-8">
            <CanvasBox id="statusChart"/><div id="statusTable" className="small-table"/>
            <CanvasBox id="stateChart"/><div id="stateTable" className="small-table"/>
          </div>

          {/* linha 3 */}
          <div className="grid lg:grid-cols-2 gap-6 mt-8">
            <CanvasBox id="partyTypeChart"/><div id="partyTypeTable" className="small-table"/>
            <CanvasBox id="courtTypeChart"/><div id="courtTypeTable" className="small-table"/>
          </div>

          {/* linha 4 */}
          <div className="grid lg:grid-cols-2 gap-6 mt-8">
            <CanvasBox id="courtLevelChart"/><div id="courtLevelTable" className="small-table"/>
            <CanvasBox id="cnjProcedureTypeChart"/><div id="cnjProcedureTypeTable" className="small-table"/>
          </div>

          {/* linha 5 */}
          <div className="grid lg:grid-cols-2 gap-6 mt-8">
            <CanvasBox id="cnjSubjectChart"/><div id="cnjSubjectTable" className="small-table"/>
            <CanvasBox id="cnjBroadSubjectChart"/><div id="cnjBroadSubjectTable" className="small-table"/>
          </div>
        </div>
      </div>
    </div>
  );
}