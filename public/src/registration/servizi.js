let url = 'http://localhost/api.php/registrazione';

export const registraUtente = async (username, password, email) => {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ruolo: "utente",
                username: username,
                password: password,
                mail: email
            }),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.error('Errore durante la registrazione dell\'utente:', error);
    }
}
