# Schéma de Base de Données - MongoDB

## Vue d'ensemble

La plateforme utilise MongoDB comme base de données NoSQL. Voici le schéma détaillé de toutes les collections.

## Collections

### 1. Users (Utilisateurs)

Stocke les informations des utilisateurs (clients, propriétaires, administrateurs).

```javascript
{
  _id: ObjectId,
  nom: String (required),
  prenom: String (required),
  email: String (required, unique, lowercase),
  password: String (required, hashed, min: 6),
  role: String (enum: ['client', 'proprietaire', 'admin'], default: 'client'),
  telephone: String,
  adresse: String,
  actif: Boolean (default: true),
  dateCreation: Date (default: Date.now),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

**Indexes:**

- `email`: unique

**Règles de validation:**

- Email doit être valide (regex)
- Password >= 6 caractères
- Role doit être client, proprietaire ou admin

---

### 2. Rooms (Salles)

Stocke les informations des salles proposées à la location.

```javascript
{
  _id: ObjectId,
  titre: String (required, max: 100),
  description: String (required, max: 1000),
  capacite: Number (required, min: 1),
  prix: Number (required, min: 0),
  typePrix: String (enum: ['heure', 'jour', 'semaine'], default: 'heure'),
  proprietaire: ObjectId (ref: 'User', required),
  localisation: {
    adresse: String (required),
    ville: String (required),
    codePostal: String (required),
    pays: String (default: 'France'),
    coordinates: {
      latitude: Number (required),
      longitude: Number (required)
    }
  },
  equipements: [String],
  images: [String],
  disponible: Boolean (default: true),
  noteMoyenne: Number (default: 0, min: 0, max: 5),
  nombreAvis: Number (default: 0),
  dateCreation: Date (default: Date.now),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

**Indexes:**

- `localisation.coordinates`: 2dsphere (pour les requêtes géographiques)
- `proprietaire`: 1

**Relations:**

- `proprietaire` → Users.\_id
- Virtual: `reservations` → Bookings
- Virtual: `avis` → Reviews

---

### 3. Bookings (Réservations)

Stocke les réservations effectuées par les clients.

```javascript
{
  _id: ObjectId,
  salle: ObjectId (ref: 'Room', required),
  client: ObjectId (ref: 'User', required),
  dateDebut: Date (required),
  dateFin: Date (required),
  nombrePersonnes: Number (required, min: 1),
  prixTotal: Number (required, min: 0),
  statut: String (enum: ['en_attente', 'confirmee', 'annulee', 'terminee'], default: 'confirmee'),
  notes: String (max: 500),
  dateCreation: Date (default: Date.now),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

**Indexes:**

- `salle, dateDebut, dateFin`: compound (pour vérifier les conflits)
- `client, dateCreation`: compound (pour l'historique)

**Relations:**

- `salle` → Rooms.\_id
- `client` → Users.\_id

**Règles de validation:**

- dateFin doit être après dateDebut
- Pas de chevauchement de réservations pour la même salle

---

### 4. Reviews (Avis)

Stocke les avis et commentaires laissés par les clients.

```javascript
{
  _id: ObjectId,
  salle: ObjectId (ref: 'Room', required),
  client: ObjectId (ref: 'User', required),
  reservation: ObjectId (ref: 'Booking', required),
  note: Number (required, min: 1, max: 5),
  commentaire: String (required, max: 1000),
  dateCreation: Date (default: Date.now),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

**Indexes:**

- `reservation`: unique (un seul avis par réservation)
- `salle, dateCreation`: compound

**Relations:**

- `salle` → Rooms.\_id
- `client` → Users.\_id
- `reservation` → Bookings.\_id

**Hooks:**

- Post-save: Recalcule automatiquement la note moyenne de la salle
- Post-remove: Recalcule automatiquement la note moyenne de la salle

---

## Diagramme des Relations

```
┌─────────────────┐
│     Users       │
│  - _id          │
│  - nom          │
│  - email        │
│  - role         │
└────────┬────────┘
         │
         │ proprietaire (1:N)
         ▼
┌─────────────────┐         ┌─────────────────┐
│     Rooms       │         │    Bookings     │
│  - _id          │◄────────┤  - salle        │
│  - titre        │  (1:N)  │  - client       │
│  - proprietaire │         │  - dateDebut    │
│  - localisation │         │  - statut       │
└────────┬────────┘         └────────┬────────┘
         │                           │
         │ salle (1:N)              │ reservation (1:1)
         ▼                           ▼
┌─────────────────┐         ┌─────────────────┐
│     Reviews     │         │    (client)     │
│  - salle        ├─────────┤  Users._id      │
│  - client       │         └─────────────────┘
│  - reservation  │
│  - note         │
└─────────────────┘
```

## Requêtes Courantes

### 1. Trouver toutes les salles d'un propriétaire

```javascript
db.rooms.find({ proprietaire: proprietaireId });
```

### 2. Trouver les réservations d'un client

```javascript
db.bookings.find({ client: clientId }).populate("salle");
```

### 3. Recherche géographique (salles dans un rayon)

```javascript
db.rooms.find({
  "localisation.coordinates": {
    $near: {
      $geometry: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
      $maxDistance: 5000, // en mètres
    },
  },
});
```

### 4. Vérifier les conflits de réservation

```javascript
db.bookings.find({
  salle: salleId,
  statut: { $in: ["en_attente", "confirmee"] },
  $or: [
    {
      dateDebut: { $lte: nouvelleReservation.dateDebut },
      dateFin: { $gte: nouvelleReservation.dateDebut },
    },
    {
      dateDebut: { $lte: nouvelleReservation.dateFin },
      dateFin: { $gte: nouvelleReservation.dateFin },
    },
  ],
});
```

### 5. Calculer les statistiques d'un propriétaire

```javascript
// Total des réservations pour les salles d'un propriétaire
db.bookings.aggregate([
  {
    $lookup: {
      from: "rooms",
      localField: "salle",
      foreignField: "_id",
      as: "room",
    },
  },
  { $unwind: "$room" },
  {
    $match: { "room.proprietaire": proprietaireId },
  },
  {
    $group: {
      _id: null,
      totalReservations: { $sum: 1 },
      totalRevenue: {
        $sum: {
          $cond: [
            { $in: ["$statut", ["confirmee", "terminee"]] },
            "$prixTotal",
            0,
          ],
        },
      },
    },
  },
]);
```

## Tailles et Performances

### Estimations de taille

- **Users**: ~1 KB par document
- **Rooms**: ~2 KB par document (sans images)
- **Bookings**: ~500 bytes par document
- **Reviews**: ~1 KB par document

### Recommendations

1. **Indexes**:
   - Créer des index composites sur les champs fréquemment recherchés
   - Index géospatial pour les recherches de localisation

2. **Pagination**:
   - Utiliser skip() et limit() pour les grandes collections
   - Implémenter le cursor-based pagination pour de meilleures performances

3. **Populate**:
   - Utiliser populate() avec parcimonie
   - Sélectionner uniquement les champs nécessaires

4. **Caching**:
   - Mettre en cache les résultats de recherche fréquents
   - Utiliser Redis pour les données de session

## Migration et Backup

### Backup MongoDB

```bash
# Backup complet
mongodump --db room_booking --out /backup/$(date +%Y%m%d)

# Restore
mongorestore --db room_booking /backup/20240201/room_booking
```

### Scripts d'initialisation

Voir `backend/scripts/seed.js` pour des exemples de données de test.

---

**Note**: Ce schéma peut évoluer selon les besoins de la plateforme. Consultez toujours la version la plus récente dans le code source.
