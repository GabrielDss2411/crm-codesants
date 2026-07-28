/** Formatação em pt-BR. Fixa o fuso para servidor e cliente concordarem. */

const TZ = "America/Sao_Paulo";

export function formatData(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: TZ,
  }).format(new Date(iso));
}

export function formatDataHora(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TZ,
  }).format(new Date(iso));
}

/** "há 3 dias", "há 2 h", "agora". */
export function tempoRelativo(iso: string, agora = Date.now()): string {
  const diff = agora - new Date(iso).getTime();
  const minutos = Math.round(diff / 60000);
  if (minutos < 1) return "agora";
  if (minutos < 60) return `há ${minutos} min`;
  const horas = Math.round(minutos / 60);
  if (horas < 24) return `há ${horas} h`;
  const dias = Math.round(horas / 24);
  if (dias < 30) return `há ${dias} ${dias === 1 ? "dia" : "dias"}`;
  const meses = Math.round(dias / 30);
  return `há ${meses} ${meses === 1 ? "mês" : "meses"}`;
}

/** Primeiras letras do nome, para o avatar. */
export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (!partes.length) return "?";
  const primeira = partes[0][0] ?? "";
  const ultima = partes.length > 1 ? (partes[partes.length - 1][0] ?? "") : "";
  return (primeira + ultima).toUpperCase();
}

/** Só os dígitos, no formato que o wa.me espera (com DDI do Brasil). */
export function linkWhatsApp(telefone: string): string | null {
  const digitos = telefone.replace(/\D/g, "");
  if (digitos.length < 10) return null;
  const comDdi = digitos.startsWith("55") ? digitos : `55${digitos}`;
  return `https://wa.me/${comDdi}`;
}

export function plural(n: number, singular: string, pluralForma: string): string {
  return `${n} ${n === 1 ? singular : pluralForma}`;
}
