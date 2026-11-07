import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';

import { FiltrosPesquisaLotes, Intervalo, Lote } from './lote.model';

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
  },
];

function dentroDoIntervalo(valor: number, intervalo: Intervalo<number | null>): boolean {
  return (intervalo.de === null || valor >= intervalo.de)
    && (intervalo.ate === null || valor <= intervalo.ate);
}

@Injectable({ providedIn: 'root' })
export class LotesService {
  pesquisar(filtros: FiltrosPesquisaLotes): Observable<Lote[]> {
    const responsavel = filtros.instituicaoResponsavel.trim().toLocaleLowerCase('pt-BR');
    const instituicao = filtros.instituicao.trim().toLocaleLowerCase('pt-BR');
    const datas = filtros.dataEntrada;

    const resultado = LOTES_INICIAIS.filter(lote =>
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
}