// routes/employeeRoutes.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const Employee = require('../models/Employee');

const router = express.Router();

// Create or Update Employee
router.post(
    '/employee',
    [
        body('f_Email').isEmail().withMessage('Invalid email format'),
        body('f_Mobile').isNumeric().withMessage('Mobile number must be numeric'),
        body('f_Image').custom((value, { req }) => {
            if (!req.files || Object.keys(req.files).length === 0) {
                throw new Error('No files were uploaded.');
            }
            const file = req.files.image;
            if (!file.mimetype.startsWith('image/')) {
                throw new Error('Only image files are allowed.');
            }
            if (!['image/jpeg', 'image/png'].includes(file.mimetype)) {
                throw new Error('Only .jpg and .png files are allowed.');
            }
            return true;
        })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const employeeData = req.body;

        try {
            // Check for email duplication
            const existingEmployee = await Employee.findOne({ f_Email: employeeData.f_Email });
            if (existingEmployee) {
                return res.status(400).json({ message: 'Email already exists' });
            }

            // Save or Update employee
            const employee = new Employee(employeeData);
            await employee.save();
            res.status(201).json({ message: 'Employee created/updated successfully', employee });
        } catch (err) {
            res.status(500).json({ message: 'Server error', error: err.message });
        }
    }
);

module.exports = router;
