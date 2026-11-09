import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent?.trim()).toBe(
      'Outros Créditos/Débitos'
    );
  });
  it('exibe a barra completa e inicia a inclusão antes da primeira pesquisa', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const tela: HTMLElement = fixture.nativeElement;
    const barra = tela.querySelector('[aria-label="Ações do lote"]')!;
    const botoes = Array.from(barra.querySelectorAll('button'));

    expect(botoes.map(botao => botao.textContent?.trim())).toEqual([
      'Confirmar', 'Enviar', 'Visualizar Justificativa', 'Incluir', 'Alterar', 'Excluir', 'Visualizar',
    ]);
    const habilitados = botoes.filter(botao => !botao.disabled);
    expect(habilitados.map(botao => botao.textContent?.trim())).toEqual(['Incluir']);

    const dialogo = tela.querySelector('dialog')!;
    const abrir = vi.fn();
    dialogo.showModal = abrir;
    habilitados[0].click();
    expect(abrir).toHaveBeenCalledOnce();
  });
});
