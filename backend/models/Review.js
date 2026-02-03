const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    salle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reservation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    note: {
      type: Number,
      required: [true, "La note est requise"],
      min: [1, "La note minimale est 1"],
      max: [5, "La note maximale est 5"],
    },
    commentaire: {
      type: String,
      required: [true, "Le commentaire est requis"],
      maxlength: [500, "Le commentaire ne peut pas dépasser 500 caractères"],
    },
    dateCreation: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Index pour qu'un client ne puisse laisser qu'un seul avis par réservation
reviewSchema.index({ reservation: 1, client: 1 }, { unique: true });

// Méthode statique pour calculer la note moyenne d'une salle
reviewSchema.statics.calculerNoteMoyenne = async function (salleId) {
  const stats = await this.aggregate([
    {
      $match: { salle: salleId },
    },
    {
      $group: {
        _id: "$salle",
        noteMoyenne: { $avg: "$note" },
        nombreAvis: { $sum: 1 },
      },
    },
  ]);

  try {
    if (stats.length > 0) {
      await this.model("Room").findByIdAndUpdate(salleId, {
        noteMoyenne: stats[0].noteMoyenne,
        nombreAvis: stats[0].nombreAvis,
      });
    } else {
      await this.model("Room").findByIdAndUpdate(salleId, {
        noteMoyenne: 0,
        nombreAvis: 0,
      });
    }
  } catch (error) {
    console.error(error);
  }
};

// Calculer la note moyenne après la création d'un avis
reviewSchema.post("save", function () {
  this.constructor.calculerNoteMoyenne(this.salle);
});

// Calculer la note moyenne après la suppression d'un avis
reviewSchema.post("remove", function () {
  this.constructor.calculerNoteMoyenne(this.salle);
});

module.exports = mongoose.model("Review", reviewSchema);
