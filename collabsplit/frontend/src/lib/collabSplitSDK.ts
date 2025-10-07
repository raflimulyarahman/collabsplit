import { TransactionBlock } from "@mysten/sui.js/transactions";
import { SuiClient } from "@mysten/sui.js/client";

const PACKAGE_ID = "YOUR_PACKAGE_ID_AFTER_DEPLOYMENT";
const MODULE_NAME = "split";

export class CollabSplitSDK {
  constructor(
    private client: SuiClient,
    private packageId: string = PACKAGE_ID
  ) {}

  async createSplit(
    members: string[],
    percentages: number[],
    signer: string
  ) {
    const tx = new TransactionBlock();
    
    // Convert percentages to basis points (multiply by 100)
    const basisPoints = percentages.map(p => Math.floor(p * 100));
    
    tx.moveCall({
      target: `${this.packageId}::${MODULE_NAME}::create_split`,
      arguments: [
        tx.pure(members),
        tx.pure(basisPoints)
      ],
    });

    return await this.client.signAndExecuteTransactionBlock({
      signer,
      transactionBlock: tx,
    });
  }

  async deposit(
    splitId: string,
    amount: number,
    signer: string
  ) {
    const tx = new TransactionBlock();
    
    // Create coin for deposit
    const [coin] = tx.splitCoins(tx.gas, [tx.pure(amount)]);
    
    tx.moveCall({
      target: `${this.packageId}::${MODULE_NAME}::deposit`,
      arguments: [tx.object(splitId), coin],
    });

    return await this.client.signAndExecuteTransactionBlock({
      signer,
      transactionBlock: tx,
    });
  }

  async distribute(
    splitId: string,
    signer: string
  ) {
    const tx = new TransactionBlock();
    
    tx.moveCall({
      target: `${this.packageId}::${MODULE_NAME}::distribute`,
      arguments: [tx.object(splitId)],
    });

    return await this.client.signAndExecuteTransactionBlock({
      signer,
      transactionBlock: tx,
    });
  }

  async getSplitData(splitId: string) {
    const objects = await this.client.getObject({
      id: splitId,
      options: {
        showContent: true,
      },
    });
    
    return objects;
  }
}