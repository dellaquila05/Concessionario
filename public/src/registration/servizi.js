
export const registra = async (username, password, email) => {
    try {
        const response = await fetch("/registrazione", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password,
                mail: email,
                admin: "true"
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
