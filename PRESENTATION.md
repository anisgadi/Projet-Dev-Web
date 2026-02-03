# 🏢 Plateforme de Réservation de Salles - Présentation du Projet

## 📊 Vue d'ensemble

Ce projet est une **plateforme web complète de réservation de salles** développée avec la stack MERN (MongoDB, Express, React, Node.js). Il permet aux propriétaires de proposer des salles à la location et aux clients de les réserver facilement.

---

## ✨ Fonctionnalités Implémentées

### ✅ Système d'Authentification Complet

- Inscription avec choix du rôle (Client, Propriétaire, Admin)
- Connexion sécurisée avec JWT
- Hashage des mots de passe avec bcrypt
- Gestion de profil utilisateur
- Protection des routes selon les rôles

### ✅ Gestion des Salles

- Création, modification et suppression de salles (Propriétaires)
- Upload d'informations complètes (titre, description, capacité, prix, équipements)
- Localisation géographique avec coordonnées
- Recherche et filtrage avancés
- Affichage avec pagination
- Calcul automatique de la note moyenne

### ✅ Système de Réservation

- Réservation de salles par les clients
- Vérification automatique des conflits de dates
- Calcul automatique du prix total
- Gestion des statuts (confirmée, en attente, annulée, terminée)
- Historique des réservations
- Annulation possible par le client

### ✅ Système d'Avis

- Avis et notes par les clients (1-5 étoiles)
- Un seul avis par réservation
- Mise à jour automatique de la note moyenne
- Consultation des avis par salle
- Modification et suppression d'avis

### ✅ Tableau de Bord Propriétaire

- Gestion de toutes ses salles
- Consultation des réservations
- Vue des avis reçus
- Statistiques (réservations, revenus, notes)

### ✅ Administration

- Gestion des utilisateurs (activation/désactivation)
- Suppression d'utilisateurs
- Modération des salles
- Statistiques globales de la plateforme

---

## 🛠️ Technologies Utilisées

### Backend

- **Node.js** v18+ - Runtime JavaScript
- **Express.js** - Framework web minimaliste
- **MongoDB** - Base de données NoSQL
- **Mongoose** - ODM pour MongoDB
- **JWT** - Authentification par tokens
- **bcryptjs** - Cryptage des mots de passe
- **express-validator** - Validation des données

### Frontend

- **React** v18 - Bibliothèque UI
- **React Router** v6 - Routing côté client
- **Axios** - Client HTTP
- **React Leaflet** - Cartes interactives
- **React Toastify** - Notifications
- **date-fns** - Manipulation des dates

### Outils de Développement

- **Nodemon** - Rechargement automatique
- **ESLint** - Linting du code
- **Postman** - Tests API

---

## 📁 Structure du Projet

```
room-booking-platform/
│
├── backend/                    # API REST
│   ├── config/                 # Configuration (DB)
│   ├── controllers/            # Logique métier
│   │   ├── authController.js
│   │   ├── roomController.js
│   │   ├── bookingController.js
│   │   ├── reviewController.js
│   │   └── adminController.js
│   ├── middleware/             # Middlewares (auth, erreurs)
│   ├── models/                 # Modèles Mongoose
│   │   ├── User.js
│   │   ├── Room.js
│   │   ├── Booking.js
│   │   └── Review.js
│   ├── routes/                 # Routes API
│   ├── .env.example            # Template variables d'environnement
│   ├── package.json
│   └── server.js               # Point d'entrée
│
├── frontend/                   # Application React
│   ├── public/
│   ├── src/
│   │   ├── components/         # Composants réutilisables
│   │   ├── context/            # Context API (Auth)
│   │   ├── pages/              # Pages de l'application
│   │   ├── services/           # Services API
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
└── docs/                       # Documentation
    ├── DATABASE_SCHEMA.md      # Schéma de BDD
    ├── API_TESTS.md            # Tests API
    └── DEPLOYMENT.md           # Guide de déploiement
```

---

## 🔐 Sécurité

- ✅ Mots de passe hashés avec bcrypt (salt rounds: 10)
- ✅ Authentification JWT avec tokens sécurisés
- ✅ Protection des routes selon les rôles
- ✅ Validation des données entrantes
- ✅ Protection contre les injections NoSQL
- ✅ Vérification des permissions sur toutes les actions
- ✅ Gestion des erreurs centralisée

---

## 🎨 Interface Utilisateur

### Design Moderne

- Interface responsive (mobile, tablette, desktop)
- Design épuré avec palette de couleurs cohérente
- Animations et transitions fluides
- Notifications toast pour le feedback utilisateur
- Cards élégantes pour l'affichage des salles
- Formulaires intuitifs et validés

### Expérience Utilisateur

- Navigation intuitive
- Recherche et filtres en temps réel
- Feedback visuel sur toutes les actions
- Messages d'erreur clairs
- Loading spinners pendant les chargements

---

## 📊 Base de Données

### Collections MongoDB

1. **Users** - Utilisateurs de la plateforme
   - Clients, Propriétaires, Administrateurs
   - Informations personnelles
   - Gestion de l'authentification

2. **Rooms** - Salles disponibles
   - Informations complètes
   - Localisation géographique
   - Équipements
   - Notes et avis

3. **Bookings** - Réservations
   - Périodes de réservation
   - Statuts multiples
   - Calcul automatique des prix
   - Vérification des conflits

4. **Reviews** - Avis clients
   - Notes 1-5 étoiles
   - Commentaires
   - Lié aux réservations
   - Calcul automatique des moyennes

---

## 🚀 Installation Rapide

### Prérequis

- Node.js v14+
- MongoDB v4.4+

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Configurez .env avec vos paramètres
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm start
```

L'application sera accessible sur `http://localhost:3000`

---

## 📝 API REST

### Endpoints Principaux

#### Authentification

- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur

#### Salles

- `GET /api/rooms` - Liste des salles (avec filtres)
- `GET /api/rooms/:id` - Détails d'une salle
- `POST /api/rooms` - Créer une salle
- `PUT /api/rooms/:id` - Modifier une salle
- `DELETE /api/rooms/:id` - Supprimer une salle

#### Réservations

- `POST /api/bookings` - Créer une réservation
- `GET /api/bookings/my-bookings` - Mes réservations
- `DELETE /api/bookings/:id` - Annuler une réservation

#### Avis

- `POST /api/reviews` - Laisser un avis
- `GET /api/reviews/room/:id` - Avis d'une salle

Voir `docs/API_TESTS.md` pour la documentation complète.

---

## 📈 Fonctionnalités Avancées

### Recherche et Filtres

- Recherche textuelle (titre, ville, description)
- Filtrage par capacité minimale
- Filtrage par prix (min/max)
- Recherche géographique (proximité)
- Tri par date, prix, note

### Gestion des Réservations

- Détection automatique des conflits
- Calcul du prix selon le type (heure/jour/semaine)
- Historique complet
- Statuts multiples

### Statistiques

- Pour les propriétaires : revenus, nombre de réservations, notes
- Pour les administrateurs : statistiques globales

---

## 🔄 Améliorations Futures

- [ ] Upload d'images pour les salles
- [ ] Système de paiement en ligne (Stripe)
- [ ] Notifications par email
- [ ] Chat en temps réel
- [ ] Calendrier de disponibilité visuel
- [ ] Application mobile (React Native)
- [ ] Système de favoris
- [ ] Multi-langues (i18n)
- [ ] Export des données (PDF, Excel)

---

## 📦 Livrables

✅ Code source complet (Backend + Frontend)
✅ Documentation technique complète
✅ Schéma de base de données
✅ Guide d'installation
✅ Tests API (Postman/Thunder Client)
✅ Guide de déploiement
✅ README détaillé

---

## 🎓 Compétences Démontrées

### Backend

- ✅ Architecture REST API
- ✅ Authentification JWT
- ✅ Gestion de base de données NoSQL
- ✅ Validation et sécurité
- ✅ Gestion des erreurs
- ✅ CRUD complet
- ✅ Relations entre collections

### Frontend

- ✅ React moderne (Hooks, Context API)
- ✅ Routing avec React Router
- ✅ Gestion d'état
- ✅ Appels API avec Axios
- ✅ Formulaires contrôlés
- ✅ Design responsive
- ✅ Expérience utilisateur

### Général

- ✅ Architecture MVC
- ✅ Séparation frontend/backend
- ✅ Documentation professionnelle
- ✅ Bonnes pratiques de code
- ✅ Git et versioning

---

## 📞 Support

Pour toute question ou problème :

1. Consultez la documentation dans `/docs`
2. Vérifiez les fichiers README
3. Consultez les exemples dans `API_TESTS.md`

---

## 🏆 Conclusion

Ce projet démontre une **maîtrise complète de la stack MERN** et des **bonnes pratiques de développement web moderne**. Il est entièrement fonctionnel, sécurisé, et prêt pour une mise en production avec quelques ajustements (variables d'environnement, base de données cloud, etc.).

Le code est **propre, modulaire et bien documenté**, facilitant la maintenance et l'évolution future de la plateforme.

---

**Développé avec ❤️ - Janvier 2026**
