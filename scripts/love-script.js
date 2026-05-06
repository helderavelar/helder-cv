async function openTab(evt, tabName) {
    // CAPTURA o botão aqui, enquanto ele ainda existe na memória
    const botaoClicado = evt.currentTarget; 
    const container = document.getElementById("tab-container-alvo");
    
    container.innerHTML = "Carregando... não que a espera valha a pena.";

    // Gerar um código único para cada requisição
    const cacheBuster = new Date().getTime();

    try {
//        const filePath = `html/${tabName}-content.html`;
        console.log("Tentando carregar:", filePath);

        const response = await fetch(`${tabName}-content.html?v=${cacheBuster}`, {
            cache: "no-store" 
        });       
        if (!response.ok) throw new Error("Ficheiro não encontrado.");
        
        const html = await response.text();
        container.innerHTML = html;


        // Agora usamos o 'botaoClicado' que guardámos antes do await
        const tabLinks = document.getElementsByClassName("tab-link");
        for (let i = 0; i < tabLinks.length; i++) {
            tabLinks[i].classList.remove("active");
        }
        
        // Aqui o 'evt.currentTarget' seria null, mas 'botaoClicado' ainda vive!
        botaoClicado.classList.add("active");

    } catch (error) {
        container.innerHTML = "Erro ao carregar o conteúdo. O universo é hostil.";
        console.error("Marvin: Um erro? Que novidade...", error);    }
}

// No seu script.js, adicione isto para carregar a primeira aba por padrão
window.onload = () => {
    // Simula um clique no primeiro botão do menu assim que a página carrega
    const firstTab = document.querySelector(".tab-link");
    if (firstTab) {
        firstTab.click();
    }
};

// 1. CARREGAMENTO INICIAL
// Usamos uma função que tenta clicar na aba inicial até conseguir
function carregarAbaInicial() {
    const primeiraAba = document.querySelector(".tab-link");
    if (primeiraAba) {
        console.log("Marvin: A clicar na primeira aba para acabar com o vazio.");
        primeiraAba.click();
    } else {
        // Se não encontrou, tenta de novo em 100ms (pode ser lentidão do DOM)
        setTimeout(carregarAbaInicial, 100);
    }
}

let slideIndex = 0;

function moveSlide(n) {
    const slides = document.getElementsByClassName("carousel-item");
    if (slides.length === 0) return; // Segurança contra o vazio

    // Remove classe ativa do atual
    slides[slideIndex].classList.remove("active");

    // Calcula o próximo índice
    slideIndex += n;

    // Faz o loop (volta ao início ou vai ao fim)
    if (slideIndex >= slides.length) { slideIndex = 0; }
    if (slideIndex < 0) { slideIndex = slides.length - 1; }

    // Adiciona classe ativa ao novo slide
    slides[slideIndex].classList.add("active");
}

document.addEventListener("DOMContentLoaded", () => {
    // Procura o primeiro botão de aba disponível
    const primeiraAba = document.querySelector(".tab-link");
    if (primeiraAba) {
        primeiraAba.click(); // Força o clique para carregar o conteúdo inicial
    } else {
        console.error("Não encontrei nenhum botão de aba. Que deserto.");
    }
});

