import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';

import { ContaCorrente } from './lancamento.model';

const CONTAS: readonly ContaCorrente[] = [
  { numero: '12345-6', titular: 'Mariana Alves' },
  { numero: '67890-1', titular: 'Rafael Costa' },
];

@Injectable({ providedIn: 'root' })
export class ContasService {
  buscar(numero: string): Observable<ContaCorrente | null> {
    const chave = numero.trim().replace(/-/g, '');

    const conta = CONTAS.find(item =>
      item.numero.replace(/-/g, '') === chave
    );

    return of(conta ?? null).pipe(delay(250));
  }
}