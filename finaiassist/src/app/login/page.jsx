'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });

    const data = await res.json();

    if (res.ok) {
      alert('Connexion réussie !');
      // Simuler une session utilisateur avec le localStorage
      localStorage.setItem('userEmail', email);
      router.push('/dashboard'); // Redirige vers le dashboard
    } else {
      alert(data.message);
    }
  };

  return (
    <div style={{ padding: 30 }}>
      <h1>Connexion</h1>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        /><br />
        <input
          type="password"
          placeholder="Code PIN"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        /><br />
        <button type="submit">Se connecter</button>
      </form>
    </div>
  );
}
