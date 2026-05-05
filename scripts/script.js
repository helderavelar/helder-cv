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
    const container = document.getElementById("tab-container-alvo");
    
    // Mostra um sinal de carregamento (opcional, se você quiser fingir que o computador está a pensar)
    container.innerHTML = "Carregando... não que a espera valha a pena.";

    try {
        // Busca o ficheiro correspondente (ex: cv-content.html)
        const response = await fetch(`${tabName}-content.html`);
        
        if (!response.ok) throw new Error("Ficheiro não encontrado. Mais uma falha.");
        
        const html = await response.text();
        
        // Insere o conteúdo no contentor
        container.innerHTML = html;

        // Atualiza a classe ativa nos botões
        const tabLinks = document.getElementsByClassName("tab-link");
        for (let i = 0; i < tabLinks.length; i++) {
            tabLinks[i].classList.remove("active");
        }
        evt.currentTarget.classList.add("active");

    } catch (error) {
        container.innerHTML = "Erro ao carregar o conteúdo. O universo está contra nós.";
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