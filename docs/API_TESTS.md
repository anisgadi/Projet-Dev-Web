# Tests API - Collection Postman

Ce fichier contient des exemples de requêtes pour tester toutes les fonctionnalités de l'API.

## Configuration

**Base URL**: `http://localhost:5000/api`

**Headers** (pour les requêtes authentifiées):

```
Authorization: Bearer {votre_token}
Content-Type: application/json
```

---

## 1. Authentification

### 1.1 Inscription - Client

```http
POST /auth/register
Content-Type: application/json

{
  "nom": "Martin",
  "prenom": "Alice",
  "email": "alice.martin@email.com",
  "password": "password123",
  "role": "client",
  "telephone": "0612345678",
  "adresse": "10 Rue de la Paix, Paris"
}
```

**Réponse attendue** (201):

```json
{
  "success": true,
  "message": "Utilisateur créé avec succès",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "nom": "Martin",
    "prenom": "Alice",
    "email": "alice.martin@email.com",
    "role": "client"
  }
}
```

### 1.2 Inscription - Propriétaire

```http
POST /auth/register
Content-Type: application/json

{
  "nom": "Dupont",
  "prenom": "Jean",
  "email": "jean.dupont@email.com",
  "password": "password123",
  "role": "proprietaire",
  "telephone": "0687654321",
  "adresse": "25 Avenue des Champs-Élysées, Paris"
}
```

### 1.3 Connexion

```http
POST /auth/login
Content-Type: application/json

{
  "email": "alice.martin@email.com",
  "password": "password123"
}
```

**Réponse attendue** (200):

```json
{
  "success": true,
  "message": "Connexion réussie",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "nom": "Martin",
    "prenom": "Alice",
    "email": "alice.martin@email.com",
    "role": "client"
  }
}
```

### 1.4 Obtenir le profil utilisateur

```http
GET /auth/me
Authorization: Bearer {token}
```

### 1.5 Mettre à jour le profil

```http
PUT /auth/updatedetails
Authorization: Bearer {token}
Content-Type: application/json

{
  "nom": "Martin-Durand",
  "prenom": "Alice",
  "telephone": "0698765432"
}
```

### 1.6 Changer le mot de passe

```http
PUT /auth/updatepassword
Authorization: Bearer {token}
Content-Type: application/json

{
  "currentPassword": "password123",
  "newPassword": "newpassword456"
}
```

---

## 2. Salles (Rooms)

### 2.1 Obtenir toutes les salles

```http
GET /rooms
```

**Avec filtres**:

```http
GET /rooms?search=Paris&capacite=10&prixMax=100&page=1&limit=10
```

### 2.2 Obtenir une salle par ID

```http
GET /rooms/{room_id}
```

### 2.3 Créer une salle (Propriétaire)

```http
POST /rooms
Authorization: Bearer {token_proprietaire}
Content-Type: application/json

{
  "titre": "Salle de Réunion Moderne",
  "description": "Belle salle équipée avec vue panoramique sur Paris. Idéale pour vos réunions d'entreprise ou événements professionnels.",
  "capacite": 20,
  "prix": 50,
  "typePrix": "heure",
  "localisation": {
    "adresse": "123 Rue de Rivoli",
    "ville": "Paris",
    "codePostal": "75001",
    "pays": "France",
    "coordinates": {
      "latitude": 48.8566,
      "longitude": 2.3522
    }
  },
  "equipements": [
    "WiFi haut débit",
    "Projecteur 4K",
    "Tableau blanc interactif",
    "Climatisation",
    "Machine à café"
  ]
}
```

**Réponse attendue** (201):

```json
{
  "success": true,
  "message": "Salle créée avec succès",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
    "titre": "Salle de Réunion Moderne",
    "description": "Belle salle équipée...",
    "capacite": 20,
    "prix": 50,
    "typePrix": "heure",
    "proprietaire": "65a1b2c3d4e5f6g7h8i9j0k1",
    "localisation": {...},
    "equipements": [...],
    "disponible": true,
    "noteMoyenne": 0,
    "nombreAvis": 0
  }
}
```

### 2.4 Mettre à jour une salle

```http
PUT /rooms/{room_id}
Authorization: Bearer {token_proprietaire}
Content-Type: application/json

{
  "titre": "Salle de Réunion Premium",
  "prix": 60,
  "disponible": true
}
```

### 2.5 Supprimer une salle

```http
DELETE /rooms/{room_id}
Authorization: Bearer {token_proprietaire}
```

### 2.6 Obtenir mes salles (Propriétaire)

```http
GET /rooms/owner/me
Authorization: Bearer {token_proprietaire}
```

---

## 3. Réservations (Bookings)

### 3.1 Créer une réservation (Client)

```http
POST /bookings
Authorization: Bearer {token_client}
Content-Type: application/json

{
  "salle": "65a1b2c3d4e5f6g7h8i9j0k2",
  "dateDebut": "2024-02-15T09:00:00",
  "dateFin": "2024-02-15T17:00:00",
  "nombrePersonnes": 15,
  "notes": "Réunion trimestrielle - besoin de café et viennoiseries"
}
```

**Réponse attendue** (201):

```json
{
  "success": true,
  "message": "Réservation créée avec succès",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k3",
    "salle": "65a1b2c3d4e5f6g7h8i9j0k2",
    "client": "65a1b2c3d4e5f6g7h8i9j0k1",
    "dateDebut": "2024-02-15T09:00:00.000Z",
    "dateFin": "2024-02-15T17:00:00.000Z",
    "nombrePersonnes": 15,
    "prixTotal": 400,
    "statut": "confirmee",
    "notes": "Réunion trimestrielle..."
  }
}
```

### 3.2 Obtenir mes réservations (Client)

```http
GET /bookings/my-bookings
Authorization: Bearer {token_client}
```

### 3.3 Obtenir les réservations de mes salles (Propriétaire)

```http
GET /bookings/owner/bookings
Authorization: Bearer {token_proprietaire}
```

### 3.4 Obtenir une réservation par ID

```http
GET /bookings/{booking_id}
Authorization: Bearer {token}
```

### 3.5 Mettre à jour le statut d'une réservation

```http
PUT /bookings/{booking_id}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "statut": "terminee"
}
```

**Statuts possibles**: `en_attente`, `confirmee`, `annulee`, `terminee`

### 3.6 Annuler une réservation

```http
DELETE /bookings/{booking_id}
Authorization: Bearer {token_client}
```

---

## 4. Avis (Reviews)

### 4.1 Créer un avis (Client)

```http
POST /reviews
Authorization: Bearer {token_client}
Content-Type: application/json

{
  "salle": "65a1b2c3d4e5f6g7h8i9j0k2",
  "reservation": "65a1b2c3d4e5f6g7h8i9j0k3",
  "note": 5,
  "commentaire": "Excellente salle, très bien équipée et propre. L'emplacement est parfait et le propriétaire très réactif. Je recommande vivement !"
}
```

**Note**: Le client doit avoir une réservation terminée pour laisser un avis.

### 4.2 Obtenir tous les avis d'une salle

```http
GET /reviews/room/{room_id}
```

### 4.3 Obtenir les avis de mes salles (Propriétaire)

```http
GET /reviews/owner/reviews
Authorization: Bearer {token_proprietaire}
```

### 4.4 Mettre à jour un avis

```http
PUT /reviews/{review_id}
Authorization: Bearer {token_client}
Content-Type: application/json

{
  "note": 4,
  "commentaire": "Très bonne salle dans l'ensemble. Quelques petits points à améliorer mais je recommande."
}
```

### 4.5 Supprimer un avis

```http
DELETE /reviews/{review_id}
Authorization: Bearer {token_client}
```

---

## 5. Administration

### 5.1 Obtenir tous les utilisateurs (Admin)

```http
GET /admin/users
Authorization: Bearer {token_admin}
```

### 5.2 Activer/Désactiver un utilisateur (Admin)

```http
PUT /admin/users/{user_id}/toggle
Authorization: Bearer {token_admin}
```

### 5.3 Supprimer un utilisateur (Admin)

```http
DELETE /admin/users/{user_id}
Authorization: Bearer {token_admin}
```

### 5.4 Obtenir les statistiques admin (Admin)

```http
GET /admin/stats/admin
Authorization: Bearer {token_admin}
```

**Réponse attendue**:

```json
{
  "success": true,
  "data": {
    "overview": {
      "totalUsers": 150,
      "totalRooms": 45,
      "totalBookings": 320,
      "totalRevenue": 25600,
      "totalReviews": 180
    },
    "usersByRole": [...],
    "bookingsByStatus": [...],
    "monthlyBookings": [...],
    "topRooms": [...]
  }
}
```

### 5.5 Obtenir les statistiques propriétaire (Propriétaire)

```http
GET /admin/stats/owner
Authorization: Bearer {token_proprietaire}
```

---

## Codes de Réponse HTTP

- **200 OK**: Requête réussie
- **201 Created**: Ressource créée avec succès
- **400 Bad Request**: Données invalides
- **401 Unauthorized**: Non authentifié
- **403 Forbidden**: Non autorisé (mauvais rôle)
- **404 Not Found**: Ressource non trouvée
- **500 Internal Server Error**: Erreur serveur

---

## Scénario de Test Complet

### 1. Inscription et Connexion

1. Créer un compte client (Alice)
2. Créer un compte propriétaire (Jean)
3. Se connecter avec Alice → récupérer le token
4. Se connecter avec Jean → récupérer le token

### 2. Gestion des Salles

1. Jean ajoute une salle
2. Jean liste ses salles
3. Visiteur consulte toutes les salles
4. Alice consulte les détails de la salle

### 3. Réservation

1. Alice réserve la salle de Jean
2. Alice consulte ses réservations
3. Jean consulte les réservations de sa salle

### 4. Avis

1. Après la réservation, mettre le statut à "terminee"
2. Alice laisse un avis sur la salle
3. Jean consulte les avis de sa salle
4. Visiteur consulte les avis de la salle

---

## Variables Postman

Pour utiliser ces requêtes dans Postman, configurez ces variables :

```json
{
  "base_url": "http://localhost:5000/api",
  "token_client": "",
  "token_proprietaire": "",
  "token_admin": "",
  "room_id": "",
  "booking_id": "",
  "review_id": ""
}
```

Utilisez `{{base_url}}`, `{{token_client}}`, etc. dans vos requêtes.

---

**Note**: N'oubliez pas de remplacer les IDs et tokens par les vraies valeurs lors de vos tests !
