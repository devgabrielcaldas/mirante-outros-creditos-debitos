import { CurrencyPipe, DatePipe, registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { Component, input } from '@angular/core';

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
}