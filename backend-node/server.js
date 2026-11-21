const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const User = require('./src/models/User');
const Campaign = require('./src/models/Campaign');
const Transaction = require('./src/models/Transaction');

const app = express();
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/donation_platform';
mongoose.connect(MONGO_URI).then(async () => {
    console.log('Connected to MongoDB');
    await seedDatabase();
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

async function seedDatabase() {
    const campaignCount = await Campaign.countDocuments();
    if (campaignCount === 0) {
        console.log("Seeding initial campaigns...");
        const initialCampaigns = [
            {
                title: 'Clean Drinking Water Well',
                category: 'Sanitation',
                location: 'Kurunegala',
                goal: 2000,
                raised: 1200,
                score: 92,
                image: '/images/campaign-1.jpg',
                description: "We are raising funds to build a clean drinking water well for Galgamuwa Kanishta Vidyalaya in Kurunegala.",
                scoreBreakdown: "School Identity: Verified. Location: Verified.",
                status: 'Active',
                milestones: [{ name: "Well construction", amount: 2000, status: "pending" }]
            },
            {
                title: 'Main Hall Roof Renovation',
                category: 'Infrastructure',
                location: 'Nuwara Eliya',
                goal: 5000,
                raised: 2500,
                score: 88,
                image: '/images/campaign-2.jpg',
                description: "The main hall roof at Hatton Tamil Maha Vidyalaya in Nuwara Eliya is severely damaged. We need urgent funds for roofing materials and repairs.",
                scoreBreakdown: "School Identity: Verified. Location: Verified.",
                status: 'Active',
                milestones: [{ name: "Roofing materials", amount: 5000, status: "pending" }]
            },
            {
                title: 'Primary Classroom Desks & Chairs',
                category: 'Furniture',
                location: 'Badulla',
                goal: 1500,
                raised: 1500,
                score: 95,
                image: '/images/campaign-3.jpg',
                description: "Mahiyangana Rural Primary in Badulla desperately needs new desks and chairs for their young students.",
                scoreBreakdown: "School Identity: Verified. Location: Verified.",
                status: 'Completed',
                milestones: [{ name: "Furniture purchase", amount: 1500, status: "completed" }]
            },
            {
                title: 'Solar Power for IT Lab',
                category: 'Energy & IT',
                location: 'Batticaloa',
                goal: 4000,
                raised: 1000,
                score: 85,
                image: '/images/campaign-4.jpg',
                description: "Providing solar panels to power the IT lab at Kiran Maha Vidyalaya in Batticaloa to ensure uninterrupted learning.",
                scoreBreakdown: "School Identity: Verified. Location: Warning.",
                status: 'Active',
                milestones: [{ name: "Solar panels installation", amount: 4000, status: "pending" }]
            },
            {
                title: 'Library Books and Shelving',
                category: 'Libraries',
                location: 'Anuradhapura',
                goal: 1000,
                raised: 400,
                score: 90,
                image: '/images/campaign-5.jpg',
                description: "Funding new educational books and sturdy shelving for the Padaviya Vidyalaya library in Anuradhapura.",
                scoreBreakdown: "School Identity: Verified. Location: Verified.",
                status: 'Pending AI Review',
                milestones: [{ name: "Books and shelves", amount: 1000, status: "pending" }]
            }
        ];
        await Campaign.insertMany(initialCampaigns);
        console.log("Database seeded with 5 campaigns.");
    }

    const txCount = await Transaction.countDocuments();
    if (txCount === 0) {
        console.log("Seeding initial transactions for Transparency Ledger...");
        const initialTransactions = [
            {
                type: 'DONATION',
                campaignTitle: 'Clean Drinking Water Well',
                donorWallet: '0x3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
                amount: 350,
                currency: 'USDC',
                hash: '0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b5c6d7e8f9a0b1c2d3e4f5a6b',
                status: 'Confirmed',
                date: '2026-09-14'
            },
            {
                type: 'DONATION',
                campaignTitle: 'Main Hall Roof Renovation',
                donorWallet: '0x7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f',
                amount: 500,
                currency: 'USDC',
                hash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
                status: 'Confirmed',
                date: '2026-09-12'
            },
            {
                type: 'DISBURSEMENT',
                campaignTitle: 'Primary Classroom Desks & Chairs',
                milestone: 'Furniture purchase',
                amount: 1500,
                currency: 'USDC',
                hash: '0x8f7a6b5c4d3e2f1a0b9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b5c6d7e',
                status: 'Confirmed',
                date: '2026-09-10',
                ocrStatus: 'Verified',
                ocrDetail: 'Invoice matches timber supplier receipt and school principal signoff.',
                receiptFilename: 'badulla_desks_invoice.pdf'
            },
            {
                type: 'DONATION',
                campaignTitle: 'Solar Power for IT Lab',
                donorWallet: '0x2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d',
                amount: 250,
                currency: 'USDC',
                hash: '0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e',
                status: 'Confirmed',
                date: '2026-09-08'
            },
            {
                type: 'DISBURSEMENT',
                campaignTitle: 'Main Hall Roof Renovation',
                milestone: 'Roofing materials tranche 1',
                amount: 2000,
                currency: 'USDC',
                hash: '0x5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d',
                status: 'Confirmed',
                date: '2026-09-05',
                ocrStatus: 'Verified',
                ocrDetail: 'Bank wire receipt verified against hardware contractor invoice.',
                receiptFilename: 'hatton_roofing_receipt.pdf'
            }
        ];
        await Transaction.insertMany(initialTransactions);
        console.log("Database seeded with initial transactions.");
    }
}

// Auth Route
app.post('/api/auth/login', async (req, res) => {
    try {
        const { walletAddress, role, name, email } = req.body;
        if (!walletAddress) {
            return res.status(400).json({ error: 'Wallet address is required' });
        }

        let user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });

        if (!user) {
            user = new User({
                walletAddress: walletAddress.toLowerCase(),
                role: role || 'DONOR',
                name: name || '',
                email: email || ''
            });
            await user.save();
        }

        res.json({ user, message: 'Login successful' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Campaign Routes
app.get('/api/campaigns', async (req, res) => {
    try {
        const { category, search } = req.query;
        let query = {};
        if (category) query.category = category;
        if (search) query.title = { $regex: search, $options: 'i' };

        const campaigns = await Campaign.find(query).sort({ createdAt: -1 });
        res.json(campaigns);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/campaigns', async (req, res) => {
    try {
        const campaign = new Campaign(req.body);
        await campaign.save();
        res.status(201).json(campaign);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/campaigns/:id', async (req, res) => {
    try {
        const campaign = await Campaign.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
        res.json(campaign);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/campaigns/:id', async (req, res) => {
    try {
        const campaign = await Campaign.findByIdAndDelete(req.params.id);
        if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
        res.json({ message: 'Campaign deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Transaction & Transparency Ledger Routes
app.get('/api/transactions', async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ createdAt: -1 });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/transactions', async (req, res) => {
    try {
        const tx = new Transaction(req.body);
        await tx.save();
        res.status(201).json(tx);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// AI Review Proxy Endpoint
app.post('/api/campaigns/review', async (req, res) => {
    try {
        const { title, goal, requested_usd, category, remoteness, description, milestones, district, location, scale_index } = req.body;

        // Forward full parameters to Python AI microservice
        const aiResponse = await fetch('http://127.0.0.1:5000/analyse', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: title || "",
                category: category || "Infrastructure",
                remoteness: remoteness || "Medium",
                district: district || location || "",
                requested_usd: parseFloat(requested_usd || goal || 2000),
                scale_index: parseInt(scale_index || 5),
                description: description || ""
            })
        });

        if (!aiResponse.ok) {
            throw new Error(`AI Service returned ${aiResponse.status}`);
        }

        const aiData = await aiResponse.json();

        const campaignData = {
            title,
            goal: goal || requested_usd,
            category,
            remoteness,
            district: district || location,
            description,
            milestones,
            date: new Date().toISOString().split('T')[0],
            status: aiData.status === 'High Trust' ? 'Approved' : 'Pending AI Review',
            score: aiData.trust_score || 0,
            scoreBreakdown: aiData.breakdown || "No breakdown provided",
            signals: aiData.signals || {}
        };

        res.status(200).json(campaignData);
    } catch (error) {
        console.error("AI Review error:", error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
