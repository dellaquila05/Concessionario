export async function rimPrefe(idMacchina, idUtente) {
    try {
      const response = await fetch(`/deletePreferiti/${idUtente}/${idMacchina}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      const result = await response.json();
      return result ;
    } catch (error) {
      console.error('Errore durante la richiesta:', error);
    }
  }

 export async function getPreferiti(username) {
    const response = await fetch("/preferiti", {
        method: 'POST', headers: {
            'Content-Type': 'application/json',
        }, body: JSON.stringify({
            username: username,
        })
    });
    if (!response.ok) {
        throw new Error('Errore nella richiesta');
    }
    let data = await response.json();
    return data;
  }