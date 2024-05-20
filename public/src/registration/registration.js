
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

