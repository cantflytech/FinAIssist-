import { readJson, writeJson, pathExists } from 'fs-extra';
import { join } from 'path';

const filePath = join(process.cwd(), 'data', 'users.json');

export async function POST(req) {
  const { email, projet, montant } = await req.json();

  if (!email || !projet || !montant) {
    return new Response(JSON.stringify({ message: 'Paramètres manquants' }), {
      status: 400,
    });
  }

  if (!(await pathExists(filePath))) {
    return new Response(JSON.stringify({ message: 'Fichier manquant' }), {
      status: 404,
    });
  }

  const users = await readJson(filePath);
  const userIndex = users.findIndex((u) => u.email === email);

  if (userIndex === -1) {
    return new Response(JSON.stringify({ message: 'Utilisateur introuvable' }), {
      status: 404,
    });
  }

  const user = users[userIndex];
  const current = user.projets?.[projet]?.epargne || 0;

  if (!user.projets?.[projet]) {
    user.projets[projet] = { objectif: 1000, epargne: 0 }; // valeur par défaut
  }

  user.projets[projet].epargne = current + montant;
  users[userIndex] = user;

  await writeJson(filePath, users, { spaces: 2 });

  return new Response(JSON.stringify({ message: 'Projet mis à jour' }), {
    status: 200,
  });
}
