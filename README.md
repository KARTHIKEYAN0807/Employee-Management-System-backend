

# Employee Management System

## Overview
The Employee Management System is a full-stack web application that allows users to register, log in, and manage employees. The system includes functionalities for user registration, login, adding, editing, deleting, and listing employees. The backend is built using Node.js and Express.js with MongoDB for data storage, while the frontend is built with React.js.

## Features
- User Registration and Login with JWT Authentication
- Create, Read, Update, and Delete (CRUD) operations for employees
- Image upload and display for employee profiles
- Secure API endpoints with token-based authentication
- Responsive design using Bootstrap

## Tech Stack
- **Frontend**: React.js, React Router, Axios, Bootstrap
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT for authentication
- **Deployment**: 
  - Frontend: Netlify
  - Backend: Render

## Project Structure
### Backend
- **Server**: `server.js` - Sets up the Express server and defines API routes
- **Models**: 
  - `UserSchema`: Defines the schema for user data in MongoDB
  - `EmployeeSchema`: Defines the schema for employee data in MongoDB
- **Middleware**: Authentication middleware using JWT
- **Routes**: Handles user registration, login, and employee CRUD operations
- **File Uploads**: Uses `multer` for image uploads

### Frontend
- **Components**:
  - `App.js`: Main application component with routing
  - `Register.js`: Registration form component
  - `Login.js`: Login form component
  - `Dashboard.js`: Dashboard for displaying and managing employees
  - `EmployeeForm.js`: Form for adding/editing employees
- **Routing**: Uses React Router for client-side routing
- **State Management**: Local component state using React `useState` and `useEffect` hooks
- **API Integration**: Uses Axios for HTTP requests to the backend

## Installation and Setup
### Prerequisites
- Node.js
- MongoDB Atlas or local MongoDB instance
- Netlify account for frontend deployment
- Render account for backend deployment

### Backend Setup
1. Clone the backend repository:
   ```bash
   git clone <backend-repo-url>
   cd <backend-repo-folder>
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory and add the following environment variables:
   ```env
   MONGODB_URI=<your-mongodb-uri>
   JWT_SECRET=<your-jwt-secret>
   ```
4. Start the server:
   ```bash
   npm start
   ```
   The server will run on `http://localhost:5000`.

### Frontend Setup
1. Clone the frontend repository:
   ```bash
   git clone <frontend-repo-url>
   cd <frontend-repo-folder>
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Update the backend URL in Axios requests in your frontend code to match your deployed backend URL.
4. Start the development server:
   ```bash
   npm start
   ```
   The frontend will run on `http://localhost:3000`.

### Deployment
- **Frontend (Netlify)**:
  1. Commit and push your frontend code to GitHub.
  2. Connect the GitHub repository to Netlify and deploy.
- **Backend (Render)**:
  1. Commit and push your backend code to GitHub.
  2. Connect the GitHub repository to Render and deploy.

## Usage
1. **Register**: Navigate to the register page and create a new account.
2. **Login**: Use the registered credentials to log in.
3. **Dashboard**: After logging in, you will be redirected to the dashboard where you can:
   - Add new employees
   - Edit existing employees
   - Delete employees
   - View employee details with their profile images
4. **Logout**: Use the logout button to securely end the session.

## API Endpoints
### Authentication
- **POST** `/api/register` - Register a new user
  - Body: `{ "username": "example", "password": "password123" }`
- **POST** `/api/login` - Login a user and receive a JWT
  - Body: `{ "username": "example", "password": "password123" }`

### Employees
- **POST** `/api/employees` - Create a new employee (Authenticated)
- **GET** `/api/employees` - Get a list of employees (Authenticated)
- **GET** `/api/employees/:id` - Get details of a specific employee (Authenticated)
- **PUT** `/api/employees/:id` - Update an employee's details (Authenticated)
- **DELETE** `/api/employees/:id` - Delete an employee (Authenticated)

## Security
- **JWT Authentication**: Protects API routes to ensure only authenticated users can perform certain actions.
- **Password Hashing**: User passwords are hashed using `bcrypt` before being stored in the database.

## Error Handling
- Backend responses include appropriate HTTP status codes and error messages.
- Frontend displays error alerts for user-friendly feedback.

## Known Issues and Limitations
- The current version does not include advanced user roles and permissions.
- File upload size is limited to 5 MB.
- Mixed content errors may occur if the frontend and backend URLs are not both HTTPS.

## Future Enhancements
- Implement role-based access control (e.g., Admin, User).
- Add more detailed employee information and functionalities.
- Enhance UI/UX with more design elements and animations.
- Implement pagination and filtering for the employee list.
- Add support for exporting employee data.

## Contribution
1. Fork the repository on GitHub.
2. Create a new branch for your feature or bugfix.
3. Commit your changes with descriptive commit messages.
4. Push your branch and create a pull request.

## License
This project is licensed under the MIT License. See the LICENSE file for details.

