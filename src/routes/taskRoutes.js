const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authentication = require('../middleware/authenticationMiddleware');
const authorization = require('../middleware/authorizationMiddleware');

router.post('/create',authorization, authentication("Moderator"), taskController.createTask);
router.get('/getTask', authorization, authentication("Admin", "Moderator", "User"), taskController.getTasks)
router.patch('/updateStatus/:id', authorization, authentication("Admin", "Moderator", "User"), taskController.updateTask);
router.delete('/delete/:id', authorization, authentication("Admin", "Moderator"), taskController.deleteTask);

module.exports = router;
