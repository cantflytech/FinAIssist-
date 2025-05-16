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
        .then((data) => setUser(data.user));
    }
  }, []);

  useEffect(() => {
    if (user && questionStep === 0) {
      if (user.revenu === 0 || user.depensesMois === 0 || user.epargneObjectif === 0) {
        setHistory([{ role: 'bot', text: 'Bienvenue ! Avant de commencer, peux-tu me donner quelques infos ? Quel est ton revenu mensuel ?' }]);
        setQuestionStep(1);
      }
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    router.push('/login');
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
        botReply = `Merci ! Et combien dépenses-tu en moyenne par mois ?`;
        setQuestionStep(2);
      } else {
        botReply = `Merci d'indiquer un chiffre pour ton revenu mensuel.`;
      }
    } else if (questionStep === 2) {
      const depensesMois = parseInt(message);
      if (!isNaN(depensesMois)) {
        await updateUserData({ depensesMois });
        botReply = `Parfait. Enfin, quel est ton objectif d'épargne mensuel ?`;
        setQuestionStep(3);
      } else {
        botReply = `Merci d'indiquer un chiffre pour tes dépenses.`;
      }
    } else if (questionStep === 3) {
      const epargneObjectif = parseInt(message);
      if (!isNaN(epargneObjectif)) {
        await updateUserData({ epargneObjectif });
        botReply = `Merci ! Tout est prêt, tu peux maintenant discuter librement avec ton assistant 💬`;
        setQuestionStep(0);
      } else {
        botReply = `Merci d'indiquer un chiffre pour ton objectif d'épargne.`;
      }
    } else {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, email })
      });
      const data = await res.json();
      botReply = data.response;
    }

    setHistory([...history, { role: 'user', text: message }, { role: 'bot', text: botReply }]);
    setMessage('');
  };

  return (
    <div style={{ padding: 30 }}>
      <h1>🤖 FinAIssist</h1>
      {email && (
        <div style={{ marginBottom: 10 }}>
          <span>Connecté en tant que : <strong>{email}</strong></span>
          <button onClick={handleLogout} style={{ marginLeft: 10 }}>Se déconnecter</button>
        </div>
      )}

      <div style={{ maxHeight: 300, overflowY: 'scroll', border: '1px solid #ccc', marginBottom: 10, padding: 10 }}>
        {history.map((msg, index) => (
          <div key={index} style={{ color: msg.role === 'user' ? 'blue' : 'green' }}>
            <strong>{msg.role}:</strong> {msg.text}
          </div>
        ))}
      </div>

      <input
        type="text"
        placeholder="Écris ici..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        style={{ width: '300px', marginRight: 10 }}
      />
      <button onClick={sendMessage}>Envoyer</button>
    </div>
  );
}