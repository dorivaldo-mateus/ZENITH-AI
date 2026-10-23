import { perguntarIa } from "./ai.js";

let dotsInterval;
let historico = [];
let conversaAtualId = null;

function mode(){
  document.querySelector("body").classList.toggle("mode")
}

function getConversas() {
  return JSON.parse(localStorage.getItem("conversas")) || [];
}

function salvarConversas(conversas) {
  localStorage.setItem("conversas", JSON.stringify(conversas));
}

function sanitizar(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

document.addEventListener("DOMContentLoaded", function() {
  const msgToSend = localStorage.getItem("newChat")
  console.log(msgToSend)
  if(msgToSend){
    const inputChat = document.getElementById("mensagem")
      inputChat.value = `Explique melhor: ${msgToSend}`
    }
    localStorage.removeItem("newChat")
  
})

document.querySelector(".ham").addEventListener("click", () => {
  document.querySelector(".menu").classList.toggle("hamMenu");
  document.querySelector(".ham").classList.toggle("newPos")
  document.querySelector("body").classList.toggle("fundo")
});

function renderizarLista() {
  const conversas = getConversas();
  const lista = document.querySelector(".chatMemory");
  lista.innerHTML = "";
  conversas.forEach((c) => {
    const item = document.createElement("div");
    item.classList.add("itemConversa", "conversa");
    item.dataset.id = c.id;
    const titulo = document.createElement("code");
    titulo.textContent = `${c.titulo}...`; 
    const btnDeletar = document.createElement("span");
    btnDeletar.textContent = "X";
    btnDeletar.title = "Deletar conversa";
    btnDeletar.classList.add("btnDeletar");
    
    btnDeletar.addEventListener("click", (e) => {
      e.stopPropagation();
      deletarConversa(c.id);
    });

    if (c.id === conversaAtualId) {
      item.classList.add("ativa");
    }

    item.appendChild(titulo);
    item.appendChild(btnDeletar);
    item.addEventListener("click", () =>{ 
      document.getElementById("chat").innerHTML=""
      abrirConversa(c.id)
      document.querySelector(".menu").classList.remove("hamMenu")
      document.querySelector(".ham").classList.remove("newPos")
      document.querySelector("body").classList.remove("fundo")
    });
    lista.appendChild(item);
  });
}

function deletarConversa(id) {
  if (!confirm("Deletar esta conversa?")) return;

  let conversas = getConversas();
  conversas = conversas.filter((c) => c.id !== id);
  salvarConversas(conversas);

  if (conversaAtualId === id) {
    novaConversa();
  }

  renderizarLista();
}

function abrirConversa(id) {
  const conversas = getConversas();
  const conversa = conversas.find((c) => c.id === id);
  if (!conversa) return;

  conversaAtualId = id;
  historico = [];

  document.querySelector("h4").style.display = "none";
  const chatBox = document.getElementById("chat")
  conversa.mensagens.forEach((m) => {
    chatBox.innerHTML += `<p class="chatUser">${m.userMsg}</p>`;
    chatBox.innerHTML += `<p class="chatSystem">${m.zenithMsg}</p>`

    historico.push({ role: "user", content: m.userMsg });
    historico.push({ role: "assistant", content: m.zenithMsg });
  });

  chatBox.scrollTop = chatBox.scrollHeight;
  renderizarLista();
}


function novaConversa() {
  conversaAtualId = null;
  historico = [];
  document.getElementById("chat").innerHTML = "";
  renderizarLista();
}

document.getElementById("novaConversa").addEventListener("click", novaConversa);


function startLoading() {
  const loading = document.getElementById("loading");
  loading.classList.remove("hidden");
  let count = 0;
  dotsInterval = setInterval(() => {
    count = (count + 1) % 4;
    document.getElementById("dots").textContent = ".".repeat(count);
  }, 400);
}

function stopLoading() {
  clearInterval(dotsInterval);
  document.getElementById("loading").classList.add("hidden");
}

async function chat() {
  document.querySelector(".show").style.display = "none";

  const input = document.getElementById("mensagem");
  const chatBox = document.getElementById("chat");
  const mensagem = input.value.trim();
  if (!mensagem) return;

  historico.push({ role: "user", content: mensagem });
  input.value = "";
  input.focus(); 
  
  chatBox.innerHTML += `<p class="chatUser">${sanitizar(mensagem)}</p>`;
  chatBox.scrollTop = chatBox.scrollHeight;
  startLoading();

  try {
    const resposta = await perguntarIa(historico);
    historico.push({ role: "assistant", content: resposta });
    
    chatBox.innerHTML += `<p class="chatSystem">${sanitizar(resposta)}</p> <div class="acoes-resultado">
      <button class="btn-acao btn-copy-main" id="btnCopiar">
        <i class="fa-regular fa-copy"></i> Copiar
      </button>
    </div>`;
    
document.getElementById("btnCopiar").addEventListener("click", function(){
  navigator.clipboard.writeText(resposta)
});
    const conversas = getConversas();

    if (conversaAtualId === null) {
      const novaId = Date.now();
      conversaAtualId = novaId;
      conversas.unshift({
        id: novaId,
        
        titulo: mensagem.slice(0, 10),
        mensagens: [{ userMsg: mensagem, zenithMsg: resposta }],
      });
    } else {
      const conversa = conversas.find((c) => c.id === conversaAtualId);
      if (conversa) {
        conversa.mensagens.push({ userMsg: mensagem, zenithMsg: resposta });
      }
    }

    salvarConversas(conversas);
    renderizarLista();
  } catch (err) {
    console.error("Erro na IA:", err);
    chatBox.innerHTML += `<p class="chatSystem">Erro ao obter resposta. Tente novamente.</p>`;
    historico.pop(); // desfaz o push do usuário se falhou
  }

  stopLoading();
  chatBox.scrollTop = chatBox.scrollHeight;
}

document.querySelector(".mode").addEventListener("click", mode)

document.getElementById("enviar").addEventListener("click", chat);

document.getElementById("mensagem").addEventListener("keydown", (e) => {
  
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    chat();
  }
});


document.addEventListener("DOMContentLoaded", () => {
  renderizarLista();
});

