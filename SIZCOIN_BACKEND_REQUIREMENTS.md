# 🪙 SIZCOIN INTEGRATION - BACKEND REQUIREMENTS

## Asset Information

**SIZCOIN** ni Algorand Standard Asset (ASA) inayotumika kama payment currency katika project hii.

### SIZCOIN Details:
- **Asset ID**: `2905622564`
- **Unit Name**: `SIZ`
- **Total Supply**: XXXXXXX
- **Decimals**: `2` (1 SIZ = 100 micro units)
- **Default Frozen**: `Yes`
- **Created**: 06/04/2025 10:26:38 (Block #48747393)
- **Asset URL**: https://ipfs.io/ipfs/bafybeiex5cvfmggxjyjaxpdxevyhhzvrrsjw5xnee2ydw5metghl3y6fvq
- **Network**: Algorand MainNet

---

## 🔴 CRITICAL CHANGES REQUIRED

### 1. **Asset ID Configuration**

Backend lazima itumie **SIZCOIN Asset ID** badala ya ALGO wakati wa:
- Kutengeneza escrow accounts
- Kusimamia transactions
- Kutuma payments kwa employees
- Kufuatilia balances

```typescript
// Add this configuration to your backend
const SIZCOIN_CONFIG = {
  ASSET_ID: 2905622564,
  UNIT_NAME: 'SIZ',
  DECIMALS: 2,
  ASSET_URL: 'https://ipfs.io/ipfs/bafybeiex5cvfmggxjyjaxpdxevyhhzvrrsjw5xnee2ydw5metghl3y6fvq',
  CREATED_BLOCK: 48747393,
  DEFAULT_FROZEN: true,
};
```

---

### 2. **Escrow Account Creation**

Wakati wa kutengeneza escrow account kwa project:

```typescript
// POST /api/projects/:projectId/escrow/create

// Backend MUST:
1. Create Algorand account for escrow
2. Opt-in to SIZCOIN Asset (Asset ID: 2905622564)
3. Store encrypted private key safely
4. Return escrow address to frontend

Response should include:
{
  escrowAddress: string;
  assetId: 2905622564;
  assetName: 'SIZ';
  optedIn: true;
}
```

**⚠️ MUHIMU**: Escrow account lazima ifanye **Asset Opt-In** kabla ya kupokea SIZCOIN tokens.

---

### 3. **Deposit Verification**

Wakati project owner anatuma SIZCOIN kwa escrow:

```typescript
// POST /api/projects/:projectId/escrow/deposit

// Backend MUST:
1. Verify transaction on Algorand blockchain
2. Confirm asset ID is 2905622564 (SIZCOIN)
3. Validate amount matches (consider 2 decimals)
4. Update project escrowFunded status
5. Update balance in database

Body:
{
  txHash: string;
  amount: number; // Amount in SIZ (will be converted to micro units)
}
```

---

### 4. **Payment Transactions**

Wakati wa kulipa employee baada ya task approval:

```typescript
// POST /api/tasks/:taskId/approve

// Backend MUST:
1. Create Algorand ASA transfer transaction
2. Use SIZCOIN Asset ID (2905622564)
3. Convert SIZ amount to micro units (amount * 100)
4. Sign with escrow private key
5. Submit to Algorand network
6. Monitor transaction confirmation
7. Update task paymentStatus and paymentTxHash

Transaction format:
{
  type: 'axfer', // Asset transfer, not 'pay'
  assetIndex: 2905622564,
  from: escrowAddress,
  to: employeeWalletAddress,
  amount: paymentAmount * 100, // Convert to micro units
  note: `Task ${taskId} payment`
}
```

---

### 5. **Balance Queries**

Wakati wa kuangalia escrow balance:

```typescript
// GET /api/projects/:projectId/escrow/balance

// Backend MUST:
1. Query Algorand blockchain for account assets
2. Filter for SIZCOIN Asset ID (2905622564)
3. Convert micro units to SIZ (divide by 100)
4. Return balance with proper decimals

Response:
{
  balance: number; // Total SIZCOIN in escrow
  allocated: number; // Reserved for pending tasks
  released: number; // Already paid out
  available: number; // balance - allocated
  assetId: 2905622564;
  assetName: 'SIZ';
}
```

---

### 6. **Transaction Monitoring**

Transactions za SIZCOIN zinaweza kuonekana kwenye:
- **MainNet**: https://explorer.perawallet.app/asset/2905622564
- **TestNet**: https://testnet.explorer.perawallet.app/asset/2905622564

Backend lazima:
- Track transaction hashes
- Monitor confirmation status
- Validate asset ID in all transactions
- Store transaction metadata for audit trail

---

### 7. **Database Schema Updates**

Ensure the following fields support SIZCOIN:

```prisma
model Project {
  // ...existing fields...
  budgetAmount   Float?   // Amount in SIZ
  escrowAddress  String?  // Algorand address with SIZCOIN opt-in
  escrowFunded   Boolean  @default(false)
  allocatedFunds Float    @default(0) // In SIZ
  releasedFunds  Float    @default(0) // In SIZ
}

model Task {
  // ...existing fields...
  paymentAmount  Float? // Amount in SIZ
  paymentStatus  PaymentStatus?
  paidAt         DateTime?
  paymentTxHash  String? // Algorand transaction hash
}

model BlockchainTransaction {
  // ...existing fields...
  assetId        Int      @default(2905622564) // Always SIZCOIN
  amount         Float    // Amount in SIZ
  txHash         String   // Algorand tx hash
  confirmations  Int      @default(0)
  status         String   // PENDING, CONFIRMED, FAILED
}
```

---

### 8. **Wallet Verification**

Employee wallets lazima:
1. Kuwa opted-in to SIZCOIN (Asset ID: 2905622564)
2. Validated before task assignment
3. Checked for sufficient opt-in before payment

```typescript
// POST /api/users/wallet/verify

// Backend should verify:
1. Wallet address is valid Algorand address
2. Wallet has opted into SIZCOIN (Asset ID: 2905622564)
3. Store verification status in UserWallet table
```

---

## 🔧 Algorand SDK Integration

### Required Dependencies:
```json
{
  "algosdk": "^2.7.0" // Algorand JavaScript SDK
}
```

### Key Functions Needed:

```typescript
import algosdk from 'algosdk';

// 1. Asset Transfer Transaction
const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
  from: escrowAddress,
  to: recipientAddress,
  assetIndex: 2905622564, // SIZCOIN
  amount: amountInMicroUnits, // amount * 100
  suggestedParams: await algodClient.getTransactionParams().do()
});

// 2. Asset Opt-In Transaction
const optInTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
  from: accountAddress,
  to: accountAddress, // Sending to self for opt-in
  assetIndex: 2905622564,
  amount: 0,
  suggestedParams: await algodClient.getTransactionParams().do()
});

// 3. Check Asset Balance
const accountInfo = await algodClient.accountInformation(address).do();
const sizAsset = accountInfo.assets.find(asset => asset['asset-id'] === 2905622564);
const balanceInMicroUnits = sizAsset?.amount || 0;
const balanceInSIZ = balanceInMicroUnits / 100;
```

---

## ✅ Testing Checklist

Backend team lazima test:

- [ ] Escrow account inaweza ku-opt-in SIZCOIN
- [ ] Deposit verification inafanya kazi na SIZCOIN transactions
- [ ] Payment transactions zinatumia Asset ID sahihi (2905622564)
- [ ] Balance queries zinaonyesha SIZCOIN, sio ALGO
- [ ] Amount conversions zinafanya kazi (SIZ ↔ micro units)
- [ ] Transaction hashes zinaonekana kwenye Pera Explorer
- [ ] Employee wallet verification inafanya kazi
- [ ] All payments zinatoka escrow kwa employee wallets
- [ ] Transaction monitoring inafuatilia confirmation status

---

## 🌐 Network Configuration

### TestNet (Development):
- **Node**: https://testnet-api.algonode.cloud
- **Indexer**: https://testnet-idx.algonode.cloud
- **Explorer**: https://testnet.explorer.perawallet.app/
- **Asset ID**: 2905622564 (same as MainNet)

### MainNet (Production):
- **Node**: https://mainnet-api.algonode.cloud
- **Indexer**: https://mainnet-idx.algonode.cloud
- **Explorer**: https://explorer.perawallet.app/
- **Asset ID**: 2905622564

---

## 📞 Support

Kama kuna maswali au changamoto:
1. Check Algorand documentation: https://developer.algorand.org/
2. View SIZCOIN on explorer: https://explorer.perawallet.app/asset/2905622564
3. Test transactions on TestNet first
4. Ensure all escrow accounts are opted-in before receiving SIZCOIN

---

## ⚠️ SECURITY REMINDERS

1. **Private Keys**: Store escrow private keys encrypted (AES-256)
2. **Asset Validation**: Always verify Asset ID = 2905622564 in transactions
3. **Amount Conversion**: Be careful with decimal conversion (2 decimals)
4. **Opt-In Check**: Verify wallet opt-in before sending SIZCOIN
5. **Transaction Confirmation**: Wait for at least 3 confirmations before marking as PAID

---

**Asante sana!** 🚀

