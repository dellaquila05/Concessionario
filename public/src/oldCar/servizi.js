export async function inviaEmailAdmin(oggetto, testo ) {
    try {
      const response = await fetch('/inviaEmailAdmin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oggetto: oggetto,
          testo: testo
        }),
      });
  
      const data = await response.json();
      console.log('Success:', data);
    } catch (error) {
      console.error('Error:', error);
    }
  }
  export async function inviaEmailUtente(destinatario, testo ) {
    try {
      const response = await fetch('/inviaEmailUtente', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            destinatario: destinatario,
          testo: testo
        }),
      });
  
      const data = await response.json();
      console.log('Success:', data);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  export  const postPrelazione = async (idUtente,idMacchina) => {
    const response = await fetch('/postPrelazione', {
        method: 'POST', headers: {
            'Content-Type': 'application/json',
        }, body: JSON.stringify({
            idUtente: idUtente,
            idMacchina: idMacchina
        }),
    });
    return await response.json();
}