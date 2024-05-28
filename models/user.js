const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    preferredCourses: { type: [String], default: [] }
});

module.exports = mongoose.model('User', UserSchema);
