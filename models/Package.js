const mongoose = require('mongoose');

const packageSchema = mongoose.Schema({
    packageName: {
        type: String,
        trim: true,
        required: true,
        maxLength: 255,
    },
    packageData: {
      type: Number,
      require: true
    },
    price: {
        type: Number,
        required: true,
    },
    maxOutstanding: {
        type: Number,
        required: true
    },
    pricePerExtendUnit: {
        type: Number,
        required: true
    }
}, {timestamps: true});

module.exports = mongoose.model("Package", packageSchema);