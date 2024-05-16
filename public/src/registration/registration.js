/*
La pagina di registrazione è solo per gli utenti, richiami il servizio e fai la redirect. Per registrare un admin ci saranno due modi: un admin registra un admin, e un super admin (che ha credenziali specifiche) registra gli admin.
 */
import {registra} from "./servizi.js";

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
                window.location.href = './admin.html';

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

