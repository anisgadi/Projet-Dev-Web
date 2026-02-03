# 🚀 Guide de Démarrage Rapide

Suivez ces étapes simples pour lancer la plateforme de réservation de salles en 5 minutes !

## ⚡ Installation Express

### Étape 1 : Prérequis

Assurez-vous d'avoir installé :

- **Node.js** (v14 ou supérieur) - [Télécharger](https://nodejs.org/)
- **MongoDB** (v4.4 ou supérieur) - [Télécharger](https://www.mongodb.com/try/download/community)

Vérifiez les installations :

```bash
node --version
npm --version
mongod --version
```

---

### Étape 2 : Démarrer MongoDB

#### Sur Windows :

```bash
net start MongoDB
```

#### Sur Mac/Linux :

```bash
sudo systemctl start mongod
# OU
mongod
```

---

### Étape 3 : Installation du Backend

```bash
# Naviguez vers le dossier backend
cd backend

# Installez les dépendances
npm install

# Créez le fichier .env
cp .env.example .env
```

**Éditez le fichier `.env`** et ajoutez :

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/room_booking
JWT_SECRET=mon_super_secret_jwt_changez_moi_en_production
JWT_EXPIRE=7d
```

**Lancez le serveur backend** :

```bash
npm run dev
```

✅ Vous devriez voir : `Serveur démarré en mode development sur le port 5000`

---

### Étape 4 : Installation du Frontend

**Ouvrez un nouveau terminal** et :

```bash
# Naviguez vers le dossier frontend
cd frontend

# Installez les dépendances
npm install

# Lancez l'application React
npm start
```

✅ L'application s'ouvrira automatiquement sur `http://localhost:3000`

---

## 🎉 C'est Prêt !

Votre plateforme de réservation est maintenant opérationnelle !

### URLs :

- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:5000
- **API Test** : http://localhost:5000/api

---

## 👤 Créer des Comptes de Test

### 1. Créer un Propriétaire

Allez sur http://localhost:3000/register et créez un compte avec :

- Rôle : **Propriétaire**
- Email : `proprietaire@test.com`
- Mot de passe : `password123`

### 2. Créer un Client

Créez un deuxième compte avec :

- Rôle : **Client**
- Email : `client@test.com`
- Mot de passe : `password123`

### 3. Créer un Admin (via MongoDB)

Connectez-vous à MongoDB :

```bash
mongosh
use room_booking
db.users.updateOne(
  { email: "proprietaire@test.com" },
  { $set: { role: "admin" } }
)
```

---

## 🧪 Tester les Fonctionnalités

### En tant que Propriétaire :

1. **Connectez-vous** avec le compte propriétaire
2. Allez dans **"Tableau de Bord"**
3. Cliquez sur **"Ajouter une salle"**
4. Remplissez le formulaire :
   - Titre : "Salle de Réunion Moderne"
   - Description : "Belle salle équipée"
   - Capacité : 20
   - Prix : 50
   - Type : Par heure
   - Ville : "Paris"
   - Code postal : "75001"
   - Adresse : "123 Rue Test"
5. **Créez la salle**

### En tant que Client :

1. **Déconnectez-vous** et connectez-vous avec le compte client
2. Sur la **page d'accueil**, vous verrez la salle créée
3. **Cliquez sur la salle** pour voir les détails
4. Remplissez le **formulaire de réservation** :
   - Date de début : Demain 9h
   - Date de fin : Demain 17h
   - Nombre de personnes : 10
5. **Réservez**
6. Allez dans **"Mes Réservations"** pour voir votre réservation

---

## 📱 Fonctionnalités à Explorer

### ✅ Pour Tous

- [x] Consulter les salles disponibles
- [x] Rechercher et filtrer les salles
- [x] Voir les détails d'une salle
- [x] Voir les avis

### ✅ Pour les Clients

- [x] Réserver une salle
- [x] Voir l'historique des réservations
- [x] Annuler une réservation
- [x] Laisser un avis (après réservation terminée)

### ✅ Pour les Propriétaires

- [x] Ajouter des salles
- [x] Modifier/Supprimer des salles
- [x] Voir les réservations de ses salles
- [x] Voir les avis reçus
- [x] Consulter les statistiques

### ✅ Pour les Admins

- [x] Gérer tous les utilisateurs
- [x] Activer/Désactiver des comptes
- [x] Supprimer des utilisateurs
- [x] Voir les statistiques globales

---

## 🔧 Dépannage

### Le backend ne démarre pas

**Erreur** : `MongoDB connection error`

**Solution** :

1. Vérifiez que MongoDB est démarré : `sudo systemctl status mongod`
2. Vérifiez l'URI dans `.env` : `MONGODB_URI=mongodb://localhost:27017/room_booking`

---

### Le frontend ne se connecte pas à l'API

**Erreur** : `Network Error` ou `CORS Error`

**Solution** :

1. Vérifiez que le backend est démarré sur le port 5000
2. Le proxy est déjà configuré dans `frontend/package.json`

---

### Port déjà utilisé

**Erreur** : `Port 3000 is already in use`

**Solution** :

```bash
# Sur Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Sur Mac/Linux
lsof -ti:3000 | xargs kill -9
```

---

## 📚 Documentation Complète

Pour plus d'informations, consultez :

- **README.md** - Vue d'ensemble du projet
- **PRESENTATION.md** - Présentation détaillée
- **docs/API_TESTS.md** - Tests API avec exemples
- **docs/DATABASE_SCHEMA.md** - Schéma de base de données
- **docs/DEPLOYMENT.md** - Guide de déploiement en production

---

## 🎯 Prochaines Étapes

1. ✅ Explorez l'interface utilisateur
2. ✅ Testez toutes les fonctionnalités
3. ✅ Consultez la documentation API
4. ✅ Personnalisez le design selon vos besoins
5. ✅ Ajoutez des fonctionnalités supplémentaires
6. ✅ Déployez en production (voir DEPLOYMENT.md)

---

## 💡 Astuces

### Données de Test Automatiques

Pour remplir rapidement la base de données avec des données de test :

```javascript
// Créez un fichier backend/scripts/seed.js
// Exécutez : node backend/scripts/seed.js
```

### Réinitialiser la Base de Données

```bash
mongosh
use room_booking
db.dropDatabase()
```

---

## 🆘 Besoin d'Aide ?

1. Vérifiez que toutes les dépendances sont installées
2. Consultez les logs d'erreur dans la console
3. Vérifiez que MongoDB est bien démarré
4. Relisez ce guide depuis le début
5. Consultez la documentation complète

---

**Bon développement ! 🚀**
