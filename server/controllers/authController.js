const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Utilisateur } = require('../models/index');

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

exports.login = async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;

    const utilisateur = await Utilisateur.findOne({ where: { email } });
    if (!utilisateur) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    const valide = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);
    if (!valide) {
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }

    const token = jwt.sign(
      { id: utilisateur.id, nom: utilisateur.nom },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ message: 'Connexion réussie', token, utilisateur });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findByPk(req.utilisateur.id, {
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

exports.updateProfile = async (req, res) => {
  try {
    const { nom, email } = req.body;
    const utilisateur = await Utilisateur.findByPk(req.utilisateur.id);
    if (!utilisateur) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    if (email && email !== utilisateur.email) {
      const existe = await Utilisateur.findOne({ where: { email } });
      if (existe) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé' });
      }
    }

    utilisateur.nom = nom ?? utilisateur.nom;
    utilisateur.email = email ?? utilisateur.email;
    await utilisateur.save();

    const { mot_de_passe, ...sansMotDePasse } = utilisateur.toJSON();
    res.json({ message: 'Profil mis à jour', utilisateur: sansMotDePasse });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { ancien_mot_de_passe, nouveau_mot_de_passe } = req.body;
    const utilisateur = await Utilisateur.findByPk(req.utilisateur.id);
    if (!utilisateur) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    const valide = await bcrypt.compare(ancien_mot_de_passe, utilisateur.mot_de_passe);
    if (!valide) {
      return res.status(401).json({ message: 'Ancien mot de passe incorrect' });
    }

    utilisateur.mot_de_passe = await bcrypt.hash(nouveau_mot_de_passe, 10);
    await utilisateur.save();

    res.json({ message: 'Mot de passe modifié avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};