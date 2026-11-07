import { CurrencyPipe, DatePipe, registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { Component, computed, input, linkedSignal } from '@angular/core';

import { Lote } from '../lote.model';

registerLocaleData(localePt, 'pt-BR');

@Component({
  selector: 'app-tabela-lotes',
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './tabela-lotes.html',
  styleUrl: './tabela-lotes.css',
})
export class TabelaLotes {
  readonly lotes = input.required<readonly Lote[]>();

  private readonly tamanhoPagina = 2;

  protected readonly pagina = linkedSignal({
    source: this.lotes,
    computation: () => 1,
  });

  protected readonly totalPaginas = computed(() =>
    Math.ceil(this.lotes().length / this.tamanhoPagina)
  );

  protected readonly lotesDaPagina = computed(() => {
    const inicio = (this.pagina() - 1) * this.tamanhoPagina;
    return this.lotes().slice(inicio, inicio + this.tamanhoPagina);
  });

  protected readonly selecionados = linkedSignal({
    source: this.lotesDaPagina,
    computation: () => new Set<number>(),
  });

  protected readonly todosSelecionados = computed(() => {
    const linhas = this.lotesDaPagina();
    return linhas.length > 0 && linhas.every(lote => this.selecionados().has(lote.id));
  });

  protected readonly selecaoParcial = computed(() =>
    this.selecionados().size > 0 && !this.todosSelecionados()
  );

  protected alternarLote(id: number): void {
    this.selecionados.update(atuais => {
      const proximos = new Set(atuais);

      if (proximos.has(id)) {
        proximos.delete(id);
      } else {
        proximos.add(id);
      }

      return proximos;
    });
  }

  protected alternarPaginaInteira(): void {
    const ids = this.todosSelecionados()
      ? []
      : this.lotesDaPagina().map(lote => lote.id);

    this.selecionados.set(new Set(ids));
  }

  protected irParaPagina(destino: number): void {
    if (destino >= 1 && destino <= this.totalPaginas()) {
      this.pagina.set(destino);
    }
  }
}