const Resort = require('../models/resort');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");


module.exports.index = async (req, res) => {
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Resort.find({ title: regex }, function(err, allResorts) {
            if(err) {
                console.log(err);
            }
            else{
                if (allResorts.length < 1){
                    var noMatchMessage = "No resort match. Please try again."
                }
                res.render("resorts/index", { resorts: allResorts, noMatchMessage });
            }
        }); 
     }else{
        const resorts = await Resort.find({}).populate('popupText');
        var noMatchMessage = undefined;
        res.render('resorts/index', { resorts, noMatchMessage })
     }
}

module.exports.renderNewForm = (req, res) => {
    res.render('resorts/new');
}

module.exports.createResort = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.resort.location,
        limit: 1
    }).send()
    const resort = new Resort(req.body.resort);  
    resort.geometry = geoData.body.features[0].geometry;
    resort.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    resort.author = req.user._id;
    await resort.save();
    req.flash('success', 'Successfully made a new resort!');
    res.redirect(`/resorts/${resort._id}`)
}

module.exports.showResort = async (req, res,) => {
    const resort = await Resort.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!resort) {
        req.flash('error', 'Cannot find that resort!');
        return res.redirect('/resorts');
    }
    res.render('resorts/show', { resort });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const resort = await Resort.findById(id)
    if (!resort) {
        req.flash('error', 'Cannot find that resort!');
        return res.redirect('/resorts');
    }
    res.render('resorts/edit', { resort });
}

module.exports.updateResort = async (req, res) => {
    const { id } = req.params;
    const resort = await Resort.findByIdAndUpdate(id, { ...req.body.resort });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    resort.images.push(...imgs);
    await resort.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await resort.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated resort!');
    res.redirect(`/resorts/${resort._id}`)
}

module.exports.deleteResort = async (req, res) => {
    const { id } = req.params;
    await Resort.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted resort')
    res.redirect('/resorts');
}

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};