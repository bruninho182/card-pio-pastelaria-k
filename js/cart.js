/* =========================================================
   CART.JS — Carrinho, checkout e envio ao WhatsApp
   ========================================================= */

const { loja } = MENU_DATA;

/* ---------- Estado ---------- */
let carrinho = []; // [{ id, nome, preco, quantidade }]
let tipoEntrega = "entrega"; // "entrega" | "retirada"
let formaPagamento = null;

/* ---------- Elementos ---------- */
const drawer = document.getElementById("drawer-carrinho");
const overlay = document.getElementById("overlay");
const modalCheckout = document.getElementById("modal-checkout");
const secaoEndereco = document.getElementById("secao-endereco");
const secaoTroco = document.getElementById("secao-troco");
const avisoCheckout = document.getElementById("aviso-checkout");

/* =========================================================
   DRAWER (carrinho lateral)
   ========================================================= */
function abrirCarrinho() {
  drawer.classList.add("aberto");
  drawer.setAttribute("aria-hidden", "false");
  overlay.classList.add("visivel");
}
function fecharCarrinho() {
  drawer.classList.remove("aberto");
  drawer.setAttribute("aria-hidden", "true");
  overlay.classList.remove("visivel");
}

document.getElementById("btn-carrinho").addEventListener("click", abrirCarrinho);
document.getElementById("btn-fechar-carrinho").addEventListener("click", fecharCarrinho);
overlay.addEventListener("click", fecharCarrinho);

/* =========================================================
   OPERAÇÕES DO CARRINHO
   ========================================================= */
function adicionarAoCarrinho(id) {
  const produto = encontrarProduto(id);
  if (!produto) return;

  const item = carrinho.find((i) => i.id === id);
  if (item) {
    item.quantidade++;
  } else {
    carrinho.push({
      id,
      nome: produto.nome,
      preco: produto.preco,
      quantidade: 1,
    });
  }

  renderCarrinho();

  // Feedback visual no botão
  const btn = document.querySelector(`.btn-add[data-id="${id}"]`);
  if (btn) {
    const original = btn.textContent;
    btn.textContent = "✓ Adicionado";
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = original;
      btn.disabled = false;
    }, 800);
  }
}

function alterarQuantidade(id, delta) {
  const item = carrinho.find((i) => i.id === id);
  if (!item) return;

  item.quantidade += delta;
  if (item.quantidade <= 0) {
    carrinho = carrinho.filter((i) => i.id !== id);
  }
  renderCarrinho();
}

function calcularSubtotal() {
  return carrinho.reduce((soma, i) => soma + i.preco * i.quantidade, 0);
}

/* =========================================================
   RENDER DO CARRINHO
   ========================================================= */
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
          <div>
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

/* =========================================================
   MODAL CHECKOUT
   ========================================================= */
function abrirModalCheckout() {
  if (carrinho.length === 0) {
    return alert("Adicione itens antes de finalizar.");
  }
  modalCheckout.classList.add("aberto");
  modalCheckout.setAttribute("aria-hidden", "false");
  atualizarResumoCheckout();
}

function fecharModalCheckout() {
  modalCheckout.classList.remove("aberto");
  modalCheckout.setAttribute("aria-hidden", "true");
}

document.getElementById("btn-finalizar").addEventListener("click", () => {
  fecharCarrinho();
  abrirModalCheckout();
});

document.getElementById("btn-fechar-modal").addEventListener("click", fecharModalCheckout);

modalCheckout.addEventListener("click", (e) => {
  if (e.target === modalCheckout) fecharModalCheckout();
});

/* ---------- Toggle entrega / retirada ---------- */
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

  // Valida pedido mínimo (só para entrega)
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

  /* ----- Validações ----- */
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

  esconderAviso();

  /* ----- Monta a mensagem ----- */
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

  /* ----- Abre WhatsApp ----- */
  const url = `https://wa.me/${loja.whatsapp}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");

  /* ----- Limpa e fecha ----- */
  carrinho = [];
  renderCarrinho();
  fecharModalCheckout();
});

/* ---------- Inicialização ---------- */
renderCarrinho();