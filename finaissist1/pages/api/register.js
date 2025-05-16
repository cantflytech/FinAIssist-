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
    revenu: 0,
    epargneObjectif: 0,
    depensesMois: 0,
    projets: {}
  };

  users.push(newUser);
  writeFileSync(filePath, JSON.stringify(users, null, 2));

  return res.status(200).json({ message: 'Inscription réussie' });
}
