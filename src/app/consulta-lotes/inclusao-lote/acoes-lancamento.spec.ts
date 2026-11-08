import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { LotesService } from '../lotes.service';
import { ContasService } from './contas.service';
import { InclusaoLote } from './inclusao-lote';

describe('Ações dos lançamentos do rascunho', () => {
  let fixture: ComponentFixture<InclusaoLote>;
  let tela: HTMLElement;

  function clicar(seletor: string, texto?: string): void {
    const elementos = Array.from(tela.querySelectorAll<HTMLElement>(seletor));
    const elemento = texto === undefined
      ? elementos[0]
      : elementos.find(item => item.textContent?.trim() === texto);

    if (!elemento) {
      throw new Error(`Elemento ausente: ${seletor} ${texto ?? ''}`);
    }

    elemento.click();
    fixture.detectChanges();
  }

  function preencher(id: string, valor: string): void {
    const campo = tela.querySelector<HTMLInputElement | HTMLSelectElement>(`#${id}`)!;
    campo.value = valor;
    campo.dispatchEvent(new Event(campo.tagName === 'SELECT' ? 'change' : 'input'));
    fixture.detectChanges();
  }

  function confirmarFormulario(): void {
    tela.querySelector('form')!.dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();
  }

  function incluirPrimeiraLinha(): void {
    clicar('.entrada button', 'Incluir');
    preencher('conta-lancamento', '12345-6');
    clicar('[aria-label="Buscar conta corrente"]');
    preencher('valor-lancamento', '125,50');
    preencher('historico-lancamento', 'Lançamento Manual');
    preencher('documento-lancamento', 'DOC-101');
    preencher('pa-lancamento', 'Cooperativa');
    confirmarFormulario();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [InclusaoLote],
      providers: [{
        provide: ContasService,
        useValue: {
          buscar: () => of({ numero: '12345-6', titular: 'Mariana Alves' }),
        },
      }],
    });

    fixture = TestBed.createComponent(InclusaoLote);
    fixture.detectChanges();
    tela = fixture.nativeElement;

    const dialogo = tela.querySelector('dialog')!;
    dialogo.showModal = vi.fn();
    dialogo.close = () => dialogo.dispatchEvent(new Event('close'));
  });

  it('duplica, altera somente a cópia e salva os dois valores corretos', () => {
    const criarLote = vi.spyOn(TestBed.inject(LotesService), 'criarLote');

    incluirPrimeiraLinha();
    clicar('[aria-label="Selecionar lançamento 1"]');
    clicar('.acoes-lancamento button', 'Duplicar');

    expect(tela.querySelectorAll('tbody tr')).toHaveLength(2);
    expect(tela.querySelector<HTMLInputElement>(
      '[aria-label="Selecionar lançamento 2"]',
    )?.checked).toBe(true);

    clicar('.acoes-lancamento button', 'Alterar');
    preencher('valor-lancamento', '0,01');
    preencher('documento-lancamento', 'DOC-102');
    confirmarFormulario();

    const linhas = tela.querySelectorAll('tbody tr');
    expect(linhas[0].textContent).toContain('125,50');
    expect(linhas[0].textContent).toContain('DOC-101');
    expect(linhas[1].textContent).toContain('0,01');
    expect(linhas[1].textContent).toContain('DOC-102');

    clicar('.rascunho footer button', 'Salvar lote');

    expect(criarLote).toHaveBeenCalledTimes(1);
    expect(criarLote.mock.results[0].value).toMatchObject({
      quantidadeLancamentos: 2,
      valor: 125.51,
    });
  });

  it('abre a visualização somente leitura e remove apenas a linha confirmada', () => {
    incluirPrimeiraLinha();
    clicar('[aria-label="Selecionar lançamento 1"]');
    clicar('.acoes-lancamento button', 'Duplicar');
    clicar('.acoes-lancamento button', 'Visualizar');

    expect(tela.querySelector('dialog fieldset')?.hasAttribute('disabled')).toBe(true);
    expect(tela.querySelector('dialog button[type="submit"]')).toBeNull();

    clicar('dialog button', 'Fechar');
    clicar('.acoes-lancamento button', 'Excluir');
    clicar('.confirmacao button', 'Cancelar');
    expect(tela.querySelectorAll('tbody tr')).toHaveLength(2);

    clicar('.acoes-lancamento button', 'Excluir');
    clicar('.confirmacao button', 'Confirmar exclusão');

    expect(tela.querySelectorAll('tbody tr')).toHaveLength(1);
    expect(tela.querySelector('[aria-label="Selecionar lançamento 1"]')).not.toBeNull();
    expect(tela.querySelector('[aria-label="Selecionar lançamento 2"]')).toBeNull();
  });
});