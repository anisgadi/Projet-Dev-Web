const express = require("express");
const {
  createReview,
  getRoomReviews,
  getReviews,
  getReview,
  updateReview,
  deleteReview,
  getOwnerRoomReviews,
} = require("../controllers/reviewController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router
  .route("/")
  .post(protect, authorize("client", "admin"), createReview)
  .get(protect, authorize("admin"), getReviews);

router.route("/room/:roomId").get(getRoomReviews);

router
  .route("/owner/reviews")
  .get(protect, authorize("proprietaire", "admin"), getOwnerRoomReviews);

router
  .route("/:id")
  .get(getReview)
  .put(protect, updateReview)
  .delete(protect, deleteReview);

module.exports = router;
