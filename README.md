# mes-depenses

Application de gestion de dépenses avec React, Express, Sequelize et MySQL.

## Installation

1. Ouvrir un terminal dans le dossier racine du projet.
2. Installer les dépendances du serveur :

   cd server
   npm install

3. Installer les dépendances du client :

   cd ../client
   npm install

4. Créer le fichier d'environnement serveur :

   cd ../server
   cp .env.example .env

5. Mettre à jour `.env` avec les informations de connexion MySQL et `JWT_SECRET`.

## Lancer l'application

- Démarrer le serveur :

  cd server
  npm start

- Démarrer le client :

  cd ../client
  npm run dev

## Notes

- Le backend écoute par défaut sur `http://localhost:5000`.
- Le frontend utilise `http://localhost:5000/api` comme base API.
- Si vous utilisez une autre base, mettez à jour `client/src/utils/axios.js`.
