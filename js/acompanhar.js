import { db } from "../firebase/firebase.js";

import {
    doc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    const alvo = document.querySelector("#meu-pedido");

    if (!alvo) {
        console.error("A área #meu-pedido não foi encontrada.");
        return;
    }

    const pedidoLocal = buscarUltimoPedidoLocal();

    if (!pedidoLocal) {
        alvo.innerHTML = `
            <p>Nenhum pedido encontrado neste aparelho.</p>
        `;
        return;
    }

    mostrarPedido(alvo, pedidoLocal);

    const firestoreId = pedidoLocal.firestoreId;

    if (!firestoreId) {
        console.warn(
            "Este pedido não possui identificação do Firestore."
        );

        alvo.insertAdjacentHTML(
            "beforeend",
            `
                <p class="aviso-acompanhamento">
                    O acompanhamento automático não está disponível para este pedido antigo.
                </p>
            `
        );

        return;
    }

    acompanharPedidoEmTempoReal(
        firestoreId,
        alvo,
        pedidoLocal
    );
});

function buscarUltimoPedidoLocal() {
    const idLocal = localStorage.getItem(
        "meuUltimoPedidoIgorLanches"
    );

    const pedidos = JSON.parse(
        localStorage.getItem("pedidosIgorLanches") || "[]"
    );

    if (!idLocal) {
        return null;
    }

    return pedidos.find(
        pedido => String(pedido.id) === String(idLocal)
    ) || null;
}

function acompanharPedidoEmTempoReal(
    firestoreId,
    alvo,
    pedidoLocal
) {
    const pedidoRef = doc(
        db,
        "pedidos",
        firestoreId
    );

    onSnapshot(
        pedidoRef,
        documento => {
            if (!documento.exists()) {
                alvo.innerHTML = `
                    <p>
                        Este pedido não foi encontrado no sistema.
                    </p>
                `;
                return;
            }

            const pedidoFirestore = documento.data();

            const pedidoAtualizado = {
                ...pedidoLocal,
                ...pedidoFirestore,
                firestoreId: documento.id
            };

            atualizarPedidoLocal(pedidoAtualizado);
            mostrarPedido(alvo, pedidoAtualizado);
        },
        erro => {
            console.error(
                "Erro ao acompanhar pedido:",
                erro
            );

            alvo.insertAdjacentHTML(
                "beforeend",
                `
                    <p class="aviso-acompanhamento">
                        Não foi possível atualizar o pedido automaticamente.
                    </p>
                `
            );
        }
    );
}

function atualizarPedidoLocal(pedidoAtualizado) {
    const pedidos = JSON.parse(
        localStorage.getItem("pedidosIgorLanches") || "[]"
    );

    const indice = pedidos.findIndex(
        pedido =>
            String(pedido.id) ===
            String(pedidoAtualizado.id)
    );

    if (indice === -1) {
        return;
    }

    pedidos[indice] = {
        ...pedidos[indice],
        ...pedidoAtualizado
    };

    localStorage.setItem(
        "pedidosIgorLanches",
        JSON.stringify(pedidos)
    );
}

function mostrarPedido(alvo, pedido) {
    const status = normalizarStatus(pedido.status);

    alvo.innerHTML = `
        <p>
            Pedido <strong>#${pedido.numero || "-"}</strong>
        </p>

        <div class="status-acompanhamento status-${status}">
            <span class="status-icone">
                ${iconeDoStatus(status)}
            </span>

            <div>
                <strong>${tituloDoStatus(status)}</strong>
                <p>${descricaoDoStatus(status)}</p>
            </div>
        </div>

        <div class="linha">
            <span>Atendimento</span>
            <strong>
                ${pedido.tipoAtendimento || "Não informado"}
            </strong>
        </div>

        <div class="linha">
            <span>Subtotal</span>
            <strong>
                ${formatarMoeda(
                    pedido.subtotal ?? pedido.total
                )}
            </strong>
        </div>

        ${
            Number(pedido.taxaEntrega) > 0
                ? `
                    <div class="linha">
                        <span>Taxa de entrega</span>
                        <strong>
                            ${formatarMoeda(pedido.taxaEntrega)}
                        </strong>
                    </div>
                `
                : ""
        }

        <div class="linha">
            <span>Total</span>
            <strong>
                ${formatarMoeda(pedido.total)}
            </strong>
        </div>

        ${criarPrevisaoCliente(pedido, status)}

        <div class="etapas-pedido">
            ${criarEtapas(status)}
        </div>

        <p class="mensagem-acompanhamento">
            Esta tela é atualizada automaticamente.
        </p>
    `;
}


function criarPrevisaoCliente(pedido, status) {
    const previsao = obterDataPrevisao(pedido.previsaoPronto);

    if (!previsao || status === "novo" || status === "entregue") return "";

    const diferenca = previsao.getTime() - Date.now();
    const minutos = Math.ceil(Math.abs(diferenca) / 60000);
    const finalizado = ["pronto", "saiu_entrega", "entregue"].includes(status);
    const atrasado = diferenca < 0 && !finalizado;

    return `
        <div class="previsao-cliente ${atrasado ? "previsao-atrasada" : ""}">
            <strong>${finalizado ? "Preparo concluído" : atrasado ? "Pedido atrasado" : "Previsão de preparo"}</strong>
            <span>${finalizado ? "Seu pedido já está pronto." : atrasado ? `Há ${minutos} minuto(s)` : `${previsao.toLocaleTimeString("pt-BR", {hour:"2-digit", minute:"2-digit"})} · ${Math.max(0,minutos)} min restantes`}</span>
        </div>
    `;
}

function obterDataPrevisao(valor) {
    if (!valor) return null;
    if (typeof valor.toDate === "function") return valor.toDate();
    const data = new Date(valor);
    return Number.isNaN(data.getTime()) ? null : data;
}
function criarEtapas(statusAtual) {
    const etapas = [
        {
            status: "novo",
            nome: "Recebido"
        },
        {
            status: "aceito",
            nome: "Aceito"
        },
        {
            status: "preparando",
            nome: "Em preparo"
        },
        {
            status: "pronto",
            nome: "Pronto"
        },
        {
            status: "saiu_entrega",
            nome: "Saiu para entrega"
        },
        {
            status: "entregue",
            nome: "Entregue"
        }
    ];

    const ordemAtual = ordemDoStatus(statusAtual);

    return etapas
        .map(etapa => {
            const concluida =
                ordemDoStatus(etapa.status) <= ordemAtual;

            return `
                <div class="etapa ${
                    concluida ? "etapa-concluida" : ""
                }">
                    <span class="etapa-marcador">
                        ${concluida ? "✓" : ""}
                    </span>

                    <span>${etapa.nome}</span>
                </div>
            `;
        })
        .join("");
}

function normalizarStatus(status) {
    const valor = String(status || "novo")
        .trim()
        .toLowerCase();

    const equivalencias = {
        novo: "novo",
        novos: "novo",
        recebido: "novo",
        "novo pedido": "novo",

        aceito: "aceito",
        "pedido aceito": "aceito",

        preparando: "preparando",
        "em preparo": "preparando",

        pronto: "pronto",
        "pedido pronto": "pronto",

        entrega: "saiu_entrega",
        saiu_entrega: "saiu_entrega",
        "saiu para entrega": "saiu_entrega",

        entregue: "entregue",
        finalizado: "entregue"
    };

    return equivalencias[valor] || "novo";
}

function ordemDoStatus(status) {
    const ordem = {
        novo: 0,
        aceito: 1,
        preparando: 2,
        pronto: 3,
        saiu_entrega: 4,
        entregue: 5
    };

    return ordem[status] ?? 0;
}

function tituloDoStatus(status) {
    const titulos = {
        novo: "Pedido recebido",
        aceito: "Pedido aceito",
        preparando: "Pedido em preparo",
        pronto: "Pedido pronto",
        saiu_entrega: "Saiu para entrega",
        entregue: "Pedido entregue"
    };

    return titulos[status] || "Pedido recebido";
}

function descricaoDoStatus(status) {
    const descricoes = {
        novo: "A lanchonete recebeu seu pedido.",
        aceito: "Seu pedido foi aceito pela lanchonete.",
        preparando: "Seu pedido está sendo preparado.",
        pronto: "Seu pedido está pronto.",
        saiu_entrega: "Seu pedido saiu para entrega.",
        entregue: "Seu pedido foi finalizado."
    };

    return descricoes[status] || "";
}

function iconeDoStatus(status) {
    const icones = {
        novo: "🟡",
        aceito: "👍",
        preparando: "🍳",
        pronto: "✅",
        saiu_entrega: "🛵",
        entregue: "🏁"
    };

    return icones[status] || "🟡";
}

function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );
}