# mes-depenses

Application de gestion de dépenses avec React, Express, Sequelize et MySQL.

## Fonctionnalités principales

- Authentification avec email et mot de passe
- Tableau de bord avec résumé rapide
- Gestion des bénéficiaires et opérations
- Filtres par bénéficiaire et par année
- Feedback utilisateur immédiat sur les actions importantes

## Installation

1. Ouvrir un terminal dans le dossier racine du projet.
2. Installer les dépendances du serveur :

   cd server
   npm install

3. Installer les dépendances du client :

   cd ../client
   npm install

4. Créer les fichiers d’environnement :

   cd ../server
   cp .env.example .env

   cd ../client
   cp .env.example .env

5. Mettre à jour les fichiers `.env` avec les informations de connexion MySQL, la clé JWT et l’URL de l’API si nécessaire.

## Lancer l'application

- Démarrer le serveur :

  cd server
  npm start

- Démarrer le client :

  cd ../client
  npm run dev

## Améliorations prévues

- Ajout d’un vrai système de mot de passe oublié
- Vérifications plus fines sur les rôles et permissions
- Statistiques graphiques plus avancées
- Tests automatisés sur l’authentification et les opérations

## Notes

- Le backend écoute par défaut sur `http://localhost:5000`.
- Le frontend utilise `http://localhost:5000/api` comme base API.
- Si vous utilisez une autre base, mettez à jour `client/src/utils/axios.js`.
