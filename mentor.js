import { perguntarIa } from "./ai.js";
import { mentorIa, mentorDash } from "./prompt.js";
import { renderDashboard } from "./dashboard.js";


const btnAnalisar = document.querySelector(".enviar");
let isProcessing = false;

btnAnalisar.addEventListener("click", mentor);

document.getElementById("limparBtn").addEventListener("click", () => {
  document.getElementById("nome").value = "";
  document.getElementById("classe").value = "";
  document.getElementById("curso").value = "";
  document.getElementById("objetivo").value = "";
  document.getElementById("disciplinas").innerHTML = "";
  
  document.querySelector(".answer").innerHTML = "";
  document.querySelector(".answer").classList.remove("show");
  const bars = document.querySelector(".bars");
  if (bars) bars.style.display = 'block';
  document.getElementById("stats").innerHTML = "";
  document.getElementById("grafico").innerHTML = '<div class="bars"></div>';
  localStorage.removeItem("ultimaAnalise");
});

window.addEventListener("load", () => {
  const saved = localStorage.getItem("ultimaAnalise");
  if (saved) {
    const data = JSON.parse(saved);
    document.querySelector(".answer").innerHTML = marked.parse(data.resposta)
    document.querySelector(".answer").classList.add("show");
    const bars = document.querySelector(".bars");
    if (bars) bars.style.display = 'block';
    renderDashboard(data.dashboard);
  }
});

async function mentor() {
  const nome = document.getElementById("nome").value.trim();
  const classe = document.getElementById("classe").value.trim();
  const curso = document.getElementById("curso").value.trim();
  const meta = document.getElementById("objetivo").value.trim()
  if (!nome || !classe || !curso) {
    alert("Preencha pelo menos nome, classe e curso.");
    return;
  }
  
  if (isProcessing) return;
  isProcessing = true;
  btnAnalisar.disabled = true;
  btnAnalisar.textContent = "Analisando...";
  const p1 = document.getElementById("p1").value.trim()
  const p2 = document.getElementById("p2").value.trim()
  const p3 = document.getElementById("p3").value.trim()
  const p4 = document.getElementById("p4").value.trim()
  const perfil = {"p1": p1, "p2": p2, "p3": p3, "p4": p4}
  const aluno = {
    name: nome,
    classe: classe,
    curso: curso,
    meta: meta || "Não definido",
    Personalidade: `${p1, p2, p3, p4}`,
    notas: formatarNotas()
  };
  console.log(aluno.personalidade)
  
  
  try {
  
    const resposta = await perguntarIa(mentorIa(aluno, p1, p2, p3, p4));
    document.querySelector(".answer").classList.add("show");
    document.querySelector(".answer").innerHTML = marked.parse(resposta);
    const bars = document.querySelector(".bars");
    if (bars) bars.style.display = 'block';
    
  
    const dash = await perguntarIa(mentorDash(resposta));
    const dados = safeParse(dash);
    renderDashboard(dados);

    localStorage.setItem("ultimaAnalise", JSON.stringify({
      resposta,
      dashboard: dados
    }));
  } catch (error) {
    document.querySelector(".answer").innerHTML = `<p style="color:red">Erro ao processar a análise. Tente novamente.</p>`;
    console.error(error);
  } finally {
    isProcessing = false;
    btnAnalisar.disabled = false;
    btnAnalisar.textContent = "Analisar";
  }
}

document.getElementById("addSubjects").addEventListener("click", () => {
  const container = document.getElementById("disciplinas");
  const son_1 = document.createElement("div");
 const div = document.createElement("div");

  son_1.innerHTML = `<input type="text" placeholder="Disciplina" class="disciplina"> 
    <input type='number' placeholder='Nota' class='nota' min='0' max='20'>`;
  son_1.classList.add("subjects")
  container.appendChild(div);
  div.appendChild(son_1)
  document.querySelector(".perfil").style.display = "flex"
});

function formatarNotas() {
  const disciplinas = document.querySelectorAll(".disciplina");
  const notas = document.querySelectorAll(".nota");
  return [...disciplinas].map((d, i) => {
    const n = Number(notas[i].value);
    if (d.value.trim() === "") return "";
    return `${d.value}: ${isNaN(n) ? "0" : n}`;
  }).filter(Boolean).join("\n");
  return perfil;
}

function safeParse(text) {
  try {
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return {};
  }
}
document.addEventListener("keydown", (e)=>{
if(e.key === "Enter"){
  mentor()
}
} )