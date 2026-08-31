import { auth } from "../firebase/firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

onAuthStateChanged(auth, (usuario) => {
    if (!usuario) {
        window.location.replace("./login.html");
        return;
    }

    console.log("Administrador autenticado:", usuario.email);
    document.body.style.display = "block";
});

document.addEventListener("DOMContentLoaded", () => {
    const botaoSair = document.getElementById("botao-sair");

    if (!botaoSair) {
        console.error("Botão Sair não encontrado.");
        return;
    }

    botaoSair.addEventListener("click", async () => {
        botaoSair.disabled = true;
        botaoSair.textContent = "Saindo...";

        try {
            await signOut(auth);
            window.location.replace("./login.html");
        } catch (erro) {
            console.error("Erro ao sair:", erro);

            botaoSair.disabled = false;
            botaoSair.textContent = "Sair";

            alert("Não foi possível sair. Tente novamente.");
        }
    });
});