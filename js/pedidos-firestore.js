console.log("PEDIDOS FIRESTORE CARREGADO");

import { db } from "../firebase/firebase.js";

import {
    collection,
    onSnapshot,
    doc,
    updateDoc,
    deleteDoc,
    getDocs,
    query,
    where,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const listaNovos = document.querySelector("#pedidos-novos");
const listaPreparo = document.querySelector("#pedidos-preparo");
const listaProntos = document.querySelector("#pedidos-prontos");
const listaFinalizados = document.querySelector("#pedidos-finalizados");

const contadorNovos = document.querySelector("#contador-novos");
const contadorPreparo = document.querySelector("#contador-preparo");
const contadorProntos = document.querySelector("#contador-prontos");
const contadorFinalizados = document.querySelector("#contador-finalizados");


let tempoPreparoPadrao = 20;
let impressaoAutomatica = false;
let larguraComanda = 80;
let autoImpressaoLiberada = sessionStorage.getItem("autoImpressaoLiberada") === "1";

getDoc(doc(db, "configuracoes", "loja"))
    .then(snapshot => {
        if (snapshot.exists()) {
            const c = snapshot.data();
            tempoPreparoPadrao = Number(c.tempoPreparoPadrao) || 20;
            impressaoAutomatica = c.impressaoAutomatica === true;
            larguraComanda = Number(c.larguraComanda) === 58 ? 58 : 80;
        }
    })
    .catch(erro => console.warn("Configuração de tempo não carregada:", erro));

const botaoLimparFinalizados =
    document.querySelector("#limpar-finalizados");

/* =========================================
   SOM DE NOVO PEDIDO
========================================= */

let audioContext = null;
let somAtivado = false;
let primeiraLeituraConcluida = false;

const botaoAtivarSom = document.createElement("button");
botaoAtivarSom.type = "button";
botaoAtivarSom.id = "ativar-som-pedidos";
botaoAtivarSom.textContent = "🔔 Ativar som";

const botaoAutoImpressao = document.createElement("button");
botaoAutoImpressao.type = "button";
botaoAutoImpressao.id = "ativar-auto-impressao";
botaoAutoImpressao.textContent = autoImpressaoLiberada ? "🖨 Auto impressão ativa" : "🖨 Ativar auto impressão";

if (botaoLimparFinalizados?.parentElement) {
    botaoLimparFinalizados.insertAdjacentElement("afterend", botaoAtivarSom);
    botaoAtivarSom.insertAdjacentElement("afterend", botaoAutoImpressao);
}

if (
    !listaNovos ||
    !listaPreparo ||
    !listaProntos ||
    !listaFinalizados
) {
    console.error("As áreas dos pedidos não foram encontradas no HTML.");
} else {
    iniciarPainel();
}

if (botaoLimparFinalizados) {
    botaoLimparFinalizados.addEventListener(
        "click",
        limparPedidosFinalizados
    );
}

botaoAtivarSom.addEventListener("click", ativarSomDosPedidos);
botaoAutoImpressao.addEventListener("click", () => { autoImpressaoLiberada = true; sessionStorage.setItem("autoImpressaoLiberada","1"); botaoAutoImpressao.textContent="🖨 Auto impressão ativa"; alert("Auto impressão liberada nesta aba. O navegador ainda mostrará a janela de impressão."); });

function iniciarPainel() {
    const pedidosRef = collection(db, "pedidos");

    onSnapshot(
        pedidosRef,
        snapshot => {
            verificarNovosPedidos(snapshot);
            if (primeiraLeituraConcluida && impressaoAutomatica && autoImpressaoLiberada) {
                snapshot.docChanges().filter(m => m.type === "added").forEach(m => imprimirComanda({ ...m.doc.data(), id: m.doc.id }));
            }

            const pedidos = [];

            snapshot.forEach(documento => {
                pedidos.push({
                    ...documento.data(),
                    id: documento.id
                });
            });

            pedidos.sort((a, b) => {
                const numeroA = Number(a.numero) || 0;
                const numeroB = Number(b.numero) || 0;

                return numeroB - numeroA;
            });

            renderizarPainel(pedidos);
        },
        erro => {
            console.error("ERRO FIRESTORE:", erro);

            listaNovos.innerHTML = `
                <p class="lista-vazia">
                    Não foi possível carregar os pedidos.
                </p>
            `;
        }
    );
}

function renderizarPainel(pedidos) {
    listaNovos.innerHTML = "";
    listaPreparo.innerHTML = "";
    listaProntos.innerHTML = "";
    listaFinalizados.innerHTML = "";

    const pedidosNovos = [];
    const pedidosPreparo = [];
    const pedidosProntos = [];
    const pedidosFinalizados = [];

    pedidos.forEach(pedido => {
        const status = normalizarStatus(pedido.status);

        if (status === "novo") {
            pedidosNovos.push(pedido);
            return;
        }

        if (status === "aceito" || status === "preparando") {
            pedidosPreparo.push(pedido);
            return;
        }

        if (status === "pronto" || status === "saiu_entrega") {
            pedidosProntos.push(pedido);
            return;
        }

        if (status === "entregue") {
            pedidosFinalizados.push(pedido);
            return;
        }

        pedidosNovos.push(pedido);
    });

    contadorNovos.textContent = pedidosNovos.length;
    contadorPreparo.textContent = pedidosPreparo.length;
    contadorProntos.textContent = pedidosProntos.length;
    contadorFinalizados.textContent = pedidosFinalizados.length;

    renderizarLista(listaNovos, pedidosNovos);
    renderizarLista(listaPreparo, pedidosPreparo);
    renderizarLista(listaProntos, pedidosProntos);
    renderizarLista(listaFinalizados, pedidosFinalizados);
}

function renderizarLista(lista, pedidos) {
    if (pedidos.length === 0) {
        lista.innerHTML = `
            <p class="lista-vazia">
                Nenhum pedido nesta etapa.
            </p>
        `;
        return;
    }

    pedidos.forEach(pedido => {
        lista.appendChild(criarCardPedido(pedido));
    });
}

function criarCardPedido(pedido) {
    const card = document.createElement("div");
    card.className = "pedido-card";

    const statusAtual = normalizarStatus(pedido.status);
    const proximoStatus = obterProximoStatus(statusAtual);

    const nomeCliente =
        typeof pedido.cliente === "object"
            ? pedido.cliente?.nome
            : pedido.cliente;

    const telefoneCliente =
        typeof pedido.cliente === "object"
            ? pedido.cliente?.telefone
            : pedido.telefone;

    const tipoAtendimento =
        pedido.tipoAtendimento ||
        pedido.tipoEntrega ||
        pedido.tipo ||
        "Não informado";

    const itensHtml = Array.isArray(pedido.itens)
        ? pedido.itens
            .map(item => `
                <li>
                    ${item.quantidade || 1}x
                    ${item.nome || "Produto"}
                </li>
            `)
            .join("")
        : "";

    card.innerHTML = `
        <div class="pedido-card-topo">
            <div>
                <span class="pedido-numero">
                    Pedido #${pedido.numero || pedido.id.slice(0, 6)}
                </span>

                <h3>${nomeCliente || "Cliente não informado"}</h3>
            </div>

            <span class="pedido-status">
                ${nomeDoStatus(statusAtual)}
            </span>
        </div>

        <div class="pedido-informacoes">
            ${
                telefoneCliente
                    ? `
                        <p>
                            <strong>Telefone:</strong>
                            ${telefoneCliente}
                        </p>
                    `
                    : ""
            }

            <p>
                <strong>Tipo:</strong>
                ${tipoAtendimento}
            </p>

            <p>
                <strong>Pagamento:</strong>
                ${pedido.pagamento || "Não informado"}
            </p>

            ${
                itensHtml
                    ? `
                        <div class="pedido-itens">
                            <strong>Itens:</strong>
                            <ul>
                                ${itensHtml}
                            </ul>
                        </div>
                    `
                    : ""
            }

            ${
                pedido.observacoes
                    ? `
                        <p>
                            <strong>Observações:</strong>
                            ${pedido.observacoes}
                        </p>
                    `
                    : ""
            }

            <p>
                <strong>Total:</strong>
                ${formatarDinheiro(pedido.total)}
            </p>

            ${criarBlocoPrevisao(pedido, statusAtual)}
        </div>

        <div class="pedido-acoes">
            <button
                type="button"
                class="botao-imprimir"
            >
                🖨 Imprimir
            </button>

            ${
                proximoStatus !== null
                    ? `
                        <button
                            type="button"
                            class="botao-status"
                            data-id="${pedido.id}"
                            data-status="${proximoStatus}"
                        >
                            ${textoDoBotao(proximoStatus)}
                        </button>
                    `
                    : `
                        <p class="pedido-concluido">
                            Pedido concluído
                        </p>
                    `
            }
        </div>
    `;

    const botaoStatus = card.querySelector(".botao-status");
    const botaoImprimir = card.querySelector(".botao-imprimir");

    if (botaoStatus) {
        botaoStatus.addEventListener("click", async () => {
            await alterarStatus(
                botaoStatus.dataset.id,
                botaoStatus.dataset.status,
                botaoStatus
            );
        });
    }

    if (botaoImprimir) {
        botaoImprimir.addEventListener("click", () => {
            imprimirComanda(pedido);
        });
    }

    return card;
}

function imprimirComanda(pedido) {
    const janela = window.open("", "_blank", "width=480,height=760");

    if (!janela) {
        alert("O navegador bloqueou a janela de impressão. Permita pop-ups para este site.");
        return;
    }

    const nomeCliente =
        typeof pedido.cliente === "object"
            ? pedido.cliente?.nome
            : pedido.cliente;

    const telefoneCliente =
        typeof pedido.cliente === "object"
            ? pedido.cliente?.telefone
            : pedido.telefone;

    const tipoAtendimento =
        pedido.tipoAtendimento ||
        pedido.tipoEntrega ||
        pedido.tipo ||
        "Não informado";

    const endereco = pedido.endereco || null;
    const enderecoHtml = montarEnderecoImpressao(endereco, tipoAtendimento);

    const itensHtml = Array.isArray(pedido.itens) && pedido.itens.length
        ? pedido.itens.map(item => {
            const quantidade = Number(item.quantidade) || 1;
            const nome = escaparHtml(item.nome || "Produto");
            const preco = Number(item.preco) || 0;
            const totalItem = preco * quantidade;

            return `
                <div class="item">
                    <div class="item-linha">
                        <strong>${quantidade}x ${nome}</strong>
                        ${preco > 0 ? `<span>${formatarDinheiro(totalItem)}</span>` : ""}
                    </div>
                </div>
            `;
        }).join("")
        : `<p>Nenhum item informado.</p>`;

    const taxaEntrega = Number(pedido.taxaEntrega) || 0;
    const subtotal = Number(pedido.subtotal);
    const valorRecebido = Number(pedido.valorRecebido) || 0;
    const troco = Number(pedido.troco) || 0;

    const dataPedido = escaparHtml(pedido.data || "");
    const horarioPedido = escaparHtml(pedido.horario || "");
    const dataHora = [dataPedido, horarioPedido].filter(Boolean).join(" - ");

    janela.document.open();
    janela.document.write(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Comanda Pedido #${escaparHtml(pedido.numero || "-")}</title>
            <style>
                * { box-sizing: border-box; }

                body {
                    margin: 0;
                    padding: 12px;
                    background: #fff;
                    color: #000;
                    font-family: Arial, Helvetica, sans-serif;
                }

                .comanda {
                    width: ${larguraComanda}mm;
                    max-width: 100%;
                    margin: 0 auto;
                    font-size: 13px;
                    line-height: 1.35;
                }

                .centro { text-align: center; }
                .loja { font-size: 22px; font-weight: 900; margin: 0; }
                .pedido-numero { font-size: 20px; font-weight: 900; margin: 8px 0 2px; }
                .separador { border-top: 1px dashed #000; margin: 10px 0; }
                .titulo { font-weight: 800; text-transform: uppercase; margin-bottom: 3px; }
                .linha { display: flex; justify-content: space-between; gap: 12px; margin: 3px 0; }
                .linha strong, .item-linha strong { overflow-wrap: anywhere; }
                .item { margin: 6px 0; }
                .item-linha { display: flex; justify-content: space-between; gap: 10px; }
                .observacao { white-space: pre-wrap; font-weight: 700; }
                .total { font-size: 19px; font-weight: 900; }
                .rodape { margin-top: 12px; text-align: center; font-size: 12px; }

                @page {
                    size: ${larguraComanda}mm auto;
                    margin: 4mm;
                }

                @media print {
                    body { padding: 0; }
                    .comanda { width: ${larguraComanda === 58 ? 52 : 72}mm; }
                }
            </style>
        </head>
        <body>
            <main class="comanda">
                <header class="centro">
                    <p class="loja">IGOR LANCHES</p>
                    <p class="pedido-numero">PEDIDO #${escaparHtml(pedido.numero || "-")}</p>
                    <div>${escaparHtml(tipoAtendimento)}</div>
                    ${dataHora ? `<div>${dataHora}</div>` : ""}
                </header>

                <div class="separador"></div>

                <section>
                    <div class="titulo">Cliente</div>
                    <div>${escaparHtml(nomeCliente || "Não informado")}</div>
                    ${telefoneCliente ? `<div>${escaparHtml(telefoneCliente)}</div>` : ""}
                </section>

                ${enderecoHtml}

                <div class="separador"></div>

                <section>
                    <div class="titulo">Itens</div>
                    ${itensHtml}
                </section>

                ${pedido.observacoes ? `
                    <div class="separador"></div>
                    <section>
                        <div class="titulo">Observações</div>
                        <div class="observacao">${escaparHtml(pedido.observacoes)}</div>
                    </section>
                ` : ""}

                <div class="separador"></div>

                <section>
                    <div class="linha">
                        <span>Pagamento</span>
                        <strong>${escaparHtml(pedido.pagamento || "Não informado")}</strong>
                    </div>

                    ${Number.isFinite(subtotal) ? `
                        <div class="linha">
                            <span>Subtotal</span>
                            <strong>${formatarDinheiro(subtotal)}</strong>
                        </div>
                    ` : ""}

                    ${taxaEntrega > 0 ? `
                        <div class="linha">
                            <span>Taxa de entrega</span>
                            <strong>${formatarDinheiro(taxaEntrega)}</strong>
                        </div>
                    ` : ""}

                    ${pedido.precisaTroco && valorRecebido > 0 ? `
                        <div class="linha">
                            <span>Valor recebido</span>
                            <strong>${formatarDinheiro(valorRecebido)}</strong>
                        </div>
                        <div class="linha">
                            <span>Troco</span>
                            <strong>${formatarDinheiro(troco)}</strong>
                        </div>
                    ` : ""}

                    <div class="separador"></div>

                    <div class="linha total">
                        <span>TOTAL</span>
                        <strong>${formatarDinheiro(pedido.total)}</strong>
                    </div>
                </section>

                <div class="separador"></div>

                <footer class="rodape">
                    Obrigado pela preferência.<br>
                    IGOR LANCHES
                </footer>
            </main>

            <script>
                window.addEventListener("load", () => {
                    window.focus();
                    window.print();
                });
            <\/script>
        </body>
        </html>
    `);
    janela.document.close();
}

function montarEnderecoImpressao(endereco, tipoAtendimento) {
    const entrega = String(tipoAtendimento || "")
        .trim()
        .toLowerCase() === "entrega";

    if (!entrega || !endereco || typeof endereco !== "object") {
        return "";
    }

    const linhaPrincipal = [
        endereco.rua,
        endereco.numero
    ].filter(Boolean).join(", ");

    const detalhes = [
        endereco.bairro,
        endereco.complemento,
        endereco.cep ? `CEP ${endereco.cep}` : ""
    ].filter(Boolean).join(" - ");

    return `
        <div class="separador"></div>
        <section>
            <div class="titulo">Endereço de entrega</div>
            ${linhaPrincipal ? `<div>${escaparHtml(linhaPrincipal)}</div>` : ""}
            ${detalhes ? `<div>${escaparHtml(detalhes)}</div>` : ""}
            ${endereco.referencia ? `<div><strong>Referência:</strong> ${escaparHtml(endereco.referencia)}</div>` : ""}
        </section>
    `;
}

function escaparHtml(valor) {
    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

async function alterarStatus(pedidoId, novoStatus, botao) {
    try {
        botao.disabled = true;
        botao.textContent = "Atualizando...";

        const pedidoRef = doc(db, "pedidos", pedidoId);
        const dadosAtualizacao = {
            status: novoStatus,
            atualizadoEm: new Date()
        };

        if (novoStatus === "aceito") {
            const minutos = escolherTempoPreparo();

            if (minutos === null) {
                botao.disabled = false;
                botao.textContent = textoDoBotao(novoStatus);
                return;
            }

            dadosAtualizacao.status = "preparando";
            dadosAtualizacao.tempoPreparoMinutos = minutos;
            dadosAtualizacao.previsaoPronto = new Date(Date.now() + minutos * 60000);
        }

        await updateDoc(pedidoRef, dadosAtualizacao);
    } catch (erro) {
        console.error("Erro ao atualizar status:", erro);
        alert("Não foi possível atualizar o pedido.");
        botao.disabled = false;
        botao.textContent = textoDoBotao(novoStatus);
    }
}

function escolherTempoPreparo() {
    const resposta = prompt(
        "Tempo de preparo em minutos:\n\n15, 20, 30, 40 ou outro valor",
        String(tempoPreparoPadrao)
    );

    if (resposta === null) return null;

    const minutos = Number(String(resposta).replace(",", "."));

    if (!Number.isFinite(minutos) || minutos < 1 || minutos > 240) {
        alert("Informe um tempo entre 1 e 240 minutos.");
        return escolherTempoPreparo();
    }

    return Math.round(minutos);
}

function obterDataPrevisao(valor) {
    if (!valor) return null;
    if (typeof valor.toDate === "function") return valor.toDate();

    const data = new Date(valor);
    return Number.isNaN(data.getTime()) ? null : data;
}

function criarBlocoPrevisao(pedido, statusAtual) {
    const previsao = obterDataPrevisao(pedido.previsaoPronto);

    if (!previsao || statusAtual === "novo" || statusAtual === "entregue") {
        return "";
    }

    const agora = new Date();
    const diferenca = previsao.getTime() - agora.getTime();
    const minutos = Math.ceil(Math.abs(diferenca) / 60000);
    const atrasado = diferenca < 0 && !["pronto", "saiu_entrega", "entregue"].includes(statusAtual);
    const concluido = ["pronto", "saiu_entrega", "entregue"].includes(statusAtual);

    let texto = `Previsão: ${previsao.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;

    if (atrasado) texto = `⚠️ Atrasado há ${minutos} min`;
    else if (!concluido) texto += ` · ${Math.max(0, minutos)} min restantes`;
    else texto = "✅ Preparo concluído";

    return `<div class="previsao-pedido ${atrasado ? "previsao-atrasada" : ""}">${texto}</div>`;
}

async function limparPedidosFinalizados() {
    const confirmar = confirm(
        "Deseja apagar todos os pedidos finalizados?"
    );

    if (!confirmar) {
        return;
    }

    try {
        botaoLimparFinalizados.disabled = true;
        botaoLimparFinalizados.textContent = "Limpando...";

        const pedidosRef = collection(db, "pedidos");

        const consultaEntregues = query(
            pedidosRef,
            where("status", "==", "entregue")
        );

        const consultaEntreguesMaiusculo = query(
            pedidosRef,
            where("status", "==", "Entregue")
        );

        const [resultado1, resultado2] = await Promise.all([
            getDocs(consultaEntregues),
            getDocs(consultaEntreguesMaiusculo)
        ]);

        const documentos = new Map();

        resultado1.forEach(documento => {
            documentos.set(documento.id, documento);
        });

        resultado2.forEach(documento => {
            documentos.set(documento.id, documento);
        });

        if (documentos.size === 0) {
            alert("Não existem pedidos finalizados para apagar.");
            return;
        }

        await Promise.all(
            Array.from(documentos.values()).map(documento =>
                deleteDoc(doc(db, "pedidos", documento.id))
            )
        );

        alert("Pedidos finalizados apagados com sucesso.");
    } catch (erro) {
        console.error(
            "Erro ao limpar pedidos finalizados:",
            erro
        );

        alert("Não foi possível limpar os pedidos finalizados.");
    } finally {
        botaoLimparFinalizados.disabled = false;
        botaoLimparFinalizados.textContent = "Limpar finalizados";
    }
}

async function ativarSomDosPedidos() {
    try {
        const AudioContext =
            window.AudioContext || window.webkitAudioContext;

        if (!AudioContext) {
            alert("Este navegador não suporta o som de notificações.");
            return;
        }

        if (!audioContext) {
            audioContext = new AudioContext();
        }

        if (audioContext.state === "suspended") {
            await audioContext.resume();
        }

        somAtivado = true;

        botaoAtivarSom.textContent = "🔔 Som ativado";
        botaoAtivarSom.disabled = true;

        tocarSomNovoPedido();
    } catch (erro) {
        console.error("Erro ao ativar o som:", erro);
        alert("Não foi possível ativar o som de novos pedidos.");
    }
}

function verificarNovosPedidos(snapshot) {
    if (!primeiraLeituraConcluida) {
        primeiraLeituraConcluida = true;
        return;
    }

    const chegouPedidoNovo = snapshot
        .docChanges()
        .some(alteracao => {
            if (alteracao.type !== "added") {
                return false;
            }

            const pedido = alteracao.doc.data();

            return normalizarStatus(pedido.status) === "novo";
        });

    if (chegouPedidoNovo) {
        tocarSomNovoPedido();
        destacarTituloDaPagina();
    }
}

function tocarSomNovoPedido() {
    if (!somAtivado || !audioContext) {
        return;
    }

    try {
        const agora = audioContext.currentTime;

        tocarNota(880, agora, 0.16);
        tocarNota(1175, agora + 0.18, 0.22);
        tocarNota(880, agora + 0.44, 0.16);
        tocarNota(1175, agora + 0.62, 0.28);
    } catch (erro) {
        console.error("Erro ao tocar notificação:", erro);
    }
}

function tocarNota(frequencia, inicio, duracao) {
    const oscilador = audioContext.createOscillator();
    const volume = audioContext.createGain();

    oscilador.type = "sine";
    oscilador.frequency.setValueAtTime(frequencia, inicio);

    volume.gain.setValueAtTime(0.0001, inicio);
    volume.gain.exponentialRampToValueAtTime(
        0.22,
        inicio + 0.02
    );
    volume.gain.exponentialRampToValueAtTime(
        0.0001,
        inicio + duracao
    );

    oscilador.connect(volume);
    volume.connect(audioContext.destination);

    oscilador.start(inicio);
    oscilador.stop(inicio + duracao + 0.03);
}

function destacarTituloDaPagina() {
    const tituloOriginal = "Igor Lanches | Pedidos";

    document.title = "🔔 NOVO PEDIDO!";

    window.setTimeout(() => {
        document.title = tituloOriginal;
    }, 5000);
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

    return equivalencias[valor] || valor;
}

function obterProximoStatus(status) {
    const sequencia = {
        novo: "aceito",
        aceito: "preparando",
        preparando: "pronto",
        pronto: "saiu_entrega",
        saiu_entrega: "entregue",
        entregue: null
    };

    if (Object.prototype.hasOwnProperty.call(sequencia, status)) {
        return sequencia[status];
    }

    return "aceito";
}

function nomeDoStatus(status) {
    const nomes = {
        novo: "Novo pedido",
        aceito: "Pedido aceito",
        preparando: "Em preparo",
        pronto: "Pedido pronto",
        saiu_entrega: "Saiu para entrega",
        entregue: "Entregue"
    };

    return nomes[status] || status;
}

function textoDoBotao(status) {
    const textos = {
        aceito: "Aceitar pedido",
        preparando: "Iniciar preparo",
        pronto: "Marcar como pronto",
        saiu_entrega: "Saiu para entrega",
        entregue: "Marcar como entregue"
    };

    return textos[status] || "Atualizar pedido";
}

function formatarDinheiro(valor) {
    const numero = Number(valor) || 0;

    return numero.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}
setInterval(() => { document.querySelectorAll(".previsao-pedido").forEach(() => {}); }, 30000);
