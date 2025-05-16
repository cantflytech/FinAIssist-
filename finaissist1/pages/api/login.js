import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const filePath = join(process.cwd(), 'data', 'users.json');

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ message: 'Champs requis' });
  }

  if (!existsSync(filePath)) {
    return res.status(404).json({ message: 'Fichier utilisateur introuvable' });
  }

  const users = JSON.parse(readFileSync(filePath, 'utf8'));
  const found = users.find((u) => u.email === email && u.code === code);

  if (!found) {
    return res.status(401).json({ message: 'Email ou code incorrect' });
  }

  return res.status(200).json({ message: 'Connexion réussie' });
}