import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { intervaloOrdenado } from './intervalo-ordenado.validator';

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
}