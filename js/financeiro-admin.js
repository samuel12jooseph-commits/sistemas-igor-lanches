import { db } from "../firebase/firebase.js";
import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const periodo = document.querySelector('#periodo-financeiro');
const lista = document.querySelector('#lista-financeiro');
let pedidos = [];
onSnapshot(collection(db,'pedidos'), snap => {
  pedidos = snap.docs.map(d=>({id:d.id,...d.data()}));
  atualizar();
}, erro => { console.error(erro); lista.innerHTML='<tr><td colspan="6" class="vazio">Não foi possível carregar o financeiro.</td></tr>'; });
periodo?.addEventListener('change', atualizar);

function atualizar(){
  const filtrados = pedidos.filter(p=>dentroPeriodo(obterData(p), periodo.value)).sort((a,b)=>obterData(b)-obterData(a));
  const total = filtrados.reduce((s,p)=>s+(Number(p.total)||0),0);
  const taxas = filtrados.reduce((s,p)=>s+(Number(p.taxaEntrega)||0),0);
  set('financeiro-total',moeda(total)); set('financeiro-pedidos',filtrados.length); set('financeiro-ticket',moeda(filtrados.length?total/filtrados.length:0)); set('financeiro-taxas',moeda(taxas));
  const pagamentos = {pix:0,dinheiro:0,credito:0,debito:0};
  filtrados.forEach(p=>{ const f=normalizarPagamento(p.pagamento); pagamentos[f]=(pagamentos[f]||0)+(Number(p.total)||0); });
  set('total-pix',moeda(pagamentos.pix)); set('total-dinheiro',moeda(pagamentos.dinheiro)); set('total-credito',moeda(pagamentos.credito)); set('total-debito',moeda(pagamentos.debito));
  if(!filtrados.length){lista.innerHTML='<tr><td colspan="6" class="vazio">Nenhum pedido neste período.</td></tr>';return;}
  lista.innerHTML=filtrados.map(p=>{const c=typeof p.cliente==='object'?p.cliente?.nome:p.cliente;return `<tr><td>#${p.numero||p.id.slice(0,6)}</td><td>${formatarData(obterData(p))}</td><td>${esc(c||'Não informado')}</td><td>${esc(p.pagamento||'Não informado')}</td><td>${esc(p.status||'Novo')}</td><td><strong>${moeda(p.total)}</strong></td></tr>`}).join('');
}
function dentroPeriodo(data,tipo){ if(!data?.getTime())return tipo==='todos'; const agora=new Date(); const inicioHoje=new Date(agora.getFullYear(),agora.getMonth(),agora.getDate()); if(tipo==='hoje')return data>=inicioHoje; if(tipo==='7dias'){const d=new Date(inicioHoje);d.setDate(d.getDate()-6);return data>=d;} if(tipo==='mes')return data.getMonth()===agora.getMonth()&&data.getFullYear()===agora.getFullYear(); return true; }
function obterData(p){if(p.criadoEm?.toDate)return p.criadoEm.toDate();if(p.data){const [d,m,a]=String(p.data).split('/').map(Number);const [h,min]=String(p.horario||'00:00').split(':').map(Number);return new Date(a||1970,(m||1)-1,d||1,h||0,min||0)}return new Date(0)}
function normalizarPagamento(v){const x=String(v||'').toLowerCase();if(x.includes('pix'))return'pix';if(x.includes('dinheiro'))return'dinheiro';if(x.includes('crédito')||x.includes('credito'))return'credito';if(x.includes('débito')||x.includes('debito'))return'debito';return'pix'}
function set(id,v){const el=document.getElementById(id);if(el)el.textContent=v} function moeda(v){return Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})} function formatarData(d){return d?.getTime()?d.toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'}):'—'} function esc(v){return String(v??'').replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]))}
