/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management APIs
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * 
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *         username:
 *           type: string
 *         email:
 *           type: string
 *         role:
 *           type: string
 *           enum:
 *             - administrator
 *             - operator
 *             - nonActive
 *         createdBy:
 *           type: string
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 *
 *     LoginRequest:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *         password:
 *           type: string
 *     
 *     LoginResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: User logged in successfully
 * 
 *     token:
 *       type: string
 *       example: eyJhbGciOiJIUzI1NiIsInR5cCI...
 *
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *       properties:
 *         username:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 *         role:
 *           type: string
 *           enum:
 *             - administrator
 *             - operator
 *             - nonActive
 *
 *     RegisterResponse:
 *       type: object
 * 
 *       properties:
 *         message:
 *           type: string
 *           example: User registered successfully
 * 
 *         user:
 *           $ref: '#/components/schemas/User'
 */

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Login user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Missing username or password
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: User is not active
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register new user
 *     tags: [Users]
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *
 *     responses:
 *       200:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegisterResponse'
 *       400:
 *         description: Validation error
 *       403:
 *         description: Maximum role limit reached
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 * 
 *       404:
 *         description: No users found
 *
 *       401:
 *         description: Unauthorized
 *
 *       403:
 *         description: Forbidden
 *
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [Users]
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *
 *     responses:
 *       200:
 *         description: User updated successfully
 *
 *       401:
 *         description: Unauthorized
 *
 *       404:
 *         description: User not found
 *
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Users]
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *
 *     responses:
 *       200:
 *         description: User deleted successfully
 *
 *       401:
 *         description: Unauthorized
 *
 *       404:
 *         description: User not found
 *
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/users/deactivate/{id}:
 *   put:
 *     summary: Deactivate user
 *     tags: [Users]
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *
 *     responses:
 *       200:
 *         description: User deactivated successfully
 *
 *       400:
 *         description: Invalid ID
 *
 *       404:
 *         description: User not found
 *
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/users/reactivate/{id}:
 *   put:
 *     summary: Reactivate user
 *     tags: [Users]
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *
 *     responses:
 *       200:
 *         description: User reactivated successfully
 *
 *       400:
 *         description: Invalid ID
 *
 *       404:
 *         description: User not found
 *
 *       500:
 *         description: Internal server error
 */