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
    registerli.classList.remove('hidden');
    registerli.classList.add('visible');
    loginli.classList.remove('hidden');
    loginli.classList.add('visible');
    logout.classList.remove('visible');
    logout.classList.add('hidden');
  }
  const pagPrefe = document.getElementById("pagPrefe");
  pagPrefe.onclick = () => {
  
      if (sessionStorage.getItem('username')) {
  
          window.location.href = "./cart.html";
  
      }else{
  
          window.location.href = "./login.html";
  
      }
  
  }
  
    const getPrelazione = async (idUtente) => {
    const response = await fetch('/getPrelazioni', {
        method: 'POST', headers: {
            'Content-Type': 'application/json',
        }, body: JSON.stringify({
            idUtente: idUtente,
        }),
    });
    return await response.json();
}
const idUtente = sessionStorage.getItem("username");
window.onload = async () => {
  const data = await getPrelazione(idUtente);
  const tableBody = document.getElementById('prelazioniTableBody');

  data.result.forEach(prelazione => {
      const row = document.createElement('tr');
      
      const cellId = document.createElement('td');
      cellId.textContent = prelazione.id;
      row.appendChild(cellId);
      
      const cellData = document.createElement('td');
      cellData.textContent = prelazione.data;
      row.appendChild(cellData);

      const cellStato = document.createElement('td');
      cellStato.textContent = prelazione.stato;
      row.appendChild(cellStato);
      
      const cellUsername = document.createElement('td');
      cellUsername.textContent = prelazione.username;
      row.appendChild(cellUsername);
      
      const cellModello = document.createElement('td');
      cellModello.textContent = prelazione.modello;
      row.appendChild(cellModello);
      
      const cellMarca = document.createElement('td');
      cellMarca.textContent = prelazione.marca;
      row.appendChild(cellMarca);

      tableBody.appendChild(row);
  });
};