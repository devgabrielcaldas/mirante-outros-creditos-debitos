import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, switchMap } from 'rxjs';

import { AcoesLote, AlteracaoInstituicao } from './consulta-lotes/acoes-lote/acoes-lote';
import { FiltrosLotes } from './consulta-lotes/filtros-lotes/filtros-lotes';
import { InclusaoLote } from './consulta-lotes/inclusao-lote/inclusao-lote';
import { FiltrosPesquisaLotes, Lote, OperacaoSituacao } from './consulta-lotes/lote.model';
import { LotesService } from './consulta-lotes/lotes.service';
import { TabelaLotes } from './consulta-lotes/tabela-lotes/tabela-lotes';

const FILTROS_INICIAIS: FiltrosPesquisaLotes = {
  instituicaoResponsavel: '',
  instituicao: '',
  situacao: '',
  idLote: { de: null, ate: null },
  valorLote: { de: null, ate: null },
  dataEntrada: { de: '', ate: '' },
};

@Component({
  selector: 'app-root',
  imports: [FiltrosLotes, InclusaoLote, AcoesLote, TabelaLotes],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly lotesService = inject(LotesService);
  private readonly pesquisas = new Subject<FiltrosPesquisaLotes>();
  private ultimosFiltros = FILTROS_INICIAIS;

  protected readonly tituloModulo = 'Outros Créditos/Débitos';
  protected readonly carregando = signal(false);
  protected readonly resultado = signal<Lote[] | null>(null);
  protected readonly aviso = signal('');

  constructor() {
    this.pesquisas.pipe(
      switchMap(filtros => this.lotesService.pesquisar(filtros)),
      takeUntilDestroyed(),
    ).subscribe(lotes => {
      this.resultado.set(lotes);
      this.carregando.set(false);
    });
  }

  protected pesquisar(filtros: FiltrosPesquisaLotes): void {
    this.aviso.set('');
    this.ultimosFiltros = filtros;
    this.atualizarResultado();
  }

  protected aoSalvarLote(id: number): void {
    this.aviso.set(`Lote ${id} salvo com sucesso.`);
    this.atualizarResultado();
  }

  protected alterarLote(evento: AlteracaoInstituicao): void {
    this.lotesService.alterarInstituicao(evento.id, evento.instituicao);
    this.aviso.set(`Instituição do lote ${evento.id} atualizada.`);
    this.atualizarResultado();
  }

  protected excluirLote(id: number): void {
    this.lotesService.excluir(id);
    this.aviso.set(`Lote ${id} excluído.`);
    this.atualizarResultado();
  }

  protected atualizarSituacao(operacao: OperacaoSituacao): void {
    try {
      this.lotesService.atualizarSituacao(operacao);
      const situacao = operacao.tipo === 'enviar' ? 'enviado' : 'confirmado';
      this.aviso.set(`Lote ${operacao.id} ${situacao} com sucesso.`);
    } catch (erro) {
      this.aviso.set(
        erro instanceof Error ? erro.message : 'Não foi possível atualizar a situação do lote.',
      );
    }

    this.atualizarResultado();
  }

  private atualizarResultado(): void {
    this.carregando.set(true);
    this.pesquisas.next(this.ultimosFiltros);
  }
}