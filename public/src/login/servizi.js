export const loginUtente = async (username, password) => {
  const response = await fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ruolo: "utente",
      username: username,
      password: password,
    }),
  });
  return await response.json();
};

export const loginAdmin = async (username, password) => {
  const response = await fetch("login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ruolo: "admin",
      username: username,
      password: password,
    }),
  });
  return await response.json();
};
