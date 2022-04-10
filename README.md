# Backend for support desk application.

First thing that we will do is create the endpoints for authentication. We want to create endpoint for login and register users in order to determine access to other endpoints, to do that we will create a jwt that the user can send in every request.

## Steps to create our authentication endpoints ##
- Create routes
- Define schema fields for each model
- Connect to the datase
- Create models using mongoose
- Verify that new entry doesn't already exists
- Encrypt password
- Create new User

In order to organize our endpoints we will create separate files for each route or controller, we will begin with the authentication controller, every controller should follow the same structure:

```javascript
const express = require('express')
const router = express.Router()

router.post('/', (req, res) => {
    //custom code
    res.send('Route response')
})

module.exports = router
```

Once we have created our routes for authentication we need to define our data transfer objects fields for each request, for example for registering a new user we will need the name, email and password and we will send that information as a JSON object.

```json
{
    "name": "Oscar",
    "email": "oscar@gmail.com",
    "password": "password123"
}
```
And to login the user we only need the email and password.

```json
{
    "email": "oscar@gmail.com",
    "password": "password123"
}
```
Now that we already have our endpoints and we can receive the data of the body request, we will need to connect to our database so that we can store our data there, we need to map our DTOs to model using mongoose schemas, to connect to our database we only need a connection URI:
```javascript
const mongoose = require("mongoose")

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI)
    console.log(`MongoDB connected: ${conn.connection.host}`.cyan.underline);
  } catch (error) {
      console.log(`Error: ${error.message}`.red.underline.bold);
      process.exit(1)
  }
};
```

In order to create our models we need to follow this structure:
```javascript
const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please add a password']
    },
    isAdmin: {
        type: Boolean,
        required: true, 
        default: false
    },
},
{
    timestamps: true
})

module.exports = mongoose.model('User', userSchema)
```

The next step in order to store our users in the database is going to be the encryption of the password, we can't store the password in plain text in or db for security reasons so we will encrypt the password, store it.

Once that we already encrypted our password and we validated the user doesn't already exists we can store it in the database using the User model.
```javascript
//Find if user already exists
    const userExists = await User.findOne({email})

    if(userExists){
        res.status(400)
        throw new Error('User already exists')
    }

    //hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    //create user
    const user = await User.create({name, email, password: hashedPassword})

    if(user){
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email
        })
    } else {
        res.status(400)
        throw new Error('Invalid user data')
    }
```

## JWT
In order to authenticate our users we can use json web tokens, the token will contain the user id that we will use later to see if the user has access to a resource, to generate a JWT we can do it like this:

```javascript
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  })
}
```

then every time that we receive a request for a private resource we will use a auth middleware that will decode the token and throw an error if the token does not contain a valid id.
```javascript
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const User = require('../models/userModel')

const protect = asyncHandler(async (req, res, next) => {
    let token

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        try {
            //get token from header
            token = req.headers.authorization.split(' ')[1]
            //verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            //get user from token
            req.user = await User.findById(decoded.id).select('-password')

            next()
        } catch (error) {
            console.log(error)
            res.status(401)
            throw new Error('Not authorized')
        }
    }

    if(!token){
        res.status(401)
        throw new Error('Not authorized')
    }
})
```
