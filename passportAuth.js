const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const shopUser = require('./db')

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
                        console.log(user); 
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

module.exports = initialize