/* =========================================================
   DATA.JS — Dados da loja, produtos e utilitários globais
   ========================================================= */

const MENU_DATA = {
  loja: {
    nome: "Pastelaria Kpricho",
    whatsapp: "5512997372713",
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
          ingredientes: ["Massa crocante", "Carne moída", "Azeitona", "Temperos"],
          preco: 9.0,
          imagem: "assets/img/pastel-carne.jpg",
          destaque: true,
        },
        {
          id: "p-queijo",
          nome: "Pastel de Queijo",
          descricao: "Mussarela derretida",
          ingredientes: ["Massa crocante", "Queijo mussarela"],
          preco: 8.0,
          imagem: "assets/img/pastel-queijo.jpg",
        },
        {
          id: "p-frango",
          nome: "Pastel de Frango com Catupiry",
          descricao: "Frango desfiado com catupiry cremoso",
          ingredientes: ["Massa crocante", "Frango desfiado", "Catupiry", "Temperos"],
          preco: 11.0,
          imagem: "assets/img/pastel-frango.jpg",
        },
        {
          id: "p-pizza",
          nome: "Pastel de Pizza",
          descricao: "Mussarela, presunto, tomate e orégano",
          ingredientes: ["Massa crocante", "Mussarela", "Presunto", "Tomate", "Orégano"],
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
          ingredientes: ["Massa crocante", "Chocolate ao leite"],
          preco: 10.0,
          imagem: "assets/img/pastel-chocolate.jpg",
        },
        {
          id: "p-romeu",
          nome: "Pastel Romeu e Julieta",
          descricao: "Queijo com goiabada",
          ingredientes: ["Massa crocante", "Queijo minas", "Goiabada"],
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
          ingredientes: ["Cana-de-açúcar", "Gelo", "Limão (opcional)"],
          preco: 6.0,
          imagem: "assets/img/caldo-cana.jpg",
        },
        {
          id: "b-refri",
          nome: "Refrigerante Lata",
          descricao: "Coca-Cola, Guaraná ou Fanta",
          ingredientes: ["Lata 350ml", "Servido gelado"],
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

function formatarPreco(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function encontrarProduto(id) {
  for (const cat of MENU_DATA.categorias) {
    const produto = cat.produtos.find((p) => p.id === id);
    if (produto) return produto;
  }
  return null;
}