/* =========================================================
   DATA.JS — Dados da loja, produtos e utilitários globais
   ========================================================= */

const MENU_DATA = {
  loja: {
    nome: "Pastelaria Kpricho",
    whatsapp: "5512997372713", // DDI + DDD + número, só dígitos
    endereco: "Rua das Palmeiras, 123 - Centro",
    horario: "Ter a Dom, 18h às 23h",
    taxaEntrega: 5.0,
    pedidoMinimo: 20.0,
  },
  categorias: [
    {
      id: "pasteis-salgados",
      nome: "Pastéis Salgados",
      icone: "🥟",
      produtos: [
        {
          id: "p-carne",
          nome: "Pastel de Carne",
          descricao: "Carne moída temperada com azeitonas",
          preco: 9.0,
          imagem: "assets/img/pastel-carne.jpg",
          destaque: true,
        },
        {
          id: "p-queijo",
          nome: "Pastel de Queijo",
          descricao: "Mussarela derretida",
          preco: 8.0,
          imagem: "assets/img/pastel-queijo.jpg",
        },
        {
          id: "p-frango",
          nome: "Pastel de Frango com Catupiry",
          descricao: "Frango desfiado com catupiry cremoso",
          preco: 11.0,
          imagem: "assets/img/pastel-frango.jpg",
        },
        {
          id: "p-pizza",
          nome: "Pastel de Pizza",
          descricao: "Mussarela, presunto, tomate e orégano",
          preco: 10.0,
          imagem: "assets/img/pastel-pizza.jpg",
        },
      ],
    },
    {
      id: "pasteis-doces",
      nome: "Pastéis Doces",
      icone: "🍫",
      produtos: [
        {
          id: "p-chocolate",
          nome: "Pastel de Chocolate",
          descricao: "Chocolate ao leite derretido",
          preco: 10.0,
          imagem: "assets/img/pastel-chocolate.jpg",
        },
        {
          id: "p-romeu",
          nome: "Pastel Romeu e Julieta",
          descricao: "Queijo com goiabada",
          preco: 11.0,
          imagem: "assets/img/pastel-romeu.jpg",
        },
      ],
    },
    {
      id: "bebidas",
      nome: "Bebidas",
      icone: "🥤",
      produtos: [
        {
          id: "b-caldocana",
          nome: "Caldo de Cana 500ml",
          descricao: "Moído na hora",
          preco: 6.0,
          imagem: "assets/img/caldo-cana.jpg",
        },
        {
          id: "b-refri",
          nome: "Refrigerante Lata",
          descricao: "Coca-Cola, Guaraná ou Fanta",
          preco: 6.5,
          imagem: "assets/img/refri.jpg",
        },
      ],
    },
  ],
};

/* =========================================================
   UTILITÁRIOS GLOBAIS
   ========================================================= */

/** Formata um número para moeda brasileira (R$ 0,00) */
function formatarPreco(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/** Busca um produto pelo ID percorrendo todas as categorias */
function encontrarProduto(id) {
  for (const cat of MENU_DATA.categorias) {
    const produto = cat.produtos.find((p) => p.id === id);
    if (produto) return produto;
  }
  return null;
}