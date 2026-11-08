import { firstValueFrom } from 'rxjs';

import { FiltrosPesquisaLotes, SituacaoLote } from './lote.model';
import { LotesService } from './lotes.service';

function filtroDoLote(id: number, situacao: SituacaoLote | ''): FiltrosPesquisaLotes {
  return {
    instituicaoResponsavel: '',
    instituicao: '',
    situacao,
    idLote: { de: id, ate: id },
    valorLote: { de: null, ate: null },
    dataEntrada: { de: '', ate: '' },
  };
}

describe('Situação do lote', () => {
  let servico: LotesService;

  beforeEach(() => {
    servico = new LotesService();
  });

  it('envia um lote aberto e passa a encontrá-lo pelo filtro Enviado', async () => {
    servico.atualizarSituacao({ tipo: 'enviar', id: 2 });

    const [abertos, enviados] = await Promise.all([
      firstValueFrom(servico.pesquisar(filtroDoLote(2, 'Aberto'))),
      firstValueFrom(servico.pesquisar(filtroDoLote(2, 'Enviado'))),
    ]);

    expect(abertos).toEqual([]);
    expect(enviados).toHaveLength(1);
    expect(enviados[0].usuarioAprovacao).toBeNull();
  });

  it('confirma um lote enviado e registra aprovador, justificativa e data da operação', async () => {
    const inicio = Date.now();

    servico.atualizarSituacao({
      tipo: 'confirmar',
      id: 10,
      justificativa: '  Valores conferidos.  ',
    });

    const [lote] = await firstValueFrom(servico.pesquisar(filtroDoLote(10, 'Confirmado')));

    expect(lote.usuarioAprovacao).toBe('gabriel.caldas');
    expect(lote.justificativa).toBe('Valores conferidos.');
    expect(Date.parse(lote.dataHoraSituacao)).toBeGreaterThanOrEqual(inicio);
  });

  it('rejeita confirmação de lote aberto e reenvio de lote já enviado', async () => {
    expect(() => servico.atualizarSituacao({
      tipo: 'confirmar',
      id: 2,
      justificativa: '',
    })).toThrow('Somente lotes enviados');

    expect(() => servico.atualizarSituacao({
      tipo: 'enviar',
      id: 10,
    })).toThrow('Somente lotes abertos');

    const [lote] = await firstValueFrom(servico.pesquisar(filtroDoLote(2, 'Aberto')));
    expect(lote.usuarioAprovacao).toBeNull();
  });
});