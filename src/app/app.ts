import { Component } from '@angular/core';
import { FiltrosLotes } from './consulta-lotes/filtros-lotes/filtros-lotes';

@Component({
  selector: 'app-root',
  imports: [FiltrosLotes],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly tituloModulo = 'Outros Créditos/Débitos';
}
