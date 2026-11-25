# SmartCash

Dashboard financeiro pessoal que roda direto no navegador. Registre entradas e saídas, veja o saldo atualizar na hora e mantenha seus dados salvos mesmo depois de fechar a página.

**Demo:** _cole aqui o link do GitHub Pages_

## Funcionalidades

- Cadastro de transações com descrição, valor e tipo (Entrada ou Saída)
- Cards com total de entradas, total de saídas e saldo, atualizados a cada ação
- Extrato em ordem cronológica (mais recentes primeiro) com exclusão individual
- Persistência de dados com LocalStorage
- Cores e ícones diferenciando receitas (▲ verde) e despesas (▼ vermelho)
- Validação do formulário: bloqueia campos vazios, valores não numéricos e valor zero
- Layout responsivo para celulares
- Animações simples de entrada e saída dos itens

## Como usar

1. Abra o `index.html` no navegador (não precisa instalar nada).
2. Escreva a descrição e o valor, escolha Entrada ou Saída e clique em **Adicionar transação**.
3. Para apagar um item, clique no botão **✕** ao lado dele.

Dicas sobre o valor:

- Aceita vírgula ou ponto: `25,90` ou `25.90`
- Aceita separador de milhar: `1.250,90`
- Um valor negativo (por exemplo `-30`) é registrado automaticamente como saída

## Tecnologias

- HTML5
- CSS3
- JavaScript Vanilla

Sem frameworks, bibliotecas, APIs de terceiros ou banco de dados externo.

## Estrutura do projeto

```
smartcash/
├── index.html   # estrutura da página
├── style.css    # estilos e responsividade
└── script.js    # lógica, DOM e LocalStorage
```

## Decisões de código

- **Valores em centavos:** os valores são guardados como números inteiros (R$ 10,50 vira `1050`), evitando erros de arredondamento como `0.1 + 0.2`.
- **Conversão antes do cálculo:** o texto do formulário é convertido para número antes de qualquer conta.
- **Array de objetos:** cada transação tem o formato `{ id, descricao, tipo, centavos, criadaEm }`.
- **Cálculos com `.filter()` e `.reduce()`:** usados para somar entradas e saídas.
- **Exclusão por `id`:** o item é removido pelo seu identificador, não pela posição na lista.
- **Proteção contra dados corrompidos:** a leitura do LocalStorage usa `try/catch` e descarta itens inválidos.
- **Segurança:** o texto digitado entra na tela com `textContent`, impedindo injeção de HTML.

## Como publicar no GitHub Pages

1. Envie os arquivos para um repositório público no GitHub.
2. Vá em **Settings → Pages**.
3. Em **Source**, escolha a branch `main` e a pasta `/ (root)`.
4. Aguarde alguns minutos e acesse o link gerado.

## Autor

_Seu nome_ – projeto desenvolvido na Fase 2 (Projeto 3) da formação Softex / trendsIT.
