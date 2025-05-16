// 📁 Fichier : /pages/register.js

'use client';
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [prenom, setPrenom] = useState('');
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, prenom })
    });

    if (res.ok) {
      localStorage.setItem('userEmail', email);
      router.push('/');
    } else {
      alert("Erreur à l'inscription");
    }
  };

  return (
    <form onSubmit={handleRegister} style={{ padding: 20 }}>
      <h2>Créer un compte</h2>
      <input placeholder="Prénom" value={prenom} onChange={(e) => setPrenom(e.target.value)} required />
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input type="password" placeholder="Code secret" value={code} onChange={(e) => setCode(e.target.value)} required />
      <button type="submit">Sinscrire</button>
    </form>
  );
}