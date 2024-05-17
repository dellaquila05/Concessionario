const vetrina = document.getElementById("vetrina");
const modal = new bootstrap.Modal("#ModalDett", {});
const descrizione = document.getElementById("descrizione");
let auto = [];

async function getAutoList() {
  const response = await fetch("/macchina");
  const data = await response.json();
  console.log(data);
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

    let rowHtml =
      templateCard.replace('{nome}',
        data[i].marca + " " + data[i].modello).replace('{idD}', "bottoneD" + i).replace('{descrizione}',
          data[i].descrizione).replace('{src}', data[i].immagini[0]).replace('{idP}', "bottoneP" + i);

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
      renderModal(data, i);
      renderAuto(data);
    }
    preferiti.onclick = () => {

      addPrefe(idUser, idMacchina);

    }
  }
}

const templateModal = `
<div class="auto">
    <h2>Dettagli dell'auto</h2>
    <ul>
        <li><strong>nome:</strong> {nome}</li>
        <li><strong>prezzo:</strong> {prezzo}</li>
        <li><strong>disponibilità:</strong> {disponibilita}</li>
        <li><strong>condizione:</strong> {condizione}</li>
        <li><strong>KM:</strong> {km}</li>
        <li><strong>allestimento:</strong> {allestimento}</li>
        <li><strong>anno:</strong> {anno}</li>
        <li><strong>cambio:</strong> {cambio}</li>
        <li><strong>carburante:</strong> {carburante}</li>
        <li><strong>descrizione:</strong> {descrizione}</li>
    </ul>
</div>
`;

function renderModal(data, i) {

  let html = "";

  let rowHtml =
    templateModal.replace('{nome}', data[i].marca + " " + data[i].modello)
      .replace('{prezzo}', data[i].prezzo)
      .replace('{disponibilita}', data[i].disponibilita)
      .replace('{condizione}', data[i].condizione)
      .replace('{km}', data[i].KM)
      .replace('{allestimento}', data[i].allestimento)
      .replace('{anno}', data[i].anno)
      .replace('{cambio}', data[i].cambio)
      .replace('{carburante}', data[i].carburante)
      .replace('{descrizione}', data[i].descrizione);

  html += rowHtml;

  descrizione.innerHTML = html;

}

let log = true;


const user = sessionStorage.getItem('username');

async function getUtente(user) {
  const response = await fetch("/utente", {
      method: "POST", headers: {"content-type": "Application/json"}, 
      body: JSON.stringify({
          username: user
      })
  })
  const data = await response.json()
  console.log(data.result);
  if (data.error) {
      log = false;
  }
  if (log === false) {
      console.log("utente non registrato");
      return log;
  } else {
      console.log(data.result.username);
      return data.result.username;
  }
}


const idUser = "";

if (sessionStorage.getItem('username')) {

  idUser = await getUtente(user);

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
        console.log(data);
        console.log("aggiunto ai preferiti");
      })
      .catch(error => {
        console.error('Si è verificato un errore:', error);
      });
  }

}
