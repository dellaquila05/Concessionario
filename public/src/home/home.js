import {addPrefe, postPrelazione ,inviaEmailAdmin, inviaEmailUtente} from "./servizi.js";
const vetrina = document.getElementById("vetrina");
const modal = new bootstrap.Modal("#ModalDett", {});
const descrizione = document.getElementById("descrizione");
const loginli = document.getElementById("loginli");
const registerli = document.getElementById("registerli");
const logout = document.getElementById("logout");
let auto = [];
const  modal2 = new bootstrap.Modal('#myModal', {})
const buttonModal = document.getElementById("openModal");
const oggetto = document.getElementById("oggetto");
const testo = document.getElementById("testo");
const destinatario = document.getElementById("destinatario");
const sendEmail = document.getElementById("sendEmail");

buttonModal.onclick =   () => {
  modal2.show();
 
}
sendEmail.onclick = async () => { 
  if(oggetto.value !== "" && testo.value !== "" && destinatario.value !== ""){
  const admin = await inviaEmailAdmin(oggetto.value, testo.value);
  const utente = await inviaEmailUtente(destinatario.value, testo.value);
  if(admin.result === true && utente.result === true){
    modal2.hide();
  }else{
    alert("Email non inviata con successo, si prega di riprovare.");
  }
}else{
  alert("Email non inviata con successo, si prega di compilare tutti i campi richiesti.");

}
}


async function getAutoList() {
  const response = await fetch("/macchina")
  return response.json();
}

window.onload = async () => {
  auto = (await getAutoList()).result;
  renderAuto(auto);
  if (sessionStorage.getItem('username')) {
    registerli.classList.remove('visible');
    registerli.classList.add('hidden');
    loginli.classList.remove('visible');
    loginli.classList.add('hidden');
    logout.classList.remove('hidden');
    logout.classList.add('visible');
} else {
    loginli.classList.remove('hidden');
    loginli.classList.add('visible');
    registerli.classList.remove('hidden');
    registerli.classList.add('visible');
}
}

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
      let rowHtml = templateCard.replace('{nome}', data[i].marca + " " + data[i].modello).replace('{idD}', "bottoneD" + i).replace('{descrizione}', data[i].descrizione).replace('{src}', data[i].immagini).replace('{idP}', "bottoneP" + i);
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
          const idMacchina = data[i].idMacchina;
          console.log(idMacchina);
          sessionStorage.setItem('idMacchina', idMacchina);
      }
      preferiti.onclick = async () => {
          if (sessionStorage.getItem('username')) {
            const username = sessionStorage.getItem('username');
            const idMacchina = sessionStorage.getItem('idMacchina');
            const prefe =  await addPrefe( username, idMacchina);
            console.log("ciao");
            console.log(prefe);
            if(prefe.result){
                alert("Auto aggiunta nei preferiti.");
            }else{
                alert("Auto non aggiunta nei preferiti correttamente. Si consiglia di controllare che gia non lo sia.");
            }
        } else {
            window.location.href = "./login.html";
        }
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
function formatDatestamp(datestamp) {
    const date = new Date(datestamp);
    const day = String(date.getDate()).padStart(2,'0');
    const month = String(date.getMonth()+1).padStart(2,'0');
    const year = date.getFullYear();
    return ''+day+'/'+month+'/'+year;

}
function renderModal(data) {
    console.log(data);
    let html = "";
    let annata = formatDatestamp(data.anno);
    let rowHtml = templateModal.replace('{nome}', data.marca + " " + data.modello)
        .replace('{prezzo}', data.prezzo)
        .replace('{disponibilita}', data.disponibilità)
        .replace('{condizione}', data.condizione)
        .replace('{km}', data.KM)
        .replace('{allestimento}', data.allestimento)
        .replace('{anno}', annata)
        .replace('{cambio}', data.cambio)
        .replace('{carburante}', data.carburante)
        .replace('{descrizione}', data.descrizione);
    html += rowHtml;
    descrizione.innerHTML = html;
}

let log = true;


const user = sessionStorage.getItem('username');

async function getUtente(user) {
    const response = await fetch("/utente", {
        method: "POST", headers: {"content-type": "Application/json"}, body: JSON.stringify({
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

let idUser;
if (sessionStorage.getItem('username')) {
    console.log(await getUtente(user));
    idUser = await getUtente(user);
    console.log(idUser);
}






logout.onclick = () => {
    window.location.href = "./home.html";
    sessionStorage.removeItem('username');
}

const selectMarche = document.getElementById("marcheFiltro");
const selectModelli = document.getElementById("modelliFiltro");
const minPrezzo = document.getElementById("prezzoFiltro");
const applicaFiltri = document.getElementById("applicaFiltri");
const checkPrezzo = document.getElementById("checkPrezzo");
const checkMarca = document.getElementById("checkMarca");
const checkModello = document.getElementById("checkModello");
const bottoneFiltri = document.getElementById("bottoneFiltri");
const getMarche = async () => {
    const response = await fetch('/marca');
    return response.json();
}

const getModello = async () => {
    const response = await fetch('/modello');
    return response.json();
}

bottoneFiltri.onclick = async () => {
    const modelli = await getModello();
    const marche = await getMarche();
    renderModelli(modelli.result);
    renderMarche(marche.result);
}
applicaFiltri.onclick = async () => {
    let autoFiltrered = auto;
    if (checkPrezzo.checked) {
        autoFiltrered = await filtroPrezzoMinimo(autoFiltrered, minPrezzo.value);
    }
    if (checkModello.checked) {
        autoFiltrered = await filtroModello(autoFiltrered, selectModelli.value);
    }
    if (checkMarca.checked) {
        autoFiltrered = await filtroMarca(autoFiltrered, selectMarche.value);
    }
    renderAuto(autoFiltrered);
}
const resetFiltri = document.getElementById("resetFiltri");
resetFiltri.onclick = () => {
    renderAuto(auto);
    minPrezzo.value = "";
    checkPrezzo.checked = false;
    checkMarca.checked = false;
    checkModello.checked = false;
}
const templateSelect = `<option value="{id}">{marca}</option>`;

   

const renderModelli = (data) => {
    let html = "";
    for (let i = 0; i < data.length; i++) {
        let rowHtml = templateSelect.replace('{id}', data[i].idModello).replace('{marca}', data[i].marca + " " + data[i].nome);
        html += rowHtml;
    }
    selectModelli.innerHTML = html;
}

const renderMarche = (data) => {
    let html = "";
    for (let i = 0; i < data.length; i++) {
        let rowHtml = templateSelect.replace('{id}', data[i].nome).replace('{marca}', data[i].nome);
        html += rowHtml;
    }
    selectMarche.innerHTML = html;
}

const filtroModello = (data, modello) => {
    console.log(modello);
    console.log(data);
    return data.filter(auto => auto.idModello == modello);
}

const filtroMarca = (data, marca) => {
    console.log(marca);
    console.log(data);
    return data.filter(auto => auto.marca === marca);
}

const filtroPrezzoMinimo = (data, prezzoMinimo) => {
    return data.filter(auto => auto.prezzo >= prezzoMinimo);
}

prelaziona.onclick = async () => {
  if (sessionStorage.getItem('username')) {
      const username = sessionStorage.getItem('username');
      const idMacchina = sessionStorage.getItem('idMacchina');
      const prela = await postPrelazione( username, idMacchina);
      if(prela.result){
        alert("Effettuato con successo.");
        location.reload();
      }else{
        alert("Si è verificato un errore nella preazione.");

      }
      
  } else {
      window.location.href = "./login.html";
  }
}