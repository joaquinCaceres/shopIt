const ErrorHandler = require('../utils/errorHandler')


module.exports = (err, req, res, next) => {

    err.statusCode = err.statusCode || 500

    if (process.env.NODE_ENV === 'DEVELOPMENT'){
        res.status(err.statusCode).json({
            success: false,
            error: err,
            errMessage: err.message,
            stack: err.stack
        })
    }

    if (process.env.NODE_ENV === 'PRODUCTION'){
        let error = { ...err}
        error.message = err.message

        //Wrong Mongoose Object ID Errors
        //controla los errores de cuando el ID con el que se busca el producto no es valiado. 
        //Se quiere que el error en produccion sea muy sencillo --> así el usuario lo puede entender.
        if(err.name === 'CastError') {
            const message = `Resource not found. Invalid: ${err.path}`
            error = new ErrorHandler(message, 400)
        }

        //Handling Mongoose Validation error
        //si por ejemplo estamos creando un producto pero no agregramos dos campos que son necesarios (nombre y descripcion),
        //entonces devolverá el error, pero solo el primero de ellos. Aquí iteramos sobre todos los errores
        //para así mostrarlos por pantalla
        if(err.name === 'ValidationError') {
            const message = Object.values(err.erros).map(value => value.message)
            error = new ErrorHandler(message, 400)
        }

        //aquí se podrían agregar todos los errores que queramos manejar. El lo que hace es enviar peticiones con postman 
        //y ver qué errores va devolviendo


        //handling mongoose duplicate key erros
        if( err.code == 11000){
            const message = `Duplicate ${Object.keys(err.keyValue)} entered`
            error = new ErrorHandler(message, 400)
        }

        if(err.name === 'JsonWebTokenError') {
            const message = 'Json web token is invalid. Try again!'
            error = new ErrorHandler(message, 400)
        }

        if(err.name === 'TokenExpiredError') {
            const message = 'Json web token is expired. Try again!'
            error = new ErrorHandler(message, 400)
        }

        res.status(error.statusCode).json({
            success: false, 
            error: error.message || 'internal server error'
        })

    }


}

