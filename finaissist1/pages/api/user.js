// 📁 /pages/api/user.js

import { readFileSync } from 'fs';
import { join } from 'path';

const filePath = join(process.cwd(), 'data', 'users.json');

export default function handler(req, res) {
  const email = req.query.email;

  if (!email) {
    return res.status(400).json({ message: 'Email requis' });
  }

  const users = JSON.parse(readFileSync(filePath, 'utf8'));
  const user = users.find((u) => u.email === email);

  if (!user) {
    return res.status(404).json({ message: 'Utilisateur non trouvé' });
  }

  return res.status(200).json({ user });
}
