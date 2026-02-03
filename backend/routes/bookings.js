const express = require("express");
const {
  getBookings,
  getBooking,
  createBooking,
  updateBooking,
  deleteBooking,
  getMyBookings,
  getOwnerBookings,
  cancelBooking,
} = require("../controllers/bookingController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router
  .route("/")
  .get(protect, authorize("admin"), getBookings)
  .post(protect, authorize("client"), createBooking);

router.route("/my-bookings").get(protect, authorize("client"), getMyBookings);

router
  .route("/owner-bookings")
  .get(protect, authorize("proprietaire", "admin"), getOwnerBookings);

router
  .route("/:id")
  .get(protect, getBooking)
  .put(protect, authorize("admin"), updateBooking)
  .delete(protect, authorize("admin"), deleteBooking);

router.route("/:id/cancel").put(protect, authorize("client"), cancelBooking);

module.exports = router;
