Expressful Pot
==================================

A simple API boilerplate build with express+mongoDB+JWT written in ES6.

- ES6 support via [babel](https://babeljs.io)
- JWT support via [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)
- Bcrypt support via [node.bcrypt.js](https://github.com/ncb000gt/node.bcrypt.js/)

## Content Development
```
.
├── .babelrc
├── package.json
└── src
    ├── app
    │   ├── controllers
    │   │   ├── auth.js
    │   │   └── user.js
    │   ├── middlewares
    │   │   ├── auth.js
    │   │   └── errorHandling.js
    │   ├── models
    │   │   └── user.js
    │   ├── routes
    │   │   ├── api 
    │   │   │   └── v1
    │   │   │       └── index.js
    │   │   └── auth
    │   │       └── index.js
    │   ├── utils
    │   │   ├── jwt.js
    │   │   ├── logger.js
    │   │   ├── mongoose.js
    │   │   └── HttpError.js
    │   └── app.js
    ├── config
    │   ├── express.js
    │   └── index.js
    ├── seeds
    │   └── users.js
    └── storage
        └── logs
```

`src/app/app.js`  
This file contains the mongodb connection and the routes of the app. You can add new routes and follow the convention that is presented next.

`src/app/routes`  
This folder follow a simple convention of naming folders, e.g. `http://localhost:3000/api/v1` endpoint resides in the folder `src/app/routes/api/v1/index`.  
Every router endpoint have to its own controller.method

`src/app/controllers`  
This folder contains all the controllers that a route endpoint needs, e.g. router methods in `src/app/auth/index.js` uses `src/app/controllers/auth.js` controller methods.

`src/app/middlewares`  
This folder contains all the middlewares. The boilerplate includes:

- `auth.js` middleware for JWT token verification. `token`, _user_ `id` , and _user_ `role` are saved in **Express** `response.locals` if auth is ok. Every request that involves this middleware will verify the JWT, if the token is still valid and its expiration time is below **6 hours** (default configuration), then it will send a fresh valid token with expiration date to **24 hours** (default configuration). This new `token` will be appended in the request.  
__IMPORTANT__: Send token in every request as `x-access-token` header or as `token` in _body|query_ request.
- `errorHandling.js` middleware for every `return next({Error})` in the app.

`src/app/models`  
This folder contains all the models of the application. The boilerplate includes the `user.js` model with basic fields for **authentification** and **password reset** : 

- `email`
- `role` - [user | admin]
- `password`
- `passwordResetToken`
- `passwordResetExpires`

`src/app/utils`  
This folder contains all the utils for the application. The boilerplate includes:

- `jwt.js` is the responsable for JWT **signature** and **verification**.
- `logger.js` is the responsable for the logger object
- `mongoose.js` is the responsable for connecting/closing with MongoDB
- `HttpError.js` is used to raise errors along with **Express** `next()` method, e.g. `return next(new HttpError())`.

`src/config`
This folder contains all the configuration of the application. The boilerplate includes:

- `index.js` is where __development__ and __production__ configurations resides, e.g. `jwt.secret` or `app.host`.
- `express.js` is where general express configuration resides. e.g. Application-level middleware like `body-parser` or `morgan`.
 
`src/seeds`  
This folder contains all the seeds for development. The boilerplate includes `users.js`, please consider that every user needs to hash his password, using the `users.js` approach is not optimal for a huge seed, please consider `insertMany` or `collection.insert`, but be aware that none of them trigger middlewares.

`src/storage`
Use this folder for anything that needs to be stored. This Boilerplate includes:
- `logs` where all the logs are saved

## API Documentation

For detailed information head over to the full [documentation](http://docs.expressful.apiary.io/) hosted by [apiary](http://www.apiary.io).

## Getting Started

Clone the repo:
```sh
git clone https://github.com/AlgusDark/expressful-pot
cd expressful-pot
```

Install dependencies:
```sh
npm install
```

Run the server in **development** environment:
```sh
npm run serve
```

Seed mongodb with some users. This will seed users with password as 'password'.
- admin@test.com | admin role
- test@test.com | user role
- user@test.com | user role

```sh
npm run seed:users
```

Build the app and start the server in **production** environment:
```sh
npm run build
npm run start
```

## Contributing

You can view the issue list and do a Pull Request.

## Author & License
Created by __Carlos Pérez__ Gutiérrez under the __MIT license__.
