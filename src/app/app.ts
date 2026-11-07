import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, switchMap } from 'rxjs';

import { FiltrosLotes } from './consulta-lotes/filtros-lotes/filtros-lotes';
import { FiltrosPesquisaLotes, Lote } from './consulta-lotes/lote.model';
import { LotesService } from './consulta-lotes/lotes.service';
import { TabelaLotes } from './consulta-lotes/tabela-lotes/tabela-lotes';

@Component({
  selector: 'app-root',
  imports: [FiltrosLotes, TabelaLotes],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly lotesService = inject(LotesService);
  private readonly pesquisas = new Subject<FiltrosPesquisaLotes>();

  protected readonly tituloModulo = 'Outros Créditos/Débitos';
  protected readonly carregando = signal(false);
  protected readonly resultado = signal<Lote[] | null>(null);

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
    this.carregando.set(true);
    this.pesquisas.next(filtros);
  }
}