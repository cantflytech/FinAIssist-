// 📁 /pages/api/chat.js

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const filePath = join(process.cwd(), 'data', 'users.json');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const { message, email } = req.body;

  if (!email || !message) {
    return res.status(400).json({ message: 'Email et message requis' });
  }

  // Lire les données utilisateur existantes
  const users = JSON.parse(readFileSync(filePath, 'utf8'));
  const user = users.find((u) => u.email === email);

  if (!user) {
    return res.status(404).json({ message: 'Utilisateur non trouvé' });
  }

  // Créer le prompt intelligent avec état utilisateur
const prompt = `
Tu es une IA financière.

Voici le profil utilisateur :
${JSON.stringify(user, null, 2)}

L'utilisateur dit : "${message}"

Ta mission :
1. Réponds naturellement à la question ou demande de l’utilisateur (clé : response)
2. Si l’utilisateur demande un conseil financier, ou si tu détectes une opportunité d’en proposer un :
   - Donne un conseil pertinent dans la réponse (response)
   - Basé sur ses données : revenu, dépenses, objectifs, projets
3. Si des modifications sont à faire, renvoie aussi un updatedUser (sinon null)

Tu peux dire par exemple :
- “Tu pourrais réduire tes dépenses ce mois-ci pour atteindre ton objectif.”
- “Tu dépenses 85% de ton revenu, essaie de viser 75% pour épargner plus.”
- “Tu peux ouvrir un livret A pour ton projet voyage.”

Si l'utilisateur veut créer un projet (ex : “projet vacances de 500 €”) :
- Modifie le champ "projets" dans updatedUser
- Chaque projet est un objet dans "projets", sans aucun autre champ
  Exemple :
  "projets": {
    "vacances": {
      "objectif": 500,
      "epargne": 0
    }
  }
Toujours renvoyer un JSON comme ceci :
{
  "response": "phrase complète avec conseil ou réponse",
  "updatedUser": { ... } ou null
}

IMPORTANT :
- Ne renvoie rien d’autre que ce JSON (pas d’explication ou introduction)
- Si aucune mise à jour, laisse updatedUser = null
`;


  // Envoi à Ollama (LLaMA 3)
  const llamaRes = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama3:latest',
      prompt,
      stream: false
    })
  });

  if (!llamaRes.ok) {
    return res.status(500).json({ message: 'Erreur IA' });
  }

  const data = await llamaRes.json();
  let parsed;

  try {
    parsed = JSON.parse(data.response.trim());
  } catch (e) {
    console.error('Erreur de parsing JSON IA:', data.response);
    return res.status(500).json({ message: 'Réponse IA non valide' });
  }

  // Mise à jour si nécessaire
  if (parsed.updatedUser) {
    const index = users.findIndex((u) => u.email === email);
    users[index] = parsed.updatedUser;
    writeFileSync(filePath, JSON.stringify(users, null, 2));
  }

  return res.status(200).json({ response: parsed.response });
}