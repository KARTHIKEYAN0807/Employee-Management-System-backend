const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Import fs for filesystem operations
const cors = require('cors');
const { check, validationResult } = require('express-validator');
require('dotenv').config(); // Load environment variables

const app = express();
app.use(cors());

// Increase the payload size limit
app.use(bodyParser.json({ limit: '10mb' })); 
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Ensure the 'uploads' directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

app.use('/uploads', express.static('uploads'));

// MongoDB Atlas connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.log('MongoDB connection error:', err));

// User Schema for login
const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true }
});

const User = mongoose.model('User', UserSchema);

// Employee Schema
const EmployeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    mobile: { type: String, required: true },
    designation: { type: String, required: true },
    gender: { type: String, required: true },
    course: { type: [String], required: true },
    image: String, // Path to uploaded image
    createdAt: { type: Date, default: Date.now }
});

const Employee = mongoose.model('Employee', EmployeeSchema);

// File Upload Configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // The directory must exist
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5 MB
    fileFilter: function (req, file, cb) {
        const fileTypes = /jpeg|jpg|png/;
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = fileTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Error: Images Only!')); // Improved error handling
        }
    }
});

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) return res.status(401).json({ message: 'Access denied. No token provided.' });

    const token = authHeader.replace('Bearer ', '');

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid token.' });
    }
};

// Root route
app.get('/', (req, res) => {
    res.send('Server is up and running');
});

// Register Route
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already taken' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user
        const newUser = new User({
            username,
            password: hashedPassword
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error('Error during registration:', err);
        res.status(500).json({ message: 'Server error during registration', error: err.message });
    }
});

// Login Route
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Login attempt received:', username); // Debugging log

    try {
        // Find user in the database
        const user = await User.findOne({ username });
        if (!user) {
            console.log('User not found');
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Password does not match');
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Generate a token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        console.log('Login successful');
        res.status(200).json({ token, user: { id: user._id, username: user.username } });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ message: 'Server error during login', error: err.message });
    }
});

// Create Employee API
app.post('/api/employees', 
    authenticateToken,
    upload.single('image'),
    [
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('mobile', 'Mobile number is required').isNumeric(),
        check('designation', 'Designation is required').not().isEmpty(),
        check('gender', 'Gender is required').not().isEmpty(),
        check('course', 'Course is required').not().isEmpty()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            // Check for duplicate email
            const existingEmployee = await Employee.findOne({ email: req.body.email });
            if (existingEmployee) {
                return res.status(400).json({ message: 'Email already exists' });
            }

            const employee = new Employee({
                ...req.body,
                image: req.file ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` : null // Construct the full URL for the image
            });
            await employee.save();
            res.json({ message: 'Employee created successfully', employee });
        } catch (err) {
            console.error('Error creating employee:', err);
            res.status(500).json({ message: 'Server error while creating employee', error: err.message });
        }
    }
);

// Get Employee List API with Pagination and Search
app.get('/api/employees', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;

        const query = search ? { name: new RegExp(search, 'i') } : {};
        const employees = await Employee.find(query)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Employee.countDocuments(query);
        res.json({
            employees,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (err) {
        console.error('Error fetching employees:', err);
        res.status(500).json({ message: 'Server error while fetching employees', error: err.message });
    }
});

// Get Specific Employee by ID
app.get('/api/employees/:id', authenticateToken, async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });
        res.json(employee);
    } catch (err) {
        console.error('Error fetching employee:', err);
        res.status(500).json({ message: 'Server error while fetching employee', error: err.message });
    }
});

// Update Employee API
app.put('/api/employees/:id', 
    authenticateToken,
    upload.single('image'),
    [
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('mobile', 'Mobile number is required').isNumeric(),
        check('designation', 'Designation is required').not().isEmpty(),
        check('gender', 'Gender is required').not().isEmpty(),
        check('course', 'Course is required').not().isEmpty()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            let employee = await Employee.findById(req.params.id);
            if (!employee) return res.status(404).json({ message: 'Employee not found' });

            // Update employee fields
            const updatedData = {
                ...req.body,
                image: req.file ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` : employee.image // Only update if a new image is uploaded
            };
            
            employee = await Employee.findByIdAndUpdate(
                req.params.id, 
                updatedData, 
                { new: true }
            );

            res.json({ message: 'Employee updated successfully', employee });
        } catch (err) {
            console.error('Error updating employee:', err);
            res.status(500).json({ message: 'Server error while updating employee', error: err.message });
        }
    }
);

// Delete Employee API
app.delete('/api/employees/:id', authenticateToken, async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });

        await Employee.findByIdAndDelete(req.params.id);
        res.json({ message: 'Employee deleted successfully' });
    } catch (err) {
        console.error('Error deleting employee:', err);
        res.status(500).json({ message: 'Server error while deleting employee', error: err.message });
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
