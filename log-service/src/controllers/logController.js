const ActivityLog = require("../models/ActivityLog");

exports.createLog = async (req, res) => {
    try {
        const { action, description, userId, doneBy, role } = req.body;

        const log = await ActivityLog.create({
            action,
            description,
            userId,
            doneBy,
            role
        });

        res.status(201).json(log);
    } catch (error) {
        res.status(500).json({
            message: "Error creating log",
            error: error.message
        });
    }
};

exports.getActivityLogs = async (req, res) => {
    try {
        //Take input
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const user = req.query.user;
        const role = req.query.role;

        const query = {};

        if (user) {
            query.doneBy = {$regex: user, $options: "i"};
        }

        if (role) {
            query.role = role;
        }

        const skip = (page - 1) * limit;

        const total = await ActivityLog.countDocuments(query);
        
        const logs = await ActivityLog.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        res.status(200).json({
            page,
            totalPage: Math.ceil(total / limit),
            totalData: total,
            data: logs
        });
    } catch (error) {
        res.status(500).json({
            message: "Error getting activity logs",
            error: error.message
        });
    }
}