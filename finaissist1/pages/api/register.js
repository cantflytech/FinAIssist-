// 📁 /pages/api/register.js

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const filePath = join(process.cwd(), 'data', 'users.json');

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const { email, code, prenom } = req.body;

  if (!email || !code || !prenom) {
    return res.status(400).json({ message: 'Champs manquants' });
  }

  const users = existsSync(filePath)
    ? JSON.parse(readFileSync(filePath, 'utf8'))
    : [];

  const alreadyExists = users.find((u) => u.email === email);
  if (alreadyExists) {
    return res.status(409).json({ message: 'Utilisateur déjà inscrit' });
  }
const newUser = {
  email,
  code,
  prenom,

  // 💸 Données de base
  revenu: 0,                        // Revenu mensuel net
  depensesFixes: 0,                // Charges fixes (loyer, abonnements...)
  depensesVariables: 0,           // Courses, sorties, transports...

  // 📊 Budget global
  budgetMensuel: 0,               // Calculé : revenu - dépenses fixes (optionnel si on le déduit à l'affichage)

  // 🎯 Objectif d'épargne mensuel
  epargneObjectifMensuel: 0,      // Ex: 10% du revenu


  // 🛡️ Épargne de précaution
  epargnePrecautionObjectif: 0,   // Ex: dépense moyenne × 6 mois
  epargnePrecautionActuelle: 0,   // Ce que l'utilisateur a déjà mis de côté

  // 🧳 Projets personnalisés
  projets: {
    // exemple : voyage: { objectif: 1000, epargne: 100 }
  }
};


  users.push(newUser);
  writeFileSync(filePath, JSON.stringify(users, null, 2));

  return res.status(200).json({ message: 'Inscription réussie' });
}
