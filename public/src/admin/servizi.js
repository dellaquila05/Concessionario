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
            'Content-Type': 'application/json', 
        }, body: JSON.stringify({
            nome: marca
        }),
    });
    return await response.json();
}

export const postModello = async (modello, marca) => {
    const response = await fetch('/postModello', {
        method: 'POST', headers: {
            'Content-Type': 'application/json', 
        }, body: JSON.stringify({
            nome: modello, idMarca: marca
        }),
    });
    return await response.json();
}

export const postAuto = async (carburante, descrizione, condizione, cambio, allestimento, anno, disponibilita, km, prezzo, idModello, file) => {
    // Aggiunta dei dati al FormData
    file.append('carburante', carburante);
    file.append('descrizione', descrizione);
    file.append('condizione', condizione);
    file.append('cambio', cambio);
    file.append('allestimento', allestimento);
    file.append('anno', anno);
    file.append('disponibilita', disponibilita);
    file.append('km', km);
    file.append('prezzo', prezzo);
    file.append('idModello', idModello);

    // Invio della richiesta
    const response = await fetch('/postAuto', {
        method: 'POST',
        body: file
    });

    const data = await response.json();
    console.log(data);
    return data;
}

export const getPrelazione = async () => {
    const response = await fetch('/getPrelazioniAdmin', {
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return await response.json();
}

export const accettaPrelazione = async (id) => {
    const response = await fetch('/accettaPrela', {
        method: 'POST', headers: {
            'Content-Type': 'application/json',
        }, body: JSON.stringify({
            id: id
        }),
    });
    const data = await response.json();
    console.log(data);
    return data;
}

export const rifiutaPrelazione = async (id) => {
    const response = await fetch('/rifiutaPrelazione', {
        method: 'POST', headers: {
            'Content-Type': 'application/json',
        }, body: JSON.stringify({
            id: id
        }),
    });
    return await response.json();
}