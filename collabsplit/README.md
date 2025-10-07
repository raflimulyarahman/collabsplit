# CollabSplit: Web3 Revenue Sharing Platform

CollabSplit is a decentralized platform built on Sui blockchain that enables transparent and automated revenue sharing for creator collaborations. The platform uses smart contracts to manage splits and distribute funds automatically according to predefined percentages.

## Key Features

- Create revenue sharing agreements with multiple participants
- Automatic fund distribution based on predefined percentages
- Full transparency through blockchain transactions
- User-friendly interface with drag-and-drop functionality
- Real-time split simulation

## Technology Stack

- **Frontend:** Next.js 13+, TypeScript, TailwindCSS
- **Blockchain:** Sui Network
- **Smart Contract:** Sui Move
- **State Management:** Zustand
- **Wallet Integration:** Sui Wallet Kit

## Quick Start (5-minute Demo)

### Prerequisites

1. Install Sui Wallet Chrome extension
2. Get some SUI tokens from the Testnet Faucet
3. Node.js 18+ and pnpm installed (`npm install -g pnpm`)

### Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/collabsplit.git
   cd collabsplit
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Deploy the smart contract:
   ```bash
   cd contracts
   sui client publish --gas-budget 20000000
   ```
   - Copy the published package ID
   - Update `PACKAGE_ID` in `frontend/src/lib/collabSplitSDK.ts`

4. Start the frontend:
   ```bash
   cd ../frontend
   pnpm dev
   ```

5. Visit http://localhost:3000

### Demo Flow

1. **Connect Wallet** (30 seconds)
   - Click "Connect Wallet" button
   - Select Sui Wallet
   - Approve connection

2. **Create Split** (2 minutes)
   - Click "Create New Split"
   - Add 2-3 test addresses (you can use devnet addresses)
   - Set percentages (must sum to 100%)
   - Submit and approve transaction

3. **Deposit Funds** (1 minute)
   - Go to Dashboard
   - Select your split
   - Click "Deposit"
   - Enter amount and approve transaction

4. **Distribute Funds** (1 minute)
   - Click "Distribute"
   - Approve transaction
   - View transaction on explorer

## Presentation Tips

1. **Focus on Problem-Solution**
   - Problem: Manual revenue sharing is complex and lacks transparency
   - Solution: Automated, transparent, and trustless distribution

2. **Demo Best Practices**
   - Pre-deploy contract and have test addresses ready
   - Use round numbers for easy calculations (e.g., 1000 SUI)
   - Have a backup plan if network is slow (screenshots/video)

3. **Highlight Technical Innovation**
   - Sui Move's object-centric model
   - Real-time preview calculations
   - Event logging for transparency

4. **Future Roadmap**
   - Multi-token support
   - Time-locked splits
   - Integration with popular platforms
   - DAO governance features

## Architecture Details

### Smart Contract Structure

```move
module collabsplit::split {
    struct Split {
        id: UID,
        members: vector<address>,
        percentages: vector<u64>,
        balance: Balance<SUI>
    }
}
```

### Frontend Architecture

- **Pages:**
  - `/`: Landing page with wallet connect
  - `/create`: Create new split
  - `/dashboard`: View and manage splits
  - `/simulate`: Preview split calculations

- **Components:**
  - `WalletProvider`: Global wallet context
  - `SplitForm`: Drag-and-drop member management
  - `Distribution`: Visual split representation

## Security Considerations

1. Input validation for percentages (must sum to 100%)
2. Secure wallet integration
3. Gas optimization for multi-member distributions
4. Proper error handling for failed transactions

## Testing

1. **Smart Contract Tests:**
   ```bash
   cd contracts
   sui move test
   ```

2. **Frontend Tests:**
   ```bash
   cd frontend
   pnpm test
   ```

## Support

For questions or issues:
- Create GitHub issue
- Join Discord community
- Check documentation