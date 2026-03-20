# Alteracoes e consolidacao de normas

## Objetivo

Quando uma lei muda, o portal precisa mostrar com clareza:

- o texto vigente
- o texto original
- a norma alteradora
- o que mudou
- quando mudou
- como a redacao ficou depois

Sem transformar o cadastro em algo pesado.

## Modelo recomendado

Para cada norma principal, manter 3 camadas:

1. Texto vigente consolidado
2. Versoes do texto
3. Eventos de alteracao

### 1. Texto vigente consolidado

E o texto que o usuario comum deve ler por padrao.

Uso:

- leitura principal
- busca
- impressao
- compartilhamento

### 2. Versoes do texto

Guardar snapshots apenas nos marcos que importam:

- texto original
- texto apos alteracao relevante
- texto consolidado vigente

Isso evita uma engine complexa de diff e ainda preserva historico util.

Campos minimos:

- label
- tipo da versao (`original`, `alterada`, `vigente`)
- data inicial
- data final opcional
- norma de origem da mudanca
- texto completo daquela versao
- resumo simples opcional

### 3. Eventos de alteracao

Cada mudanca legislativa fica registrada de forma editorial.

Campos minimos:

- data de eficacia
- tipo da mudanca
- dispositivo afetado
- norma alteradora
- texto antes
- texto depois
- observacao

Tipos que resolvem a maior parte do problema:

- nova redacao
- acrescimo
- revogacao
- consolidacao
- regulamentacao

## Fluxo operacional simples

Quando entrar uma nova lei complementar, lei ou decreto alterador:

1. Vincular a norma alteradora a norma principal.
2. Registrar os eventos de alteracao por dispositivo.
3. Salvar o texto anterior como versao historica.
4. Atualizar o texto vigente consolidado.
5. Publicar observacao editorial quando a consolidacao for apenas de leitura e nao o texto oficial.

## O que nao fazer no inicio

Para nao dificultar:

- nao tentar diff automatico artigo por artigo em toda norma
- nao tentar versionar cada virgula
- nao exigir cadastro em nivel de inciso/alinea desde o primeiro dia

Comece por dispositivo principal, com antes/depois textual e snapshot da versao.

## Base juridica e referencia de modelagem

Esta recomendacao segue a logica da tecnica legislativa brasileira:

- A [Lei Complementar 95/1998](https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp95.htm) organiza como atos normativos devem ser alterados, inclusive por nova redacao, acrescimo e revogacao.
- O [Decreto 9.191/2017](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2017/decreto/d9191.htm) detalha a tecnica de consolidacao e a identificacao de dispositivos alterados.
- O portal [LexML Brasil](https://www.lexml.gov.br/) trabalha com relacoes entre normas e identificacao persistente, o que reforca a importancia de modelar a norma alteradora separadamente.

Inferencia aplicada ao produto:

- juridicamente, faz sentido manter a norma alteradora e a norma alterada como objetos distintos;
- editorialmente, faz sentido exibir o texto consolidado como leitura principal;
- operacionalmente, a forma mais simples e segura e guardar snapshots + eventos de alteracao.

## Como isso foi aplicado nesta base

Nesta implementacao:

- a norma pode ter `textVersions`
- a norma pode ter `changeEvents`
- a pagina de detalhe mostra:
  - texto vigente consolidado
  - mudancas documentadas
  - texto antes da ultima mudanca
  - texto original
  - versoes registradas

## Exemplo pratico

Norma principal:

- LC 405/2023

Norma alteradora:

- LC 418/2025

Registro no portal:

- evento 1: nova redacao do art. 2
- evento 2: acrescimo do art. 3-A
- versao 1: texto original de 2023
- versao 2: redacao apos a LC 418/2025
- versao 3: texto vigente consolidado

Esse modelo cobre bem o que a equipe precisa manter e o que o usuario precisa entender.
