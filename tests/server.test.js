const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./../server');
const { mongoose } = require('./../database/database');
const { Post } = require('./../models/post');
const { User } = require('./../models/user');

const {SEED_POSTS, SEED_USERS, seedPosts, seedUsers} = require('./seed/seed');

// Create the test database and seed with test data
beforeEach(seedUsers);
beforeEach(seedPosts);

// Delete the test database once all tests are finished
after(done => mongoose.connection.db.dropDatabase(done));

describe('POST /posts', () => {
	it('should create a new post', (done) => {
		const text = 'Test post text';

		request(app)
			.post('/posts')
			.set('Authorization', `Bearer ${SEED_USERS[0].tokens[0].token}`)
			.send({text})
			.expect(200)
			.expect((res) => {
				expect(res.body.post.text).toBe(text);
			})
			.end(async (err) => {
				if (err) return done(err);

				try {
					const posts = await Post.find({text});
					expect(posts.length).toBe(1);
					done();
				} catch (err) {
					done(err);
				}
			});
	});

	it('should not create a new post with invalid data', (done) => {
		request(app)
			.post('/posts')
			.set('Authorization', `Bearer ${SEED_USERS[0].tokens[0].token}`)
			.send({})
			.expect(400)
			.end(async (err) => {
				if (err) return done(err);

				try {
					const posts = await Post.find();
					expect(posts.length).toBe(SEED_POSTS.length);
					done();
				} catch (err) {
					done(err);
				}
			});
	});
});

describe('GET /posts', () => {
	it('should get all posts', (done) => {
		request(app)
			.get('/posts')
			.set('Authorization', `Bearer ${SEED_USERS[0].tokens[0].token}`)
			.expect(200)
			.expect((res) => {
				expect(res.body.posts.length).toBe(1);
			})
			.end(done);
	});
});

describe('GET /posts/:id', () => {
	const id = SEED_POSTS[0]._id.toHexString();

	it('should get a post', (done) => {
		request(app)
			.get(`/posts/${id}`)
			.set('Authorization', `Bearer ${SEED_USERS[0].tokens[0].token}`)
			.expect(200)
			.expect((res) => {
				expect(res.body.post.text).toBe(SEED_POSTS[0].text);
			})
			.end(done);
	});

	it('should not get a post created by another user', (done) => {
		request(app)
			.get(`/posts/${SEED_POSTS[1]._id.toHexString()}`)
			.set('Authorization', `Bearer ${SEED_USERS[0].tokens[0].token}`)
			.expect(404)
			.end(done);
	});

	it('should return 404 if post not found', (done) => {
		request(app)
			.get(`/posts/${new ObjectID()}`)
			.set('Authorization', `Bearer ${SEED_USERS[0].tokens[0].token}`)
			.expect(404)
			.end(done);
	});

	it('should return 404 if ObjectID is not valid', (done) => {
		request(app)
			.get('/posts/123')
			.set('Authorization', `Bearer ${SEED_USERS[0].tokens[0].token}`)
			.expect(404)
			.end(done);
	});
});

describe('DELETE /posts/:id', () => {
	const id = SEED_POSTS[0]._id.toHexString();

	it('should delete a post', (done) => {
		request(app)
			.delete(`/posts/${id}`)
			.set('Authorization', `Bearer ${SEED_USERS[0].tokens[0].token}`)
			.expect(200)
			.expect((res) => {
				expect(res.body.post._id).toBe(id);
			})
			.end(async (err) => {
				if (err) return done(err);

				try {
					const post = await Post.findById(id);
					expect(post).toNotExist();
					done();
				} catch (err) {
					done(err);
				}
			});
	});

	it('should not delete a post created by another user', (done) => {
		request(app)
			.delete(`/posts/${id}`)
			.set('Authorization', `Bearer ${SEED_USERS[1].tokens[0].token}`)
			.expect(404)
			.end(async (err) => {
				if (err) return done(err);

				try {
					const post = await Post.findById(id);
					expect(post).toExist();
					done();
				} catch (err) {
					done(err);
				}
			});
	});
	
	it('should return 404 if post not found', (done) => {
		request(app)
			.delete(`/posts/${new ObjectID()}`)
			.set('Authorization', `Bearer ${SEED_USERS[0].tokens[0].token}`)
			.expect(404)
			.end(done);
	});
	
	it('should return 404 if ObjectID is not valid', (done) => {
		request(app)
			.delete('/posts/123')
			.set('Authorization', `Bearer ${SEED_USERS[0].tokens[0].token}`)
			.expect(404)
			.end(done);
	});
});

describe('PATCH /posts/:id', () => {
	it('should update a post', (done) => {
		const id = SEED_POSTS[0]._id.toHexString();

		const update = {
			text: 'Updated text',
			published: true,
		};

		request(app)
			.patch(`/posts/${id}`)
			.set('Authorization', `Bearer ${SEED_USERS[0].tokens[0].token}`)
			.send(update)
			.expect(200)
			.expect((res) => {
				expect(res.body.post.text).toBe(update.text);
				expect(res.body.post.published).toBe(update.published);
				expect(res.body.post.published_at).toBeA('number');
			})
			.end(done);
	});

	it('should not update a post created by another user', (done) => {
		const id = SEED_POSTS[0]._id.toHexString();

		const update = {
			text: 'Updated text',
			published: true,
		};

		request(app)
			.patch(`/posts/${id}`)
			.set('Authorization', `Bearer ${SEED_USERS[1].tokens[0].token}`)
			.send(update)
			.expect(404)
			.end(done);
	});

	it('should clear published_at when post is not published', (done) => {
		const id = SEED_POSTS[1]._id.toHexString();

		const update = {
			text: 'Updated text',
			published: false,
		};

		request(app)
			.patch(`/posts/${id}`)
			.set('Authorization', `Bearer ${SEED_USERS[1].tokens[0].token}`)
			.send(update)
			.expect(200)
			.expect((res) => {
				expect(res.body.post.text).toBe(update.text);
				expect(res.body.post.published).toBe(update.published);
				expect(res.body.post.published_at).toNotExist();
			})
			.end(done);
	});

	it('should return 404 if post not found', (done) => {
		request(app)
			.patch(`/posts/${new ObjectID()}`)
			.set('Authorization', `Bearer ${SEED_USERS[0].tokens[0].token}`)
			.expect(404)
			.end(done);
	});

	it('should return 404 if ObjectID is not valid', (done) => {
		request(app)
			.patch('/posts/123')
			.set('Authorization', `Bearer ${SEED_USERS[0].tokens[0].token}`)
			.expect(404)
			.end(done);
	});
});

describe('GET /users/me', () => {
	it('should return user if authenticated', (done) => {
		request(app)
			.get('/users/me')
			.set('Authorization', `Bearer ${SEED_USERS[0].tokens[0].token}`)
			.expect(200)
			.expect((res) => {
				expect(res.body._id).toBe(SEED_USERS[0]._id);
				expect(res.body.email).toBe(SEED_USERS[0].email);
			})
			.end(done);
	});

	it('should return 401 if not authenticated', (done) => {
		request(app)
			.get('/users/me')
			.expect(401)
			.expect((res) => {
				expect(res.body).toEqual({});
			})
			.end(done);
	});
});

describe('POST /users', () => {
	it('should create a user', (done) => {
		const email = 'example3@example.com';
		const password = 'abcdef';

		request(app)
			.post('/users')
			.send({email, password})
			.expect(200)
			.expect((res) => {
				expect(res.headers['authorization']).toExist();
				expect(res.body._id).toExist();
				expect(res.body.email).toBe(email);
			})
			.end(async (err) => {
				if (err) return done(err);

				try {
					const user = await User.findOne({email});
					expect(user).toExist();
					// The password should be hashed
					expect(user.password).toNotBe(password);
					done();
				} catch (err) {
					done(err);
				}
			});
	});

	it('should return validation errors if request is invalid', (done) => {
		const email = 'email';
		const password = 'pw';

		request(app)
			.post('/users')
			.send({email, password})
			.expect(400)
			.end(done);
	});

	it('should not create user if email in use', (done) => {
		request(app)
			.post('/users')
			.send(SEED_USERS[1])
			.expect(400)
			.end(done);
	});
});

describe('POST users/login', () => {
	it('should log in a user and return an auth token', (done) => {
		request(app)
			.post('/users/login')
			.send({
				email: SEED_USERS[1].email,
				password: SEED_USERS[1].password,
			})
			.expect(200)
			.expect((res) => {
				expect(res.headers['authorization']).toExist();
			})
			.end(async (err, res) => {
				if (err) return done(err);

				try {
					const user = await User.findById(SEED_USERS[1]._id);
					expect(user.tokens[1]).toInclude({
						access: 'auth',
						token: res.headers['authorization'].replace('Bearer ', ''),
					});
					done();
				} catch (err) {
					done(err);
				}
			});
	});

	it('should reject invalid login', (done) => {
		request(app)
			.post('/users/login')
			.send({
				email: SEED_USERS[1].email,
				password: SEED_USERS[1].password + 'xyz',
			})
			.expect(400)
			.expect((res) => {
				expect(res.headers['authorization']).toNotExist();
			})
			.end(async (err) => {
				if (err) return done(err);

				try {
					const user = await User.findById(SEED_USERS[1]._id);
					expect(user.tokens.length).toBe(1);
					done();
				} catch (err) {
					done(err);
				}
			});
	});
});

describe('DELETE /users/me/token', () => {
	it('should remove auth token on logout', (done) => {
		request(app)
			.delete('/users/me/token')
			.set('Authorization', `Bearer ${SEED_USERS[0].tokens[0].token}`)
			.expect(200)
			.end(async (err) => {
				if (err) return done(err);

				try {
					const user = await User.findById(SEED_USERS[0]._id);
					expect(user.tokens.length).toBe(0);
					done();
				} catch (err) {
					done(err);
				}
			});
	});
});
