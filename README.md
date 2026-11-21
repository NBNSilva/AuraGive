# AuraGive: Blockchain & AI-Powered School Infrastructure Platform (Sri Lanka)

AuraGive is a decentralized, AI-verified fundraising platform designed to rebuild and empower school infrastructure in Sri Lanka. The platform combines Named Entity Recognition (NER) AI validation against official Ministry datasets with milestone-based smart contract escrow on the **Polygon Amoy Testnet (Chain ID 80002)**.

---

## 📁 Project Architecture & Directory Structure

```text
AuraGive/
├── frontend/             # Donor Web Application (React, Tailwind, ethers.js) -> Port 5173
│   ├── src/              # Donor dashboard, campaign explore, Web3 donate modal
│   └── .env              # Polygon Amoy RPC & Smart Contract address
│
├── frontend-admin/       # Admin Web Application (React, Tailwind, ethers.js) -> Port 5174
│   ├── src/              # Admin dashboard, AI verification UI, on-chain campaign minting
│   └── .env              # Polygon Amoy RPC & Smart Contract address
│
├── backend-node/         # REST API & Orchestration (Express, MongoDB, Mongoose) -> Port 3001
│   ├── src/models/       # MongoDB schemas (Campaign, User, Milestones)
│   ├── server.js         # API server, auto-seeder, AI review proxy
│   └── .env              # MongoDB URI, platform keys, contract address
│
├── backend-ai/           # AI Verification Microservice (FastAPI, spaCy, scikit-learn) -> Port 5000
│   ├── app.py            # AI Trust Score & Sri Lanka school registry verification API
│   ├── schools_dataset.csv # Official registry dataset for geographic & identity checks
│   ├── auragive_trust_model.pkl # Trained Random Forest model (Google Colab)
│   ├── trust_model_scaler.pkl   # Fitted StandardScaler feature pipeline
│   ├── TRUST_SCORE_MODEL_TRAINING_GUIDE.md # Prompt for ChatGPT & Google Colab training steps
│   └── requirements.txt
│
└── smart-contracts/      # Solidity Escrow & Hardhat Environment
    ├── contracts/        # DonationEscrow.sol & IDonationEscrow.sol
    ├── scripts/          # deploy.js (Polygon Amoy deployment script)
    └── hardhat.config.js # Network configuration for Polygon Amoy (80002)
```

---

## ⚙️ Environment Configuration

Before launching the services, create `.env` files in each service directory (you can copy from the `.env.example` templates):

### 1. `backend-node/.env`
```env
PORT=3001
MONGO_URI=mongodb://127.0.0.1:27017/donation_platform
PLATFORM_WALLET_PRIVATE_KEY=your_private_key_here
POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology/
SMART_CONTRACT_ADDRESS=0xYourDeployedDonationEscrowAddress
```

### 2. `frontend-admin/.env`
```env
VITE_POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology/
VITE_SMART_CONTRACT_ADDRESS=0xYourDeployedDonationEscrowAddress
VITE_CHAIN_ID=80002
```

### 3. `frontend/.env`
```env
VITE_POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology/
VITE_SMART_CONTRACT_ADDRESS=0xYourDeployedDonationEscrowAddress
VITE_CHAIN_ID=80002
```

---

## 🚀 How to Run the Entire Project (Terminal Order)

Open **5 separate terminal windows** (PowerShell on Windows or Bash on macOS/Linux) and execute the steps in the following order:

---

### 🖥️ Terminal 1: Database (MongoDB)
Ensure MongoDB is running locally on port `27017` (or ensure your remote MongoDB Atlas connection string is set in `backend-node/.env`).

```powershell
# If using local MongoDB installed as a Windows Service:
net start MongoDB

# Or run mongod directly:
mongod --dbpath "C:\data\db"
```

---

### 🖥️ Terminal 2: AI Verification Microservice (Port 5000)
Starts the FastAPI microservice that extracts school names, verifies districts against the official registry, and executes ML inference using `auragive_trust_model.pkl` and `trust_model_scaler.pkl`.

```powershell
cd d:\Project\AuraGive\backend-ai

# Activate virtual environment
.\venv\Scripts\activate
# (On macOS/Linux: source venv/bin/activate)

# Install dependencies (first time only)
pip install -r requirements.txt

# Start the AI microservice on Port 5000
python app.py
```
> **Health Check:** Open `http://localhost:5000/health` in your browser. It should return `{"status":"healthy","model_loaded":true,"scaler_loaded":true}`.

---

### 🖥️ Terminal 3: Node.js Backend API (Port 3001)
Starts the Express REST API that handles campaign data, metrics, database seeding, and AI proxying.

```powershell
cd d:\Project\AuraGive\backend-node

# Install dependencies (first time only)
npm install

# Start the server (auto-seeds initial campaigns on first run)
npm start
```
> **API Check:** Open `http://localhost:3001/api/campaigns`. It should return the active campaign records.

---

### 🖥️ Terminal 4: Admin Frontend (Port 5174)
Starts the Vite dev server for the Admin Campaign Management and AI On-Chain Publishing dashboard.

```powershell
cd d:\Project\AuraGive\frontend-admin

# Install dependencies (first time only)
npm install

# Start the dev server
npm run dev
```
> **Admin UI:** Open `http://localhost:5174` in your browser.

---

### 🖥️ Terminal 5: Donor Frontend (Port 5173)
Starts the Vite dev server for the Donor web application where supporters browse campaigns and donate USDC via Polygon Amoy.

```powershell
cd d:\Project\AuraGive\frontend

# Install dependencies (first time only)
npm install

# Start the dev server
npm run dev
```
> **Donor UI:** Open `http://localhost:5173` in your browser.

---

## ⚡ (Optional) Smart Contract Deployment to Polygon Amoy

If you want to deploy a fresh instance of `DonationEscrow.sol` to the Polygon Amoy testnet:

1. Fund your deployer wallet with testnet **POL** from the [Polygon Faucet](https://faucet.polygon.technology/).
2. Add your deployer private key to `backend-node/.env` as `PLATFORM_WALLET_PRIVATE_KEY`.
3. Deploy the contract:
   ```powershell
   cd d:\Project\AuraGive\smart-contracts
   npm install
   npx hardhat compile
   npx hardhat run scripts/deploy.js --network amoy
   ```
4. Copy the printed contract address into:
   - `frontend-admin/.env` &rarr; `VITE_SMART_CONTRACT_ADDRESS`
   - `frontend/.env` &rarr; `VITE_SMART_CONTRACT_ADDRESS`
   - `backend-node/.env` &rarr; `SMART_CONTRACT_ADDRESS`

---

## 🧪 End-to-End Workflow Testing

1. **Sign In to Admin (`localhost:5174`)**:
   - Sign in with any admin email and password.
   - Click **"Connect Admin Wallet"** in the top bar (MetaMask will connect and switch to Polygon Amoy).
   - Go to **"Create Campaign"**, enter title, description, district, and requested amount.
   - Click **"Generate AI Trust Score"** &rarr; the NER model validates the parameters.
   - If verified (&ge; 80%), click **"Publish to Network"** &rarr; confirm the transaction in MetaMask.
   - View your transaction receipt directly on [Polygon Amoy Polygonscan](https://amoy.polygonscan.com/).

2. **Explore & Donate as Donor (`localhost:5173`)**:
   - Open the Donor portal at `localhost:5173`.
   - Click **"Connect Wallet"** &rarr; view your live POL and USDC balances.
   - Select a campaign and click **"Donate Now"**.
   - Type a contribution amount:
     - If exceeding the remaining target, the modal immediately warns you.
     - Click **"Confirm Donation"** &rarr; MetaMask prompts for USDC approval (if needed) and final escrow transfer.
   - View the confirmed transaction recorded in real-time on the **Transparency Ledger**!
