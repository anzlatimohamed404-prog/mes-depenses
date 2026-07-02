const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Utilisateur } = require('../models/index');

// Création d'un nouveau compte utilisateur.
exports.register = async (req, res) => {
  try {
    const { nom, email, mot_de_passe } = req.body;

    const existe = await Utilisateur.findOne({ where: { email } });
    if (existe) {
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }

    const hash = await bcrypt.hash(mot_de_passe, 10);
    const utilisateur = await Utilisateur.create({ nom, email, mot_de_passe: hash });

    res.status(201).json({ message: 'Compte créé avec succès', utilisateur });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

// Connexion utilisateur avec vérification du mot de passe et génération d'un token JWT.
exports.login = async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;

    const utilisateur = await Utilisateur.findOne({ where: { email } });
    if (!utilisateur) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    const valide = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);
    if (!valide) {
      const bcrypt = require('bcryptjs');
      const jwt = require('jsonwebtoken');
      const { Utilisateur } = require('../models/index');

      /**
       * Controller d'authentification et de gestion du profil utilisateur.
       *
       * Principales responsabilités :
       * - Créer un compte utilisateur (hash du mot de passe avant sauvegarde)
       * - Authentifier un utilisateur et renvoyer un token JWT
       * - Renvoyer et mettre à jour le profil de l'utilisateur connecté
       * - Permettre le changement de mot de passe (vérification de l'ancien)
       *
       * Remarques de sécurité :
       * - Les mots de passe sont hachés avec bcrypt (10 rounds) avant stockage.
       * - Le token JWT contient l'ID utilisateur et le nom; il est signé avec la clé
       *   définie dans `process.env.JWT_SECRET` et expirera (ici 7 jours).
       */

      // --- Enregistrement d'un nouvel utilisateur -------------------------------------------------
      exports.register = async (req, res) => {
        // Récupère les champs attendus depuis le corps de la requête.
        // On s'attend à : { nom, email, mot_de_passe }
        try {
          const { nom, email, mot_de_passe } = req.body;

          // Vérifier que l'email n'est pas déjà pris pour éviter la duplication.
          const existe = await Utilisateur.findOne({ where: { email } });
          if (existe) {
            // 400 : mauvaise requête (email déjà utilisé).
            return res.status(400).json({ message: 'Email déjà utilisé' });
          }

          // Hacher le mot de passe avant de le stocker dans la base.
          // Le facteur 10 est un compromis raisonnable entre sécurité et performance.
          const hash = await bcrypt.hash(mot_de_passe, 10);

          // Création de l'enregistrement utilisateur avec le mot de passe haché.
          const utilisateur = await Utilisateur.create({ nom, email, mot_de_passe: hash });

          // Retourner l'utilisateur créé (ici on renvoie tout l'objet, mais en prod
          // on pourrait exclure certains champs sensibles).
          res.status(201).json({ message: 'Compte créé avec succès', utilisateur });
        } catch (error) {
          // 500 : erreur serveur non attendue.
          res.status(500).json({ message: 'Erreur serveur', error });
        }
      };

      // --- Authentification (login) -----------------------------------------------------------------
      exports.login = async (req, res) => {
        // Attendu dans le corps : { email, mot_de_passe }
        try {
          const { email, mot_de_passe } = req.body;

          // Recherche de l'utilisateur par email.
          const utilisateur = await Utilisateur.findOne({ where: { email } });
          if (!utilisateur) {
            // 404 : l'utilisateur n'existe pas.
            return res.status(404).json({ message: 'Utilisateur introuvable' });
          }

          // Comparaison sécurisée du mot de passe envoyé avec le hash stocké.
          const valide = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);
          if (!valide) {
            // 401 : non autorisé (identifiants invalides).
            return res.status(401).json({ message: 'Mot de passe incorrect' });
          }

          // Génération du token JWT. Le payload contient des informations minimales
          // (id et nom) permettant d'identifier l'utilisateur côté serveur.
          const token = jwt.sign(
            { id: utilisateur.id, nom: utilisateur.nom },
            process.env.JWT_SECRET,
            { expiresIn: '7d' } // Durée d'expiration du token
          );

          // Retourner le token et les informations utiles du profil.
          res.json({ message: 'Connexion réussie', token, utilisateur });
        } catch (error) {
          res.status(500).json({ message: 'Erreur serveur', error });
        }
      };

      // --- Récupération du profil de l'utilisateur connecté ----------------------------------------
      exports.getProfile = async (req, res) => {
        try {
          // `req.utilisateur` est défini par le middleware d'authentification (auth.js)
          // et contient le payload décodé du JWT (ex : { id, nom }).
          const utilisateur = await Utilisateur.findByPk(req.utilisateur.id, {
            // Exclure le mot de passe de la réponse pour des raisons de sécurité.
            attributes: { exclude: ['mot_de_passe'] }
          });
          if (!utilisateur) {
            return res.status(404).json({ message: 'Utilisateur introuvable' });
          }
          res.json(utilisateur);
        } catch (error) {
          res.status(500).json({ message: 'Erreur serveur', error });
        }
      };

      // --- Mise à jour du profil --------------------------------------------------------------------
      exports.updateProfile = async (req, res) => {
        try {
          const { nom, email } = req.body;

          // Récupération de l'utilisateur courant via l'ID présent dans le token.
          const utilisateur = await Utilisateur.findByPk(req.utilisateur.id);
          if (!utilisateur) {
            return res.status(404).json({ message: 'Utilisateur introuvable' });
          }

          // Si l'utilisateur souhaite changer d'email, vérifier que le nouvel email
          // n'est pas déjà utilisé par un autre compte (garantir l'unicité).
          if (email && email !== utilisateur.email) {
            const existe = await Utilisateur.findOne({ where: { email } });
            if (existe) {
              return res.status(400).json({ message: 'Cet email est déjà utilisé' });
            }
          }

          // Appliquer les changements uniquement si fournis (coalescing operator).
          utilisateur.nom = nom ?? utilisateur.nom;
          utilisateur.email = email ?? utilisateur.email;
          await utilisateur.save();

          // Supprimer le champ mot_de_passe de l'objet renvoyé pour ne pas l'exposer.
          const { mot_de_passe, ...sansMotDePasse } = utilisateur.toJSON();
          res.json({ message: 'Profil mis à jour', utilisateur: sansMotDePasse });
        } catch (error) {
          res.status(500).json({ message: 'Erreur serveur', error });
        }
      };

      // --- Changement de mot de passe ----------------------------------------------------------------
      exports.changePassword = async (req, res) => {
        try {
          const { ancien_mot_de_passe, nouveau_mot_de_passe } = req.body;

          // Récupération de l'utilisateur depuis le token.
          const utilisateur = await Utilisateur.findByPk(req.utilisateur.id);
          if (!utilisateur) {
            return res.status(404).json({ message: 'Utilisateur introuvable' });
          }

          // Vérifier que l'ancien mot de passe correspond bien au hash stocké.
          const valide = await bcrypt.compare(ancien_mot_de_passe, utilisateur.mot_de_passe);
          if (!valide) {
            return res.status(401).json({ message: 'Ancien mot de passe incorrect' });
          }

          // Hacher le nouveau mot de passe et l'enregistrer.
          utilisateur.mot_de_passe = await bcrypt.hash(nouveau_mot_de_passe, 10);
          await utilisateur.save();

          res.json({ message: 'Mot de passe modifié avec succès' });
        } catch (error) {
          res.status(500).json({ message: 'Erreur serveur', error });
        }
      };