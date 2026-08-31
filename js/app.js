import { db } from "../firebase/firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";
document.addEventListener("DOMContentLoaded", async () => {

    /* =========================================
       PRODUTOS
    ========================================= */

    let produtos = [

        /* HAMBÚRGUERES */

        {
            categoria: "hamburgueres",
            nome: "Hambúrguer",
            preco: 11,
            descricao: "Pão, maionese, tomate, batata e carne.",
            disponivel: true
        },
        {
            categoria: "hamburgueres",
            nome: "X-Búrguer",
            preco: 15,
            descricao: "Pão, maionese, tomate, batata, carne e queijo.",
            disponivel: true
        },
        {
            categoria: "hamburgueres",
            nome: "X-Egg Búrguer",
            preco: 17,
            descricao: "Pão, maionese, tomate, batata, carne, queijo e ovo.",
            disponivel: true
        },
        {
            categoria: "hamburgueres",
            nome: "X-Salada",
            preco: 16,
            descricao: "Pão, maionese, tomate, batata, alface, carne e queijo.",
            disponivel: true
        },
        {
            categoria: "hamburgueres",
            nome: "X-Egg Salada",
            preco: 18,
            descricao: "Pão, maionese, tomate, batata, alface, carne, queijo e ovo.",
            disponivel: true
        },
        {
            categoria: "hamburgueres",
            nome: "X-Especial",
            preco: 17,
            descricao: "Pão, maionese, tomate, milho, batata, carne, queijo e presunto.",
            disponivel: true
        },
        {
            categoria: "hamburgueres",
            nome: "X-Egg Especial",
            preco: 19,
            descricao: "Pão, maionese, tomate, milho, batata, carne, queijo, presunto e ovo.",
            disponivel: true
        },
        {
            categoria: "hamburgueres",
            nome: "X-Bacon",
            preco: 19,
            descricao: "Pão, maionese, tomate, batata, carne, queijo e bacon.",
            disponivel: true
        },
        {
            categoria: "hamburgueres",
            nome: "X-Egg Bacon",
            preco: 21,
            descricao: "Pão, maionese, tomate, batata, carne, queijo, bacon e ovo.",
            disponivel: true
        },
        {
            categoria: "hamburgueres",
            nome: "X-Calabresa",
            preco: 19,
            descricao: "Pão, maionese, tomate, batata, carne, queijo e calabresa.",
            disponivel: true
        },
        {
            categoria: "hamburgueres",
            nome: "X-Egg Calabresa",
            preco: 21,
            descricao: "Pão, maionese, tomate, batata, carne, queijo, calabresa e ovo.",
            disponivel: true
        },
        {
            categoria: "hamburgueres",
            nome: "X-Tudo",
            preco: 25,
            descricao: "Pão, maionese, tomate, milho, batata, carne, queijo, presunto, ovo, bacon e calabresa.",
            disponivel: true
        },

        /* FILÉ DE FRANGO */

        {
            categoria: "frango",
            nome: "X-Frango",
            preco: 21,
            descricao: "Pão, maionese, milho, batata, frango e queijo.",
            disponivel: true
        },
        {
            categoria: "frango",
            nome: "X-Egg Frango",
            preco: 23,
            descricao: "Pão, maionese, milho, batata, frango, queijo e ovo.",
            disponivel: true
        },
        {
            categoria: "frango",
            nome: "Frango Catupiry",
            preco: 21,
            descricao: "Pão, maionese, milho, batata, frango e Catupiry.",
            disponivel: true
        },
        {
            categoria: "frango",
            nome: "Frango Bacon Catupiry",
            preco: 25,
            descricao: "Pão, maionese, milho, batata, frango, Catupiry e bacon.",
            disponivel: true
        },
        {
            categoria: "frango",
            nome: "Frango Calabresa Catupiry",
            preco: 25,
            descricao: "Pão, maionese, milho, batata, frango, Catupiry e calabresa.",
            disponivel: true
        },
        {
            categoria: "frango",
            nome: "À Moda",
            preco: 27,
            descricao: "Pão, maionese, milho, batata, frango, Catupiry, bacon e ovo.",
            disponivel: true
        },
        {
            categoria: "frango",
            nome: "Da Casa",
            preco: 29,
            descricao: "Pão, maionese, milho, batata, frango, Catupiry, bacon, ovo e carne.",
            disponivel: true
        },

        /* SEM CARNE */

        {
            categoria: "sem-carne",
            nome: "Queijo Quente",
            preco: 13,
            descricao: "Pão, maionese e queijo.",
            disponivel: true
        },
        {
            categoria: "sem-carne",
            nome: "Misto Quente",
            preco: 14,
            descricao: "Pão, maionese, queijo e presunto.",
            disponivel: true
        },
        {
            categoria: "sem-carne",
            nome: "Misto Especial",
            preco: 15,
            descricao: "Pão, maionese, milho, batata, queijo e presunto.",
            disponivel: true
        },
        {
            categoria: "sem-carne",
            nome: "Bauru",
            preco: 15,
            descricao: "Pão, maionese, tomate, batata, queijo e presunto.",
            disponivel: true
        },
        {
            categoria: "sem-carne",
            nome: "Americano",
            preco: 17,
            descricao: "Pão, maionese, tomate, batata, alface, queijo, presunto e ovo.",
            disponivel: true
        },
        {
            categoria: "sem-carne",
            nome: "X-Quaresma",
            preco: 16,
            descricao: "Pão, maionese, tomate, milho, batata, ovo e queijo.",
            disponivel: true
        },
        {
            categoria: "sem-carne",
            nome: "X-Quaresma Catupiry",
            preco: 18,
            descricao: "Pão, maionese, tomate, milho, batata, ovo, queijo e Catupiry.",
            disponivel: true
        },

        /* BEBIDAS */

        {
            categoria: "bebidas",
            nome: "Coca Mini",
            preco: 3.50,
            descricao: "Refrigerante Coca-Cola mini.",
            disponivel: true
        },
        {
            categoria: "bebidas",
            nome: "Coca Lata",
            preco: 6.50,
            descricao: "Refrigerante Coca-Cola em lata.",
            disponivel: true
        },
        {
            categoria: "bebidas",
            nome: "Coca 600 ml",
            preco: 8.50,
            descricao: "Refrigerante Coca-Cola 600 ml.",
            disponivel: true
        },
        {
            categoria: "bebidas",
            nome: "Coca 2L",
            preco: 16,
            descricao: "Refrigerante Coca-Cola 2 litros.",
            disponivel: true
        },
        {
            categoria: "bebidas",
            nome: "Guaraná Lata",
            preco: 6.50,
            descricao: "Refrigerante Guaraná em lata.",
            disponivel: true
        },
        {
            categoria: "bebidas",
            nome: "Guaraná 600 ml",
            preco: 8.50,
            descricao: "Refrigerante Guaraná 600 ml.",
            disponivel: true
        },
        {
            categoria: "bebidas",
            nome: "Guaraná 2L",
            preco: 10,
            descricao: "Refrigerante Guaraná 2 litros.",
            disponivel: true
        },
        {
            categoria: "bebidas",
            nome: "Fanta Laranja Lata",
            preco: 6.50,
            descricao: "Refrigerante Fanta Laranja em lata.",
            disponivel: true
        },
        {
            categoria: "bebidas",
            nome: "Fanta Laranja 600 ml",
            preco: 8.50,
            descricao: "Refrigerante Fanta Laranja 600 ml.",
            disponivel: true
        },
        {
            categoria: "bebidas",
            nome: "Água com Gás",
            preco: 4,
            descricao: "Água mineral com gás.",
            disponivel: true
        },
        {
            categoria: "bebidas",
            nome: "Fanta Maracujá Lata",
            preco: 0,
            descricao: "Produto temporariamente esgotado.",
            disponivel: false
        },

        /* COMBOS */

        {
            categoria: "combos",
            nome: "4 Búrguer",
            preco: 72,
            descricao: "4 X-Búrgueres, 4 maioneses e 1 Guaraná 2L.",
            disponivel: true,
            pagamentoRestrito: true
        },
        {
            categoria: "combos",
            nome: "4 Salada",
            preco: 75,
            descricao: "4 X-Saladas, 4 maioneses e 1 Guaraná 2L.",
            disponivel: true,
            pagamentoRestrito: true
        },
        {
            categoria: "combos",
            nome: "4 Especial",
            preco: 79,
            descricao: "4 X-Especiais, 4 maioneses e 1 Guaraná 2L.",
            disponivel: true,
            pagamentoRestrito: true
        },
        {
            categoria: "combos",
            nome: "4 Calabresa",
            preco: 88,
            descricao: "4 X-Calabresas, 4 maioneses e 1 Guaraná 2L.",
            disponivel: true,
            pagamentoRestrito: true
        },

        /* BATATAS */

        {
            categoria: "batatas",
            nome: "Batata Pequena",
            preco: 10,
            descricao: "Porção de fritas sequinhas no capricho.",
            disponivel: true
        },
        {
            categoria: "batatas",
            nome: "Batata Grande",
            preco: 25,
            descricao: "Porção grande de fritas sequinhas no capricho.",
            disponivel: true
        },
        {
            categoria: "batatas",
            nome: "Batata Turbinada",
            preco: 0,
            descricao: "Batata, bacon, calabresa e queijo. Produto esgotado.",
            disponivel: false
        }
    ];

    async function carregarProdutosFirestore() {
        try {
            const snapshot = await getDocs(collection(db, "produtos"));

            if (snapshot.empty) {
                console.info("Coleção produtos vazia: usando cardápio padrão do app.js.");
                return;
            }

            produtos = snapshot.docs
                .map(documento => ({
                    id: documento.id,
                    ...documento.data()
                }))
                .sort((a, b) => {
                    const ordemA = Number(a.ordem) || 0;
                    const ordemB = Number(b.ordem) || 0;
                    return ordemA - ordemB || String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR");
                });
        } catch (erro) {
            console.error("Erro ao carregar produtos do Firestore:", erro);
            console.info("O cardápio padrão continuará disponível.");
        }
    }

    /* =========================================
       ELEMENTOS DA PÁGINA
    ========================================= */

    const listaProdutos = document.querySelector("#lista-produtos");
    const areaFiltros = document.querySelector(".filtros");
    const buscaProduto = document.querySelector("#busca-produto");

    const itensPedido = document.querySelector("#itens-pedido");
    const limparPedidoBotao = document.querySelector("#limpar-pedido");

    const observacoes = document.querySelector("#observacoes");
    const formaPagamento = document.querySelector("#forma-pagamento");

    const areaTroco = document.querySelector("#area-troco");
    const valorRecebido = document.querySelector("#valor-recebido");
    const valorTroco = document.querySelector("#valor-troco");

    const abrirOpcionais = document.querySelector("#abrir-opcionais");
    const listaOpcionais = document.querySelector("#lista-opcionais");
    const precisaTroco = document.querySelector("#precisa-troco");
    const campoValorRecebido = document.querySelector("#campo-valor-recebido");

    const quantidadeTotal = document.querySelector("#quantidade-total");
    const valorSubtotal = document.querySelector("#valor-subtotal");
    const valorTotal = document.querySelector("#valor-total");
    const linhaTaxaEntrega = document.querySelector("#linha-taxa-entrega");
    const dadosEntrega = document.querySelector("#dados-entrega");
    const clienteNome = document.querySelector("#cliente-nome");
    const clienteTelefone = document.querySelector("#cliente-telefone");
    const entregaCep = document.querySelector("#entrega-cep");
    const entregaRua = document.querySelector("#entrega-rua");
    const entregaNumero = document.querySelector("#entrega-numero");
    const entregaBairro = document.querySelector("#entrega-bairro");
    const entregaComplemento = document.querySelector("#entrega-complemento");
    const entregaReferencia = document.querySelector("#entrega-referencia");
    let TAXA_ENTREGA = 7;

    const finalizarPedidoBotao =
        document.querySelector("#finalizar-pedido");

    try {
        const configSnap = await getDoc(doc(db, "configuracoes", "loja"));
        if (configSnap.exists()) {
            const config = configSnap.data();
            TAXA_ENTREGA = Number(config.taxaEntrega) || 0;

            if (config.lojaAberta === false && finalizarPedidoBotao) {
                finalizarPedidoBotao.disabled = true;
                finalizarPedidoBotao.textContent = "Loja fechada";
            }
        }
    } catch (erro) {
        console.warn("Não foi possível carregar as configurações da loja:", erro);
    }

    const horarioAtual = document.querySelector("#horario-atual");

    let pedido = [];
    let categoriaSelecionada = "todos";

    /* =========================================
       FUNÇÕES BÁSICAS
    ========================================= */

    function formatarMoeda(valor) {
        return Number(valor).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    function atualizarHorario() {
        if (!horarioAtual) {
            return;
        }

        horarioAtual.textContent =
            new Date().toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit"
            });
    }

    function calcularSubtotal() {
        return pedido.reduce((total, item) => {
            return total + item.preco * item.quantidade;
        }, 0);
    }

    function obterTipoAtendimento() {
        const campo = document.querySelector('input[name="tipo-atendimento"]:checked');
        return campo ? campo.value.trim() : "";
    }

    function entregaSelecionada() {
        return obterTipoAtendimento().toLowerCase() === "entrega";
    }

    function calcularTotal() {
        const subtotal = calcularSubtotal();
        return entregaSelecionada() ? subtotal + TAXA_ENTREGA : subtotal;
    }

    function calcularQuantidadeTotal() {
        return pedido.reduce((total, item) => {
            return total + item.quantidade;
        }, 0);
    }

    /* =========================================
       FILTROS
    ========================================= */

    function criarFiltros() {
        if (!areaFiltros) {
            return;
        }

        const categorias = [
            { valor: "todos", nome: "Todos" },
            { valor: "hamburgueres", nome: "Hambúrgueres" },
            { valor: "frango", nome: "Frango" },
            { valor: "sem-carne", nome: "Sem carne" },
            { valor: "bebidas", nome: "Bebidas" },
            { valor: "combos", nome: "Combos" },
            { valor: "batatas", nome: "Batatas" }
        ];

        areaFiltros.innerHTML = categorias.map(categoria => `
            <button
                type="button"
                class="filtro ${
                    categoria.valor === "todos" ? "ativo" : ""
                }"
                data-categoria="${categoria.valor}"
            >
                ${categoria.nome}
            </button>
        `).join("");
    }

    /* =========================================
       MOSTRAR PRODUTOS
    ========================================= */

    function renderizarProdutos() {
        const textoBusca =
            buscaProduto.value.trim().toLowerCase();

        const produtosFiltrados = produtos.filter(produto => {
            const correspondeCategoria =
                categoriaSelecionada === "todos" ||
                produto.categoria === categoriaSelecionada;

            const correspondeBusca =
                produto.nome.toLowerCase().includes(textoBusca) ||
                produto.descricao.toLowerCase().includes(textoBusca);

            return correspondeCategoria && correspondeBusca;
        });

        listaProdutos.innerHTML = produtosFiltrados.map(produto => {

            const avisoCombo = produto.pagamentoRestrito
                ? `<span class="aviso-produto">
                       Somente dinheiro ou Pix
                   </span>`
                : "";

            if (!produto.disponivel) {
                return `
                    <button
                        type="button"
                        class="produto-botao produto-esgotado"
                        disabled
                    >
                        <div>
                            <h3>${produto.nome}</h3>
                            <p>${produto.descricao}</p>
                        </div>

                        <strong>Esgotado</strong>
                    </button>
                `;
            }

            return `
                <button
                    type="button"
                    class="produto-botao"
                    data-nome="${produto.nome}"
                    data-preco="${produto.preco}"
                    data-restrito="${produto.pagamentoRestrito === true}"
                >
                    <div>
                        <h3>${produto.nome}</h3>
                        <p>${produto.descricao}</p>
                        ${avisoCombo}
                    </div>

                    <strong>${formatarMoeda(produto.preco)}</strong>
                </button>
            `;
        }).join("");
    }

    /* =========================================
       CARRINHO
    ========================================= */

    function adicionarProduto(nome, preco, restrito) {
        const itemExistente =
            pedido.find(item => item.nome === nome);

        if (itemExistente) {
            itemExistente.quantidade += 1;
        } else {
            pedido.push({
                nome,
                preco,
                quantidade: 1,
                pagamentoRestrito: restrito
            });
        }

        atualizarPedido();
    }

    function atualizarPedido() {
        if (pedido.length === 0) {
            itensPedido.innerHTML = `
                <p class="pedido-vazio">
                    Nenhum produto adicionado.
                </p>
            `;
        } else {
            itensPedido.innerHTML = pedido.map((item, indice) => `
                <div class="item-pedido-atual">

                    <div class="item-pedido-info">
                        <strong>${item.nome}</strong>

                        <span>
                            ${formatarMoeda(item.preco)} cada
                        </span>
                    </div>

                    <div class="item-pedido-controles">

                        <button
                            type="button"
                            class="botao-quantidade"
                            data-acao="diminuir"
                            data-indice="${indice}"
                        >
                            −
                        </button>

                        <strong>${item.quantidade}</strong>

                        <button
                            type="button"
                            class="botao-quantidade"
                            data-acao="aumentar"
                            data-indice="${indice}"
                        >
                            +
                        </button>

                    </div>

                    <div class="item-pedido-valor">

                        <strong>
                            ${formatarMoeda(
                                item.preco * item.quantidade
                            )}
                        </strong>

                        <button
                            type="button"
                            class="botao-remover"
                            data-acao="remover"
                            data-indice="${indice}"
                        >
                            Remover
                        </button>

                    </div>

                </div>
            `).join("");
        }

        quantidadeTotal.textContent =
            calcularQuantidadeTotal();

        if (valorSubtotal) valorSubtotal.textContent = formatarMoeda(calcularSubtotal());
        if (linhaTaxaEntrega) linhaTaxaEntrega.hidden = !entregaSelecionada();
        valorTotal.textContent = formatarMoeda(calcularTotal());

        calcularTroco();
    }

    function calcularTroco() {
        if (formaPagamento.value !== "Dinheiro") {
            valorTroco.textContent = formatarMoeda(0);
            return;
        }

        const recebido =
            Number(valorRecebido.value) || 0;

        const troco =
            Math.max(recebido - calcularTotal(), 0);

        valorTroco.textContent =
            formatarMoeda(troco);
    }

    function limparPedido() {
        pedido = [];

        observacoes.value = "";
        formaPagamento.value = "";
        valorRecebido.value = "";
        clienteNome.value = "";
        clienteTelefone.value = "";
        [entregaCep, entregaRua, entregaNumero, entregaBairro, entregaComplemento, entregaReferencia].forEach(campo => campo.value = "");

        document.querySelector(
            'input[name="tipo-atendimento"][value="Retirada no balcão"]'
        ).checked = true;

        if (dadosEntrega) dadosEntrega.hidden = true;
        precisaTroco.value = "Não";
        campoValorRecebido.hidden = true;

        listaOpcionais.hidden = true;
        abrirOpcionais.textContent = "➕ Adicionar opcionais";

        areaTroco.hidden = true;
        valorTroco.textContent = formatarMoeda(0);

        atualizarPedido();
    }

    /* =========================================
       EVENTOS DOS PRODUTOS
    ========================================= */

    listaProdutos.addEventListener("click", evento => {
        const botao =
            evento.target.closest(".produto-botao");

        if (!botao || botao.disabled) {
            return;
        }

        const nome = botao.dataset.nome;
        const preco = Number(botao.dataset.preco);
        const restrito =
            botao.dataset.restrito === "true";

        adicionarProduto(nome, preco, restrito);
    });

    itensPedido.addEventListener("click", evento => {
        const botao = evento.target.closest("button");

        if (!botao) {
            return;
        }

        const indice = Number(botao.dataset.indice);
        const acao = botao.dataset.acao;

        if (!pedido[indice]) {
            return;
        }

        if (acao === "aumentar") {
            pedido[indice].quantidade += 1;
        }

        if (acao === "diminuir") {
            pedido[indice].quantidade -= 1;

            if (pedido[indice].quantidade <= 0) {
                pedido.splice(indice, 1);
            }
        }

        if (acao === "remover") {
            pedido.splice(indice, 1);
        }

        atualizarPedido();
    });

    /* =========================================
       EVENTOS DOS FILTROS
    ========================================= */

    areaFiltros.addEventListener("click", evento => {
        const botao = evento.target.closest(".filtro");

        if (!botao) {
            return;
        }

        document
            .querySelectorAll(".filtro")
            .forEach(filtro => {
                filtro.classList.remove("ativo");
            });

        botao.classList.add("ativo");

        categoriaSelecionada =
            botao.dataset.categoria;

        renderizarProdutos();
    });

    buscaProduto.addEventListener(
        "input",
        renderizarProdutos
    );

    document.querySelectorAll('input[name="tipo-atendimento"]').forEach(campo => {
        campo.addEventListener("change", () => {
            if (dadosEntrega) dadosEntrega.hidden = !entregaSelecionada();
            atualizarPedido();
        });
    });

    /* =========================================
       PAGAMENTO E TROCO
    ========================================= */

    if (abrirOpcionais && listaOpcionais) {
        abrirOpcionais.addEventListener("click", () => {
            listaOpcionais.hidden = !listaOpcionais.hidden;

            abrirOpcionais.textContent = listaOpcionais.hidden
                ? "➕ Adicionar opcionais"
                : "➖ Fechar opcionais";
        });

        listaOpcionais.addEventListener("click", evento => {
            const botao = evento.target.closest(".opcional-botao");

            if (!botao) {
                return;
            }

            const nome = botao.dataset.nome;
            const preco = Number(botao.dataset.preco);

            adicionarProduto(nome, preco, false);
        });
    }

    formaPagamento.addEventListener("change", () => {
        const pagamentoEmDinheiro =
            formaPagamento.value === "Dinheiro";

        areaTroco.hidden = !pagamentoEmDinheiro;

        if (!pagamentoEmDinheiro) {
            precisaTroco.value = "Não";
            campoValorRecebido.hidden = true;
            valorRecebido.value = "";
            valorTroco.textContent = formatarMoeda(0);
        }
    });

    if (precisaTroco && campoValorRecebido) {
        precisaTroco.addEventListener("change", () => {
            const precisa = precisaTroco.value === "Sim";

            campoValorRecebido.hidden = !precisa;

            if (!precisa) {
                valorRecebido.value = "";
                valorTroco.textContent = formatarMoeda(0);
                return;
            }

            calcularTroco();
        });
    }

    valorRecebido.addEventListener(
        "input",
        calcularTroco
    );

    /* =========================================
       LIMPAR PEDIDO
    ========================================= */

    limparPedidoBotao.addEventListener("click", () => {
        if (pedido.length === 0) {
            return;
        }

        const confirmar =
            confirm("Deseja limpar o pedido atual?");

        if (confirmar) {
            limparPedido();
        }
    });

    /* =========================================
       FINALIZAR PEDIDO
    ========================================= */

    finalizarPedidoBotao.addEventListener("click", async () => {

        if (pedido.length === 0) {
            alert(
                "Adicione pelo menos um produto ao pedido."
            );
            return;
        }

        if (!formaPagamento.value) {
            alert("Selecione a forma de pagamento.");
            formaPagamento.focus();
            return;
        }

        const possuiComboRestrito =
            pedido.some(item => item.pagamentoRestrito);

        const pagamentoPermitidoCombo =
            formaPagamento.value === "Dinheiro" ||
            formaPagamento.value === "Pix";

        if (
            possuiComboRestrito &&
            !pagamentoPermitidoCombo
        ) {
            alert(
                "Os combos só podem ser pagos em dinheiro ou Pix."
            );

            formaPagamento.focus();
            return;
        }

        const subtotal = calcularSubtotal();
        const total = calcularTotal();

        const tipoAtendimento = obterTipoAtendimento();

        const nomeCliente = clienteNome.value.trim();
        const telefoneCliente = clienteTelefone.value.trim();

        if (!nomeCliente || !telefoneCliente) {
            alert("Informe seu nome e telefone.");
            (!nomeCliente ? clienteNome : clienteTelefone).focus();
            return;
        }

        if (tipoAtendimento === "Entrega") {
            const camposObrigatorios = [entregaRua, entregaNumero, entregaBairro];
            const campoVazio = camposObrigatorios.find(campo => !campo.value.trim());
            if (campoVazio) {
                alert("Preencha rua, número e bairro para a entrega.");
                campoVazio.focus();
                return;
            }
        }

        const precisaDeTroco =
            formaPagamento.value === "Dinheiro" &&
            precisaTroco.value === "Sim";

        const recebido =
            Number(valorRecebido.value) || 0;

        if (
            precisaDeTroco &&
            recebido < total
        ) {
            alert(
                "O valor informado para o troco é menor que o total."
            );

            valorRecebido.focus();
            return;
        }

        const pedidosSalvos =
            JSON.parse(
                localStorage.getItem(
                    "pedidosIgorLanches"
                )
            ) || [];

        const ultimoNumero =
            Number(
                localStorage.getItem(
                    "ultimoNumeroPedido"
                )
            ) || 0;

        const numeroPedido = ultimoNumero + 1;
        const agora = new Date();

        const novoPedido = {
            id: Date.now(),

            numero: numeroPedido,

            data: agora.toLocaleDateString("pt-BR"),

            horario: agora.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit"
            }),

            itens: pedido.map(item => ({
                nome: item.nome,
                preco: item.preco,
                quantidade: item.quantidade
            })),

            observacoes:
                observacoes.value.trim(),

            pagamento:
                formaPagamento.value,

            tipoAtendimento,
            cliente: { nome: nomeCliente, telefone: telefoneCliente },
            endereco: tipoAtendimento === "Entrega" ? {
                cep: entregaCep.value.trim(),
                rua: entregaRua.value.trim(),
                numero: entregaNumero.value.trim(),
                bairro: entregaBairro.value.trim(),
                complemento: entregaComplemento.value.trim(),
                referencia: entregaReferencia.value.trim()
            } : null,
            subtotal,
            taxaEntrega: tipoAtendimento.toLowerCase() === "entrega" ? TAXA_ENTREGA : 0,

            precisaTroco: precisaDeTroco,

            valorRecebido:
                precisaDeTroco
                    ? recebido
                    : null,

            troco:
                precisaDeTroco
                    ? Math.max(recebido - total, 0)
                    : 0,

            total,

            status: "Novo"
        };
try {
    const pedidoFirestore = await addDoc(
        collection(db, "pedidos"),
        {
            ...novoPedido,
            cliente: novoPedido.cliente.nome,
            telefone: novoPedido.cliente.telefone,
            criadoEm: new Date()
        }
    );

    novoPedido.firestoreId = pedidoFirestore.id;

} catch (erro) {
    console.error("Erro ao enviar pedido ao Firestore:", erro);

    alert("Não foi possível enviar o pedido para a lanchonete.");

    return;
}
        pedidosSalvos.push(novoPedido);

        localStorage.setItem(
            "pedidosIgorLanches",
            JSON.stringify(pedidosSalvos)
        );

        localStorage.setItem(
            "ultimoNumeroPedido",
            String(numeroPedido)
        );
        localStorage.setItem("meuUltimoPedidoIgorLanches", String(novoPedido.id));

        alert(
            `Pedido nº ${numeroPedido} finalizado!\n` +
            `Total: ${formatarMoeda(total)}`
        );

        limparPedido();
        window.location.href = "acompanhar.html";
    });

    /* =========================================
       INICIAR SISTEMA
    ========================================= */

    await carregarProdutosFirestore();
    criarFiltros();
    renderizarProdutos();
    atualizarPedido();
    atualizarHorario();

    setInterval(atualizarHorario, 30000);
});