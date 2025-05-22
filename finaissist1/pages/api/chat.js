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
3. Si des modifications sont à faire (ex : création d’un projet, dépense ajoutée), retourne un objet utilisateur mis à jour dans updatedUser :
   - ATTENTION : always keep all original user data (email, code, revenu, etc.)
   - Ne modifie QUE ce qui est nécessaire (ex : ajoute un projet dans “projets” sans supprimer les anciens)

Si l’utilisateur mentionne une dépense ("j’ai dépensé 50€", "80 euros pour un resto", etc.) :
- Ajoute le montant détecté à la clé "depensesVariables"
- Calcule directement le total et donne la **valeur numérique finale**
- Exemple : si depensesVariables = 200 et l'utilisateur dit "j’ai dépensé 100 €", le champ doit être :
  "depensesVariables": 300
- Ne jamais écrire "200 + 100" — toujours le chiffre déjà additionné

Si l'utilisateur veut créer un projet (ex : “projet vacances de 500 €”) :
- Ajoute l’entrée dans "projets" sans toucher aux autres données
  Exemple :
  "projets": {
    (projets existants),
    "vacances": {
      "objectif": 500,
      "epargne": 0
    }
  }

Toujours renvoyer un JSON strict comme ceci :
{
  "response": "texte naturel pour l'utilisateur",
  "updatedUser": { ... } ou null
}

IMPORTANT :
- Ne renvoie rien d’autre que ce JSON (pas de phrases autour)
- updatedUser doit inclure toutes les données existantes, modifiées si nécessaire
Tu dois renvoyer STRICTEMENT ce JSON. Aucune explication avant ou après.
Ne commence jamais par une phrase, un retour à la ligne ou un commentaire. Juste le JSON.
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