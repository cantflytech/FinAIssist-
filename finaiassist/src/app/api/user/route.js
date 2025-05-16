import { readJson, pathExists } from 'fs-extra';
import { join } from 'path';

const filePath = join(process.cwd(), 'data', 'users.json');

export async function GET(req) {
  const url = new URL(req.url);
  const email = url.searchParams.get('email');

  if (!email) {
    return new Response(JSON.stringify({ message: 'Email requis' }), {
      status: 400,
    });
  }

  if (!(await pathExists(filePath))) {
    return new Response(JSON.stringify({ message: 'Aucune donnée' }), {
      status: 404,
    });
  }

  const users = await readJson(filePath);
  const user = users.find((u) => u.email === email);

  if (!user) {
    return new Response(JSON.stringify({ message: 'Utilisateur non trouvé' }), {
      status: 404,
    });
  }

  return new Response(JSON.stringify({ user }), {
    status: 200,
  });
}