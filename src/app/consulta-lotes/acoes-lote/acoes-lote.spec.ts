import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Lote } from '../lote.model';
import { AcoesLote } from './acoes-lote';

const LOTE: Lote = {
  id: 10,
  instituicaoResponsavel: '0001 - SICOOB',
  instituicao: '0002 - SICOOB Central',
  dataEntrada: '2026-11-03',
  valor: 1250.50,
  quantidadeLancamentos: 2,
  usuarioRegistro: 'gabriel.caldas',
  usuarioAprovacao: null,
  situacao: 'Enviado',
  dataHoraSituacao: '2026-11-04T09:15:00',
};

describe('AcoesLote', () => {
  let fixture: ComponentFixture<AcoesLote>;
  let tela: HTMLElement;

  function botao(texto: string): HTMLButtonElement {
    const botoes = Array.from(tela.querySelectorAll('button'));
    const encontrado = botoes.find(item => item.textContent.trim() === texto);

    if (!encontrado) {
      throw new Error(`Botão ausente: ${texto}`);
    }

    return encontrado;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [AcoesLote] });
    fixture = TestBed.createComponent(AcoesLote);
    fixture.componentRef.setInput('lote', null);
    fixture.detectChanges();
    tela = fixture.nativeElement;
  });

  it('habilita as três ações somente quando recebe um lote', () => {
    for (const nome of ['Alterar', 'Excluir', 'Visualizar']) {
      expect(botao(nome).disabled).toBe(true);
    }

    fixture.componentRef.setInput('lote', LOTE);
    fixture.detectChanges();

    for (const nome of ['Alterar', 'Excluir', 'Visualizar']) {
      expect(botao(nome).disabled).toBe(false);
    }
  });

  it('impede salvar uma instituição composta apenas por espaços', () => {
    fixture.componentRef.setInput('lote', LOTE);
    fixture.detectChanges();

    const alteracoes: number[] = [];
    fixture.componentInstance.alteracaoConfirmada.subscribe(evento => {
      alteracoes.push(evento.id);
    });

    botao('Alterar').click();
    fixture.detectChanges();

    const campo = tela.querySelector<HTMLInputElement>('#instituicao-edicao')!;
    campo.value = '   ';
    campo.dispatchEvent(new Event('input'));
    botao('Salvar').click();
    fixture.detectChanges();

    expect(alteracoes).toEqual([]);
    expect(tela.querySelector('[role="alert"]')?.textContent).toContain('Informe a instituição');
  });

  it('emite o ID somente ao confirmar a exclusão', () => {
    fixture.componentRef.setInput('lote', LOTE);
    fixture.detectChanges();

    const excluidos: number[] = [];
    fixture.componentInstance.exclusaoConfirmada.subscribe(id => excluidos.push(id));

    botao('Excluir').click();
    fixture.detectChanges();
    expect(excluidos).toEqual([]);

    botao('Cancelar').click();
    fixture.detectChanges();
    expect(excluidos).toEqual([]);

    botao('Excluir').click();
    fixture.detectChanges();
    botao('Confirmar exclusão').click();

    expect(excluidos).toEqual([10]);
  });
});