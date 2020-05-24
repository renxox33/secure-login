const mongoose = require('mongoose')
if(process.env.NODE_ENV!== 'production'){
    require('dotenv').config()
}
const db = process.env.DB_NAME

mongoose.connect('mongodb://localhost:27017/' + db, { useUnifiedTopology: true, useNewUrlParser: true })

//define schema
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
})




//export model
module.exports = ShopUser = mongoose.model('ShopUser', userSchema)