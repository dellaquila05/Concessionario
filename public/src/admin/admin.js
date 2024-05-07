/*
La pagina di registrazione è solo per gli utenti, richiami il servizio e fai la redirect. Per registrare un admin ci saranno due modi: un admin registra un admin, e un super admin (che ha credenziali specifiche) registra gli admin.
 */
import { registraAdmin } from "./servizi.js";

const username = document.getElementById("username");
const password = document.getElementById("password");
const passwordConfirm = document.getElementById("confpass");
const buttonRegister = document.getElementById("registra");

buttonRegister.onclick = () => {
  let user = username.value;
  let pass = password.value;
  let confPass = passwordConfirm.value;
  if (user != "" && pass != "" && confPass != "") {
    if (confPass === pass) {
      if (user.length > 6 && pass.length > 6) {
        registraAdmin(user, pass).catch((error) => {
          console.error(error);
        });
      } else {
        alert("Input troppo corti.");
      }
    } else {
      alert("Le password non corrisponono.");
    }
  } else {
    alert("è richiesto compilare tutti i campi.");
  }
};