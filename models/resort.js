const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

const opts = { toJSON: { virtuals: true } };

const ResortSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry:{
        type:{
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type:[Number], 
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);

ResortSchema.virtual('properties.popUpMarkup').get(function () {
    return `<h5><strong><a href="/resorts/${this._id}">${this.title}</a><strong></h5>`
});



ResortSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Resort', ResortSchema)

