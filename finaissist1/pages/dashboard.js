'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (!email) {
      router.push('/login');
      return;
    }

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
              epargnePrecautionObjectif: objectif
            })
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
    projets = {}
  } = user;

  const depensesMois = depensesFixes + depensesVariables;
  const epargneMensuellePotentielle = Math.max(0, revenu - depensesMois);
  const montantRestant = Math.max(0, epargneObjectifMensuel - epargnePrecautionActuelle);

  const moisRestants = epargneMensuellePotentielle > 0
    ? Math.ceil(montantRestant / epargneMensuellePotentielle)
    : null;

  const totalEpargne = Object.values(projets).reduce(
    (acc, p) => acc + (p.epargne || 0), 0
  );

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
    <div className="p-8 font-sans bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">📊 Mon Dashboard Financier</h1>

      <button
        onClick={goToChat}
        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        💬 Retour au chatbot
      </button>

      {/* Résumé */}
      <div className="flex flex-col md:flex-row gap-5 mb-6">
        <div className="flex-1 bg-blue-100 p-4 rounded-lg">
          <strong className="block mb-1">💼 Revenu mensuel</strong>
          <p>{revenu} €</p>
        </div>
        <div className="flex-1 bg-yellow-100 p-4 rounded-lg">
          <strong className="block mb-1">📊 Budget prévu</strong>
          <p>{budgetMensuel} €</p>
        </div>
        <div className="flex-1 bg-orange-200 p-4 rounded-lg">
          <strong className="block mb-1">💸 Dépenses réelles</strong>
          <p>{depensesMois} €</p>
        </div>
      </div>

      {/* Objectif Épargne */}
      <div className="bg-white rounded-xl p-6 mb-6 shadow flex flex-col gap-2">
        <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">💡 MON OBJECTIF ÉPARGNE</h2>
        <p className="text-3xl font-bold">{epargneObjectifMensuel} €</p>
        <p className="text-green-700">Vous avez dépensé {depensesMois} € de votre budget mensuel</p>
        <p className="text-gray-600 text-sm italic">{messageEpargne}</p>

        <div className="h-4 bg-gray-200 rounded mt-2 overflow-hidden">
          <div className="bg-green-500 h-full transition-all" style={{ width: `${pourcentageEpargne}%` }}></div>
        </div>
        <p className="text-sm text-gray-500 mt-1">{pourcentageEpargne}% atteint</p>
      </div>

      {/* Épargne de précaution */}
      <div className="bg-orange-100 rounded-xl p-6 mb-6 shadow">
        <h2 className="text-xl font-semibold flex items-center gap-2">🛟 MON ÉPARGNE DE PRÉCAUTION</h2>
        <div className="text-3xl text-green-700 font-bold mb-2">{pourcentagePrecaution} %</div>
        <p className="mb-1">Objectif recommandé : <strong>{epargnePrecautionObjectif} €</strong></p>
        <p className="mb-3">Actuellement mis de côté : <strong>{epargnePrecautionActuelle} €</strong></p>

        <div className="h-4 bg-gray-300 rounded-full overflow-hidden">
          <div className="bg-green-600 h-full transition-all" style={{ width: `${pourcentagePrecaution}%` }}></div>
        </div>

        <p className="text-sm text-gray-700 mt-2">
          Ce montant est basé sur vos revenus et votre situation personnelle.
          {moisRestants !== null && moisRestants < Infinity ? (
            <> Il devrait être atteint dans environ <strong>{moisRestants} mois</strong>.</>
          ) : (
            <> Il ne peut pas être atteint avec vos dépenses actuelles.</>
          )}
        </p>
      </div>

      {/* Projets */}
      <div className="bg-green-50 p-6 rounded-xl">
        <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">📁 Mes Projets</h2>
        {Object.keys(projets).length === 0 ? (
          <p>Aucun projet pour l’instant.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {Object.entries(projets).map(([nom, p]) => {
              const pourcentage = p.epargne > 0 && p.objectif > 0
                ? Math.min(100, Math.round((p.epargne / p.objectif) * 100))
                : 0;

              const icon = nom.toLowerCase().includes('voiture') ? '🚗'
                          : nom.toLowerCase().includes('voyage') ? '🌍'
                          : '💼';

              return (
                <div key={nom} className="bg-white p-5 rounded-xl shadow flex flex-col items-center">
                  <div className="w-24 h-24 mb-3">
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
                  <div className="text-center">
                    <p className="font-semibold text-gray-700">Projet | {nom}</p>
                    <p className="text-sm text-gray-500">{p.objectif} €</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
