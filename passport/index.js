var passport = require('passport');
var LocalStrategy  = require('passport-local').Strategy ;
var Account = require('./../models/account');
var bcrypt = require('./../helpers/bcrypt');
var random = require('./../utils/utils').random; 
var texts = require('./../utils/texts');
// var generateHash, compareHash = require('./../helpers/bcrypt');
import PassportError from './PassportError';
var cache = require('./../helpers/cache');
import ResponseResult from './../helpers/response-result.js';


/**
 * Set up passport serialization
 */

passport.serializeUser((user, done) => {
    cache.passport.set(user._id, user); //store user in cache
    done(null, user._id);
});

passport.deserializeUser((id, done) => {
    if(cache.passport.has(id)) {
        return done(null, cache.passport.get(id));
    }

    Account.findById(id).exec().then(account => {

            cache.passport.set(id, account);
            done(null, account);
        }
    ).catch((error) => {
        done(error);
    });
});


passport.use('local-facebook', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'facebookId',
        passReqToCallback: true}, ( req, username,facebookId, done) => {

    let deviceToken = req.body.deviceToken;
    let platform = req.body.platform;
    Account.findUserByFacebookId(facebookId).then(account => {
        //account exists
        if(account) {
            return done(null, ResponseResult.customizedUserInfo(account), "1");
        }else {

            const newAccount = new Account();
            newAccount.type = "facebook";
            newAccount.o_auth.facebook.id = facebookId;
            newAccount.device_token = deviceToken;
            newAccount.platform = platform;
            if(req.body.gender) newAccount.common_profile.gender = req.body.gender;
            if(req.body.email) newAccount.common_profile.email = req.body.email;
            if(req.body.avatar) newAccount.common_profile.avatar = req.body.avatar;

            newAccount.save().then(doc => {
                return done(null, ResponseResult.customizedUserInfo(account), null);
            })
           
        }
    });


}));

function registerUserWithEmail() {

}