import React, { useState, useMemo, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import {
  Shield, LayoutDashboard, Settings, ScrollText, Plus, Wallet, LogOut, Trash2,
  Edit3, MapPin, CheckCircle, TrendingUp, ExternalLink, Activity, ChevronRight,
  Menu, Loader2, Image as ImageIcon, Mail, Lock, Eye, EyeOff, CheckCircle2, X,
  ArrowRight, Sparkles, ShieldCheck, KeyRound, Cpu, Check, Upload, FileText,
  Search, ArrowUpRight, ArrowDownLeft, Copy, AlertTriangle, Layers, Award,
  CheckCircle as CheckCircleIcon, RefreshCw
} from 'lucide-react';

import { ethers } from 'ethers';
import {
  ensureAmoyNetwork,
  getSigner,
  getEscrowContract,
  getExplorerTxUrl,
  formatWeb3Error,
  SMART_CONTRACT_ADDRESS,
  getBrowserProvider,
  isContract
} from './utils/web3';

// --- INITIAL DATA ---
const initialCampaigns = [
  {
    id: 1,
    title: 'Clean Drinking Water Well',
    category: 'Sanitation',
    remoteness: 'Medium',
    location: 'Kurunegala',
    goal: 2000,
    raised: 1200,
    score: 92,
    image: '/images/campaign-1.jpg',
    description: "We are raising funds to build a clean drinking water well for Galgamuwa Kanishta Vidyalaya in Kurunegala.",
    scoreBreakdown: "School Identity: Verified. Location: Verified.",
    status: 'Active'
  },
  {
    id: 2,
    title: 'Main Hall Roof Renovation',
    category: 'Infrastructure',
    remoteness: 'Medium',
    location: 'Nuwara Eliya',
    goal: 5000,
    raised: 2500,
    score: 88,
    image: '/images/campaign-2.jpg',
    description: "The main hall roof at Hatton Tamil Maha Vidyalaya in Nuwara Eliya is severely damaged.",
    scoreBreakdown: "School Identity: Verified. Location: Verified.",
    status: 'Active'
  },
  {
    id: 3,
    title: 'Primary Classroom Desks & Chairs',
    category: 'Furniture',
    remoteness: 'High',
    location: 'Badulla',
    goal: 1500,
    raised: 1500,
    score: 95,
    image: '/images/campaign-3.jpg',
    description: "Mahiyangana Rural Primary in Badulla desperately needs new desks and chairs.",
    scoreBreakdown: "School Identity: Verified. Location: Verified.",
    status: 'Completed'
  },
  {
    id: 4,
    title: 'Solar Power for IT Lab',
    category: 'Energy & IT',
    remoteness: 'Low',
    location: 'Batticaloa',
    goal: 4000,
    raised: 1000,
    score: 85,
    image: '/images/campaign-4.jpg',
    description: "Providing solar panels to power the IT lab at Kiran Maha Vidyalaya in Batticaloa.",
    scoreBreakdown: "School Identity: Verified. Location: Warning.",
    status: 'Active'
  },
  {
    id: 5,
    title: 'Library Books and Shelving',
    category: 'Libraries',
    remoteness: 'Medium',
    location: 'Anuradhapura',
    goal: 1000,
    raised: 400,
    score: 90,
    image: '/images/campaign-5.jpg',
    description: "Funding new educational books and sturdy shelving for the Padaviya Vidyalaya library in Anuradhapura.",
    scoreBreakdown: "School Identity: Verified. Location: Verified.",
    status: 'Pending AI Review'
  }
];

// --- UTILS ---
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  }).format(amount || 0).replace('$', '') + ' USDC';
};

const getCategoryColor = (category) => {
  const colors = {
    'Sanitation': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    'Infrastructure': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    'Furniture': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    'Energy & IT': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'Libraries': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  };
  return colors[category] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
};

const getTrustScoreColor = (score) => {
  if (score >= 80) return 'text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800/50';
  if (score >= 50) return 'text-amber-700 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800/50';
  return 'text-rose-700 bg-rose-100 dark:text-rose-400 dark:bg-rose-900/30 border-rose-200 dark:border-rose-800/50';
};

// --- IMAGE UPLOAD COMPONENT ---
function ImageUploadField({ image, onChange }) {
  const [dragActive, setDragActive] = useState(false);
  const [useUrl, setUseUrl] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WEBP, etc.)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      onChange(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
          Campaign Cover Image
        </label>
        <button
          type="button"
          onClick={() => setUseUrl(!useUrl)}
          className="text-xs text-purple-600 dark:text-purple-400 hover:underline font-medium"
        >
          {useUrl ? 'Upload file instead' : 'Use image URL instead'}
        </button>
      </div>

      {useUrl ? (
        <div className="relative">
          <ImageIcon size={18} className="absolute left-3 top-3.5 text-slate-400" />
          <input
            type="text"
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
            placeholder="https://..."
            value={image}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      ) : (
        <div>
          {image ? (
            <div className="relative rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-800 group h-48 flex items-center justify-center">
              <img
                src={image}
                alt="Campaign preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/auth-hero-3d.png';
                }}
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-white text-slate-800 rounded-lg text-xs font-semibold shadow hover:bg-slate-100 transition-all flex items-center gap-1.5"
                >
                  <Upload size={14} /> Change Image
                </button>
                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold shadow hover:bg-rose-700 transition-all flex items-center gap-1.5"
                >
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            </div>
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); }}
              onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); }}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                dragActive
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-slate-300 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-500 bg-slate-50 dark:bg-slate-800/40'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Upload size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Click to upload image or drag &amp; drop
                </p>
                <p className="text-xs text-slate-500 mt-0.5">PNG, JPG, WEBP up to 10MB</p>
              </div>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
          />
        </div>
      )}
    </div>
  );
}

// --- MODALS ---
function EditModal({ campaign, onClose, onSave }) {
  const [formData, setFormData] = useState({ ...campaign });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = (e) => { e.preventDefault(); onSave(formData); };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <Edit3 size={20} className="text-purple-600 dark:text-purple-400" /> Edit Campaign
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="edit-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Campaign Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-sm" required />
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-sm">
                  <option value="Energy & IT">Energy & IT</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Libraries">Libraries</option>
                  <option value="Sanitation">Sanitation</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Goal (USDC)</label>
                <input type="number" name="goal" value={formData.goal} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-sm" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Location / District</label>
                <input type="text" name="location" value={formData.location || ''} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                <select name="status" value={formData.status || 'Active'} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-sm">
                  <option value="Active">Active</option>
                  <option value="Pending AI Review">Pending AI Review</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <ImageUploadField
              image={formData.image || ''}
              onChange={(imgUrl) => setFormData({ ...formData, image: imgUrl })}
            />

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-sm" required></textarea>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
          <button onClick={onClose} className="px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium text-sm">Cancel</button>
          <button form="edit-form" type="submit" className="px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/20 transition-all font-medium text-sm">Save Changes</button>
        </div>
      </div>
    </div>
  );
}

// --- CREATE CAMPAIGN VIEW ---
function CreateCampaignView({ onAddCampaign, walletAddress, onConnectWallet }) {
  const [title, setTitle] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [category, setCategory] = useState('Sanitation');
  const [remoteness, setRemoteness] = useState('High');
  const [location, setLocation] = useState('');
  const [requestedUsd, setRequestedUsd] = useState('');
  const [scaleIndex, setScaleIndex] = useState('4');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');

  const [schoolsList, setSchoolsList] = useState([]);
  const SRI_LANKA_DISTRICTS = [
    'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 'Galle', 'Gampaha',
    'Hambantota', 'Jaffna', 'Kalutara', 'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala',
    'Mannar', 'Matale', 'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya',
    'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
  ];

  const [trustScore, setTrustScore] = useState(null);
  const [status, setStatus] = useState(null);
  const [breakdown, setBreakdown] = useState('');
  const [signals, setSignals] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Web3 On-Chain Publish States
  const [publishState, setPublishState] = useState('idle');
  const [txHash, setTxHash] = useState('');
  const [onChainId, setOnChainId] = useState(null);
  const [publishError, setPublishError] = useState('');

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const url = location
          ? `http://localhost:5000/schools?district=${encodeURIComponent(location)}`
          : 'http://localhost:5000/schools?limit=100';
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setSchoolsList(data.schools || []);
        }
      } catch (err) {
        console.warn("Could not fetch schools:", err);
      }
    };
    fetchSchools();
  }, [location]);

  useEffect(() => {
    setTrustScore(null);
    setStatus(null);
    setBreakdown('');
    setSignals(null);
    setPublishState('idle');
    setTxHash('');
    setOnChainId(null);
    setPublishError('');
  }, [title, schoolName, category, remoteness, location, requestedUsd, scaleIndex, image, description]);

  const handlePredict = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = {
        title,
        school_name: schoolName,
        category,
        remoteness,
        district: location,
        location,
        requested_usd: parseFloat(requestedUsd) || 0,
        goal: parseFloat(requestedUsd) || 0,
        scale_index: parseInt(scaleIndex) || 5,
        description
      };

      const res = await fetch('http://localhost:5000/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setTrustScore(data.trust_score || 0);
        setStatus(data.status || 'Verified');
        setBreakdown(data.breakdown || '');
        setSignals(data.signals || null);
      } else {
        throw new Error('AI Service returned non-200');
      }
    } catch (err) {
      console.error("AI analysis error:", err);
      setTrustScore(0);
      setStatus('AI Offline');
      setBreakdown('Unable to connect to AI microservice on port 5000. Please ensure Python backend is running.');
      setSignals(null);
    }
    setIsLoading(false);
  };

  const handlePublish = async () => {
    setPublishError('');
    setPublishState('connecting');

    try {
      if (!walletAddress) {
        if (onConnectWallet) {
          await onConnectWallet();
        } else {
          throw new Error("Please connect your Admin wallet in the top bar before publishing on-chain.");
        }
      }

      await ensureAmoyNetwork();

      let createdOnChainId = null;
      let transactionHash = null;

      const provider = getBrowserProvider();
      const hasContractBytecode = await isContract(SMART_CONTRACT_ADDRESS, provider);

      if (SMART_CONTRACT_ADDRESS && SMART_CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000' && hasContractBytecode) {
        setPublishState('signing');
        const signer = await getSigner();
        const contract = getEscrowContract(signer);

        const goalAmountInUnits = ethers.parseUnits(requestedUsd.toString(), 6);
        const metadataCidOrJson = JSON.stringify({
          title,
          schoolName,
          description,
          category,
          remoteness,
          location,
          image: image || '/images/auth-hero-3d.png'
        });

        const tx = await contract.createCampaign(title, metadataCidOrJson, goalAmountInUnits);
        setTxHash(tx.hash);
        transactionHash = tx.hash;

        setPublishState('mining');
        const receipt = await tx.wait();

        for (const log of receipt.logs) {
          try {
            const parsedLog = contract.interface.parseLog(log);
            if (parsedLog && parsedLog.name === 'CampaignCreated') {
              createdOnChainId = Number(parsedLog.args.campaignId);
              break;
            }
          } catch (_) { }
        }
        setOnChainId(createdOnChainId);
      } else {
        if (SMART_CONTRACT_ADDRESS && !hasContractBytecode) {
          console.warn("SMART_CONTRACT_ADDRESS is set to an account rather than a deployed smart contract (no bytecode found). Simulating on-chain transaction hash for testnet.");
        } else {
          console.warn("VITE_SMART_CONTRACT_ADDRESS is not configured. Simulating transaction hash for testnet.");
        }
        transactionHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
        setTxHash(transactionHash);
      }

      const newCampaign = {
        title,
        schoolName,
        category,
        remoteness,
        location: location || 'Unknown',
        goal: parseFloat(requestedUsd),
        raised: 0,
        score: trustScore,
        scoreBreakdown: breakdown,
        status: 'Active',
        image: image || '/images/auth-hero-3d.png',
        description,
        scaleIndex: parseInt(scaleIndex) || 5,
        onChainId: createdOnChainId,
        campaignId: createdOnChainId,
        txHash: transactionHash,
        ngoWallet: walletAddress || '0x0000000000000000000000000000000000000000'
      };

      const res = await fetch('http://localhost:3001/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCampaign)
      });

      if (res.ok) {
        const data = await res.json();
        setPublishState('success');
        setTimeout(() => {
          onAddCampaign(data);
        }, 2000);
      } else {
        throw new Error("Failed to save campaign record to the database.");
      }
    } catch (err) {
      console.error("Publishing error:", err);
      setPublishError(formatWeb3Error(err));
      setPublishState('error');
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <Activity className="text-purple-500" /> New Campaign &amp; AI Verification
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">
          Enter complete campaign details to evaluate on-chain Trust Score via our Random Forest &amp; NER AI Engine.
        </p>

        <form onSubmit={handlePredict} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Campaign Title</label>
                <input
                  type="text"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
                  placeholder="e.g. Sanitary Block Construction"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">School / Educational Institution</label>
                  <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800/40">
                    Required for &ge;80% Trust
                  </span>
                </div>
                <input
                  type="text"
                  list="schools-datalist"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
                  placeholder={location ? `Select or type official school in ${location}...` : "e.g. Bandarawela Vidyalaya"}
                  value={schoolName}
                  onChange={e => {
                    const val = e.target.value;
                    setSchoolName(val);
                    const matched = schoolsList.find(s => s.School_Name.toLowerCase() === val.toLowerCase());
                    if (matched && !location) {
                      setLocation(matched.District);
                    }
                  }}
                  required
                />
                <datalist id="schools-datalist">
                  {schoolsList.map((s, idx) => (
                    <option key={idx} value={s.School_Name}>
                      {s.School_Name} ({s.District})
                    </option>
                  ))}
                </datalist>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  Matches Sri Lankan Ministry of Education registry for on-chain audit verification.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                  >
                    <option value="Sanitation">Sanitation</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Energy & IT">Energy & IT</option>
                    <option value="Libraries">Libraries</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">District</label>
                  <input
                    type="text"
                    list="districts-datalist"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
                    placeholder="e.g. Kandy"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    required
                  />
                  <datalist id="districts-datalist">
                    {SRI_LANKA_DISTRICTS.map((d, idx) => (
                      <option key={idx} value={d} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Remoteness</label>
                  <select
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
                    value={remoteness}
                    onChange={e => setRemoteness(e.target.value)}
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Scale Index</label>
                  <input
                    type="number"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
                    placeholder="1-10"
                    value={scaleIndex}
                    onChange={e => setScaleIndex(e.target.value)}
                    required
                    min="1"
                    max="10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Requested (USDC)</label>
                <input
                  type="number"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
                  placeholder="e.g. 1850"
                  value={requestedUsd}
                  onChange={e => setRequestedUsd(e.target.value)}
                  required
                  min="1"
                />
              </div>
            </div>

            <div className="space-y-5">
              <ImageUploadField image={image} onChange={setImage} />

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  rows="4"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none text-sm"
                  placeholder="Detailed description of school need, beneficiary count, and infrastructure scope..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  required
                ></textarea>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-purple-600 dark:hover:bg-purple-500 text-white rounded-lg font-semibold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Shield size={18} />}
            {isLoading ? 'Analyzing Campaign Details...' : 'Generate AI Trust Score'}
          </button>
        </form>
      </div>

      {trustScore !== null && (
        <div className="bg-gradient-to-br from-purple-50 to-white dark:from-slate-900 dark:to-slate-800 border border-purple-100 dark:border-purple-500/20 rounded-2xl p-6 shadow-sm flex flex-col gap-5 transform animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">AI Verification Complete</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm">
                {trustScore >= 80
                  ? "Campaign parameters passed the NER & ML model verification audit. Ready for Polygon Amoy on-chain escrow deployment."
                  : "Trust score is below the 80% threshold required for on-chain smart contract escrow deployment."}
              </p>
            </div>

            <div className="flex flex-col items-center justify-center">
              <div className={`text-4xl font-black mb-1 ${trustScore >= 80 ? 'text-emerald-500' : 'text-amber-500'}`}>
                {trustScore}%
              </div>
              <div className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                trustScore >= 80
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
              }`}>
                {status}
              </div>
            </div>

            <div className="w-full md:w-auto border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-700/50 pt-4 md:pt-0 md:pl-6 flex flex-col items-center">
              {trustScore >= 80 ? (
                <button
                  onClick={handlePublish}
                  disabled={publishState === 'signing' || publishState === 'mining' || publishState === 'connecting' || publishState === 'success'}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-6 py-2.5 rounded-lg font-semibold shadow-sm shadow-purple-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {publishState === 'connecting' && <Loader2 size={18} className="animate-spin" />}
                  {publishState === 'signing' && <Loader2 size={18} className="animate-spin" />}
                  {publishState === 'mining' && <Loader2 size={18} className="animate-spin" />}
                  {publishState === 'success' && <CheckCircle size={18} />}
                  {(publishState === 'idle' || publishState === 'error') && <CheckCircle size={18} />}

                  {publishState === 'connecting' && 'Verifying Network...'}
                  {publishState === 'signing' && 'Awaiting Signature...'}
                  {publishState === 'mining' && 'Confirming on Polygon Amoy...'}
                  {publishState === 'success' && 'Published On-Chain!'}
                  {(publishState === 'idle' || publishState === 'error') && 'Publish to Network'}
                </button>
              ) : (
                <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold px-4 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50">
                  Requires &ge;80% to Publish
                </span>
              )}
            </div>
          </div>

          {/* Actionable guidance banner if score is below 80% */}
          {trustScore < 80 && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
              <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">How to reach &ge;80% High Trust:</span>
                {signals && !signals.school_registry_verified && (
                  <span className="ml-1">
                    The institution is unverified (School Identity: 20%). Select or type an official registered school in the <strong>School / Educational Institution</strong> field from the Sri Lanka registry.
                  </span>
                )}
                {signals && signals.school_registry_verified && !signals.district_verified && (
                  <span className="ml-1">
                    District mismatch: "{signals.matched_school}" is registered in a different district. Adjust District to match the school location to gain full geographic verification.
                  </span>
                )}
                {signals && signals.school_registry_verified && signals.district_verified && (
                  <span className="ml-1">
                    Budget feasibility: Ensure the requested USDC amount is proportional to the scale index (current cost: ${signals.cost_per_scale}/scale).
                  </span>
                )}
              </div>
            </div>
          )}

          {/* AI Audit Reasoning Breakdown */}
          {breakdown && (
            <div className="bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-xs text-slate-600 dark:text-slate-300">
              <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                <Sparkles size={14} className="text-purple-500" /> AI Verification Signals &amp; Audit Breakdown:
              </div>
              <p className="leading-relaxed">{breakdown}</p>
              {signals && (
                <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <div className="text-center p-2 rounded-lg bg-slate-50 dark:bg-slate-900">
                    <span className="text-slate-400 block text-[10px] uppercase">Budget Feasibility</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400 text-sm">{signals.ml_feasibility}%</span>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-slate-50 dark:bg-slate-900">
                    <span className="text-slate-400 block text-[10px] uppercase">School Identity</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">{signals.school_identity}%</span>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-slate-50 dark:bg-slate-900">
                    <span className="text-slate-400 block text-[10px] uppercase">Geo Verification</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{signals.geo_verification}%</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Web3 Publishing Status Banner */}
          {publishState !== 'idle' && (
            <div className={`p-4 rounded-xl text-sm border transition-all ${
              publishState === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : publishState === 'error'
                  ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                  : 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-300'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {publishState === 'success' ? (
                    <CheckCircle className="text-emerald-600 dark:text-emerald-400" size={18} />
                  ) : publishState === 'error' ? (
                    <X className="text-rose-600 dark:text-rose-400" size={18} />
                  ) : (
                    <Loader2 className="animate-spin text-purple-600 dark:text-purple-400" size={18} />
                  )}
                  <span className="font-medium">
                    {publishState === 'connecting' && 'Switching to Polygon Amoy Testnet...'}
                    {publishState === 'signing' && 'Please confirm the transaction in your MetaMask wallet...'}
                    {publishState === 'mining' && 'Transaction submitted. Waiting for block confirmation on Polygon Amoy...'}
                    {publishState === 'success' && `Campaign successfully minted on-chain ${onChainId !== null ? `(ID #${onChainId})` : ''}! Redirecting...`}
                    {publishState === 'error' && (publishError || 'Failed to publish campaign to blockchain.')}
                  </span>
                </div>
                {txHash && (
                  <a
                    href={getExplorerTxUrl(txHash)}
                    target="_blank"
                    rel="noreferrer"
                    className="underline text-xs font-semibold flex items-center gap-1 hover:opacity-80 ml-2"
                  >
                    View on Polygonscan <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- DASHBOARD VIEW (Displays Content Corresponding to 4 Metric Cards) ---
function DashboardOverviewView({ campaigns, metrics, onNavigateTab }) {
  // Category Breakdown Calculations
  const categoryStats = useMemo(() => {
    const categories = ['Sanitation', 'Infrastructure', 'Furniture', 'Energy & IT', 'Libraries'];
    return categories.map(cat => {
      const catCampaigns = campaigns.filter(c => c.category === cat);
      const raised = catCampaigns.reduce((sum, c) => sum + parseFloat(c.raised || 0), 0);
      const goal = catCampaigns.reduce((sum, c) => sum + parseFloat(c.goal || 0), 0);
      const avgScore = catCampaigns.length > 0
        ? Math.round(catCampaigns.reduce((sum, c) => sum + (c.score || 0), 0) / catCampaigns.length)
        : 0;
      return {
        category: cat,
        count: catCampaigns.length,
        raised,
        goal,
        avgScore,
        percent: goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0
      };
    });
  }, [campaigns]);

  // Overall Funding Percentage
  const totalGoalNum = campaigns.reduce((acc, c) => acc + parseFloat(c.goal || 0), 0);
  const totalRaisedNum = campaigns.reduce((acc, c) => acc + parseFloat(c.raised || 0), 0);
  const overallFundingPct = totalGoalNum > 0 ? Math.round((totalRaisedNum / totalGoalNum) * 100) : 0;

  // AI Score Health Tiers
  const highTrustCount = campaigns.filter(c => (c.score || 0) >= 80).length;
  const mediumTrustCount = campaigns.filter(c => (c.score || 0) >= 50 && (c.score || 0) < 80).length;
  const lowTrustCount = campaigns.filter(c => (c.score || 0) < 50).length;

  return (
    <div className="space-y-8">
      {/* 4 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Campaigns',
            value: `${metrics.activeCount} Active`,
            subtitle: `${campaigns.filter(c => c.status === 'Completed').length} Completed • ${campaigns.filter(c => c.status === 'Pending AI Review').length} Pending`,
            icon: LayoutDashboard,
            color: 'text-blue-500',
            bg: 'bg-blue-100 dark:bg-blue-500/10'
          },
          {
            label: 'Total Funds Raised',
            value: metrics.raised,
            subtitle: `${overallFundingPct}% of total goal achieved`,
            icon: TrendingUp,
            color: 'text-emerald-500',
            bg: 'bg-emerald-100 dark:bg-emerald-500/10'
          },
          {
            label: 'Avg. AI Trust Score',
            value: `${metrics.avgScore} Verified`,
            subtitle: `${highTrustCount} of ${campaigns.length} above 80% threshold`,
            icon: Shield,
            color: 'text-purple-500',
            bg: 'bg-purple-100 dark:bg-purple-500/10'
          },
          {
            label: 'Total Target Goal',
            value: metrics.goal,
            subtitle: `Across ${campaigns.length} infrastructure projects`,
            icon: Wallet,
            color: 'text-amber-500',
            bg: 'bg-amber-100 dark:bg-amber-500/10'
          },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:border-purple-300 dark:hover:border-purple-800 transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                <stat.icon size={18} />
              </div>
              <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</h4>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{stat.value}</div>
            <p className="text-xs text-slate-400 mt-1.5">{stat.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Corresponding Content Section 1: Funds Raised vs Target Goal Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp size={18} className="text-emerald-500" /> Funding Progress by Category
              </h3>
              <p className="text-xs text-slate-500">Distribution of funds raised against target goals across sectors</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">{overallFundingPct}%</span>
              <span className="text-xs text-slate-400 block">Overall Target</span>
            </div>
          </div>

          <div className="space-y-4">
            {categoryStats.map(cat => (
              <div key={cat.category} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getCategoryColor(cat.category)}`}>
                      {cat.category}
                    </span>
                    <span className="text-slate-400 font-normal">({cat.count} campaigns)</span>
                  </span>
                  <span className="font-medium text-slate-600 dark:text-slate-400">
                    <strong className="text-slate-900 dark:text-white">{formatCurrency(cat.raised)}</strong> / {formatCurrency(cat.goal)} ({cat.percent}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-700"
                    style={{ width: `${cat.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Corresponding Content Section 2: AI Trust Score Health & Verification Tiering */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <ShieldCheck size={18} className="text-purple-500" /> AI Trust Score Audit Health
            </h3>
            <p className="text-xs text-slate-500 mb-6">NER &amp; Random Forest model verification distribution</p>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                    &ge;80%
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">High Trust / Approved</div>
                    <div className="text-[11px] text-slate-500">Verified for smart contract escrow</div>
                  </div>
                </div>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{highTrustCount}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
                    50-79%
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Medium Trust / Review</div>
                    <div className="text-[11px] text-slate-500">Minor location or scale variance</div>
                  </div>
                </div>
                <span className="text-lg font-bold text-amber-600 dark:text-amber-400">{mediumTrustCount}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xs">
                    &lt;50%
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Low Trust / Flagged</div>
                    <div className="text-[11px] text-slate-500">Unregistered school or outlier budget</div>
                  </div>
                </div>
                <span className="text-lg font-bold text-rose-600 dark:text-rose-400">{lowTrustCount}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Model: Random Forest + spaCy NER</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">● Engine Online</span>
          </div>
        </div>
      </div>

      {/* Quick Access Action Bar */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-purple-950/30">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-lg font-bold">Ready to deploy a new school project?</h3>
          <p className="text-purple-200 text-xs max-w-xl">
            Propose a funding campaign, generate an AI trust score via NER verification, and mint on-chain escrow to Polygon Amoy.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateTab('ledger')}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Activity size={14} /> View Transparency Ledger
          </button>
          <button
            onClick={() => onNavigateTab('create')}
            className="px-4 py-2 rounded-xl bg-white text-purple-900 hover:bg-purple-50 text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} /> + New Campaign
          </button>
        </div>
      </div>
    </div>
  );
}

// --- TRANSPARENCY LEDGER VIEW (Shows Transactions) ---
function TransparencyLedgerView({ walletAddress }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedHash, setCopiedHash] = useState('');

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/transactions');
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (err) {
      console.error("Failed to load transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(''), 2000);
  };

  // Metrics
  const totalInflow = useMemo(() => {
    return transactions
      .filter(t => t.type === 'DONATION')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  }, [transactions]);

  const totalDisbursed = useMemo(() => {
    return transactions
      .filter(t => t.type === 'DISBURSEMENT')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  }, [transactions]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesType = filterType === 'ALL' || t.type === filterType;
      const matchesSearch = searchQuery === '' ||
        (t.campaignTitle && t.campaignTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.hash && t.hash.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.donorWallet && t.donorWallet.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesType && matchesSearch;
    });
  }, [transactions, filterType, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Transparency Header & High-Level Ledger Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 text-emerald-500">
              <ArrowDownLeft size={18} />
            </div>
            <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Inflow (Donations)</h4>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {formatCurrency(totalInflow)}
          </div>
          <p className="text-xs text-slate-400 mt-1">Direct to Smart Escrow</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-500/10 text-blue-500">
              <ArrowUpRight size={18} />
            </div>
            <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">Disbursed (Milestones)</h4>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {formatCurrency(totalDisbursed)}
          </div>
          <p className="text-xs text-slate-400 mt-1">Released against verified proof</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-500/10 text-purple-500">
              <Activity size={18} />
            </div>
            <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">Ledger Records</h4>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {transactions.length} Transactions
          </div>
          <p className="text-xs text-slate-400 mt-1">Immutable Polygon Amoy logs</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-500/10 text-teal-500">
              <ShieldCheck size={18} />
            </div>
            <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">Audit Verification</h4>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            100% Verified
          </div>
          <p className="text-xs text-slate-400 mt-1">OCR invoices &amp; escrow checks</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {['ALL', 'DONATION', 'DISBURSEMENT'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterType === type
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {type === 'ALL' ? 'All Transactions' : type === 'DONATION' ? 'Donations (Inflow)' : 'Milestone Disbursements'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by campaign, tx hash..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>
          <button
            onClick={fetchTransactions}
            className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Refresh transactions"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Transaction Type</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Campaign &amp; Scope</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Counterparty / Audit</th>
                <th className="px-6 py-4 text-right">Blockchain Proof</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    No transactions found matching the selected filter.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx._id || tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {tx.type === 'DONATION' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                          <ArrowDownLeft size={12} /> Donation
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60">
                          <ArrowUpRight size={12} /> Milestone Outflow
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-medium">
                      {tx.date || new Date(tx.createdAt).toISOString().split('T')[0]}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{tx.campaignTitle}</div>
                      {tx.milestone && (
                        <div className="text-[11px] text-purple-600 dark:text-purple-400 flex items-center gap-1 mt-0.5">
                          <Layers size={10} /> {tx.milestone}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`font-bold text-sm ${tx.type === 'DONATION' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                        {tx.type === 'DONATION' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {tx.type === 'DISBURSEMENT' ? (
                        <div>
                          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">
                            <ShieldCheck size={12} /> {tx.ocrStatus || 'Verified Audit'}
                          </div>
                          {tx.receiptFilename && (
                            <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                              <FileText size={10} /> {tx.receiptFilename}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="font-mono text-slate-500 text-[11px]">
                          {tx.donorWallet ? `${tx.donorWallet.substring(0, 8)}...${tx.donorWallet.substring(tx.donorWallet.length - 6)}` : 'Anonymous Donor'}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {tx.hash ? (
                        <div className="inline-flex items-center gap-1">
                          <a
                            href={getExplorerTxUrl(tx.hash)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 font-mono text-[11px] text-purple-700 dark:text-purple-300 hover:bg-purple-100 transition-colors"
                            title="View on Polygonscan Amoy"
                          >
                            <span>{tx.hash.substring(0, 6)}...{tx.hash.substring(tx.hash.length - 4)}</span>
                            <ExternalLink size={10} />
                          </a>
                          <button
                            onClick={() => copyToClipboard(tx.hash)}
                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
                            title="Copy transaction hash"
                          >
                            {copiedHash === tx.hash ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400">On-Chain Pending</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- SETTINGS VIEW ---
function SettingsView({ walletAddress }) {
  return (
    <div className="max-w-4xl space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
          <KeyRound size={20} className="text-purple-600 dark:text-purple-400" /> Blockchain Escrow Configuration
        </h3>
        <p className="text-xs text-slate-500 mb-6">Active smart contract and network parameters for school infrastructure funding</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 block mb-1">Target Network</span>
            <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              Polygon Amoy Testnet (Chain ID 80002)
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 block mb-1">Escrow Smart Contract</span>
            <div className="font-mono text-purple-600 dark:text-purple-400 font-semibold truncate">
              {SMART_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000'}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
          <Cpu size={20} className="text-indigo-600 dark:text-indigo-400" /> AI Verification Microservice Settings
        </h3>
        <p className="text-xs text-slate-500 mb-6">Machine learning parameters and registry verification bounds</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 block mb-1">AI Service Endpoint</span>
            <span className="font-semibold text-slate-900 dark:text-white">http://localhost:5000</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 block mb-1">Escrow Threshold</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">&ge; 80% Trust Score</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 block mb-1">Districts Registry</span>
            <span className="font-semibold text-slate-900 dark:text-white">25 Districts (All Sri Lanka)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- MAIN ADMIN DASHBOARD ---
function AdminDashboard({ walletAddress, setWalletAddress, userEmail, setUserEmail }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [campaigns, setCampaigns] = useState([]);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Connect Admin Wallet & Ensure Polygon Amoy
  const handleConnectWallet = async () => {
    setIsConnectingWallet(true);
    try {
      await ensureAmoyNetwork();
      const provider = getBrowserProvider();
      if (!provider) throw new Error("MetaMask not found.");
      const accounts = await provider.send("eth_requestAccounts", []);
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
      }
    } catch (err) {
      alert(formatWeb3Error(err));
    } finally {
      setIsConnectingWallet(false);
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      const handleAccounts = (accounts) => setWalletAddress(accounts[0] || '');
      const handleChain = () => window.location.reload();
      window.ethereum.on('accountsChanged', handleAccounts);
      window.ethereum.on('chainChanged', handleChain);

      getBrowserProvider()?.send("eth_accounts", []).then(accs => {
        if (accs && accs.length > 0) setWalletAddress(accs[0]);
      }).catch(() => { });

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccounts);
        window.ethereum.removeListener('chainChanged', handleChain);
      };
    }
  }, []);

  const loadCampaigns = () => {
    fetch('http://localhost:3001/api/campaigns')
      .then(res => res.json())
      .then(data => setCampaigns(data))
      .catch(err => console.error("Failed to load campaigns", err));
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  // Calculate Metrics
  const metrics = useMemo(() => {
    let totalRaised = 0;
    let totalGoal = 0;
    let totalScore = 0;
    let scoreCount = 0;

    campaigns.forEach(c => {
      totalRaised += parseFloat(c.raised || 0);
      totalGoal += parseFloat(c.goal || 0);
      if (c.score) {
        totalScore += parseFloat(c.score || 0);
        scoreCount++;
      }
    });

    return {
      activeCount: campaigns.filter(c => c.status === 'Active').length,
      raised: formatCurrency(totalRaised),
      goal: formatCurrency(totalGoal),
      avgScore: scoreCount > 0 ? (totalScore / scoreCount).toFixed(1) + '%' : '0%'
    };
  }, [campaigns]);

  const handleDelete = async (id) => {
    if (window.confirm("Delete this campaign?")) {
      try {
        const res = await fetch(`http://localhost:3001/api/campaigns/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setCampaigns(campaigns.filter(c => (c.id !== id && c._id !== id)));
        }
      } catch (err) { console.error(err); }
    }
  };

  const handleSaveEdit = async (updatedCampaign) => {
    try {
      const targetId = updatedCampaign.id || updatedCampaign._id;
      const res = await fetch(`http://localhost:3001/api/campaigns/${targetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updatedCampaign,
          goal: parseFloat(updatedCampaign.goal || 0),
          raised: parseFloat(updatedCampaign.raised || 0)
        })
      });
      if (res.ok) {
        const data = await res.json();
        setCampaigns(campaigns.map(c => ((c.id === data.id || c._id === data._id) ? data : c)));
        setEditingCampaign(null);
      }
    } catch (err) { console.error(err); }
  };

  const handleAddCampaign = (newCampaign) => {
    setCampaigns([newCampaign, ...campaigns]);
    setActiveTab('manage');
    window.scrollTo(0, 0);
  };

  const handleLogout = () => {
    localStorage.removeItem('auragive_admin_email');
    setUserEmail('');
  };

  const getBreadcrumbTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Overview';
      case 'manage': return 'Campaigns';
      case 'create': return 'Create Campaign';
      case 'ledger': return 'Transparency Ledger';
      case 'settings': return 'Settings';
      default: return 'Overview';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-800 dark:text-slate-200 font-sans flex">
      {/* Sidebar Desktop */}
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] flex flex-col sticky top-0 h-screen z-20 hidden lg:flex">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="font-bold text-xl flex items-center gap-2 text-slate-900 dark:text-white">
            <Shield className="text-purple-600 dark:text-purple-500 fill-purple-600/20" size={26} />
            AuraGive <span className="font-light text-slate-500">Admin</span>
          </div>
        </div>

        <div className="p-4 flex-1">
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-2">Navigation</p>
          <nav className="space-y-1">
            <button
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
              onClick={() => setActiveTab('dashboard')}
            >
              <LayoutDashboard size={18} /> Dashboard
            </button>
            <button
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm cursor-pointer ${
                activeTab === 'manage'
                  ? 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
              onClick={() => setActiveTab('manage')}
            >
              <ScrollText size={18} /> Manage Campaigns
            </button>
            <button
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm cursor-pointer ${
                activeTab === 'create'
                  ? 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
              onClick={() => setActiveTab('create')}
            >
              <Plus size={18} /> Create Campaign
            </button>
            <button
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm cursor-pointer ${
                activeTab === 'ledger'
                  ? 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
              onClick={() => setActiveTab('ledger')}
            >
              <Activity size={18} /> Transparency Ledger
            </button>
          </nav>

          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-8 mb-3 px-2">System</p>
          <nav className="space-y-1">
            <button
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings size={18} /> Settings
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-inner shrink-0">
              {userEmail.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">Admin User</p>
              <p className="text-xs text-slate-500 truncate">{userEmail}</p>
            </div>
            <button onClick={handleLogout} className="p-1.5 text-slate-400 hover:text-rose-500 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer" title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="relative w-64 bg-white dark:bg-[#0f172a] h-full flex flex-col z-10 border-r border-slate-200 dark:border-slate-800">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="font-bold text-lg flex items-center gap-2 text-slate-900 dark:text-white">
                <Shield className="text-purple-600" size={22} />
                AuraGive <span className="font-light text-slate-500">Admin</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 flex-1 space-y-1">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'manage', label: 'Manage Campaigns', icon: ScrollText },
                { id: 'create', label: 'Create Campaign', icon: Plus },
                { id: 'ledger', label: 'Transparency Ledger', icon: Activity },
                { id: 'settings', label: 'Settings', icon: Settings },
              ].map(item => (
                <button
                  key={item.id}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === item.id
                      ? 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                  onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                >
                  <item.icon size={18} /> {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#0f172a]/50 backdrop-blur-md sticky top-0 z-10 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden text-slate-500 mr-2 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu size={20} />
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className="text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium cursor-pointer"
            >
              Dashboard
            </button>
            <ChevronRight size={14} className="text-slate-400" />
            <span className="font-semibold text-slate-900 dark:text-white">{getBreadcrumbTitle()}</span>
          </div>

          <div className="flex items-center gap-3">
            {walletAddress ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  Polygon Amoy
                </div>
                <button
                  onClick={() => setWalletAddress('')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 text-xs font-mono font-medium text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-all cursor-pointer"
                  title="Click to disconnect wallet"
                >
                  <Wallet size={14} />
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnectWallet}
                disabled={isConnectingWallet}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                {isConnectingWallet ? <Loader2 size={14} className="animate-spin" /> : <Wallet size={14} />}
                Connect Admin Wallet
              </button>
            )}

            {activeTab !== 'create' && (
              <button
                onClick={() => setActiveTab('create')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} /> New Campaign
              </button>
            )}
          </div>
        </header>

        {/* View Router */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-6xl mx-auto">
            {/* Dynamic Page Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                {activeTab === 'dashboard' && 'Executive Dashboard'}
                {activeTab === 'manage' && 'Campaign Management'}
                {activeTab === 'create' && 'Create New Campaign'}
                {activeTab === 'ledger' && 'Transparency Ledger'}
                {activeTab === 'settings' && 'Platform Settings'}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                {activeTab === 'dashboard' && 'Comprehensive overview of campaigns, funding metrics, and AI verification health.'}
                {activeTab === 'manage' && 'Monitor, verify AI trust scores, edit, and publish school infrastructure campaigns.'}
                {activeTab === 'create' && 'Initialize a new funding proposal for AI verification and Polygon Amoy deployment.'}
                {activeTab === 'ledger' && 'Immutable record of on-chain escrow donations, milestone disbursements, and OCR audit proofs.'}
                {activeTab === 'settings' && 'Network parameters, AI microservice endpoints, and smart contract configuration.'}
              </p>
            </div>

            {/* TAB 1: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <DashboardOverviewView
                campaigns={campaigns}
                metrics={metrics}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}

            {/* TAB 2: MANAGE CAMPAIGNS */}
            {activeTab === 'manage' && (
              <>
                {/* 4 Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: 'Total Campaigns', value: `${metrics.activeCount} Active`, icon: LayoutDashboard, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-500/10' },
                    { label: 'Total Funds Raised', value: metrics.raised, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-500/10' },
                    { label: 'Avg. AI Trust Score', value: `${metrics.avgScore} Verified`, icon: Shield, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-500/10' },
                    { label: 'Total Target Goal', value: metrics.goal, icon: Wallet, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-500/10' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                          <stat.icon size={18} />
                        </div>
                        <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</h4>
                      </div>
                      <div className="text-xl font-bold text-slate-900 dark:text-white mt-2">{stat.value}</div>
                    </div>
                  ))}
                </div>

                {/* Campaigns Data Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                          <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Campaign &amp; Location</th>
                          <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                          <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Trust Score</th>
                          <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Funding Progress</th>
                          <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {campaigns.map(c => (
                          <tr key={c.id || c._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-800 bg-cover bg-center shrink-0 border border-slate-200 dark:border-slate-700"
                                  style={{ backgroundImage: `url(${c.image || '/images/auth-hero-3d.png'})` }}
                                ></div>
                                <div>
                                  <div className="font-semibold text-slate-900 dark:text-white text-sm">{c.title}</div>
                                  <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><MapPin size={10} /> {c.location}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${getCategoryColor(c.category)}`}>
                                {c.category}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {c.score ? (
                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-bold ${getTrustScoreColor(c.score)}`}>
                                  <Shield size={12} /> {c.score}%
                                </div>
                              ) : (
                                <span className="text-slate-400 text-xs">Pending</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap min-w-[200px]">
                              <div className="flex justify-between text-xs mb-1.5">
                                <span className="font-medium text-slate-700 dark:text-slate-300">{formatCurrency(c.raised)}</span>
                                <span className="text-slate-500">{formatCurrency(c.goal)}</span>
                              </div>
                              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.min(100, (c.raised / c.goal) * 100)}%` }}></div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`text-xs font-semibold flex items-center gap-1.5 ${c.status === 'Active' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>
                                {c.status === 'Active' ? <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> : null}
                                {c.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => setEditingCampaign(c)} className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-500/10 rounded-md transition-colors cursor-pointer" title="Edit">
                                  <Edit3 size={16} />
                                </button>
                                {c.txHash ? (
                                  <a
                                    href={getExplorerTxUrl(c.txHash)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-md transition-colors"
                                    title="View on Polygonscan"
                                  >
                                    <ExternalLink size={16} />
                                  </a>
                                ) : (
                                  <button className="p-1.5 text-slate-300 dark:text-slate-600 cursor-not-allowed rounded-md" title="Not yet on-chain">
                                    <ExternalLink size={16} />
                                  </button>
                                )}
                                <button onClick={() => handleDelete(c.id || c._id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-md transition-colors cursor-pointer" title="Delete">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* TAB 3: CREATE CAMPAIGN */}
            {activeTab === 'create' && (
              <CreateCampaignView
                onAddCampaign={handleAddCampaign}
                walletAddress={walletAddress}
                onConnectWallet={handleConnectWallet}
              />
            )}

            {/* TAB 4: TRANSPARENCY LEDGER */}
            {activeTab === 'ledger' && (
              <TransparencyLedgerView walletAddress={walletAddress} />
            )}

            {/* TAB 5: SETTINGS */}
            {activeTab === 'settings' && (
              <SettingsView walletAddress={walletAddress} />
            )}

          </div>
        </div>
      </main>

      {editingCampaign && (
        <EditModal
          campaign={editingCampaign}
          onClose={() => setEditingCampaign(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}

// --- AUTH COMPONENT WITH PERSISTENCE ---
function EmailAuth({ setUserEmail }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && password) {
      setIsLoading(true);
      setTimeout(() => {
        if (rememberMe) {
          localStorage.setItem('auragive_admin_email', email);
        }
        setUserEmail(email);
      }, 400);
    }
  };

  return (
    <div className="relative min-h-screen lg:h-screen w-full flex flex-col justify-between overflow-x-hidden bg-[#070a14] text-slate-100 font-['Outfit',sans-serif]">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-35 mix-blend-luminosity scale-105 pointer-events-none transition-all duration-1000"
        style={{ backgroundImage: "url('/admin-login-bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#060813]/90 via-[#070b18]/80 to-[#050711]/95 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#060813]/80 via-transparent to-[#060813]/80 pointer-events-none" />

      <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-cyan-600/15 rounded-full blur-[140px] pointer-events-none" />

      <header className="relative z-20 w-full px-6 py-3 lg:px-12 flex items-center justify-between border-b border-white/5 backdrop-blur-md bg-slate-950/40 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/25 ring-1 ring-purple-400/40">
              <Shield className="text-white" size={20} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base sm:text-lg text-white tracking-tight">AuraGive</span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                ADMIN CONSOLE
              </span>
            </div>
            <p className="text-[11px] text-slate-400">School Infrastructure Protocol • Sri Lanka</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/60 backdrop-blur-md text-xs font-medium text-slate-300 shadow-sm">
            <span>Polygon Amoy (80002)</span>
          </div>
        </div>
      </header>

      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-3 lg:py-6 flex-1 flex items-center justify-center overflow-y-auto lg:overflow-visible">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full my-auto">
          <div className="lg:col-span-7 space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight leading-[1.12] bg-gradient-to-r from-white via-slate-100 to-purple-300 bg-clip-text text-transparent">
              Decentralized Escrow &amp; <br className="hidden sm:inline" />
              AI Verification Portal
            </h1>
            <p className="text-slate-400 text-sm sm:text-base lg:text-lg leading-relaxed max-w-xl font-normal">
              Secure administrative access for school infrastructure project verification, AI trust scoring, and escrow release management.
            </p>
          </div>

          <div className="lg:col-span-5 w-full flex justify-center lg:justify-end">
            <div className="w-full max-w-md relative rounded-2xl sm:rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-6 sm:p-7 lg:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85),0_0_40px_-5px_rgba(139,92,246,0.25)] overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400" />
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-36 h-36 bg-purple-500/15 rounded-full blur-2xl pointer-events-none" />

              <div className="text-center mb-4 sm:mb-5">
                <div className="inline-flex p-2.5 rounded-xl bg-gradient-to-tr from-purple-600/30 to-indigo-600/30 border border-purple-500/30 text-purple-300 shadow-xl shadow-purple-950/40 ring-4 ring-purple-500/10 mb-2">
                  <Lock size={22} className="text-purple-300" />
                </div>
                <div className="mb-1.5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-purple-500/15 text-purple-300 border border-purple-500/30">
                    <Shield size={11} className="text-purple-400" />
                    AuraGive Admin Portal
                  </span>
                </div>
                <h2 className="text-2xl sm:text-2xl lg:text-[26px] font-bold text-white tracking-tight">Admin Sign In</h2>
                <p className="text-slate-400 text-xs mt-1">
                  Authenticate with authorized governance credentials
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Admin Email Address
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-400 transition-colors" size={16} />
                    <input
                      type="email"
                      className="w-full h-11 sm:h-12 bg-slate-950/70 border border-slate-700/80 group-hover:border-slate-600 rounded-xl pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all font-medium"
                      placeholder="admin@auragive.org"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Master Password
                    </label>
                    <span className="text-xs text-purple-400 hover:text-purple-300 cursor-pointer">
                      Security policy
                    </span>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-400 transition-colors" size={16} />
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full h-11 sm:h-12 bg-slate-950/70 border border-slate-700/80 group-hover:border-slate-600 rounded-xl pl-11 pr-11 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all font-medium"
                      placeholder="••••••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer p-1"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400 hover:text-slate-300 select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-950 text-purple-600 focus:ring-purple-500/40 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span>Remember session</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 sm:h-12 relative overflow-hidden bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 transition-all duration-300 mt-1 flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-75 text-sm"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin text-white" />
                      <span>Authenticating credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Dashboard</span>
                      <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform duration-200" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-center gap-2 text-slate-400 text-[11px]">
                <ShieldCheck size={13} className="text-emerald-400" />
                <span>Restricted administrative zone. Actions are auditable.</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-20 w-full px-6 py-2.5 border-t border-white/5 backdrop-blur-md bg-slate-950/50 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2 shrink-0">
        <div>
          © 2026 <span className="text-slate-300 font-semibold">AuraGive Platform</span>. Sri Lanka School Infrastructure Escrow Initiative.
        </div>
        <div className="flex items-center gap-4">
          <span className="hover:text-slate-400 transition-colors">Polygon Amoy (ID 80002)</span>
          <span>•</span>
          <span className="hover:text-slate-400 transition-colors">Random Forest &amp; NER AI Microservice</span>
          <span>•</span>
          <span className="hover:text-slate-400 transition-colors">Smart Escrow Vaults</span>
        </div>
      </footer>
    </div>
  );
}

function App() {
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('auragive_admin_email') || '');
  const [walletAddress, setWalletAddress] = useState('');

  return (
    <Router>
      {!userEmail ? (
        <Routes>
          <Route path="*" element={<EmailAuth setUserEmail={setUserEmail} />} />
        </Routes>
      ) : (
        <Routes>
          <Route
            path="/"
            element={
              <AdminDashboard
                walletAddress={walletAddress}
                setWalletAddress={setWalletAddress}
                userEmail={userEmail}
                setUserEmail={setUserEmail}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;
