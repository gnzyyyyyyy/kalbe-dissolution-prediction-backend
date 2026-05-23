const axios = require("axios");

const logActivity = async (action, description, user) => {
    try {
        const response = await axios.post(
            `${process.env.LOG_SERVICE_URL}/api/logs`,
            {
                action,
                description,
                userId: user?.id || null,
                doneBy: user?.username || "Unknown User",
                role: user?.role || "system"
            }
        );

        console.log("LOG SUCCESS:", response.data);

    } catch (error) {

        console.log("===== LOG ERROR =====");

        if (error.response) {
            console.log(error.response.data);
        } else {
            console.log(error.message);
        }

        console.log("=====================");
    }
};

module.exports = logActivity;