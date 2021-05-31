const app = require('./app')
const dotoenv = require('dotenv')
const connectDatabase = require('./config/database')

//setting up config file
dotoenv.config({ path: 'backend/config/config.env' })


// connecting to database
connectDatabase();

app.listen(process.env.PORT, () => {
    console.log(`Server started on PORT: ${process.env.PORT} in ${process.env.NODE_ENV} mode.`)
})