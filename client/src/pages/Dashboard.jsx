// Importation du hook useEffect de React pour exécuter du code lors du chargement du composant
import { useEffect } from 'react';

// Importation du contexte global de l'application
import { useApp } from '../context/AppContext';

// Importation du composant Link pour naviguer entre les pages
import { Link } from 'react-router-dom';

// Déclaration du composant Dashboard
const Dashboard = () => {

  // Récupération des données et des fonctions depuis le contexte
  const {
    stats,
    operations,
    beneficiaires,
    fetchStats,
    fetchOperations
  } = useApp();

  // Exécution du code une seule fois au chargement du composant
  useEffect(() => {

    // Récupération des statistiques
    fetchStats();

    // Récupération des opérations
    fetchOperations();

  }, []);

  // Interface graphique du tableau de bord
  return (

    // Conteneur principal
    <div style={styles.container}>

      {/* Titre principal de la page */}
      <h1 style={styles.title}>
        Tableau de bord
      </h1>

      {/* Grille contenant les différentes cartes statistiques */}
      <div className="dashboard-grid">

        {/* Carte affichant le montant total dépensé */}
        <div style={styles.card}>

          {/* Libellé de la statistique */}
          <p style={styles.label}>
            Total Dépensé
          </p>

          {/* Valeur totale formatée avec deux décimales */}
          <p style={styles.value}>
            {stats.total?.toFixed(2)} €
          </p>

        </div>

        {/* Carte affichant le montant dépensé durant le mois courant */}
        <div style={styles.card}>

          <p style={styles.label}>
            Ce mois-ci
          </p>

          <p style={styles.value}>
            {stats.mois?.toFixed(2)} €
          </p>

        </div>

        {/* Carte affichant le nombre total d'opérations */}
        <div style={styles.card}>

          <p style={styles.label}>
            Opérations
          </p>

          <p style={styles.value}>
            {stats.nb_operations}
          </p>

        </div>

        {/* Carte affichant le nombre total de bénéficiaires */}
        <div style={styles.card}>

          <p style={styles.label}>
            Bénéficiaires
          </p>

          <p style={styles.value}>
            {beneficiaires.length}
          </p>

        </div>

      </div>

      {/* Section affichant les dernières opérations */}
      <div style={styles.section}>

        {/* En-tête de la section */}
        <div style={styles.sectionHeader}>

          {/* Titre de la section */}
          <h2 style={styles.sectionTitle}>
            Dernières opérations
          </h2>

          {/* Lien permettant d'accéder à toutes les opérations */}
          <Link
            to="/operations"
            style={styles.seeAll}
          >
            Voir tout
          </Link>

        </div>

        {/* Parcours des cinq premières opérations */}
        {operations.slice(0, 5).map(op => (

          // Carte représentant une opération
          <div
            key={op.id}
            style={styles.opItem}
          >

            {/* Informations du bénéficiaire */}
            <div>

              {/* Nom du bénéficiaire ou catégorie */}
              <p style={styles.opNom}>
                {op.Beneficiaire?.nom || op.categorie}
              </p>

              {/* Date d'envoi et pays du bénéficiaire */}
              <p style={styles.opDate}>
                {op.date_envoi}
                {op.Beneficiaire?.pays
                  ? ` — ${op.Beneficiaire.pays}`
                  : ''}
              </p>

              {/* Affichage de la note uniquement si elle existe */}
              {op.note && (

                <p style={styles.opNote}>
                  {op.note}
                </p>

              )}

            </div>

            {/* Informations financières */}
            <div style={styles.opRight}>

              {/* Montant envoyé en euros */}
              <p style={styles.opMontant}>
                +{op.montant_eur?.toFixed(2)} €
              </p>

              {/* Montant dans la devise du bénéficiaire */}
              {op.montant_devise && (

                <p style={styles.opDevise}>
                  {op.montant_devise?.toFixed(2)} {op.devise}
                </p>

              )}

            </div>

          </div>

        ))}

        {/* Message affiché lorsqu'aucune opération n'existe */}
        {operations.length === 0 && (

          <p style={styles.empty}>
            Aucune opération
          </p>

        )}

      </div>

    </div>

  );
};

// Déclaration des styles utilisés dans le composant
const styles = {

  // Style du conteneur principal
  container: {
    padding: '16px',
    maxWidth: '900px',
    margin: '0 auto'
  },

  // Style du titre principal
  title: {
    fontSize: '22px',
    fontWeight: '700',
    color: 'var(--primary-color)',
    marginBottom: '20px'
  },

  // Style des cartes statistiques
  card: {
    background: 'white',
    padding: '16px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },

  // Style des libellés
  label: {
    fontSize: '12px',
    color: '#888',
    marginBottom: '6px'
  },

  // Style des valeurs numériques
  value: {
    fontSize: '20px',
    fontWeight: '700',
    color: 'var(--primary-color)'
  },

  // Style de la section des opérations
  section: {
    background: 'white',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },

  // Style de l'en-tête de la section
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },

  // Style du titre de section
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333'
  },

  // Style du lien "Voir tout"
  seeAll: {
    fontSize: '13px',
    color: 'var(--primary-color)'
  },

  // Style d'une ligne d'opération
  opItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #f0f0f0'
  },

  // Style du nom du bénéficiaire
  opNom: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333'
  },

  // Style de la date
  opDate: {
    fontSize: '12px',
    color: '#888'
  },

  // Style de la note
  opNote: {
    fontSize: '12px',
    color: '#aaa'
  },

  // Style du bloc contenant les montants
  opRight: {
    textAlign: 'right',
    flexShrink: 0,
    marginLeft: '8px'
  },

  // Style du montant en euros
  opMontant: {
    fontSize: '15px',
    fontWeight: '700',
    color: 'var(--primary-color)'
  },

  // Style du montant dans la devise étrangère
  opDevise: {
    fontSize: '12px',
    color: '#888'
  },

  // Style du message lorsqu'aucune opération n'est disponible
  empty: {
    textAlign: 'center',
    color: '#aaa',
    padding: '20px'
  }

};

// Exportation du composant Dashboard afin qu'il puisse être utilisé dans l'application
export default Dashboard;