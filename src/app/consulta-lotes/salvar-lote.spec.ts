import { firstValueFrom } from 'rxjs';

import { Lancamento } from './inclusao-lote/lancamento.model';
import { FiltrosPesquisaLotes } from './lote.model';
import { LotesService } from './lotes.service';

function criarLancamento(id: number, valorCentavos: number): Lancamento {
  return {
    id,
    conta: { numero: '12345-6', titular: 'Mariana Alves' },
    valorCentavos,
    historico: 'Lançamento Manual',
    estorno: false,
    documento: `DOC-${id}`,
    descricao: '',
    situacao: 'Pendente',
    pa: 'Cooperativa',
  };
}

function pesquisarPorId(id: number): FiltrosPesquisaLotes {
  return {
    instituicaoResponsavel: '',
    instituicao: '',
    situacao: '',
    idLote: { de: id, ate: id },
    valorLote: { de: null, ate: null },
    dataEntrada: { de: '', ate: '' },
  };
}

describe('Salvar lote', () => {
  let servico: LotesService;

  beforeEach(() => {
    servico = new LotesService();
  });

  it('salva um lote aberto com dois lançamentos e o encontra pela consulta', async () => {
    const novo = servico.criarLote([
      criarLancamento(1, 12550),
      criarLancamento(2, 1),
    ]);

    const encontrados = await firstValueFrom(
      servico.pesquisar(pesquisarPorId(novo.id)),
    );

    expect(encontrados).toHaveLength(1);
    expect(encontrados[0]).toMatchObject({
      id: novo.id,
      situacao: 'Aberto',
      quantidadeLancamentos: 2,
      valor: 125.51,
      usuarioAprovacao: null,
    });
  });

  it('rejeita um lote sem lançamentos', () => {
    expect(() => servico.criarLote([])).toThrow('Inclua pelo menos um lançamento');
  });

  it('gera um novo ID mesmo após a exclusão do último lote criado', () => {
    const primeiro = servico.criarLote([criarLancamento(1, 100)]);
    servico.excluir(primeiro.id);

    const segundo = servico.criarLote([criarLancamento(1, 200)]);

    expect(segundo.id).toBeGreaterThan(primeiro.id);
  });
});