# 🏢 Plateforme de Réservation de Salles

Une plateforme web complète permettant aux propriétaires de proposer des salles de réunion ou d'événements à la location et aux clients de réserver ces salles.

## 📋 Table des matières

- [Fonctionnalités](#fonctionnalités)
- [Technologies utilisées](#technologies-utilisées)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [API Documentation](#api-documentation)
- [Structure du projet](#structure-du-projet)
- [Contributeurs](#contributeurs)

## ✨ Fonctionnalités

### Pour les Visiteurs

- Consultation des salles disponibles sans inscription
- Recherche et filtrage des salles
- Visualisation des détails des salles

### Pour les Clients

- Inscription et authentification
- Recherche avancée de salles (capacité, prix, localisation)
- Visualisation des salles sur une carte interactive
- Réservation de salles
- Consultation de l'historique des réservations
- Laisser des avis et commentaires

### Pour les Propriétaires

- Ajout, modification et suppression de salles
- Définition de l'emplacement via carte interactive
- Consultation des avis clients
- Statistiques : réservations, revenus, avis

### Pour les Administrateurs

- Gestion des utilisateurs (activation/désactivation)
- Modération des annonces de salles
- Supervision des avis et commentaires
- Statistiques globales de la plateforme

## 🛠️ Technologies utilisées

### Backend

- **Node.js** - Environnement d'exécution JavaScript
- **Express** - Framework web
- **MongoDB** - Base de données NoSQL
- **Mongoose** - ODM pour MongoDB
- **JWT** - Authentification par tokens
- **bcryptjs** - Hashage des mots de passe

### Frontend

- **React** - Bibliothèque UI
- **React Router** - Gestion des routes
- **Axios** - Requêtes HTTP
- **React Leaflet** - Cartes interactives
- **React Toastify** - Notifications
- **date-fns** - Manipulation des dates

## 📐 Architecture

Le projet suit une architecture MERN (MongoDB, Express, React, Node.js) avec une séparation claire entre le frontend et le backend.

```
room-booking-platform/
├── backend/           # API REST Node.js + Express
├── frontend/          # Application React
└── docs/             # Documentation
```

## 🚀 Installation

### Prérequis

- Node.js (v14 ou supérieur)
- MongoDB (v4.4 ou supérieur)
- npm ou yarn

### Installation du Backend

1. Naviguez vers le dossier backend :

```bash
cd backend
```

2. Installez les dépendances :

```bash
npm install
```

3. Créez un fichier `.env` à partir de `.env.example` :

```bash
cp .env.example .env
```

4. Configurez les variables d'environnement dans `.env` :

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/room_booking
JWT_SECRET=votre_secret_jwt_tres_securise
JWT_EXPIRE=7d
```

5. Démarrez MongoDB :

```bash
# Sur Linux/Mac
mongod

# Sur Windows
net start MongoDB
```

6. Lancez le serveur :

```bash
# Mode développement
npm run dev

# Mode production
npm start
```

Le serveur backend sera accessible sur `http://localhost:5000`

### Installation du Frontend

1. Naviguez vers le dossier frontend :

```bash
cd frontend
```

2. Installez les dépendances :

```bash
npm install
```

3. Lancez l'application React :

```bash
npm start
```

L'application frontend sera accessible sur `http://localhost:3000`

## ⚙️ Configuration

### Variables d'environnement Backend

| Variable    | Description                            | Valeur par défaut                      |
| ----------- | -------------------------------------- | -------------------------------------- |
| PORT        | Port du serveur                        | 5000                                   |
| NODE_ENV    | Environnement (development/production) | development                            |
| MONGODB_URI | URI de connexion MongoDB               | mongodb://localhost:27017/room_booking |
| JWT_SECRET  | Secret pour les tokens JWT             | (à définir)                            |
| JWT_EXPIRE  | Durée de validité des tokens           | 7d                                     |

### Configuration Frontend

Le frontend utilise un proxy pour communiquer avec le backend en développement. Dans `package.json` :

```json
"proxy": "http://localhost:5000"
```

## 📖 Utilisation

### Créer un compte

1. Cliquez sur "Inscription"
2. Remplissez le formulaire
3. Choisissez votre rôle (Client ou Propriétaire)
4. Validez

### Réserver une salle (Client)

1. Connectez-vous avec un compte client
2. Recherchez une salle via la page d'accueil
3. Cliquez sur une salle pour voir les détails
4. Remplissez le formulaire de réservation
5. Confirmez

### Ajouter une salle (Propriétaire)

1. Connectez-vous avec un compte propriétaire
2. Accédez au tableau de bord
3. Cliquez sur "Ajouter une salle"
4. Remplissez les informations
5. Validez

## 📡 API Documentation

### Authentification

#### Inscription

```http
POST /api/auth/register
Content-Type: application/json

{
  "nom": "Dupont",
  "prenom": "Jean",
  "email": "jean.dupont@email.com",
  "password": "motdepasse123",
  "role": "client",
  "telephone": "0612345678"
}
```

#### Connexion

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "jean.dupont@email.com",
  "password": "motdepasse123"
}
```

### Salles

#### Obtenir toutes les salles

```http
GET /api/rooms?search=Paris&capacite=10&prixMax=100
```

#### Obtenir une salle

```http
GET /api/rooms/:id
```

#### Créer une salle (Propriétaire)

```http
POST /api/rooms
Authorization: Bearer {token}
Content-Type: application/json

{
  "titre": "Salle de Réunion Moderne",
  "description": "Belle salle équipée",
  "capacite": 20,
  "prix": 50,
  "typePrix": "heure",
  "localisation": {
    "adresse": "123 Rue de Paris",
    "ville": "Paris",
    "codePostal": "75001",
    "coordinates": {
      "latitude": 48.8566,
      "longitude": 2.3522
    }
  },
  "equipements": ["WiFi", "Projecteur", "Tableau blanc"]
}
```

### Réservations

#### Créer une réservation (Client)

```http
POST /api/bookings
Authorization: Bearer {token}
Content-Type: application/json

{
  "salle": "salle_id",
  "dateDebut": "2024-02-01T09:00:00",
  "dateFin": "2024-02-01T17:00:00",
  "nombrePersonnes": 15
}
```

#### Obtenir mes réservations

```http
GET /api/bookings/my-bookings
Authorization: Bearer {token}
```

Pour plus de détails, consultez la [documentation API complète](./docs/API.md).

## 📁 Structure du projet

```
room-booking-platform/
│
├── backend/
│   ├── config/
│   │   └── db.js              # Configuration MongoDB
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── roomController.js
│   │   ├── bookingController.js
│   │   ├── reviewController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── auth.js            # Middleware JWT
│   │   └── error.js           # Gestion erreurs
│   ├── models/
│   │   ├── User.js
│   │   ├── Room.js
│   │   ├── Booking.js
│   │   └── Review.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── rooms.js
│   │   ├── bookings.js
│   │   ├── reviews.js
│   │   └── admin.js
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── server.js              # Point d'entrée
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   └── PrivateRoute.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── Home.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── RoomDetails.js
│   │   │   ├── MyBookings.js
│   │   │   ├── OwnerDashboard.js
│   │   │   └── AdminDashboard.js
│   │   ├── services/
│   │   │   ├── roomService.js
│   │   │   └── bookingService.js
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   └── README.md
│
└── docs/
    ├── API.md                 # Documentation API
    ├── DATABASE_SCHEMA.md     # Schéma de BDD
    └── INSTALLATION.md        # Guide d'installation
```

## 🔐 Sécurité

- Mots de passe hashés avec bcrypt
- Authentification par JWT
- Protection des routes sensibles
- Validation des données entrantes
- Protection contre les injections

## 🎯 Roadmap

- [ ] Système de paiement intégré
- [ ] Notifications par email
- [ ] Upload d'images pour les salles
- [ ] Chat en temps réel entre client et propriétaire
- [ ] Application mobile (React Native)
- [ ] Système de favoris
- [ ] Calendrier de disponibilité
- [ ] Multi-langues
