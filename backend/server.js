const app = require('./app')
const dotoenv = require('dotenv')
const connectDatabase = require('./config/database')


//handle Uncaught excetions
//controla las excepciones de errores en el codigo. Por ejemplo que una variable no esté definida:
//console.log(a)
process.on('uncaughtException', err => {
    console.log(`ERROR: ${err.message}`)
    console.log('Shutting down due to uncaught Exception')
    process.exit(1)

})

//setting up config file
dotoenv.config({ path: 'backend/config/config.env' })


// connecting to database
connectDatabase();

const server = app.listen(process.env.PORT, () => {
    console.log(`Server started on PORT: ${process.env.PORT} in ${process.env.NODE_ENV} mode.`)
})


//Handle Unhandled Promise rejections

//maneja los errores de cuando el servidor se cae. Se puede comprobar poniendo mal la url del servidor
process.on('unhandledRejection', err => {
    console.log(`ERROR: ${err.message}`)
    console.log('Shutting down the server due to Unhandled promise rejection')
    server.close(() => {
        process.exit(1)
    })
})