/* =========================================================
   CART.JS — Carrinho, modal de produto, checkout, localStorage
   ========================================================= */

const { loja } = MENU_DATA;

/* ---------- Estado ---------- */
let carrinho = [];
let tipoEntrega = "entrega";
let formaPagamento = null;

/* ---------- Estado do modal de produto ---------- */
let modalProdutoAtual = null;
let modalQuantidade = 1;

/* ---------- Elementos ---------- */
const drawer = document.getElementById("drawer-carrinho");
const overlay = document.getElementById("overlay");
const modalCheckout = document.getElementById("modal-checkout");
const modalProduto = document.getElementById("modal-produto");
const secaoEndereco = document.getElementById("secao-endereco");
const secaoTroco = document.getElementById("secao-troco");
const avisoCheckout = document.getElementById("aviso-checkout");

/* =========================================================
   SCROLL LOCK
   ========================================================= */
function travarScroll() {
  document.body.style.overflow = "hidden";
}
function liberarScroll() {
  document.body.style.overflow = "";
}

/* =========================================================
   LOCALSTORAGE — Dados do cliente
   ========================================================= */
const STORAGE_KEY = "pastelaria_cliente";

function salvarDadosCliente(dados) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
  } catch (e) {
    console.warn("Não foi possível salvar dados do cliente:", e);
  }
}

function carregarDadosCliente() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function preencherDadosCliente() {
  const dados = carregarDadosCliente();
  if (!dados) return;
  const inputNome = document.getElementById("input-nome");
  const inputEndereco = document.getElementById("input-endereco");
  const inputReferencia = document.getElementById("input-referencia");

  if (dados.nome && !inputNome.value) inputNome.value = dados.nome;
  if (dados.endereco && !inputEndereco.value) inputEndereco.value = dados.endereco;
  if (dados.referencia && !inputReferencia.value)
    inputReferencia.value = dados.referencia;
}

/* =========================================================
   DRAWER
   ========================================================= */
function abrirCarrinho() {
  drawer.classList.add("aberto");
  drawer.setAttribute("aria-hidden", "false");
  overlay.classList.add("visivel");
  travarScroll();
}
function fecharCarrinho() {
  drawer.classList.remove("aberto");
  drawer.setAttribute("aria-hidden", "true");
  overlay.classList.remove("visivel");
  liberarScroll();
}

document.getElementById("btn-carrinho").addEventListener("click", abrirCarrinho);
document.getElementById("btn-fechar-carrinho").addEventListener("click", fecharCarrinho);
overlay.addEventListener("click", fecharCarrinho);

/* =========================================================
   CARRINHO
   ========================================================= */
function adicionarProdutoAoCarrinho(produto, quantidade = 1) {
  const existente = carrinho.find((i) => i.id === produto.id);
  if (existente) {
    existente.quantidade += quantidade;
  } else {
    carrinho.push({
      id: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      quantidade,
    });
  }

  renderCarrinho();
  atualizarBotoesProdutos();
}

function alterarQuantidade(id, delta) {
  const item = carrinho.find((i) => i.id === id);
  if (!item) return;

  item.quantidade += delta;
  if (item.quantidade <= 0) {
    carrinho = carrinho.filter((i) => i.id !== id);
  }
  renderCarrinho();
  atualizarBotoesProdutos();
}

function calcularSubtotal() {
  return carrinho.reduce((soma, i) => soma + i.preco * i.quantidade, 0);
}

/* ---------- Render do carrinho ---------- */
function renderCarrinho() {
  const container = document.getElementById("itens-carrinho");
  const total = calcularSubtotal();

  if (carrinho.length === 0) {
    container.innerHTML = `<p class="muted centro">Seu carrinho está vazio 🥟</p>`;
  } else {
    container.innerHTML = carrinho
      .map(
        (i) => `
        <div class="item-carrinho">
          <div class="item-info">
            <strong>${i.nome}</strong>
            <div class="muted">${i.quantidade} x ${formatarPreco(i.preco)}</div>
          </div>
          <div class="item-controles">
            <button onclick="alterarQuantidade('${i.id}', -1)" aria-label="Diminuir">−</button>
            <span>${i.quantidade}</span>
            <button onclick="alterarQuantidade('${i.id}', 1)" aria-label="Aumentar">+</button>
          </div>
        </div>`
      )
      .join("");
  }

  document.getElementById("total-carrinho").textContent = formatarPreco(total);
  document.getElementById("cart-count").textContent = carrinho.reduce(
    (soma, i) => soma + i.quantidade,
    0
  );
}

/* ---------- Feedback visual dos botões ---------- */
function atualizarBotoesProdutos() {
  document.querySelectorAll(".btn-add").forEach((btn) => {
    const id = btn.dataset.id;
    const noCarrinho = carrinho.some((i) => i.id === id);
    if (noCarrinho) {
      btn.textContent = "✓ Adicionado";
      btn.classList.add("adicionado");
    } else {
      btn.textContent = "+ Adicionar";
      btn.classList.remove("adicionado");
    }
  });
}

/* =========================================================
   MODAL DE PRODUTO (ficha com ingredientes + quantidade)
   ========================================================= */
function abrirModalProduto(produto) {
  modalProdutoAtual = produto;
  modalQuantidade = 1;

  document.getElementById("produto-titulo").textContent = produto.nome;

  const body = document.getElementById("produto-body");
  let html = "";

  if (produto.imagem) {
    html += `<div class="produto-imagem" style="background-image:url('${produto.imagem}')"></div>`;
  }

  if (produto.descricao) {
    html += `<p class="muted produto-descricao">${produto.descricao}</p>`;
  }

  if (produto.ingredientes && produto.ingredientes.length) {
    html += `
      <section class="produto-secao">
        <h3>Ingredientes</h3>
        <ul class="produto-ingredientes">
          ${produto.ingredientes.map((ing) => `<li>${ing}</li>`).join("")}
        </ul>
      </section>`;
  }

  html += `
    <section class="produto-secao produto-quantidade">
      <h3>Quantidade</h3>
      <div class="qtd-controle">
        <button type="button" id="qtd-menos" aria-label="Diminuir">−</button>
        <span id="qtd-valor">1</span>
        <button type="button" id="qtd-mais" aria-label="Aumentar">+</button>
      </div>
    </section>

    <div class="produto-total">
      <span>Total do item</span>
      <strong id="produto-total-valor">${formatarPreco(produto.preco)}</strong>
    </div>`;

  body.innerHTML = html;

  document.getElementById("qtd-menos").addEventListener("click", () => {
    if (modalQuantidade > 1) {
      modalQuantidade--;
      atualizarTotalModalProduto();
    }
  });
  document.getElementById("qtd-mais").addEventListener("click", () => {
    modalQuantidade++;
    atualizarTotalModalProduto();
  });

  atualizarTotalModalProduto();

  modalProduto.classList.add("aberto");
  modalProduto.setAttribute("aria-hidden", "false");
  travarScroll();
}

function atualizarTotalModalProduto() {
  if (!modalProdutoAtual) return;
  document.getElementById("qtd-valor").textContent = modalQuantidade;
  document.getElementById("produto-total-valor").textContent = formatarPreco(
    modalProdutoAtual.preco * modalQuantidade
  );
}

function fecharModalProduto() {
  modalProduto.classList.remove("aberto");
  modalProduto.setAttribute("aria-hidden", "true");
  modalProdutoAtual = null;
  modalQuantidade = 1;
  liberarScroll();
}

document.getElementById("btn-fechar-produto").addEventListener("click", fecharModalProduto);
modalProduto.addEventListener("click", (e) => {
  if (e.target === modalProduto) fecharModalProduto();
});

document.getElementById("btn-produto-add").addEventListener("click", () => {
  if (!modalProdutoAtual) return;
  adicionarProdutoAoCarrinho(modalProdutoAtual, modalQuantidade);
  fecharModalProduto();
});

/* =========================================================
   MODAL CHECKOUT
   ========================================================= */
function abrirModalCheckout() {
  if (carrinho.length === 0) {
    return alert("Adicione itens antes de finalizar.");
  }
  preencherDadosCliente();
  modalCheckout.classList.add("aberto");
  modalCheckout.setAttribute("aria-hidden", "false");
  atualizarResumoCheckout();
  travarScroll();
}

function fecharModalCheckout() {
  modalCheckout.classList.remove("aberto");
  modalCheckout.setAttribute("aria-hidden", "true");
  liberarScroll();
}

document.getElementById("btn-finalizar").addEventListener("click", () => {
  fecharCarrinho();
  abrirModalCheckout();
});

document.getElementById("btn-fechar-modal").addEventListener("click", fecharModalCheckout);
modalCheckout.addEventListener("click", (e) => {
  if (e.target === modalCheckout) fecharModalCheckout();
});

/* ---------- Toggle entrega/retirada ---------- */
document.querySelectorAll(".tipo-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    tipoEntrega = btn.dataset.tipo;
    document.querySelectorAll(".tipo-btn").forEach((b) => b.classList.remove("ativo"));
    btn.classList.add("ativo");
    secaoEndereco.classList.toggle("hidden", tipoEntrega === "retirada");
    atualizarResumoCheckout();
  });
});

/* ---------- Troco condicional ---------- */
document.querySelectorAll('input[name="pagamento"]').forEach((radio) => {
  radio.addEventListener("change", () => {
    formaPagamento = radio.value;
    secaoTroco.classList.toggle("hidden", formaPagamento !== "Dinheiro");
  });
});

/* =========================================================
   RESUMO DO CHECKOUT
   ========================================================= */
function atualizarResumoCheckout() {
  const subtotal = calcularSubtotal();
  const taxa = tipoEntrega === "entrega" ? loja.taxaEntrega : 0;
  const total = subtotal + taxa;

  document.getElementById("resumo-subtotal").textContent = formatarPreco(subtotal);
  document.getElementById("resumo-entrega").textContent = formatarPreco(taxa);
  document
    .getElementById("linha-entrega")
    .classList.toggle("hidden", tipoEntrega === "retirada");
  document.getElementById("resumo-total").textContent = formatarPreco(total);

  if (tipoEntrega === "entrega" && subtotal < loja.pedidoMinimo) {
    mostrarAviso(
      `Pedido mínimo para entrega: ${formatarPreco(loja.pedidoMinimo)}. ` +
        `Faltam ${formatarPreco(loja.pedidoMinimo - subtotal)}.`,
      true
    );
  } else {
    esconderAviso();
  }
}

function mostrarAviso(msg, erro = false) {
  avisoCheckout.textContent = msg;
  avisoCheckout.classList.remove("hidden");
  avisoCheckout.classList.toggle("erro", erro);
}
function esconderAviso() {
  avisoCheckout.classList.add("hidden");
}

/* =========================================================
   CONFIRMAR PEDIDO
   ========================================================= */
document.getElementById("btn-confirmar-pedido").addEventListener("click", () => {
  const subtotal = calcularSubtotal();
  const taxa = tipoEntrega === "entrega" ? loja.taxaEntrega : 0;
  const total = subtotal + taxa;

  if (tipoEntrega === "entrega" && subtotal < loja.pedidoMinimo) {
    return mostrarAviso(
      `Pedido mínimo para entrega: ${formatarPreco(loja.pedidoMinimo)}.`,
      true
    );
  }

  const nome = document.getElementById("input-nome").value.trim();
  if (!nome) return mostrarAviso("Por favor, informe seu nome.", true);

  const endereco = document.getElementById("input-endereco").value.trim();
  const referencia = document.getElementById("input-referencia").value.trim();

  if (tipoEntrega === "entrega" && !endereco) {
    return mostrarAviso("Por favor, informe o endereço de entrega.", true);
  }

  if (!formaPagamento) {
    return mostrarAviso("Escolha uma forma de pagamento.", true);
  }

  const troco = document.getElementById("input-troco").value.trim();
  if (formaPagamento === "Dinheiro" && troco && isNaN(Number(troco))) {
    return mostrarAviso("O valor do troco deve ser numérico.", true);
  }

  const observacao = document.getElementById("input-obs").value.trim();

  esconderAviso();

  salvarDadosCliente({ nome, endereco, referencia });

  /* Monta a mensagem */
  const linhas = carrinho
    .map(
      (i) => `• ${i.quantidade}x ${i.nome} — ${formatarPreco(i.preco * i.quantidade)}`
    )
    .join("\n");

  let msg =
    `*NOVO PEDIDO — ${loja.nome}*\n\n` +
    `👤 *Cliente:* ${nome}\n` +
    `📦 *Tipo:* ${tipoEntrega === "entrega" ? "Entrega 🛵" : "Retirada 🏪"}\n`;

  if (tipoEntrega === "entrega") {
    msg += `📍 *Endereço:* ${endereco}\n`;
    if (referencia) msg += `🏠 *Referência:* ${referencia}\n`;
  }

  msg += `\n*Itens:*\n${linhas}\n\n`;
  msg += `Subtotal: ${formatarPreco(subtotal)}\n`;

  if (tipoEntrega === "entrega") {
    msg += `Taxa de entrega: ${formatarPreco(taxa)}\n`;
  }

  msg += `*Total: ${formatarPreco(total)}*\n\n`;
  msg += `💳 *Pagamento:* ${formaPagamento}\n`;

  if (formaPagamento === "Dinheiro" && troco) {
    msg += `💵 *Troco para:* ${formatarPreco(Number(troco))}\n`;
  }

  if (observacao) {
    msg += `\n📝 *Observações:* ${observacao}\n`;
  }

  const url = `https://wa.me/${loja.whatsapp}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");

  carrinho = [];
  renderCarrinho();
  atualizarBotoesProdutos();
  document.getElementById("input-obs").value = "";
  fecharModalCheckout();
});

/* ---------- Init ---------- */
renderCarrinho();