import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

const SITUACOES_LOTE = ['Aberto', 'Enviado', 'Confirmado'] as const;
type SituacaoLote = (typeof SITUACOES_LOTE)[number];

@Component({
  selector: 'app-filtros-lotes',
  imports: [ReactiveFormsModule],
  templateUrl: './filtros-lotes.html',
  styleUrl: './filtros-lotes.css',
})
export class FiltrosLotes {
  protected readonly expandido = signal(true);
  protected readonly situacoes = SITUACOES_LOTE;

  protected readonly formulario = new FormGroup({
    situacao: new FormControl<SituacaoLote | ''>('', { nonNullable: true }),
  });

  protected alternarPainel(): void {
    this.expandido.update(aberto => !aberto);
  }
}