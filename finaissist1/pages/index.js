// 📁 Fichier : /pages/index.js

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function HomePage() {
  const router = useRouter();
  const [email, setEmail] = useState(null);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState([]);
  const [user, setUser] = useState(null);
  const [questionStep, setQuestionStep] = useState(0);

  useEffect(() => {
  const storedEmail = localStorage.getItem('userEmail');
  if (!storedEmail) {
    router.push('/register');
  } else {
    setEmail(storedEmail);
    fetch('/api/user?email=' + storedEmail)
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user);
        
        // ✅ On récupère l'historique local lié à cet utilisateur
        const storedHistory = localStorage.getItem(`history-${storedEmail}`);
        if (storedHistory) {
          setHistory(JSON.parse(storedHistory));
        }
      });
  }
}, []);


useEffect(() => {
  if (user && questionStep === 0 && history.length === 0) {
    if (
      user.revenu === 0 ||
      user.depensesFixes === 0 ||
      user.depensesVariables === 0 ||
      user.epargneObjectifMensuel === 0
    ) {
      setHistory([{ role: 'bot', text: 'Bienvenue ! Avant de commencer, peux-tu me donner quelques infos ? Quel est ton revenu mensuel ?' }]);
      setQuestionStep(1);
    }
  }
}, [user]);


  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    localStorage.removeItem(`history-${email}`);

    router.push('/login');
  };
  const goToDashboard = () => {
    router.push('/dashboard');
  };

  const updateUserData = async (updateData) => {
    await fetch('/api/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, ...updateData })
    });
  };

 const sendMessage = async () => {
  if (!message || !email) return;


  let botReply = '';

  if (questionStep === 1) {
    const revenu = parseInt(message);
    if (!isNaN(revenu)) {
      await updateUserData({ revenu });
      botReply = `Merci ! Quels sont tes **dépenses fixes** par mois (loyer, abonnements, etc) ?`;
      setQuestionStep(2);
    } else {
      botReply = `Merci d'indiquer un chiffre pour ton revenu.`;
    }

  } else if (questionStep === 2) {
    const depensesFixes = parseInt(message);
    if (!isNaN(depensesFixes)) {
      await updateUserData({ depensesFixes });
      botReply = `Ok ! Et combien dépenses-tu **en moyenne pour les choses variables** (courses, sorties...) ?`;
      setQuestionStep(3);
    } else {
      botReply = `Merci d'indiquer un chiffre pour tes dépenses fixes.`;
    }

  } else if (questionStep === 3) {
    const depensesVariables = parseInt(message);
    if (!isNaN(depensesVariables)) {
      await updateUserData({ depensesVariables });

      // 🔄 On récupère les dépenses fixes déjà enregistrées
      const userRes = await fetch('/api/user?email=' + email);
      const userData = await userRes.json();
      const depensesFixes = userData.depensesFixes || 0;

      // 📊 On calcule et enregistre le budget mensuel
      const budgetMensuel = depensesFixes + depensesVariables;
      await updateUserData({ budgetMensuel });

      botReply = `Parfait ! Combien voudrais-tu épargner chaque mois ?`;
      setQuestionStep(4);
    } else {
      botReply = `Merci d'indiquer un chiffre pour les dépenses variables.`;
    }

  } else if (questionStep === 4) {
    const epargneObjectifMensuel = parseInt(message);
    if (!isNaN(epargneObjectifMensuel)) {
      await updateUserData({ epargneObjectifMensuel });

      // 🔄 On récupère toutes les dépenses pour calculer l’épargne de précaution
      const res = await fetch('/api/user?email=' + email);
      const user = await res.json();
      const depensesMois = (user.depensesFixes || 0) + (user.depensesVariables || 0);
      const epargnePrecautionObjectif = depensesMois * 6; // 🔐 Objectif = 6 mois de dépenses

      await updateUserData({
        epargnePrecautionObjectif,
        epargnePrecautionActuelle: 0 // 💾 Par défaut à zéro
      });

      botReply = `Merci ! J’ai tout ce qu’il me faut 👍 Tu peux maintenant discuter librement avec ton assistant 💬`;
      setQuestionStep(0);
    } else {
      botReply = `Merci d'indiquer un chiffre pour ton objectif d'épargne.`;
    }

  } else {
    // 🤖 Dialogue normal avec l'IA
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, email })
    });
    const data = await res.json();
    botReply = data.response;
  }

  // 📝 Mise à jour de l'historique des messages
  const newHistory = [...history, { role: 'user', text: message }, { role: 'bot', text: botReply }];
setHistory(newHistory);
localStorage.setItem(`history-${email}`, JSON.stringify(newHistory));
setMessage('');

};

  return (
<div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-100 flex flex-col items-center justify-center py-8">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-6">
        <h1 className="text-3xl font-bold text-blue-700 flex items-center gap-2">
          <span role="img" aria-label="robot">🤖</span> FinAIssist
        </h1>
        {email && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 bg-blue-50 rounded-lg p-3">
            <span className="text-gray-700">
              Connecté en tant que : <strong className="text-blue-600">{email}</strong>
            </span>
            <div className="flex gap-2 mt-2 sm:mt-0">
              <button
                onClick={handleLogout}
                className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
              >
                Se déconnecter
              </button>
              <button
                onClick={goToDashboard}
                className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition flex items-center gap-1"
              >
                <span role="img" aria-label="dashboard">🔁</span> Dashboard
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto max-h-80 bg-gray-50 rounded-lg border border-gray-200 p-4 flex flex-col gap-2">
          {history.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`px-4 py-2 rounded-lg max-w-xs break-words shadow
                  ${msg.role === 'user'
                    ? 'bg-blue-100 text-blue-900 self-end'
                    : 'bg-green-100 text-green-900 self-start'
                  }`}
              >
                <span className="font-semibold capitalize">{msg.role}:</span> {msg.text}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Écris ici..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
          />
          <button
            onClick={sendMessage}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}