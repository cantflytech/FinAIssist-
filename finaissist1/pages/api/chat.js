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
Tu es une intelligence artificielle spécialisée en finance personnelle.

Voici le profil utilisateur :
${JSON.stringify(user, null, 2)}

L'utilisateur dit : "${message}"

Ta mission :
1. Réponds naturellement à la question de l'utilisateur via la clé "response"

2. Si l’utilisateur demande un conseil financier, ou si tu détectes une opportunité d’en proposer un :
   - Donne un conseil pertinent dans "response"
   - Utilise les données disponibles : revenu, dépenses, projets, objectifs, produits détenus
   - Si un produit financier est pertinent (ex : livret, PER, assurance-vie), ajoute une recommandation claire dans "produitsRecommandes", exemple :
     "produitsRecommandes": {
       "assuranceVie": "Souple, accessible et fiscalement avantageuse."
     }
   - Ne jamais supprimer ou écraser les produits déjà présents dans "produitsRecommandes"

3. Si des modifications sont à faire dans "updatedUser" (ex : ajout de projet, de dépense, ou recommandation produit) :
   - Garde TOUJOURS toutes les clés déjà existantes dans l’objet utilisateur :
     - "email", "code", "revenu", "depensesFixes", "depensesVariables", "budgetMensuel", "epargneObjectifMensuel", "epargnePrecautionObjectif", "epargnePrecautionActuelle", "projets", "produitsFinanciers", "produitsRecommandes"
   - Tu ne dois jamais supprimer, écraser ou remplacer les clés suivantes :
     - "produitsFinanciers" : garde l’état exact, même si tu fais une nouvelle recommandation
     - "projets" : ajoute un projet, mais ne supprime jamais ceux existants
     - "produitsRecommandes" : ajoute des suggestions, ne supprime jamais ce qui est déjà là

   - Si tu ne modifies pas une de ces clés, ne l'inclus pas dans la réponse ou copie-la telle quelle. Ne réinitialise jamais une clé en la remplissant de false par défaut.

   - Ne retourne jamais :
     "depensesVariables": 100 + 400
     Tu dois toujours donner le résultat chiffré directement, exemple : 500

Spécifique aux projets :
- Si l'utilisateur dit par exemple “projet voiture de 10000 €”, ajoute simplement :
  "projets": {
    (anciens projets),
    "voiture": {
      "objectif": 10000,
      "epargne": 0
    }
  }
- Ne modifie jamais "depensesVariables" dans ce cas

Spécifique aux dépenses :
- Si une dépense est détectée (ex : "j’ai dépensé 50€", "100 euros pour un resto"), ajoute ce montant à "depensesVariables"
- Calcule et donne directement la somme finale. Ne retourne jamais une expression ("300 + 100"), uniquement le résultat chiffré

Format de réponse :
Tu dois toujours renvoyer un objet JSON strict :

{
  "response": "texte naturel pour l'utilisateur",
  "updatedUser": { ... } ou null
}

IMPORTANT :
- Ne renvoie rien d'autre que cet objet JSON
- Aucune phrase avant, aucun retour à la ligne ou explication en dehors de l'objet JSON
- Ne commence jamais par un texte, une introduction ou un commentaire. Uniquement l'objet JSON.
- Le champ "updatedUser" doit inclure toutes les données utilisateur déjà présentes, modifiées uniquement si nécessaire
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