/*
Questa pagina avrà di sicuro le get di tutte le auto, le render delle stesse e farà in modo che cliccando sopra un auto sia gestito il click
*/
/*
const vetrina = document.getElementById("vetrina");
let url = 'http://localhost/api.php/getAuto';
let auto = [];

function getAutoList() {
    fetch(url)
        .then(response => response.json())
        .then(data => {
          console.log(data);
            auto = data;
            renderAuto(data.result);
        })
        .catch(error => {
            console.error('Si è verificato un errore:', error);
        });
}

window.onload = getAutoList;

const template = `
  <div class="col-md-4 mt-3">
    <div class="card">
      <img src="https://via.placeholder.com/300" class="card-img-top" alt="...">
      <div class="card-body">
        <h5 class="card-title">{nome}</h5>
        <p class="card-text">{descrizione}</p>
        <a href="#" class="btn btn-primary">Dettagli</a>
      </div>
    </div>
  </div>
`;

function renderAuto(data) {
  console.log(data);

  let html = "";

  for (let i = 0; i < data.length; i++) {

    let rowHtml = 
    template.replace('{nome}', 
    data[i].marca + " " + data[i].modello).replace('{descrizione}', 
    data[i].descrizione);

    html += rowHtml;
  }

    vetrina.innerHTML = html;


}
*/