/*
Dovrai richiamare il serviziio per prendere le auto preferite (non sarà più carrello ma preferiti) e renderizzarle in pagina, inoltre dovrai gestire il click su un auto per andare alla pagina di dettaglio, oltre che le azioni che concorderemo poi
 */


const getPreferiti = async () => {
    const response = await fetch("/preferiti", {
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return await response.json();
}

