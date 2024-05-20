import { sendMessage, getChatUtente, getMessaggi } from "./servizi.js";
const vetrina = document.getElementById("vetrina");
const modal = new bootstrap.Modal("#ModalDett", {});
const descrizione = document.getElementById("descrizione");
const divChat = document.getElementById("divChat");
const pagPrefe = document.getElementById("pagPrefe");
const loginli = document.getElementById("loginli");
const registerli = document.getElementById("registerli");
const logout = document.getElementById("logout");

if (sessionStorage.getItem('username')) {

    registerli.classList.remove('visible');
    registerli.classList.add('hidden');
    loginli.classList.remove('visible');
    loginli.classList.add('hidden');
    logout.classList.remove('hidden');
    logout.classList.add('visible');
    
  }else{
  
    loginli.classList.remove('hidden');
    loginli.classList.add('visible');
    registerli.classList.remove('hidden');
    registerli.classList.add('visible');
  
  }
  
  logout.onclick = () => {
  
    window.location.href = "./login.html";
    sessionStorage.removeItem('username');
  
  }

let auto = [];
const messages = [];
const socket = io();
const user = sessionStorage.getItem('username');
pagPrefe.onclick = () => {

  if (sessionStorage.getItem('username')) {

      window.location.href = "./cart.html";

  }else{

      window.location.href = "./login.html";

  }

}
const templateChat = `
<div class="container">
  <ul id="chat" class="list-group">
 
  </ul>
</div>
<div class="text-center">
  <input
    type="text"
    id="input"
    class="form-control"
    placeholder="Enter a message"
  />
  <button id="sendButton" type="button" class="btn btn-primary">
    Send
  </button>
</div>`;

const template = '<li class="list-group-item">%MESSAGE</li>';


async function getAutoList() {
  const response = await fetch("/macchina");
  const data = await response.json();
  renderAuto(data.result);
}

window.onload = getAutoList;

const templateCard = `
<div class="col-md-4 mt-3">
<div class="card">
    <img src="data:image/jpeg;base64,{src}" class="card-img-top" alt="...">
    <div class="card-body">
        <h5 class="card-title">{nome}</h5>
        <p class="card-text">{descrizione}</p>
        <a id="{idD}" class="btn btn-primary">Dettagli</a>
        <button id="{idP}" class="btn btn-success">Preferiti</button>
    </div>
</div>
</div>
`;

function renderAuto(data) {

  let html = "";

  for (let i = 0; i < data.length; i++) {

      let rowHtml = templateCard.replace('{nome}', data[i].marca + " " + data[i].modello).replace('{idD}', "bottoneD" + i).replace('{descrizione}', data[i].descrizione).replace('{src}', data[i].immagini[0]).replace('{idP}', "bottoneP" + i);

      html += rowHtml;
  }

  vetrina.innerHTML = html;

  let dettagli;

  let preferiti;

  for (let i = 0; i < data.length; i++) {
      dettagli = document.getElementById("bottoneD" + i);
      preferiti = document.getElementById("bottoneP" + i);
      dettagli.onclick = () => {
          modal.show();
          renderModal(data[i]);
          renderAuto(data);
      }
      preferiti.onclick = () => {
          const idMacchina = data[i].idMacchina;
          addPrefe(idUser, idMacchina);
      }
  }
}

const templateModal = `
<div class="container-fluid">
    <div class="row mt-3 justify-content-center">
        <div class="col-auto">
            <h1>{nome}</h1>
        </div>
    </div>
    <div class="row mt-3">
        <div class="col-auto">
            <h2>Prezzo: {prezzo}€</h2>
        </div>
        <div class="col-auto">
            <h2>Disponibilità: {disponibilita}</h2>
        </div>
        <div class="col-auto">
             <h2>Km: {km}</h2>
        </div>
         <div class="col-auto">
              <h2>Anno: {anno}</h2>
         </div>
          <div class="col-auto">
              <h2>Allestimento: {allestimento}</h2>
          </div>
          <div class="col-auto">
              <h2>Cambio: {cambio}</h2>
          <div>
    </div>
    </div>
    </div>
    <div class="row mt-3">
         <h2>Condizione: {condizione}</h2>
    </div>
    <div class="row mt-3">
        <p>{descrizione}</p>
    </div>    
</div>
`;

function renderModal(data) {
    console.log(data);
    let html = "";
    let rowHtml = templateModal.replace('{nome}', data.marca + " " + data.modello)
        .replace('{prezzo}', data.prezzo)
        .replace('{disponibilita}', data.disponibilità)
        .replace('{condizione}', data.condizione)
        .replace('{km}', data.KM)
        .replace('{allestimento}', data.allestimento)
        .replace('{anno}', data.anno)
        .replace('{cambio}', data.cambio)
        .replace('{carburante}', data.carburante)
        .replace('{descrizione}', data.descrizione);
    html += rowHtml;
    descrizione.innerHTML = html;
}

let log = true;



async function getUtente(user) {
  const response = await fetch("/utente", {
    method: "POST", headers: { "content-type": "Application/json" },
    body: JSON.stringify({
      username: user
    })
  })
  const data = await response.json()
  if (data.error) {
    log = false;
  }
  if (log === false) {
    console.log("utente non registrato");
    return log;
  } else {
    return data.result.username;
  }
}

const renderMessageVecchi = async (chatId) => {
  const messaggi = await getMessaggi(chatId);
  let html = "";
  for (let i = 0; i < messaggi.length; i++) {
    const response = messaggi[i].Data + " " + messaggi[i].Ora + " Mittente: " + messaggi[i].Mittente;
    const row = template.replace("%MESSAGE", response);
    html += row;
  }
  divChat.innerHTML = html;
  window.scrollTo(0, document.body.scrollHeight);

}

const renderMessage = () => {
  let html = "";
  messages.forEach((message) => {
    const row = template.replace("%MESSAGE", message);
    html += row;
  });
  divChat.innerHTML = html;
  window.scrollTo(0, document.body.scrollHeight);
};

if (sessionStorage.getItem('username')) {
  const username = await getUtente(user);
  socket.emit("username", username);
  const  datiChat = await getChatUtente(username);
  console.log(datiChat.ID);
  let chatId = datiChat.ID;
  await renderMessageVecchi(chatId);
  divChat.innerHTML = templateChat;
  socket.on("chat", async (message) => {
    messages.push(message);
    renderMessage();
  });
  const sendButton = document.getElementById("sendButton");
  sendButton.onclick = () => {
    if (input.value.trim() !== "") {
      socket.emit("message", input.value);
      sendMessage(username, chatId, input.value);
      input.value = "";
    } else {
      alert("You can't send empty message.");
    }
  };
}



function addPrefe(user, macchina) {

  if (log === false) {

    window.location.href = "./registration.html";

  } else {

    console.log("aggiunto ai preferiti");

    fetch("/preferiti", {
      method: "POST",

      headers: { "content-type": "Application/json" },

      body: JSON.stringify({

        iduser: user,
        idmacchina: macchina

      })

    }).then(response => {
      return response.json();
    })
      .then(data => {
                console.log("aggiunto ai preferiti");
                if(data.result === false){
                  window.location.href = "./login.html";
              }
      })
      .catch(error => {
        console.error('Si è verificato un errore:', error);
      });
  }

}

