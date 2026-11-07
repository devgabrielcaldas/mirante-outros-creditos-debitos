import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Lote } from '../lote.model';
import { TabelaLotes } from './tabela-lotes';

function criarLote(id: number): Lote {
  return {
    id,
    instituicaoResponsavel: '0001',
    instituicao: '0002',
    dataEntrada: '2026-11-03',
    valor: 100,
    quantidadeLancamentos: 1,
    usuarioRegistro: 'teste',
    usuarioAprovacao: null,
    situacao: 'Aberto',
    dataHoraSituacao: '2026-11-03T10:00:00',
  };
}

describe('TabelaLotes', () => {
  let fixture: ComponentFixture<TabelaLotes>;
  let tela: HTMLElement;

  function checkbox(rotulo: string): HTMLInputElement {
    const elemento = tela.querySelector<HTMLInputElement>(
      `input[aria-label="${rotulo}"]`,
    );

    if (!elemento) {
      throw new Error(`Checkbox ausente: ${rotulo}`);
    }

    return elemento;
  }

  function botao(rotulo: string): HTMLButtonElement {
    const elemento = tela.querySelector<HTMLButtonElement>(
      `button[aria-label="${rotulo}"]`,
    );

    if (!elemento) {
      throw new Error(`Botão ausente: ${rotulo}`);
    }

    return elemento;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TabelaLotes] });

    fixture = TestBed.createComponent(TabelaLotes);
    fixture.componentRef.setInput('lotes', [2, 10, 11, 12].map(criarLote));
    fixture.detectChanges();

    tela = fixture.nativeElement;
  });

  it('indica seleção parcial e permite marcar e desmarcar a página inteira', () => {
    const todos = checkbox('Selecionar todos os lotes desta página');

    checkbox('Selecionar lote 2').click();
    fixture.detectChanges();

    expect(todos.indeterminate).toBe(true);
    expect(tela.querySelectorAll('tbody input:checked').length).toBe(1);

    todos.click();
    fixture.detectChanges();

    expect(todos.checked).toBe(true);
    expect(todos.indeterminate).toBe(false);
    expect(tela.querySelectorAll('tbody input:checked').length).toBe(2);

    todos.click();
    fixture.detectChanges();

    expect(tela.querySelectorAll('tbody input:checked').length).toBe(0);
  });

  it('limpa a seleção ao paginar e volta à primeira página ao receber outro resultado', () => {
    checkbox('Selecionar lote 2').click();
    fixture.detectChanges();

    expect(tela.querySelector('[role="status"]')?.textContent).toContain('1 de 2');

    botao('Próxima página').click();
    fixture.detectChanges();

    expect(checkbox('Selecionar lote 11').checked).toBe(false);
    expect(tela.querySelector('[role="status"]')?.textContent).toContain('0 de 2');
    expect(botao('Última página').disabled).toBe(true);

    checkbox('Selecionar lote 11').click();
    fixture.detectChanges();

    expect(checkbox('Selecionar lote 11').checked).toBe(true);
    expect(tela.querySelector('[role="status"]')?.textContent).toContain('1 de 2');

    fixture.componentRef.setInput('lotes', [criarLote(11)]);
    fixture.detectChanges();

    expect(tela.querySelector('.pagina-atual')?.textContent).toContain('Página 1 de 1');
    expect(tela.querySelector('[role="status"]')?.textContent).toContain('0 de 1');
    expect(checkbox('Selecionar lote 11').checked).toBe(false);
  });

  it('desabilita selecionar todos e oculta a paginação quando a pesquisa volta vazia', () => {
    fixture.componentRef.setInput('lotes', []);
    fixture.detectChanges();

    expect(checkbox('Selecionar todos os lotes desta página').disabled).toBe(true);
    expect(tela.querySelector('.paginacao')).toBeNull();
    expect(tela.textContent).toContain('Nenhum lote encontrado');
  });
});