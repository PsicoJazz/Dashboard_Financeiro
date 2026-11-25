// ======================================================
// SmartCash – controle financeiro pessoal (JS Vanilla)
// Os valores são guardados em CENTAVOS (números inteiros)
// para evitar erros de arredondamento como 0.1 + 0.2.
// ======================================================

const CHAVE_STORAGE = "smartcash:transacoes";
const TEMPO_ANIMACAO_SAIDA = 250; // ms (igual ao CSS)

// ---------- Elementos da página ----------
const formulario = document.querySelector("#form-transacao");
const campoDescricao = document.querySelector("#descricao");
const campoValor = document.querySelector("#valor");
const mensagemErro = document.querySelector("#mensagem-erro");
const listaTransacoes = document.querySelector("#lista-transacoes");
const extratoVazio = document.querySelector("#extrato-vazio");
const textoSaldo = document.querySelector("#saldo-total");
const textoEntradas = document.querySelector("#total-entradas");
const textoSaidas = document.querySelector("#total-saidas");
const cardSaldo = document.querySelector("#card-saldo");

// ---------- Estado: array de objetos ----------
// { id, descricao, tipo: "entrada" | "saida", centavos, criadaEm }
let transacoes = carregarTransacoes();

// ---------- Persistência (LocalStorage) ----------
function transacaoEhValida(item) {
  return (
    item !== null &&
    typeof item === "object" &&
    typeof item.id === "number" &&
    typeof item.descricao === "string" &&
    (item.tipo === "entrada" || item.tipo === "saida") &&
    Number.isInteger(item.centavos) &&
    item.centavos > 0 &&
    typeof item.criadaEm === "number"
  );
}

function carregarTransacoes() {
  try {
    const textoSalvo = localStorage.getItem(CHAVE_STORAGE);
    if (!textoSalvo) return [];
    const dados = JSON.parse(textoSalvo);
    return Array.isArray(dados) ? dados.filter(transacaoEhValida) : [];
  } catch (erro) {
    console.error("Dados salvos estavam corrompidos. Começando do zero.", erro);
    return [];
  }
}

function salvarTransacoes() {
  try {
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(transacoes));
  } catch (erro) {
    console.error("Não foi possível salvar no LocalStorage.", erro);
  }
}

// ---------- Cálculos ----------
function somarPorTipo(tipo) {
  return transacoes
    .filter((transacao) => transacao.tipo === tipo)
    .reduce((soma, transacao) => soma + transacao.centavos, 0);
}

function calcularResumo() {
  const entradas = somarPorTipo("entrada");
  const saidas = somarPorTipo("saida");
  return { entradas, saidas, saldo: entradas - saidas };
}

// ---------- Formatação ----------
function formatarMoeda(centavos) {
  return (centavos / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatarData(timestamp) {
  return new Date(timestamp).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Converte texto digitado ("1.250,90", "25,5", "-10") em centavos.
// Retorna null se não for um número válido.
function converterParaCentavos(texto) {
  let limpo = texto.trim().replace(/\s/g, "");

  if (limpo.includes(",")) {
    limpo = limpo.replace(/\./g, "").replace(",", "."); // 1.250,90 -> 1250.90
  }

  const formatoValido = /^-?\d+(\.\d{1,2})?$/.test(limpo);
  if (!formatoValido) return null;

  return Math.round(Number(limpo) * 100);
}

// ---------- Renderização ----------
function renderizarResumo() {
  const { entradas, saidas, saldo } = calcularResumo();

  textoEntradas.textContent = formatarMoeda(entradas);
  textoSaidas.textContent = formatarMoeda(saidas);
  textoSaldo.textContent = formatarMoeda(saldo);

  cardSaldo.classList.toggle("positivo", saldo > 0);
  cardSaldo.classList.toggle("negativo", saldo < 0);
}

function criarItemDaLista(transacao) {
  const ehEntrada = transacao.tipo === "entrada";

  const item = document.createElement("li");
  item.className = `item ${transacao.tipo}`;
  item.dataset.id = transacao.id;

  const descricao = document.createElement("span");
  descricao.className = "item-descricao";
  descricao.textContent = transacao.descricao; // textContent evita HTML injetado

  const data = document.createElement("span");
  data.className = "item-data";
  data.textContent = formatarData(transacao.criadaEm);

  const valor = document.createElement("span");
  valor.className = "item-valor";
  valor.textContent = `${ehEntrada ? "▲ +" : "▼ −"} ${formatarMoeda(transacao.centavos)}`;

  const botaoExcluir = document.createElement("button");
  botaoExcluir.type = "button";
  botaoExcluir.className = "botao-excluir";
  botaoExcluir.textContent = "✕";
  botaoExcluir.setAttribute("aria-label", `Excluir ${transacao.descricao}`);

  item.append(descricao, data, valor, botaoExcluir);
  return item;
}

function renderizarExtrato() {
  listaTransacoes.innerHTML = "";

  // mais recentes primeiro (ordem cronológica decrescente)
  const ordenadas = [...transacoes].sort((a, b) => b.criadaEm - a.criadaEm);
  ordenadas.forEach((transacao) => {
    listaTransacoes.appendChild(criarItemDaLista(transacao));
  });

  extratoVazio.classList.toggle("oculto", transacoes.length > 0);
}

function atualizarTela() {
  renderizarResumo();
  renderizarExtrato();
}

// ---------- Ações ----------
function mostrarErro(mensagem, campo) {
  mensagemErro.textContent = mensagem;
  campoDescricao.classList.remove("invalido");
  campoValor.classList.remove("invalido");
  if (campo) {
    campo.classList.add("invalido");
    campo.focus();
  }
}

function limparErro() {
  mostrarErro("");
}

function adicionarTransacao(descricao, centavosComSinal, tipoEscolhido) {
  // valor negativo digitado sempre vira saída
  const tipo = centavosComSinal < 0 ? "saida" : tipoEscolhido;

  transacoes.push({
    id: Date.now(),
    descricao,
    tipo,
    centavos: Math.abs(centavosComSinal),
    criadaEm: Date.now(),
  });

  salvarTransacoes();
  atualizarTela();
}

function excluirTransacao(id) {
  transacoes = transacoes.filter((transacao) => transacao.id !== id);
  salvarTransacoes();
  atualizarTela();
}

// ---------- Eventos ----------
formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const descricao = campoDescricao.value.trim();
  const centavos = converterParaCentavos(campoValor.value);
  const tipo = formulario.elements["tipo"].value;

  if (descricao === "") {
    mostrarErro("Escreva uma descrição para a transação.", campoDescricao);
    return;
  }
  if (campoValor.value.trim() === "") {
    mostrarErro("Informe o valor da transação.", campoValor);
    return;
  }
  if (centavos === null) {
    mostrarErro("Valor inválido. Use apenas números, por exemplo 25,90.", campoValor);
    return;
  }
  if (centavos === 0) {
    mostrarErro("O valor precisa ser diferente de zero.", campoValor);
    return;
  }

  limparErro();
  adicionarTransacao(descricao, centavos, tipo);
  formulario.reset();
  campoDescricao.focus();
});

listaTransacoes.addEventListener("click", (evento) => {
  const botao = evento.target.closest(".botao-excluir");
  if (!botao) return;

  const item = botao.closest(".item");
  const id = Number(item.dataset.id);

  item.classList.add("saindo"); // animação de saída
  setTimeout(() => excluirTransacao(id), TEMPO_ANIMACAO_SAIDA);
});

[campoDescricao, campoValor].forEach((campo) => {
  campo.addEventListener("input", limparErro);
});

// ---------- Início ----------
atualizarTela();
