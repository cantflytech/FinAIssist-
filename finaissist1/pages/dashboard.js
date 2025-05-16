// 📁 /pages/dashboard.js

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (!email) {
      router.push('/login');
    } else {
      fetch('/api/user?email=' + email)
        .then(res => res.json())
        .then(data => setUser(data.user));
    }
  }, []);

  const goToChat = () => {
    router.push('/');
  };

  if (!user) return <p style={{ padding: 20 }}>Chargement...</p>;

  const totalEpargne = Object.values(user.projets || {}).reduce(
    (acc, p) => acc + (p.epargne || 0),
    0
  );

  const calculEpargneRestante = Math.max(0, user.revenu - user.depensesMois);
  const pourcentageEpargne = Math.min(100, (calculEpargneRestante / user.epargneObjectif) * 100);

  return (
    <div style={{ padding: 30, fontFamily: 'sans-serif' }}>
      <h1>📊 Mon Dashboard Financier</h1>

      <button onClick={goToChat} style={{ marginBottom: 20 }}>💬 Retour au chatbot</button>

      {/* Card Objectif Épargne */}
      <div style={{ background: '#f9f9f9', borderRadius: 10, padding: 20, marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginBottom: 5 }}>💡 MON OBJECTIF ÉPARGNE</h2>
        <p style={{ fontSize: 26, fontWeight: 'bold' }}>{user.epargneObjectif} €</p>
        <p style={{ color: 'green' }}>Vous avez dépensé {user.depensesMois} € de votre budget mensuel</p>
        <div style={{ height: 15, background: '#eee', borderRadius: 8, overflow: 'hidden', marginTop: 10 }}>
          <div style={{ width: `${pourcentageEpargne}%`, background: '#00C851', height: '100%' }}></div>
        </div>
      </div>

      {/* Résumé revenus et dépenses */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
        <div style={{ flex: 1, background: '#e3f2fd', padding: 15, borderRadius: 8 }}>
          <strong>💼 Revenu mensuel</strong>
          <p>{user.revenu} €</p>
        </div>
        <div style={{ flex: 1, background: '#ffe0b2', padding: 15, borderRadius: 8 }}>
          <strong>💸 Dépenses</strong>
          <p>{user.depensesMois} €</p>
        </div>
      </div>

      {/* Projets */}
      <div style={{ background: '#f1f8e9', padding: 20, borderRadius: 10 }}>
        <h2>📁 Mes Projets</h2>
        {Object.entries(user.projets || {}).length === 0 ? (
          <p>Aucun projet pour l’instant.</p>
        ) : (
          Object.entries(user.projets).map(([nom, p]) => (
            <div key={nom} style={{ marginBottom: 10, padding: 10, border: '1px solid #ccc', borderRadius: 6 }}>
              <strong>{nom}</strong> — {p.epargne} € / {p.objectif} €
            </div>
          ))
        )}
      </div>
    </div>
  );
}