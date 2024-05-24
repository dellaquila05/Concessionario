import {
  getPreferiti,
  rimPrefe
} from "./servizi.js";
const user = sessionStorage.getItem('username');
const modal = new bootstrap.Modal("#ModalDett", {});
const descrizione = document.getElementById("descrizione");
const cardPrefe = document.getElementById('preferiti');
const loginli = document.getElementById("loginli");
const registerli = document.getElementById("registerli");
const logout = document.getElementById("logout");
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
  if(oggetto.value !== "" && testo.value !== "" && destinatarios.value !== ""){
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




window.onload = async () => {
  if(sessionStorage.getItem('username')) {
    const username = sessionStorage.getItem('username');
      const preferiti = await getPreferiti(username);
      if (preferiti.result ) {
        renderAuto(preferiti.result);
      } else {
        console.error("Non hai nessuna auto salvata nei preferiti.");
      }
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
};


const templateCard = `
<div class="col-md-4 mt-3">
  <div class="card">
    <img src="data:image/jpeg;base64,{src}" class="card-img-top" alt="...">
    <div class="card-body">
      <h5 class="card-title">{nome}</h5>
      <p class="card-text">{descrizione}</p>
      <a id="{idD}" class="btn btn-primary">Dettagli</a>
      <button id="{idR}" class="btn btn-danger">Rimuovi</button>
    </div>
  </div>
</div>
`;

function renderAuto(data) {
  if (!data || data.length === 0) {
    console.error("L'array dei preferiti è vuoto o non definito.");
    return;
  }else{
  let html = "";
  for (let i = 0; i < data.length; i++) {
    let rowHtml = templateCard.replace('{nome}', data[i].nomeMarca + " " + data[i].nomeModello).replace('{idD}', "bottoneD" + i).replace('{descrizione}', data[i].descrizione).replace('{src}', data[i].immagini).replace('{idR}', "bottoneR" + i);
      html += rowHtml;
  }
  cardPrefe.innerHTML = html;
  for (let i = 0; i < data.length; i++) {
      const dettagli = document.getElementById("bottoneD" + i);
      const rimuovi = document.getElementById("bottoneR" + i);
      dettagli.onclick = () => {
        modal.show();
        renderModal(data[i]);
        renderAuto(data);
        const idMacchina = data[i].idMacchina;
        sessionStorage.setItem('idMacchina', idMacchina);
    }
      rimuovi.onclick = async () => {
        const username = sessionStorage.getItem('username');
        const idMacchina = data[i].idMacchina;
        console.log("IdMacchina: " + idMacchina + " username: " + username);
          const rim = await rimPrefe(idMacchina, username);
          if(rim.result) {
            alert("Auto rimossa con successo dai preferiti.");
            const pref = await getPreferiti(username);
            renderAuto(pref.result);
            location.reload();
          }else{
            alert("Si è verificato un errore nella rimozione dell'auto dai preferiti.");
          }
          
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

function renderModal(data) {
  console.log(data);
  let html = "";
  let rowHtml = templateModal.replace('{nome}', data.nomeMarca + " " + data.nomeModello)
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