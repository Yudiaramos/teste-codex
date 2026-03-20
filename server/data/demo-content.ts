import { slugify } from "@/lib/utils";
import {
  type DemoUser,
  type FeaturedNorm,
  type NormChangeEvent,
  type NormRecord,
  type NormStatus,
  type NormTextVersion,
  type NormType,
  type TenantBundle,
  type TenantRecord,
  type TenantTheme
} from "@/types/domain";

const now = "2026-03-11T10:00:00.000Z";

function makeTheme(tenantId: string, name: string, description: string, popularity: number): TenantTheme {
  return {
    id: `${tenantId}-theme-${slugify(name)}`,
    tenantId,
    name,
    slug: slugify(name),
    description,
    popularity
  };
}

function makeTypes(tenantId: string): NormType[] {
  return [
    { id: `${tenantId}-type-ato-mesa`, tenantId, code: "ato-mesa", label: "Atos da Mesa" },
    { id: `${tenantId}-type-ato-presidencia`, tenantId, code: "ato-presidencia", label: "Atos da Presidência" },
    { id: `${tenantId}-type-decreto-legislativo`, tenantId, code: "decreto-legislativo", label: "Decretos Legislativos" },
    { id: `${tenantId}-type-decreto-municipal`, tenantId, code: "decreto-municipal", label: "Decretos Municipais" },
    { id: `${tenantId}-type-emenda-lei-organica`, tenantId, code: "emenda-lei-organica", label: "Emendas à Lei Orgânica" },
    { id: `${tenantId}-type-lei-complementar`, tenantId, code: "lei-complementar", label: "Leis Complementares" },
    { id: `${tenantId}-type-lei-ordinaria`, tenantId, code: "lei-ordinaria", label: "Leis Ordinárias" },
    { id: `${tenantId}-type-lei-organica`, tenantId, code: "lei-organica", label: "Lei Orgânica" },
    { id: `${tenantId}-type-resolucao`, tenantId, code: "resolucao", label: "Resoluções" }
  ];
}

function makeStatuses(tenantId: string): NormStatus[] {
  return [
    {
      id: `${tenantId}-status-vigente`,
      tenantId,
      code: "vigente",
      label: "Vigente",
      description: "Norma com eficacia atual."
    },
    {
      id: `${tenantId}-status-revogada`,
      tenantId,
      code: "revogada",
      label: "Revogada",
      description: "Norma sem vigencia."
    },
    {
      id: `${tenantId}-status-alterada`,
      tenantId,
      code: "alterada",
      label: "Alterada",
      description: "Norma vigente com alteracoes posteriores."
    },
    {
      id: `${tenantId}-status-historica`,
      tenantId,
      code: "historica",
      label: "Historica",
      description: "Norma mantida para consulta historica."
    }
  ];
}

function articleBlock(title: string, articles: string[]) {
  return [`${title}`, ...articles].join("\n\n");
}

function makeTextVersion(input: NormTextVersion): NormTextVersion {
  return input;
}

function makeChangeEvent(input: NormChangeEvent): NormChangeEvent {
  return input;
}

function setNormTracking(
  norms: NormRecord[],
  normId: string,
  tracking: {
    versions: NormTextVersion[];
    events: NormChangeEvent[];
  }
) {
  const norm = norms.find((item) => item.id === normId);

  if (!norm) {
    return;
  }

  norm.textVersions = tracking.versions;
  norm.changeEvents = tracking.events;
}

const piracicabaTenant: TenantRecord = {
  id: "tenant-piracicaba",
  slug: "piracicaba-sp",
  name: "Piracicaba",
  stateCode: "SP",
  layoutMode: "shared",
  branding: {
    logoUrl: "/tenants/piracicaba/logo.svg",
    crestUrl: "/tenants/piracicaba/crest.svg",
    heroImageUrl: "/tenants/piracicaba/hero.svg",
    colors: {
      primary: "#0E5875",
      secondary: "#D8EEF4",
      accent: "#D7A63B",
      muted: "#EDF6F8",
      surface: "#FFFFFF",
      foreground: "#12323F"
    }
  },
  profile: {
    cityName: "Piracicaba",
    stateCode: "SP",
    officialHeadline: "Portal oficial de consulta da legislacao municipal de Piracicaba",
    institutionalText:
      "Consulte leis, decretos e codigos municipais com linguagem clara, filtros objetivos e atalhos para os temas mais relevantes da cidade.",
    howToSearch: [
      "Comece pela busca simples se voce tiver um numero, assunto ou palavra-chave.",
      "Use a busca avancada para combinar tipo, ano, status, autoria e periodo.",
      "Abra o resumo em linguagem simples para entender rapidamente o efeito pratico da norma."
    ],
    strategicShortcuts: [
      {
        title: "Lei Organica",
        description: "Estrutura institucional e principios do municipio.",
        href: "/piracicaba-sp/resultados?type=Lei%20Organica"
      },
      {
        title: "Codigo Tributario",
        description: "Regras municipais de taxas, impostos e arrecadacao.",
        href: "/piracicaba-sp/resultados?theme=tributacao"
      },
      {
        title: "Codigo de Posturas",
        description: "Regras de convivencia, fiscalizacao e ordenamento urbano.",
        href: "/piracicaba-sp/resultados?theme=urbanismo"
      },
      {
        title: "Regimento Interno",
        description: "Normas de funcionamento da Camara e do processo legislativo.",
        href: "/piracicaba-sp/resultados?type=Resolucao"
      },
      {
        title: "Estrutura Administrativa",
        description: "Organizacao dos orgaos e secretarias municipais.",
        href: "/piracicaba-sp/resultados?theme=administracao"
      }
    ],
    homeSections: [
      {
        key: "featured",
        title: "Normas em destaque",
        description: "Atalhos para as normas mais consultadas e estrategicas."
      },
      {
        key: "most-accessed",
        title: "Mais acessadas",
        description: "Documentos consultados com maior frequencia nos ultimos meses."
      },
      {
        key: "recent",
        title: "Recentes",
        description: "Atualizacoes legislativas mais recentes."
      },
      {
        key: "themes",
        title: "Temas populares",
        description: "Navegue por assuntos relevantes para o dia a dia."
      },
      {
        key: "how-to-search",
        title: "Como pesquisar",
        description: "Orientacoes para usuarios leigos."
      }
    ],
    notices: [
      "As normas aqui apresentadas devem ser conferidas com as publicacoes oficiais em caso de duvida juridica.",
      "A plataforma destaca resumos em linguagem simples para facilitar a compreensao inicial."
    ]
  },
  popularThemeIds: [],
  highlightedNormIds: [],
  recentNormIds: [],
  mostAccessedNormIds: [],
  stats: {
    publishedNorms: 12438,
    monthlySearches: 58320,
    updatedThisYear: 187
  }
};

const campinasTenant: TenantRecord = {
  id: "tenant-campinas",
  slug: "campinas-sp",
  name: "Campinas",
  stateCode: "SP",
  layoutMode: "municipal-spotlight",
  branding: {
    logoUrl: "/tenants/campinas/logo.svg",
    crestUrl: "/tenants/campinas/crest.svg",
    heroImageUrl: "/tenants/campinas/hero.svg",
    colors: {
      primary: "#204F8C",
      secondary: "#DBE8F9",
      accent: "#E3A63B",
      muted: "#EEF4FB",
      surface: "#FFFFFF",
      foreground: "#14263E"
    }
  },
  profile: {
    cityName: "Campinas",
    stateCode: "SP",
    officialHeadline: "Legislacao municipal de Campinas com consulta orientada por contexto",
    institutionalText:
      "Portal digital para consulta de normas municipais com destaque para mobilidade, urbanismo, inovacao, fazenda e servicos publicos.",
    howToSearch: [
      "Pesquise pelo assunto, como mobilidade, IPTU ou zoneamento.",
      "Se souber o codigo da norma, combine numero e ano para chegar ao texto oficial mais rapido.",
      "Nos resultados, use os badges de situacao para diferenciar texto vigente, alterado ou historico."
    ],
    strategicShortcuts: [
      {
        title: "Lei Organica",
        description: "Base institucional e competencias do municipio.",
        href: "/campinas-sp/resultados?type=Lei%20Organica"
      },
      {
        title: "Codigo Tributario",
        description: "Tributos municipais, incentivos e obrigacoes acessorias.",
        href: "/campinas-sp/resultados?theme=tributacao"
      },
      {
        title: "Codigo de Posturas",
        description: "Atividades urbanas, licenciamento e fiscalizacao.",
        href: "/campinas-sp/resultados?theme=urbanismo"
      },
      {
        title: "Regimento Interno",
        description: "Fluxo de deliberacao e procedimentos do Legislativo.",
        href: "/campinas-sp/resultados?type=Resolucao"
      },
      {
        title: "Estrutura Administrativa",
        description: "Secretarias, competencias e governanca.",
        href: "/campinas-sp/resultados?theme=administracao"
      }
    ],
    homeSections: [
      {
        key: "featured",
        title: "Normas em destaque",
        description: "Normas estruturantes e consultas recorrentes."
      },
      {
        key: "stats",
        title: "Visao geral",
        description: "Indicadores do acervo e do uso da plataforma."
      },
      {
        key: "recent",
        title: "Atualizacoes recentes",
        description: "Novos atos e revisoes com maior impacto."
      },
      {
        key: "themes",
        title: "Explorar por tema",
        description: "Entre por assuntos mais buscados pela populacao."
      },
      {
        key: "how-to-search",
        title: "Como pesquisar",
        description: "Ajuda rapida para nao especialistas."
      }
    ],
    notices: [
      "Resultados podem ser refinados por tema, classificacao, iniciativa e periodo.",
      "Este ambiente foi desenhado para leitura em celular, tablet e desktop."
    ]
  },
  popularThemeIds: [],
  highlightedNormIds: [],
  recentNormIds: [],
  mostAccessedNormIds: [],
  stats: {
    publishedNorms: 21502,
    monthlySearches: 92410,
    updatedThisYear: 243
  }
};

const piracicabaThemes = [
  makeTheme(piracicabaTenant.id, "Tributacao", "IPTU, taxas, ISS e regras fiscais.", 91),
  makeTheme(piracicabaTenant.id, "Urbanismo", "Posturas, obras, uso do solo e ordenamento urbano.", 84),
  makeTheme(piracicabaTenant.id, "Administracao", "Estrutura de governo, orgaos e competencias.", 72),
  makeTheme(piracicabaTenant.id, "Educacao", "Programas, rede municipal e gestao escolar.", 68)
];

const campinasThemes = [
  makeTheme(campinasTenant.id, "Mobilidade", "Transito, transporte coletivo e acessibilidade.", 94),
  makeTheme(campinasTenant.id, "Tributacao", "Arrecadacao, incentivos e obrigacoes fiscais.", 88),
  makeTheme(campinasTenant.id, "Urbanismo", "Licenciamento, zoneamento e ordenamento territorial.", 86),
  makeTheme(campinasTenant.id, "Administracao", "Modelos de governanca e organizacao administrativa.", 79)
];

function findThemeId(themes: TenantTheme[], slug: string) {
  return themes.find((theme) => theme.slug === slug)?.id ?? "";
}

const piracicabaNorms: NormRecord[] = [
  {
    id: "piracicaba-lo-1",
    tenantId: piracicabaTenant.id,
    type: "lei-organica",
    typeLabel: "Lei Orgânica",
    number: "1",
    year: 1990,
    fullCode: "Lei Organica 1/1990",
    title: "Lei Organica do Municipio de Piracicaba",
    summary:
      "Dispoe sobre a organizacao politico-administrativa do municipio, competencias, controle social e principios da administracao publica local.",
    plainLanguageSummary:
      "E a norma principal do municipio. Ela define como a Prefeitura e a Camara funcionam, quais sao os poderes locais e quais principios devem ser respeitados nas politicas publicas.",
    fullText: articleBlock("Lei Organica do Municipio de Piracicaba", [
      "Art. 1 O Municipio de Piracicaba integra a Republica Federativa do Brasil e reger-se-a por esta Lei Organica.",
      "Art. 2 Sao principios da administracao municipal a legalidade, a impessoalidade, a moralidade, a publicidade, a eficiencia e a participacao social.",
      "Art. 3 Compete ao Municipio legislar sobre assuntos de interesse local, suplementar a legislacao federal e estadual e organizar os servicos publicos municipais.",
      "Art. 4 A Camara Municipal exercera a funcao legislativa, fiscalizadora e de controle externo, nos termos desta Lei Organica.",
      "Art. 5 O Poder Executivo sera exercido pelo Prefeito, auxiliado pelos Secretarios Municipais e demais orgaos da administracao direta e indireta."
    ]),
    publicationDate: "1990-04-04",
    effectiveDate: "1990-04-04",
    status: "vigente",
    classification: "Norma institucional",
    subject: "Organizacao do Municipio",
    authorship: "Mesa Diretora da Assembleia Constituinte Municipal",
    initiative: "Legislativo",
    sourceUrl: "https://www.legislacaodigital.com.br/Piracicaba-SP",
    pdfUrl: "https://example.com/piracicaba/lei-organica.pdf",
    accessCount: 1892,
    createdAt: now,
    updatedAt: now,
    themeIds: [findThemeId(piracicabaThemes, "administracao")],
    keywords: ["lei organica", "prefeitura", "camara", "competencias"],
    tags: ["lei-organica", "institucional", "estrutura-municipal"],
    attachments: [
      {
        id: "att-piracicaba-lo-1-pdf",
        normId: "piracicaba-lo-1",
        tenantId: piracicabaTenant.id,
        title: "Texto consolidado em PDF",
        url: "https://example.com/piracicaba/lei-organica.pdf",
        kind: "pdf"
      }
    ],
    relationships: [],
    changeHistory: [
      "Texto consolidado com emendas atualizadas ate marco de 2026.",
      "Atualizacao de formatacao e indice interno para leitura digital."
    ],
    isStrategic: true
  },
  {
    id: "piracicaba-lc-405",
    tenantId: piracicabaTenant.id,
    type: "lei-complementar",
    typeLabel: "Lei Complementar",
    number: "405",
    year: 2023,
    fullCode: "Lei Complementar 405/2023",
    title: "Institui o Codigo Tributario Digital do Municipio de Piracicaba",
    summary:
      "Atualiza regras de lancamento, notificacao eletronica e atendimento digital relativo aos tributos municipais.",
    plainLanguageSummary:
      "Essa norma reorganiza como o municipio cobra e comunica tributos. Ela amplia o uso de notificacoes digitais e deixa claro quando o contribuinte pode contestar lancamentos.",
    fullText: articleBlock("Lei Complementar 405/2023", [
      "Art. 1 Fica instituido o modelo digital de relacionamento tributario entre o Municipio e o contribuinte.",
      "Art. 2 As notificacoes poderao ser expedidas por meio eletronico, inclusive por domicilio tributario digital, garantido o acesso integral ao conteudo do ato.",
      "Art. 3 O contribuinte podera apresentar impugnacao administrativa por meio de plataforma digital municipal.",
      "Art. 3-A O Municipio mantera painel de acompanhamento do processo tributario digital com consulta por protocolo.",
      "Art. 4 O Poder Executivo regulamentara procedimentos operacionais e prazos complementares.",
      "Art. 5 Esta Lei Complementar entra em vigor na data de sua publicacao."
    ]),
    publicationDate: "2023-09-14",
    effectiveDate: "2023-09-14",
    status: "alterada",
    classification: "Tributaria",
    subject: "Tributacao digital",
    authorship: "Prefeitura Municipal de Piracicaba",
    initiative: "Executivo",
    sourceUrl: "https://www.legislacaodigital.com.br/Piracicaba-SP",
    pdfUrl: "https://example.com/piracicaba/lc-405-2023.pdf",
    accessCount: 1420,
    createdAt: now,
    updatedAt: now,
    themeIds: [findThemeId(piracicabaThemes, "tributacao"), findThemeId(piracicabaThemes, "administracao")],
    keywords: ["tributario", "notificacao", "digital", "iptu", "iss"],
    tags: ["lei-complementar", "tributacao", "digital"],
    attachments: [
      {
        id: "att-piracicaba-lc-405-pdf",
        normId: "piracicaba-lc-405",
        tenantId: piracicabaTenant.id,
        title: "PDF oficial",
        url: "https://example.com/piracicaba/lc-405-2023.pdf",
        kind: "pdf"
      },
      {
        id: "att-piracicaba-lc-405-guide",
        normId: "piracicaba-lc-405",
        tenantId: piracicabaTenant.id,
        title: "Guia de interpretacao simplificada",
        url: "https://example.com/piracicaba/lc-405-guia.pdf",
        kind: "guide"
      }
    ],
    relationships: [],
    changeHistory: [
      "Alterada pela Lei Complementar 418/2025 para ampliar os canais digitais.",
      "Consolidacao editorial publicada em janeiro de 2026."
    ],
    isStrategic: true
  },
  {
    id: "piracicaba-lc-418",
    tenantId: piracicabaTenant.id,
    type: "lei-complementar",
    typeLabel: "Lei Complementar",
    number: "418",
    year: 2025,
    fullCode: "Lei Complementar 418/2025",
    title: "Altera dispositivos da Lei Complementar 405/2023 para ampliar os canais digitais do contribuinte",
    summary:
      "Modifica regras de notificacao eletronica e acrescenta dispositivo sobre acompanhamento digital do processo tributario.",
    plainLanguageSummary:
      "Essa lei complementar mudou pontos da LC 405/2023. Ela ampliou os canais de notificacao digital e criou um painel para o contribuinte acompanhar seu processo.",
    fullText: articleBlock("Lei Complementar 418/2025", [
      "Art. 1 O art. 2 da Lei Complementar 405/2023 passa a vigorar com nova redacao para explicitar o domicilio tributario digital.",
      "Art. 2 Fica acrescido o art. 3-A a Lei Complementar 405/2023 para instituir painel de acompanhamento por protocolo.",
      "Art. 3 Esta Lei Complementar entra em vigor na data de sua publicacao."
    ]),
    publicationDate: "2025-07-22",
    effectiveDate: "2025-07-22",
    status: "vigente",
    classification: "Tributaria",
    subject: "Alteracao legislativa e processo tributario digital",
    authorship: "Prefeitura Municipal de Piracicaba",
    initiative: "Executivo",
    sourceUrl: "https://www.legislacaodigital.com.br/Piracicaba-SP",
    pdfUrl: "https://example.com/piracicaba/lc-418-2025.pdf",
    accessCount: 694,
    createdAt: now,
    updatedAt: now,
    themeIds: [findThemeId(piracicabaThemes, "tributacao"), findThemeId(piracicabaThemes, "administracao")],
    keywords: ["altera", "domicilio tributario digital", "painel de acompanhamento"],
    tags: ["lei-complementar", "tributacao", "alteracao"],
    attachments: [
      {
        id: "att-piracicaba-lc-418-pdf",
        normId: "piracicaba-lc-418",
        tenantId: piracicabaTenant.id,
        title: "PDF oficial",
        url: "https://example.com/piracicaba/lc-418-2025.pdf",
        kind: "pdf"
      }
    ],
    relationships: [],
    changeHistory: ["Lei complementar alteradora da LC 405/2023."]
  },
  {
    id: "piracicaba-lc-390",
    tenantId: piracicabaTenant.id,
    type: "lei-complementar",
    typeLabel: "Lei Complementar",
    number: "390",
    year: 2022,
    fullCode: "Lei Complementar 390/2022",
    title: "Atualiza o Codigo de Posturas do Municipio",
    summary:
      "Define regras para uso do espaco urbano, licenciamento de atividades e padroes de fiscalizacao administrativa.",
    plainLanguageSummary:
      "A norma organiza regras para funcionamento de atividades na cidade, uso de espaco publico e fiscalizacao. E util para comerciantes, moradores e prestadores de servico.",
    fullText: articleBlock("Lei Complementar 390/2022", [
      "Art. 1 Esta Lei Complementar estabelece padroes de posturas urbanas no Municipio.",
      "Art. 2 O exercicio de atividades economicas dependera de licenciamento e observancia das normas de convivencia urbana.",
      "Art. 3 A fiscalizacao podera lavrar autos, advertencias e demais medidas previstas em regulamento.",
      "Art. 4 O Municipio promovera orientacao previa para adequacao de pequenos empreendimentos.",
      "Art. 5 Revogam-se disposicoes em contrario."
    ]),
    publicationDate: "2022-05-10",
    effectiveDate: "2022-06-01",
    status: "vigente",
    classification: "Urbanistica",
    subject: "Posturas municipais",
    authorship: "Prefeitura Municipal de Piracicaba",
    initiative: "Executivo",
    sourceUrl: "https://www.legislacaodigital.com.br/Piracicaba-SP",
    pdfUrl: "https://example.com/piracicaba/lc-390-2022.pdf",
    accessCount: 1148,
    createdAt: now,
    updatedAt: now,
    themeIds: [findThemeId(piracicabaThemes, "urbanismo")],
    keywords: ["codigo de posturas", "licenciamento", "fiscalizacao"],
    tags: ["lei-complementar", "urbanismo", "posturas"],
    attachments: [
      {
        id: "att-piracicaba-lc-390-pdf",
        normId: "piracicaba-lc-390",
        tenantId: piracicabaTenant.id,
        title: "PDF oficial",
        url: "https://example.com/piracicaba/lc-390-2022.pdf",
        kind: "pdf"
      }
    ],
    relationships: [],
    changeHistory: ["Sem alteracoes estruturais desde a consolidacao de 2024."]
  },
  {
    id: "piracicaba-lei-6120",
    tenantId: piracicabaTenant.id,
    type: "lei-ordinaria",
    typeLabel: "Lei Ordinária",
    number: "6120",
    year: 2025,
    fullCode: "Lei 6120/2025",
    title: "Cria o Programa Municipal de Transparencia em Linguagem Simples",
    summary:
      "Institui diretrizes para producao de comunicacao publica clara, resumos cidadaos e explicacoes acessiveis dos atos normativos.",
    plainLanguageSummary:
      "A lei obriga o municipio a produzir textos mais claros para a populacao. Na pratica, ela incentiva resumos e orientacoes para quem nao tem formacao juridica.",
    fullText: articleBlock("Lei 6120/2025", [
      "Art. 1 Fica instituido o Programa Municipal de Transparencia em Linguagem Simples.",
      "Art. 2 Os orgaos municipais deverao produzir resumos cidadaos para normas de alto impacto social.",
      "Art. 3 O Poder Executivo podera editar guia de linguagem simples e acessibilidade textual.",
      "Art. 4 Esta Lei entra em vigor em 90 dias."
    ]),
    publicationDate: "2025-10-12",
    effectiveDate: "2026-01-10",
    status: "vigente",
    classification: "Administrativa",
    subject: "Transparencia e linguagem simples",
    authorship: "Comissao de Transparencia e Governo Aberto",
    initiative: "Legislativo",
    sourceUrl: "https://www.legislacaodigital.com.br/Piracicaba-SP",
    pdfUrl: "https://example.com/piracicaba/lei-6120-2025.pdf",
    accessCount: 804,
    createdAt: now,
    updatedAt: now,
    themeIds: [findThemeId(piracicabaThemes, "administracao"), findThemeId(piracicabaThemes, "educacao")],
    keywords: ["linguagem simples", "transparencia", "acessibilidade"],
    tags: ["lei-ordinaria", "transparencia", "comunicacao"],
    attachments: [
      {
        id: "att-piracicaba-lei-6120-pdf",
        normId: "piracicaba-lei-6120",
        tenantId: piracicabaTenant.id,
        title: "PDF oficial",
        url: "https://example.com/piracicaba/lei-6120-2025.pdf",
        kind: "pdf"
      }
    ],
    relationships: [],
    changeHistory: ["Publicada em outubro de 2025 e regulamentacao em elaboracao."]
  },
  {
    id: "piracicaba-decreto-19643",
    tenantId: piracicabaTenant.id,
    type: "decreto-municipal",
    typeLabel: "Decreto Municipal",
    number: "19643",
    year: 2026,
    fullCode: "Decreto 19643/2026",
    title: "Regulamenta a digitalizacao do acervo normativo municipal",
    summary:
      "Define procedimentos para indexacao, consolidacao editorial e publicacao de normas em portal digital.",
    plainLanguageSummary:
      "Esse decreto explica como a Prefeitura deve organizar e publicar normas em formato digital, incluindo atualizacao de metadados e revisao editorial.",
    fullText: articleBlock("Decreto 19643/2026", [
      "Art. 1 O acervo normativo municipal sera mantido em ambiente digital com metadados padronizados.",
      "Art. 2 O portal devera disponibilizar filtros por tipo, ano, tema, situacao e autoria.",
      "Art. 3 A consolidacao editorial nao substitui o texto oficial publicado no diario competente.",
      "Art. 4 Este Decreto entra em vigor na data de sua publicacao."
    ]),
    publicationDate: "2026-02-08",
    effectiveDate: "2026-02-08",
    status: "vigente",
    classification: "Administrativa",
    subject: "Governanca digital",
    authorship: "Prefeito Municipal",
    initiative: "Executivo",
    sourceUrl: "https://www.legislacaodigital.com.br/Piracicaba-SP",
    pdfUrl: "https://example.com/piracicaba/decreto-19643-2026.pdf",
    accessCount: 632,
    createdAt: now,
    updatedAt: now,
    themeIds: [findThemeId(piracicabaThemes, "administracao")],
    keywords: ["digitalizacao", "acervo", "portal", "indexacao"],
    tags: ["decreto-municipal", "digitalizacao", "acervo"],
    attachments: [
      {
        id: "att-piracicaba-decreto-19643-pdf",
        normId: "piracicaba-decreto-19643",
        tenantId: piracicabaTenant.id,
        title: "PDF oficial",
        url: "https://example.com/piracicaba/decreto-19643-2026.pdf",
        kind: "pdf"
      }
    ],
    relationships: [],
    changeHistory: ["Primeira publicacao em fevereiro de 2026."]
  }
];

piracicabaNorms.find((norm) => norm.id === "piracicaba-lc-405")?.relationships.push(
  {
    id: "rel-piracicaba-lc-405-418",
    normId: "piracicaba-lc-405",
    tenantId: piracicabaTenant.id,
    relatedNormId: "piracicaba-lc-418",
    relationType: "altera",
    label: "Alterada pela Lei Complementar 418/2025"
  },
  {
    id: "rel-piracicaba-lc-405-19643",
    normId: "piracicaba-lc-405",
    tenantId: piracicabaTenant.id,
    relatedNormId: "piracicaba-decreto-19643",
    relationType: "regulamenta",
    label: "Regulamentada pelo Decreto 19643/2026"
  }
);

const campinasNorms: NormRecord[] = [
  {
    id: "campinas-lo-1",
    tenantId: campinasTenant.id,
    type: "lei-organica",
    typeLabel: "Lei Orgânica",
    number: "1",
    year: 1990,
    fullCode: "Lei Organica 1/1990",
    title: "Lei Organica do Municipio de Campinas",
    summary:
      "Organiza a estrutura politico-administrativa do municipio e define competencias dos Poderes locais.",
    plainLanguageSummary:
      "Essa e a principal norma institucional da cidade. Ela explica quem faz o que na Prefeitura e na Camara e orienta a organizacao dos servicos municipais.",
    fullText: articleBlock("Lei Organica do Municipio de Campinas", [
      "Art. 1 O Municipio de Campinas reger-se-a por esta Lei Organica e pela Constituicao.",
      "Art. 2 Sao assegurados participacao popular, planejamento urbano e transparencia administrativa.",
      "Art. 3 O Municipio exercera competencias proprias e suplementares para atender ao interesse local.",
      "Art. 4 O Poder Legislativo sera exercido pela Camara Municipal.",
      "Art. 5 O Poder Executivo sera exercido pelo Prefeito."
    ]),
    publicationDate: "1990-04-05",
    effectiveDate: "1990-04-05",
    status: "vigente",
    classification: "Norma institucional",
    subject: "Organizacao do Municipio",
    authorship: "Assembleia Constituinte Municipal",
    initiative: "Legislativo",
    sourceUrl: "https://www.legislacaodigital.com.br/Piracicaba-SP",
    pdfUrl: "https://example.com/campinas/lei-organica.pdf",
    accessCount: 2300,
    createdAt: now,
    updatedAt: now,
    themeIds: [findThemeId(campinasThemes, "administracao")],
    keywords: ["lei organica", "camara", "prefeitura"],
    tags: ["lei-organica", "institucional", "estrutura-municipal"],
    attachments: [
      {
        id: "att-campinas-lo-1-pdf",
        normId: "campinas-lo-1",
        tenantId: campinasTenant.id,
        title: "Texto consolidado em PDF",
        url: "https://example.com/campinas/lei-organica.pdf",
        kind: "pdf"
      }
    ],
    relationships: [],
    changeHistory: ["Consolidada para leitura digital em 2026."],
    isStrategic: true
  },
  {
    id: "campinas-lc-478",
    tenantId: campinasTenant.id,
    type: "lei-complementar",
    typeLabel: "Lei Complementar",
    number: "478",
    year: 2024,
    fullCode: "Lei Complementar 478/2024",
    title: "Reformula o sistema de licenciamento urbano e atendimento digital",
    summary:
      "Cria procedimento integrado para licenciamento urbano com protocolos digitais e checklist unico.",
    plainLanguageSummary:
      "A norma simplifica o licenciamento urbano, reunindo exigencias em um fluxo unico e digital. O objetivo e reduzir retrabalho para moradores, empresas e tecnicos.",
    fullText: articleBlock("Lei Complementar 478/2024", [
      "Art. 1 Fica instituido o procedimento integrado de licenciamento urbano.",
      "Art. 2 O protocolo sera preferencialmente digital, com acompanhamento por painel unico e alertas de pendencias por etapa.",
      "Art. 3 Os orgaos competentes deverao publicar checklist e prazos padronizados.",
      "Art. 3-A O interessado podera consultar historico consolidado das exigencias e das decisoes administrativas.",
      "Art. 4 Esta Lei Complementar entra em vigor em 60 dias."
    ]),
    publicationDate: "2024-06-18",
    effectiveDate: "2024-08-17",
    status: "vigente",
    classification: "Urbanistica",
    subject: "Licenciamento urbano",
    authorship: "Prefeitura Municipal de Campinas",
    initiative: "Executivo",
    sourceUrl: "https://www.legislacaodigital.com.br/Piracicaba-SP",
    pdfUrl: "https://example.com/campinas/lc-478-2024.pdf",
    accessCount: 1622,
    createdAt: now,
    updatedAt: now,
    themeIds: [findThemeId(campinasThemes, "urbanismo"), findThemeId(campinasThemes, "administracao")],
    keywords: ["licenciamento", "urbano", "digital", "checklist"],
    tags: ["lei-complementar", "urbanismo", "licenciamento"],
    attachments: [
      {
        id: "att-campinas-lc-478-pdf",
        normId: "campinas-lc-478",
        tenantId: campinasTenant.id,
        title: "PDF oficial",
        url: "https://example.com/campinas/lc-478-2024.pdf",
        kind: "pdf"
      }
    ],
    relationships: [],
    changeHistory: ["Publicada em junho de 2024 com vigencia escalonada."],
    isStrategic: true
  },
  {
    id: "campinas-lc-491",
    tenantId: campinasTenant.id,
    type: "lei-complementar",
    typeLabel: "Lei Complementar",
    number: "491",
    year: 2025,
    fullCode: "Lei Complementar 491/2025",
    title: "Altera a Lei Complementar 478/2024 para ampliar transparencia do licenciamento urbano digital",
    summary:
      "Acrescenta historico consolidado de exigencias e atualiza o fluxo de alertas no procedimento digital de licenciamento.",
    plainLanguageSummary:
      "Essa lei complementar melhorou a LC 478/2024. Ela adicionou um historico consultavel das exigencias e reforcou o acompanhamento por alertas digitais.",
    fullText: articleBlock("Lei Complementar 491/2025", [
      "Art. 1 O art. 2 da Lei Complementar 478/2024 passa a vigorar com redacao que inclui alertas de pendencias por etapa.",
      "Art. 2 Fica acrescido o art. 3-A a Lei Complementar 478/2024 para consulta do historico consolidado das exigencias.",
      "Art. 3 Esta Lei Complementar entra em vigor na data de sua publicacao."
    ]),
    publicationDate: "2025-11-07",
    effectiveDate: "2025-11-07",
    status: "vigente",
    classification: "Urbanistica",
    subject: "Transparencia do licenciamento urbano digital",
    authorship: "Prefeitura Municipal de Campinas",
    initiative: "Executivo",
    sourceUrl: "https://www.legislacaodigital.com.br/Piracicaba-SP",
    pdfUrl: "https://example.com/campinas/lc-491-2025.pdf",
    accessCount: 655,
    createdAt: now,
    updatedAt: now,
    themeIds: [findThemeId(campinasThemes, "urbanismo"), findThemeId(campinasThemes, "administracao")],
    keywords: ["altera", "licenciamento", "historico consolidado", "alertas"],
    tags: ["lei-complementar", "urbanismo", "alteracao"],
    attachments: [
      {
        id: "att-campinas-lc-491-pdf",
        normId: "campinas-lc-491",
        tenantId: campinasTenant.id,
        title: "PDF oficial",
        url: "https://example.com/campinas/lc-491-2025.pdf",
        kind: "pdf"
      }
    ],
    relationships: [],
    changeHistory: ["Lei complementar alteradora da LC 478/2024."]
  },
  {
    id: "campinas-lei-15920",
    tenantId: campinasTenant.id,
    type: "lei-ordinaria",
    typeLabel: "Lei Ordinária",
    number: "15920",
    year: 2025,
    fullCode: "Lei 15920/2025",
    title: "Institui a Politica Municipal de Mobilidade Segura",
    summary:
      "Estabelece diretrizes para seguranca viaria, dados abertos e acessibilidade no sistema de mobilidade urbana.",
    plainLanguageSummary:
      "A lei orienta como a cidade deve planejar mobilidade com foco em seguranca, acessibilidade e transparencia de dados.",
    fullText: articleBlock("Lei 15920/2025", [
      "Art. 1 Fica instituida a Politica Municipal de Mobilidade Segura.",
      "Art. 2 A politica observara acessibilidade universal, seguranca viaria e transparencia de indicadores.",
      "Art. 3 O Municipio publicara relatorios periodicos de desempenho e metas.",
      "Art. 4 Esta Lei entra em vigor na data de sua publicacao."
    ]),
    publicationDate: "2025-09-02",
    effectiveDate: "2025-09-02",
    status: "vigente",
    classification: "Mobilidade",
    subject: "Mobilidade urbana",
    authorship: "Comissao de Transporte e Mobilidade",
    initiative: "Legislativo",
    sourceUrl: "https://www.legislacaodigital.com.br/Piracicaba-SP",
    pdfUrl: "https://example.com/campinas/lei-15920-2025.pdf",
    accessCount: 1194,
    createdAt: now,
    updatedAt: now,
    themeIds: [findThemeId(campinasThemes, "mobilidade")],
    keywords: ["mobilidade", "seguranca viaria", "dados abertos"],
    tags: ["lei-ordinaria", "mobilidade", "transito"],
    attachments: [
      {
        id: "att-campinas-lei-15920-pdf",
        normId: "campinas-lei-15920",
        tenantId: campinasTenant.id,
        title: "PDF oficial",
        url: "https://example.com/campinas/lei-15920-2025.pdf",
        kind: "pdf"
      }
    ],
    relationships: [],
    changeHistory: ["Lei publicada em setembro de 2025."]
  },
  {
    id: "campinas-decreto-23011",
    tenantId: campinasTenant.id,
    type: "decreto-municipal",
    typeLabel: "Decreto Municipal",
    number: "23011",
    year: 2026,
    fullCode: "Decreto 23011/2026",
    title: "Regulamenta o painel municipal de indicadores urbanos",
    summary:
      "Padroniza a publicacao de indicadores urbanos e integra informacoes de varias secretarias em uma unica camada de dados.",
    plainLanguageSummary:
      "Esse decreto obriga o municipio a publicar indicadores urbanos de forma organizada, facilitando consulta por tema e acompanhamento de metas.",
    fullText: articleBlock("Decreto 23011/2026", [
      "Art. 1 Fica instituido o Painel Municipal de Indicadores Urbanos.",
      "Art. 2 As secretarias deverao encaminhar dados conforme padrao tecnico definido pela administracao central.",
      "Art. 3 O painel devera conter historico, glossario e data da ultima atualizacao.",
      "Art. 4 Este Decreto entra em vigor na data de sua publicacao."
    ]),
    publicationDate: "2026-01-22",
    effectiveDate: "2026-01-22",
    status: "alterada",
    classification: "Administrativa",
    subject: "Dados publicos",
    authorship: "Prefeito Municipal",
    initiative: "Executivo",
    sourceUrl: "https://www.legislacaodigital.com.br/Piracicaba-SP",
    pdfUrl: "https://example.com/campinas/decreto-23011-2026.pdf",
    accessCount: 908,
    createdAt: now,
    updatedAt: now,
    themeIds: [findThemeId(campinasThemes, "administracao")],
    keywords: ["indicadores", "dados", "painel", "secretarias"],
    tags: ["decreto-municipal", "dados-abertos", "indicadores"],
    attachments: [
      {
        id: "att-campinas-decreto-23011-pdf",
        normId: "campinas-decreto-23011",
        tenantId: campinasTenant.id,
        title: "PDF oficial",
        url: "https://example.com/campinas/decreto-23011-2026.pdf",
        kind: "pdf"
      }
    ],
    relationships: [],
    changeHistory: ["Atualizado em marco de 2026 para ampliar o conjunto de indicadores."]
  },
  {
    id: "campinas-res-88",
    tenantId: campinasTenant.id,
    type: "resolucao",
    typeLabel: "Resolução",
    number: "88",
    year: 2023,
    fullCode: "Resolucao 88/2023",
    title: "Aprova o Regimento Interno digital da Camara Municipal",
    summary:
      "Consolida normas procedimentais do Legislativo com recursos de publicacao digital e trilhas de navegacao por assunto.",
    plainLanguageSummary:
      "A resolucao organiza o funcionamento interno da Camara e moderniza a publicacao do regimento para facilitar consulta.",
    fullText: articleBlock("Resolucao 88/2023", [
      "Art. 1 Fica aprovado o Regimento Interno digital da Camara Municipal.",
      "Art. 2 Os atos legislativos deverao ser publicados em formato navegavel e acessivel.",
      "Art. 3 Esta Resolucao entra em vigor na data de sua publicacao."
    ]),
    publicationDate: "2023-03-11",
    effectiveDate: "2023-03-11",
    status: "vigente",
    classification: "Legislativa",
    subject: "Processo legislativo",
    authorship: "Mesa Diretora da Camara Municipal",
    initiative: "Legislativo",
    sourceUrl: "https://www.legislacaodigital.com.br/Piracicaba-SP",
    pdfUrl: "https://example.com/campinas/resolucao-88-2023.pdf",
    accessCount: 722,
    createdAt: now,
    updatedAt: now,
    themeIds: [findThemeId(campinasThemes, "administracao")],
    keywords: ["regimento interno", "camara", "processo legislativo"],
    tags: ["resolucao", "regimento-interno", "processo-legislativo"],
    attachments: [
      {
        id: "att-campinas-res-88-pdf",
        normId: "campinas-res-88",
        tenantId: campinasTenant.id,
        title: "PDF oficial",
        url: "https://example.com/campinas/resolucao-88-2023.pdf",
        kind: "pdf"
      }
    ],
    relationships: [],
    changeHistory: ["Texto consolidado em ambiente digital em 2025."]
  }
];

campinasNorms.find((norm) => norm.id === "campinas-lc-478")?.relationships.push({
  id: "rel-campinas-lc-478-491",
  normId: "campinas-lc-478",
  tenantId: campinasTenant.id,
  relatedNormId: "campinas-lc-491",
  relationType: "altera",
  label: "Alterada pela Lei Complementar 491/2025"
});

setNormTracking(piracicabaNorms, "piracicaba-lc-405", {
  versions: [
    makeTextVersion({
      id: "version-piracicaba-lc-405-original",
      normId: "piracicaba-lc-405",
      tenantId: piracicabaTenant.id,
      label: "Texto original",
      kind: "original",
      validFrom: "2023-09-14",
      validTo: "2025-07-21",
      summary: "Texto promulgado da LC 405/2023.",
      fullText: articleBlock("Lei Complementar 405/2023", [
        "Art. 1 Fica instituido o modelo digital de relacionamento tributario entre o Municipio e o contribuinte.",
        "Art. 2 As notificacoes serao expedidas por meio oficial, inclusive fisico quando necessario, garantido o acesso ao conteudo do ato.",
        "Art. 3 O contribuinte podera apresentar impugnacao administrativa por meio de plataforma digital municipal.",
        "Art. 4 O Poder Executivo regulamentara procedimentos operacionais e prazos complementares.",
        "Art. 5 Esta Lei Complementar entra em vigor na data de sua publicacao."
      ]),
      plainLanguageSummary:
        "Versao original da norma, antes da ampliacao do domicilio tributario digital e antes da criacao do painel de acompanhamento."
    }),
    makeTextVersion({
      id: "version-piracicaba-lc-405-2025",
      normId: "piracicaba-lc-405",
      tenantId: piracicabaTenant.id,
      label: "Redacao apos LC 418/2025",
      kind: "alterada",
      validFrom: "2025-07-22",
      validTo: "2026-01-14",
      sourceNormId: "piracicaba-lc-418",
      summary: "Nova redacao do art. 2 e acrescimo do art. 3-A.",
      fullText: articleBlock("Lei Complementar 405/2023", [
        "Art. 1 Fica instituido o modelo digital de relacionamento tributario entre o Municipio e o contribuinte.",
        "Art. 2 As notificacoes poderao ser expedidas por meio eletronico, inclusive por domicilio tributario digital, garantido o acesso integral ao conteudo do ato.",
        "Art. 3 O contribuinte podera apresentar impugnacao administrativa por meio de plataforma digital municipal.",
        "Art. 3-A O Municipio mantera painel de acompanhamento do processo tributario digital com consulta por protocolo.",
        "Art. 4 O Poder Executivo regulamentara procedimentos operacionais e prazos complementares.",
        "Art. 5 Esta Lei Complementar entra em vigor na data de sua publicacao."
      ]),
      plainLanguageSummary:
        "Versao que incorporou a lei complementar alteradora e abriu o acompanhamento digital do processo tributario."
    }),
    makeTextVersion({
      id: "version-piracicaba-lc-405-vigente",
      normId: "piracicaba-lc-405",
      tenantId: piracicabaTenant.id,
      label: "Texto vigente consolidado",
      kind: "vigente",
      validFrom: "2026-01-15",
      sourceNormId: "piracicaba-decreto-19643",
      summary: "Texto consolidado para consulta publica apos revisao editorial.",
      fullText: articleBlock("Lei Complementar 405/2023", [
        "Art. 1 Fica instituido o modelo digital de relacionamento tributario entre o Municipio e o contribuinte.",
        "Art. 2 As notificacoes poderao ser expedidas por meio eletronico, inclusive por domicilio tributario digital, garantido o acesso integral ao conteudo do ato.",
        "Art. 3 O contribuinte podera apresentar impugnacao administrativa por meio de plataforma digital municipal.",
        "Art. 3-A O Municipio mantera painel de acompanhamento do processo tributario digital com consulta por protocolo.",
        "Art. 4 O Poder Executivo regulamentara procedimentos operacionais e prazos complementares.",
        "Art. 5 Esta Lei Complementar entra em vigor na data de sua publicacao."
      ]),
      plainLanguageSummary:
        "Versao consolidada atualmente exibida ao publico, com redacao vigente e padronizacao editorial.",
      isCurrent: true
    })
  ],
  events: [
    makeChangeEvent({
      id: "change-piracicaba-lc-405-art2",
      normId: "piracicaba-lc-405",
      tenantId: piracicabaTenant.id,
      kind: "nova-redacao",
      effectiveDate: "2025-07-22",
      target: "Art. 2",
      summary: "Nova redacao para explicitar o domicilio tributario digital.",
      sourceNormId: "piracicaba-lc-418",
      sourceNormCode: "Lei Complementar 418/2025",
      beforeText:
        "As notificacoes serao expedidas por meio oficial, inclusive fisico quando necessario, garantido o acesso ao conteudo do ato.",
      afterText:
        "As notificacoes poderao ser expedidas por meio eletronico, inclusive por domicilio tributario digital, garantido o acesso integral ao conteudo do ato.",
      notes: "Mudanca material relevante para o canal de comunicacao com o contribuinte.",
      order: 1
    }),
    makeChangeEvent({
      id: "change-piracicaba-lc-405-art3a",
      normId: "piracicaba-lc-405",
      tenantId: piracicabaTenant.id,
      kind: "acrescimo",
      effectiveDate: "2025-07-22",
      target: "Art. 3-A",
      summary: "Acrescenta painel de acompanhamento do processo tributario digital.",
      sourceNormId: "piracicaba-lc-418",
      sourceNormCode: "Lei Complementar 418/2025",
      afterText:
        "O Municipio mantera painel de acompanhamento do processo tributario digital com consulta por protocolo.",
      notes: "Dispositivo novo, inexistente no texto original.",
      order: 2
    }),
    makeChangeEvent({
      id: "change-piracicaba-lc-405-consolidacao",
      normId: "piracicaba-lc-405",
      tenantId: piracicabaTenant.id,
      kind: "consolidacao",
      effectiveDate: "2026-01-15",
      target: "Texto consolidado",
      summary: "Publicacao da redacao consolidada para consulta no portal.",
      sourceNormId: "piracicaba-decreto-19643",
      sourceNormCode: "Decreto 19643/2026",
      notes:
        "A consolidacao editorial melhora a leitura, mas nao substitui a publicacao oficial das normas alteradoras.",
      order: 3
    })
  ]
});

setNormTracking(campinasNorms, "campinas-lc-478", {
  versions: [
    makeTextVersion({
      id: "version-campinas-lc-478-original",
      normId: "campinas-lc-478",
      tenantId: campinasTenant.id,
      label: "Texto original",
      kind: "original",
      validFrom: "2024-06-18",
      validTo: "2025-11-06",
      summary: "Texto promulgado da LC 478/2024.",
      fullText: articleBlock("Lei Complementar 478/2024", [
        "Art. 1 Fica instituido o procedimento integrado de licenciamento urbano.",
        "Art. 2 O protocolo sera preferencialmente digital, com acompanhamento por painel unico.",
        "Art. 3 Os orgaos competentes deverao publicar checklist e prazos padronizados.",
        "Art. 4 Esta Lei Complementar entra em vigor em 60 dias."
      ]),
      plainLanguageSummary:
        "Versao inicial da norma, antes da inclusao dos alertas por etapa e do historico consolidado."
    }),
    makeTextVersion({
      id: "version-campinas-lc-478-vigente",
      normId: "campinas-lc-478",
      tenantId: campinasTenant.id,
      label: "Texto vigente consolidado",
      kind: "vigente",
      validFrom: "2025-11-07",
      sourceNormId: "campinas-lc-491",
      summary: "Versao consolidada apos a LC 491/2025.",
      fullText: articleBlock("Lei Complementar 478/2024", [
        "Art. 1 Fica instituido o procedimento integrado de licenciamento urbano.",
        "Art. 2 O protocolo sera preferencialmente digital, com acompanhamento por painel unico e alertas de pendencias por etapa.",
        "Art. 3 Os orgaos competentes deverao publicar checklist e prazos padronizados.",
        "Art. 3-A O interessado podera consultar historico consolidado das exigencias e das decisoes administrativas.",
        "Art. 4 Esta Lei Complementar entra em vigor em 60 dias."
      ]),
      plainLanguageSummary:
        "Versao atual da norma, com mais transparencia sobre exigencias e acompanhamento do licenciamento.",
      isCurrent: true
    })
  ],
  events: [
    makeChangeEvent({
      id: "change-campinas-lc-478-art2",
      normId: "campinas-lc-478",
      tenantId: campinasTenant.id,
      kind: "nova-redacao",
      effectiveDate: "2025-11-07",
      target: "Art. 2",
      summary: "Atualiza o fluxo digital para incluir alertas de pendencias por etapa.",
      sourceNormId: "campinas-lc-491",
      sourceNormCode: "Lei Complementar 491/2025",
      beforeText: "O protocolo sera preferencialmente digital, com acompanhamento por painel unico.",
      afterText:
        "O protocolo sera preferencialmente digital, com acompanhamento por painel unico e alertas de pendencias por etapa.",
      order: 1
    }),
    makeChangeEvent({
      id: "change-campinas-lc-478-art3a",
      normId: "campinas-lc-478",
      tenantId: campinasTenant.id,
      kind: "acrescimo",
      effectiveDate: "2025-11-07",
      target: "Art. 3-A",
      summary: "Cria historico consolidado das exigencias e das decisoes administrativas.",
      sourceNormId: "campinas-lc-491",
      sourceNormCode: "Lei Complementar 491/2025",
      afterText:
        "O interessado podera consultar historico consolidado das exigencias e das decisoes administrativas.",
      order: 2
    })
  ]
});

const piracicabaFeatured: FeaturedNorm[] = [
  {
    id: "feature-pira-1",
    tenantId: piracicabaTenant.id,
    normId: "piracicaba-lo-1",
    highlightText: "Norma fundamental do municipio",
    order: 1
  },
  {
    id: "feature-pira-2",
    tenantId: piracicabaTenant.id,
    normId: "piracicaba-lc-405",
    highlightText: "Tributacao e relacionamento digital com o contribuinte",
    order: 2
  },
  {
    id: "feature-pira-3",
    tenantId: piracicabaTenant.id,
    normId: "piracicaba-lc-390",
    highlightText: "Regras urbanas e fiscalizacao",
    order: 3
  }
];

const campinasFeatured: FeaturedNorm[] = [
  {
    id: "feature-cps-1",
    tenantId: campinasTenant.id,
    normId: "campinas-lo-1",
    highlightText: "Base institucional da cidade",
    order: 1
  },
  {
    id: "feature-cps-2",
    tenantId: campinasTenant.id,
    normId: "campinas-lc-478",
    highlightText: "Licenciamento urbano digital",
    order: 2
  },
  {
    id: "feature-cps-3",
    tenantId: campinasTenant.id,
    normId: "campinas-lei-15920",
    highlightText: "Mobilidade segura e dados abertos",
    order: 3
  }
];

piracicabaTenant.popularThemeIds = piracicabaThemes.slice(0, 3).map((theme) => theme.id);
piracicabaTenant.highlightedNormIds = piracicabaFeatured.map((item) => item.normId);
piracicabaTenant.recentNormIds = [...piracicabaNorms]
  .sort((a, b) => b.publicationDate.localeCompare(a.publicationDate))
  .slice(0, 3)
  .map((norm) => norm.id);
piracicabaTenant.mostAccessedNormIds = [...piracicabaNorms]
  .sort((a, b) => b.accessCount - a.accessCount)
  .slice(0, 3)
  .map((norm) => norm.id);

campinasTenant.popularThemeIds = campinasThemes.slice(0, 3).map((theme) => theme.id);
campinasTenant.highlightedNormIds = campinasFeatured.map((item) => item.normId);
campinasTenant.recentNormIds = [...campinasNorms]
  .sort((a, b) => b.publicationDate.localeCompare(a.publicationDate))
  .slice(0, 3)
  .map((norm) => norm.id);
campinasTenant.mostAccessedNormIds = [...campinasNorms]
  .sort((a, b) => b.accessCount - a.accessCount)
  .slice(0, 3)
  .map((norm) => norm.id);

export const demoBundles: TenantBundle[] = [
  {
    tenant: piracicabaTenant,
    themes: piracicabaThemes,
    normTypes: makeTypes(piracicabaTenant.id),
    normStatuses: makeStatuses(piracicabaTenant.id),
    norms: piracicabaNorms,
    featuredNorms: piracicabaFeatured
  },
  {
    tenant: campinasTenant,
    themes: campinasThemes,
    normTypes: makeTypes(campinasTenant.id),
    normStatuses: makeStatuses(campinasTenant.id),
    norms: campinasNorms,
    featuredNorms: campinasFeatured
  }
];

export const demoUsers: DemoUser[] = [
  {
    id: "user-global-admin",
    name: "Admin Global",
    email: "admin@legislacaodigital.dev",
    password: "admin123",
    role: "GLOBAL_ADMIN"
  },
  {
    id: "user-piracicaba-admin",
    name: "Gestor Piracicaba",
    email: "piracicaba@legislacaodigital.dev",
    password: "piracicaba123",
    role: "TENANT_ADMIN",
    tenantSlug: "piracicaba-sp"
  },
  {
    id: "user-campinas-admin",
    name: "Gestor Campinas",
    email: "campinas@legislacaodigital.dev",
    password: "campinas123",
    role: "TENANT_ADMIN",
    tenantSlug: "campinas-sp"
  }
];
