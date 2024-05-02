import {loginAdmin, loginUtente} from "./servizi.js";

/*
La login avrà username password e ruolo, in base al ruolo richiami i servizi; quando le credenziali sono corrette fai una redirect alla pagina corretta.
Controlla sempre i dati, ricorda di non salvare in session storage ne altro, solo il token.
 */

const user = document.getElementById("username");
const pass = document.getElementById("password");
const submit = document.getElementById("submit");


// Seleziona tutti gli input radio con il nome 'options-base'
let radios = document.querySelectorAll('input[name="options-role"]');


submit.onclick = async () => {
    let selectedValue;
    for (let radio of radios) {
        if (radio.checked) {
            selectedValue = radio.id; // o radio.value se hai un attributo value per gli input radio
            break;
        }
    }
    if (selectedValue === 'admin') {
        await loginAdmin(user.value, pass.value);
    } else {
        const result = await loginUtente(user.value, pass.value);
        if (result.token) {
            window.location.href = '../../HTML/home.html';
        }
    }
}


// Seleziona l'elemento span e l'input della password
const spanElement = document.getElementById('change');

// Aggiungi un evento di click all'elemento span
spanElement.addEventListener('click', () => {
    console.log("click");
    // Controlla il tipo dell'input della password
    if (pass.type === 'password') {
        // Cambia il tipo a 'text' per mostrare la password
        pass.type = 'text';
        // Cambia il testo dello span a 'visibility_off'
        spanElement.textContent = 'visibility_off';
    } else {
        // Cambia il tipo a 'password' per nascondere la password
        pass.type = 'password';
        // Cambia il testo dello span a 'visibility'
        spanElement.textContent = 'visibility';
    }
});
