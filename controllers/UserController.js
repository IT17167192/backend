const User = require('../models/User');
const {errorHandler} = require('../validators/dbErrorHandler');

//for token generation
const jwt = require('jsonwebtoken');

//create user
exports.createUser = (req, res) => {
    //get user body
    const user = new User(req.body);

    //save in the db
    user.save((err, user) => {
        if(err) {
            //send error
            return res.status(400).json({error: true, message: errorHandler(err)})
        }

        //generate token
        const token = jwt.sign({_id: user._id, name: user.name, email: user.email, role: user.role}, process.env.JWT_SECRET);

        //hash password and salt removing from the response
        user.hashed_password = undefined;
        user.salt = undefined;

        const {email, name, role, _id} = user;
        return res.status(200).json({error: false, token: token, user: {email, name, role, _id}});
    })
};

//user login
exports.login = (req, res) => {
    //find user by email
    const {email, password} = req.body;

    User.findOne({email}, (err, user) => {
        if (err||!user)
            return res.status(400).json({error: true, message: 'User doesn\'t exist!'})

        //if the user exists
        //check password
        if(!user.authenticate(password))
            return res.status(401).json({error: true, message: 'Incorrect Password!'})

        //generate token
        const token = jwt.sign({_id: user._id, name: user.name, email: user.email, role: user.role}, process.env.JWT_SECRET);

        //remove hash password and salt from the response
        user.hashed_password = undefined;
        user.salt = undefined;

        const {email, name, role, _id} = user;
        return res.status(200).json({error: false, token: token, user: {email, name, role, _id}});
    })
}

//create admin user
exports.createAdminUser = (req, res) => {
    //get user body
    const user = new User(req.body);

    //save in the db
    user.save((err, user) => {
        if(err) {
            //send error
            return res.status(400).json({error: true, message: errorHandler(err)})
        }

        //hash password and salt removing from the response
        user.hashed_password = undefined;
        user.salt = undefined;

        return res.status(200).json({error: false, message: user});
    })
};

exports.getUserByIdMiddleware = (req, res, next, id) => {
    User.findById(id)
        .populate('package')
        .exec((err, user) => {
        if(err || !user)
            return res.status(400).json({error: true, message: "User not found!"})

        req.userObj = user;

        next();
    })
}

exports.getUserById = (req, res) => {

    const user = req.userObj;
    user.hashed_password = undefined;
    user.salt = undefined;

    return res.status(200).json({error: false, message: user})
}

//update User Using the user id
exports.updateUserById = (req, res) => {
    const user = req.userObj;
    const {currentUsage, extendedData} = req.body;

    //if both of them undefined, send error
    if(typeof currentUsage === 'undefined' && typeof extendedData === 'undefined')
        return res.status(400).json({error: true, message: "At least one of them should be updated!"})

    //if current usage is going to update only, alter the user object
    if(typeof currentUsage !== 'undefined' )
        user.currentUsage = currentUsage;

    //if extended data going to update only, alter the user object
    if(typeof extendedData !== 'undefined' )
        user.extendedData = extendedData;

    user.save((err, data) => {
        if(err){
            return res.status(400).json({
                error: true, message: errorHandler(err)
            });
        }
        res.status(200).json({error: false, message: data});
    });
};

exports.checkOutstanding = (req, res) => {
    const user = req.userObj;

    if(typeof user.package === "undefined"){
        return res.status(400).json({error: true, message: 'No package was found!'});
    }
    const maxOutstanding = user.package.maxOutstanding;
    const price = user.package.price;
    const pricePerExtendUnit = user.package.pricePerExtendUnit;

    const extendedData = user.extendedData

    if(((extendedData * pricePerExtendUnit) + price) >= maxOutstanding)
        return res.status(400).json({error: true, message: 'Current balance have exceeded the credit limit'});

    return res.status(200).json({error: false, message: 'Proceed'});
};

exports.checkOutstandingMiddleware = (req, res, next) => {
    const user = req.userObj;

    if(typeof user.package === "undefined"){
        return res.status(400).json({error: true, message: 'No package was found!'});
    }

    const maxOutstanding = user.package.maxOutstanding;
    const price = user.package.price;
    const pricePerExtendUnit = user.package.pricePerExtendUnit;

    const extendedData = user.extendedData;
    const newExtendedData = req.body.extendedData - user.extendedData;

    if(((extendedData * pricePerExtendUnit) + (newExtendedData * pricePerExtendUnit) + price) >= maxOutstanding)
        return res.status(400).json({error: true, message: 'Current balance have exceeded the credit limit'});

    next();
}

exports.getUsersWithNoPackage = (req, res) => {
    //get all users who has no package assigned yet
    User.find({ package : null })
        .select("-hashed_password")
        .select("-salt")
        .exec((err, data) => {
            if(err){
                res.status(400).json({
                    error: true, message: 'No data found!'
                });
            }
            data.hashed_password = undefined;
            data.salt = undefined;
            return res.status(200).json({error: false, message: data});
        });
};

//update User Using the user id
exports.updateUserPackageByUserId = (req, res) => {
    const user = req.userObj;
    const {packageId} = req.body;

    //if both of them undefined, send error
    if(typeof packageId === 'undefined')
        return res.status(400).json({error: true, message: "Package not given!"})

    //add package
    user.package = packageId;

    user.save((err, data) => {
        if(err){
            return res.status(400).json({
                error: true, message: errorHandler(err)
            });
        }
        res.status(200).json({error: false, message: data});
    });
};

