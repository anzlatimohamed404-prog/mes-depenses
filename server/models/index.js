const Utilisateur = require('./Utilisateur');
const Beneficiaire = require('./Beneficiaire');
const Operation = require('./Operation');
const TauxChange = require('./TauxChange');
const Categorie = require('./Categorie');

// Définition des relations entre les modèles Sequelize.
// Un utilisateur possède plusieurs bénéficiaires, opérations, catégories et taux de change.
Utilisateur.hasMany(Beneficiaire, { foreignKey: 'utilisateur_id' });
Beneficiaire.belongsTo(Utilisateur, { foreignKey: 'utilisateur_id' });

Utilisateur.hasMany(Operation, { foreignKey: 'utilisateur_id' });
Operation.belongsTo(Utilisateur, { foreignKey: 'utilisateur_id' });

Beneficiaire.hasMany(Operation, { foreignKey: 'beneficiaire_id' });
Operation.belongsTo(Beneficiaire, { foreignKey: 'beneficiaire_id', constraints: false });

Utilisateur.hasMany(TauxChange, { foreignKey: 'utilisateur_id' });
TauxChange.belongsTo(Utilisateur, { foreignKey: 'utilisateur_id' });

Utilisateur.hasMany(Categorie, { foreignKey: 'utilisateur_id' });
Categorie.belongsTo(Utilisateur, { foreignKey: 'utilisateur_id' });

module.exports = { Utilisateur, Beneficiaire, Operation, TauxChange, Categorie };