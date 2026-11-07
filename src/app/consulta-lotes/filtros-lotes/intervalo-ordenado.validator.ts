import { ValidatorFn } from '@angular/forms';

export const intervaloOrdenado: ValidatorFn = grupo => {
  const de = grupo.get('de')?.value;
  const ate = grupo.get('ate')?.value;

  if (typeof de === 'number' && typeof ate === 'number') {
    return de > ate ? { intervaloInvertido: true } : null;
  }

  if (typeof de === 'string' && typeof ate === 'string' && de !== '' && ate !== '') {
    return de > ate ? { intervaloInvertido: true } : null;
  }

  return null;
};