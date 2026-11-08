import { Component, input, linkedSignal, output } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { Lote } from '../lote.model';

type AcaoLote = 'visualizar' | 'alterar' | 'excluir';

export interface AlteracaoInstituicao {
  id: number;
  instituicao: string;
}

@Component({
  selector: 'app-acoes-lote',
  imports: [ReactiveFormsModule],
  templateUrl: './acoes-lote.html',
  styleUrl: './acoes-lote.css',
})
export class AcoesLote {
  readonly lote = input.required<Lote | null>();
  readonly alteracaoConfirmada = output<AlteracaoInstituicao>();
  readonly exclusaoConfirmada = output<number>();

  protected readonly acao = linkedSignal({
    source: this.lote,
    computation: (): AcaoLote | null => null,
  });

  protected readonly instituicao = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.pattern(/\S/)],
  });

  protected abrir(acao: AcaoLote): void {
    const lote = this.lote();

    if (!lote) {
      return;
    }

    if (acao === 'alterar') {
      this.instituicao.reset(lote.instituicao);
    }

    this.acao.set(acao);
  }

  protected fechar(): void {
    this.acao.set(null);
  }

  protected salvar(): void {
    const lote = this.lote();

    if (!lote || this.acao() !== 'alterar') {
      return;
    }

    if (this.instituicao.invalid) {
      this.instituicao.markAsTouched();
      return;
    }

    this.acao.set(null);
    this.alteracaoConfirmada.emit({
      id: lote.id,
      instituicao: this.instituicao.value.trim(),
    });
  }

  protected excluir(): void {
    const lote = this.lote();

    if (!lote || this.acao() !== 'excluir') {
      return;
    }

    this.acao.set(null);
    this.exclusaoConfirmada.emit(lote.id);
  }
}