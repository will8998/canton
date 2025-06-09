# BitSafe DeFi Vault Platform 🔐

A Next.js-based decentralized finance platform for Bitcoin vault management with comprehensive wallet integration, KYC verification, and risk management features.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Copy environment config
cp env.config.example .env.local

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js 13+ App Router pages
│   ├── vault/[vaultId]/   # Dynamic vault detail pages
│   ├── kyc/               # KYC verification flow
│   ├── connect/           # Wallet connection flow
│   ├── dashboard/         # User dashboard
│   └── layout.tsx         # Root layout with providers
├── components/            # React components
│   ├── connect/           # Wallet connection components
│   ├── vault/             # Vault-related components
│   ├── DebugPanel.tsx     # Development debug panel
│   ├── ConnectWalletModal.tsx
│   └── ...
├── context/               # React Context providers
│   └── WalletContext.tsx  # Wallet state management
├── data/                  # Static data and configurations
│   ├── vaultDetails.ts    # Vault configuration
│   └── lagoonVaults.ts    # Lagoon Finance integration
└── globals.css            # Global styles
```

---

## 🔗 1. Wallet Connect Integration

### Overview
BitSafe supports multiple wallet types with hardware wallet integration for enhanced security.

### Supported Wallets
- **MetaMask** (Browser Extension)
- **Ledger** (Hardware Wallet via WebUSB)
- **Trezor** (Hardware Wallet via Trezor Connect)

### Key Files
```
src/context/WalletContext.tsx       # Main wallet integration logic
src/components/ConnectWalletModal.tsx # Wallet selection UI
src/components/connect/WalletConnection.tsx # Connection flow
```

### Backend Integration Points

#### MetaMask Integration
```typescript
// Location: src/context/WalletContext.tsx (line 283-304)
const connectMetaMask = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }
  
  const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts',
  });
  
  return accounts[0];
};
```

#### Ledger Integration
```typescript
// Location: src/context/WalletContext.tsx (line 306-358)
// Uses @ledgerhq/hw-transport-webusb and @ledgerhq/hw-app-eth
// Derivation path: "44'/60'/0'/0/0"
```

#### Trezor Integration
```typescript
// Location: src/context/WalletContext.tsx (line 360-398)
// Uses @trezor/connect-web
// Path: "m/44'/60'/0'/0/0"
```

### Backend Developer Tasks
1. **Smart Contract Integration**: Connect wallet addresses to smart contract calls
2. **Transaction Signing**: Implement transaction signing for deposits/withdrawals
3. **Address Validation**: Server-side Ethereum address validation
4. **Session Management**: Secure wallet session handling

---

## 🏦 2. Vault Integration

### Overview
Vault data is currently configured statically but designed for dynamic integration with Lagoon Finance and other vault providers.

### Key Files
```
src/data/vaultDetails.ts    # Vault configuration and metadata
src/data/lagoonVaults.ts    # Lagoon Finance specific vault data
src/components/VaultCard.tsx # Vault display component
src/app/vault/[vaultId]/page.tsx # Vault detail page
```

### Vault Data Structure
```typescript
// Location: src/data/vaultDetails.ts
interface LagoonVaultDetail {
  address: string;              // Smart contract address
  chainId: number;             // Blockchain network ID
  name: string;                // Display name
  apr: number;                 // Annual percentage rate
  tvl: number;                 // Total value locked
  riskLevel: "Low" | "Medium" | "High";
  managementFee: string;       // e.g., "2%"
  performanceFee: string;      // e.g., "25%"
  minimumDeposit: string;      // e.g., "0.001 cbBTC"
  // ... additional fields
}
```

### Backend Integration Points

#### 1. Vault Data API
**Create endpoint**: `GET /api/vaults`
```typescript
// Replace static data in src/data/vaultDetails.ts
// Fetch live vault data from your backend
```

#### 2. Real-time Vault Metrics
**Create endpoint**: `GET /api/vaults/{address}/metrics`
```typescript
// Returns: APR, TVL, performance data, fees
// Update: src/app/vault/[vaultId]/page.tsx line 226-252
```

#### 3. Deposit/Withdrawal Operations
**Create endpoints**:
- `POST /api/vaults/{address}/deposit`
- `POST /api/vaults/{address}/withdraw`

```typescript
// Current frontend integration points:
// src/app/vault/[vaultId]/page.tsx lines 269-358 (deposit)
// src/app/vault/[vaultId]/page.tsx lines 360-445 (withdraw)
```

#### 4. User Position Tracking
**Create endpoint**: `GET /api/user/{address}/positions`
```typescript
// Replace mock data in loadUserPosition() function
// Location: src/app/vault/[vaultId]/page.tsx line 226
```

### Smart Contract Integration
```typescript
// Current placeholder (lines 299-335 in vault page):
// TODO: Replace with actual smart contract calls
const cbBTCContract = new ethers.Contract(CBBTC_TOKEN_ADDRESS, ERC20_ABI, signer);
const vaultContract = new ethers.Contract(vaultDetail.address, VAULT_ABI, signer);
```

---

## 🆔 3. KYC Module with Persona API

### Overview
Know Your Customer verification using Persona's identity verification service.

### Key Files
```
src/app/kyc/page.tsx                    # KYC verification page
src/components/connect/KYCVerification.tsx # KYC flow component
src/components/KYCStatus.tsx            # KYC status display
src/context/WalletContext.tsx           # KYC state management
```

### Environment Variables
```bash
# Persona Configuration
NEXT_PUBLIC_PERSONA_TEMPLATE_ID=your_persona_template_id
PERSONA_API_KEY=persona_live_api_key_here
PERSONA_WEBHOOK_SECRET=persona_webhook_secret_here
NEXT_PUBLIC_KYC_ENABLED=true
```

### Backend Integration Points

#### 1. Persona Webhook Handler
**Create endpoint**: `POST /api/kyc/webhook`
```typescript
// Handle Persona verification status updates
// Verify webhook signature using PERSONA_WEBHOOK_SECRET
// Update user KYC status in database
```

#### 2. KYC Status API
**Create endpoints**:
- `GET /api/kyc/status/{walletAddress}`
- `POST /api/kyc/initiate`

```typescript
// Current frontend integration:
// src/context/WalletContext.tsx line 158-162 (status check)
// src/app/kyc/page.tsx line 89-180 (initiation)
```

#### 3. Persona Template Configuration
```typescript
// Frontend implementation (src/app/kyc/page.tsx line 89):
const client = new Persona.Client({
  templateId: process.env.NEXT_PUBLIC_PERSONA_TEMPLATE_ID,
  environmentId: 'production', // or 'sandbox'
  onReady: () => client.open(),
  onComplete: (inquiryId, status, fields) => {
    // Send to backend for processing
  }
});
```

### Test Mode Override
```typescript
// Location: src/context/WalletContext.tsx line 184-189
// When NEXT_PUBLIC_APP_MODE=test, KYC is auto-approved
// Remove for production deployment
```

---

## 🔍 4. Chainalysis KYT Integration

### Overview
Know Your Transaction screening for AML/compliance using Chainalysis.

### Environment Variables
```bash
# Chainalysis Configuration
CHAINALYSIS_API_KEY=chainalysis_api_key_here
CHAINALYSIS_BASE_URL=https://api.chainalysis.com
CHAINALYSIS_WEBHOOK_SECRET=chainalysis_webhook_secret_here
NEXT_PUBLIC_KYT_ENABLED=true
NEXT_PUBLIC_KYT_CHECK_ON_CONNECT=true
NEXT_PUBLIC_KYT_CHECK_ON_DEPOSIT=true
CHAINALYSIS_RISK_TOLERANCE=medium  # low, medium, high
```

### Backend Integration Points

#### 1. KYT Check API
**Create endpoint**: `POST /api/kyt-check`
```typescript
// Current placeholder: src/context/WalletContext.tsx line 108-151
// Replace with actual Chainalysis API integration

interface KYTRequest {
  address: string;
  context: 'wallet_connection' | 'deposit';
}

interface KYTResponse {
  passed: boolean;
  risk: 'low' | 'medium' | 'high';
  details?: string;
  sanctions?: boolean;
}
```

#### 2. Chainalysis API Integration
```typescript
// Backend implementation example:
const response = await fetch(`${CHAINALYSIS_BASE_URL}/v1/addresses/${address}/risk`, {
  headers: {
    'Authorization': `Bearer ${CHAINALYSIS_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

const riskData = await response.json();
```

#### 3. Webhook Handler
**Create endpoint**: `POST /api/kyt/webhook`
```typescript
// Handle Chainalysis alerts and updates
// Verify webhook signature
// Update user risk status if needed
```

### Frontend Integration Points
```typescript
// Wallet connection: src/context/WalletContext.tsx line 443-446
if (process.env.NEXT_PUBLIC_KYT_CHECK_ON_CONNECT === 'true') {
  await performKYTCheck(address, 'wallet_connection');
}

// Deposit flow: src/app/vault/[vaultId]/page.tsx line 315-320
// Add KYT check before processing deposit
```

---

## 🐛 5. Debug Panel

### Overview
Development tool for testing different application states and user flows.

### Key Features
- **KYC Status Control**: Toggle between pending, in-progress, approved, rejected
- **App Mode Toggle**: Switch between test and production modes
- **User Position Toggle**: Test deposit/withdrawal flows
- **Draggable Interface**: Repositionable debug controls

### Location
```
src/components/DebugPanel.tsx    # Main debug panel component
```

### Visibility Control
```typescript
// Only shows when NEXT_PUBLIC_APP_MODE=test
// Location: src/components/DebugPanel.tsx line 22-30
const [appMode, setAppMode] = useState(() => {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_APP_MODE || 'production';
  }
  return 'production';
});
```

### Usage
1. Set `NEXT_PUBLIC_APP_MODE=test` in `.env.local`
2. Debug panel appears in bottom-right corner
3. Use controls to test different user states
4. **Remove for production deployment**

---

## ⚙️ 6. Environment Variables (.env file)

### Setup
1. Copy the example configuration:
   ```bash
   cp env.config.example .env.local
   ```

2. Configure required variables:

### Application Mode
```bash
NODE_ENV=development
NEXT_PUBLIC_APP_MODE=test  # 'test' or 'production'
```

### KYC Configuration (Persona)
```bash
NEXT_PUBLIC_PERSONA_TEMPLATE_ID=itmpl_xxx
PERSONA_API_KEY=persona_live_xxx
PERSONA_WEBHOOK_SECRET=webhook_secret_xxx
NEXT_PUBLIC_KYC_ENABLED=true
```

### KYT Configuration (Chainalysis)
```bash
CHAINALYSIS_API_KEY=your_api_key
CHAINALYSIS_BASE_URL=https://api.chainalysis.com
CHAINALYSIS_WEBHOOK_SECRET=webhook_secret
NEXT_PUBLIC_KYT_ENABLED=true
NEXT_PUBLIC_KYT_CHECK_ON_CONNECT=true
NEXT_PUBLIC_KYT_CHECK_ON_DEPOSIT=true
CHAINALYSIS_RISK_TOLERANCE=medium
```

### Vault Configuration
```bash
# JSON array of vault configurations
VAULTS='[{"address": "0x936325050cb6cdf88e3ae9af80f83253c452d52e", "chainId": 1, "visible": true}]'

# Asset price feeds
NEXT_PUBLIC_ASSETS='{"ETH": {"priceFeed": {"address": "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419", "chainId": 1}}}'

# The Graph URLs for blockchain data
THEGRAPH_URLS='{"ethereum": "https://api.thegraph.com/subgraphs/name/lagoon-finance/vault-events"}'
```

### Social Links
```bash
NEXT_PUBLIC_TWITTER_URL=https://twitter.com/bitsafe
NEXT_PUBLIC_TELEGRAM_URL=https://t.me/bitsafe
NEXT_PUBLIC_DOCS_URL=https://docs.bitsafe.com
```

### Security Notes
- Never commit `.env.local` to version control
- Use different API keys for development/production
- Rotate webhook secrets regularly
- Validate all environment variables on startup

---

## 🗺️ 7. Sitemap & Codebase Structure

### Application Routes
```
/                           # Homepage with vault listings
/connect                    # Wallet connection flow  
/kyc                        # KYC verification
/vault/[vaultId]           # Vault detail page
/dashboard/[vaultId]       # User vault dashboard (if deposited)
```

### Component Architecture

#### Core Components
```
src/components/
├── Navbar.tsx             # Main navigation
├── Footer.tsx             # Footer with social links
├── VaultCard.tsx          # Vault preview cards
├── VaultFilters.tsx       # Vault filtering controls
├── DebugPanel.tsx         # Development debug tools
└── AnnouncementTicker.tsx # Rolling announcements
```

#### Wallet Integration
```
src/components/connect/
├── WalletConnection.tsx   # Wallet selection UI
├── KYCVerification.tsx    # Identity verification flow
├── StepIndicator.tsx      # Progress indicator
└── DepositStep.tsx        # Deposit flow component
```

#### Vault Management
```
src/components/vault/
└── WithdrawModal.tsx      # Withdrawal interface
```

### State Management

#### Wallet Context
```typescript
// src/context/WalletContext.tsx
interface WalletContextType {
  isConnected: boolean;
  walletAddress: string;
  kycStatus: KYCStatus;
  connect: (walletType: string) => Promise<void>;
  disconnect: () => void;
  // ... additional methods
}
```

#### Data Layer
```
src/data/
├── vaultDetails.ts        # Vault metadata and configuration
└── lagoonVaults.ts        # Lagoon Finance integration types
```

### Styling & UI
- **CSS Framework**: Tailwind CSS (via inline styles)
- **Responsive Design**: Mobile-first approach
- **Component Styling**: Inline styles with dynamic theming
- **Icons**: SVG icons embedded in components

### Dependencies
```json
{
  "dependencies": {
    "@ledgerhq/hw-app-eth": "^6.45.6",      // Ledger integration
    "@ledgerhq/hw-transport-webusb": "^6.29.6",
    "@trezor/connect-web": "^9.6.0",        // Trezor integration
    "@wagmi/core": "^2.17.3",               // Ethereum utilities
    "next": "15.3.2",                       // React framework
    "react": "^19.0.0",
    "recharts": "^2.15.3",                  // Chart library
    "viem": "^2.31.0",                      // Ethereum client
    "wagmi": "^2.15.6"                      // Wallet connectors
  }
}
```

---

## 🔧 Development Commands

```bash
# Development
npm run dev              # Start dev server with Turbopack
npm run build            # Build for production (linting disabled)
npm run start            # Start production server
npm run lint             # Run ESLint

# Testing
# Set NEXT_PUBLIC_APP_MODE=test for debug features
```

---

## 🚀 Deployment Checklist

### Environment Setup
- [ ] Set `NEXT_PUBLIC_APP_MODE=production`
- [ ] Configure production Persona API keys
- [ ] Set up Chainalysis production endpoints
- [ ] Update vault configurations with live data
- [ ] Configure proper CORS settings
- [ ] Set up SSL certificates

### Security Review
- [ ] Remove debug panel from production builds
- [ ] Validate all API endpoints
- [ ] Test wallet connection flows
- [ ] Verify KYC integration
- [ ] Test KYT screening
- [ ] Review error handling

### Backend Integration
- [ ] Implement vault data APIs
- [ ] Set up Persona webhook handling
- [ ] Configure Chainalysis integration
- [ ] Implement user position tracking
- [ ] Set up smart contract interactions
- [ ] Configure database connections

---

## 📞 Support & Documentation

- **Frontend Issues**: Check browser console for wallet connection errors
- **KYC Issues**: Verify Persona template configuration
- **Vault Issues**: Check smart contract addresses and network settings
- **Hardware Wallets**: Ensure latest firmware and browser compatibility

For additional support, refer to the individual component documentation and inline code comments.

---

*Built with Next.js 15, React 19, and TypeScript for secure DeFi vault management.*
