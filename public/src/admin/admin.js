
import {
   postModello,
   postAuto,
   postMarca,
   getMarche,
   getModello,
   getPrelazione,
   accettaPrelazione,
   rifiutaPrelazione
} from "./servizi.js";

const modal = new bootstrap.Modal("#Modal", {});
const buttModal = document.getElementById("buttonModal");
const selectmodello = document.getElementById("selectModello");
const carburante = document.getElementById("carburante");
const descrizione = document.getElementById("descrizioneAuto");
const condizioni = document.getElementById("condizioni");
const prezzo = document.getElementById("prezzo");
const cambio = document.getElementById("cambio");
const allestimento = document.getElementById("allestimento");
const anno = document.getElementById("anno");
const disponibilita = document.getElementById("disponibilita");
const km = document.getElementById("km");
const immagini = document.getElementById("immagini");
const salva = document.getElementById("salva");
const newModello = document.getElementById("newModello");
const newMarca = document.getElementById("newMarca");
const buttonAddModello = document.getElementById("addModello");
const selectNewModelloMarca = document.getElementById("newModelloMarca");
const buttonNewModello = document.getElementById("buttonNewModello");
const buttonNewMarca = document.getElementById("buttonNewMarca");
const modalBodyPrelazione = document.getElementById("bodyTransazione");
const modalPrelazione = new bootstrap.Modal("#modalPrelazione", {});
const buttonModalPrelazione = document.getElementById('buttonModalPrelazione');

const logout = document.getElementById("logout");
const vetrina = document.getElementById("vetrina");
const modal1 = new bootstrap.Modal("#ModalDett", {});
const descrizione1 = document.getElementById("descrizione");
let auto = [];

const templateCard = `
<div class="col-md-4 mt-3">
<div class="card">
    <img src="data:image/jpeg;base64,{src}" class="card-img-top" alt="...">
    <div class="card-body">
        <h5 class="card-title">{nome}</h5>
        <p class="card-text">{descrizione}</p>
        <a id="{idD}" class="btn btn-primary">Dettagli</a>
    </div>
</div>
</div>
`;

function renderAuto(data) {
  let html = "";
  for (let i = 0; i < data.length; i++) {
      let rowHtml = templateCard.replace('{nome}', data[i].marca + " " + data[i].modello).replace('{idD}', "bottoneD" + i).replace('{descrizione}', data[i].descrizione).replace('{src}', data[i].immagini);
      html += rowHtml;
  }
  vetrina.innerHTML = html;
  let dettagli;
  for (let i = 0; i < data.length; i++) {
      dettagli = document.getElementById("bottoneD" + i);
      dettagli.onclick = () => {
          modal1.show();
          renderModal(data[i]);
          renderAuto(data);
          const idMacchina = data[i].idMacchina;
          console.log(idMacchina);
          sessionStorage.setItem('idMacchina', idMacchina);
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
    descrizione1.innerHTML = html;
}

async function getAutoList() {
    const response = await fetch("/macchina")
    return response.json();
  }

window.onload = async () => {
       if (sessionStorage.getItem('username')) {
        auto = (await getAutoList()).result;
        renderAuto(auto);
        logout.classList.remove('hidden');
        logout.classList.add('visible');
      }else{
        window.location.href = "./login.html";

      
      }
  };


  
  logout.onclick = () => {
  
    window.location.href = "./login.html";
    sessionStorage.removeItem('username');
  
  }


salva.onclick = async () => {
    let modello = selectmodello.value;
    let carburanteVal = carburante.value;
    let descrizioneVal = descrizione.value;
    let condizioniVal = condizioni.value;
    let prezzoVal = prezzo.value;
    let cambioVal = cambio.value;
    let allestimentoVal = allestimento.value;
    let annoVal = anno.value;
    let disponibilitaVal = disponibilita.value;
    let kmVal = km.value;
    const fileInput = document.getElementById('file-input');

// Verifica se un file è stato caricato
    if (fileInput.files.length === 0) {
        console.error("Nessun file caricato");
        return;
    }

    const file = fileInput.files[0]; // Accedi al primo file caricato

    const formData = new FormData();
    formData.append('file', file); // Aggiungi il file al formData

    await postAuto(carburanteVal, descrizioneVal, condizioniVal, cambioVal, allestimentoVal, annoVal, disponibilitaVal, kmVal, prezzoVal, modello, formData)
        .catch(error => {
            console.error(error);
        });
}

buttonNewMarca.onclick = async () => {
   let marca = newMarca.value;
   if (marca !== "") {
       await postMarca(marca).catch(error => {
           console.error(error);
       });
       newMarca.value = "";
       renderMarca((await getMarche()).result);
   } else {
       alert("è richiesto compilare tutti i campi.");
   }
}
buttonNewModello.onclick = async () => {
   let modello = newModello.value;
   let marca = selectNewModelloMarca.value;
   console.log(marca);
   console.log(modello);
   if (modello !== "" && marca !== "modello") {
       await postModello(modello, marca).catch(error => {
           console.error(error);
       });
       newModello.value = "";
       renderModello((await getModello()).result);
   } else {
       alert("è richiesto compilare tutti i campi.");
   }
}
buttModal.onclick = async () => {
   const marche = (await getMarche());
   console.log(marche.result);
   renderMarca(marche.result);
   const modelli = (await getModello());
   renderModello(modelli.result);
   modal.show();
}

const templateMarca = `<option value="{id}">{marca}</option>`;
const templateModello = `<option value="{id}">{modello}</option>`;
const templatePrelazione = `<div class="row justify-content-end">
   <div class="col">
       <p>%NOME</p>
   </div>
   <div class="col-auto">
       <button type="button" class="btn btn-success" id="Accetta_%ID">Accetta</button>
       <button type="button" class="btn btn-danger" id="Rifiuta_%ID">Rifiuta</button>
   </div>
</div>`;
const prelazioniModificate = `<div class="row justify-content-end">
   <div class="col">
       <p>%NOME</p>
   </div>
   <div class="col-auto">
   <p>%STATO</p>
   </div>
</div>`;


buttonModalPrelazione.onclick = async () => {
   const prelazioni = (await getPrelazione()).result;
   console.log(prelazioni);
   renderPrelazioni(prelazioni);
   modalPrelazione.show();
}

function renderMarca(data) {

   let html = `"<option value="marca">marca</option>"`;

   for (let i = 0; i < data.length; i++) {
       let rowHtml = templateMarca.replace('{id}', data[i].idMarca).replace('{marca}', data[i].nome);

       html += rowHtml;
   }
   console.log(html);
   selectNewModelloMarca.innerHTML = html;

}

const renderModello = (data) => {
   let html = `"<option value="modello">modello</option>"`;
   for (let i = 0; i < data.length; i++) {
       let rowHtml = templateModello.replace('{id}', data[i].idModello).replace('{modello}', data[i].marca + " " + data[i].nome);
       html += rowHtml;
   }
   selectmodello.innerHTML = html;
}

const renderPrelazioni = (data) => {
   let html = "";
   for (let i = 0; i < data.length; i++) {
       if(data[i].stato === 'attesa'){
       let rowHtml = templatePrelazione.replace('%ID', data[i].id).replace('%ID', data[i].id).replace('%NOME', data[i].username + " " + data[i].marca + " - " + data[i].modello);
       html += rowHtml;
    }else{
        let rowHtml = prelazioniModificate.replace('%NOME', data[i].username + " " + data[i].marca + " - " + data[i].modello).replace('%STATO', data[i].stato);
       html += rowHtml;
    }
   }
   modalBodyPrelazione.innerHTML = html;
   data.forEach((element) => {
    const accettaBtn = document.getElementById(`Accetta_${element.id}`);
    const rifiutaBtn = document.getElementById(`Rifiuta_${element.id}`);
    
    if (accettaBtn) {
        accettaBtn.onclick = async () => {
            await accettaPrelazione(element.id);
            renderPrelazioni((await getPrelazione()).result);
        }
    }

    if (rifiutaBtn) {
        rifiutaBtn.onclick = async () => {
            await rifiutaPrelazione(element.id);
            renderPrelazioni((await getPrelazione()).result);
        }
    }
});
}