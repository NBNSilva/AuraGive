const mongoose = require('mongoose');

const MilestoneSchema = new mongoose.Schema({
    id: { type: Number },
    name: { type: String },
    milestoneId: { type: Number },
    description: { type: String },
    amount: { type: Number },
    proofDocumentCid: { type: String },
    aiAuditScore: { type: Number, min: 0, max: 100 },
    aiAuditFeedback: { type: String },
    status: { 
        type: String, 
        default: 'pending' 
    },
    requestedAt: { type: Date },
    processedAt: { type: Date }
});

const CampaignSchema = new mongoose.Schema({
    // Backend/On-Chain specifics
    campaignId: { type: Number, index: true },
    onChainId: { type: Number, index: true },
    txHash: { type: String },
    ngoWallet: { type: String, lowercase: true, index: true, default: '0x0000000000000000000000000000000000000000' },
    
    // Core fields matching frontend
    title: { type: String, required: true },
    schoolName: { type: String, default: '' },
    category: { type: String, default: 'Uncategorized' },
    remoteness: { type: String, default: 'Medium' },
    location: { type: String, default: 'Unknown' },
    
    // Financials
    goal: { type: Number, required: true },
    raised: { type: Number, default: 0 },
    
    // AI Score and Status
    score: { type: Number, default: 0, min: 0, max: 100 },
    scoreBreakdown: { type: String, default: 'No breakdown provided' },
    status: { type: String, default: 'Pending AI Review' },
    
    // Media & Details
    image: { type: String, default: '/images/auth-hero-3d.png' },
    description: { type: String },
    
    // Sub-documents
    milestones: [MilestoneSchema],
    
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Map MongoDB _id to id for frontend compatibility
CampaignSchema.virtual('id').get(function() {
    return this._id.toString();
});

module.exports = mongoose.model('Campaign', CampaignSchema);
