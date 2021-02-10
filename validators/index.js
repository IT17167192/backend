//for check validity of the token
const expressJwt = require('express-jwt');

//validates incoming req object in /user/create route
exports.create_user_validator = (req, res, next) => {
    req.check('name', 'Name is required!').notEmpty();
    req.check('email', 'Email is required!')
        .notEmpty()
        .matches(/.+\@.+\..+/)
        .withMessage("Must be a valid email address");
    req.check('password', 'Password is required!')
        .notEmpty()
        .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/)
        .withMessage("Password must be at least 6 characters, one letter and one number");

    //grab all the errors
    const errors = req.validationErrors();

    if(errors){
        const firstError = errors.map(error => error.msg)[0];
        return res.status(400).json({error: true, message: errors});
    }

    next();
}

exports.login_validator = (req, res, next) => {
    req.check('email', 'Email is required!')
        .notEmpty()
        .matches(/.+\@.+\..+/)
        .withMessage("Must be a valid email address");
    req.check('password', 'Password is required!')
        .notEmpty()

    //grab all the errors
    const errors = req.validationErrors();

    if(errors){
        const firstError = errors.map(error => error.msg)[0];
        return res.status(400).json({error: true, message: errors});
    }

    next();
}

//package validations
exports.create_package_validator = (req, res, next) => {
    req.check('packageName', 'Package name must be added!').notEmpty()
        .isLength({
            min: 1,
        })
        .withMessage('Package name cannot be empty')

    req.check('packageData', 'Package data must be added!').notEmpty()

    req.check('price', 'Package price be added!').notEmpty()

    req.check('maxOutstanding', 'Max Oustanding must be added!').notEmpty()

    //grab all the errors
    const errors = req.validationErrors();

    if (errors) {
        return res.status(400).json({error: true, message: errors});
    }
    next();
};

//check the incoming token is generated using app secret key
//secret key is inside the .env
exports.required_login = expressJwt({
    secret: process.env.JWT_SECRET,
    userProperty: "userCredentials"
});

//checks the incoming request is requested by an admin
//required_login middleware adds userCredentials object to the req object
exports.is_admin = (req, res, next) => {
    if(req.userCredentials.role !== 1)
        return res.status(403).json({error: true, message: "Access Denied!"});

    next();
};

//checks incoming request b
exports.is_auth = (req, res, next) => {
    //if admin, give access
    if(req.userCredentials.role === 1){
       next();
    }else{
        //else only the actual user can access the resource
        let user = (req.userObj._id == req.userCredentials._id);

        if(!user)
            return res.status(403).json({error: true, message: "Unauthorized Access!"})

        next();
    }
}
