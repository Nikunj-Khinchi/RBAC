const Task = require("../models/TaskModel");
const WriteResponse = require("../utils/response");
const logger = require("../utils/logger");
const joi = require("joi");
const User = require("../models/UserModel");

const taskSchema = joi.object({
    title: joi.string().required(),
    description: joi.string().required(),
    assignedTo: joi.string().required(),
});

const createTask = async (req, res) => {
    const errors = taskSchema.validate(req.body).error;
    if (errors) {
        logger.error(errors.details[0].message || "Invalid task data");
        return WriteResponse(
            res,
            400,
            errors.details[0].message || "Invalid task data"
        );
    }
    try {
        const { title, description, assignedTo } = req.body;
        const createdBy = req.user._id;

        const user = await User.findById(assignedTo);
        if (!user) {
            return WriteResponse(res, 404, "Assigned user not found");
        }

        if(user.role === "Admin" || user.role === "Moderator") {
            return WriteResponse(res, 403, "Cannot assign task to admin or moderator");
        }

        const task = new Task({ title, description, createdBy, assignedTo });
        await task.save();

        logger.info("Task created successfully");
        return WriteResponse(res, 201, "Task created", task);
    } catch (error) {
        logger.error(`Task creation error: ${error.message}`);
        return WriteResponse(res, 500, "Internal server error");
    }
};

const getTasks = async (req, res) => {
    try {
        const userRole = req.user.role;
        let filter = {};

        if (userRole === "Moderator") {
            filter = { createdBy: req.user._id };
        } else if (userRole === "User") {
            filter = { assignedTo: req.user._id };
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const tasks = await Task.find(filter)
            .populate("createdBy", "name")
            .populate("assignedTo", "name")
            .skip(skip)
            .limit(limit);

        const totalTasks = await Task.countDocuments(filter);

        const pagination = {
            totalTasks,
            currentPage: page,
            totalPages: Math.ceil(totalTasks / limit),
            hasNextPage: page * limit < totalTasks,
            hasPrevPage: page > 1
        };

        logger.info("Tasks fetched successfully");
        return WriteResponse(res, 200, "Tasks fetched", { tasks, pagination });
    } catch (error) {
        logger.error(`Fetch tasks error: ${error.message}`);
        return WriteResponse(res, 500, "Internal server error");
    }
};

const updateTask = async (req, res) => {
    try {
        const taskId = req.params.id;
        const { status } = req.body;
        const role = req.user.role;

        const forbiddenStatusForUser = ["Accepted", "Rejected"];
        const forbiddenStatusForModerator = ["Completed", "InProgress"];

        const task = await Task.findById(taskId);
        if (!task) {
            return WriteResponse(res, 404, "Task not found");
        }

        if (role === "User") {
            if (forbiddenStatusForUser.includes(status) || task.assignedTo.toString() !== req.user._id) {
                return WriteResponse(res, 403, "Access denied. You do not have permission to perform this action.");
            }
        } else if (role === "Moderator") {
            if (forbiddenStatusForModerator.includes(status) || task.createdBy.toString() !== req.user._id) {
                return WriteResponse(res, 403, "Access denied. You do not have permission to perform this action.");
            }
        }
        // Allow Admin to update any status
        task.status = status;
        await task.save();

        logger.info("Task updated successfully");
        return WriteResponse(res, 200, "Task updated", task);
    } catch (error) {
        logger.error(`Update task error: ${error.message}`);
        return WriteResponse(res, 500, "Internal server error");
    }
};

const deleteTask = async (req, res) => {
    try {
        const taskId = req.params.id;
        const role = req.user.role
        const task = await Task.findById(taskId);
        if (!task) {
            return WriteResponse(res, 404, "Task not found");
        }

        if (role === "Moderator") {
            if (task.createdBy.toString() !== req.user._id) {
                return WriteResponse(res, 403, "Task not created by you. You do not have permission to delete this task.");
            }
        }
        
        // Allow Admin to delete any task
        await task.remove();
        logger.info("Task deleted successfully");
        return WriteResponse(res, 200, "Task deleted");
    } catch (error) {
        logger.error(`Delete task error: ${error.message}`);
        return WriteResponse(res, 500, "Internal server error");
    }
};


module.exports = {
    createTask,
    getTasks,
    updateTask,
    deleteTask
};
