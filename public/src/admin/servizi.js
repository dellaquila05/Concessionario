
export const getMarche = async () => {
    const response = await fetch("/marca", {
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return await response.json();
}
export const getModello = async () => {
    const response = await fetch("/modello", {
        headers: {
            'Content-Type': 'application/json',
        },
    });
    const data = await response.json();
    console.log(data);
    return data;
}

export const postMarca = async (marca) => {
    const response = await fetch('/postMarca', {
        method: 'POST', headers: {
            'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('token')
        }, body: JSON.stringify({
            nome: marca
        }),
    });
    return await response.json();
}

export const postModello = async (modello, marca) => {
    const response = await fetch('/postModello', {
        method: 'POST', headers: {
            'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('token')
        }, body: JSON.stringify({
            nome: modello, idMarca: marca
        }),
    });
    return await response.json();
}

export const postAuto = async (carburante, descrizione, condizione, cambio, allestimento, anno, disponibilita, km, prezzo, idModello, images) => {
    const response = await fetch('/postAuto', {
        method: 'POST', headers: {
            'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('token')
        }, body: JSON.stringify({
            carburante: carburante,
            descrizione: descrizione,
            condizione: condizione,
            cambio: cambio,
            allestimento: allestimento,
            anno: anno,
            disponibilita: disponibilita,
            km: km,
            prezzo: prezzo,
            idModello: idModello,
            images: images
        }),
    });
    console.log(await response.json());
    return await response.json();
}