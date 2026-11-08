export interface ContaCorrente {
  numero: string;
  titular: string;
}

export interface Lancamento {
  id: number;
  conta: ContaCorrente;
  valorCentavos: number;
  historico: string;
  estorno: boolean;
  documento: string;
  descricao: string;
  situacao: 'Pendente';
  pa: string;
}

export function lerValorEmCentavos(texto: string): number | null {
  const partes = /^(\d+)(?:,(\d{1,2}))?$/.exec(texto.trim());

  if (!partes) {
    return null;
  }

  const reais = Number(partes[1]);
  const centavos = Number((partes[2] ?? '').padEnd(2, '0'));
  const total = reais * 100 + centavos;

  return Number.isSafeInteger(total) && total > 0 ? total : null;
}