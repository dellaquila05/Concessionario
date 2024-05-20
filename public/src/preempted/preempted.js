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
