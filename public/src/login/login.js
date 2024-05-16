import { login } from "./servizi.js";


const user = document.getElementById("username");
const pass = document.getElementById("password");
const submit = document.getElementById("submit");



submit.onclick = async () => {
  console.log("1");
  await login(user.value,pass.value);
  console.log(results);

  console.log(results[0]);
  if(results[0].admin.loginAdmin === true){
    window.location.href = './admin.html';

  }else if(results[0].admin.loginUtente === true){
    window.location.href = './home.html';
    sessionStorage.setItem('username', user.value);
  }
 
};

// Seleziona l'elemento span e l'input della password
const spanElement = document.getElementById("change");

// Aggiungi un evento di click all'elemento span
spanElement.addEventListener("click", () => {
  console.log("click");
  // Controlla il tipo dell'input della password
  if (pass.type === "password") {
    // Cambia il tipo a 'text' per mostrare la password
    pass.type = "text";
    // Cambia il testo dello span a 'visibility_off'
    spanElement.textContent = "visibility_off";
  } else {
    // Cambia il tipo a 'password' per nascondere la password
    pass.type = "password";
    // Cambia il testo dello span a 'visibility'
    spanElement.textContent = "visibility";
  }
});
