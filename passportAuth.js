const LocalStrategy = require('passport-local').Strategy
const GoogleStrategy = require('passport-google-oauth20').Strategy
const bcrypt = require('bcrypt')
const shopUser = require('./db')
require('dotenv').config()
const mongoose = require('mongoose')

function initialize(passport){

    const authenticateUser = async (email, password, done) => {

         shopUser.findOne({ email: email }, async (err, user) => {
            if(err){
                return done(err)
                
            } else{
                if(user == null){
                    return done(null, false, { message: 'No user with that email' })
                } 
            
                try {
                    
                    if (await bcrypt.compare(password, user.password)){ 
                        return done(null, user)
                    } else{
                        return done(null, false, { message: 'Password is incorrect' })
                    }
            
                } catch (error) {
                    return done(error)
                }
            }
        })
        
    }

    passport.use(new LocalStrategy({ usernameField: 'email'}, authenticateUser))

    passport.serializeUser(function(user, done) {
        return done(null, user.id);
      });
      
      passport.deserializeUser(function(id, done) {
        shopUser.findOne({ _id: id }, (err, user) => {
            if(err){
                return done(err)
                
            }else{
                return done(null, user)
            }
        })
      });
}

module.exports.googleAuth = (passport) => {

    console.log('googleAuth');
    

    passport.use(new GoogleStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: 'http://localhost:3000/authgoogle/callback'
    },  
    function(accessToken, refreshToken, profile, cb){

        console.log(typeof(profile.id));

        shopUser.findOne({gid: profile.id}, (err, user) => {
            if(err){
                console.log(err);
                
            } else{
                if(user){
                    //code if user found
                    return cb(err,user)
                } else {
                    const newUser = new shopUser({
                        gid: profile.id,
                        name: profile.displayName
                    })

                    newUser.save()
                    return cb(err,newUser)
                }
            }
        })
        console.log(profile);     
    }
    ))
}

module.exports.initializeLocalStrategy = initialize