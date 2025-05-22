'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  const produitsPyramide = [
    { nom: 'Compte courant', code: 'compteCourant', width: 'w-full' },
    { nom: 'Épargne de précaution - livrets', code: 'livrets', width: 'w-11/12' },
    { nom: 'Épargne moyen terme (PEL, CAT)', code: 'epargneMoyenTerme', width: 'w-10/12' },
    { nom: 'Assurance-vie', code: 'assuranceVie', width: 'w-9/12' },
    { nom: 'PERI', code: 'peri', width: 'w-8/12' },
    { nom: 'CTO / PEA', code: 'ctoPea', width: 'w-7/12' },
  ];

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (!email) return router.push('/login');

    fetch('/api/user?email=' + email)
      .then(res => res.json())
      .then(data => {
        const userData = data.user;

        if (!userData.epargnePrecautionObjectif || userData.epargnePrecautionObjectif === 0) {
          const totalDepenses = (userData.depensesFixes || 0) + (userData.depensesVariables || 0);
          const objectif = totalDepenses * 6;

          fetch('/api/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: userData.email,
              epargnePrecautionObjectif: objectif,
            }),
          });

          userData.epargnePrecautionObjectif = objectif;
        }

        setUser(userData);
      });
  }, []);

  const goToChat = () => router.push('/');
  if (!user) return <p className="p-5">Chargement...</p>;

  const {
    revenu = 0,
    depensesFixes = 0,
    depensesVariables = 0,
    epargneObjectifMensuel = 0,
    epargnePrecautionActuelle = 0,
    epargnePrecautionObjectif = 0,
    budgetMensuel,
    projets = {},
    produitsFinanciers = {},
    produitsRecommandes = {},
  } = user;

  const possession = produitsFinanciers;
  const recommandationsActives = Object.entries(produitsRecommandes)
    .filter(([code]) => !possession[code])
    .map(([code, raison]) => ({
      code,
      nom: {
        compteCourant: 'Compte courant',
        livrets: 'Livrets',
        epargneMoyenTerme: 'Épargne moyen terme',
        assuranceVie: 'Assurance-vie',
        peri: 'PERI',
        ctoPea: 'CTO / PEA',
      }[code] || code,
      raison,
    }));

  const depensesMois = depensesFixes + depensesVariables;
  const epargneMensuellePotentielle = Math.max(0, revenu - depensesMois);
  const montantRestant = Math.max(0, epargneObjectifMensuel - epargnePrecautionActuelle);
  const moisRestants = epargneMensuellePotentielle > 0 ? Math.ceil(montantRestant / epargneMensuellePotentielle) : null;

  let pourcentageEpargne = 0;
  let messageEpargne = "Pas encore de dépenses enregistrées.";

  if (epargneObjectifMensuel > 0) {
    const epargneEstimee = revenu - depensesMois;
    if (depensesMois === 0) {
      messageEpargne = "En attente de dépenses pour estimer ton épargne.";
    } else if (epargneEstimee <= 0) {
      messageEpargne = "Tu as dépassé ton budget, aucune épargne possible.";
    } else if (epargneEstimee >= epargneObjectifMensuel) {
      pourcentageEpargne = 100;
      messageEpargne = "Objectif d'épargne estimé atteint.";
    } else {
      pourcentageEpargne = Math.round((epargneEstimee / epargneObjectifMensuel) * 100);
      messageEpargne = `Épargne estimée : ${epargneEstimee} €`;
    }
  }

  const pourcentagePrecaution = epargnePrecautionObjectif > 0
    ? Math.round((epargnePrecautionActuelle / epargnePrecautionObjectif) * 100)
    : 0;

  return (
    <div className="p-6 md:p-10 font-sans bg-gradient-to-br from-gray-50 to-white min-h-screen space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">📊 Mon Dashboard Financier</h1>
        <button
          onClick={goToChat}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          💬 Retour au chatbot
        </button>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="💼 Revenu mensuel" color="bg-blue-100" value={`${revenu} €`} />
        <Card title="📊 Budget prévu" color="bg-yellow-100" value={`${budgetMensuel} €`} />
        <Card title="💸 Dépenses réelles" color="bg-orange-200" value={`${depensesMois} €`} />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EpargneCard
          objectif={epargneObjectifMensuel}
          depensesMois={depensesMois}
          message={messageEpargne}
          pourcentage={pourcentageEpargne}
        />
        <PrecautionCard
          actuel={epargnePrecautionActuelle}
          objectif={epargnePrecautionObjectif}
          pourcentage={pourcentagePrecaution}
          moisRestants={moisRestants}
        />
      </section>

      <Projects projets={projets} />

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Pyramide produits={produitsPyramide} possession={possession} />
        <Recommendations recommandations={recommandationsActives} />
      </section>
    </div>
  );
}

function Card({ title, value, color }) {
  return (
    <div className={`${color} p-5 rounded-xl shadow-md`}>
      <h3 className="text-sm text-gray-700 mb-1 font-medium">{title}</h3>
      <p className="text-xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function EpargneCard({ objectif, depensesMois, message, pourcentage }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-2">
      <h2 className="text-xl font-semibold">💡 MON OBJECTIF ÉPARGNE</h2>
      <p className="text-3xl font-bold">{objectif} €</p>
      <p className="text-green-700">Dépensé ce mois : {depensesMois} €</p>
      <p className="text-sm italic text-gray-600">{message}</p>
      <div className="h-3 bg-gray-200 rounded">
        <div
          className="bg-green-500 h-full rounded"
          style={{ width: `${pourcentage}%` }}
        ></div>
      </div>
      <p className="text-xs text-gray-500">{pourcentage}% atteint</p>
    </div>
  );
}

function PrecautionCard({ actuel, objectif, pourcentage, moisRestants }) {
  return (
    <div className="bg-orange-100 p-6 rounded-xl shadow space-y-2">
      <h2 className="text-xl font-semibold">🛟 ÉPARGNE DE PRÉCAUTION</h2>
      <p className="text-3xl text-green-700 font-bold">{pourcentage}%</p>
      <p>Objectif : <strong>{objectif} €</strong></p>
      <p>Actuellement : <strong>{actuel} €</strong></p>
      <div className="h-3 bg-gray-300 rounded">
        <div
          className="bg-green-600 h-full rounded"
          style={{ width: `${pourcentage}%` }}
        ></div>
      </div>
      <p className="text-sm text-gray-700">
        {moisRestants !== null && moisRestants < Infinity
          ? `Atteignable en environ ${moisRestants} mois`
          : `Non atteignable avec vos dépenses actuelles`}
      </p>
    </div>
  );
}

function Projects({ projets }) {
  return (
    <div className="bg-green-50 p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">📁 Mes Projets</h2>
      {Object.keys(projets).length === 0 ? (
        <p>Aucun projet pour l'instant.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(projets).map(([nom, p]) => {
            const pourcentage = p.epargne && p.objectif
              ? Math.min(100, Math.round((p.epargne / p.objectif) * 100))
              : 0;

            const icon = nom.toLowerCase().includes('voiture')
              ? '🚗'
              : nom.toLowerCase().includes('vacances')
              ? '🌍'
              : '💼';

            return (
              <div key={nom} className="bg-white p-4 rounded-xl shadow text-center">
                <div className="w-20 h-20 mx-auto mb-2">
                  <CircularProgressbar
                    value={pourcentage}
                    text={icon}
                    styles={buildStyles({
                      textSize: '28px',
                      pathColor: '#c026d3',
                      textColor: '#c026d3',
                      trailColor: '#eee',
                    })}
                  />
                </div>
                <p className="font-semibold text-gray-700">{nom}</p>
                <p className="text-sm text-gray-500">{p.objectif} €</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Pyramide({ produits, possession }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow">
      <h2 className="text-xl font-semibold mb-4">🌟 Pyramide des Produits Financiers</h2>
      <div className="flex flex-col items-center gap-2">
        {[...produits].reverse().map(({ nom, code, width }) => {
          const estDetenu = possession[code] === true;
          return (
            <div
              key={code}
              className={`${width} py-2 px-4 rounded text-sm flex justify-between items-center ${
                estDetenu
                  ? 'bg-purple-700 text-white font-medium'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              <span>{nom}</span>
              <span>{estDetenu ? '✅ Détenu' : '❌ Non détenu'}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Recommendations({ recommandations }) {
  if (recommandations.length === 0) return null;

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">🔎 Recommandations Personnalisées</h2>
      <ul className="space-y-3">
        {recommandations.map((prod) => (
          <li key={prod.code} className="bg-white p-4 rounded shadow">
            <p className="font-semibold text-blue-800">💡 {prod.nom}</p>
            <p className="text-sm text-gray-700 italic">{prod.raison}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}