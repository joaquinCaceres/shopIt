const express = require('express')
const app = express();
const errorMiddleware = require('./middlewares/errors')
const cookieParser = require('cookie-parser') //check if user is authtenticated or not

app.use(express.json())
app.use(cookieParser()) //check if user is authtenticated or not

//import all routes
const products = require('./routes/products')
const auth = require('./routes/auth')

app.use('/api/v1', products)
app.use('/api/v1', auth)

// Middleware to handle errors
app.use(errorMiddleware)


module.exports = app