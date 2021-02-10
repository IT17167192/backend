const Package = require('../models/Package');
const {errorHandler} = require('../validators/dbErrorHandler');

// Get Package by package id
exports.getPackageByIdMiddleware = (req, res, next, id)  => {
    Package.findById(id).exec((err, pack) => {
        if(err || !pack){
            return res.status(400).json({
                error: true, message: "Package not found"
            });
        }

        req.package = pack;
        next();
    });
};

// Create Package
exports.createPackage = (req, res) => {
    const package = new Package(req.body);
    package.save((err, data) => {
        if(err){
            return res.status(400).json({
                error: true,
                message: errorHandler(err)
            });
        }

        return res.status(200).json({error:false, message: data})
    });
};

//get all packages
exports.getAllPackages = (req, res) => {
    Package.find().exec((err, data) => {
        if(err){
            return res.status(400).json({
                error: true,
                message: errorHandler(err)
            });
        }
        res.status(200).json({error: false, message: data});

    });
}

//Delete Package by packageId
exports.deletePackageByPackageId = (req, res) => {
    const package = req.package;
    package.remove((err, data) => {
        if(err){
            return res.status(400).json({
                error: true,
                message: errorHandler(err)
            });
        }
        res.status(200).json({
            error: false,
            message: "Package deleted"
        });
    });
};

//update Package Using the packageId
exports.updatePackageById = (req, res) => {
    //get package which is passed by the getPackageByPackageIdMiddleware
    const package = req.package;

    //get all the values in the request body
    const {packageName, packageData, price, maxOutstanding, pricePerExtendUnit} = req.body;

    //validation for all undefined
    if(typeof packageName === 'undefined' && typeof packageData === 'undefined'
        && typeof price === 'undefined' && typeof maxOutstanding === 'undefined'
        && typeof pricePerExtendUnit === 'undefined')
        return res.status(400).json({error: true, message: 'At least one of the attributes should be updated!'})

    //update when attributes are undefined
    if(typeof packageName !== 'undefined')
        package.packageName = packageName;

    if(typeof packageData !== 'undefined')
        package.packageData = packageData;

    if(typeof price !== 'undefined')
        package.price = price;

    if(typeof maxOutstanding !== 'undefined')
        package.maxOutstanding = maxOutstanding;

    if(typeof packageName !== 'undefined')
        package.pricePerExtendUnit = pricePerExtendUnit;

    //update the package
    package.save((err, data) => {
        if(err){
            return res.status(400).json({
                error: true, message: errorHandler(err)
            });
        }
        res.status(200).json({error: false, message: data});
    });
};



