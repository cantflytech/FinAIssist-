import { writeJson, readJson, pathExists } from 'fs-extra';
import { join } from 'path';

const filePath = join(process.cwd(), 'data', 'users.json');

export async function POST(req) {
  const body = await req.json();
  const { prenom, email, code } = body;

  if (!prenom || !email || !code) {
    return new Response(JSON.stringify({ message: 'Champs manquants' }), {
      status: 400,
    });
  }

  // Créer le dossier "data" s'il n'existe pas
  const fs = require('fs');
  const dataDir = join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }

  let users = [];
  if (await pathExists(filePath)) {
    users = await readJson(filePath);
  }

  const exists = users.find((u) => u.email === email);
  if (exists) {
    return new Response(JSON.stringify({ message: 'Utilisateur déjà inscrit' }), {
      status: 409,
    });
  }

  users.push({ prenom, email, code });
  await writeJson(filePath, users, { spaces: 2 });

  return new Response(JSON.stringify({ message: 'Inscription réussie !' }), {
    status: 200,
  });
}
