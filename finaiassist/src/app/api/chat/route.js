export async function POST(req) {
  const { message, email } = await req.json();

  console.log(email)
const prompt = `
Tu es une IA qui ne répond qu’en JSON. Pas de phrases, pas d’intro.

Message utilisateur : "${message}"
Email : ${email}

Renvoie un JSON strict :
{
  "response": "ta réponse naturelle à l'utilisateur",
  "update": {
    "email": "${email}",
    "projet": "nom_du_projet",
    "montant": montant
  }
}
Si aucune mise à jour, renvoie : { "response": "...", "update": null }
`;

console.log("Réponse brute de LLaMA3 :", cleanText);

  const llamaRes = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: "llama3:latest",
      prompt,
      stream: false,
    }),
  });

  const llamaData = await llamaRes.json();
  const cleanText = llamaData.response.trim();

  let parsed;
  try {
    parsed = JSON.parse(cleanText);
  } catch (e) {
    return new Response(JSON.stringify({ response: "Désolé, je n'ai pas compris." }), {
      status: 200,
    });
  }

  // Si une mise à jour est demandée
  if (parsed.update) {
    await fetch('http://localhost:3000/api/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.update),
    });
  }

  return new Response(JSON.stringify({ response: parsed.response }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
