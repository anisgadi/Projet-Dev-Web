const Review = require("../models/Review");
const Booking = require("../models/Booking");
const Room = require("../models/Room");

// @desc    Créer un avis
// @route   POST /api/reviews
// @access  Private (Client)
exports.createReview = async (req, res, next) => {
  try {
    const { salle, reservation, note, commentaire } = req.body;

    // Vérifier que la réservation existe et appartient au client
    const booking = await Booking.findById(reservation);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Réservation non trouvée",
      });
    }

    if (booking.client.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Vous ne pouvez pas laisser un avis pour cette réservation",
      });
    }

    // Vérifier que la réservation est terminée
    if (booking.statut !== "terminee") {
      return res.status(400).json({
        success: false,
        message:
          "Vous ne pouvez laisser un avis que pour une réservation terminée",
      });
    }

    // Vérifier qu'un avis n'existe pas déjà pour cette réservation
    const existingReview = await Review.findOne({ reservation });
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

    res.status(201).json({
      success: true,
      message: "Avis créé avec succès",
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir tous les avis d'une salle
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

// @desc    Obtenir tous les avis (Admin)
// @route   GET /api/reviews
// @access  Private (Admin)
exports.getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate("salle", "titre")
      .populate("client", "nom prenom email")
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

// @desc    Obtenir un avis par ID
// @route   GET /api/reviews/:id
// @access  Public
exports.getReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate("salle", "titre")
      .populate("client", "nom prenom");

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Avis non trouvé",
      });
    }

    res.status(200).json({
      success: true,
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mettre à jour un avis
// @route   PUT /api/reviews/:id
// @access  Private (Client propriétaire de l'avis)
exports.updateReview = async (req, res, next) => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Avis non trouvé",
      });
    }

    // Vérifier que l'utilisateur est le propriétaire de l'avis
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
    );

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
// @access  Private (Client propriétaire ou Admin)
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Avis non trouvé",
      });
    }

    // Vérifier que l'utilisateur est le propriétaire de l'avis ou admin
    if (review.client.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Non autorisé à supprimer cet avis",
      });
    }

    await review.deleteOne();

    res.status(200).json({
      success: true,
      message: "Avis supprimé",
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir les avis des salles d'un propriétaire
// @route   GET /api/reviews/owner/reviews
// @access  Private (Propriétaire)
exports.getOwnerRoomReviews = async (req, res, next) => {
  try {
    // Trouver toutes les salles du propriétaire
    const rooms = await Room.find({ proprietaire: req.user.id });
    const roomIds = rooms.map((room) => room._id);

    // Trouver tous les avis pour ces salles
    const reviews = await Review.find({ salle: { $in: roomIds } })
      .populate("salle", "titre")
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
