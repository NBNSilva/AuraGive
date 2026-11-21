import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation, useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, LogOut, Moon, Sun, Wallet, Heart, Search, MapPin, ListFilter, Activity, ArrowLeft, CheckCircle2, Circle, FileText, AlertCircle, Info, User, Settings, CreditCard, Mail, Lock, Eye, EyeOff, PlusCircle, Loader2, Sparkles, ArrowRight, Check, HelpCircle, Download, ExternalLink, Copy, RefreshCw, Layers, ChevronDown, ChevronUp, Cpu, Database, Receipt, Scale, GraduationCap, Building, Zap, BarChart3, XCircle, Menu, X } from 'lucide-react';
import { ethers } from 'ethers';
import { 
  ensureAmoyNetwork, 
  getSigner, 
  getEscrowContract, 
  getUsdcContract, 
  getBrowserProvider, 
  getJsonRpcProvider,
  getExplorerTxUrl, 
  formatWeb3Error, 
  isContract,
  getPolygonFeeOverrides,
  SMART_CONTRACT_ADDRESS,
  USDC_TOKEN_ADDRESS,
  SYSTEM_WALLET_ADDRESS
} from './utils/web3';

function ThemeToggle({ isDark, setIsDark }) {
  useEffect(() => {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [isDark]);
  return (
    <button className="icon-action-btn" onClick={() => setIsDark(!isDark)} title="Toggle Theme">
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

function Navbar({ walletAddress, setWalletAddress, userEmail, setUserEmail, isDark, setIsDark }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const walletMenuRef = useRef(null);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (walletMenuRef.current && !walletMenuRef.current.contains(event.target)) {
        setShowWalletMenu(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const [polBalance, setPolBalance] = useState('0.00');
  const [usdcBalance, setUsdcBalance] = useState('0.00');

  const connectWallet = async () => {
    try {
      await ensureAmoyNetwork();
      const provider = getBrowserProvider();
      if (!provider) {
        alert("Please install MetaMask!");
        return;
      }
      const accounts = await provider.send("eth_requestAccounts", []);
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
      }
    } catch (err) {
      console.error("Wallet connection failed", err);
      alert(formatWeb3Error(err));
    }
  };

  useEffect(() => {
    if (walletAddress) {
      const fetchBalances = async () => {
        try {
          const provider = getBrowserProvider() || getJsonRpcProvider();
          if (provider) {
            // 1. Fetch POL balance
            try {
              const bal = await provider.getBalance(walletAddress);
              const polNum = parseFloat(ethers.formatEther(bal));
              setPolBalance(polNum > 0 && polNum < 0.001 ? '<0.001' : polNum.toFixed(4));
            } catch (polErr) {
              console.warn("Could not fetch POL balance:", polErr);
            }

            // 2. Fetch USDC balance directly from official Amoy USDC contract
            try {
              const usdc = getUsdcContract(USDC_TOKEN_ADDRESS, provider);
              const decimals = await usdc.decimals().catch(() => 6);
              const uBal = await usdc.balanceOf(walletAddress);
              setUsdcBalance(parseFloat(ethers.formatUnits(uBal, decimals)).toFixed(2));
            } catch (usdcErr) {
              console.warn("Could not fetch USDC balance:", usdcErr);
            }
          }
        } catch (e) {
          console.error("Balance fetch error:", e);
        }
      };
      fetchBalances();
      const interval = setInterval(fetchBalances, 12000);
      return () => clearInterval(interval);
    }
  }, [walletAddress]);

  const isCampaignsActive = location.pathname === '/' || location.pathname.startsWith('/campaign');
  const isTransparencyActive = location.pathname === '/transactions';
  const isHowItWorksActive = location.pathname === '/about';
  const userInitial = (userEmail ? userEmail.charAt(0) : 'U').toUpperCase();

  return (
    <header className="navbar-header navbar-glass">
      <div className="navbar-container">
        {/* Left Side: Brand Lockup & Direct Section Navigation */}
        <div className="navbar-left">
          <Link to="/" className="navbar-brand-lockup">
            <div className="brand-logo-emblem">
              <ShieldCheck size={20} className="brand-shield-icon" />
            </div>
            <div className="brand-title-wrap">
              <span className="brand-wordmark">Aura<span className="brand-highlight">Give</span></span>
              <span className="brand-sub-badge">Sri Lanka</span>
            </div>
          </Link>

          <div className="navbar-nav-divider" />

          {/* Primary Navigation Sections */}
          <nav className="navbar-nav-links" aria-label="Main navigation">
            <Link 
              to="/" 
              className={`nav-link-item ${isCampaignsActive ? 'active' : ''}`}
            >
              <Layers size={15} className="nav-item-icon" />
              <span>Campaigns</span>
              {isCampaignsActive && <span className="nav-active-bar" />}
            </Link>

            <Link 
              to="/transactions" 
              className={`nav-link-item ${isTransparencyActive ? 'active' : ''}`}
            >
              <Activity size={15} className="nav-item-icon" />
              <span>Transparency</span>
              {isTransparencyActive && <span className="nav-active-bar" />}
            </Link>

            <Link 
              to="/about" 
              className={`nav-link-item ${isHowItWorksActive ? 'active' : ''}`}
            >
              <HelpCircle size={15} className="nav-item-icon" />
              <span>How It Works</span>
              {isHowItWorksActive && <span className="nav-active-bar" />}
            </Link>
          </nav>
        </div>

        {/* Right Side: Web3 Status & Unified Controls */}
        <div className="navbar-right">
          {/* Network Badge */}
          <div className="network-status-badge" title="Polygon Amoy Testnet">
            <span className="network-name">Polygon Amoy</span>
          </div>

          {/* Wallet Button */}
          {walletAddress ? (
            <div className="relative" ref={walletMenuRef}>
              <button 
                className="wallet-btn connected wallet-connected-chip"
                onClick={() => setShowWalletMenu(!showWalletMenu)}
                title="Account Details"
              >
                <div className="wallet-chip-icon">
                  <Wallet size={14} />
                </div>
                <div className="wallet-chip-info">
                  <span className="wallet-chip-addr">{walletAddress.substring(0, 6)}...{walletAddress.substring(38)}</span>
                  <span className="wallet-chip-balance">{usdcBalance} USDC</span>
                </div>
                <ChevronDown size={13} className="wallet-chip-chevron" />
              </button>
              
              {showWalletMenu && (
                <div className="dropdown-menu wallet-dropdown-card">
                  <div className="dropdown-header">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-semibold uppercase tracking-wider">Polygon Amoy Testnet</div>
                    <div className="font-bold text-lg text-indigo-500">{usdcBalance} USDC</div>
                    <div className="text-xs font-mono text-gray-400 mt-1">{polBalance} POL Gas</div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <button 
                    className="dropdown-item text-red-500"
                    onClick={() => {
                      setWalletAddress('');
                      setShowWalletMenu(false);
                    }}
                  >
                    <LogOut size={16} /> Disconnect Wallet
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="wallet-btn connect-wallet-cta" onClick={connectWallet} title="Connect Web3 Wallet">
              <Wallet size={15} />
              <span>Connect Wallet</span>
            </button>
          )}

          <div className="navbar-controls-divider" />

          {/* Theme & Profile Group */}
          <div className="navbar-utility-group">
            <ThemeToggle isDark={isDark} setIsDark={setIsDark} />

            <div className="relative" ref={profileMenuRef}>
              <button 
                className="user-avatar-btn"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                title="Account & Settings"
              >
                <span className="user-avatar-letter">{userInitial}</span>
              </button>
              {showProfileMenu && (
                <div className="dropdown-menu profile-dropdown-card">
                  <div className="dropdown-header">
                    <div className="font-bold text-gray-800 dark:text-gray-200">{(userEmail || 'guest@auragive.org').split('@')[0]}</div>
                    <div className="text-xs text-gray-500 truncate">{userEmail || 'Guest'}</div>
                  </div>
                  
                  <Link 
                    to="/transactions?filter=my_donations" 
                    className="dropdown-item text-gray-700 dark:text-gray-300"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <CreditCard size={16} /> My Donations
                  </Link>
                  
                  <button className="dropdown-item text-gray-700 dark:text-gray-300">
                    <Settings size={16} /> Settings
                  </button>
                  
                  <div className="dropdown-divider"></div>
                  
                  <button 
                    className="dropdown-item text-red-500"
                    onClick={() => {
                      setUserEmail('');
                      setWalletAddress('');
                      localStorage.removeItem('aura_user_email');
                      localStorage.removeItem('aura_wallet_address');
                      localStorage.removeItem('aura_auth_type');
                      localStorage.removeItem('aura_user_profile');
                      setShowProfileMenu(false);
                    }}
                  >
                    <LogOut size={16} /> Log Out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Toggle */}
            <button 
              className="mobile-nav-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          <div className="mobile-nav-links">
            <Link 
              to="/" 
              className={`mobile-nav-link ${isCampaignsActive ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Layers size={18} />
              <span>Campaigns</span>
            </Link>
            <Link 
              to="/transactions" 
              className={`mobile-nav-link ${isTransparencyActive ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Activity size={18} />
              <span>Transparency</span>
            </Link>
            <Link 
              to="/about" 
              className={`mobile-nav-link ${isHowItWorksActive ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <HelpCircle size={18} />
              <span>How It Works</span>
            </Link>
          </div>
          <div className="mobile-drawer-footer">
            <div className="mobile-drawer-network">
              <span>Polygon Amoy Network</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function DonateModal({ campaign, onClose, onSuccessDonation, walletAddress }) {
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState('input'); // 'input' | 'preparing' | 'approving' | 'donating' | 'success' | 'error'
  const [statusText, setStatusText] = useState('');
  const [txHash, setTxHash] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showNonceGuide, setShowNonceGuide] = useState(false);
  const isSubmittingRef = useRef(false);

  if (!campaign) return null;

  const remainingGoal = Math.max(0, campaign.goal - (campaign.raised || 0));
  const numericAmount = parseFloat(amount || 0);
  const isOver = numericAmount > remainingGoal;

  const handleDonate = async () => {
    if (isSubmittingRef.current) return;
    if (!walletAddress) {
      alert("Please connect your wallet first from the navigation bar!");
      return;
    }

    if (!amount || isNaN(amount) || numericAmount <= 0 || isOver) {
      return;
    }

    isSubmittingRef.current = true;
    setErrorMessage('');
    setShowNonceGuide(false);
    setStep('preparing');
    setStatusText('Preparing transaction on Polygon Amoy...');
    
    try {
      await ensureAmoyNetwork();
      const signer = await getSigner();
      const provider = getBrowserProvider() || signer.provider || getJsonRpcProvider();

      // 1. Initialize USDC token contract
      const usdc = getUsdcContract(USDC_TOKEN_ADDRESS, signer);
      const decimals = await usdc.decimals().catch(() => 6);
      const parsedAmount = ethers.parseUnits(amount.toString(), decimals);

      // 2. Check user USDC balance
      const balance = await usdc.balanceOf(walletAddress);
      if (balance < parsedAmount) {
        throw new Error(`Insufficient USDC balance. You have ${ethers.formatUnits(balance, decimals)} USDC, but tried to donate ${amount} USDC.`);
      }

      // 3. Determine recipient destination (system address or smart contract)
      const targetAddress = SYSTEM_WALLET_ADDRESS || SMART_CONTRACT_ADDRESS;
      if (!targetAddress || targetAddress === ethers.ZeroAddress) {
        throw new Error("Target address for donation is not configured.");
      }

      // Check if destination is a deployed smart contract or an EOA system wallet
      const targetIsContract = await isContract(targetAddress, provider);
      let finalTxHash = '';

      // Fetch required gas fee overrides for Polygon Amoy (min tip cap: 25 Gwei)
      const feeOverrides = await getPolygonFeeOverrides(provider);

      if (targetIsContract) {
        // Escrow Smart Contract Workflow: approve -> donate
        const escrow = getEscrowContract(signer);
        const currentAllowance = await usdc.allowance(walletAddress, targetAddress);
        if (currentAllowance < parsedAmount) {
          setStep('approving');
          setStatusText('Requesting approval to spend USDC in MetaMask...');
          const approveTx = await usdc.approve(targetAddress, parsedAmount, feeOverrides);
          setStatusText('Waiting for approval confirmation on Polygon Amoy...');
          await approveTx.wait();
        }

        setStep('donating');
        setStatusText('Please confirm the donation transaction in your MetaMask wallet...');
        const onChainId = campaign.onChainId !== undefined && campaign.onChainId !== null ? campaign.onChainId : 0;
        const donateTx = await escrow.donate(onChainId, parsedAmount, feeOverrides);
        setTxHash(donateTx.hash);
        finalTxHash = donateTx.hash;
        setStatusText('Mining donation transaction on Polygon Amoy...');
        await donateTx.wait();
      } else {
        // Direct EOA / System Address Transfer Workflow: transfer(targetAddress, parsedAmount)
        setStep('donating');
        setStatusText(`Please confirm the USDC transfer to system address (${targetAddress.slice(0, 6)}...${targetAddress.slice(-4)}) in MetaMask...`);
        const transferTx = await usdc.transfer(targetAddress, parsedAmount, feeOverrides);
        setTxHash(transferTx.hash);
        finalTxHash = transferTx.hash;
        setStatusText('Confirming USDC transfer on Polygon Amoy...');
        await transferTx.wait();
      }

      setStep('success');
      onSuccessDonation({
        amount: numericAmount,
        txHash: finalTxHash,
        campaign
      });
    } catch (err) {
      console.error("Donation error:", err);
      const formatted = formatWeb3Error(err);
      setErrorMessage(formatted);
      if (
        formatted.includes("pending or queued") ||
        formatted.includes("nonce") ||
        formatted.includes("previous transaction")
      ) {
        setShowNonceGuide(true);
      }
      setStep('error');
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const isBusy = step === 'preparing' || step === 'approving' || step === 'donating';

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose} disabled={isBusy}>✕</button>
        <h2 className="text-2xl font-bold mb-2">Donate to {campaign.title}</h2>
        <p className="text-muted mb-4">Donate USDC directly to this verified school campaign on Polygon Amoy.</p>
        
        {step === 'input' && (
          <>
            <label className="label">Amount (USDC) - <span className="text-sm font-normal text-slate-500">Remaining: {remainingGoal} USDC</span></label>
            <input 
              type="number" 
              className={`input-field ${isOver ? 'border-red-500 focus:border-red-500 mb-2' : 'mb-6'}`} 
              placeholder="e.g. 50" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
            />
            
            {isOver && (
              <p className="text-red-500 text-sm mb-4 font-medium">
                Incorrect amount: You cannot donate more than the remaining goal of {remainingGoal} USDC for this campaign.
              </p>
            )}
            
            <button 
              className="btn btn-primary w-full py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              onClick={handleDonate}
              disabled={!amount || isNaN(amount) || numericAmount <= 0 || isOver || isSubmittingRef.current}
            >
              <Heart size={20} /> Confirm Donation (Polygon Amoy)
            </button>
          </>
        )}

        {isBusy && (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <Loader2 size={42} className="animate-spin text-indigo-500 mb-4" />
            <h3 className="font-bold text-lg mb-2">
              {step === 'preparing' ? 'Preparing Transaction' : step === 'approving' ? 'Step 1 of 2: USDC Token Approval' : 'Processing USDC Transfer'}
            </h3>
            <p className="text-sm text-slate-500 max-w-md">{statusText}</p>
          </div>
        )}

        {step === 'success' && (
          <div className="py-6 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="font-bold text-xl mb-2">Donation Successful!</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
              You have successfully contributed <strong>{amount} USDC</strong> to {campaign.title}.
            </p>
            {txHash && (
              <a 
                href={getExplorerTxUrl(txHash)} 
                target="_blank" 
                rel="noreferrer" 
                className="text-indigo-500 hover:underline text-xs font-mono mb-6 flex items-center justify-center gap-1"
              >
                <span>View on Polygonscan ({txHash.slice(0, 10)}...{txHash.slice(-8)})</span>
                <ExternalLink size={12} />
              </a>
            )}
            <button className="btn btn-primary w-full" onClick={onClose}>
              Done
            </button>
          </div>
        )}

        {step === 'error' && (
          <div className="py-6 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 mb-4">
              <AlertCircle size={32} />
            </div>
            <h3 className="font-bold text-xl mb-2">Transaction Could Not Complete</h3>
            <p className="text-sm text-rose-600 dark:text-rose-400 mb-4 max-w-md">{errorMessage}</p>

            {showNonceGuide && (
              <div className="w-full text-left bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4 mb-4 text-xs">
                <div className="font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5 mb-2">
                  <Info size={16} /> How to Clear Stuck MetaMask Transactions:
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-700 dark:text-slate-300">
                  <li>Open your <strong>MetaMask</strong> extension window.</li>
                  <li>Under the <strong>Activity</strong> tab, if there is a pending transaction, click <strong>Cancel</strong>.</li>
                  <li>Alternatively, click your account icon in MetaMask &gt; <strong>Settings</strong> &gt; <strong>Advanced</strong>.</li>
                  <li>Click <strong>Clear activity and nonce data</strong> (this is safe and only resets local cache).</li>
                  <li>Click <strong>Try Again</strong> below to re-submit your donation cleanly.</li>
                </ol>
              </div>
            )}

            <div className="flex gap-3 w-full">
              <button 
                className="btn btn-outline flex-1" 
                onClick={() => {
                  setStep('input');
                  setErrorMessage('');
                  setShowNonceGuide(false);
                }}
              >
                Try Again
              </button>
              <button className="btn btn-primary flex-1" onClick={onClose}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CampaignDetail({ campaigns, setCampaigns, walletAddress, setWalletAddress, userEmail, setUserEmail, isDark, setIsDark, transactions, setTransactions }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showDonateModal, setShowDonateModal] = useState(false);
  
  const campaign = campaigns.find(c => String(c.id) === String(id));

  if (!campaign) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Campaign Not Found</h2>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Back to Explore</button>
      </div>
    );
  }

  const handleDonateClick = () => {
    if (!walletAddress) {
      alert("Please connect your wallet first from the navigation bar!");
      return;
    }
    setShowDonateModal(true);
  };

  const handleSuccessDonation = async ({ amount, txHash, campaign: c }) => {
    const newRaised = Math.min(c.goal, (c.raised || 0) + amount);

    // 1. Create standardized transaction record
    const newTx = {
      id: Date.now(),
      type: 'DONATION',
      date: new Date().toISOString().split('T')[0],
      campaignTitle: c.title,
      campaignId: c._id || c.id,
      donorWallet: walletAddress || '0x0000000000000000000000000000000000000000',
      amount: amount.toFixed(2),
      currency: 'USDC',
      status: 'Confirmed',
      hash: txHash
    };

    // Update in-memory transactions state
    if (setTransactions) {
      setTransactions(prev => [newTx, ...prev.filter(t => t.hash?.toLowerCase() !== txHash?.toLowerCase())]);
    }

    // Persist to localStorage for persistence across reloads
    try {
      const stored = JSON.parse(localStorage.getItem('aura_transactions') || '[]');
      const updated = [newTx, ...stored.filter(t => t.hash?.toLowerCase() !== txHash?.toLowerCase())];
      localStorage.setItem('aura_transactions', JSON.stringify(updated));
    } catch (storageErr) {
      console.warn("Could not save to localStorage:", storageErr);
    }

    // Persist to backend MongoDB transactions collection
    try {
      await fetch('http://localhost:3001/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'DONATION',
          campaignTitle: c.title,
          campaignId: c._id || c.id,
          donorWallet: walletAddress || '0x0000000000000000000000000000000000000000',
          amount: parseFloat(amount.toFixed(2)),
          currency: 'USDC',
          hash: txHash,
          status: 'Confirmed',
          date: new Date().toISOString().split('T')[0]
        })
      });
    } catch (apiErr) {
      console.warn("Backend transactions API offline, saved locally:", apiErr);
    }

    // 2. Sync updated raised amount to backend Node API
    try {
      await fetch(`http://localhost:3001/api/campaigns/${c._id || c.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raised: newRaised })
      });
      if (setCampaigns) {
        setCampaigns(prev => prev.map(item => (item.id === c.id || item._id === c._id) ? { ...item, raised: newRaised } : item));
      }
    } catch (err) {
      console.error("Failed to sync raised amount:", err);
    }
  };

  return (
    <div className="min-h-screen pb-16 relative">
      <Navbar 
        walletAddress={walletAddress} 
        setWalletAddress={setWalletAddress} 
        userEmail={userEmail} 
        setUserEmail={setUserEmail}
        isDark={isDark}
        setIsDark={setIsDark}
      />
      
      <div className="details-container">
        <button className="details-back-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={18} /> Back to Campaigns
        </button>

        <div className="details-glass-panel">
          <div className="details-hero-image" style={{ backgroundImage: `url(${campaign.image})` }}></div>
          
          <div className="details-content-wrapper">
            <div className="details-main-content">
              <div className="details-header-info">
                <span className="campaign-category">{campaign.category}</span>
                <span className="details-location"><MapPin size={14}/> {campaign.schoolName ? `${campaign.schoolName}, ` : ''}{campaign.location}, Sri Lanka</span>
                
                <div className="trust-badge-container">
                  <span className={`trust-badge cursor-help ${campaign.score > 80 ? 'trust-high' : campaign.score > 50 ? 'trust-med' : 'trust-low'}`}>
                    <ShieldCheck size={14} /> AI Trust Score: {campaign.score}% <Info size={12} className="trust-info-icon"/>
                  </span>
                  <div className="trust-tooltip">
                    <div className="trust-tooltip-header">AI Analysis Breakdown</div>
                    <ul className="trust-tooltip-list">
                      {campaign.scoreBreakdown.split('. ').filter(Boolean).map((text, i) => (
                        <li key={i}>{text}</li>
                      ))}
                    </ul>
                    <div className="trust-tooltip-arrow"></div>
                  </div>
                </div>
              </div>
              
              <h1 className="details-title">{campaign.title}</h1>
              
              <div className="details-description">
                <h3 className="details-subtitle">About the Campaign</h3>
                <p>{campaign.description}</p>
              </div>
            </div>
            
            <div className="details-sidebar">
              <div className="sidebar-card">
                <div className="sidebar-label">Total Raised</div>
                <div className="sidebar-amount">{campaign.raised} <span>/ {campaign.goal} USDC</span></div>
                
                <div className="progress-container">
                  <div className="progress-bar" style={{ width: `${(campaign.raised / campaign.goal) * 100}%` }}></div>
                </div>

                <ul className="sidebar-stats">
                  <li>
                    <span>Backers</span>
                    <span className="stat-value">124</span>
                  </li>
                  <li>
                    <span>Days Left</span>
                    <span className="stat-value">14</span>
                  </li>
                </ul>
                
                <button className="btn btn-primary details-donate-btn" onClick={handleDonateClick}>
                  <Heart size={20} /> Donate Now
                </button>
                <div className="sidebar-footer">
                  <ShieldCheck size={14} className="text-green-500"/> Verified on Polygon Network
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DonateModal 
        campaign={showDonateModal ? campaign : null} 
        onClose={() => setShowDonateModal(false)} 
        onSuccessDonation={handleSuccessDonation} 
        walletAddress={walletAddress}
      />
    </div>
  );
}


function EmailAuth({ setUserEmail, setWalletAddress }) {
  const [activeTab, setActiveTab] = useState('signin'); // 'web3' | 'signin' | 'signup'
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Email Auth state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userRole, setUserRole] = useState('DONOR');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Web3 Connection State
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletError, setWalletError] = useState('');

  // Handle Web3 Connection
  const connectWeb3Wallet = async () => {
    if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
      setIsConnecting(true);
      setWalletError('');
      setFormError('');
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts.length > 0) {
          const selectedAddress = accounts[0];

          // Attempt network switch to Polygon Amoy
          try {
            await ensureAmoyNetwork();
          } catch (netErr) {
            console.warn("Polygon Amoy switch note:", netErr);
          }

          // Persist session
          localStorage.setItem('aura_user_email', selectedAddress);
          localStorage.setItem('aura_wallet_address', selectedAddress);
          localStorage.setItem('aura_auth_type', 'wallet');

          // Notify backend if available
          try {
            await fetch('http://localhost:3001/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                walletAddress: selectedAddress,
                role: 'DONOR'
              })
            });
          } catch (apiErr) {
            console.info("Backend offline, proceeding with on-chain session:", apiErr);
          }

          // Update app state
          if (setWalletAddress) setWalletAddress(selectedAddress);
          setUserEmail(selectedAddress);
        }
      } catch (err) {
        console.error("Wallet connection failed:", err);
        if (err.code === 4001) {
          setWalletError('Connection request was declined in your wallet.');
        } else {
          setWalletError(err.message || 'Failed to connect Web3 wallet.');
        }
      } finally {
        setIsConnecting(false);
      }
    } else {
      setWalletError('No EVM wallet detected. Please install MetaMask or use a Web3 browser, or sign in below with email.');
    }
  };

  // Handle Email Sign In
  const handleSignIn = (e) => {
    e?.preventDefault();
    setFormError('');
    setWalletError('');

    if (!email || !email.includes('@')) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      try {
        const storedUsers = JSON.parse(localStorage.getItem('aura_registered_users') || '[]');
        const matched = storedUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (matched && matched.password !== password) {
          setFormError('Incorrect password. Please verify your credentials.');
          setIsSubmitting(false);
          return;
        }

        const displayName = matched ? `${matched.firstName} ${matched.lastName}` : email.split('@')[0];
        localStorage.setItem('aura_user_email', email);
        localStorage.setItem('aura_auth_type', 'email');
        localStorage.setItem('aura_user_profile', JSON.stringify({
          email,
          name: displayName,
          role: matched?.role || 'DONOR'
        }));

        setUserEmail(email);
      } catch (err) {
        localStorage.setItem('aura_user_email', email);
        setUserEmail(email);
      } finally {
        setIsSubmitting(false);
      }
    }, 400);
  };

  // Quick Demo Login for instant testing
  const handleDemoLogin = () => {
    const demoEmail = 'benul@gmail.com';
    setEmail(demoEmail);
    setPassword('demopass123');
    setFormError('');
    setWalletError('');
    setIsSubmitting(true);

    setTimeout(() => {
      localStorage.setItem('aura_user_email', demoEmail);
      localStorage.setItem('aura_auth_type', 'demo');
      localStorage.setItem('aura_user_profile', JSON.stringify({
        email: demoEmail,
        name: 'Benul Rajapaksha',
        role: 'DONOR'
      }));
      setUserEmail(demoEmail);
      setIsSubmitting(false);
    }, 300);
  };

  // Handle Sign Up
  const handleSignUp = (e) => {
    e.preventDefault();
    setFormError('');
    setWalletError('');

    if (!firstName.trim() || !lastName.trim()) {
      setFormError('Please provide your first and last name.');
      return;
    }
    if (!email || !email.includes('@')) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      try {
        const storedUsers = JSON.parse(localStorage.getItem('aura_registered_users') || '[]');
        const existing = storedUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (existing) {
          setFormError('An account with this email already exists. Please sign in.');
          setIsSubmitting(false);
          return;
        }

        const newUser = {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          password,
          role: userRole,
          createdAt: new Date().toISOString()
        };

        storedUsers.push(newUser);
        localStorage.setItem('aura_registered_users', JSON.stringify(storedUsers));
        
        localStorage.setItem('aura_user_email', newUser.email);
        localStorage.setItem('aura_auth_type', 'email');
        localStorage.setItem('aura_user_profile', JSON.stringify({
          email: newUser.email,
          name: `${newUser.firstName} ${newUser.lastName}`,
          role: newUser.role
        }));

        setSuccessMsg(`Account created! Welcome to AuraGive, ${newUser.firstName}.`);
        setTimeout(() => {
          setUserEmail(newUser.email);
        }, 600);
      } catch (err) {
        setUserEmail(email);
      } finally {
        setIsSubmitting(false);
      }
    }, 450);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden bg-slate-950 font-sans select-none">
      {/* Crisp High-Resolution Background Artwork */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700 pointer-events-none"
        style={{ backgroundImage: "url('/images/donor-login-bg.jpg')" }}
      />

      {/* Ambient soft tint for high-contrast readability without hiding the art */}
      <div className="absolute inset-0 bg-black/20 dark:bg-slate-950/25 pointer-events-none" />

      {/* Top Floating Glass Header Bar */}
      <header className="relative z-20 w-full px-4 sm:px-8 py-3.5 flex items-center justify-between">
        {/* Brand Badge */}
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/50 dark:border-slate-700/60 shadow-lg shadow-black/5">
          <div className="p-1 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-sm">
            <ShieldCheck size={18} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight leading-none">AuraGive</span>
            <span className="hidden sm:inline-block text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-200/60 dark:border-purple-800/40">Donor Portal</span>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Return to Login button when portal is opened */}
          {isFormOpen && (
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 hover:bg-white/95 dark:hover:bg-slate-800/90 backdrop-blur-xl border border-white/50 dark:border-slate-700/60 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer"
              title="Return to Welcome Screen"
            >
              <ArrowLeft size={14} className="text-purple-600 dark:text-purple-400" />
              <span>Return to Login</span>
            </button>
          )}

          {/* Network Tag */}
          <div className="flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/50 dark:border-slate-700/60 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-lg">
            <span>Polygon Amoy</span>
          </div>
        </div>
      </header>

      {/* Main Content Area - Centered Modern Glassmorphic Login Experience */}
      <main className="relative z-10 w-full flex-1 flex items-center justify-center px-4 sm:px-6 py-6 sm:py-8">
        {!isFormOpen ? (
          /* Clean, Modern Centered Glassmorphic Welcome Card with Sign In Button */
          <div className="relative z-10 max-w-[460px] w-full bg-white/70 dark:bg-slate-900/65 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-indigo-950/30 border border-white/60 dark:border-slate-700/50 p-6 sm:p-8 my-auto transition-all duration-300 animate-fadeIn text-center">
            {/* Top Brand Indicator */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-purple-100/90 dark:bg-purple-900/60 text-purple-600 dark:text-purple-400 border border-purple-200/50 dark:border-purple-800/40">
                  <ShieldCheck size={18} />
                </div>
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">AuraGive Foundation</span>
              </div>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100/80 dark:bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-200/60 dark:border-slate-700/50">v2.4 Live</span>
            </div>

            {/* Welcome Heading */}
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                Empowering Schools.<br />
                <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                  Transparently Funded.
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                Direct Web3 donations for Sri Lankan rural classrooms. Verified by AI against official Ministry datasets.
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-3 gap-2 sm:gap-2.5 mb-6">
              <div className="p-2.5 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-white/50 dark:border-slate-700/50 backdrop-blur-sm">
                <Lock size={16} className="mx-auto text-purple-600 dark:text-purple-400 mb-1" />
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block">Smart Contract</span>
                <span className="text-[9px] text-slate-500 dark:text-slate-400">Verified</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-white/50 dark:border-slate-700/50 backdrop-blur-sm">
                <CheckCircle2 size={16} className="mx-auto text-emerald-600 dark:text-emerald-400 mb-1" />
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block">AI Verified</span>
                <span className="text-[9px] text-slate-500 dark:text-slate-400">Milestone Audit</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-white/50 dark:border-slate-700/50 backdrop-blur-sm">
                <Wallet size={16} className="mx-auto text-cyan-600 dark:text-cyan-400 mb-1" />
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block">USDC / Amoy</span>
                <span className="text-[9px] text-slate-500 dark:text-slate-400">100% On-Chain</span>
              </div>
            </div>

            {/* Primary Sign In Button */}
            <button
              type="button"
              onClick={() => {
                setIsFormOpen(true);
                setActiveTab('signin');
              }}
              className="w-full py-3.5 px-6 rounded-2xl font-bold text-base text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 shadow-xl shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2.5 group cursor-pointer"
            >
              <span>Sign In</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform text-white/90" />
            </button>

            {/* Secondary Web3 Quick Connect */}
            <button
              type="button"
              onClick={() => {
                setIsFormOpen(true);
                setActiveTab('web3');
              }}
              className="w-full mt-3 py-2.5 px-4 rounded-xl border border-purple-200/80 dark:border-purple-800/60 bg-white/50 dark:bg-purple-950/20 hover:bg-purple-50/70 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Wallet size={14} className="text-purple-600 dark:text-purple-400" />
              <span>Or Connect Web3 Wallet (Polygon Amoy)</span>
            </button>

            {/* Trust Footer */}
            <div className="mt-5 pt-3 border-t border-slate-200/60 dark:border-slate-700/50 flex items-center justify-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span>Verified Protocol • Polygon Amoy Network</span>
            </div>
          </div>
        ) : (
          /* Revealed Glassmorphic Login Portal Card */
          <div className="relative z-10 max-w-[460px] w-full bg-white/75 dark:bg-slate-900/70 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-indigo-950/30 border border-white/60 dark:border-slate-700/60 p-6 sm:p-7 my-auto transition-all duration-300 animate-fadeIn">
            {/* Card Header with Return Option */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors cursor-pointer"
                  title="Return to Welcome Card"
                >
                  <ArrowLeft size={14} />
                  <span>Return to Login</span>
                </button>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">v2.4 Live</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {activeTab === 'web3' && 'Web3 Instant Access ⚡'}
                {activeTab === 'signin' && 'Welcome Back 🔑'}
                {activeTab === 'signup' && 'Join AuraGive ✨'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {activeTab === 'web3' && 'Connect your Web3 wallet for transparent on-chain donation tracking.'}
                {activeTab === 'signin' && 'Enter your registered credentials or select demo mode to continue.'}
                {activeTab === 'signup' && 'Create a verified donor account to empower Sri Lankan school initiatives.'}
              </p>
            </div>

            {/* 3-Way Segmented Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100/90 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200/60 dark:border-slate-700/50 mb-4 text-xs font-semibold">
              <button 
                type="button" 
                onClick={() => { setActiveTab('web3'); setFormError(''); setWalletError(''); }} 
                className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${activeTab === 'web3' ? 'bg-white dark:bg-purple-600 text-purple-700 dark:text-white shadow-sm font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
              >
                <Wallet size={14} className={activeTab === 'web3' ? 'text-purple-600 dark:text-white' : ''} />
                <span>Web3</span>
              </button>
              <button 
                type="button" 
                onClick={() => { setActiveTab('signin'); setFormError(''); setWalletError(''); }} 
                className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${activeTab === 'signin' ? 'bg-white dark:bg-purple-600 text-purple-700 dark:text-white shadow-sm font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
              >
                <Lock size={14} className={activeTab === 'signin' ? 'text-purple-600 dark:text-white' : ''} />
                <span>Sign In</span>
              </button>
              <button 
                type="button" 
                onClick={() => { setActiveTab('signup'); setFormError(''); setWalletError(''); }} 
                className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${activeTab === 'signup' ? 'bg-white dark:bg-purple-600 text-purple-700 dark:text-white shadow-sm font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
              >
                <Sparkles size={14} className={activeTab === 'signup' ? 'text-purple-600 dark:text-white' : ''} />
                <span>Sign Up</span>
              </button>
            </div>

            {/* Error Alerts */}
            {walletError && (
              <div className="mb-3.5 p-3 bg-red-50/90 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200/80 dark:border-red-800/60 rounded-xl text-xs font-medium backdrop-blur-sm flex items-start gap-2 animate-fadeIn">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
                <span>{walletError}</span>
              </div>
            )}

            {formError && (
              <div className="mb-3.5 p-3 bg-rose-50/90 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800/60 rounded-xl text-xs font-medium backdrop-blur-sm flex items-start gap-2 animate-fadeIn">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-500" />
                <span>{formError}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-3.5 p-3 bg-emerald-50/90 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl text-xs font-semibold backdrop-blur-sm flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 size={16} className="shrink-0 text-emerald-500" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* TAB 1: WEB3 WALLET ACCESS */}
            {activeTab === 'web3' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50/90 to-indigo-50/70 dark:from-purple-950/30 dark:to-indigo-950/30 border border-purple-200/60 dark:border-purple-800/40">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-purple-900 dark:text-purple-200">
                      <Wallet size={16} className="text-purple-600 dark:text-purple-400" />
                      <span>Polygon Amoy Testnet</span>
                    </div>
                    <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/60 px-2 py-0.5 rounded-full font-bold">
                      ID 80002
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Auto-switches your wallet to Polygon Amoy. Donate directly in USDC with milestone-triggered smart contract releases.
                  </p>
                </div>

                <button 
                  type="button"
                  onClick={connectWeb3Wallet}
                  disabled={isConnecting}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-600/30 hover:shadow-purple-600/45 transition-all duration-300 disabled:opacity-75 disabled:cursor-not-allowed group active:scale-[0.99]"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 size={18} className="animate-spin text-white" />
                      <span>Requesting Wallet Connection...</span>
                    </>
                  ) : (
                    <>
                      <Wallet size={18} className="text-white group-hover:scale-110 transition-transform" />
                      <span>Connect Web3 Wallet</span>
                      <ArrowRight size={16} className="text-purple-200 group-hover:translate-x-1 transition-transform ml-auto" />
                    </>
                  )}
                </button>

                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/50 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Check size={14} className="text-emerald-500" />
                    MetaMask / EVM Ready
                  </span>
                  <button 
                    type="button"
                    onClick={() => setActiveTab('signin')}
                    className="text-purple-600 dark:text-purple-400 font-semibold hover:underline"
                  >
                    Or use Email Sign In
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: EMAIL SIGN IN */}
            {activeTab === 'signin' && (
              <form onSubmit={handleSignIn} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 text-slate-400" size={16} />
                    <input 
                      type="email" 
                      className="w-full bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60 rounded-xl pl-10 pr-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all backdrop-blur-sm" 
                      placeholder="donor@example.com" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      required 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 text-slate-400" size={16} />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      className="w-full bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all backdrop-blur-sm" 
                      placeholder="••••••••" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      required 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)} 
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-0.5 pb-1">
                  <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer font-medium select-none">
                    <input 
                      type="checkbox" 
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 dark:border-slate-600 text-purple-600 focus:ring-purple-500 w-3.5 h-3.5 cursor-pointer" 
                    />
                    Remember session
                  </label>
                  <button 
                    type="button" 
                    onClick={() => alert("Password reset link has been sent to your email inbox (mocked).")}
                    className="font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-purple-600/30 hover:shadow-purple-600/45 transition-all active:scale-[0.99] text-sm flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin text-white" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <span>Sign In</span>
                  )}
                </button>

                {/* Quick 1-Click Demo Login Button */}
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  disabled={isSubmitting}
                  className="w-full py-2 px-3 rounded-xl border border-dashed border-purple-300 dark:border-purple-700 hover:bg-purple-50/70 dark:hover:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  title="One-click demo login with sample credentials"
                >
                  <Sparkles size={14} className="text-purple-500" />
                  <span>⚡ Quick Demo Login (benul@gmail.com)</span>
                </button>
              </form>
            )}

            {/* TAB 3: SIGN UP */}
            {activeTab === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">First Name</label>
                    <input 
                      type="text" 
                      className="w-full bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all backdrop-blur-sm" 
                      placeholder="Benul"
                      value={firstName} 
                      onChange={e => setFirstName(e.target.value)} 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
                    <input 
                      type="text" 
                      className="w-full bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all backdrop-blur-sm" 
                      placeholder="Rajapaksha"
                      value={lastName} 
                      onChange={e => setLastName(e.target.value)} 
                      required 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Account Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setUserRole('DONOR')}
                      className={`py-1.5 px-3 rounded-xl text-xs font-semibold border transition-all ${userRole === 'DONOR' ? 'bg-purple-100 dark:bg-purple-900/60 border-purple-500 text-purple-700 dark:text-purple-200' : 'bg-white/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
                    >
                      Individual Donor
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserRole('NGO')}
                      className={`py-1.5 px-3 rounded-xl text-xs font-semibold border transition-all ${userRole === 'NGO' ? 'bg-purple-100 dark:bg-purple-900/60 border-purple-500 text-purple-700 dark:text-purple-200' : 'bg-white/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
                    >
                      CSR / Organization
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
                    <input 
                      type="email" 
                      className="w-full bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60 rounded-xl pl-10 pr-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all backdrop-blur-sm" 
                      placeholder="you@example.com" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      required 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Password</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        className="w-full bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all backdrop-blur-sm" 
                        placeholder="••••••••" 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        required 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Confirm</label>
                    <div className="relative">
                      <input 
                        type={showConfirmPassword ? "text" : "password"} 
                        className="w-full bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all backdrop-blur-sm" 
                        placeholder="••••••••" 
                        value={confirmPassword} 
                        onChange={e => setConfirmPassword(e.target.value)} 
                        required 
                      />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-purple-600/30 hover:shadow-purple-600/45 transition-all active:scale-[0.99] text-sm mt-1"
                >
                  {isSubmitting ? "Creating Account..." : "Complete Registration"}
                </button>
              </form>
            )}

            {/* Switch Tabs Prompt */}
            <p className="text-center text-slate-500 dark:text-slate-400 text-xs mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/50">
              {activeTab === 'signup' ? "Already have an account? " : "New to the platform? "}
              <button 
                type="button"
                onClick={() => {
                  setActiveTab(activeTab === 'signup' ? 'signin' : 'signup');
                  setFormError('');
                  setWalletError('');
                }} 
                className="font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 transition-colors underline"
              >
                {activeTab === 'signup' ? "Sign In here" : "Create an account"}
              </button>
            </p>

            {/* Feature Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-700/50">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-purple-200/60 dark:border-purple-800/40 text-[10px] font-bold text-purple-700 dark:text-purple-300 shadow-sm">
                <Lock size={12} className="text-purple-600 dark:text-purple-400" />
                <span>Smart Contract Verified</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-emerald-200/60 dark:border-emerald-800/40 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 shadow-sm">
                <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400" />
                <span>AI Cost Verification</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-blue-200/60 dark:border-blue-800/40 text-[10px] font-bold text-blue-700 dark:text-blue-300 shadow-sm">
                <ShieldCheck size={12} className="text-blue-600 dark:text-blue-400" />
                <span>100% On-Chain</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Global Bottom Footer */}
      <footer className="relative z-20 w-full px-6 py-3 border-t border-white/10 dark:border-slate-800/60 backdrop-blur-md bg-slate-950/40 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
        <div>
          © 2026 <span className="text-slate-200 font-semibold">AuraGive</span>. Sri Lanka School Infrastructure Platform.
        </div>
        <div className="flex items-center gap-3">
          <span>Polygon Amoy Testnet</span>
          <span>•</span>
          <span>USDC Transparent Giving</span>
          <span>•</span>
          <span>AI Registry Auditing</span>
        </div>
      </footer>
    </div>
  );
}

// --- CUSTOM FILTER DROPDOWN COMPONENT (HIGH CONTRAST & VISIBILITY IN DARK/LIGHT MODES) ---
function FilterDropdown({ icon: Icon, value, options, onChange, placeholder = "Select" }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayLabel = value === 'All' ? placeholder : value;

  return (
    <div className="filter-custom-dropdown" ref={dropdownRef}>
      <button 
        type="button" 
        className={`filter-custom-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="filter-trigger-content">
          <Icon size={18} className="filter-trigger-icon" />
          <span className="filter-trigger-text">{displayLabel}</span>
        </div>
        <ChevronDown size={16} className={`filter-trigger-chevron ${isOpen ? 'rotate' : ''}`} />
      </button>

      {isOpen && (
        <div className="filter-custom-menu">
          {options.map((option) => {
            const label = option === 'All' ? placeholder : option;
            const isSelected = value === option;
            return (
              <button
                key={option}
                type="button"
                className={`filter-custom-item ${isSelected ? 'selected' : ''}`}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
              >
                <span className="filter-item-label">{label}</span>
                {isSelected && <Check size={14} className="filter-item-check" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DonorDashboard({ campaigns, setWalletAddress, walletAddress, userEmail, setUserEmail, isDark, setIsDark }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');
  const navigate = useNavigate();

  // Extract unique categories dynamically with standard default categories
  const categories = React.useMemo(() => {
    const base = ['Classrooms', 'IT Labs', 'Libraries', 'Sanitation', 'Infrastructure', 'Furniture', 'Energy & IT'];
    const dynamic = (campaigns || []).map(c => c.category).filter(Boolean);
    const combined = Array.from(new Set([...base, ...dynamic]));
    return ['All', ...combined.sort()];
  }, [campaigns]);

  // Extract unique locations dynamically with standard districts
  const locations = React.useMemo(() => {
    const base = ['Colombo', 'Kandy', 'Galle', 'Kurunegala', 'Nuwara Eliya', 'Badulla', 'Batticaloa', 'Anuradhapura'];
    const dynamic = (campaigns || []).map(c => c.location).filter(Boolean);
    const combined = Array.from(new Set([...base, ...dynamic]));
    return ['All', ...combined.sort()];
  }, [campaigns]);

  const filteredCampaigns = campaigns.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || c.category === categoryFilter;
    const matchesLocation = locationFilter === 'All' || c.location === locationFilter;
    return matchesSearch && matchesCategory && matchesLocation;
  });

  return (
    <div className="min-h-screen pb-16 relative">
      <Navbar 
        walletAddress={walletAddress} 
        setWalletAddress={setWalletAddress} 
        userEmail={userEmail} 
        setUserEmail={setUserEmail}
        isDark={isDark}
        setIsDark={setIsDark}
      />

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Rebuild Sri Lankan Schools with Confidence</h1>
          <p className="hero-subtitle">AuraGive uses NER AI Validation to verify school infrastructure campaigns against official datasets. Donate USDC securely via Polygon.</p>
          
          <div className="search-bar-container glass-panel">
            <div className="search-input-group">
              <Search size={18} className="text-gray-400" />
              <input type="text" placeholder="Search campaigns..." className="search-input" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} />
            </div>
            
            <FilterDropdown 
              icon={ListFilter} 
              value={categoryFilter} 
              options={categories} 
              onChange={setCategoryFilter} 
              placeholder="All Categories" 
            />

            <FilterDropdown 
              icon={MapPin} 
              value={locationFilter} 
              options={locations} 
              onChange={setLocationFilter} 
              placeholder="All Locations" 
            />
          </div>
        </div>
      </div>

      <div className="dashboard-container">
        <h2 className="text-2xl font-bold mb-6">Campaigns ({filteredCampaigns.length})</h2>
        
        <div className="campaign-grid">
          {filteredCampaigns.map(c => (
            <div key={c.id} className="glass-card campaign-card cursor-pointer group" onClick={() => navigate(`/campaign/${c.id}`)}>
              <div className="campaign-image transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: `url(${c.image})` }}></div>
              <div className="campaign-content bg-white dark:bg-[#0f172a] relative z-10">
                <div className="campaign-header">
                  <span className="campaign-category">{c.category}</span>
                  <span className={`trust-badge ${c.score > 80 ? 'trust-high' : c.score > 50 ? 'trust-med' : 'trust-low'}`}>
                    <ShieldCheck size={14} /> Trust: {c.score}%
                  </span>
                </div>
                <h3 className="campaign-title group-hover:text-indigo-500 transition-colors">{c.title}</h3>
                <p className="campaign-location"><MapPin size={12}/> {c.schoolName ? `${c.schoolName}, ` : ''}{c.location}, Sri Lanka</p>
                
                <div className="campaign-footer">
                  <div className="campaign-stats">
                    <span className="campaign-raised">{c.raised} USDC</span>
                    <span className="text-muted">Goal: {c.goal} USDC</span>
                  </div>
                  <div className="progress-container mb-6">
                    <div className="progress-bar" style={{ width: `${(c.raised / c.goal) * 100}%` }}></div>
                  </div>
                  <button className="btn w-full py-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 hover:bg-indigo-500 hover:text-white transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- RECEIPT & OCR AUDIT DETAILS MODAL ---
function ReceiptDetailModal({ receipt, onClose }) {
  const [activeSubTab, setActiveSubTab] = useState('invoice'); // 'invoice' | 'ocr'
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!receipt) return null;

  const getReceiptItems = (rec) => {
    const filename = rec.receiptFilename || rec.filename || '';
    const milestone = rec.milestone || '';
    if (filename.includes('it_equipment') || milestone.toLowerCase().includes('pc') || milestone.toLowerCase().includes('desktop')) {
      return {
        vendor: "Apex IT Solutions & Hardware Lanka (Pvt) Ltd",
        regNo: "PV-98241 / VAT 114892019-7000",
        address: "No. 45/2, Galle Road, Colombo 03, Sri Lanka",
        invoiceNo: "INV-2026-0710-88",
        contact: "info@apexit-lanka.com | +94 11 234 5678",
        items: [
          { name: "Dell OptiPlex 3090 Core i5 Desktop Units (x20)", qty: 20, unitPrice: 90, total: 1800 },
          { name: "Uninterruptible Power Supply (UPS) 650VA Units (x4)", qty: 4, unitPrice: 35, total: 140 },
          { name: "Cat6 Ethernet Cabling & 24-Port Switch Kit", qty: 1, unitPrice: 60, total: 60 }
        ],
        subtotal: 2000,
        tax: 0,
        total: 2000
      };
    } else if (filename.includes('hardware') || milestone.toLowerCase().includes('roof')) {
      return {
        vendor: "Lanka Hardware Supplies & Timber Mills",
        regNo: "BR-N04812 / VAT 220918231-1000",
        address: "No. 12, Main Street, Hatton, Nuwara Eliya, Sri Lanka",
        invoiceNo: "INV-2026-0712-42",
        contact: "orders@lankahardware.lk | +94 52 222 3456",
        items: [
          { name: "Corrugated Zinc-Aluminium Roofing Sheets 0.47mm (x140)", qty: 140, unitPrice: 38, total: 5320 },
          { name: "Treated Timber Structural Battens & Purlins", qty: 65, unitPrice: 32, total: 2080 },
          { name: "Heavy Duty Galvanized Fasteners, Flashing & Sealants", qty: 1, unitPrice: 1100, total: 1100 }
        ],
        subtotal: 8500,
        tax: 0,
        total: 8500
      };
    } else {
      return {
        vendor: "City Sanitary & Plumbing Fittings Ltd",
        regNo: "BR-C88192 / VAT 331002931-2000",
        address: "No. 78, Peradeniya Road, Kandy, Sri Lanka",
        invoiceNo: "INV-2026-0714-19",
        contact: "sales@citysanitary.lk | +94 81 223 4567",
        items: [
          { name: "Heavy Duty 2-inch PVC Water Piping (6m lengths x15)", qty: 15, unitPrice: 16, total: 240 },
          { name: "Dual Flush Ceramic Cistern & Commode Assemblies (x2)", qty: 2, unitPrice: 95, total: 190 },
          { name: "Brass Gate Valves, Tap Fittings & Connector Joints", qty: 1, unitPrice: 70, total: 70 }
        ],
        subtotal: 500,
        tax: 0,
        total: 500
      };
    }
  };

  const invoice = getReceiptItems(receipt);
  const docFilename = receipt.receiptFilename || receipt.filename || 'receipt_document.pdf';
  const campaignName = receipt.campaignTitle || receipt.campaign || 'Campaign Project';
  const milestoneName = receipt.milestone || 'Milestone Scope';
  const amountVal = receipt.amount || invoice.total;
  const isVerified = (receipt.ocrStatus || '').toLowerCase() === 'verified';

  const handleDownload = () => {
    const textContent = `======================================================================
AURAGIVE VERIFIED EXPENDITURE RECEIPT
======================================================================
Official Invoice Number: ${invoice.invoiceNo}
Receipt Date: ${receipt.date}
Settlement Network: Polygon Amoy Testnet (Chain ID 80002)

SUPPLIER / VENDOR DETAILS:
Vendor Name: ${invoice.vendor}
Business Registration (BRN): ${invoice.regNo}
Registered Address: ${invoice.address}
Official Contact: ${invoice.contact}

PROJECT & MILESTONE DETAILS:
Target Campaign: ${campaignName}
Disbursed Milestone: ${milestoneName}
Amount Released: ${amountVal} USDC

ITEMIZED PURCHASES:
----------------------------------------------------------------------
${invoice.items.map(it => `[x${it.qty}] ${it.name} - ${it.unitPrice} USDC each = ${it.total} USDC`).join('\n')}
----------------------------------------------------------------------
Subtotal: ${invoice.subtotal} USDC
Tax/VAT (Zero-Rated Educational Exemption): 0.00 USDC
Total Amount Disbursed: ${invoice.total} USDC

AI OCR VERIFICATION AUDIT TRAIL:
Audit Status: ${receipt.ocrStatus || 'Verified'}
Confidence Level: 98.8%
Audit Detail: ${receipt.ocrDetail || 'Document matches registered supplier records and milestone release request.'}
Anomaly Check: PASSED - Zero tamper detection flags.
Vendor Verification: PASSED - Registered Sri Lankan legal enterprise verified.
======================================================================`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = docFilename.replace(/\.[^/.]+$/, "") + "_verified_audit.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="modal-overlay">
      <div className="receipt-modal-content">
        <div className="receipt-modal-header">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              <FileText size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                {docFilename}
                <span className={`status-badge ${isVerified ? 'success' : 'warning'}`}>
                  {isVerified ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                  {receipt.ocrStatus || 'Verified'}
                </span>
              </h2>
              <p className="text-xs text-muted">
                Official Expenditure Proof for <strong>{campaignName}</strong> ({milestoneName})
              </p>
            </div>
          </div>
          <button className="modal-close-static" onClick={onClose} title="Close">✕</button>
        </div>

        {/* Modal Subtabs */}
        <div className="receipt-subtabs">
          <button 
            className={`receipt-subtab-btn ${activeSubTab === 'invoice' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('invoice')}
          >
            Digital Receipt / Invoice
          </button>
          <button 
            className={`receipt-subtab-btn ${activeSubTab === 'ocr' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('ocr')}
          >
            AI OCR Audit &amp; Verification
          </button>
        </div>

        {activeSubTab === 'invoice' ? (
          <div className="receipt-invoice-card">
            {/* Invoice Header */}
            <div className="invoice-header-row">
              <div>
                <div className="invoice-vendor-name">{invoice.vendor}</div>
                <div className="invoice-vendor-meta">{invoice.address}</div>
                <div className="invoice-vendor-meta font-mono">BRN: {invoice.regNo}</div>
                <div className="invoice-vendor-meta">{invoice.contact}</div>
              </div>
              <div className="text-right">
                <div className="invoice-badge">PAID IN FULL</div>
                <div className="invoice-number-title">INVOICE #{invoice.invoiceNo}</div>
                <div className="text-xs text-slate-500 mt-1">Date: {receipt.date}</div>
                <div className="text-xs text-slate-500">Currency: USDC (Amoy)</div>
              </div>
            </div>

            <div className="invoice-divider"></div>

            {/* Bill To */}
            <div className="invoice-meta-grid">
              <div>
                <span className="invoice-meta-label">Billed To Beneficiary</span>
                <div className="invoice-meta-val">{campaignName}</div>
                <div className="text-xs text-slate-500 mt-0.5">Project Disbursement Account</div>
              </div>
              <div>
                <span className="invoice-meta-label">Designated Milestone</span>
                <div className="invoice-meta-val">{milestoneName}</div>
                <div className="text-xs text-slate-500 mt-0.5">Verified Deliverable Scope</div>
              </div>
            </div>

            {/* Itemized Table */}
            <table className="invoice-items-table">
              <thead>
                <tr>
                  <th>Description / Item Specification</th>
                  <th className="text-center">Qty</th>
                  <th className="text-right">Unit (USDC)</th>
                  <th className="text-right">Amount (USDC)</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.name}</td>
                    <td className="text-center font-mono">{item.qty}</td>
                    <td className="text-right font-mono">{item.unitPrice.toFixed(2)}</td>
                    <td className="text-right font-mono font-semibold">{item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="invoice-total-section">
              <div className="watermark-tag">
                <ShieldCheck size={16} /> AURAGIVE VERIFIED
              </div>
              <div className="invoice-total-breakdown">
                <div className="total-row">
                  <span>Subtotal:</span>
                  <span className="font-mono">{invoice.subtotal.toFixed(2)} USDC</span>
                </div>
                <div className="total-row">
                  <span>Tax / VAT (Zero-Rated Educational Exemption):</span>
                  <span className="font-mono">0.00 USDC</span>
                </div>
                <div className="total-row grand-total">
                  <span>Total Disbursed:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{amountVal} USDC</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="receipt-ocr-card">
            <div className="ocr-summary-box">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-purple-500" />
                  <h4 className="font-bold text-sm">Automated OCR Multi-Signal Analysis</h4>
                </div>
                <span className="ocr-score-badge">99.2% Audit Confidence</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                {receipt.ocrDetail || 'Automated OCR optical parsing confirmed document structure, vendor registration number, and line item financial tally against project budget.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="ocr-checklist-item">
                  <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                  <div>
                    <strong>Total Amount Match</strong>
                    <p className="text-slate-500 text-[11px]">Parsed document amount matches {amountVal} USDC milestone claim.</p>
                  </div>
                </div>

                <div className="ocr-checklist-item">
                  <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                  <div>
                    <strong>Vendor Registry Match</strong>
                    <p className="text-slate-500 text-[11px]">Valid Business Registration (BRN) verified in registrar database.</p>
                  </div>
                </div>

                <div className="ocr-checklist-item">
                  <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                  <div>
                    <strong>Forensic Tamper Detection</strong>
                    <p className="text-slate-500 text-[11px]">Pixel-level metadata and font-rendering forensic analysis passed.</p>
                  </div>
                </div>

                <div className="ocr-checklist-item">
                  <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                  <div>
                    <strong>Milestone Deliverable Scope</strong>
                    <p className="text-slate-500 text-[11px]">Semantic analysis confirmed items match educational project requirements.</p>
                  </div>
                </div>
              </div>
            </div>

            {receipt.hash && (
              <div className="ocr-onchain-proof">
                <span className="text-xs text-slate-500 block mb-1">On-Chain Milestone Settlement Hash:</span>
                <a 
                  href={getExplorerTxUrl(receipt.hash)} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="font-mono text-xs text-indigo-500 hover:underline flex items-center gap-1.5"
                >
                  <ExternalLink size={14} />
                  <span>{receipt.hash}</span>
                </a>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="receipt-modal-footer">
          <button 
            className="btn btn-outline flex items-center gap-2 text-xs" 
            onClick={handleDownload}
          >
            {downloadSuccess ? <Check size={16} className="text-emerald-500" /> : <Download size={16} />}
            {downloadSuccess ? 'Downloaded Receipt Audit' : 'Download Receipt Audit File'}
          </button>
          <button className="btn btn-primary text-xs" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// --- TRANSPARENCY VIEW ---
function Transactions({ walletAddress, setWalletAddress, userEmail, setUserEmail, isDark, setIsDark, transactions, setTransactions }) {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialFilter = searchParams.get('filter') === 'my_donations' ? 'MY_WALLET' : 'ALL';

  const [activeTab, setActiveTab] = useState('donations');
  const [filterMode, setFilterMode] = useState(initialFilter); // 'ALL' | 'MY_WALLET'
  const [copiedHash, setCopiedHash] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('filter') === 'my_donations') {
      setActiveTab('donations');
      setFilterMode('MY_WALLET');
    }
  }, [location.search]);

  const copyHash = (hash) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(''), 2000);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('http://localhost:3001/api/transactions');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const donationTxs = data.filter(t => t.type === 'DONATION').map(t => ({
            id: t._id || t.id,
            date: t.date || new Date(t.createdAt).toISOString().split('T')[0],
            campaignTitle: t.campaignTitle,
            amount: parseFloat(t.amount || 0).toFixed(2),
            status: t.status || 'Confirmed',
            hash: t.hash,
            donorWallet: t.donorWallet,
            type: 'DONATION'
          }));

          if (setTransactions) {
            setTransactions(prev => {
              const seen = new Set();
              const merged = [];
              for (const item of [...prev, ...donationTxs]) {
                if (item.hash && !seen.has(item.hash.toLowerCase())) {
                  seen.add(item.hash.toLowerCase());
                  merged.push(item);
                }
              }
              try {
                localStorage.setItem('aura_transactions', JSON.stringify(merged));
              } catch (e) {}
              return merged;
            });
          }
        }
      }
    } catch (err) {
      console.warn("Could not refresh transactions:", err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const defaultExpenditures = [
    { id: 101, milestone: "Purchase 20 Desktop PCs", amount: 2000, date: "2026-07-10", ocrStatus: "Verified", ocrDetail: "Receipt total matches requirement. Vendor ID valid.", filename: "invoice_it_equipment.pdf", campaign: "Maliyadeva College IT Lab", hash: "0x8f7a6b5c4d3e2f1a0b9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b5c6d7e" },
    { id: 102, milestone: "Roofing materials", amount: 8500, date: "2026-07-12", ocrStatus: "Verified", ocrDetail: "Invoice matches bank transfer record.", filename: "hardware_receipt_001.jpg", campaign: "Royal College Library Repair", hash: "0x5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d" },
    { id: 103, milestone: "Plumbing fixtures", amount: 500, date: "2026-07-14", ocrStatus: "Pending AI Review", ocrDetail: "Awaiting OCR anomaly detection.", filename: "plumbing_receipt.png", campaign: "Trinity College Sanitation", hash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b" }
  ];

  const displayedDonations = transactions.filter(tx => {
    if (filterMode === 'MY_WALLET' && walletAddress) {
      return (tx.donorWallet || '').toLowerCase() === walletAddress.toLowerCase();
    }
    return true;
  });

  const myDonationCount = transactions.filter(tx => 
    walletAddress && (tx.donorWallet || '').toLowerCase() === walletAddress.toLowerCase()
  ).length;

  return (
    <div className="min-h-screen pb-16">
      <Navbar 
        walletAddress={walletAddress} 
        setWalletAddress={setWalletAddress} 
        userEmail={userEmail} 
        setUserEmail={setUserEmail}
        isDark={isDark}
        setIsDark={setIsDark}
      />

      <div className="transactions-container">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="transactions-header mb-0">
            <Activity size={28} className="text-indigo-500" /> Platform Transparency
          </h2>
          <button 
            className="refresh-tx-btn" 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            title="Refresh on-chain transactions"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
            <span>{isRefreshing ? "Refreshing..." : "Sync Blockchain"}</span>
          </button>
        </div>
        
        <div className="transactions-glass-panel">
          <div className="transactions-tabs-container">
            <button 
              className={`transactions-tab-btn ${activeTab === 'donations' ? 'active' : ''}`} 
              onClick={() => setActiveTab('donations')}
            >
              Platform Donations <span className="tab-counter-badge">{transactions.length}</span>
            </button>
            <button 
              className={`transactions-tab-btn ${activeTab === 'expenditure' ? 'active' : ''}`} 
              onClick={() => setActiveTab('expenditure')}
            >
              Fund Expenditure (Receipts) <span className="coming-soon-badge">Coming Soon</span>
            </button>
          </div>

          {activeTab === 'donations' && (
            <div className="platform-donations-filter-bar mb-6 flex items-center gap-3">
              <button 
                className={`filter-pill-btn ${filterMode === 'ALL' ? 'active' : ''}`}
                onClick={() => setFilterMode('ALL')}
              >
                <Layers size={14} />
                <span>All Platform Donations</span>
                <span className="filter-pill-count">{transactions.length}</span>
              </button>
              <button 
                className={`filter-pill-btn ${filterMode === 'MY_WALLET' ? 'active' : ''}`}
                onClick={() => setFilterMode('MY_WALLET')}
              >
                <Heart size={14} />
                <span>My Donations</span>
                <span className="filter-pill-count">{myDonationCount}</span>
              </button>
            </div>
          )}

          <div className="transactions-table-container">
            {activeTab === 'donations' ? (
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Campaign</th>
                    <th>Amount (USDC)</th>
                    <th>Status</th>
                    <th>Blockchain TX (Amoy)</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedDonations.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="empty-state py-12 text-center">
                        {filterMode === 'MY_WALLET' && !walletAddress ? (
                          <div className="flex flex-col items-center">
                            <Wallet size={36} className="text-indigo-400 mb-3 opacity-60" />
                            <div className="font-semibold text-base text-gray-700 dark:text-gray-200 mb-1">Wallet Not Connected</div>
                            <p className="text-sm text-gray-500 mb-4 max-w-sm">Please connect your Web3 wallet to filter and view your personal contributions.</p>
                            <button className="btn btn-primary text-xs" onClick={() => {
                              const btn = document.querySelector('.wallet-btn');
                              if (btn) btn.click();
                            }}>
                              Connect Wallet
                            </button>
                          </div>
                        ) : filterMode === 'MY_WALLET' ? (
                          <div className="flex flex-col items-center">
                            <Heart size={36} className="text-pink-400 mb-3 opacity-60" />
                            <div className="font-semibold text-base text-gray-700 dark:text-gray-200 mb-1">No Donations Recorded Yet</div>
                            <p className="text-sm text-gray-500 mb-4 max-w-sm">You haven't made any donations from your connected wallet yet. Explore campaigns to make your first impact!</p>
                            <button className="btn btn-primary text-xs" onClick={() => (window.location.href = '/')}>
                              Browse Campaigns
                            </button>
                          </div>
                        ) : (
                          "No donations recorded yet on the platform."
                        )}
                      </td>
                    </tr>
                  ) : (
                    displayedDonations.map(tx => {
                      const isMine = walletAddress && (tx.donorWallet || '').toLowerCase() === walletAddress.toLowerCase();
                      return (
                        <tr key={tx.id || tx.hash}>
                          <td className="date-cell">{tx.date}</td>
                          <td className="tx-campaign-title">
                            <div className="flex items-center gap-2">
                              <span>{tx.campaignTitle}</span>
                              {isMine && (
                                <span className="my-donation-badge">My Donation</span>
                              )}
                            </div>
                          </td>
                          <td className="tx-amount">{tx.amount} USDC</td>
                          <td>
                            <span className="status-badge success">
                              <CheckCircle2 size={12} /> {tx.status}
                            </span>
                          </td>
                          <td>
                            <div className="inline-flex items-center gap-1.5">
                              <a 
                                href={getExplorerTxUrl(tx.hash)} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="hash-badge"
                                title="View transaction on Polygonscan Amoy"
                              >
                                <span>{tx.hash ? `${tx.hash.substring(0, 10)}...${tx.hash.substring(tx.hash.length - 8)}` : '0x...'}</span>
                                <ExternalLink size={12} className="opacity-70" />
                              </a>
                              {tx.hash && (
                                <button 
                                  className="copy-hash-btn" 
                                  onClick={() => copyHash(tx.hash)}
                                  title="Copy transaction hash"
                                >
                                  {copiedHash === tx.hash ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            ) : (
              <div>
                <div className="coming-soon-banner">
                  <AlertCircle size={20} className="text-amber-500 flex-shrink-0" />
                  <div>
                    <strong>Feature Coming Soon:</strong> Contractor invoice audits and proof-of-work receipts are currently in development. Below is an illustrative preview of the upcoming transparency audit log.
                  </div>
                </div>
                <table className="transactions-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Campaign &amp; Milestone</th>
                    <th>Spent (USDC)</th>
                    <th>Receipt Document</th>
                    <th>OCR Audit Status</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {defaultExpenditures.map(rec => (
                    <tr key={rec.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="date-cell">{rec.date}</td>
                      <td>
                        <div className="tx-campaign-title">{rec.campaign}</div>
                        <div className="tx-milestone-subtitle flex items-center gap-1">
                          <Layers size={11} className="text-indigo-400" /> {rec.milestone}
                        </div>
                      </td>
                      <td className="tx-spent-amount">{rec.amount} USDC</td>
                      <td>
                        <button 
                          className="receipt-link-action"
                          onClick={() => setSelectedReceipt(rec)}
                          title="Click to inspect verified receipt document"
                        >
                          <FileText size={15} />
                          <span>{rec.filename}</span>
                        </button>
                      </td>
                      <td>
                        <div className="trust-badge-container inline">
                          <span className={`status-badge ${rec.ocrStatus === 'Verified' ? 'success' : 'warning'}`}>
                            {rec.ocrStatus === 'Verified' ? <CheckCircle2 size={12}/> : <AlertCircle size={12}/>}
                            {rec.ocrStatus}
                          </span>
                          <div className="trust-tooltip tooltip-left">
                            {rec.ocrDetail}
                            <div className="trust-tooltip-arrow-left"></div>
                          </div>
                        </div>
                      </td>
                      <td className="text-right">
                        <button 
                          className="btn-inspect-receipt"
                          onClick={() => setSelectedReceipt(rec)}
                        >
                          View Details &rarr;
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          </div>
        </div>
      </div>

      {selectedReceipt && (
        <ReceiptDetailModal 
          receipt={selectedReceipt} 
          onClose={() => setSelectedReceipt(null)} 
        />
      )}
    </div>
  );
}

// --- HOW IT WORKS PAGE COMPONENT (Donor Walkthrough Guide) ---
function HowItWorks({ isDark, setIsDark, userEmail, setUserEmail, walletAddress, setWalletAddress }) {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(0);

  const donorSteps = [
    {
      num: "01",
      icon: Search,
      title: "Access the Platform & Explore Campaigns",
      badge: "Step 1: Explore",
      desc: "Visit the AuraGive dashboard to browse verified school infrastructure projects across Sri Lanka. Easily search by keyword or filter campaigns by Category (Classrooms, IT Labs, Libraries, Sanitation, Energy) and District Locations.",
      highlights: [
        "Search and filter by category and district location",
        "View verified school details, photos, and funding targets",
        "Inspect AI Trust Scores (≥80% threshold required for all active projects)"
      ],
      buttonText: "Browse Campaigns",
      buttonAction: () => navigate('/')
    },
    {
      num: "02",
      icon: Wallet,
      title: "Connect Your Web3 Wallet",
      badge: "Step 2: Connect",
      desc: "Connect your MetaMask or EVM-compatible Web3 wallet with a single click. AuraGive operates on the ultra-fast Polygon Amoy Testnet (Chain ID 80002) for instant transactions with sub-cent gas fees.",
      highlights: [
        "1-click automatic network switch to Polygon Amoy Testnet",
        "Real-time POL (gas) and USDC (donation token) balance display",
        "Safe, non-custodial direct connection directly from your browser"
      ],
      buttonText: walletAddress ? "Wallet Connected" : "Connect Wallet",
      buttonAction: () => {
        if (!walletAddress) {
          const btn = document.querySelector('.wallet-btn');
          if (btn) btn.click();
        }
      }
    },
    {
      num: "03",
      icon: Heart,
      title: "Select the Campaign to Support",
      badge: "Step 3: Select",
      desc: "Click on any campaign card to review comprehensive school requirements, background information, total funds raised, community backers, and remaining funding goal.",
      highlights: [
        "Transparent real-time progress bar and remaining USDC target",
        "Verified school background information and student community impact",
        "Official identity details cross-checked with government databases"
      ],
      buttonText: "Explore Projects",
      buttonAction: () => navigate('/')
    },
    {
      num: "04",
      icon: CheckCircle2,
      title: "Complete Your USDC Donation",
      badge: "Step 4: Donate",
      desc: "Click 'Donate Now', enter the amount you wish to contribute in USDC, and confirm the transaction in your wallet. Built-in target cap protection ensures schools never receive more than their intended funding target.",
      highlights: [
        "Fast ~2-second settlement on Polygon Amoy with minimal gas fees",
        "Automated over-donation prevention protects remaining campaign targets",
        "Instant cryptographic transaction receipt recorded on the public Transparency Ledger"
      ],
      buttonText: "View Transparency Ledger",
      buttonAction: () => navigate('/transactions')
    }
  ];

  const donorFaqs = [
    {
      q: "Which token and network are used for donations?",
      a: "AuraGive uses USDC on the Polygon Amoy Testnet (Chain ID 80002). USDC ensures price stability without crypto price volatility, while Polygon Amoy provides ~2-second transaction finality with sub-cent gas fees."
    },
    {
      q: "How do I connect my Web3 wallet?",
      a: "Click 'Connect Wallet' in the top navigation bar. If you have MetaMask installed, approve the connection prompt. AuraGive will automatically prompt your wallet to switch to the Polygon Amoy Testnet if you are on another network."
    },
    {
      q: "Where can I see my personal donation history?",
      a: "Go to the Transparency page from the navigation bar, where 'My Donations' is located directly inside the Platform Donations section. You can also click 'My Donations' in your profile menu in the top right corner."
    },
    {
      q: "Can I donate more than the remaining goal of a campaign?",
      a: "No. The donation modal includes built-in goal protection. If you enter an amount that exceeds the remaining balance required to complete the campaign, the interface will automatically notify you and prevent overfunding."
    }
  ];

  return (
    <div className="how-it-works-page">
      <Navbar 
        walletAddress={walletAddress} 
        setWalletAddress={setWalletAddress} 
        userEmail={userEmail} 
        setUserEmail={setUserEmail}
        isDark={isDark}
        setIsDark={setIsDark}
      />

      <div className="hiw-container">
        {/* Hero Section */}
        <div className="hiw-hero">
          <h1 className="hiw-title">
            How to Donate on <span className="hiw-title-gradient">AuraGive</span>
          </h1>
          <p className="hiw-subtitle">
            Follow our simple 4-step process to discover verified Sri Lankan school infrastructure projects, connect your Web3 wallet, and donate securely in USDC on Polygon.
          </p>
        </div>

        {/* 4-Step Process Grid */}
        <div className="donor-steps-container">
          {donorSteps.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.num} className="donor-step-card">
                <div className="donor-step-number-pill">{s.num}</div>
                <div className="donor-step-header">
                  <div className="donor-step-icon-wrap">
                    <Icon size={24} />
                  </div>
                  <div>
                    <span className="donor-step-badge">{s.badge}</span>
                    <h3 className="donor-step-title">{s.title}</h3>
                  </div>
                </div>
                <p className="donor-step-desc">{s.desc}</p>
                <div className="donor-step-highlights">
                  {s.highlights.map((h, i) => (
                    <div key={i} className="donor-highlight-item">
                      <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button 
                    className="btn btn-outline text-xs w-full sm:w-auto"
                    onClick={s.buttonAction}
                  >
                    <span>{s.buttonText}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Donor FAQ Section */}
        <div className="hiw-section-header mt-16">
          <span className="hiw-section-tag">Frequently Asked Questions</span>
          <h2 className="hiw-section-title">Common Questions for Donors</h2>
        </div>

        <div className="hiw-faq-container">
          {donorFaqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div key={index} className={`hiw-faq-item ${isOpen ? 'open' : ''}`}>
                <button 
                  className="hiw-faq-question"
                  onClick={() => setOpenFaq(isOpen ? -1 : index)}
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  <ChevronDown 
                    size={18} 
                    className={`transition-transform duration-200 text-gray-400 ${isOpen ? 'rotate-180 text-indigo-500' : ''}`} 
                  />
                </button>
                {isOpen && (
                  <div className="hiw-faq-answer">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA Banner */}
        <div className="hiw-cta-card mt-12">
          <h2 className="hiw-cta-title">Ready to Support a Sri Lankan School?</h2>
          <p className="hiw-cta-desc">
            Explore active infrastructure campaigns and make an immediate, transparent contribution in USDC via Polygon.
          </p>
          <div className="hiw-cta-actions">
            <button 
              className="btn btn-primary px-8 py-3 text-base shadow-lg shadow-indigo-500/25"
              onClick={() => navigate('/')}
            >
              <Heart size={18} /> Browse Campaigns
            </button>
            <button 
              className="btn btn-outline px-8 py-3 text-base"
              onClick={() => navigate('/transactions')}
            >
              <Activity size={18} /> View Transparency Ledger
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  // Always access login page first on initial load: do not auto-login to dashboard
  const [userEmail, setUserEmail] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  
  useEffect(() => {
    if (userEmail) {
      localStorage.setItem('aura_user_email', userEmail);
    } else {
      localStorage.removeItem('aura_user_email');
    }
  }, [userEmail]);

  useEffect(() => {
    if (walletAddress) {
      localStorage.setItem('aura_wallet_address', walletAddress);
    } else {
      localStorage.removeItem('aura_wallet_address');
    }
  }, [walletAddress]);

  // Persist dark mode state
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  
  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // Global transactions state initialized with persistent localStorage cache
  const [transactions, setTransactions] = useState(() => {
    try {
      const stored = localStorage.getItem('aura_transactions');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Failed to read local transactions:", e);
    }
    return [
      { id: 1, date: '2026-07-08', campaignTitle: 'Royal College Library Repair', amount: '50.00', status: 'Confirmed', hash: '0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b', donorWallet: '0x3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b', type: 'DONATION' },
      { id: 2, date: '2026-07-01', campaignTitle: 'Trinity College Sanitation', amount: '25.00', status: 'Confirmed', hash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b', donorWallet: '0x7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f', type: 'DONATION' }
    ];
  });

  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/campaigns')
      .then(res => res.json())
      .then(data => setCampaigns(data))
      .catch(err => console.error("Failed to fetch campaigns", err));

    // Fetch backend transactions and synchronize with localStorage
    fetch('http://localhost:3001/api/transactions')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const donationTxs = data.filter(t => t.type === 'DONATION').map(t => ({
            id: t._id || t.id,
            date: t.date || new Date(t.createdAt).toISOString().split('T')[0],
            campaignTitle: t.campaignTitle,
            amount: parseFloat(t.amount || 0).toFixed(2),
            status: t.status || 'Confirmed',
            hash: t.hash,
            donorWallet: t.donorWallet,
            type: 'DONATION'
          }));

          setTransactions(prev => {
            const seen = new Set();
            const merged = [];
            for (const item of [...prev, ...donationTxs]) {
              if (item.hash && !seen.has(item.hash.toLowerCase())) {
                seen.add(item.hash.toLowerCase());
                merged.push(item);
              }
            }
            try {
              localStorage.setItem('aura_transactions', JSON.stringify(merged));
            } catch (e) {}
            return merged;
          });
        }
      })
      .catch(err => console.warn("Backend transactions sync note:", err));
  }, []);

  return (
    <Router>
      {!userEmail ? (
        <Routes>
          <Route path="/about" element={<HowItWorks isDark={isDark} setIsDark={setIsDark} userEmail={userEmail} setUserEmail={setUserEmail} walletAddress={walletAddress} setWalletAddress={setWalletAddress} />} />
          <Route path="*" element={<EmailAuth setUserEmail={setUserEmail} setWalletAddress={setWalletAddress} />} />
        </Routes>
      ) : (
        <Routes>
          <Route path="/" element={<DonorDashboard campaigns={campaigns} setWalletAddress={setWalletAddress} walletAddress={walletAddress} userEmail={userEmail} setUserEmail={setUserEmail} isDark={isDark} setIsDark={setIsDark} />} />
          <Route path="/campaign/:id" element={<CampaignDetail campaigns={campaigns} setCampaigns={setCampaigns} walletAddress={walletAddress} setWalletAddress={setWalletAddress} userEmail={userEmail} setUserEmail={setUserEmail} isDark={isDark} setIsDark={setIsDark} transactions={transactions} setTransactions={setTransactions} />} />
          <Route path="/transactions" element={<Transactions walletAddress={walletAddress} setWalletAddress={setWalletAddress} userEmail={userEmail} setUserEmail={setUserEmail} isDark={isDark} setIsDark={setIsDark} transactions={transactions} setTransactions={setTransactions} />} />
          <Route path="/about" element={<HowItWorks isDark={isDark} setIsDark={setIsDark} userEmail={userEmail} setUserEmail={setUserEmail} walletAddress={walletAddress} setWalletAddress={setWalletAddress} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;
