// routes/loginRoutes.js
const express = require('express');
const router = express.Router();
const Login = require('../models/Login'); // Assuming you have a Login model

// Login route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find user in the database
        const user = await Login.findOne({ f_userName: username, f_Pwd: password });
        if (!user) {
            return res.status(401).json({ message: 'Invalid login details' });
        }

        // Send user data in response
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
