const express = require('express')
const ejs = require('ejs')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const passport = require('passport')
const initializePassport = require('./passportAuth')
const flash = require('express-flash')
const session = require('express-session')
if(process.env.NODE_ENV!== 'production'){
    require('dotenv').config()
}
const methodOverride = require('method-override')
const shopUser = require('./db')

const app = express()
const port = process.env.port || 3000

initializePassport.initializeLocalStrategy(passport)

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(flash())
app.use(session({
    secret: process.env.USER_SECRET,
    resave: false,
    saveUninitialized: false,
    name: 'Express'
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

initializePassport.googleAuth(passport)


const checkAuthenticated = (req,res,next) => {
    if(req.isAuthenticated()){
        return next()
    }

    res.redirect('/login')
}

const checkNotAuthenticated = (req,res,next) => {
    if(req.isAuthenticated()){
        return res.redirect('/')
    }
    next()
}

app.get('/', checkAuthenticated, (req, res) => {
        res.render('index', { name: req.user.name }) 
})

app.get('/login', checkNotAuthenticated, (req,res) => {
    res.render('login')
})

app.get('/register',checkNotAuthenticated, (req,res) => {
    res.render('register')
})

app.post('/login',checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.post('/register',checkNotAuthenticated, async (req,res) => {
    const { name, email, password } = req.body

    try {
        const hashedPassword = await bcrypt.hash(password, 10)

        const newShopUser = new shopUser({
            id: Date.now().toString(),
            name: name,
            email: email,
            password: hashedPassword
        })

        await newShopUser.save()
        
        res.redirect('/login')
    } catch (error) {
        console.log(err);
    }
    
})

app.delete('/logout', (req,res) => {
    req.logOut()
    res.redirect('/login')
})

app.get('/authgoogle',passport.authenticate('google', { scope: ['profile'] }))

app.get('/authgoogle/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
      console.log('Successfully authenticated');
      
    // Successful authentication, redirect home.
    res.redirect('/');
  });

app.listen(port)