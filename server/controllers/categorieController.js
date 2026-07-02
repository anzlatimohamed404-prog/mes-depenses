const { Categorie, Operation } = require('../models/index');

// Retourne toutes les catégories personnalisées de l'utilisateur connecté.
exports.getAll = async (req, res) => {
  try {
    const categories = await Categorie.findAll({
      where: { utilisateur_id: req.utilisateur.id }
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

// Ajoute une nouvelle catégorie personnalisée.
exports.create = async (req, res) => {
  try {
    const { nom, icone } = req.body;
    const categorie = await Categorie.create({
      nom, icone: icone || '📦',
      utilisateur_id: req.utilisateur.id
    });
    res.status(201).json(categorie);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

// Modifie le nom ou l'icône d'une catégorie existante.
exports.update = async (req, res) => {
  try {
    const categorie = await Categorie.findOne({
      where: { id: req.params.id, utilisateur_id: req.utilisateur.id }
    });
    if (!categorie) return res.status(404).json({ message: 'Catégorie introuvable' });

    const ancienNom = categorie.nom;
    await categorie.update(req.body);

    if (req.body.nom && req.body.nom !== ancienNom) {
      await Operation.update(
        { categorie: req.body.nom },
        { where: { categorie: ancienNom, utilisateur_id: req.utilisateur.id } }
      );
    }

    res.json(categorie);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

// Supprime une catégorie si elle n'est utilisée par aucune opération.
exports.remove = async (req, res) => {
  try {
    const categorie = await Categorie.findOne({
      where: { id: req.params.id, utilisateur_id: req.utilisateur.id }
    });
    if (!categorie) return res.status(404).json({ message: 'Catégorie introuvable' });

    const enUtilisation = await Operation.count({
      where: { categorie: categorie.nom, utilisateur_id: req.utilisateur.id }
    });
    if (enUtilisation > 0) {
      return res.status(400).json({ message: `Impossible de supprimer : ${enUtilisation} opération(s) utilisent cette catégorie. Fusionne-la d'abord.` });
    }

    await categorie.destroy();
    res.json({ message: 'Catégorie supprimée' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

// Fusionne deux catégories en une seule pour éviter la duplication.
exports.fusionner = async (req, res) => {
  try {
    const { categorieSourceId, categorieCibleId } = req.body;
    const source = await Categorie.findOne({ where: { id: categorieSourceId, utilisateur_id: req.utilisateur.id } });
    const cible = await Categorie.findOne({ where: { id: categorieCibleId, utilisateur_id: req.utilisateur.id } });
    if (!source || !cible) return res.status(404).json({ message: 'Catégorie introuvable' });

    await Operation.update(
      { categorie: cible.nom },
      { where: { categorie: source.nom, utilisateur_id: req.utilisateur.id } }
    );
    await source.destroy();

    res.json({ message: `Catégorie "${source.nom}" fusionnée dans "${cible.nom}"` });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};