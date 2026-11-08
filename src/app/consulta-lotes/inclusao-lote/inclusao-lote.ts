import { CurrencyPipe } from '@angular/common';
import '@angular/common/locales/global/pt';
import { Component, computed, DestroyRef, inject, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { takeUntil } from 'rxjs';

import { LotesService } from '../lotes.service';
import { ContasService } from './contas.service';
import { ContaCorrente, Lancamento, lerValorEmCentavos } from './lancamento.model';

type ModoLancamento = 'incluir' | 'alterar' | 'visualizar';

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
  styleUrls: ['./inclusao-lote.css', './acoes-lancamento.css'],
})
export class InclusaoLote {
  readonly loteSalvo = output<number>();

  private readonly contasService = inject(ContasService);
  private readonly lotesService = inject(LotesService);
  private readonly destroyRef = inject(DestroyRef);
  private proximoId = 1;

  protected readonly lancamentos = signal<readonly Lancamento[]>([]);
  protected readonly idSelecionado = signal<number | null>(null);
  protected readonly selecionado = computed(() =>
    this.lancamentos().find(item => item.id === this.idSelecionado()) ?? null
  );

  protected readonly modo = signal<ModoLancamento>('incluir');
  protected readonly confirmarExclusao = signal(false);
  protected readonly contaLocalizada = signal<ContaCorrente | null>(null);
  protected readonly buscando = signal(false);
  protected readonly erroConta = signal('');
  protected readonly erroLote = signal('');

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

  protected selecionar(id: number): void {
    this.confirmarExclusao.set(false);
    this.idSelecionado.update(atual => atual === id ? null : id);
  }

  protected abrir(dialogo: HTMLDialogElement, modo: ModoLancamento): void {
    const item = this.selecionado();

    if (modo !== 'incluir' && !item) {
      return;
    }

    this.confirmarExclusao.set(false);
    this.modo.set(modo);
    this.formulario.reset();

    if (modo !== 'incluir' && item) {
      this.formulario.reset({
        conta: item.conta.numero,
        valor: (item.valorCentavos / 100).toFixed(2).replace('.', ','),
        historico: item.historico,
        estorno: item.estorno,
        documento: item.documento,
        descricao: item.descricao,
        pa: item.pa,
      });

      // A conta já foi localizada quando este lançamento foi criado.
      this.contaLocalizada.set(item.conta);
    }

    dialogo.showModal();
  }

  protected aoFechar(): void {
    this.formulario.reset();
    this.modo.set('incluir');
  }

  protected buscarConta(): void {
    const campo = this.campos.conta;
    campo.markAsTouched();

    if (campo.invalid || this.buscando() || this.modo() === 'visualizar') {
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

  protected confirmarFormulario(dialogo: HTMLDialogElement): void {
    if (this.modo() === 'visualizar') {
      return;
    }

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

    const editando = this.modo() === 'alterar';
    const id = editando ? this.selecionado()?.id : this.proximoId;

    if (id === undefined) {
      return;
    }

    const lancamento: Lancamento = {
      id,
      conta,
      valorCentavos,
      historico: dados.historico,
      estorno: dados.estorno,
      documento: dados.documento.trim(),
      descricao: dados.descricao.trim(),
      situacao: 'Pendente',
      pa: dados.pa,
    };

    if (editando) {
      this.lancamentos.update(itens =>
        itens.map(item => item.id === id ? lancamento : item)
      );
    } else {
      this.proximoId += 1;
      this.lancamentos.update(itens => [...itens, lancamento]);
    }

    this.erroLote.set('');
    dialogo.close();
  }

  protected duplicar(): void {
    const original = this.selecionado();

    if (!original) {
      return;
    }

    const copia: Lancamento = {
      ...original,
      id: this.proximoId++,
      conta: { ...original.conta },
    };

    this.confirmarExclusao.set(false);
    this.lancamentos.update(itens => [...itens, copia]);
    this.idSelecionado.set(copia.id);
    this.erroLote.set('');
  }

  protected excluirSelecionado(): void {
    const item = this.selecionado();

    if (!item || !this.confirmarExclusao()) {
      return;
    }

    this.lancamentos.update(itens => itens.filter(atual => atual.id !== item.id));
    this.idSelecionado.set(null);
    this.confirmarExclusao.set(false);
    this.erroLote.set('');
  }

  protected salvarLote(): void {
    const itens = this.lancamentos();

    if (itens.length === 0 || this.confirmarExclusao()) {
      return;
    }

    this.erroLote.set('');

    try {
      const lote = this.lotesService.criarLote(itens);
      this.lancamentos.set([]);
      this.idSelecionado.set(null);
      this.proximoId = 1;
      this.loteSalvo.emit(lote.id);
    } catch (erro) {
      this.erroLote.set(
        erro instanceof Error ? erro.message : 'Não foi possível salvar o lote.',
      );
    }
  }
}