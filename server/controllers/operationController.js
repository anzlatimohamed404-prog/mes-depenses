const { Operation, Beneficiaire } = require('../models/index');

exports.getAll = async (req, res) => {
  try {
    const { beneficiaire_id, annee } = req.query;
    const where = { utilisateur_id: req.utilisateur.id };

    if (beneficiaire_id) where.beneficiaire_id = beneficiaire_id;
    if (annee) {
      const { Op } = require('sequelize');
      where.date_envoi = {
        [Op.between]: [`${annee}-01-01`, `${annee}-12-31`]
      };
    }

    const operations = await Operation.findAll({
      where,
      include: [{ model: Beneficiaire, attributes: ['nom', 'pays', 'devise'] }],
      order: [['date_envoi', 'DESC']]
    });
    res.json(operations);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

exports.create = async (req, res) => {
  try {
    const { montant_eur, montant_devise, devise, frais, date_envoi, note, beneficiaire_id } = req.body;
    const operation = await Operation.create({
      montant_eur, montant_devise, devise, frais, date_envoi, note,
      beneficiaire_id,
      utilisateur_id: req.utilisateur.id
    });
    res.status(201).json(operation);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

exports.remove = async (req, res) => {
  try {
    const operation = await Operation.findOne({
      where: { id: req.params.id, utilisateur_id: req.utilisateur.id }
    });
    if (!operation) return res.status(404).json({ message: 'Opération introuvable' });
    await operation.destroy();
    res.json({ message: 'Opération supprimée' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

exports.getStats = async (req, res) => {
  try {
    const { sequelize } = require('../config/db');
    const operations = await Operation.findAll({
      where: { utilisateur_id: req.utilisateur.id },
      include: [{ model: Beneficiaire, attributes: ['nom', 'pays', 'devise'] }]
    });

    const total = operations.reduce((s, o) => s + o.montant_eur, 0);
    const now = new Date();
    const mois = operations.filter(o => {
      const d = new Date(o.date_envoi);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).reduce((s, o) => s + o.montant_eur, 0);

    res.json({ total, mois, nb_operations: operations.length });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};