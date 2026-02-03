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
      min: 1,
      max: 5,
    },
    commentaire: {
      type: String,
      required: [true, "Le commentaire est requis"],
      maxlength: 1000,
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

// Un client ne peut laisser qu'un seul avis par réservation
reviewSchema.index({ reservation: 1 }, { unique: true });
reviewSchema.index({ salle: 1, dateCreation: -1 });

// Mettre à jour la note moyenne de la salle après l'ajout d'un avis
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
  } catch (err) {
    console.error(err);
  }
};

// Calculer la note moyenne après la sauvegarde
reviewSchema.post("save", function () {
  this.constructor.calculerNoteMoyenne(this.salle);
});

// Calculer la note moyenne après la suppression
reviewSchema.post("remove", function () {
  this.constructor.calculerNoteMoyenne(this.salle);
});

module.exports = mongoose.model("Review", reviewSchema);
