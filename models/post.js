const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
	_author: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
	},
	text: {
		type: String,
		required: true,
		minlength: 1,
		trim: true,
	},
	published: {
		type: Boolean,
		default: false,
	},
	published_at: {
		type: Number,
		default: null,
	},
});

const Post = mongoose.model('Post', postSchema);

module.exports = {Post};
