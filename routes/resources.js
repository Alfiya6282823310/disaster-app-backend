const express = require('express');
const ResourceModel = require('../model/resources'); // Adjust the path to your ResourceModel
const router = express.Router();

// Search resources
router.post('/searchResources', async (req, res) => {
    const { district, localBodyType } = req.body; // Removed localBodyName
    console.log(localBodyType);
    
    try {
        const resources = await ResourceModel.aggregate([
            {
                $match: {
                    district: district, // Match the district value passed in the request body
                    localBodyType: localBodyType // Also include the localBodyType in the match stage
                }
            },
            {
                $group: {
                    _id: "$resourceCategory", // Group by the resource category
                    totalQuantity: { $sum: "$resourceQuantity" } // Sum the resource quantities for each category
                }
            }
        ]);

        res.json(resources); // Return the results in the response

    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ error: 'Failed to search resources' }); // Return error message
    }
});


       

module.exports = router;
