function dois(n: number): string {
  return String(n).padStart(2, '0');
}

export function hojeIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${dois(d.getMonth() + 1)}-${dois(d.getDate())}`;
}

export function mesAtual(): string {
  return hojeIso().slice(0, 7);
}

export function primeiroDia(anoMes: string): string {
  return `${anoMes}-01`;
}

export function ultimoDia(anoMes: string): string {
  const [ano, mes] = anoMes.split('-').map(Number);
  const ultimo = new Date(ano, mes, 0).getDate();
  return `${anoMes}-${dois(ultimo)}`;
}
