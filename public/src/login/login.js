import { login } from "./servizi.js";


const user = document.getElementById("username");
const pass = document.getElementById("password");
const submit = document.getElementById("submit");

submit.onclick = async () => {
  const result = await login(user.value,pass.value);
  if (result.loginAdmin) {
    window.location.href = './admin.html'; 
    sessionStorage.setItem('username', user.value);
  } else if (result.loginUtente) {
    window.location.href =  './home.html'; 
    sessionStorage.setItem('username', user.value);
  } else {
    alert('Login fallito. Controlla username e password.');
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
