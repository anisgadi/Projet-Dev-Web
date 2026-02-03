const Review = require("../models/Review");
const Booking = require("../models/Booking");
const Room = require("../models/Room");

// @desc    Créer un avis
// @route   POST /api/reviews
// @access  Private (Client)
exports.createReview = async (req, res, next) => {
  try {
    const { salle, reservation, note, commentaire } = req.body;

    // Vérifier que la réservation existe
    const booking = await Booking.findById(reservation).populate("salle");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Réservation non trouvée",
      });
    }

    // Vérifier que c'est bien le client qui a fait la réservation
    if (booking.client.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message:
          "Vous ne pouvez laisser un avis que pour vos propres réservations",
      });
    }

    // Vérifier que la réservation est terminée (date de fin passée)
    const now = new Date();
    const dateFin = new Date(booking.dateFin);

    if (dateFin > now) {
      return res.status(400).json({
        success: false,
        message:
          "Vous ne pouvez laisser un avis qu'après la fin de votre réservation",
      });
    }

    // Vérifier que la salle correspond à la réservation
    if (booking.salle._id.toString() !== salle) {
      return res.status(400).json({
        success: false,
        message: "La salle ne correspond pas à la réservation",
      });
    }

    // Vérifier qu'un avis n'existe pas déjà pour cette réservation
    const existingReview = await Review.findOne({
      reservation: reservation,
      client: req.user.id,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "Vous avez déjà laissé un avis pour cette réservation",
      });
    }

    // Créer l'avis
    const review = await Review.create({
      salle,
      client: req.user.id,
      reservation,
      note,
      commentaire,
    });

    // Populate pour renvoyer les détails
    await review.populate("client", "nom prenom");

    res.status(201).json({
      success: true,
      message: "Avis créé avec succès",
      data: review,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Vous avez déjà laissé un avis pour cette réservation",
      });
    }
    next(error);
  }
};

// @desc    Obtenir les avis d'une salle
// @route   GET /api/reviews/room/:roomId
// @access  Public
exports.getRoomReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ salle: req.params.roomId })
      .populate("client", "nom prenom")
      .sort("-dateCreation");

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mettre à jour un avis
// @route   PUT /api/reviews/:id
// @access  Private (Client)
exports.updateReview = async (req, res, next) => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Avis non trouvé",
      });
    }

    // Vérifier que c'est bien le client qui a créé l'avis
    if (review.client.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Non autorisé à modifier cet avis",
      });
    }

    review = await Review.findByIdAndUpdate(
      req.params.id,
      { note: req.body.note, commentaire: req.body.commentaire },
      { new: true, runValidators: true },
    ).populate("client", "nom prenom");

    // Recalculer la note moyenne
    await Review.calculerNoteMoyenne(review.salle);

    res.status(200).json({
      success: true,
      message: "Avis mis à jour",
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Supprimer un avis
// @route   DELETE /api/reviews/:id
// @access  Private (Client/Admin)
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Avis non trouvé",
      });
    }

    // Vérifier que c'est bien le client qui a créé l'avis ou un admin
    if (review.client.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Non autorisé à supprimer cet avis",
      });
    }

    const salleId = review.salle;
    await review.deleteOne();

    // Recalculer la note moyenne
    await Review.calculerNoteMoyenne(salleId);

    res.status(200).json({
      success: true,
      message: "Avis supprimé",
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir les avis d'un propriétaire (pour ses salles)
// @route   GET /api/reviews/owner/me
// @access  Private (Propriétaire)
exports.getOwnerRoomReviews = async (req, res, next) => {
  try {
    const rooms = await Room.find({ proprietaire: req.user.id });
    const roomIds = rooms.map((room) => room._id);

    const reviews = await Review.find({ salle: { $in: roomIds } })
      .populate("client", "nom prenom")
      .populate("salle", "titre")
      .sort("-dateCreation");

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};
