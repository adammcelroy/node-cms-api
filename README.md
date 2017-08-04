# Node CMS API

## Mission
To create a simple, lightweight, testable CMS (Content Management System) using the MERN (MongoDB, Express, React, NodeJS) stack from scratch.

The aim is not to create a fully-featured CMS —the feature set is in fact very limited— but rather to illustrate how the MERN stack allows us to create powerful features with little overhead. With tests, the codebase is just XXX code-lines.

This repository contains the backend of the project: a RESTful API served by Express running on NodeJS that interacts with a MongoDB database.

## Key Features
* Node 8 running Express
* MongoDB with Mongoose
* Exposes a RESTful API
* Secure authentication with JWT and Bcrypt
* ES6 and ES7 features used throughout
* Fully testable
* Adaptable to different environments
* Integrated with Heroku for seamless deployments
* Supports Windows

## Running Locally

1) Ensure you have [Node](https://docs.npmjs.com/getting-started/installing-node) installed and that you have a [MongoDB](https://www.mongodb.com/download-center?jmp=nav#community) instance running locally.

2) Navigate to the project root and run:
```
npm install
```
This pulls in all dependencies. You only need to do this once, so from now on you can start at step 3.

3) Start up the server

To start the server, run:
```
npm start
```

Or, to start the server and restart automatically on file changes, run:
```
npm run watch
```

The server will start on port 3000. To confirm it's working, head to your browser and navigate to http://localhost:3000/posts. If you receive some JSON back containing an empty `posts` array then you're all set up!

This repository contains a [Postman](https://www.getpostman.com/) collection that you can import to interact with the API.

## Testing

The test suite includes the [Mocha](https://github.com/mochajs/mocha) testing framework, the [Expect](https://github.com/mjackson/expect) assertion library, and the [Supertest](https://github.com/visionmedia/supertest) HTTP assertion library. The testing suite spins up a test database which is dropped on completion of all tests.

To run the tests once, use:
```
npm test
```

Or to run the tests automatically on file changes, use:
```
npm run test-watch
```

## Ideas

Going forward, there are plenty of new features that could be added.

* Ability to add pages, categories, media and more
* Ability to edit your profile as a user
* Ability to create SEO-friendly URLs
* Implement RBAC (Role-Based Access Control)
