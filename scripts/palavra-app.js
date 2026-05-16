// Estado global do jogo - controlando o inevitável avanço do tempo e das tentativas
let linhaAtual = 0;
let quadradoAtual = 0;
// Escolhe uma palavra secreta aleatória da nossa lista do palavras.js
const palavraSecreta = palavrasSecretas[Math.floor(Math.random() * palavrasSecretas.length)];

// Aguarda o HTML carregar completamente antes de começar a escutar os comandos
document.addEventListener("DOMContentLoaded", () => {
    inicializarTecladoFisico();
    inicializarTecladoVirtual();
});

// 1. Escuta o teclado do computador
function inicializarTecladoFisico() {
    document.addEventListener("keydown", (e) => {
        const tecla = e.key.toUpperCase();
        
        if (tecla === "ENTER") {
            processarChute();
        } else if (tecla === "BACKSPACE" || tecla === "DELETE") {
            deletarLetra();
        } else if (tecla.length === 1 && tecla >= "A" && tecla <= "Z") {
            inserirLetra(tecla);
        }
    });
}

// 2. Escuta os cliques no teclado da tela (celular)
function inicializarTecladoVirtual() {
    const botoes = document.querySelectorAll(".key");
    botoes.forEach(botao => {
        botao.addEventListener("click", () => {
            const tecla = botao.textContent;
            if (tecla === "ENTER") {
                processarChute();
            } else if (tecla === "DEL") {
                deletarLetra();
            } else {
                inserirLetra(tecla);
            }
        });
    });
}

// 3. Coloca a letra na grade cinza
function inserirLetra(letra) {
    if (quadradoAtual < 5 && linhaAtual < 6) {
        const linhas = document.querySelectorAll(".row");
        const quadrados = linhas[linhaAtual].querySelectorAll(".tile");
        
        quadrados[quadradoAtual].textContent = letra;
        quadradoAtual++;
    }
}

// 4. Apaga a última letra digitada
function deletarLetra() {
    if (quadradoAtual > 0) {
        quadradoAtual--;
        const linhas = document.querySelectorAll(".row");
        const quadrados = linhas[linhaAtual].querySelectorAll(".tile");
        
        quadrados[quadradoAtual].textContent = "";
    }
}

// 5. A Lógica Principal: Avaliar a palavra quando o Enter é pressionado
function processarChute() {
    const linhas = document.querySelectorAll(".row");
    if (linhaAtual >= 6) return; // O jogo já acabou de forma deprimente

    const quadrados = linhas[linhaAtual].querySelectorAll(".tile");
    
    // Monta a palavra que o usuário digitou
    let palavraChutada = "";
    quadrados.forEach(q => palavraChutada += q.textContent);

    // Validação 1: Tem 5 letras?
    if (palavraChutada.length !== 5) {
        mostrarMensagem("A palavra precisa ter 5 letras. Não tente burlar as regras físicas.");
        return;
    }

    // Validação 2: A palavra existe no nosso dicionário?
    if (!todasAsPalavrasValidas.includes(palavraChutada)) {
        mostrarMensagem("Essa palavra não existe no meu banco de dados. Tente algo real.");
        return;
    }

    // Se passou pelas validações, vamos pintar os quadradinhos
    revelarCores(quadrados, palavraChutada);

    // Checa a vitória
    if (palavraChutada === palavraSecreta) {
        mostrarMensagem("Parabéns, você adivinhou. Uma vitória insignificante na escala cósmica, mas parabéns.");
        linhaAtual = 6; // Bloqueia o jogo
        return;
    }

    // Avança para a próxima tentativa
    linhaAtual++;
    quadradoAtual = 0;

    // Checa a derrota
    if (linhaAtual === 6) {
        mostrarMensagem(`Suas tentativas evaporaram. A palavra era: ${palavraSecreta}. Que lástima.`);
    }
}

// 6. O Algoritmo Inteligente de Cores (Lida com letras duplicadas)
function revelarCores(quadrados, palavraChutada) {
    // Criamos uma cópia das letras da palavra secreta para rastrear o que já foi usado
    let letrasRestantes = palavraSecreta.split("");

    // Primeiro Passo: Encontrar e pintar o que está CORRETO (Verde)
    for (let i = 0; i < 5; i++) {
        if (palavraChutada[i] === palavraSecreta[i]) {
            quadrados[i].classList.add("correct");
            letrasRestantes[i] = null; // Remove para não contar duas vezes
        }
    }

    // Segundo Passo: Encontrar o que está DESLOCADO (Amarelo) ou AUSENTE (Cinza)
    for (let i = 0; i < 5; i++) {
        // Ignora os que já resolvemos no primeiro passo
        if (quadrados[i].classList.contains("correct")) continue;

        const indexNaSecreta = letrasRestantes.indexOf(palavraChutada[i]);

        if (indexNaSecreta !== -1) {
            quadrados[i].classList.add("present"); // Amarelo
            letrasRestantes[indexNaSecreta] = null; // Marca como usado
        } else {
            quadrados[i].classList.add("absent"); // Cinza
        }
    }
}

function mostrarMensagem(texto) {
    const container = document.getElementById("message-container");
    container.textContent = texto;
    container.classList.add("show");
    
    // Esconde o aviso após 3 segundos de exposição
    setTimeout(() => {
        container.classList.remove("show");
    }, 3000);
}
