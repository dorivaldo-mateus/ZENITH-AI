import {promptChat} from "./prompt.js"
import {perguntarIa} from "./ai.js"


function noBtn(){
  const input = document.getElementById('mensagem');
const botao = document.getElementById('enviar');

botao.disabled = true;

input.addEventListener('input', () => {
  botao.disabled = input.value.trim() === '';
});
}
noBtn()
let dotsInterval;

function startLoading() {
  const loading = document.getElementById("loading");
  const dots = document.getElementById("dots");

  loading.classList.remove("hidden");

  let count = 0;

  dotsInterval = setInterval(() => {
    count = (count + 1) % 4;
    dots.textContent = ".".repeat(count);
  }, 400);
}

function stopLoading() {
  const loading = document.getElementById("loading");
  loading.classList.add("hidden")
  clearInterval(dotsInterval);
  ;
}
document.getElementById('enviar').addEventListener('click', chat)

 async function chat(){
  const input = document.getElementById('mensagem')
  const mensagem = input.value.trim()

  if (!mensagem) return;

  input.value = ''

  document.querySelector('.show').classList.add('apresentacao')

  const chat = document.getElementById("chat");

  const userMsg = document.createElement('p')
  userMsg.className = 'chatUser'
  userMsg.textContent = mensagem
  chat.appendChild(userMsg)
  
  noBtn()
  startLoading()
  const saida = await promptChat(mensagem)
  const resposta = await perguntarIa(saida, "deepseek-chat")
  const divIA = document.createElement('div')
  divIA.className = 'chatSystem'
  divIA.innerHTML = marked.parse(resposta)

  chat.appendChild(divIA)

  stopLoading()
  chat.scrollTop = chat.scrollHeight
}
