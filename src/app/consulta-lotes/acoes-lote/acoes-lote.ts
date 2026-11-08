import { Component, input, linkedSignal, output } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import {
  Lote,
  OperacaoSituacao,
  podeConfirmar,
  podeEnviar,
} from '../lote.model';

type AcaoLote = 'visualizar' | 'alterar' | 'excluir' | 'confirmar' | 'justificativa';

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
  readonly situacaoSolicitada = output<OperacaoSituacao>();

  protected readonly podeEnviar = podeEnviar;
  protected readonly podeConfirmar = podeConfirmar;

  protected readonly acao = linkedSignal({
    source: this.lote,
    computation: (): AcaoLote | null => null,
  });

  protected readonly instituicao = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.pattern(/\S/)],
  });

  protected readonly justificativa = new FormControl('', { nonNullable: true });

  protected abrir(acao: AcaoLote): void {
    const lote = this.lote();

    if (!lote) {
      return;
    }

    if (acao === 'alterar') {
      this.instituicao.reset(lote.instituicao);
    }

    if (acao === 'confirmar') {
      this.justificativa.reset();
    }

    this.acao.set(acao);
  }

  protected fechar(): void {
    this.acao.set(null);
  }

  protected enviar(): void {
    const lote = this.lote();

    if (lote && podeEnviar(lote)) {
      this.fechar();
      this.situacaoSolicitada.emit({ tipo: 'enviar', id: lote.id });
    }
  }

  protected confirmar(): void {
    const lote = this.lote();

    if (lote && this.acao() === 'confirmar' && podeConfirmar(lote)) {
      this.fechar();
      this.situacaoSolicitada.emit({
        tipo: 'confirmar',
        id: lote.id,
        justificativa: this.justificativa.value,
      });
    }
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

    this.fechar();
    this.alteracaoConfirmada.emit({
      id: lote.id,
      instituicao: this.instituicao.value.trim(),
    });
  }

  protected excluir(): void {
    const lote = this.lote();

    if (lote && this.acao() === 'excluir') {
      this.fechar();
      this.exclusaoConfirmada.emit(lote.id);
    }
  }
}