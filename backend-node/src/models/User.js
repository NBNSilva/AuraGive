const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    walletAddress: { 
        type: String, 
        required: true, 
        unique: true, 
        lowercase: true,
        index: true
    },
    role: { 
        type: String, 
        enum: ['DONOR', 'NGO', 'ADMIN'], 
        default: 'DONOR' 
    },
    name: { type: String },
    email: { type: String }, // Optional, mostly for notifications
    organizationDetails: {
        registrationNumber: { type: String },
        website: { type: String }
    }, // Relevant for NGOs
    totalDonated: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
