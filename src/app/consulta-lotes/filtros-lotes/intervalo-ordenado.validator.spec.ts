import { FormControl, FormGroup } from '@angular/forms';

import { intervaloOrdenado } from './intervalo-ordenado.validator';

describe('intervaloOrdenado', () => {
  it('aceita limites iguais e reavalia o intervalo ao editar qualquer ponta', () => {
    const grupo = new FormGroup(
      {
        de: new FormControl(9),
        ate: new FormControl(9),
      },
      { validators: intervaloOrdenado },
    );

    expect(grupo.valid).toBe(true);

    grupo.controls.de.setValue(10);
    expect(grupo.hasError('intervaloInvertido')).toBe(true);

    grupo.controls.ate.setValue(10);
    expect(grupo.valid).toBe(true);
  });

  it('aceita uma ponta vazia e considera zero um limite preenchido', () => {
    const grupo = new FormGroup(
      {
        de: new FormControl<number | null>(null),
        ate: new FormControl<number | null>(0),
      },
      { validators: intervaloOrdenado },
    );

    expect(grupo.valid).toBe(true);

    grupo.controls.de.setValue(1);
    expect(grupo.hasError('intervaloInvertido')).toBe(true);

    grupo.controls.ate.setValue(null);
    expect(grupo.valid).toBe(true);
  });

  it('compara datas em meses diferentes e aceita a remoção da data final', () => {
    const grupo = new FormGroup(
      {
        de: new FormControl('2026-10-31', { nonNullable: true }),
        ate: new FormControl('2026-11-01', { nonNullable: true }),
      },
      { validators: intervaloOrdenado },
    );

    expect(grupo.valid).toBe(true);

    grupo.controls.ate.setValue('2026-10-01');
    expect(grupo.hasError('intervaloInvertido')).toBe(true);

    grupo.controls.ate.setValue('');
    expect(grupo.valid).toBe(true);
  });
});