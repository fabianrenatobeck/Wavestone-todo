const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    dueDate: Date,
    completed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    // optional: für Google Login
    userId: { type: String, required: false }
});

module.exports = mongoose.model('Task', TaskSchema);
