const { TauxChange } = require('../models/index');

// Récupère les taux de change enregistrés par l'utilisateur.
exports.getAll = async (req, res) => {
  try {
    const taux = await TauxChange.findAll({
      where: { utilisateur_id: req.utilisateur.id }
    });
    res.json(taux);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

// Crée un nouveau taux de change pour un pays donné.
exports.create = async (req, res) => {
  try {
    const { pays, devise, taux } = req.body;
    const tauxChange = await TauxChange.create({
      pays, devise, taux,
      utilisateur_id: req.utilisateur.id
    });
    res.status(201).json(tauxChange);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

// Met à jour un taux existant.
exports.update = async (req, res) => {
  try {
    const tauxChange = await TauxChange.findOne({
      where: { id: req.params.id, utilisateur_id: req.utilisateur.id }
    });
    if (!tauxChange) return res.status(404).json({ message: 'Taux introuvable' });
    await tauxChange.update(req.body);
    res.json(tauxChange);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

// Supprime un taux de change enregistré.
exports.remove = async (req, res) => {
  try {
    const tauxChange = await TauxChange.findOne({
      where: { id: req.params.id, utilisateur_id: req.utilisateur.id }
    });
    if (!tauxChange) return res.status(404).json({ message: 'Taux introuvable' });
    await tauxChange.destroy();
    res.json({ message: 'Taux supprimé' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

// Actualise les taux à partir d'une API externe de devises.
exports.actualiser = async (req, res) => {
  try {
    const taux = await TauxChange.findAll({ where: { utilisateur_id: req.utilisateur.id } });
    if (taux.length === 0) {
      return res.json({ message: 'Aucun taux à actualiser', updated: [] });
    }

    const response = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/eur.json');
    const data = await response.json();
    const rates = data.eur;

    const updated = [];
    for (const t of taux) {
      const devise = t.devise.toLowerCase();
      if (rates[devise]) {
        await t.update({ taux: rates[devise] });
        updated.push({ devise: t.devise, taux: rates[devise] });
      }
    }

    res.json({ message: 'Taux actualisés', updated });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'actualisation', error: error.message });
  }
};