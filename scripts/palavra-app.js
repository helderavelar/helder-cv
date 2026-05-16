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

    // Espera a animação dos quadradinhos terminar antes de julgar o destino do jogador
    setTimeout(() => {
        // Checa a vitória
        if (palavraChutada === palavraSecreta) {
            mostrarMensagemFinal("Parabéns, você adivinhou. Uma vitória insignificante na escala cósmica, mas parabéns.");
            linhaAtual = 6; // Bloqueia o jogo
            return;
        }

        // Avança para a próxima tentativa
        linhaAtual++;
        quadradoAtual = 0;

        // Checa a derrota
        if (linhaAtual === 6) {
            mostrarMensagemFinal(`Suas tentativas evaporaram. A palavra era: ${palavraSecreta}. Que lástima.`);
        }
    }, 1700); // 1700ms é o tempo exato para o último quadrado terminar de girar

}

// 6. O Algoritmo Inteligente de Cores (Lida com letras duplicadas)
function revelarCores(quadrados, palavraChutada) {
    let letrasRestantes = palavraSecreta.split("");
    
    // Criamos uma lista para guardar qual cor cada quadrado vai receber
    let coresDefinidas = Array(5).fill("absent");

    // Primeiro Passo: Mapear os VERDES (Posição exata)
    for (let i = 0; i < 5; i++) {
        if (palavraChutada[i] === palavraSecreta[i]) {
            coresDefinidas[i] = "correct";
            letrasRestantes[i] = null;
        }
    }

    // Segundo Passo: Mapear os AMARELOS (Posição errada)
    for (let i = 0; i < 5; i++) {
        if (coresDefinidas[i] === "correct") continue;

        const indexNaSecreta = letrasRestantes.indexOf(palavraChutada[i]);

        if (indexNaSecreta !== -1) {
            coresDefinidas[i] = "present";
            letrasRestantes[indexNaSecreta] = null;
        }
    }

    // Terceiro Passo: Aplicar a animação em cascata (O show visual)
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            // Dispara a rotação do quadradinho
            quadrados[i].classList.add("flip");
            
            // Truque de mágica: Exatamente aos 250ms (metade da animação),
            // o quadrado está de perfil. É aí que injetamos a cor de fundo!
            setTimeout(() => {
                quadrados[i].classList.add(coresDefinidas[i]);
                atualizarTeclaVirtual(palavraChutada[i], coresDefinidas[i]); // Atualiza a tecla do teclado virtual em sincronia!
            }, 250);

        }, i * 300); // Cada quadrado espera 300ms a mais que o anterior para começar
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

function mostrarMensagemFinal(texto) {
    const container = document.getElementById("message-container");
    container.textContent = texto;
    container.classList.add("show");
    }

function atualizarTeclaVirtual(letra, novaCor) {
    const botoes = document.querySelectorAll(".key");
    let botaoAlvo = null;

    // Procura qual botão corresponde à letra jogada
    botoes.forEach(b => {
        if (b.textContent === letra) {
            botaoAlvo = b;
        }
    });

    if (!botaoAlvo) return; // Se for uma tecla tipo ENTER ou DEL, ignora

    // Regra hierárquica para não "rebaixar" a cor da tecla
    if (botaoAlvo.classList.contains("correct")) {
        return; // Se já está verde, não muda mais
    }
    if (botaoAlvo.classList.contains("present") && novaCor === "absent") {
        return; // Se já está amarelo, não pode virar cinza
    }

    // Remove estados antigos menores e adiciona a nova cor
    botaoAlvo.classList.remove("present", "absent");
    botaoAlvo.classList.add(novaCor);
}