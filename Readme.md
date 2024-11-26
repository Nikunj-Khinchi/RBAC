### Task Management System - Role-Based Access Control (RBAC)

- This project is a Task Management System built with Node.js and Express, demonstrating the implementation of Role-Based Access Control (RBAC). Users can register, log in, and perform actions based on their roles, such as Admin, Moderator, or User.


#### Features
- Authentication:
    - Registration and login using JWT.
    - Secure password hashing with bcrypt.

- Authorizations:
    - Role-Based Access Control (RBAC) for Admin, Moderator, and User roles.

-  Task Management:
    - Create, read, update, and delete tasks.
    - Moderator Assign tasks to users.
    - User can view and update their assigned tasks.
    - Admin can view all tasks, users, and moderators.
    - Display tasks based on user roles.

#### API EndPoints
- **POST auth/register**: Register a new user.
- **POST auth/login**: Login a user.
- **Post auth/forgotPassword**: Forgot password.
- **POST auth/getAllUsers**: Get all users by Admin only.
- **POST auth/deleteAccount**: Delete user account by Admin only.

- **Post /task/create**: Create a new task by Moderator only and assigned to users.
- **GET /task/getTask**: Admins can get all tasks, Moderators can get tasks they created, and Users can get tasks assigned.

- **PATCH /task/updateStatus**: Admin can update any status, Moderators can updated [Accepted, Rejected] task status, and Users can update [Completed, InProgress].

- **DELETE /task/deleteTask**: Admin can delete any task, Moderators can delete tasks they created.

#### Technologies
- Node.js
- Express.js
- MongoDB
- JWT
- Bcrypt
- Mongoose

#### Installation
1. Clone the repository: `git clone <URL>`
2. Change into the project directory: `cd task-management-system`
3. Install the dependencies: `npm install`
4. Create a `.env` file in the root directory and add the following environment variables:
    ```
    PORT=3000
    MONGO_URI=your_mongodb_uri
    JWT_SECRET=your_jwt_secret
    ```
5. Start the server: `npm start`
6. The server will be running on `http://localhost:3000`




