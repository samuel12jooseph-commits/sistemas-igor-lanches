import { auth } from "../firebase/firebase.js";

import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

const campoEmail = document.getElementById("login-email");
const campoSenha = document.getElementById("login-senha");
const botaoEntrar = document.getElementById("login-botao");
const mensagemErro = document.getElementById("login-erro");

async function realizarLogin() {
    const email = campoEmail.value.trim();
    const senha = campoSenha.value;

    mensagemErro.textContent = "";

    if (!email || !senha) {
        mensagemErro.textContent = "Preencha o e-mail e a senha.";
        return;
    }

    botaoEntrar.disabled = true;
    botaoEntrar.textContent = "Entrando...";

    try {
        await signInWithEmailAndPassword(auth, email, senha);

        console.log("LOGIN REALIZADO COM SUCESSO");

        window.location.replace("./painel.html");
    } catch (erro) {
        console.error("Erro do Firebase:", erro);

        if (
            erro.code === "auth/invalid-credential" ||
            erro.code === "auth/wrong-password" ||
            erro.code === "auth/user-not-found"
        ) {
            mensagemErro.textContent = "E-mail ou senha incorretos.";
        } else if (erro.code === "auth/too-many-requests") {
            mensagemErro.textContent =
                "Muitas tentativas. Aguarde alguns minutos.";
        } else if (erro.code === "auth/network-request-failed") {
            mensagemErro.textContent =
                "Falha de conexão. Verifique sua internet.";
        } else {
            mensagemErro.textContent =
                `Erro ao entrar: ${erro.code || "erro desconhecido"}`;
        }
    } finally {
        botaoEntrar.disabled = false;
        botaoEntrar.textContent = "Entrar";
    }
}

botaoEntrar.addEventListener("click", realizarLogin);

campoSenha.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        realizarLogin();
    }
});