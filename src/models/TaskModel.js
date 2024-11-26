const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['Assigned', 'InProgress', 'Completed', 'Accepted', 'Rejected'], default: 'Assigned' },

}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
