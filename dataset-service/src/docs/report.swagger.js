/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Dataset report APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     DatasetReport:
 *       type: object
 *
 *       properties:
 *         _id:
 *           type: string
 *
 *         dataSetId:
 *           type: string
 *
 *         predictionId:
 *           type: string
 *
 *         datasetName:
 *           type: string
 *
 *         uploadedBy:
 *           type: string
 *
 *         predictionResult:
 *           type: string
 *
 *         reportCreatedBy:
 *           type: string
 *
 *         statusReport:
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
 * /api/reports:
 *   get:
 *     summary: Get dataset reports
 *     tags: [Reports]
 *
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: List of reports
 *
 *       401:
 *         description: Unauthorized
 *
 *       500:
 *         description: Error fetching reports
 */

/**
 * @swagger
 * /api/reports/archive/{id}:
 *   put:
 *     summary: Archive dataset report
 *     tags: [Reports]
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
 *         description: Dataset report archived
 *
 *       404:
 *         description: Dataset report not found
 *
 *       500:
 *         description: Error updating report
 */