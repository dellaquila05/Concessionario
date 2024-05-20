const user = sessionStorage.getItem('username');
const modal = new bootstrap.Modal("#ModalDett", {});
const descrizione = document.getElementById("descrizione");
const cardPrefe = document.getElementById('preferiti');
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

async function getUtente(user) {
  const response = await fetch("/utente", {
    method: 'POST',
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username: user
    })
  });

  if (!response.ok) {
    throw new Error('Errore nella richiesta');
  }

  const data = await response.json();
  console.log("idUtente", data.result.username);

  const preferiti = await getPreferiti(data.result.username);
}

const idUser = "";

if(sessionStorage.getItem('username')) {
  
 idUser = getUtente(user);

}

const getPreferiti =  (username) => {
    const response =  fetch("/preferiti", {
        headers: {
            'Content-Type': 'application/json',
        },
        body: {
            user: username,
        }
    });
    return  response.json();
    renderAuto(preferiti);
}

const data = getPreferiti(idUser);

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
  console.log(data);
  let html = "";
  for (let i = 0; i < data.length; i++) {
      let rowHtml = templateCard.replace('{nome}', data[i].nomeMarca + " " + data[i].nomeModello)
          .replace('{idD}', "bottoneD" + i)
          .replace('{descrizione}', data[i].descrizione)
          .replace('{idR}', "bottoneR" + i)
          .replace('{src}', data[i].immagini[i]);
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
      }
      rimuovi.onclick = async () => {
          const idMacchina = data[i].idMacchina;
          await rimPrefe(idMacchina, username);
          const val = await getPreferiti(username);
          renderAuto(val.result);
      }
  }
}

async function rimPrefe(macchina, username) {
  console.log(macchina);
  let urlPrefe = '/deletePreferiti';
  const response = await fetch(urlPrefe, {
      method: "POST", headers: {"content-type": "application/json"}, body: JSON.stringify({
          idMacchina: String(macchina), idUtente: username
      })
  })
  if (!response.ok) {
      throw new Error('Errore nella richiesta');
  }
  const data = await response.json();
  console.log(data);
  return data;
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