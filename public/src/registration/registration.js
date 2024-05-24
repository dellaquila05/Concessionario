
import {registra, postNewChat} from "./servizi.js";

const username = document.getElementById("username");
const password = document.getElementById("password");
const passwordConfirm = document.getElementById("confPass");
const email = document.getElementById("email");
const buttonRegister = document.getElementById("submit");


buttonRegister.onclick = async () => {
    let user = username.value;
    let pass = password.value;
    let confPass = passwordConfirm.value;
    let mail = email.value;
    if (user !== "" && pass !== "" && mail !== "" && confPass !== "") {
        if (confPass === pass) {
            if (user.length > 6 && pass.length > 6) {
               await registra(user, pass, mail);
               const result = await postNewChat(user);
               console.log(result);
                window.location.href = './home.html';

            } else {
                alert("Input troppo corti.");
            }
        } else {
            alert("Le password non corrisponono.")
        }

    } else {
        alert("è richiesto compilare tutti i campi.");
    }
};

// Seleziona l'elemento span e l'input della password
const spanElement = document.getElementById("change");
const spanElement2 = document.getElementById("change2");

// Aggiungi un evento di click all'elemento span
spanElement.addEventListener("click", () => {
  console.log("click");
  // Controlla il tipo dell'input della password
  if (password.type === "password") {
    // Cambia il tipo a 'text' per mostrare la password
    password.type = "text";
    // Cambia il testo dello span a 'visibility_off'
    spanElement.textContent = "visibility_off";
  } else {
    // Cambia il tipo a 'password' per nascondere la password
    password.type = "password";
    // Cambia il testo dello span a 'visibility'
    spanElement.textContent = "visibility";
  }
});
// Aggiungi un evento di click all'elemento span
spanElement2.addEventListener("click", () => {
    console.log("click");
    // Controlla il tipo dell'input della password
    if (passwordConfirm.type === "password") {
      // Cambia il tipo a 'text' per mostrare la password
      passwordConfirm.type = "text";
      // Cambia il testo dello span a 'visibility_off'
      spanElement2.textContent = "visibility_off";
    } else {
      // Cambia il tipo a 'password' per nascondere la password
      passwordConfirm.type = "password";
      // Cambia il testo dello span a 'visibility'
      spanElement2.textContent = "visibility";
    }
  });