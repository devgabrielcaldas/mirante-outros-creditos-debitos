import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltrosLotes } from './filtros-lotes';

describe('FiltrosLotes', () => {
  let component: FiltrosLotes;
  let fixture: ComponentFixture<FiltrosLotes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FiltrosLotes],
    }).compileComponents();

    fixture = TestBed.createComponent(FiltrosLotes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
