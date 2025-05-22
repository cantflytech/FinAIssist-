# FinAIssist

FinAIssist est un assistant financier intelligent qui aide les utilisateurs à gérer leur budget, construire leur épargne et découvrir des produits financiers pertinents.  
Il s’appuie sur une IA locale via **Ollama** (modèles LLM comme Mistral ou LLaMA) et une interface Next.js moderne.

---

## ⚙️ Technologies utilisées

| Technologie       | Description                                      |
|-------------------|--------------------------------------------------|
| **Next.js (Pages)** | Frontend + Backend intégré                     |
| **React**         | Interface utilisateur dynamique                  |
| **Tailwind CSS**  | Styling rapide, responsive et personnalisable    |
| **Ollama**        | Serveur LLM local (open-source, offline-friendly)|
| **API Routes**    | Backend serverless interne (`/api/...`)          |
| **LocalStorage**  | Stockage local des messages & sessions           |

---

## ✨ Fonctionnalités

- Système de chatbot intelligent avec historique
- Onboarding utilisateur interactif (revenu, budget, projets)
- Recommandations personnalisées de produits financiers
- Gestion automatique de projets d’épargne (voiture, vacances, etc.)
- Calcul en temps réel :
  - Budget disponible
  - Objectif d’épargne
  - Épargne de précaution
- Dashboard clair avec graphiques et pyramide produits

---

## 📂 Structure du projet
/pages
├─ api/
│ ├─ chat.js # Dialogue IA (Ollama)
│ ├─ user.js # Lecture données utilisateur
│ ├─ update.js # Mise à jour partielle du profil
├─ index.js # Page principale - Chatbot
├─ dashboard.js # Vue synthèse utilisateur
├─ login.js # Connexion
├─ register.js # Enregistrement
/styles # Fichiers CSS / Tailwind
/public # Assets publics

---

## 🚀 Lancer le projet

### Prérequis

- Node.js ≥ 16
- [Ollama installé](https://ollama.com/)
- Un modèle lancé localement :  
  Exemple : `ollama run mistral`

### Installation

`` 
git clone https://github.com/votre-orga/finaissist.git
cd finaissist
npm install
npm run dev
`` 

Application disponible sur http://localhost:3000


---

## 🔁 Flux IA (Ollama)
L'utilisateur débute la conversation

L’IA demande les infos essentielles :
-Revenu mensuel
-Produits financiers possédés
-Dépenses fixes
-Objectif d’épargne

Chaque réponse peut entraîner :
-Un calcul automatique
-Une mise à jour de données
-Une recommandation produit

L’IA répond avec un JSON strict du type :

``
{
  "response": "Voici ce que je te recommande...",
  "updatedUser": { ... }
}``


###⚠️ Le prompt est strictement conçu pour :
-Ne jamais effacer les données utilisateur
-Ajouter sans écraser : projets, produits, recommandations
-Calculer et renvoyer uniquement des valeurs numériques



