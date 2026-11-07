export const SITUACOES_LOTE = ['Aberto', 'Enviado', 'Confirmado'] as const;

export type SituacaoLote = (typeof SITUACOES_LOTE)[number];

export interface Intervalo<T> {
  de: T;
  ate: T;
}

export interface FiltrosPesquisaLotes {
  instituicaoResponsavel: string;
  instituicao: string;
  situacao: SituacaoLote | '';
  idLote: Intervalo<number | null>;
  valorLote: Intervalo<number | null>;
  dataEntrada: Intervalo<string>;
}

export interface Lote {
  id: number;
  instituicaoResponsavel: string;
  instituicao: string;
  dataEntrada: string;
  valor: number;
  quantidadeLancamentos: number;
  usuarioRegistro: string;
  usuarioAprovacao: string | null;
  situacao: SituacaoLote;
  dataHoraSituacao: string;
}