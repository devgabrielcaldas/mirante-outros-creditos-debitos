import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { ContasService } from './contas.service';
import { InclusaoLote } from './inclusao-lote';
import { lerValorEmCentavos } from './lancamento.model';

describe('InclusaoLote', () => {
  let fixture: ComponentFixture<InclusaoLote>;
  let tela: HTMLElement;

  function preencher(id: string, valor: string): void {
    const campo = tela.querySelector<HTMLInputElement | HTMLSelectElement>(`#${id}`);

    if (!campo) {
      throw new Error(`Campo ausente: ${id}`);
    }

    campo.value = valor;
    campo.dispatchEvent(new Event(campo.tagName === 'SELECT' ? 'change' : 'input'));
  }

  function buscarConta(): void {
    tela.querySelector<HTMLButtonElement>('[aria-label="Buscar conta corrente"]')!.click();
    fixture.detectChanges();
  }

  function confirmar(): void {
    tela.querySelector('form')!.dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [InclusaoLote],
      providers: [
        {
          provide: ContasService,
          useValue: {
            buscar: () => of({ numero: '12345-6', titular: 'Mariana Alves' }),
          },
        },
      ],
    });

    fixture = TestBed.createComponent(InclusaoLote);
    fixture.detectChanges();
    tela = fixture.nativeElement;

    const dialogo = tela.querySelector('dialog')!;
    dialogo.close = vi.fn();
  });

  it('converte reais em centavos e rejeita zero, negativos e excesso de casas', () => {
    expect(lerValorEmCentavos('125,50')).toBe(12550);
    expect(lerValorEmCentavos('0,01')).toBe(1);
    expect(lerValorEmCentavos('0')).toBeNull();
    expect(lerValorEmCentavos('-1')).toBeNull();
    expect(lerValorEmCentavos('1,999')).toBeNull();
  });

  it('impede incluir quando os campos obrigatórios estão vazios', () => {
    confirmar();

    expect(tela.querySelector('tbody tr')).toBeNull();
    expect(tela.textContent).toContain('Informe o documento.');
    expect(tela.textContent).toContain('Selecione o histórico.');
  });

  it('limpa o titular ao alterar o número de uma conta já localizada', () => {
    preencher('conta-lancamento', '12345-6');
    buscarConta();
    expect(tela.querySelector('.titular')?.textContent).toContain('Mariana Alves');

    preencher('conta-lancamento', '67890-1');
    fixture.detectChanges();

    expect(tela.querySelector('.titular')).toBeNull();
  });

  it('inclui na grade um lançamento válido com a conta localizada e situação Pendente', () => {
    preencher('conta-lancamento', '12345-6');
    buscarConta();
    preencher('valor-lancamento', '125,50');
    preencher('historico-lancamento', 'Lançamento Manual');
    preencher('documento-lancamento', 'DOC-101');
    preencher('pa-lancamento', 'Cooperativa');

    confirmar();

    const linha = tela.querySelector('tbody tr');
    expect(linha?.textContent).toContain('Mariana Alves');
    expect(linha?.textContent).toContain('125,50');
    expect(linha?.textContent).toContain('DOC-101');
    expect(linha?.textContent).toContain('Pendente');
  });
});