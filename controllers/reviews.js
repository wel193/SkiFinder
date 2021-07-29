const Resort = require('../models/resort');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
    const resort = await Resort.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    resort.reviews.push(review);
    await review.save();
    await resort.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/resorts/${resort._id}`);
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Resort.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/resorts/${id}`);
}
