const { Beneficiaire } = require('../models/index');

exports.getAll = async (req, res) => {
  try {
    const beneficiaires = await Beneficiaire.findAll({
      where: { utilisateur_id: req.utilisateur.id }
    });
    res.json(beneficiaires);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

exports.create = async (req, res) => {
  try {
    const { nom, pays, devise, relation } = req.body;
    const beneficiaire = await Beneficiaire.create({
      nom, pays, devise, relation,
      utilisateur_id: req.utilisateur.id
    });
    res.status(201).json(beneficiaire);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

exports.update = async (req, res) => {
  try {
    const beneficiaire = await Beneficiaire.findOne({
      where: { id: req.params.id, utilisateur_id: req.utilisateur.id }
    });
    if (!beneficiaire) return res.status(404).json({ message: 'Bénéficiaire introuvable' });
    await beneficiaire.update(req.body);
    res.json(beneficiaire);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

exports.remove = async (req, res) => {
  try {
    const beneficiaire = await Beneficiaire.findOne({
      where: { id: req.params.id, utilisateur_id: req.utilisateur.id }
    });
    if (!beneficiaire) return res.status(404).json({ message: 'Bénéficiaire introuvable' });
    await beneficiaire.destroy();
    res.json({ message: 'Bénéficiaire supprimé' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};