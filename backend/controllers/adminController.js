const User = require("../models/User");
const Room = require("../models/Room");
const Booking = require("../models/Booking");
const Review = require("../models/Review");

// @desc    Obtenir les statistiques du propriétaire
// @route   GET /api/admin/stats/owner
// @access  Private (Propriétaire)
exports.getOwnerStats = async (req, res, next) => {
  try {
    const rooms = await Room.find({ proprietaire: req.user.id });
    const roomIds = rooms.map((room) => room._id);

    const totalRooms = rooms.length;
    const bookings = await Booking.find({ salle: { $in: roomIds } });
    const totalBookings = bookings.length;

    const totalRevenue = bookings.reduce((sum, booking) => {
      if (booking.statut === "confirmee" || booking.statut === "terminee") {
        return sum + booking.prixTotal;
      }
      return sum;
    }, 0);

    const bookingsByStatus = await Booking.aggregate([
      { $match: { salle: { $in: roomIds } } },
      { $group: { _id: "$statut", count: { $sum: 1 } } },
    ]);

    const reviews = await Review.find({ salle: { $in: roomIds } });
    const totalReviews = reviews.length;
    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.note, 0) / reviews.length
        : 0;

    const roomStats = await Promise.all(
      rooms.map(async (room) => {
        const roomBookings = await Booking.find({ salle: room._id });
        const roomRevenue = roomBookings.reduce((sum, booking) => {
          if (booking.statut === "confirmee" || booking.statut === "terminee") {
            return sum + booking.prixTotal;
          }
          return sum;
        }, 0);

        return {
          salle: {
            id: room._id,
            titre: room.titre,
            prix: room.prix,
            statut: room.statut,
            approuve: room.approuve,
          },
          nombreReservations: roomBookings.length,
          revenus: roomRevenue,
          noteMoyenne: room.noteMoyenne,
          nombreAvis: room.nombreAvis,
        };
      }),
    );

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalRooms,
          totalBookings,
          totalRevenue,
          totalReviews,
          averageRating: averageRating.toFixed(2),
        },
        bookingsByStatus,
        roomStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir les statistiques globales (Admin)
// @route   GET /api/admin/stats/admin
// @access  Private (Admin)
exports.getAdminStats = async (req, res, next) => {
  try {
    const usersByRole = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    const totalUsers = await User.countDocuments();
    const totalRooms = await Room.countDocuments();
    const totalBookings = await Booking.countDocuments();

    const bookings = await Booking.find({
      statut: { $in: ["confirmee", "terminee"] },
    });
    const totalRevenue = bookings.reduce(
      (sum, booking) => sum + booking.prixTotal,
      0,
    );

    const bookingsByStatus = await Booking.aggregate([
      { $group: { _id: "$statut", count: { $sum: 1 } } },
    ]);

    const totalReviews = await Review.countDocuments();

    const roomsByStatus = await Room.aggregate([
      { $group: { _id: "$statut", count: { $sum: 1 } } },
    ]);

    const pendingRooms = await Room.countDocuments({ statut: "en_attente" });

    const lastYear = new Date();
    lastYear.setFullYear(lastYear.getFullYear() - 1);

    const monthlyBookings = await Booking.aggregate([
      {
        $match: {
          dateCreation: { $gte: lastYear },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$dateCreation" },
            month: { $month: "$dateCreation" },
          },
          count: { $sum: 1 },
          revenue: {
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
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const topRooms = await Booking.aggregate([
      {
        $group: {
          _id: "$salle",
          count: { $sum: 1 },
          revenue: {
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
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "rooms",
          localField: "_id",
          foreignField: "_id",
          as: "salle",
        },
      },
      { $unwind: "$salle" },
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalRooms,
          totalBookings,
          totalRevenue,
          totalReviews,
          pendingRooms,
        },
        usersByRole,
        bookingsByStatus,
        roomsByStatus,
        monthlyBookings,
        topRooms,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir tous les utilisateurs (Admin)
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password").sort("-dateCreation");

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bannir/Activer un utilisateur (Admin)
// @route   PUT /api/admin/users/:id/toggle
// @access  Private (Admin)
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé",
      });
    }

    user.actif = !user.actif;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Utilisateur ${user.actif ? "activé" : "banni"}`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Supprimer un utilisateur (Admin)
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé",
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "Utilisateur supprimé",
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir toutes les salles (Admin)
// @route   GET /api/admin/rooms
// @access  Private (Admin)
exports.getAllRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find()
      .populate("proprietaire", "nom prenom email")
      .sort("-dateCreation");

    res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir tous les avis (Admin)
// @route   GET /api/admin/reviews
// @access  Private (Admin)
exports.getAllReviews = async (req, res, next) => {
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

// @desc    Supprimer un avis (Admin)
// @route   DELETE /api/admin/reviews/:id
// @access  Private (Admin)
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Avis non trouvé",
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
