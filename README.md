# Node CMS API

## Mission
To create a barebones, lightweight, testable CMS (Content Management System) using the MERN (MongoDB, Express, React, NodeJS) stack from scratch.

The aim is not to create a fully-featured CMS —the feature set is in fact very limited— but rather to illustrate how the MERN stack allows us to create powerful features with little boilerplate or overheads.

This repository contains the backend of the project: a RESTful API served by Express running on NodeJS that interacts with a MongoDB database. Excluding tests, the backend is just a couple hundred code-lines.

## Key Features
* Node 8 running Express
* MongoDB with Mongoose
* Exposes a RESTful API
* Tests for all resources
* Secure authentication with JWT and Bcrypt
* ES6 & ES7 features such as async/await used throughout
* Adaptable to different environments
* Integrated with Heroku for seamless deployments
* Supports Windows

## Running Locally

1) Ensure you have [Node](https://docs.npmjs.com/getting-started/installing-node) installed and that you have a [MongoDB](https://www.mongodb.com/download-center?jmp=nav#community) instance running locally.

2) Navigate to the project root and run:
```
npm install
```
This pulls in all dependencies. You only need to do this once.

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

This repository contains a [Postman](https://www.getpostman.com/) collection that you can import to interact with the API. Simply create a new environment with a variable 'url' set to your local URL or the demo URL and you can get start using the imported collection.

## Testing

The test suite includes the [Mocha](https://github.com/mochajs/mocha) testing framework, the [Expect](https://github.com/mjackson/expect) assertion library, and the [Supertest](https://github.com/visionmedia/supertest) HTTP assertion library. The testing suite spins up a test database which is dropped on completion of all tests. You must ensure you've run `npm install` before you can start testing.

To run the tests once, use:
```
npm test
```

Or to run the tests automatically on file changes, use:
```
npm run test-watch
```
