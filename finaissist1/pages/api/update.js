// 📁 /pages/api/update.js

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const filePath = join(process.cwd(), 'data', 'users.json');

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const { email, ...updates } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email requis' });
  }

  if (!existsSync(filePath)) {
    return res.status(404).json({ message: 'Base utilisateur introuvable' });
  }

  const users = JSON.parse(readFileSync(filePath, 'utf8'));
  const index = users.findIndex((u) => u.email === email);

  if (index === -1) {
    return res.status(404).json({ message: 'Utilisateur non trouvé' });
  }

  users[index] = { ...users[index], ...updates };
  writeFileSync(filePath, JSON.stringify(users, null, 2));

  return res.status(200).json({ message: 'Données mises à jour' });
}
