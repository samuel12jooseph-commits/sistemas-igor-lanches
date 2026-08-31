const statusLoja = document.querySelector('#status-loja');
const textoHorario = document.querySelector('#texto-horario');
const statusPonto = document.querySelector('.status-ponto');
const anoAtual = document.querySelector('#ano-atual');

function atualizarStatusLoja() {
    const agora = new Date();
    const hora = agora.getHours();
    const dia = agora.getDay();

    // Horário inicial de demonstração. Depois será controlado pelo painel administrativo.
    const abre = 18;
    const fecha = 23;
    const funcionaHoje = dia !== 1;
    const aberta = funcionaHoje && hora >= abre && hora < fecha;

    if (aberta) {
        statusLoja.textContent = 'Loja aberta agora';
        textoHorario.textContent = `Pedidos até ${fecha}:00`;
        statusPonto.classList.remove('fechado');
    } else {
        statusLoja.textContent = 'Loja fechada agora';
        textoHorario.textContent = funcionaHoje ? `Abre às ${abre}:00` : 'Fechado hoje';
        statusPonto.classList.add('fechado');
    }
}

anoAtual.textContent = new Date().getFullYear();
atualizarStatusLoja();
setInterval(atualizarStatusLoja, 60000);
