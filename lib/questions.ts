/**
 * Catálogo de perguntas do Diagnóstico Inicial da Empresa.
 *
 * Espelha o array QUESTIONS de forms/index.html (repo forms-codesants).
 * Os `id` são o contrato entre o formulário e o CRM: ao mexer lá, mexa aqui.
 * O texto abaixo é a versão "plana" (o formulário quebra a frase em partes
 * para destacar trechos em verde; no CRM lemos a pergunta inteira).
 */

export type QuestionType = "text" | "tel" | "email" | "long" | "single" | "multi";

export type Question = {
  id: string;
  part: string;
  type: QuestionType;
  label: string;
  /** Versão curta para tabelas, gráficos e rótulos de coluna. */
  short: string;
  options?: string[];
  /** A pergunta aceita a opção "Outro" com texto livre. */
  other?: boolean;
};

export const IDENTITY_PART = "Identificação";

export const QUESTIONS: Question[] = [
  {
    id: "nome",
    part: IDENTITY_PART,
    type: "text",
    label: "Para começar, com quem eu falo?",
    short: "Nome",
  },
  {
    id: "telefone",
    part: IDENTITY_PART,
    type: "tel",
    label: "Um telefone ou WhatsApp para contato?",
    short: "Telefone",
  },
  {
    id: "empresa",
    part: IDENTITY_PART,
    type: "text",
    label: "Qual é o nome da sua empresa?",
    short: "Empresa",
  },
  {
    id: "email",
    part: IDENTITY_PART,
    type: "email",
    label: "E o seu e-mail?",
    short: "E-mail",
  },

  {
    id: "q1",
    part: "Parte 1 · Conhecendo a empresa",
    type: "long",
    label: "Conte um pouco sobre a história da empresa.",
    short: "História da empresa",
  },
  {
    id: "q2",
    part: "Parte 1 · Conhecendo a empresa",
    type: "text",
    label: "Se tivesse que resumir sua empresa em uma frase, qual seria?",
    short: "Resumo em uma frase",
  },
  {
    id: "q3",
    part: "Parte 1 · Conhecendo a empresa",
    type: "long",
    label: "Quais são os principais produtos ou serviços da empresa?",
    short: "Produtos e serviços",
  },

  {
    id: "q4",
    part: "Parte 2 · Momento atual do negócio",
    type: "single",
    label: "Como você descreveria o momento atual da empresa?",
    short: "Momento do negócio",
    options: [
      "Início das operações",
      "Crescimento",
      "Consolidação",
      "Expansão",
      "Reestruturação",
    ],
    other: true,
  },
  {
    id: "q5",
    part: "Parte 2 · Momento atual do negócio",
    type: "long",
    label: "Quais são os três maiores desafios da empresa hoje?",
    short: "Maiores desafios",
  },
  {
    id: "q6",
    part: "Parte 2 · Momento atual do negócio",
    type: "single",
    label: "Em qual faixa de faturamento mensal a empresa se encontra?",
    short: "Faturamento",
    options: [
      "Até R$ 20 mil",
      "R$ 20 mil a R$ 50 mil",
      "R$ 50 mil a R$ 100 mil",
      "R$ 100 mil a R$ 300 mil",
      "R$ 300 mil a R$ 1 milhão",
      "Acima de R$ 1 milhão",
      "Prefiro não informar",
    ],
  },
  {
    id: "q7",
    part: "Parte 2 · Momento atual do negócio",
    type: "long",
    label: "Qual é a principal meta da empresa para os próximos 12 meses?",
    short: "Meta de 12 meses",
  },

  {
    id: "q8",
    part: "Parte 3 · Marca e posicionamento",
    type: "long",
    label: "Como você gostaria que um cliente descrevesse sua empresa?",
    short: "Percepção desejada",
  },
  {
    id: "q9",
    part: "Parte 3 · Marca e posicionamento",
    type: "long",
    label: "Por que um cliente escolhe vocês e não um concorrente?",
    short: "Diferencial",
  },
  {
    id: "q10",
    part: "Parte 3 · Marca e posicionamento",
    type: "long",
    label: "Existe alguma percepção que vocês definitivamente NÃO querem transmitir?",
    short: "A evitar",
  },
  {
    id: "q11",
    part: "Parte 3 · Marca e posicionamento",
    type: "long",
    label: "Existem empresas cuja comunicação ou posicionamento vocês admiram?",
    short: "Referências",
  },

  {
    id: "q12",
    part: "Parte 4 · Clientes e vendas",
    type: "long",
    label: "Quem é o cliente ideal da empresa?",
    short: "Cliente ideal",
  },
  {
    id: "q13",
    part: "Parte 4 · Clientes e vendas",
    type: "multi",
    label: "Como um cliente normalmente conhece vocês?",
    short: "Canais de aquisição",
    options: ["Instagram", "Google", "Indicação", "WhatsApp", "LinkedIn", "Tráfego pago"],
    other: true,
  },
  {
    id: "q14",
    part: "Parte 4 · Clientes e vendas",
    type: "multi",
    label: "O que normalmente faz um cliente fechar negócio com vocês?",
    short: "Fatores de decisão",
    options: [
      "Preço",
      "Confiança",
      "Especialização",
      "Rapidez",
      "Atendimento",
      "Indicação",
    ],
    other: true,
  },
  {
    id: "q15",
    part: "Parte 4 · Clientes e vendas",
    type: "long",
    label: "Existe alguma dificuldade recorrente para fechar vendas?",
    short: "Objeções de venda",
  },

  {
    id: "q16",
    part: "Parte 5 · Operação e processos",
    type: "long",
    label:
      "Depois que um cliente fecha negócio, como funciona o processo até a entrega do serviço?",
    short: "Fluxo de entrega",
  },
  {
    id: "q17",
    part: "Parte 5 · Operação e processos",
    type: "long",
    label: "Quais atividades mais consomem tempo da equipe ou geram retrabalho?",
    short: "Gargalos de operação",
  },
  {
    id: "q18",
    part: "Parte 5 · Operação e processos",
    type: "multi",
    label: "Quais ferramentas ou sistemas vocês utilizam atualmente?",
    short: "Ferramentas em uso",
    options: [
      "WhatsApp",
      "Planilhas (Excel/Google Sheets)",
      "ERP",
      "CRM",
      "Agenda online",
      "Sistema próprio",
    ],
    other: true,
  },

  {
    id: "q19",
    part: "Parte 6 · Tecnologia e oportunidades",
    type: "long",
    label:
      "Se a tecnologia pudesse resolver apenas um problema da empresa hoje, qual seria?",
    short: "Problema nº 1 para tecnologia",
  },
  {
    id: "q20",
    part: "Parte 6 · Tecnologia e oportunidades",
    type: "long",
    label: "Além do site, existe algo que poderia ser melhorado com tecnologia?",
    short: "Outras oportunidades",
  },

  {
    id: "q21",
    part: "Materiais disponíveis",
    type: "multi",
    label: "Quais materiais vocês já possuem?",
    short: "Materiais disponíveis",
    options: [
      "Logo",
      "Manual da marca",
      "Identidade visual",
      "Fotos profissionais",
      "Vídeos",
      "Portfólio",
      "Cases",
      "Depoimentos",
      "Avaliações de clientes",
    ],
    other: true,
  },

  {
    id: "q22",
    part: "A pergunta mais importante",
    type: "long",
    label:
      "Daqui a um ano, você diz: “esse projeto superou completamente minhas expectativas”. O que precisaria ter acontecido?",
    short: "Definição de sucesso",
  },
];

export const QUESTIONS_BY_ID: Record<string, Question> = Object.fromEntries(
  QUESTIONS.map((q) => [q.id, q]),
);

/** As perguntas do diagnóstico em si, sem os campos de identificação. */
export const DIAGNOSTIC_QUESTIONS = QUESTIONS.filter((q) => q.part !== IDENTITY_PART);

/** Partes na ordem em que aparecem no formulário. */
export const PARTS = [...new Set(QUESTIONS.map((q) => q.part))];

export function questionsOfPart(part: string): Question[] {
  return QUESTIONS.filter((q) => q.part === part);
}
