import { firstValueFrom } from 'rxjs';

import { FiltrosPesquisaLotes } from './lote.model';
import { LotesService } from './lotes.service';

function filtrosVazios(): FiltrosPesquisaLotes {
  return {
    instituicaoResponsavel: '',
    instituicao: '',
    situacao: '',
    idLote: { de: null, ate: null },
    valorLote: { de: null, ate: null },
    dataEntrada: { de: '', ate: '' },
  };
}

describe('LotesService', () => {
  const servico = new LotesService();

  it('combina as instituições, a situação e os três intervalos inclusivos', async () => {
    const filtros: FiltrosPesquisaLotes = {
      instituicaoResponsavel: ' sicoob ',
      instituicao: '0002',
      situacao: 'Enviado',
      idLote: { de: 10, ate: 10 },
      valorLote: { de: 1250.50, ate: 1250.50 },
      dataEntrada: { de: '2026-11-03', ate: '2026-11-03' },
    };

    const resultado = await firstValueFrom(servico.pesquisar(filtros));

    expect(resultado.map(lote => lote.id)).toEqual([10]);
  });

  it('aplica um limite superior mesmo quando o limite inferior está vazio', async () => {
    const filtros = filtrosVazios();
    filtros.idLote.ate = 10;

    const resultado = await firstValueFrom(servico.pesquisar(filtros));

    expect(resultado.map(lote => lote.id)).toEqual([2, 10]);
  });

  it('considera zero um limite de valor preenchido', async () => {
    const filtros = filtrosVazios();
    filtros.valorLote.ate = 0;

    const resultado = await firstValueFrom(servico.pesquisar(filtros));

    expect(resultado).toEqual([]);
  });
});