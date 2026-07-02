const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Utilisateur } = require('../models');
const { sequelize } = require('../config/db');

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || '');

const getJwtSecret = () => process.env.JWT_SECRET || 'dev_secret_change_me';

// =======================
// Inscription
// =======================
exports.register = async (req, res) => {
  try {
    // Lire les données envoyées par le client.
    const { nom, email, mot_de_passe } = req.body;
    const nomNormalise = (nom || '').trim();
    const emailNormalise = (email || '').trim().toLowerCase();

    if (!nomNormalise || !emailNormalise || !mot_de_passe) {
      return res.status(400).json({
        message: 'Nom, email et mot de passe sont requis'
      });
    }

    if (!isValidEmail(emailNormalise)) {
      return res.status(400).json({
        message: 'Format d’email invalide'
      });
    }

    if (String(mot_de_passe).length < 6) {
      return res.status(400).json({
        message: 'Le mot de passe doit contenir au moins 6 caractères'
      });
    }

    // Vérifier si l'email existe déjà en base.
    const existe = await Utilisateur.findOne({ where: { email: emailNormalise } });

    if (existe) {
      return res.status(400).json({
        message: 'Email déjà utilisé'
      });
    }

    // Hacher le mot de passe avec bcrypt pour le sécuriser.
    const hash = await bcrypt.hash(mot_de_passe, 10);

    // Créer l'utilisateur avec le mot de passe haché.
    const utilisateur = await Utilisateur.create({
      nom: nomNormalise,
      email: emailNormalise,
      mot_de_passe: hash
    });

    // Générer un token JWT immédiatement après la création du compte.
    const token = jwt.sign(
      {
        id: utilisateur.id,
        nom: utilisateur.nom
      },
      getJwtSecret(),
      {
        expiresIn: '7d'
      }
    );

    // Ne jamais renvoyer le mot de passe dans la réponse.
    const { mot_de_passe: _password, ...profil } = utilisateur.toJSON();

    res.status(201).json({
      message: 'Compte créé avec succès',
      token,
      utilisateur: profil
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Erreur serveur'
    });
  }
};

// =======================
// Connexion
// =======================
exports.login = async (req, res) => {
  try {
    // Lire les identifiants envoyés par le client.
    const { email, mot_de_passe } = req.body;
    const emailNormalise = (email || '').trim().toLowerCase();

    if (!emailNormalise || !mot_de_passe) {
      return res.status(400).json({
        message: 'Email et mot de passe sont requis'
      });
    }

    if (!isValidEmail(emailNormalise)) {
      return res.status(400).json({
        message: 'Format d’email invalide'
      });
    }

    // Chercher l'utilisateur par email dans la base.
    const utilisateur = await Utilisateur.findOne({
      where: { email: emailNormalise }
    });

    if (!utilisateur) {
      return res.status(404).json({
        message: 'Utilisateur introuvable'
      });
    }

    // Comparer le mot de passe fourni avec le hash stocké.
    const valide = await bcrypt.compare(
      mot_de_passe,
      utilisateur.mot_de_passe
    );

    if (!valide) {
      return res.status(401).json({
        message: 'Mot de passe incorrect'
      });
    }

    // Générer un token JWT avec l'ID et le nom de l'utilisateur.
    const token = jwt.sign(
      {
        id: utilisateur.id,
        nom: utilisateur.nom
      },
      getJwtSecret(),
      {
        expiresIn: '7d'
      }
    );

    // Retourner le token et les informations publiques de l'utilisateur.
    const { mot_de_passe: _password, ...profil } = utilisateur.toJSON();

    res.json({
      message: 'Connexion réussie',
      token,
      utilisateur: profil
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Erreur serveur'
    });
  }
};

// =======================
// Profil utilisateur
// =======================
exports.getProfile = async (req, res) => {
  try {
    // `req.utilisateur` vient du middleware d'authentification.
    const utilisateur = await Utilisateur.findByPk(req.utilisateur.id, {
      attributes: {
        // Exclure le mot de passe pour ne jamais le renvoyer.
        exclude: ['mot_de_passe']
      }
    });

    if (!utilisateur) {
      return res.status(404).json({
        message: 'Utilisateur introuvable'
      });
    }

    res.json(utilisateur);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Erreur serveur'
    });
  }
};

// =======================
// Modifier le profil
// =======================
exports.updateProfile = async (req, res) => {
  try {
    // Lire les champs à mettre à jour depuis le corps de la requête.
    const { nom, email } = req.body;

    // Charger l'utilisateur actuel à partir de l'ID présent dans le token.
    const utilisateur = await Utilisateur.findByPk(req.utilisateur.id);

    if (!utilisateur) {
      return res.status(404).json({
        message: 'Utilisateur introuvable'
      });
    }

    // Si l'email change, vérifier qu'il reste unique.
    if (email && email !== utilisateur.email) {
      const existe = await Utilisateur.findOne({
        where: { email }
      });

      if (existe) {
        return res.status(400).json({
          message: 'Cet email est déjà utilisé'
        });
      }
    }

    // Mettre à jour seulement les champs fournis.
    utilisateur.nom = nom || utilisateur.nom;
    utilisateur.email = email || utilisateur.email;

    // Enregistrer les changements en base.
    await utilisateur.save();

    // Supprimer le mot de passe avant d'envoyer le profil.
    const { mot_de_passe, ...profil } = utilisateur.toJSON();

    res.json({
      message: 'Profil mis à jour',
      utilisateur: profil
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Erreur serveur'
    });
  }
};

// =======================
// Changer le mot de passe
// =======================
exports.changePassword = async (req, res) => {
  try {
    // Récupérer l'ancien et le nouveau mot de passe depuis la requête.
    const {
      ancien_mot_de_passe,
      nouveau_mot_de_passe
    } = req.body;

    // Charger l'utilisateur connecté.
    const utilisateur = await Utilisateur.findByPk(req.utilisateur.id);

    if (!utilisateur) {
      return res.status(404).json({
        message: 'Utilisateur introuvable'
      });
    }

    // Vérifier que l'ancien mot de passe correspond.
    const valide = await bcrypt.compare(
      ancien_mot_de_passe,
      utilisateur.mot_de_passe
    );

    if (!valide) {
      return res.status(401).json({
        message: 'Ancien mot de passe incorrect'
      });
    }

    // Hacher le nouveau mot de passe avant sauvegarde.
    utilisateur.mot_de_passe = await bcrypt.hash(
      nouveau_mot_de_passe,
      10
    );

    // Sauvegarder le nouveau mot de passe en base.
    await utilisateur.save();

    res.json({
      message: 'Mot de passe modifié avec succès'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Erreur serveur'
    });
  }
};