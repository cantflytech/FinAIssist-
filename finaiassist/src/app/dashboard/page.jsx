'use client';

import { useEffect, useState } from 'react';
import {
  RadialBarChart, RadialBar,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Area
} from 'recharts';

export default function DashboardPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (!email) return;
    fetch('/api/user?email=' + email)
      .then((res) => res.json())
      .then((data) => setUser(data.user));
  }, []);

  if (!user) return <p>Chargement...</p>;

  const objectif = user.epargneObjectif || 0;
  const depenses = user.depensesSemaine || 0;
  const epargneTotale = Object.values(user.projets || {}).reduce((acc, p) => acc + (p.epargne || 0), 0);

  // Simulation données pour projection
  const projectionData = [
    { mois: 'Jan', versements: 5000, capital: 5500, projection: 6000 },
    { mois: 'Fév', versements: 10000, capital: 11200, projection: 12000 },
    { mois: 'Mar', versements: 15000, capital: 17000, projection: 19000 },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h1>Bonjour, {user.prenom} 👋</h1>

      {/* Bloc 1 : Objectif */}
      <section style={{ marginBottom: '40px' }}>
        <h2>🎯 Mon objectif d’épargne</h2>
        <p>Objectif mensuel : <strong>{objectif} €</strong></p>
        <p>Vous avez dépensé <strong>{depenses} €</strong></p>
        <div style={{ background: '#eee', width: '300px', height: '20px' }}>
          <div style={{
            background: '#4caf50',
            width: `${(depenses / objectif) * 100}%`,
            height: '100%'
          }} />
        </div>
      </section>

      {/* Bloc 2 : Épargne de précaution */}
      <section style={{ marginBottom: '40px' }}>
        <h2>🛟 Mon épargne de précaution</h2>
        <RadialBarChart
          width={200}
          height={200}
          innerRadius="80%"
          outerRadius="100%"
          data={[{ name: 'Épargne', value: 73, fill: '#00C49F' }]}
        >
          <RadialBar dataKey="value" />
        </RadialBarChart>
        <p>Objectif recommandé : 8843 €</p>
        <p>Objectif à atteindre dans 24 mois</p>
      </section>

      {/* Bloc 3 : Projets */}
      <section style={{ marginBottom: '40px' }}>
        <h2>🧳 Mes projets</h2>
        {Object.entries(user.projets || {}).map(([nom, p]) => {
          const pct = Math.round((p.epargne / p.objectif) * 100);
          return (
            <div key={nom} style={{ marginBottom: '10px' }}>
              <strong>{nom}</strong> : {p.epargne} € / {p.objectif} € ({pct}%)
              <RadialBarChart width={150} height={150} innerRadius="80%" outerRadius="100%" data={[{ value: pct, fill: '#8e24aa' }]}>
                <RadialBar dataKey="value" />
              </RadialBarChart>
            </div>
          );
        })}
      </section>

      {/* Bloc 4 : Recommandation produits */}
      <section style={{ marginBottom: '40px' }}>
        <h2>💡 Recommandations produits</h2>
        <ul>
          <li>✅ Livret A (épargne de précaution)</li>
          <li>📦 PERI recommandé</li>
          <li>❌ Assurance-vie non détenue</li>
        </ul>
      </section>

      {/* Bloc 5 : Projection des actifs */}
      <section style={{ marginBottom: '40px' }}>
        <h2>📈 Projection des actifs détenus</h2>
        <LineChart width={600} height={300} data={projectionData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mois" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="versements" stroke="#6a1b9a" />
          <Line type="monotone" dataKey="capital" stroke="#f06292" />
          <Area type="monotone" dataKey="projection" fill="#f8bbd0" stroke="#f8bbd0" />
        </LineChart>
      </section>
    </div>
  );
}
