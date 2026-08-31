import { db } from "../firebase/firebase.js";
import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const corpo = document.querySelector("#lista-clientes");
const busca = document.querySelector("#buscar-cliente");
const totalClientes = document.querySelector("#total-clientes");
const recorrentes = document.querySelector("#clientes-recorrentes");
const totalPedidos = document.querySelector("#total-pedidos-clientes");
const totalGasto = document.querySelector("#total-gasto-clientes");
let clientes = [];

onSnapshot(collection(db, "pedidos"), snapshot => {
  const mapa = new Map();
  snapshot.forEach(docSnap => {
    const p = docSnap.data();
    const clienteObj = typeof p.cliente === "object" ? p.cliente : null;
    const nome = (clienteObj?.nome || p.cliente || "Cliente não informado").trim();
    const telefone = (clienteObj?.telefone || p.telefone || "").trim();
    const chave = telefone || nome.toLowerCase();
    const atual = mapa.get(chave) || { nome, telefone, pedidos: 0, total: 0, ultimo: null, tipo: "" };
    atual.pedidos += 1;
    atual.total += Number(p.total) || 0;
    const dataPedido = obterData(p);
    if (!atual.ultimo || dataPedido > atual.ultimo) {
      atual.ultimo = dataPedido;
      atual.tipo = p.tipoAtendimento || p.tipoEntrega || p.tipo || "Não informado";
    }
    mapa.set(chave, atual);
  });
  clientes = [...mapa.values()].sort((a,b) => b.total - a.total);
  atualizarResumo();
  renderizar();
}, erro => {
  console.error(erro);
  corpo.innerHTML = '<tr><td colspan="5" class="vazio">Não foi possível carregar os clientes.</td></tr>';
});

busca?.addEventListener("input", renderizar);

function renderizar() {
  const termo = (busca?.value || "").trim().toLowerCase();
  const filtrados = clientes.filter(c => `${c.nome} ${c.telefone}`.toLowerCase().includes(termo));
  if (!filtrados.length) {
    corpo.innerHTML = '<tr><td colspan="5" class="vazio">Nenhum cliente encontrado.</td></tr>';
    return;
  }
  corpo.innerHTML = filtrados.map(c => `<tr><td><div class="cliente-nome">${esc(c.nome)}</div><div class="cliente-detalhe">${esc(c.telefone || "Sem telefone")}</div></td><td>${c.pedidos}</td><td>${moeda(c.total)}</td><td>${formatarData(c.ultimo)}</td><td>${esc(c.tipo)}</td></tr>`).join("");
}

function atualizarResumo() {
  totalClientes.textContent = clientes.length;
  recorrentes.textContent = clientes.filter(c => c.pedidos > 1).length;
  totalPedidos.textContent = clientes.reduce((s,c)=>s+c.pedidos,0);
  totalGasto.textContent = moeda(clientes.reduce((s,c)=>s+c.total,0));
}
function obterData(p){
  if (p.criadoEm?.toDate) return p.criadoEm.toDate();
  if (p.data) { const [d,m,a] = String(p.data).split('/').map(Number); return new Date(a||1970,(m||1)-1,d||1); }
  return new Date(0);
}
function formatarData(d){ return d && d.getTime() ? d.toLocaleDateString('pt-BR') : '—'; }
function moeda(v){ return Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}); }
function esc(v){ return String(v??'').replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch])); }
