import { readJson, pathExists } from 'fs-extra';
import { join } from 'path';

const filePath = join(process.cwd(), 'data', 'users.json');

export async function POST(req) {
  const { email, code } = await req.json();

  if (!email || !code) {
    return new Response(JSON.stringify({ message: 'Champs manquants' }), {
      status: 400,
    });
  }

  if (!(await pathExists(filePath))) {
    return new Response(JSON.stringify({ message: 'Aucun utilisateur trouvé' }), {
      status: 404,
    });
  }

  const users = await readJson(filePath);
  const user = users.find((u) => u.email === email && u.code === code);

  if (!user) {
    return new Response(JSON.stringify({ message: 'Identifiants incorrects' }), {
      status: 401,
    });
  }

  return new Response(JSON.stringify({ message: 'Connexion réussie' }), {
    status: 200,
  });
}
