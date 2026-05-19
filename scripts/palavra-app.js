// ============================================================================
// CONFIGURAÇÃO INICIAL E SEED DIÁRIA (O MESMO JOGO PARA TODOS)
// ============================================================================

let linhaAtual = 0;
let quadradoAtual = 0;

// Escolhe uma palavra secreta aleatória da nossa lista do palavras.js
// const palavraSecreta = palavrasSecretas[Math.floor(Math.random() * palavrasSecretas.length)];

// 1. Definimos uma data de ancoragem (O Dia Zero do TREMO). 
// Lembre-se: no JavaScript, os meses começam em 0 (Janeiro = 0, Maio = 4, etc.)
const DATA_ANCHOR = new Date(2026, 0, 1); // 1 de Janeiro de 2026
DATA_ANCHOR.setHours(0, 0, 0, 0); // Zera as horas para evitar distorções

// 2. Pegamos a data atual do dispositivo do jogador
const hoje = new Date();
hoje.setHours(0, 0, 0, 0); // Zera as horas de hoje também
const dataHojeStr = hoje.toDateString(); // Identificador único do dia de hoje (ex: "Sat May 16 2026")

// 3. Calculamos a diferença em milissegundos e convertemos para dias puros
const diferencaTempo = hoje.getTime() - DATA_ANCHOR.getTime();
const diasPassados = Math.floor(diferencaTempo / (1000 * 60 * 60 * 24));

// 4. Usamos o operador de módulo (%) para encontrar o índice da palavra.
// Isso garante que, se o número de dias for maior que a sua lista de palavras, 
// o jogo volta para o início da lista pacificamente em vez de quebrar.
const indicePalavraDoDia = diasPassados % palavrasSecretas.length;

// 5. Definimos a palavra secreta imutável das próximas 24 horas
const palavraSecreta = palavrasSecretas[indicePalavraDoDia];

// ============================================================================
// CARREGAMENTO DAS ESTATÍSTICAS E ESTADO LOCAL
// ============================================================================
let estatisticas = JSON.parse(localStorage.getItem("tremo_estatisticas")) || {
    vitorias: 0,
    derrotas: 0,
    distribuicao: [0, 0, 0, 0, 0, 0] // Índice 0 = 1 tentativa, Índice 5 = 6 tentativas
};

let estadoHoje = JSON.parse(localStorage.getItem("tremo_estado_hoje")) || {
    data: "",
    finalizado: false,
    ganhou: false,
    chutes: []
};

// Se mudou o dia, limpamos o estado do jogo diário, mas mantemos as estatísticas eternas
if (estadoHoje.data !== dataHojeStr) {
    estadoHoje = {
        data: dataHojeStr,
        finalizado: false,
        ganhou: false,
        chutes: []
    };
    localStorage.setItem("tremo_estado_hoje", JSON.stringify(estadoHoje));
}

// ============================================================================
// INICIALIZAÇÃO DO JOGO
// ============================================================================

function limparTexto(texto) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
}

// Aguarda o HTML carregar completamente antes de começar a escutar os comandos
document.addEventListener("DOMContentLoaded", () => {
    reconstituirJogoSalvo();
    inicializarTecladoFisico();
    inicializarTecladoVirtual();

    // DETALHE 3: Botão para abrir estatísticas a qualquer momento
    document.getElementById("btn-stats").addEventListener("click", exibirPainelEstatisticas);
    
    // DETALHE 4: Botão de compartilhar resultado
    document.getElementById("btn-compartilhar").addEventListener("click", compartilharResultado);
});

// 1. Escuta o teclado do computador
function inicializarTecladoFisico() {
        if (estadoHoje.finalizado) {
            return; 
        }    
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
    if (estadoHoje.finalizado) {
            return; 
        }
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

// ============================================================================
// LOGICA DE RECONSTITUIÇÃO (SE JÁ JOGOU HOJE)
// ============================================================================
function reconstituirJogoSalvo() {
    if (estadoHoje.chutes.length === 0) return;

    const linhas = document.querySelectorAll(".row");
    
    estadoHoje.chutes.forEach((palavraOficial, index) => {
        const quadrados = linhas[index].querySelectorAll(".tile");
        
        // Escreve a palavra com a ortografia correta nos quadrados
        for (let i = 0; i < 5; i++) {
            quadrados[i].textContent = palavraOficial[i];
        }
        
        // Pinta as cores imediatamente (sem animação delay para não irritar)
        revelarCores(quadrados, palavraOficial, false);
        linhaAtual++;
    });

    if (estadoHoje.finalizado) {
        exibirPainelEstatisticas();
    }
}

// ============================================================================
// PROCESSAMENTO DO PALPITE: Avaliar a palavra quando o Enter é pressionado
// ============================================================================
function processarChute() {
    const linhas = document.querySelectorAll(".row");
    if (linhaAtual >= 6 || estadoHoje.finalizado) return;

    const quadrados = linhas[linhaAtual].querySelectorAll(".tile");
    let palavraChutada = "";
    quadrados.forEach(q => palavraChutada += q.textContent);

    if (palavraChutada.length !== 5) {
        mostrarMensagem("A palavra precisa ter 5 letras. Não tente burlar as regras físicas.");
        return;
    }

    const palavraOficial = todasAsPalavrasValidas.find(p => limparTexto(p) === palavraChutada);

    if (!palavraOficial) {
        mostrarMensagem("Essa palavra não existe no meu banco de dados. Tente algo real.");
        return;
    }

    // Aplica a ortografia correta na interface
    for (let i = 0; i < 5; i++) {
        quadrados[i].textContent = palavraOficial[i];
    }

    // Salva o chute no estado do dia
    estadoHoje.chutes.push(palavraOficial);
    localStorage.setItem("tremo_estado_hoje", JSON.stringify(estadoHoje));

    // Roda as cores com animação
    revelarCores(quadrados, palavraOficial, true);

    // Checa Vitória
    if (limparTexto(palavraOficial) === limparTexto(palavraSecreta)) {
        estadoHoje.finalizado = true;
        estadoHoje.ganhou = true;
        
        // Atualiza estatísticas eternas
        estatisticas.vitorias++;
        estatisticas.distribuicao[linhaAtual]++;
        localStorage.setItem("tremo_estatisticas", JSON.stringify(estatisticas));
        localStorage.setItem("tremo_estado_hoje", JSON.stringify(estadoHoje));
        
        setTimeout(() => {
            mostrarMensagemFinal("Sensacional! Você venceu. Uma vitória insignificante na escala cósmica, mas parabéns.");
        }, 1500);
        setTimeout(() => {
            exibirPainelEstatisticas();
        }, 2000);
        return;
    }

    linhaAtual++;
    quadradoAtual = 0;

    // Checa Derrota
    if (linhaAtual === 6) {
        estadoHoje.finalizado = true;
        estadoHoje.ganhou = false;
        
        estatisticas.derrotas++;
        localStorage.setItem("tremo_estatisticas", JSON.stringify(estatisticas));
        localStorage.setItem("tremo_estado_hoje", JSON.stringify(estadoHoje));
        
        setTimeout(() => {
            mostrarMensagemFinal(`Suas tentativas evaporaram. A palavra era: ${palavraSecreta}. Que lástima.`);
        }, 1500);
        setTimeout(() => {
            exibirPainelEstatisticas();
        }, 2000);
    }
}

// ============================================================================
// REVELAÇÃO DE CORES E EXIBIÇÃO DE RESULTADOS
// ============================================================================
function revelarCores(quadrados, palavraOficial, animar = true) {
    let chuteLimpo = limparTexto(palavraOficial);
    let secretaLimpa = limparTexto(palavraSecreta);
    let letrasRestantes = secretaLimpa.split("");
    let coresDefinidas = Array(5).fill("absent");

    for (let i = 0; i < 5; i++) {
        if (chuteLimpo[i] === secretaLimpa[i]) {
            coresDefinidas[i] = "correct";
            letrasRestantes[i] = null;
        }
    }

    for (let i = 0; i < 5; i++) {
        if (coresDefinidas[i] === "correct") continue;
        const indexNaSecreta = letrasRestantes.indexOf(chuteLimpo[i]);
        if (indexNaSecreta !== -1) {
            coresDefinidas[i] = "present";
            letrasRestantes[indexNaSecreta] = null;
        }
    }

    for (let i = 0; i < 5; i++) {
        if (animar) {
            setTimeout(() => {
                quadrados[i].classList.add("flip");
                setTimeout(() => {
                    quadrados[i].classList.add(coresDefinidas[i]);
                    atualizarTeclaVirtual(chuteLimpo[i], coresDefinidas[i]);
                }, 250);
            }, i * 300);
        } else {
            // Se não for animar (carregamento de página), bota a classe direto
            quadrados[i].classList.add(coresDefinidas[i]);
            atualizarTeclaVirtual(chuteLimpo[i], coresDefinidas[i]);
        }
    }
}

function atualizarTeclaVirtual(letra, cor) {
    const botoes = document.querySelectorAll(".key");
    botoes.forEach(botao => {
        if (botao.textContent === letra) {
            // Se o botão já for verde (correct), não deixa virar amarelo (present)
            if (botao.classList.contains("correct")) return;
            if (botao.classList.contains("present") && cor === "absent") return;
            
            botao.classList.remove("present", "absent");
            botao.classList.add(cor);
        }
    });
}

function mostrarMensagem(texto) {
    const container = document.getElementById("message-container");
    container.textContent = texto;
    container.classList.add("show");
    setTimeout(() => {
        container.classList.remove("show");
    }, 4000); // 4 segundos para os humanos lerem com calma
}

function exibirPainelEstatisticasOld() {
    // Texto cruel e realista com o resumo estatístico do indivíduo
    const resumo = `ESTATÍSTICAS DO TREMO:\n\n` +
                   `Vitórias: ${estatisticas.vitorias}\n` +
                   `Derrotas: ${estatisticas.derrotas}\n\n` +
                   `DISTRIBUIÇÃO DE PALPITES:\n` +
                   `1ª tentativa: ${estatisticas.distribuicao[0]}\n` +
                   `2ª tentativa: ${estatisticas.distribuicao[1]}\n` +
                   `3ª tentativa: ${estatisticas.distribuicao[2]}\n` +
                   `4ª tentativa: ${estatisticas.distribuicao[3]}\n` +
                   `5ª tentativa: ${estatisticas.distribuicao[4]}\n` +
                   `6ª tentativa: ${estatisticas.distribuicao[5]}\n\n` +
                   `Volte amanhã para mais um enigma enfadonho.`;
                   
    alert(resumo); // Um painel simples. Depois você pode criar uma janelinha modal em HTML/CSS para ficar bonito se desejar.
}

function mostrarMensagemFinal(texto) {
    const container = document.getElementById("message-container");
    container.textContent = texto;
    container.classList.add("show");
    }

function exibirPainelEstatisticas() {
    const modal = document.getElementById("stats-modal");
    const closeBtn = document.getElementById("close-modal");
    const shareBtn = document.getElementById("btn-compartilhar");

// PROGRAMAÇÃO DEFENSIVA: Ativa ou desativa o botão de compartilhar logo de cara!
    // Ele só aparece se estiver no Modo Diário E o jogo de hoje já tiver terminado.
    if (estadoHoje.finalizado) {
        shareBtn.style.display = "block";
    } else {
        shareBtn.style.display = "none";
    }

    // Abre o modal logo em seguida, garantindo que o usuário veja a janela
    modal.classList.add("show");
    
    // 1. Cálculos matemáticos básicos sobre o histórico
    const totalJogos = estatisticas.vitorias + estatisticas.derrotas;
    const porcetagemVitorias = totalJogos > 0 ? Math.round((estatisticas.vitorias / totalJogos) * 100) : 0;

    // 2. Injeta os dados nos textos do resumo
    document.getElementById("stat-jogados").textContent = totalJogos;
    document.getElementById("stat-vitorias").textContent = `${porcetagemVitorias}%`;

    // 3. Descobre qual é o maior valor dentro da distribuição para usá-lo como base de escala (100% da largura)
    const maiorValorEscala = Math.max(...estatisticas.distribuicao, 1);

    // 4. Renderiza e estica as barras horizontais
    for (let i = 0; i < 6; i++) {
        const barra = document.getElementById(`bar-${i}`);
        if (!barra) continue; // Evita quebra caso falte alguma barra no HTML
        const quantidadeChutesNessaLinha = estatisticas.distribuicao[i];
        
        // Atualiza o número de texto dentro da barra
        barra.textContent = quantidadeChutesNessaLinha;
        
        // Calcula a porcentagem visual da largura da barra baseado no maior valor existente
        const larguraPorcentagem = (quantidadeChutesNessaLinha / maiorValorEscala) * 100;
        barra.style.width = `${larguraPorcentagem}%`;

        // Se o jogador venceu o jogo de hoje EXATAMENTE nesta linha, destaca a barra em verde
        // Subtraímos 1 da linhaAtual porque ela avança um número logo após computar o chute
        if (estadoHoje.ganhou && (linhaAtual - 1) === i) {
            barra.classList.add("highlight");
        } else {
            barra.classList.remove("highlight");
        }
    }

    // 5. Exibe o modal na tela adicionando a classe do CSS
    modal.classList.add("show");

    // 6. Configura o botão de fechar para esconder a janela se clicado
    closeBtn.onclick = () => {
        modal.classList.remove("show");
    };

    // Fecha o modal se o jogador clicar no fundo escurecido do overlay
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.classList.remove("show");
        }
    };
}

// DETALHE 4: O gerador de blocos de emojis para o clipboard
function compartilharResultado() {
    if (!estadoHoje.finalizado) return;

    // Cabeçalho da mensagem
    let textoCompartilhar = `TREMO ${estadoHoje.ganhou ? estadoHoje.chutes.length : "X"}/6\n\n`;

    const secretaLimpa = limparTexto(palavraSecreta);

    // Varre todos os chutes feitos hoje para recriar o mapa gráfico
    estadoHoje.chutes.forEach(chute => {
        let chuteLimpo = limparTexto(chute);
        let letrasRestantes = secretaLimpa.split("");
        let linhaEmojis = Array(5).fill("⬛");

        // 1º Passo: Mapeia os Verdes
        for (let i = 0; i < 5; i++) {
            if (chuteLimpo[i] === secretaLimpa[i]) {
                linhaEmojis[i] = "🟩";
                letrasRestantes[i] = null;
            }
        }
        // 2º Passo: Mapeia os Amarelos
        for (let i = 0; i < 5; i++) {
            if (linhaEmojis[i] === "🟩") continue;
            const idx = letrasRestantes.indexOf(chuteLimpo[i]);
            if (idx !== -1) {
                linhaEmojis[i] = "🟨";
                letrasRestantes[idx] = null;
            }
        }
        textoCompartilhar += linhaEmojis.join("") + "\n";
    });

    textoCompartilhar += `\nJogue em: ${window.location.href}`;

    // ============================================================================
    // A MÁGICA DO POP-UP NATIVO (Web Share API)
    // ============================================================================
    if (navigator.share) {
        // Se o navegador (geralmente mobile) suportar o pop-up de apps:
        navigator.share({
            title: 'Meu resultado no TREMO',
            text: textoCompartilhar
        })
        .then(() => {
            mostrarMensagem("Compartilhado! 🚀");
        })
        .catch((error) => {
            // Se o usuário simplesmente fechar o pop-up sem escolher nenhum app, 
            // o navegador gera um 'AbortError', que nós ignoramos pacificamente.
            if (error.name !== "AbortError") {
                mostrarMensagem("Erro ao abrir compartilhamento.");
            }
        });
    } else {
        // FALLBACK: Se for um PC ou navegador sem suporte, apenas copia o texto
        navigator.clipboard.writeText(textoCompartilhar).then(() => {
            mostrarMensagem("Copiado para a área de transferência! 📋");
        }).catch(() => {
            mostrarMensagem("Erro ao copiar resultado.");
        });
    }
}

