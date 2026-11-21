import { ethers } from 'ethers';

// --- NETWORK CONFIGURATION ---
export const AMOY_CHAIN_ID_DECIMAL = 80002;
export const AMOY_CHAIN_ID_HEX = '0x13882';
export const AMOY_RPC_URL = import.meta.env.VITE_POLYGON_AMOY_RPC_URL || 'https://polygon-amoy-bor-rpc.publicnode.com';
export const SMART_CONTRACT_ADDRESS = import.meta.env.VITE_SMART_CONTRACT_ADDRESS || '';
export const USDC_TOKEN_ADDRESS = import.meta.env.VITE_USDC_TOKEN_ADDRESS || '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582';
export const SYSTEM_WALLET_ADDRESS = import.meta.env.VITE_SYSTEM_WALLET_ADDRESS || import.meta.env.VITE_SMART_CONTRACT_ADDRESS || '0xD2C93CA2b2488E83D0d612C51e647F0217D5FAFC';
export const EXPLORER_URL = 'https://amoy.polygonscan.com';

export const AMOY_NETWORK_PARAMS = {
  chainId: AMOY_CHAIN_ID_HEX,
  chainName: 'Polygon Amoy Testnet',
  nativeCurrency: {
    name: 'POL',
    symbol: 'POL',
    decimals: 18,
  },
  rpcUrls: [AMOY_RPC_URL],
  blockExplorerUrls: [EXPLORER_URL],
};

// --- CONTRACT ABIs ---
export const DONATION_ESCROW_ABI = [
  "function createCampaign(string calldata title, string calldata descriptionCid, uint256 goalAmount) external returns (uint256 campaignId)",
  "function donate(uint256 campaignId, uint256 amount) external",
  "function setCampaignVerification(uint256 campaignId, bool verified) external",
  "function addMilestone(uint256 campaignId, string calldata description, uint256 amount) external",
  "function requestMilestoneRelease(uint256 campaignId, uint256 milestoneId, string calldata proofDocumentCid) external",
  "function approveMilestone(uint256 campaignId, uint256 milestoneId) external",
  "function releaseFunds(uint256 campaignId, uint256 milestoneId) external",
  "function campaigns(uint256) external view returns (address ngoWallet, string title, string descriptionCid, uint256 goalAmount, uint256 raisedAmount, bool isVerified, bool isActive, uint256 milestoneCount)",
  "function milestones(uint256, uint256) external view returns (string description, uint256 amount, bool isApproved, bool isReleased, string proofDocumentCid)",
  "function nextCampaignId() external view returns (uint256)",
  "function usdcToken() external view returns (address)",
  "event CampaignCreated(uint256 indexed campaignId, address indexed ngoWallet)",
  "event CampaignVerified(uint256 indexed campaignId)",
  "event DonationReceived(uint256 indexed campaignId, address indexed donor, uint256 amount)",
  "event MilestoneRequested(uint256 indexed campaignId, uint256 milestoneId, string proofDocumentCid)",
  "event FundsReleased(uint256 indexed campaignId, uint256 milestoneId, uint256 amount)"
];

export const ERC20_ABI = [
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
  "function decimals() external view returns (uint8)",
  "function balanceOf(address account) external view returns (uint256)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)"
];

// --- PROVIDER & SIGNER UTILITIES ---
export const getBrowserProvider = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  return null;
};

export const getJsonRpcProvider = () => {
  return new ethers.JsonRpcProvider(AMOY_RPC_URL, {
    chainId: AMOY_CHAIN_ID_DECIMAL,
    name: 'amoy'
  });
};

export const getSigner = async () => {
  const provider = getBrowserProvider();
  if (!provider) {
    throw new Error("No Web3 wallet detected. Please install MetaMask.");
  }
  return await provider.getSigner();
};

// --- NETWORK SWITCHING ---
export const ensureAmoyNetwork = async () => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error("MetaMask is not installed.");
  }

  try {
    const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (currentChainId.toLowerCase() === AMOY_CHAIN_ID_HEX.toLowerCase()) {
      return true;
    }

    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: AMOY_CHAIN_ID_HEX }],
    });
    return true;
  } catch (switchError) {
    if (switchError.code === 4902 || switchError?.data?.originalError?.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [AMOY_NETWORK_PARAMS],
      });
      return true;
    }
    throw switchError;
  }
};

// --- ADDRESS / CODE UTILITIES ---
export const isContract = async (address, provider) => {
  if (!address || !ethers.isAddress(address) || address === ethers.ZeroAddress) {
    return false;
  }
  try {
    const p = provider || getJsonRpcProvider();
    const code = await p.getCode(address);
    return code && code !== '0x';
  } catch (e) {
    console.warn("Could not check contract code for address:", address, e);
    return false;
  }
};

// --- CONTRACT INITIALIZATION ---
export const getEscrowContract = (signerOrProvider) => {
  const address = SMART_CONTRACT_ADDRESS;
  if (!address || address === '0x0000000000000000000000000000000000000000') {
    console.warn("VITE_SMART_CONTRACT_ADDRESS is not set. Using placeholder contract.");
  }
  return new ethers.Contract(address || ethers.ZeroAddress, DONATION_ESCROW_ABI, signerOrProvider);
};

export const getUsdcContract = (tokenAddress, signerOrProvider) => {
  const addr = tokenAddress || USDC_TOKEN_ADDRESS;
  if (!addr || addr === ethers.ZeroAddress) {
    throw new Error("Invalid USDC token address provided.");
  }
  return new ethers.Contract(addr, ERC20_ABI, signerOrProvider);
};

// --- GAS & FEE OVERRIDES FOR POLYGON AMOY ---
export const getPolygonFeeOverrides = async (provider) => {
  const minTip = ethers.parseUnits('25', 'gwei');
  try {
    const p = provider || getJsonRpcProvider();
    const feeData = await p.getFeeData();
    let priorityFee = feeData.maxPriorityFeePerGas;
    if (!priorityFee || priorityFee < minTip) {
      priorityFee = minTip;
    }
    let maxFee = feeData.maxFeePerGas;
    if (!maxFee || maxFee < priorityFee) {
      maxFee = (priorityFee * 125n) / 100n;
    }
    return {
      maxPriorityFeePerGas: priorityFee,
      maxFeePerGas: maxFee,
    };
  } catch (err) {
    console.warn("Could not get network fee data, using Amoy standard fees:", err);
    return {
      maxPriorityFeePerGas: ethers.parseUnits('25', 'gwei'),
      maxFeePerGas: ethers.parseUnits('30', 'gwei'),
    };
  }
};

// --- EXPLORER HELPERS ---
export const getExplorerTxUrl = (txHash) => `${EXPLORER_URL}/tx/${txHash}`;
export const getExplorerAddressUrl = (address) => `${EXPLORER_URL}/address/${address}`;

// --- ERROR PARSING ---
export const formatWeb3Error = (error) => {
  if (!error) return "Unknown error occurred";
  
  if (error.code === 4001 || error.code === 'ACTION_REJECTED') {
    return "Transaction was cancelled in your wallet.";
  }
  if (
    error?.message?.includes("gas tip cap") || 
    error?.message?.includes("transaction gas price below minimum") ||
    error?.data?.message?.includes("gas tip cap") ||
    error?.error?.message?.includes("gas tip cap")
  ) {
    return "Transaction failed: gas tip was below Polygon Amoy's required minimum (25 Gwei). Please try again (gas parameters have been automatically set).";
  }
  if (error.code === 'INSUFFICIENT_FUNDS' || error?.message?.includes("insufficient funds")) {
    return "Insufficient POL balance for gas fees.";
  }
  if (error?.message?.includes("Internal JSON-RPC error")) {
    return error.data?.message || "Blockchain transaction failed. Please check your token allowance and balance.";
  }
  if (
    error?.code === -32602 ||
    error?.message?.includes("External transactions to internal accounts cannot include data") ||
    error?.error?.message?.includes("External transactions to internal accounts cannot include data")
  ) {
    return "Contract Error: The configured SMART_CONTRACT_ADDRESS is a personal wallet, not a deployed smart contract. Please deploy DonationEscrow.sol to Polygon Amoy or set VITE_SMART_CONTRACT_ADDRESS to 0x0000000000000000000000000000000000000000 for testnet mode.";
  }
  if (error?.code === 'CALL_EXCEPTION') {
    if (error?.action === 'estimateGas') {
      return "Gas estimation failed. Please ensure you have sufficient POL for gas.";
    }
    return error.reason || "Smart contract call reverted or address is not a contract.";
  }
  if (error?.reason) {
    return error.reason;
  }
  return error.message || "Failed to complete transaction.";
};
