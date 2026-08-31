document.addEventListener("DOMContentLoaded", () => {
    const chavePedidos = "pedidosIgorLanches";

    const pedidosNovos = document.querySelector("#pedidos-novos");
    const pedidosPreparo = document.querySelector("#pedidos-preparo");
    const pedidosProntos = document.querySelector("#pedidos-prontos");
    const pedidosFinalizados = document.querySelector("#pedidos-finalizados");

    const contadorNovos = document.querySelector("#contador-novos");
    const contadorPreparo = document.querySelector("#contador-preparo");
    const contadorProntos = document.querySelector("#contador-prontos");
    const contadorFinalizados = document.querySelector("#contador-finalizados");

    const limparFinalizados = document.querySelector("#limpar-finalizados");

    function obterPedidos() {
        try {
            return JSON.parse(localStorage.getItem(chavePedidos)) || [];
        } catch (erro) {
            console.error("Erro ao carregar os pedidos:", erro);
            return [];
        }
    }

    function salvarPedidos(pedidos) {
        localStorage.setItem(chavePedidos, JSON.stringify(pedidos));
    }

    function formatarMoeda(valor) {
        return Number(valor || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    function escaparHTML(texto) {
        return String(texto ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function criarAcoesPedido(pedido) {
        const botaoImprimir = `
            <button
                type="button"
                class="botao-imprimir"
                data-id="${pedido.id}"
                data-acao="imprimir"
            >
                🖨️ Imprimir comanda
            </button>
        `;

        if (pedido.status === "Novo") {
            return `
                ${botaoImprimir}

                <button
                    type="button"
                    class="botao-avancar"
                    data-id="${pedido.id}"
                    data-status="Em preparo"
                >
                    Iniciar preparo
                </button>
            `;
        }

        if (pedido.status === "Em preparo") {
            return `
                ${botaoImprimir}

                <button
                    type="button"
                    class="botao-avancar"
                    data-id="${pedido.id}"
                    data-status="Pronto"
                >
                    Marcar como pronto
                </button>

                <button
                    type="button"
                    class="botao-voltar-status"
                    data-id="${pedido.id}"
                    data-status="Novo"
                >
                    Voltar para novo
                </button>
            `;
        }

        if (pedido.status === "Pronto") {
            return `
                ${botaoImprimir}

                <button
                    type="button"
                    class="botao-avancar"
                    data-id="${pedido.id}"
                    data-status="Finalizado"
                >
                    Finalizar atendimento
                </button>

                <button
                    type="button"
                    class="botao-voltar-status"
                    data-id="${pedido.id}"
                    data-status="Em preparo"
                >
                    Voltar para preparo
                </button>
            `;
        }

        return `
            ${botaoImprimir}

            <button
                type="button"
                class="botao-excluir"
                data-id="${pedido.id}"
                data-acao="excluir"
            >
                Excluir pedido
            </button>
        `;
    }

    function criarCardPedido(pedido) {
        const card = document.createElement("article");
        card.className = "pedido-card";

        const itensHTML = pedido.itens
            .map(item => {
                const totalItem =
                    Number(item.preco) * Number(item.quantidade);

                return `
                    <div class="item-pedido">
                        <span>
                            ${item.quantidade}x
                            ${escaparHTML(item.nome)}
                        </span>

                        <strong>
                            ${formatarMoeda(totalItem)}
                        </strong>
                    </div>
                `;
            })
            .join("");

        const observacoesHTML = pedido.observacoes
            ? `
                <div class="pedido-observacao">
                    <strong>Observação:</strong>
                    ${escaparHTML(pedido.observacoes)}
                </div>
            `
            : "";

        const dinheiroHTML =
            pedido.pagamento === "Dinheiro"
                ? `
                    <div>
                        <strong>Recebido:</strong>
                        ${formatarMoeda(pedido.valorRecebido)}
                    </div>

                    <div>
                        <strong>Troco:</strong>
                        ${formatarMoeda(pedido.troco)}
                    </div>
                `
                : "";

        card.innerHTML = `
            <div class="pedido-topo">
                <h4>Pedido #${pedido.numero}</h4>

                <span class="pedido-horario">
                    ${pedido.horario || ""}
                </span>
            </div>

            <div class="itens-lista">
                ${itensHTML}
            </div>

            ${observacoesHTML}

            <div class="pedido-dados">

                <div>
                    <strong>Pagamento:</strong>
                    ${escaparHTML(pedido.pagamento)}
                </div>

                ${dinheiroHTML}

            </div>

            <div class="pedido-total">
                <span>Total</span>

                <strong>
                    ${formatarMoeda(pedido.total)}
                </strong>
            </div>

            <div class="acoes-pedido">
                ${criarAcoesPedido(pedido)}
            </div>
        `;

        return card;
    }

    function mostrarMensagemVazia(elemento) {
        elemento.innerHTML = `
            <p class="lista-vazia">
                Nenhum pedido nesta etapa.
            </p>
        `;
    }

    function renderizarPedidos() {
        const pedidos = obterPedidos();

        pedidosNovos.innerHTML = "";
        pedidosPreparo.innerHTML = "";
        pedidosProntos.innerHTML = "";
        pedidosFinalizados.innerHTML = "";

        const grupos = {
            "Novo": [],
            "Em preparo": [],
            "Pronto": [],
            "Finalizado": []
        };

        pedidos.forEach(pedido => {
            if (grupos[pedido.status]) {
                grupos[pedido.status].push(pedido);
            }
        });

        grupos.Novo
            .sort((a, b) => a.numero - b.numero)
            .forEach(pedido => {
                pedidosNovos.appendChild(criarCardPedido(pedido));
            });

        grupos["Em preparo"]
            .sort((a, b) => a.numero - b.numero)
            .forEach(pedido => {
                pedidosPreparo.appendChild(criarCardPedido(pedido));
            });

        grupos.Pronto
            .sort((a, b) => a.numero - b.numero)
            .forEach(pedido => {
                pedidosProntos.appendChild(criarCardPedido(pedido));
            });

        grupos.Finalizado
            .sort((a, b) => a.numero - b.numero)
            .forEach(pedido => {
                pedidosFinalizados.appendChild(criarCardPedido(pedido));
            });

        contadorNovos.textContent = grupos.Novo.length;
        contadorPreparo.textContent = grupos["Em preparo"].length;
        contadorProntos.textContent = grupos.Pronto.length;
        contadorFinalizados.textContent = grupos.Finalizado.length;

        if (grupos.Novo.length === 0) {
            mostrarMensagemVazia(pedidosNovos);
        }

        if (grupos["Em preparo"].length === 0) {
            mostrarMensagemVazia(pedidosPreparo);
        }

        if (grupos.Pronto.length === 0) {
            mostrarMensagemVazia(pedidosProntos);
        }

        if (grupos.Finalizado.length === 0) {
            mostrarMensagemVazia(pedidosFinalizados);
        }
    }

    function alterarStatus(id, novoStatus) {
        const pedidos = obterPedidos();

        const pedido = pedidos.find(item => item.id === id);

        if (!pedido) {
            alert("Pedido não encontrado.");
            return;
        }

        pedido.status = novoStatus;

        salvarPedidos(pedidos);
        renderizarPedidos();
    }

    function excluirPedido(id) {
        const pedidos = obterPedidos().filter(
            pedido => pedido.id !== id
        );

        salvarPedidos(pedidos);
        renderizarPedidos();
    }

    function imprimirComanda(pedido) {
        const itensHTML = pedido.itens
            .map(item => {
                const totalItem =
                    Number(item.preco) * Number(item.quantidade);

                return `
                    <div class="linha-item">
                        <span>
                            ${item.quantidade}x
                            ${escaparHTML(item.nome)}
                        </span>

                        <strong>
                            ${formatarMoeda(totalItem)}
                        </strong>
                    </div>
                `;
            })
            .join("");

        const observacoesHTML = pedido.observacoes
            ? `
                <div class="observacoes">
                    <strong>Observações:</strong>
                    <p>${escaparHTML(pedido.observacoes)}</p>
                </div>
            `
            : "";

        const dinheiroHTML =
            pedido.pagamento === "Dinheiro"
                ? pedido.precisaTroco
                    ? `
                        <div>
                            <strong>Troco para:</strong>
                            ${formatarMoeda(pedido.valorRecebido)}
                        </div>

                        <div>
                            <strong>Troco:</strong>
                            ${formatarMoeda(pedido.troco)}
                        </div>
                    `
                    : `
                        <div>
                            <strong>Troco:</strong>
                            Não precisa
                        </div>
                    `
                : "";

        const atendimentoHTML = `
            <div>
                <strong>Atendimento:</strong>
                ${escaparHTML(
                    pedido.tipoAtendimento || "Retirada no balcão"
                )}
            </div>
        `;

        const conteudoComanda = `
            <!DOCTYPE html>
            <html lang="pt-BR">

            <head>
                <meta charset="UTF-8">

                <title>
                    Comanda #${pedido.numero}
                </title>

                <style>
                    * {
                        box-sizing: border-box;
                    }

                    body {
                        width: 300px;
                        margin: 0 auto;
                        padding: 15px;
                        color: #000;
                        background: #fff;
                        font-family: Arial, Helvetica, sans-serif;
                    }

                    .topo {
                        padding-bottom: 12px;
                        border-bottom: 2px dashed #000;
                        text-align: center;
                    }

                    .topo h1 {
                        margin: 0;
                        font-size: 22px;
                    }

                    .numero {
                        margin: 10px 0;
                        font-size: 30px;
                        font-weight: 900;
                    }

                    .retirada {
                        font-size: 16px;
                        font-weight: 800;
                    }

                    .data-hora {
                        margin-bottom: 0;
                        font-size: 13px;
                    }

                    .itens {
                        padding: 12px 0;
                    }

                    .linha-item {
                        display: flex;
                        justify-content: space-between;
                        gap: 12px;
                        margin: 10px 0;
                        font-size: 14px;
                    }

                    .observacoes {
                        margin: 12px 0;
                        padding: 10px;
                        border: 1px dashed #000;
                    }

                    .observacoes p {
                        margin: 6px 0 0;
                    }

                    .dados {
                        margin-top: 12px;
                        padding-top: 12px;
                        border-top: 2px dashed #000;
                    }

                    .dados p {
                        margin: 7px 0;
                    }

                    .total {
                        display: flex;
                        justify-content: space-between;
                        gap: 12px;
                        margin-top: 12px;
                        padding-top: 12px;
                        border-top: 2px solid #000;
                        font-size: 20px;
                        font-weight: 900;
                    }

                    .rodape {
                        margin-top: 18px;
                        text-align: center;
                        font-size: 13px;
                    }

                    @media print {
                        body {
                            width: 100%;
                            padding: 0;
                        }
                    }
                </style>
            </head>

            <body>

                <div class="topo">
                    <h1>Igor Lanches</h1>

                    <div class="numero">
                        Pedido #${pedido.numero}
                    </div>

                    <div class="retirada">
                        ${escaparHTML(
                            pedido.tipoAtendimento || "Retirada no balcão"
                        ).toUpperCase()}
                    </div>

                    <p class="data-hora">
                        ${pedido.data || ""}
                        -
                        ${pedido.horario || ""}
                    </p>
                </div>

                <div class="itens">
                    ${itensHTML}
                </div>

                ${observacoesHTML}

                <div class="dados">

                    ${atendimentoHTML}

                    <p>
                        <strong>Pagamento:</strong>
                        ${escaparHTML(pedido.pagamento)}
                    </p>

                    ${dinheiroHTML}

                    <div class="total">
                        <span>Total</span>

                        <span>
                            ${formatarMoeda(pedido.total)}
                        </span>
                    </div>

                </div>

                <div class="rodape">
                    Aguarde seu número ser chamado.
                </div>

            </body>
            </html>
        `;

        const janelaImpressao = window.open(
            "",
            "_blank",
            "width=420,height=700"
        );

        if (janelaImpressao) {
            janelaImpressao.document.open();
            janelaImpressao.document.write(conteudoComanda);
            janelaImpressao.document.close();

            janelaImpressao.focus();

            setTimeout(() => {
                janelaImpressao.print();
            }, 300);

            return;
        }

        /*
          Caso o navegador bloqueie a nova janela,
          tenta imprimir por um iframe invisível.
        */

        const iframe = document.createElement("iframe");

        iframe.style.position = "fixed";
        iframe.style.right = "0";
        iframe.style.bottom = "0";
        iframe.style.width = "0";
        iframe.style.height = "0";
        iframe.style.border = "0";

        document.body.appendChild(iframe);

        const documentoIframe =
            iframe.contentWindow.document;

        documentoIframe.open();
        documentoIframe.write(conteudoComanda);
        documentoIframe.close();

        setTimeout(() => {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();

            setTimeout(() => {
                iframe.remove();
            }, 1000);
        }, 300);
    }

    document.addEventListener("click", evento => {
        const botao = evento.target.closest("button");

        if (!botao || !botao.dataset.id) {
            return;
        }

        const id = Number(botao.dataset.id);

        if (botao.dataset.acao === "imprimir") {
            const pedidos = obterPedidos();

            const pedido = pedidos.find(
                item => item.id === id
            );

            if (!pedido) {
                alert("Pedido não encontrado.");
                return;
            }

            imprimirComanda(pedido);
            return;
        }

        if (botao.dataset.acao === "excluir") {
            const confirmar = confirm(
                "Deseja excluir este pedido?"
            );

            if (confirmar) {
                excluirPedido(id);
            }

            return;
        }

        if (botao.dataset.status) {
            alterarStatus(
                id,
                botao.dataset.status
            );
        }
    });

    limparFinalizados.addEventListener("click", () => {
        const pedidos = obterPedidos();

        const existemFinalizados = pedidos.some(
            pedido => pedido.status === "Finalizado"
        );

        if (!existemFinalizados) {
            alert(
                "Não há pedidos finalizados para limpar."
            );

            return;
        }

        const confirmar = confirm(
            "Deseja excluir todos os pedidos finalizados?"
        );

        if (!confirmar) {
            return;
        }

        const pedidosAtivos = pedidos.filter(
            pedido => pedido.status !== "Finalizado"
        );

        salvarPedidos(pedidosAtivos);
        renderizarPedidos();
    });

    renderizarPedidos();

    window.addEventListener(
        "storage",
        renderizarPedidos
    );
});