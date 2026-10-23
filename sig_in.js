import {validarEmail} from "./ai.js"
document.querySelector("form").addEventListener("submit", async (e)=>{
    e.preventDefault()
    var nome = document.getElementById("nome").value 
    var email = document.getElementById("email").value 
    var senha = document.getElementById("pass").value 
    var confirm = document.getElementById("confirm").value 
    console.log("ui")
    if(senha !== confirm){
        return;
    }
    try{
        const emailValidado = await validarEmail(email)

    console.log(emailValidado)

    const isValidEmail = emailValidado.email_deliverability.status
    if (
    emailValidado.email_deliverability.status === "deliverable"
) {
    console.log(isValidEmail);
    fetch("http://localhost:5000/users", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    nome: nome,
    email: email,
    password: senha
 })
})
} else {
    console.log(isValidEmail);
    alert("O seu Email não é valido")
}
    }
    catch(error){
        console.log(error)
    }

})

