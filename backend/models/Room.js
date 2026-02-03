const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    titre: {
      type: String,
      required: [true, "Le titre est requis"],
      trim: true,
      maxlength: [100, "Le titre ne peut pas dépasser 100 caractères"],
    },
    description: {
      type: String,
      required: [true, "La description est requise"],
      maxlength: [2000, "La description ne peut pas dépasser 2000 caractères"],
    },
    capacite: {
      type: Number,
      required: [true, "La capacité est requise"],
      min: [1, "La capacité doit être au moins de 1 personne"],
    },
    prix: {
      type: Number,
      required: [true, "Le prix est requis"],
      min: [0, "Le prix ne peut pas être négatif"],
    },
    typePrix: {
      type: String,
      enum: ["heure", "jour", "semaine"],
      default: "heure",
    },
    proprietaire: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    localisation: {
      adresse: {
        type: String,
        required: [true, "L'adresse est requise"],
      },
      ville: {
        type: String,
        required: [true, "La ville est requise"],
      },
      codePostal: {
        type: String,
        required: [true, "Le code postal est requis"],
      },
      pays: {
        type: String,
        default: "France",
      },
      coordinates: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },
        coordinates: {
          type: [Number],
          required: true,
        },
      },
    },
    equipements: [
      {
        type: String,
        trim: true,
      },
    ],
    images: [
      {
        type: String,
        validate: {
          validator: function (v) {
            return this.images.length <= 5;
          },
          message: "Maximum 5 images autorisées",
        },
      },
    ],
    disponible: {
      type: Boolean,
      default: true,
    },
    approuve: {
      type: Boolean,
      default: false,
    },
    statut: {
      type: String,
      enum: ["en_attente", "approuve", "rejete"],
      default: "en_attente",
    },
    noteMoyenne: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    nombreAvis: {
      type: Number,
      default: 0,
    },
    dateCreation: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Index pour la recherche géographique
roomSchema.index({ "localisation.coordinates": "2dsphere" });

// Virtual pour les réservations
roomSchema.virtual("reservations", {
  ref: "Booking",
  localField: "_id",
  foreignField: "salle",
});

// Virtual pour les avis
roomSchema.virtual("avis", {
  ref: "Review",
  localField: "_id",
  foreignField: "salle",
});

module.exports = mongoose.model("Room", roomSchema);
