/**
 * Catálogo de perguntas do Diagnóstico Estratégico.
 *
 * Espelha o array QUESTIONS de forms/index.html (repo forms-codesants).
 * Os `id` são o contrato entre o formulário e o CRM: ao mexer lá, mexa aqui.
 * O texto abaixo é a versão "plana" (o formulário quebra a frase em partes
 * para destacar trechos em verde; no CRM lemos a pergunta inteira).
 */

/**
 * "rank" é uma lista ordenada de itens digitados pela pessoa, onde a POSIÇÃO
 * carrega significado (1º = mais importante). Difere de "multi", em que a
 * ordem é irrelevante e os valores vêm de opções fixas.
 */
export type QuestionType =
  | "text"
  | "tel"
  | "email"
  | "long"
  | "single"
  | "multi"
  | "rank";

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
  /**
   * A pergunta tem um relato em texto além das opções, guardado em
   * `<id>__detalhe`. Marcar a área não responde: o relato é que responde.
   */
  detail?: boolean;
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
    part: "Parte 1 · Quero conhecer sua empresa",
    type: "long",
    label: "Se sua empresa estivesse sentada na minha frente, como ela se apresentaria?",
    short: "Apresentação da empresa",
  },
  {
    id: "q2",
    part: "Parte 1 · Quero conhecer sua empresa",
    type: "long",
    label: "O que faz vocês levantarem da cama todos os dias?",
    short: "Propósito",
  },
  {
    id: "q3",
    part: "Parte 1 · Quero conhecer sua empresa",
    type: "rank",
    label: "Qual é o serviço ou produto mais importante para o negócio hoje?",
    short: "Serviços por prioridade",
  },
  {
    id: "q4",
    part: "Parte 1 · Quero conhecer sua empresa",
    type: "long",
    label: "Se eu indicasse sua empresa a um amigo, como você gostaria que eu a descrevesse?",
    short: "Posicionamento",
  },

  {
    id: "q5",
    part: "Parte 2 · Entendendo o momento da empresa",
    type: "long",
    label: "Como está a empresa hoje?",
    short: "Momento atual",
  },
  {
    id: "q6",
    part: "Parte 2 · Entendendo o momento da empresa",
    type: "long",
    label: "De onde vêm a maioria dos seus clientes hoje?",
    short: "Origem dos clientes",
  },
  {
    id: "q7",
    part: "Parte 2 · Entendendo o momento da empresa",
    type: "multi",
    label: "Quando um cliente decide contratar, o que costuma convencer a decisão?",
    short: "Fatores de decisão",
    options: ["Preço", "Confiança", "Rapidez", "Especialização", "Atendimento"],
    other: true,
  },
  {
    id: "q8",
    part: "Parte 2 · Entendendo o momento da empresa",
    type: "long",
    label: "Existe alguma dificuldade recorrente para fechar vendas?",
    short: "Objeções de venda",
  },
  {
    id: "q9",
    part: "Parte 2 · Entendendo o momento da empresa",
    type: "single",
    label: "Em qual faixa de faturamento mensal a empresa se encontra?",
    short: "Faturamento",
    options: [
      "Até R$ 20 mil",
      "R$ 20 mil a R$ 50 mil",
      "R$ 50 mil a R$ 100 mil",
      "R$ 100 mil a R$ 300 mil",
      "Acima de R$ 300 mil",
      "Prefiro não informar",
    ],
  },
  {
    id: "q10",
    part: "Parte 2 · Entendendo o momento da empresa",
    type: "long",
    label: "Existe alguma meta importante para os próximos 12 meses?",
    short: "Meta de 12 meses",
  },

  {
    id: "q11",
    part: "Parte 3 · Um site que realmente gere resultado",
    type: "long",
    label: "Nos primeiros 10 segundos no site, o que o visitante deveria pensar?",
    short: "Primeiros 10 segundos",
  },
  {
    id: "q12",
    part: "Parte 3 · Um site que realmente gere resultado",
    type: "single",
    label: "Depois desses 10 segundos, qual deveria ser a próxima atitude?",
    short: "Ação principal",
    options: [
      "Pedir orçamento",
      "Enviar mensagem",
      "Agendar uma reunião",
      "Ligar",
      "Conhecer um serviço",
    ],
    other: true,
  },
  {
    id: "q13",
    part: "Parte 3 · Um site que realmente gere resultado",
    type: "long",
    label: "Quem é o cliente ideal da sua empresa?",
    short: "Cliente ideal",
  },
  {
    id: "q14",
    part: "Parte 3 · Um site que realmente gere resultado",
    type: "long",
    label: "Por que um cliente escolhe vocês e não um concorrente?",
    short: "Diferencial",
  },
  {
    id: "q15",
    part: "Parte 3 · Um site que realmente gere resultado",
    type: "long",
    label: "Existe algum serviço que vocês gostariam de vender mais?",
    short: "Serviço a impulsionar",
  },
  {
    id: "q16",
    part: "Parte 3 · Um site que realmente gere resultado",
    type: "long",
    label: "Quais dúvidas os clientes têm antes de contratar vocês?",
    short: "Dúvidas frequentes",
  },
  {
    id: "q17",
    part: "Parte 3 · Um site que realmente gere resultado",
    type: "long",
    label: "Se um concorrente visitasse seu site, o que gostaria que ele percebesse?",
    short: "Percepção da concorrência",
  },
  {
    id: "q18",
    part: "Parte 3 · Um site que realmente gere resultado",
    type: "multi",
    label: "Existe algo que você definitivamente NÃO quer transmitir?",
    short: "A evitar",
    options: [
      "Empresa pequena",
      "Empresa amadora",
      "Empresa cara",
      "Empresa popular",
      "Empresa fria",
      "Empresa distante",
    ],
    other: true,
  },
  {
    id: "q19",
    part: "Parte 3 · Um site que realmente gere resultado",
    type: "long",
    label: "Quais empresas transmitem uma imagem que você admira?",
    short: "Referências",
  },
  {
    id: "q20",
    part: "Parte 3 · Um site que realmente gere resultado",
    type: "multi",
    label: "Quais materiais vocês já possuem?",
    short: "Materiais disponíveis",
    options: [
      "Logo",
      "Manual da marca",
      "Fotos profissionais",
      "Vídeos",
      "Depoimentos",
      "Cases",
      "Avaliações",
      "Portfólio",
    ],
    other: true,
  },

  {
    id: "q21",
    part: "Parte 4 · Além do site",
    type: "multi",
    label: "Existe algum processo da empresa que poderia ser mais eficiente?",
    short: "Processos a melhorar",
    options: [
      "Atendimento",
      "Comercial",
      "Marketing",
      "Financeiro",
      "Operação",
      "Gestão",
      "Comunicação",
    ],
    other: true,
    detail: true,
  },
  {
    id: "q22",
    part: "Parte 4 · Além do site",
    type: "long",
    label: "Existe alguma atividade repetitiva que consome muito tempo da equipe?",
    short: "Trabalho repetitivo",
  },
  {
    id: "q23",
    part: "Parte 4 · Além do site",
    type: "long",
    label:
      "Se você pudesse resolver apenas um problema da empresa através da tecnologia, qual seria?",
    short: "Problema nº 1 para tecnologia",
  },
  {
    id: "q24",
    part: "Parte 4 · Além do site",
    type: "long",
    label: "Vocês usam alguma ferramenta ou sistema que não atende mais à empresa?",
    short: "Ferramenta insuficiente",
  },
  {
    id: "q25",
    part: "Parte 4 · Além do site",
    type: "long",
    label: "Existe algum projeto ou ideia que vocês gostariam de colocar em prática?",
    short: "Projeto futuro",
  },

  {
    id: "q26",
    part: "A última pergunta, e a mais importante",
    type: "long",
    label:
      "Daqui a um ano, você diz: “esse projeto superou minhas expectativas”. O que precisaria ter acontecido?",
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
