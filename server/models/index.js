const Utilisateur = require('./Utilisateur');
const Beneficiaire = require('./Beneficiaire');
const Operation = require('./Operation');
const TauxChange = require('./TauxChange');

Utilisateur.hasMany(Beneficiaire, { foreignKey: 'utilisateur_id' });
Beneficiaire.belongsTo(Utilisateur, { foreignKey: 'utilisateur_id' });

Utilisateur.hasMany(Operation, { foreignKey: 'utilisateur_id' });
Operation.belongsTo(Utilisateur, { foreignKey: 'utilisateur_id' });

Beneficiaire.hasMany(Operation, { foreignKey: 'beneficiaire_id' });
Operation.belongsTo(Beneficiaire, { foreignKey: 'beneficiaire_id' });

Utilisateur.hasMany(TauxChange, { foreignKey: 'utilisateur_id' });
TauxChange.belongsTo(Utilisateur, { foreignKey: 'utilisateur_id' });

module.exports = { Utilisateur, Beneficiaire, Operation, TauxChange };