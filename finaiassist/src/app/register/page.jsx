'use client';

import { useState } from 'react';

export default function RegisterPage() {
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = { prenom, email, code };

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });

    const data = await res.json();
    alert(data.message);
  };

  return (
    <div style={{ padding: 30 }}>
      <h1>Inscription</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Prénom"
          value={prenom}
          onChange={(e) => setPrenom(e.target.value)}
          required
        /><br />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        /><br />
        <input
          type="password"
          placeholder="Code PIN (6 chiffres)"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          pattern="\d{6}"
          required
        /><br />
        <button type="submit">Créer un compte</button>
      </form>
    </div>
  );
}
