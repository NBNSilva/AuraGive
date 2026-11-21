const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    type: { 
        type: String, 
        enum: ['DONATION', 'DISBURSEMENT', 'MINT'], 
        default: 'DONATION' 
    },
    campaignId: { type: String },
    campaignTitle: { type: String, required: true },
    donorWallet: { type: String, default: '0x0000000000000000000000000000000000000000' },
    recipientWallet: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USDC' },
    hash: { type: String, required: true },
    status: { type: String, default: 'Confirmed' },
    date: { type: String }, // e.g. "2026-07-08"
    milestone: { type: String },
    ocrStatus: { type: String },
    ocrDetail: { type: String },
    receiptFilename: { type: String },
    createdAt: { type: Date, default: Date.now }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

TransactionSchema.virtual('id').get(function() {
    return this._id.toString();
});

module.exports = mongoose.model('Transaction', TransactionSchema);
