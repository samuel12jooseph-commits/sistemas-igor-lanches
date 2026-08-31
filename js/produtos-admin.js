import { db } from "../firebase/firebase.js";
import { produtosIniciais } from "./produtos-iniciais.js";
import {
  collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot,
  getDocs, writeBatch, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const refProdutos = collection(db, "produtos");
const form = document.querySelector("#form-produto");
const grade = document.querySelector("#grade-produtos-admin");
const mensagem = document.querySelector("#mensagem-produtos");
const busca = document.querySelector("#buscar-produto-admin");
const importar = document.querySelector("#importar-cardapio");
const cancelar = document.querySelector("#cancelar-edicao");
const titulo = document.querySelector("#titulo-formulario");

const campos = {
  id: document.querySelector("#produto-id"), nome: document.querySelector("#produto-nome"),
  preco: document.querySelector("#produto-preco"), categoria: document.querySelector("#produto-categoria"),
  ordem: document.querySelector("#produto-ordem"), descricao: document.querySelector("#produto-descricao"),
  imagem: document.querySelector("#produto-imagem"), disponivel: document.querySelector("#produto-disponivel"),
  restrito: document.querySelector("#produto-restrito")
};
let produtos = [];

onSnapshot(refProdutos, snapshot => {
  produtos = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
    .sort((a,b)=>(Number(a.ordem)||0)-(Number(b.ordem)||0)||String(a.nome||"").localeCompare(String(b.nome||""),"pt-BR"));
  renderizar();
}, erro => { console.error(erro); mensagem.textContent = "Não foi possível carregar os produtos."; });

form.addEventListener("submit", async evento => {
  evento.preventDefault();
  const dados = lerFormulario();
  try {
    if (campos.id.value) {
      await updateDoc(doc(db,"produtos",campos.id.value), { ...dados, atualizadoEm: serverTimestamp() });
    } else {
      await addDoc(refProdutos, { ...dados, criadoEm: serverTimestamp(), atualizadoEm: serverTimestamp() });
    }
    limparFormulario();
  } catch (erro) { console.error(erro); alert("Não foi possível salvar o produto."); }
});

cancelar.addEventListener("click", limparFormulario);
busca.addEventListener("input", renderizar);

importar.addEventListener("click", async () => {
  const existentes = await getDocs(refProdutos);
  if (!existentes.empty && !confirm("Já existem produtos cadastrados. Deseja adicionar também o cardápio inicial?")) return;
  importar.disabled = true; importar.textContent = "Importando...";
  try {
    for (let i=0;i<produtosIniciais.length;i+=400) {
      const batch = writeBatch(db);
      produtosIniciais.slice(i,i+400).forEach((produto,indice) => {
        const novaRef = doc(refProdutos);
        batch.set(novaRef,{...produto,ordem:i+indice+1,criadoEm:serverTimestamp(),atualizadoEm:serverTimestamp()});
      });
      await batch.commit();
    }
    alert("Cardápio inicial importado.");
  } catch (erro) { console.error(erro); alert("Não foi possível importar o cardápio."); }
  finally { importar.disabled=false; importar.textContent="Importar cardápio atual"; }
});

grade.addEventListener("click", async evento => {
  const botao = evento.target.closest("button[data-acao]"); if(!botao) return;
  const produto = produtos.find(p=>p.id===botao.dataset.id); if(!produto) return;
  if(botao.dataset.acao==="editar") preencherFormulario(produto);
  if(botao.dataset.acao==="status") await updateDoc(doc(db,"produtos",produto.id),{disponivel:!produto.disponivel,atualizadoEm:serverTimestamp()});
  if(botao.dataset.acao==="excluir" && confirm(`Excluir ${produto.nome}?`)) await deleteDoc(doc(db,"produtos",produto.id));
});

function lerFormulario(){return{
  nome:campos.nome.value.trim(), preco:Number(campos.preco.value)||0,
  categoria:campos.categoria.value, ordem:Number(campos.ordem.value)||0,
  descricao:campos.descricao.value.trim(), imagem:campos.imagem.value.trim(),
  disponivel:campos.disponivel.checked, pagamentoRestrito:campos.restrito.checked
};}
function preencherFormulario(p){campos.id.value=p.id;campos.nome.value=p.nome||"";campos.preco.value=Number(p.preco)||0;campos.categoria.value=p.categoria||"outros";campos.ordem.value=Number(p.ordem)||0;campos.descricao.value=p.descricao||"";campos.imagem.value=p.imagem||"";campos.disponivel.checked=p.disponivel!==false;campos.restrito.checked=p.pagamentoRestrito===true;titulo.textContent="Editar produto";cancelar.hidden=false;window.scrollTo({top:0,behavior:"smooth"});}
function limparFormulario(){form.reset();campos.id.value="";campos.disponivel.checked=true;campos.ordem.value=0;titulo.textContent="Novo produto";cancelar.hidden=true;}
function renderizar(){const termo=busca.value.trim().toLowerCase();const lista=produtos.filter(p=>`${p.nome} ${p.descricao} ${p.categoria}`.toLowerCase().includes(termo));mensagem.hidden=lista.length>0;mensagem.textContent=produtos.length?"Nenhum produto encontrado.":"Nenhum produto cadastrado. Clique em Importar cardápio atual.";grade.innerHTML=lista.map(p=>`<article class="produto-admin-card ${p.disponivel===false?"indisponivel":""}"><div class="produto-admin-topo"><div><span class="etiqueta">${nomeCategoria(p.categoria)}</span><h3>${esc(p.nome)}</h3></div><span class="etiqueta ${p.disponivel===false?"esgotado":"disponivel"}">${p.disponivel===false?"Indisponível":"Disponível"}</span></div><p>${esc(p.descricao||"Sem descrição")}</p><div class="produto-preco">${moeda(p.preco)}</div><div class="acoes-produto"><button class="acao-produto" data-acao="editar" data-id="${p.id}">Editar</button><button class="acao-produto status" data-acao="status" data-id="${p.id}">${p.disponivel===false?"Ativar":"Desativar"}</button><button class="acao-produto perigo" data-acao="excluir" data-id="${p.id}">Excluir</button></div></article>`).join("");}
function moeda(v){return Number(v||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});}
function esc(v){const d=document.createElement("div");d.textContent=String(v||"");return d.innerHTML;}
function nomeCategoria(v){return ({hamburgueres:"Hambúrgueres",frango:"Frango","sem-carne":"Sem carne",bebidas:"Bebidas",combos:"Combos",batatas:"Batatas",outros:"Outros"})[v]||v;}
