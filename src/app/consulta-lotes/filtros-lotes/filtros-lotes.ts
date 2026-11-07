import { Component, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { FiltrosPesquisaLotes, SITUACOES_LOTE, SituacaoLote } from '../lote.model';
import { intervaloOrdenado } from './intervalo-ordenado.validator';

@Component({
  selector: 'app-filtros-lotes',
  imports: [ReactiveFormsModule],
  templateUrl: './filtros-lotes.html',
  styleUrl: './filtros-lotes.css',
})
export class FiltrosLotes {
  readonly pesquisaSolicitada = output<FiltrosPesquisaLotes>();

  protected readonly expandido = signal(true);
  protected readonly situacoes = SITUACOES_LOTE;

  protected readonly formulario = new FormGroup({
    instituicaoResponsavel: new FormControl('', { nonNullable: true }),
    instituicao: new FormControl('', { nonNullable: true }),
    situacao: new FormControl<SituacaoLote | ''>('', { nonNullable: true }),

    idLote: new FormGroup(
      {
        de: new FormControl<number | null>(null),
        ate: new FormControl<number | null>(null),
      },
      { validators: intervaloOrdenado },
    ),

    valorLote: new FormGroup(
      {
        de: new FormControl<number | null>(null),
        ate: new FormControl<number | null>(null),
      },
      { validators: intervaloOrdenado },
    ),

    dataEntrada: new FormGroup(
      {
        de: new FormControl('', { nonNullable: true }),
        ate: new FormControl('', { nonNullable: true }),
      },
      { validators: intervaloOrdenado },
    ),
  });

  protected alternarPainel(): void {
    this.expandido.update(aberto => !aberto);
  }

  protected pesquisar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.pesquisaSolicitada.emit(this.formulario.getRawValue());
  }
}