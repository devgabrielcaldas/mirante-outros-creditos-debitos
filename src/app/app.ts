import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, switchMap } from 'rxjs';

import { AcoesLote, AlteracaoInstituicao } from './consulta-lotes/acoes-lote/acoes-lote';
import { FiltrosLotes } from './consulta-lotes/filtros-lotes/filtros-lotes';
import { InclusaoLote } from './consulta-lotes/inclusao-lote/inclusao-lote';
import { FiltrosPesquisaLotes, Lote } from './consulta-lotes/lote.model';
import { LotesService } from './consulta-lotes/lotes.service';
import { TabelaLotes } from './consulta-lotes/tabela-lotes/tabela-lotes';

@Component({
  selector: 'app-root',
  imports: [FiltrosLotes, InclusaoLote, AcoesLote, TabelaLotes],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly lotesService = inject(LotesService);
  private readonly pesquisas = new Subject<FiltrosPesquisaLotes>();
  private ultimosFiltros: FiltrosPesquisaLotes | null = null;

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
    this.executarPesquisa(filtros);
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

  private atualizarResultado(): void {
    if (this.ultimosFiltros) {
      this.executarPesquisa(this.ultimosFiltros);
    }
  }

  private executarPesquisa(filtros: FiltrosPesquisaLotes): void {
    this.carregando.set(true);
    this.pesquisas.next(filtros);
  }
}