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
    const data = await response.json();
    return data;
}

export async function addPrefe(user, macchina) {  
  try {
      const response = await fetch("/postPreferiti", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
              idUtente: user,
              idMacchina: macchina
          })
      });

      let data = await response.json();
      console.log(data);

      return data;

  } catch (error) {
      console.error('Si è verificato un errore:', error);
  }
}