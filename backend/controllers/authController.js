const User =  require('../models/user')
const ErrorHandler = require('../utils/errorHandler')
const catchAsyncErrors = require('../middlewares/catchAsyncErrors')
const sendToken = require('../utils/jwtToken')
const sendEmail = require('../utils/sendEmail')
const crypto = require('crypto')

//register a user => api/v1/register 

exports.registerUser = catchAsyncErrors( async (req, res, next) => {

    const {name, email, password } = req.body
    
    const user = await User.create({

        name,
        email,
        password,
        avatar: {
            public_id: 'avatars/caricatura.png',
            url: 'https://res.cloudinary.com/du25nh6xx/image/upload/v1638644788/avatars/caricatura.png'
        }
    })

    // const token = user.getJwtToken();

    // res.status(201).json({
    //     success: true, 
    //     token
    // })

    sendToken(user, 200, res)

})


//login a user => api/v1/login

exports.loginUser = catchAsyncErrors( async (req, res, next) => {
    const {email, password } = req.body

    //check if email and password is entered by user
    if( !email || !password ){
        return next(new ErrorHandler('Please enter email and password',400))
    }

    //finding user in database
    const user = await User.findOne({email}).select('+password')

    if(!user){
        return next(new ErrorHandler('Invalid email or password',401))
    }

    //check if password is correct or not
    const isPasswordMatched = await user.comparePassword(password)


    if(!isPasswordMatched){
        return next(new ErrorHandler('Ivalid email or password',401))
    }

    sendToken(user, 200, res)

})

//Forgot Password => /api/v1/password/forgot

exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const user  = await User.findOne({ email: req.body.email})
    if (!user){
        return next(new ErrorHandler('User not found with this email', 404))
    }

    //get reset token 
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false })

    //get reset password url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken}`
    const message = `Your password reset token is as follow:\n\n${resetUrl}\n\nIf you have not requested this email, then ignore it.`
    try {
        await sendEmail({
            email: user.email,
            subject: 'ShopIt Password Recovery',
            message
        })
        res.status(200).json({
            success: true,
            message: `Email send to: ${user.email}`
        })
    } catch (error) {
        user.resetPasswordToken = undefined
        user.resetPasswordExpired = undefined     
        await user.save({ validateBeforeSave: false})
        return next(new ErrorHandler(error.message, 500))    
    }  
})

//Reset password => /api/v1/password/reset/:token

exports.resetPassword = catchAsyncErrors(async (req, res, next) => {

    //hash URL token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest
    ('hex')

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    })

    if (!user){
        return next(new ErrorHandler('Password reset token is invalid or has been expired', 400))
    }

    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHandler('Password does not match', 400))
    }

    //Setup new password
    user.password = req.body.password
    user.resetPasswordToken = undefined
    user.resetPasswordExpired = undefined

    await user.save();

    sendToken(user, 200, res)




})


//logout user => /api/v1/logout

exports.logout = catchAsyncErrors( async (req, res, next) => {

    res.cookie('token', null, {
        expires : new Date(Date.now()),
        httpOnly: true
    })

    res.status(200).json({
        success:true,
        message: 'Logged out'
    })

})