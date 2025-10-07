# Penjelasan Teknis CollabSplit

## 1. Smart Contract (Sui Move)

Smart contract CollabSplit diimplementasikan menggunakan Sui Move, bahasa pemrograman yang dioptimalkan untuk blockchain Sui. Mari kita bahas komponen-komponen utamanya:

### 1.1 Struktur Data Utama
```move
struct Split {
    id: UID,                    // ID unik untuk setiap split
    members: vector<address>,   // Daftar alamat wallet anggota
    percentages: vector<u64>,   // Persentase untuk setiap anggota (dalam basis point, 1% = 100)
    balance: Balance<SUI>,      // Saldo SUI yang tersedia untuk dibagikan
}
```

### 1.2 Fungsi-fungsi Utama

#### Create Split
```move
public fun create_split(
    members: vector<address>,
    percentages: vector<u64>,
    ctx: &mut TxContext
) {
    // Validasi input
    let total = 0u64;
    let i = 0u64;
    let len = vector::length(&percentages);
    
    // Memastikan jumlah anggota dan persentase sama
    assert!(len > 0 && len == vector::length(&members), EInvalidMemberCount);
    
    // Memastikan total persentase = 100%
    while (i < len) {
        total = total + *vector::borrow(&percentages, i);
        i = i + 1;
    };
    assert!(total == 10000, EInvalidPercentage); // 100% = 10000 basis points
}
```
Penjelasan:
- Fungsi ini membuat split baru
- Memeriksa validitas input: jumlah anggota dan persentase harus sesuai
- Total persentase harus 100% (10000 basis points)
- Mengeluarkan event saat split berhasil dibuat

#### Deposit
```move
public fun deposit(split: &mut Split, payment: Coin<SUI>) {
    let amount = coin::value(&payment);
    let deposit_balance = coin::into_balance(payment);
    balance::join(&mut split.balance, deposit_balance);
}
```
Penjelasan:
- Menerima pembayaran dalam SUI
- Menambahkan ke saldo split
- Mencatat event deposit

#### Distribute
```move
public fun distribute(split: &mut Split, ctx: &mut TxContext) {
    let total_amount = balance::value(&split.balance);
    
    let i = 0;
    let len = vector::length(&split.members);
    
    while (i < len) {
        let member = *vector::borrow(&split.members, i);
        let percentage = *vector::borrow(&split.percentages, i);
        let amount = (total_amount * percentage) / 10000;
        
        if (amount > 0) {
            let coin = coin::take(&mut split.balance, amount, ctx);
            transfer::public_transfer(coin, member);
        };
        i = i + 1;
    }
}
```
Penjelasan:
- Menghitung jumlah yang akan diterima setiap anggota
- Membuat transfer SUI ke setiap alamat
- Mencatat event distribusi

## 2. Frontend (Next.js)

### 2.1 Integrasi Wallet
```typescript
// src/app/layout.tsx
import { WalletProvider } from "@mysten/wallet-kit";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>
          <main>{children}</main>
        </WalletProvider>
      </body>
    </html>
  );
}
```
Penjelasan:
- Menggunakan WalletProvider untuk integrasi dengan Sui Wallet
- Memungkinkan koneksi wallet di seluruh aplikasi

### 2.2 State Management dengan Zustand
```typescript
// src/store/collabSplitStore.ts
import { create } from 'zustand';

interface Split {
  id: string;
  members: string[];
  percentages: number[];
  balance: number;
}

interface CollabSplitStore {
  splits: Split[];
  selectedSplit: Split | null;
  setSplits: (splits: Split[]) => void;
  setSelectedSplit: (split: Split | null) => void;
}

export const useCollabSplitStore = create<CollabSplitStore>((set) => ({
  splits: [],
  selectedSplit: null,
  setSplits: (splits) => set({ splits }),
  setSelectedSplit: (split) => set({ selectedSplit: split }),
}));
```
Penjelasan:
- Manajemen state global menggunakan Zustand
- Menyimpan daftar split dan split yang dipilih
- Menyediakan fungsi untuk update state

### 2.3 Form Pembuatan Split
```typescript
// src/app/create/page.tsx
export default function CreateSplitPage() {
  const { connected } = useWallet();
  const [members, setMembers] = useState<Member[]>([]);
  
  const addMember = () => {
    setMembers([...members, { address: "", percentage: 0 }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePercentages()) {
      return;
    }
    // Panggil smart contract
    await createSplit(members);
  };

  return (
    <form onSubmit={handleSubmit}>
      {members.map((member, index) => (
        <div key={index}>
          <input
            type="text"
            placeholder="Alamat Wallet"
            value={member.address}
            onChange={(e) => updateMember(index, "address", e.target.value)}
          />
          <input
            type="number"
            placeholder="Persentase"
            value={member.percentage}
            onChange={(e) => updateMember(index, "percentage", Number(e.target.value))}
          />
        </div>
      ))}
      <button onClick={addMember}>Tambah Anggota</button>
      <button type="submit">Buat Split</button>
    </form>
  );
}
```
Penjelasan:
- Form untuk membuat split baru
- Validasi input (alamat wallet dan persentase)
- Integrasi dengan smart contract

### 2.4 SDK untuk Interaksi dengan Smart Contract
```typescript
// src/lib/collabSplitSDK.ts
export class CollabSplitSDK {
  constructor(
    private client: SuiClient,
    private packageId: string
  ) {}

  async createSplit(members: string[], percentages: number[]) {
    const tx = new TransactionBlock();
    
    tx.moveCall({
      target: `${this.packageId}::split::create_split`,
      arguments: [
        tx.pure(members),
        tx.pure(percentages.map(p => p * 100)) // Convert to basis points
      ],
    });

    return await this.client.signAndExecuteTransactionBlock({
      transactionBlock: tx,
    });
  }

  async deposit(splitId: string, amount: number) {
    const tx = new TransactionBlock();
    const [coin] = tx.splitCoins(tx.gas, [tx.pure(amount)]);
    
    tx.moveCall({
      target: `${this.packageId}::split::deposit`,
      arguments: [tx.object(splitId), coin],
    });

    return await this.client.signAndExecuteTransactionBlock({
      transactionBlock: tx,
    });
  }
}
```
Penjelasan:
- SDK untuk mempermudah interaksi dengan smart contract
- Menghandle pembuatan transaksi dan konversi data
- Menyediakan interface yang mudah digunakan oleh frontend

## 3. Alur Kerja Aplikasi

1. **Pembuatan Split:**
   - User menghubungkan wallet
   - Mengisi form dengan alamat anggota dan persentase
   - Smart contract membuat split baru
   - Event dicatat di blockchain

2. **Deposit Dana:**
   - User memilih split yang ada
   - Memasukkan jumlah SUI untuk deposit
   - Smart contract menerima dan menyimpan dana
   - Saldo split diperbarui

3. **Distribusi Dana:**
   - User memilih untuk mendistribusikan dana
   - Smart contract menghitung jumlah untuk setiap anggota
   - Dana dikirim ke masing-masing alamat
   - Event distribusi dicatat

## 4. Fitur Keamanan

1. **Validasi Smart Contract:**
   - Pemeriksaan total persentase harus 100%
   - Validasi jumlah anggota dan persentase
   - Pemeriksaan saldo sebelum distribusi

2. **Keamanan Frontend:**
   - Validasi input form
   - Penanganan error transaksi
   - Proteksi terhadap input yang tidak valid

## 5. Pengembangan Lanjutan

1. **Fitur yang Dapat Ditambahkan:**
   - Dukungan multi-token
   - Split dengan jadwal otomatis
   - Integrasi dengan platform lain
   - Fitur governance DAO
