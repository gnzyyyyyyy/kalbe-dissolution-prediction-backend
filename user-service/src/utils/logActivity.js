const axios = require("axios");

const logActivity = async (action, description, user) => {
    try {
        await axios.post(`${process.env.LOG_SERVICE_URL}/api/logs`, {
            action,
            description,
            userId: user?.id || null,
            doneBy: user?.username || null,
            role: user?.role || "system"
        });
    } catch (error) {
        console.log("Log service unavailable");
    }
};

module.exports = logActivity;