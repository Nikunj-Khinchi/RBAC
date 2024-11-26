const express = require('express');
const router = express.Router();
const WriteResponse = require('../utils/response');
const logger = require('../utils/logger');

const authRoutes = require('./authRoutes');
const taskRoutes = require('./taskRoutes');


router.get('/healthcheck', (req, res) => {
    logger.info('Healthcheck route hit');
    return WriteResponse(res, 200, 'Server is up and running', {"status": "ok"});
});

router.use('/auth', authRoutes);
router.use('/task', taskRoutes);


module.exports = router;