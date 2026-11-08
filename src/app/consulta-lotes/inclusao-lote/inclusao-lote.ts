import { CurrencyPipe } from '@angular/common';
import '@angular/common/locales/global/pt';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { takeUntil } from 'rxjs';

import { ContasService } from './contas.service';
import { ContaCorrente, Lancamento, lerValorEmCentavos } from './lancamento.model';

const valorMonetario: ValidatorFn = controle => {
  if (controle.value === '') {
    return null;
  }

  return lerValorEmCentavos(controle.value) === null
    ? { valorMonetario: true }
    : null;
};

@Component({
  selector: 'app-inclusao-lote',
  imports: [ReactiveFormsModule, CurrencyPipe],
  templateUrl: './inclusao-lote.html',
  styleUrl: './inclusao-lote.css',
})
export class InclusaoLote {
  private readonly contasService = inject(ContasService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly lancamentos = signal<readonly Lancamento[]>([]);
  protected readonly contaLocalizada = signal<ContaCorrente | null>(null);
  protected readonly buscando = signal(false);
  protected readonly erroConta = signal('');

  protected readonly formulario = new FormGroup({
    conta: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^\d+-?\d$/)],
    }),
    valor: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, valorMonetario],
    }),
    historico: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    estorno: new FormControl(false, { nonNullable: true }),
    documento: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/\S/)],
    }),
    descricao: new FormControl('', { nonNullable: true }),
    pa: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  protected readonly campos = this.formulario.controls;

  constructor() {
    this.campos.conta.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => {
      this.contaLocalizada.set(null);
      this.erroConta.set('');
      this.buscando.set(false);
    });
  }

  protected abrir(dialogo: HTMLDialogElement): void {
    this.formulario.reset();
    dialogo.showModal();
  }

  protected aoFechar(): void {
    this.formulario.reset();
  }

  protected buscarConta(): void {
    const campo = this.campos.conta;
    campo.markAsTouched();

    if (campo.invalid || this.buscando()) {
      return;
    }

    this.contaLocalizada.set(null);
    this.erroConta.set('');
    this.buscando.set(true);

    this.contasService.buscar(campo.value).pipe(
      takeUntil(campo.valueChanges),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(conta => {
      this.buscando.set(false);
      this.contaLocalizada.set(conta);

      if (!conta) {
        this.erroConta.set('Conta corrente não encontrada.');
      }
    });
  }

  protected incluir(dialogo: HTMLDialogElement): void {
    this.formulario.markAllAsTouched();

    const conta = this.contaLocalizada();

    if (!conta && this.campos.conta.valid && !this.buscando() && !this.erroConta()) {
      this.erroConta.set('Busque a conta para confirmar o titular.');
    }

    if (this.formulario.invalid || !conta || this.buscando()) {
      return;
    }

    const dados = this.formulario.getRawValue();
    const valorCentavos = lerValorEmCentavos(dados.valor);

    if (valorCentavos === null) {
      return;
    }

    const lancamento: Lancamento = {
      id: (this.lancamentos().at(-1)?.id ?? 0) + 1,
      conta,
      valorCentavos,
      historico: dados.historico,
      estorno: dados.estorno,
      documento: dados.documento.trim(),
      descricao: dados.descricao.trim(),
      situacao: 'Pendente',
      pa: dados.pa,
    };

    this.lancamentos.update(atuais => [...atuais, lancamento]);
    dialogo.close();
  }
}