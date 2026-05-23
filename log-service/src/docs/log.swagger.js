/**
 * @swagger
 * tags:
 *   name: Logs
 *   description: Activity log management APIs
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
 *     ActivityLog:
 *       type: object
 *
 *       properties:
 *         _id:
 *           type: string
 *
 *         action:
 *           type: string
 *           example: LOGIN_USER
 *
 *         description:
 *           type: string
 *           example: User admin logged in successfully
 *
 *         userId:
 *           type: string
 *
 *         doneBy:
 *           type: string
 *           example: admin
 *
 *         role:
 *           type: string
 *           example: administrator
 *
 *         createdAt:
 *           type: string
 *
 *         updatedAt:
 *           type: string
 */

/**
 * @swagger
 * /api/logs:
 *   post:
 *     summary: Create activity log
 *     tags: [Logs]
 *
 *     requestBody:
 *       required: true
 *
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *
 *             required:
 *               - action
 *               - description
 *
 *             properties:
 *               action:
 *                 type: string
 *
 *               description:
 *                 type: string
 *
 *               userId:
 *                 type: string
 *
 *               doneBy:
 *                 type: string
 *
 *               role:
 *                 type: string
 *
 *     responses:
 *       201:
 *         description: Activity log created successfully
 *
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ActivityLog'
 *
 *       500:
 *         description: Error creating log
 */

/**
 * @swagger
 * /api/logs:
 *   get:
 *     summary: Get activity logs
 *     tags: [Logs]
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of logs per page
 *
 *       - in: query
 *         name: user
 *         schema:
 *           type: string
 *         description: Search by username
 *
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Filter by role
 *
 *     responses:
 *       200:
 *         description: List of activity logs
 *
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *
 *               properties:
 *                 page:
 *                   type: number
 *
 *                 totalPage:
 *                   type: number
 *
 *                 totalData:
 *                   type: number
 *
 *                 data:
 *                   type: array
 *
 *                   items:
 *                     $ref: '#/components/schemas/ActivityLog'
 *
 *       401:
 *         description: Unauthorized
 *
 *       403:
 *         description: You are not an administrator
 *
 *       500:
 *         description: Error getting activity logs
 */