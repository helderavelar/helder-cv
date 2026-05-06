function toggleLanguage() {
    const enElements = document.querySelectorAll('.lang-en');
    const ptElements = document.querySelectorAll('.lang-pt');
    
    ptElements.forEach(el => {
        el.style.display = el.style.display === 'none' ? 'block' : 'none';
    });
    
    enElements.forEach(el => {
        el.style.display = el.style.display === 'none' ? 'block' : 'none';
    });
}

// Pega o botão
const mybutton = document.getElementById("btnTopo");

// Quando o usuário rolar 20px para baixo, o botão aparece
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    mybutton.style.display = "block";
  } else {
    mybutton.style.display = "none";
  }
}

// Quando clicar no botão, volta para o topo
mybutton.onclick = function() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth' // Faz a subida ser suave, em vez de um salto brusco
  });
}

async function openTab(evt, tabName) {
    // CAPTURA o botão aqui, enquanto ele ainda existe na memória
    const botaoClicado = evt.currentTarget; 
    const container = document.getElementById("tab-container-alvo");
    
    container.innerHTML = "Carregando... a espera vale a pena.";

    // Gerar um código único para cada requisição
    const cacheBuster = new Date().getTime();

    try {
        const filePath = `html/${tabName}-content.html`;
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
        console.error(error);
    }
}

// Carregar a aba inicial (CV) ao abrir a página
window.onload = () => {
    const firstTab = document.querySelector(".tab-link");
    if (firstTab) firstTab.click();
};

// No seu script.js, adicione isto para carregar a primeira aba por padrão
window.onload = () => {
    // Simula um clique no primeiro botão do menu assim que a página carrega
    const firstTab = document.querySelector(".tab-link");
    if (firstTab) {
        firstTab.click();
    }
};

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
