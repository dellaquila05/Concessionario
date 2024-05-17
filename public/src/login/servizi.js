
export const login = async (username, password) => {
  try {
    const response = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });
    
    if (!response.ok) {
      throw new Error('Errore durante il login');
    }
    
    const data = await response.json();
    
    if (data.loginAdmin) {
      console.log("Accesso admin effettuato");
    } else if (data.loginUtente) {
      console.log("Accesso utente effettuato");
    } else {
      console.log("Login fallito");
    }
    return data;
  } catch (error) {
    console.error('Errore:', error);
    // Gestisci l'errore (es. mostra un messaggio all'utente)
  }
};
