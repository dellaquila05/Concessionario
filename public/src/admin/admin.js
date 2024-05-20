
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
const descrizione = document.getElementById("descrizione");
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
   let files = immagini.files;
   let images = [];

   for (let i = 0; i < files.length; i++) {
       let file = files[i];
       let reader = new FileReader();
       reader.onloadend = function () {
           images.push(reader.result.split(',')[1]); // Push the base64 encoded image string to the array
       }
       reader.readAsDataURL(file);
   }

   // Wait for all the FileReader tasks to complete
   while (images.length < files.length) {
       await new Promise(r => setTimeout(r, 100));
   }

   await postAuto(carburanteVal, descrizioneVal, condizioniVal, cambioVal, allestimentoVal, annoVal, disponibilitaVal, kmVal, prezzoVal, modello, images)
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
       <button type="button" class="btn btn-danger" id="Rifiuta_%ID">Accetta</button>
   </div>
</div>`

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
       let rowHtml = templatePrelazione.replace('%ID', data[i].id).replace('%ID', data[i].id).replace('%NOME', data[i].username + " " + data[i].marca + " - " + data[i].modello);
       html += rowHtml;
   }
   modalBodyPrelazione.innerHTML = html;
   data.forEach((element) => {
       document.getElementById(`Accetta_${element.id}`).onclick = async () => {
           await accettaPrelazione(element.id);
           await renderPrelazioni((await getPrelazione()).result);
       }
       document.getElementById(`Rifiuta_${element.id}`).onclick = async () => {
           await rifiutaPrelazione(element.id);
           await renderPrelazioni((await getPrelazione()).result);
       }
   });
}