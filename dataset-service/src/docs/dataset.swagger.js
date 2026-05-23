/**
 * @swagger
 * tags:
 *   name: Datasets
 *   description: Dataset management APIs
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
 *     Dataset:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *
 *         fileName:
 *           type: string
 *
 *         originalName:
 *           type: string
 *
 *         filePath:
 *           type: string
 *
 *         fileSize:
 *           type: number
 *
 *         rowCount:
 *           type: number
 *
 *         uploadedBy:
 *           type: string
 *
 *         uploadTime:
 *           type: string
 *
 *         createdAt:
 *           type: string
 *
 *         updatedAt:
 *           type: string
 */

/**
 * @swagger
 * /api/datasets/upload:
 *   post:
 *     summary: Upload dataset file
 *     description: |
 *       Upload dataset files.
 * 
 *       supported file formats:
 *         - CSV
 *         - XLSX
 *         - XLS
 * 
 *       Maximum file size: 10MB
 *     tags: [Datasets]
 *
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *
 *             properties:
 *               dataset:
 *                 type: string
 *                 format: binary
 *                 description: Upload CSV, XLSX, or XLS files
 *
 *     responses:
 *       201:
 *         description: File uploaded successfully
 * 
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 * 
 *               properties:
 *                 message:
 *                   type: string
 *                   example: File uploaded successfully
 * 
 *                 dataset:
 *                   $ref: '#/components/schemas/Dataset'
 *
 *       400:
 *         description: Invalid file or validation error
 *
 *       401:
 *         description: Unauthorized
 *
 *       500:
 *         description: Error uploading dataset
 */

/**
 * @swagger
 * /api/datasets:
 *   get:
 *     summary: Get all datasets
 *     tags: [Datasets]
 *
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: List of datasets
 *
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *
 *               properties:
 *                 count:
 *                   type: number
 *
 *                 datasets:
 *                   type: array
 *
 *                   items:
 *                     $ref: '#/components/schemas/Dataset'
 *
 *       401:
 *         description: Unauthorized
 *
 *       500:
 *         description: Error fetching datasets
 */

/**
 * @swagger
 * /api/datasets/{id}:
 *   get:
 *     summary: Get dataset by ID
 *     tags: [Datasets]
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *
 *         schema:
 *           type: string
 *
 *     responses:
 *       200:
 *         description: Dataset found
 *
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Dataset'
 *
 *       404:
 *         description: Dataset not found
 *
 *       500:
 *         description: Error getting dataset
 */

/**
 * @swagger
 * /api/datasets/{id}:
 *   put:
 *     summary: Update dataset
 *     tags: [Datasets]
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *
 *         schema:
 *           type: string
 *
 *     requestBody:
 *       required: true
 *
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *
 *             properties:
 *               originalName:
 *                 type: string
 *
 *               rowCount:
 *                 type: number
 *
 *     responses:
 *       200:
 *         description: Dataset updated successfully
 *
 *       404:
 *         description: Dataset not found
 *
 *       500:
 *         description: Error updating dataset
 */

/**
 * @swagger
 * /api/datasets/archive/{id}:
 *   put:
 *     summary: Archive dataset
 *     tags: [Datasets]
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *
 *         schema:
 *           type: string
 *
 *     responses:
 *       200:
 *         description: Dataset archived successfully
 *
 *       404:
 *         description: Dataset not found
 *
 *       500:
 *         description: Error archiving dataset
 */

/**
 * @swagger
 * /api/datasets/{id}:
 *   delete:
 *     summary: Delete dataset
 *     tags: [Datasets]
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *
 *         schema:
 *           type: string
 *
 *     responses:
 *       200:
 *         description: Dataset deleted successfully
 *
 *       404:
 *         description: Dataset not found
 *
 *       500:
 *         description: Error deleting dataset
 */