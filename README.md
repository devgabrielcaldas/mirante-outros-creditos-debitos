# Outros Créditos/Débitos

Aplicação Angular desenvolvida por Gabriel Marinho Caldas para o desafio de Front-end da Mirante Tecnologia. O módulo permite consultar lotes contábeis, incluir lançamentos, conferir os valores e acompanhar o lote do envio à confirmação.

Os dados são simulados em memória. Recarregar a página restaura os quatro lotes de exemplo, o que permite repetir a demonstração desde o início.

## Executar o projeto

Versões utilizadas no desenvolvimento:

| Ferramenta | Versão |
|---|---|
| Node.js | 24.19.0 |
| npm | 11.17.0 |
| Angular | 21.2.26 |
| Angular CLI | 21.2.29 |
| TypeScript | 5.9.3 |

Com Git, Node.js e npm disponíveis, execute:

```bash
git clone https://github.com/devgabrielcaldas/mirante-outros-creditos-debitos.git
cd mirante-outros-creditos-debitos
npm ci
npm start
```

Abra `http://localhost:4200`. O comando `npm ci` instala as versões registradas no `package-lock.json`. O script `npm start` executa `ng serve` com o Angular CLI local do projeto. Também é possível instalá-lo com `npm install`.

No Windows PowerShell, os comandos equivalentes são `npm.cmd ci` e `npm.cmd start`.

## Testes e build

```bash
npm test -- --watch=false
npm run build
```

Os testes usam Vitest e cobrem filtros combinados, intervalos inclusivos, seleção, paginação, validação do modal, duplicação e edição de lançamentos, totalização e transições de situação. O build gera a distribuição em `dist/`.

## Experimentar a consulta

Os cenários abaixo partem dos dados iniciais. Limpe os campos da pesquisa anterior antes de iniciar um cenário independente.

| Cenário | Como testar | Resultado esperado |
|---|---|---|
| Consulta geral | Deixe os filtros vazios, mantenha **Situação Lote** em **Todas** e clique em **Pesquisar**. | Quatro lotes, com IDs `2` e `10` na primeira página e `11` e `12` na segunda. |
| Filtros combinados | Preencha **Instituição** com `0002` e selecione **Enviado**. | Apenas o lote `10`, com 2 lançamentos e valor de R$ 1.250,50. |
| Intervalo inválido | Em **ID Lote**, informe De `10` e Até `9`. Depois altere Até para `10`. | O formulário informa o erro. Ao igualar os limites, a pesquisa é habilitada e encontra o lote `10`. |
| Seleção | Pesquise todos os lotes. Marque um registro e depois os dois da página. | **Alterar**, **Excluir** e **Visualizar** ficam habilitados com exatamente um lote selecionado. |
| Justificativa | Pesquise o lote `12`, marque sua linha e clique em **Visualizar Justificativa**. | O painel apresenta a justificativa registrada no mock. |

Os intervalos aceitam apenas **De**, apenas **Até** ou os dois limites. Para retirar um limite numérico, deixe o campo vazio. Digitar `0` aplica o valor zero ao filtro.

## Incluir lançamentos e salvar um lote

Contas disponíveis no mock:

| Conta Corrente | Titular |
|---|---|
| `12345-6` | Mariana Alves |
| `67890-1` | Rafael Costa |

1. Clique em **Incluir** na consulta. Essa ação está disponível antes da primeira pesquisa.
2. No modal, informe `12345-6` e acione a lupa. Confira o titular **Mariana Alves**.
3. Informe valor `125,50`, histórico **Lançamento Manual**, documento `DOC-101` e PA **Cooperativa**. Clique em **Incluir** no rodapé do modal.
4. Na grade do rascunho, selecione o lançamento e clique em **Duplicar**. A cópia recebe outro ID e fica selecionada.
5. Clique em **Alterar**, informe `0,01` e `DOC-102` e confirme em **Salvar alteração**. O original mantém R$ 125,50.
6. Clique em **Salvar lote**. Em uma sessão nova, o resultado é o lote `13`, com situação **Aberto**, 2 lançamentos e total de **R$ 125,51**. Para localizá-lo, pesquise com ID De `13` e Até `13` e situação **Todas**.

A grade também permite visualizar um lançamento em modo de leitura e excluir a linha selecionada após confirmação. Alterar o número de uma conta no modal limpa o titular anterior e exige uma nova busca.

## Enviar e confirmar

Pesquise o lote `2` com situação **Todas**. Marque a linha e clique em **Enviar**. A consulta é atualizada e o lote passa de **Aberto** para **Enviado**. Marque-o novamente, clique em **Confirmar**, informe uma justificativa e confirme a operação. A tabela passa a mostrar **Confirmado**, o usuário de aprovação e a data/hora da mudança. Selecione o lote novamente para consultar a justificativa.

## Decisões técnicas

- **Componentes standalone e modelos TypeScript.** `Lote`, `Lancamento` e `FiltrosPesquisaLotes` definem os dados compartilhados pela consulta, pelo formulário e pelos serviços.
- **Reactive Forms.** Cada intervalo De/Até tem um `FormGroup` com validador próprio. Alterar qualquer ponta reavalia o par. No modal, a inclusão depende dos campos válidos, do valor positivo e de uma conta localizada.
- **Pesquisa assíncrona.** O componente de filtros emite os critérios. A página usa `switchMap` para chamar `LotesService.pesquisar()`, que combina os critérios e simula a latência com RxJS. O retorno atualiza um signal consumido pela tabela. Uma nova pesquisa substitui a anterior.
- **Seleção e paginação.** A página contém dois lotes para permitir experimentar a navegação com os quatro registros iniciais. “Selecionar todos” atua na página visível. Trocar de página ou refazer a pesquisa limpa a seleção.
- **Valores monetários.** O lançamento guarda o valor em centavos inteiros. Ao salvar, o serviço soma os centavos e calcula quantidade e valor do lote. O mock usa o total bruto e preserva a marcação de estorno em cada linha. A interface exibe valores em reais e datas no formato brasileiro.
- **Rascunho e lote salvo.** O botão do modal acrescenta uma linha ao rascunho. **Salvar lote** registra o conjunto em memória, gera um ID e reaplica os filtros da consulta. O lançamento começa **Pendente** e o lote começa **Aberto**.
- **Regras adotadas para o mock.** O envio ocorre com um lote aberto selecionado. A confirmação exige um lote enviado e registra o usuário `gabriel.caldas`. A justificativa é opcional e pode ser consultada quando preenchida. A alteração do lote permite editar a instituição.
- **Escopo do Documento CSC.** A seção implementa o select de PA. Pesquisa de evento e gestão de anexos das referências complementares ficaram fora da versão demonstrada.

## Onde acompanhar o fluxo no código

| Caminho | Responsabilidade |
|---|---|
| `src/app/app.ts` | Receber os eventos, coordenar a pesquisa e atualizar os resultados. |
| `src/app/consulta-lotes/filtros-lotes/` | Formulário de pesquisa e validação dos intervalos. |
| `src/app/consulta-lotes/lotes.service.ts` | Consultar, criar, alterar e excluir lotes, além de validar envio e confirmação. |
| `src/app/consulta-lotes/tabela-lotes/` | Renderizar resultados, selecionar linhas e paginar. |
| `src/app/consulta-lotes/acoes-lote/` | Disponibilizar as operações sobre o lote selecionado. |
| `src/app/consulta-lotes/inclusao-lote/` | Buscar a conta, validar o lançamento e manter a grade do rascunho. |