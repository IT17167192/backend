const mongoose = require('mongoose');
const crypto = require('crypto');
const uuidv1 = require('uuid/v1');
const {ObjectId} = mongoose.Schema;

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        maxLength: 255,
    },
    email: {
        type: String,
        trim: true,
        required: true,
        email: true,
        unique: true
    },
    hashed_password: {
        type: String,
        required: true
    },
    salt: String,
    role: {
        type: Number,
        default: 0
    },
    currentUsage: {
        type: Number,
        default: 30
    },
    extendedData: {
        type: Number,
        default: 10
    },
    package: {
        type: ObjectId,
        ref: 'Package'
    }
}, {timestamps: true})

//virtual methods for password field
UserSchema.virtual('password')
    .set(function(password){
        this.tempPassword = password;
        //random string generation for password
        this.salt = uuidv1()
        this.hashed_password = this.encryptPassword(password);
    })
    .get(function(){
        return this.tempPassword
    });

UserSchema.methods = {
    encryptPassword: function(password){
        if(!password) return '';

        try {
            return crypto.createHmac('sha1', this.salt)
                .update(password)
                .digest('hex')
        }catch(err){
            return '';
        }
    },
    authenticate: function(plainText){
        return this.encryptPassword(plainText) === this.hashed_password
    }
}

module.exports = mongoose.model('User', UserSchema);
