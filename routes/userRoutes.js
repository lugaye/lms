const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Login route
router.post('/login', async (req, res) => {
    const { name } = req.body;
    let user = await User.findOne({ name });
    if (!user) {
        user = new User({ name });
        await user.save();
    }
    res.json(user);
});

// Logout route
router.post('/logout', (req, res) => {
    res.json({ message: 'Logged out' });
});

// Save courses route
router.post('/save-courses', async (req, res) => {
    const { name, preferredCourses } = req.body;
    const user = await User.findOne({ name });
    if (user) {
        user.preferredCourses = preferredCourses;
        await user.save();
        res.json({ message: 'Courses saved successfully', user });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

// Get user courses route
router.post('/get-courses', async (req, res) => {
    const { name } = req.body;
    const user = await User.findOne({ name });
    if (user) {
        res.json({ preferredCourses: user.preferredCourses });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

module.exports = router;
