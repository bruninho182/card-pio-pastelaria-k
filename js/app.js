/* =========================================================
   APP.JS — Renderização + abertura do modal de produto
   ========================================================= */

(function () {
  const { loja, categorias } = MENU_DATA;

  let categoriaAtiva = "todas";

  function renderLoja() {
    document.getElementById("loja-nome").textContent = loja.nome;
    document.getElementById("loja-info").textContent =
      `${loja.horario} • ${loja.endereco}`;
  }

  function renderCategorias() {
    const nav = document.getElementById("categorias-nav");

    const todas = [
      { id: "todas", nome: "Todos", icone: "🍽️" },
      ...categorias.map((c) => ({ id: c.id, nome: c.nome, icone: c.icone })),
    ];

    nav.innerHTML = todas
      .map(
        (c) => `
        <button class="cat-btn ${c.id === categoriaAtiva ? "ativa" : ""}"
                data-cat="${c.id}">
          <span>${c.icone}</span> ${c.nome}
        </button>`
      )
      .join("");

    nav.querySelectorAll(".cat-btn").forEach((btn) =>
      btn.addEventListener("click", () => {
        categoriaAtiva = btn.dataset.cat;
        renderCategorias();
        renderProdutos();
      })
    );
  }

  function renderProdutos() {
    const lista = document.getElementById("lista-produtos");

    const catsSelecionadas =
      categoriaAtiva === "todas"
        ? categorias
        : categorias.filter((c) => c.id === categoriaAtiva);

    lista.innerHTML = catsSelecionadas
      .flatMap((cat) => cat.produtos)
      .map(
        (p) => `
        <article class="card-produto">
          <div class="card-img" style="background-image:url('${p.imagem}')">
            ${p.destaque ? '<span class="tag-destaque">⭐ Mais pedido</span>' : ""}
          </div>
          <div class="card-body">
            <h3>${p.nome}</h3>
            <p class="muted">${p.descricao}</p>
            <div class="card-footer">
              <strong>${formatarPreco(p.preco)}</strong>
              <button class="btn-add" data-id="${p.id}">+ Adicionar</button>
            </div>
          </div>
        </article>`
      )
      .join("");

    lista.querySelectorAll(".btn-add").forEach((btn) =>
      btn.addEventListener("click", () => {
        const produto = encontrarProduto(btn.dataset.id);
        if (produto) abrirModalProduto(produto);
      })
    );

    atualizarBotoesProdutos();
  }

  renderLoja();
  renderCategorias();
  renderProdutos();
})();