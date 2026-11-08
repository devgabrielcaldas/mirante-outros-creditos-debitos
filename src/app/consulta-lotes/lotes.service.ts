import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';

import { Lancamento } from './inclusao-lote/lancamento.model';
import {
  FiltrosPesquisaLotes,
  Intervalo,
  Lote,
  OperacaoSituacao,
  podeConfirmar,
  podeEnviar,
} from './lote.model';

type LoteEmMemoria = Lote & {
  lancamentos?: readonly Lancamento[];
};

const USUARIO_ATUAL = 'gabriel.caldas';

const LOTES_INICIAIS: Lote[] = [
  {
    id: 2,
    instituicaoResponsavel: '0001 - SICOOB',
    instituicao: '0002 - SICOOB Central',
    dataEntrada: '2026-04-26',
    valor: 1000,
    quantidadeLancamentos: 1,
    usuarioRegistro: 'ana.silva',
    usuarioAprovacao: null,
    situacao: 'Aberto',
    dataHoraSituacao: '2026-04-27T12:35:11',
  },
  {
    id: 10,
    instituicaoResponsavel: '0001 - SICOOB',
    instituicao: '0002 - SICOOB Central',
    dataEntrada: '2026-11-03',
    valor: 1250.50,
    quantidadeLancamentos: 2,
    usuarioRegistro: 'gabriel.caldas',
    usuarioAprovacao: null,
    situacao: 'Enviado',
    dataHoraSituacao: '2026-11-04T09:15:00',
  },
  {
    id: 11,
    instituicaoResponsavel: '0001 - SICOOB',
    instituicao: '0003 - Cooperativa Norte',
    dataEntrada: '2026-11-04',
    valor: 425.75,
    quantidadeLancamentos: 1,
    usuarioRegistro: 'bia.costa',
    usuarioAprovacao: null,
    situacao: 'Enviado',
    dataHoraSituacao: '2026-11-05T14:10:00',
  },
  {
    id: 12,
    instituicaoResponsavel: '0004 - Central Regional',
    instituicao: '0002 - SICOOB Central',
    dataEntrada: '2026-11-05',
    valor: 2500,
    quantidadeLancamentos: 3,
    usuarioRegistro: 'ana.silva',
    usuarioAprovacao: 'rui.lima',
    situacao: 'Confirmado',
    dataHoraSituacao: '2026-11-06T16:20:00',
    justificativa: 'Documentação conferida para o fechamento do lote.',
  },
];

function dentroDoIntervalo(valor: number, intervalo: Intervalo<number | null>): boolean {
  return (intervalo.de === null || valor >= intervalo.de)
    && (intervalo.ate === null || valor <= intervalo.ate);
}

function dataLocal(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}

@Injectable({ providedIn: 'root' })
export class LotesService {
  private lotes: LoteEmMemoria[] = LOTES_INICIAIS.map(lote => ({ ...lote }));
  private proximoId = Math.max(...LOTES_INICIAIS.map(lote => lote.id)) + 1;

  pesquisar(filtros: FiltrosPesquisaLotes): Observable<Lote[]> {
    const responsavel = filtros.instituicaoResponsavel.trim().toLocaleLowerCase('pt-BR');
    const instituicao = filtros.instituicao.trim().toLocaleLowerCase('pt-BR');
    const datas = filtros.dataEntrada;

    const resultado = this.lotes.filter(lote =>
      lote.instituicaoResponsavel.toLocaleLowerCase('pt-BR').includes(responsavel)
      && lote.instituicao.toLocaleLowerCase('pt-BR').includes(instituicao)
      && (filtros.situacao === '' || lote.situacao === filtros.situacao)
      && dentroDoIntervalo(lote.id, filtros.idLote)
      && dentroDoIntervalo(lote.valor, filtros.valorLote)
      && (datas.de === '' || lote.dataEntrada >= datas.de)
      && (datas.ate === '' || lote.dataEntrada <= datas.ate)
    );

    return of(resultado).pipe(delay(300));
  }

  criarLote(lancamentos: readonly Lancamento[]): Lote {
    if (lancamentos.length === 0) {
      throw new Error('Inclua pelo menos um lançamento antes de salvar o lote.');
    }

    const totalCentavos = lancamentos.reduce(
      (total, lancamento) => total + lancamento.valorCentavos,
      0,
    );

    if (!Number.isSafeInteger(totalCentavos)) {
      throw new Error('O valor total ultrapassa o limite permitido para o lote.');
    }

    const agora = new Date();

    const novoLote: LoteEmMemoria = {
      id: this.proximoId,
      instituicaoResponsavel: '0001 - SICOOB',
      instituicao: '0002 - SICOOB Central',
      dataEntrada: dataLocal(agora),
      valor: totalCentavos / 100,
      quantidadeLancamentos: lancamentos.length,
      usuarioRegistro: USUARIO_ATUAL,
      usuarioAprovacao: null,
      situacao: 'Aberto',
      dataHoraSituacao: agora.toISOString(),
      lancamentos: lancamentos.map(item => ({
        ...item,
        conta: { ...item.conta },
      })),
    };

    this.lotes = [novoLote, ...this.lotes];
    this.proximoId += 1;
    return novoLote;
  }

  atualizarSituacao(operacao: OperacaoSituacao): void {
    const atual = this.lotes.find(lote => lote.id === operacao.id);

    if (!atual) {
      throw new Error(`Lote ${operacao.id} não encontrado.`);
    }

    const dataHoraSituacao = new Date().toISOString();
    let atualizado: LoteEmMemoria;

    if (operacao.tipo === 'enviar') {
      if (!podeEnviar(atual)) {
        throw new Error('Somente lotes abertos podem ser enviados.');
      }

      atualizado = { ...atual, situacao: 'Enviado', dataHoraSituacao };
    } else {
      if (!podeConfirmar(atual)) {
        throw new Error('Somente lotes enviados podem ser confirmados.');
      }

      atualizado = {
        ...atual,
        situacao: 'Confirmado',
        usuarioAprovacao: USUARIO_ATUAL,
        justificativa: operacao.justificativa.trim(),
        dataHoraSituacao,
      };
    }

    this.lotes = this.lotes.map(lote => lote.id === atual.id ? atualizado : lote);
  }

  alterarInstituicao(id: number, instituicao: string): void {
    this.lotes = this.lotes.map(lote =>
      lote.id === id ? { ...lote, instituicao } : lote
    );
  }

  excluir(id: number): void {
    this.lotes = this.lotes.filter(lote => lote.id !== id);
  }
}