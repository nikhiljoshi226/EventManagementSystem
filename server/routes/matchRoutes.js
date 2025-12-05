// server/routes/matchRoutes.js
const express = require('express');
const router = express.Router();
const { extractAndEmbed, findMatches } = require('../controllers/matchController');
const auth = require('../middleware/auth');

// Process resume and generate embeddings
router.post('/process-resume/:userId', auth, async (req, res, next) => {
    try {
        const user = await extractAndEmbed(req.params.userId);
        res.json({ 
            success: true,
            message: 'Resume processed successfully',
            skills: user.skills,
            interests: user.interests
        });
    } catch (error) {
        next(error);
    }
});

// Get mentor recommendations
router.get('/recommendations/:userId', auth, async (req, res, next) => {
    try {
        const matches = await findMatches(req.params.userId);
        res.json({
            success: true,
            matches
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;