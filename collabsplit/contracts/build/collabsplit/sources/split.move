module collabsplit::split {
    use sui::object::{Self, ID, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use sui::sui::SUI;
    use sui::event;
    use std::vector;

    // Errors
    const EInvalidPercentage: u64 = 0;
    const EInvalidMemberCount: u64 = 1;
    const EInsufficientBalance: u64 = 2;

    // A Split represents a revenue sharing agreement between multiple addresses
    struct Split has key, store {
        id: UID,
        members: vector<address>,
        percentages: vector<u64>,
        balance: Balance<SUI>,
        total_shares: u64,
    }

    // Events
    struct SplitCreated has copy, drop {
        split_id: ID,
        creator: address,
        members: vector<address>,
        percentages: vector<u64>,
    }

    struct FundsDeposited has copy, drop {
        split_id: ID,
        amount: u64,
    }

    struct FundsDistributed has copy, drop {
        split_id: ID,
        amount: u64,
        recipients: vector<address>,
        amounts: vector<u64>,
    }

    public fun create_split(
        members: vector<address>,
        percentages: vector<u64>,
        ctx: &mut TxContext
    ): Split {
        // Validate inputs
        let total = 0u64;
        let i = 0u64;
        let len = vector::length(&percentages);

        assert!(len > 0 && len == vector::length(&members), EInvalidMemberCount);
        
        while (i < len) {
            total = total + *vector::borrow(&percentages, i);
            i = i + 1;
        };
        
        assert!(total == 10000, EInvalidPercentage); // Percentages must sum to 100.00%

        let split = Split {
            id: object::new(ctx),
            members,
            percentages,
            balance: balance::zero(),
            total_shares: 10000,
        };

        event::emit(SplitCreated {
            split_id: object::uid_to_inner(&split.id),
            creator: tx_context::sender(ctx),
            members: *&split.members,
            percentages: *&split.percentages,
        });

        split
    }

    public fun deposit(
        split: &mut Split, 
        payment: Coin<SUI>,
    ) {
        let amount = coin::value(&payment);
        let deposit_balance = coin::into_balance(payment);
        balance::join(&mut split.balance, deposit_balance);

        event::emit(FundsDeposited {
            split_id: object::uid_to_inner(&split.id),
            amount,
        });
    }

    public fun distribute(split: &mut Split, ctx: &mut TxContext) {
        let total_amount = balance::value(&split.balance);
        assert!(total_amount > 0, EInsufficientBalance);

        let i = 0;
        let len = vector::length(&split.members);
        let distributed_amounts = vector::empty();

        while (i < len) {
            let member = *vector::borrow(&split.members, i);
            let percentage = *vector::borrow(&split.percentages, i);
            let amount = (total_amount * percentage) / split.total_shares;

            if (amount > 0) {
                let coin = coin::take(&mut split.balance, amount, ctx);
                transfer::public_transfer(coin, member);
                vector::push_back(&mut distributed_amounts, amount);
            };
            
            i = i + 1;
        };

        event::emit(FundsDistributed {
            split_id: object::uid_to_inner(&split.id),
            amount: total_amount,
            recipients: *&split.members,
            amounts: distributed_amounts,
        });
    }

    // Getters
    public fun get_members(split: &Split): vector<address> {
        *&split.members
    }

    public fun get_percentages(split: &Split): vector<u64> {
        *&split.percentages
    }

    public fun get_balance(split: &Split): u64 {
        balance::value(&split.balance)
    }
}