document.querySelector("form").addEventListener("submit", async (e)=> {
    e.preventDefault()
    
    var emailU = document.getElementById("email").value 
    var senha = document.getElementById("pass").value 
    console.log("enviando")
    var dadosLogin = await login() 
    for(let i = 0; i<dadosLogin.length; i++){
        var data = await dadosLogin[i]
        const {nome, email, password} = data
        if(emailU === email && senha === password){
        console.log(data)
        console.log(nome, email, password)
         boasVindas(nome)
        }
  }

})
export function boasVindas(name){
    console.log(name)
    return name;
}
async function login(){
    try{
       const resposta = await fetch("http://localhost:5000/users")
  const dados = await resposta.json()
  console.log("Resposta: ", dados)
  return dados;
}
    catch(erro){
        console.error(erro)
    }

}