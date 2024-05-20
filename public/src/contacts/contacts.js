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
