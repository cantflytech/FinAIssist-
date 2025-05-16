'use client';

import { useState } from 'react';

export default function ChatPage() {
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState([]);

  const sendMessage = async () => {
    if (!message) return;

    const email = localStorage.getItem('userEmail');
  console.log(email)
const res = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message, email }),
});


    const data = await res.json();

    setHistory([...history, { role: 'user', text: message }, { role: 'bot', text: data.response }]);
    setMessage('');
  };

  return (
    <div style={{ padding: 30 }}>
      <h1>🤖 FinAIssist</h1>
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
