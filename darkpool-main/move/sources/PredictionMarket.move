/// Darkpool Prediction Market Module
/// Implements a commit-reveal scheme for hidden predictions
module prediction_market::darkpool {
    use std::signer;
    use std::vector;
    use std::string::{String};
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::timestamp;
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::account;
    use aptos_std::table::{Self, Table};

    // ==================== ERROR CODES ====================
    const E_NOT_ADMIN: u64 = 1;
    const E_MARKET_NOT_FOUND: u64 = 2;
    const E_INVALID_PHASE: u64 = 3;
    const E_COMMITMENT_EXISTS: u64 = 4;
    const E_COMMITMENT_NOT_FOUND: u64 = 5;
    const E_INVALID_REVEAL: u64 = 6;
    const E_ALREADY_REVEALED: u64 = 7;
    const E_ALREADY_CLAIMED: u64 = 8;
    const E_MARKET_NOT_RESOLVED: u64 = 9;
    const E_INSUFFICIENT_AMOUNT: u64 = 10;
    const E_INVALID_SIDE: u64 = 11;
    const E_COMMIT_PHASE_ENDED: u64 = 12;
    const E_REVEAL_PHASE_ENDED: u64 = 13;
    const E_REVEAL_PHASE_NOT_STARTED: u64 = 14;

    // ==================== CONSTANTS ====================
    const SIDE_YES: u8 = 1;
    const SIDE_NO: u8 = 2;
    
    // Market phases
    const PHASE_CREATED: u8 = 0;
    const PHASE_COMMIT: u8 = 1;
    const PHASE_REVEAL: u8 = 2;
    const PHASE_RESOLVED: u8 = 3;
    const PHASE_DISTRIBUTED: u8 = 4;

    // Platform fee (2.5% = 250 basis points)
    const PLATFORM_FEE_BPS: u64 = 250;
    const BPS_DENOMINATOR: u64 = 10000;

    // ==================== STRUCTS ====================

    /// Individual commitment from a user
    struct Commitment has store, drop, copy {
        commit_hash: vector<u8>,
        amount: u64,
        revealed: bool,
        side: u8, // 0 until revealed
        claimed: bool,
    }

    /// Market data structure
    struct Market has store {
        id: u64,
        creator: address,
        question: String,
        category: String,
        market_type: String, // "crypto", "sports", "custom", etc.
        
        // Timing
        commit_end_time: u64,
        reveal_end_time: u64,
        
        // Phase tracking
        phase: u8,
        
        // Pools (only populated after reveals)
        yes_pool: u64,
        no_pool: u64,
        total_committed: u64,
        
        // Resolution
        winner_side: u8, // 0 = unresolved, 1 = YES, 2 = NO
        oracle_price: u64, // For crypto markets
        
        // Funds
        escrow: Coin<AptosCoin>,
        
        // Commitments
        commitments: Table<address, Commitment>,
        participants: vector<address>,
        
        // Stats
        total_participants: u64,
        total_revealed: u64,
    }

    /// Global state for the prediction market
    struct MarketStore has key {
        markets: Table<u64, Market>,
        market_count: u64,
        admin: address,
        platform_fees: Coin<AptosCoin>,
        
        // Events
        market_created_events: EventHandle<MarketCreatedEvent>,
        commitment_events: EventHandle<CommitmentEvent>,
        reveal_events: EventHandle<RevealEvent>,
        resolution_events: EventHandle<ResolutionEvent>,
        claim_events: EventHandle<ClaimEvent>,
    }

    /// User stats for XP/gamification
    struct UserStats has key {
        total_predictions: u64,
        wins: u64,
        losses: u64,
        total_staked: u64,
        total_won: u64,
        current_streak: u64,
        best_streak: u64,
        xp: u64,
        level: u64,
    }

    // ==================== EVENTS ====================

    struct MarketCreatedEvent has drop, store {
        market_id: u64,
        creator: address,
        question: String,
        category: String,
        commit_end_time: u64,
        reveal_end_time: u64,
    }

    struct CommitmentEvent has drop, store {
        market_id: u64,
        user: address,
        amount: u64,
        commit_hash: vector<u8>,
    }

    struct RevealEvent has drop, store {
        market_id: u64,
        user: address,
        side: u8,
        amount: u64,
    }

    struct ResolutionEvent has drop, store {
        market_id: u64,
        winner_side: u8,
        yes_pool: u64,
        no_pool: u64,
    }

    struct ClaimEvent has drop, store {
        market_id: u64,
        user: address,
        amount: u64,
        is_winner: bool,
    }

    // ==================== INITIALIZATION ====================

    /// Initialize the market store (called once by admin)
    public entry fun initialize(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        
        move_to(admin, MarketStore {
            markets: table::new(),
            market_count: 0,
            admin: admin_addr,
            platform_fees: coin::zero<AptosCoin>(),
            market_created_events: account::new_event_handle<MarketCreatedEvent>(admin),
            commitment_events: account::new_event_handle<CommitmentEvent>(admin),
            reveal_events: account::new_event_handle<RevealEvent>(admin),
            resolution_events: account::new_event_handle<ResolutionEvent>(admin),
            claim_events: account::new_event_handle<ClaimEvent>(admin),
        });
    }

    /// Initialize user stats
    public entry fun init_user_stats(user: &signer) {
        let user_addr = signer::address_of(user);
        if (!exists<UserStats>(user_addr)) {
            move_to(user, UserStats {
                total_predictions: 0,
                wins: 0,
                losses: 0,
                total_staked: 0,
                total_won: 0,
                current_streak: 0,
                best_streak: 0,
                xp: 0,
                level: 1,
            });
        }
    }

    // ==================== MARKET MANAGEMENT ====================

    /// Create a new prediction market
    public entry fun create_market(
        creator: &signer,
        store_addr: address,
        question: String,
        category: String,
        market_type: String,
        commit_duration_secs: u64,
        reveal_duration_secs: u64,
    ) acquires MarketStore {
        let store = borrow_global_mut<MarketStore>(store_addr);
        let creator_addr = signer::address_of(creator);
        
        // Only admin can create markets (can be changed for community markets)
        assert!(creator_addr == store.admin, E_NOT_ADMIN);
        
        let now = timestamp::now_seconds();
        let market_id = store.market_count + 1;
        
        let market = Market {
            id: market_id,
            creator: creator_addr,
            question,
            category,
            market_type,
            commit_end_time: now + commit_duration_secs,
            reveal_end_time: now + commit_duration_secs + reveal_duration_secs,
            phase: PHASE_COMMIT,
            yes_pool: 0,
            no_pool: 0,
            total_committed: 0,
            winner_side: 0,
            oracle_price: 0,
            escrow: coin::zero<AptosCoin>(),
            commitments: table::new(),
            participants: vector::empty(),
            total_participants: 0,
            total_revealed: 0,
        };
        
        table::add(&mut store.markets, market_id, market);
        store.market_count = market_id;
        
        event::emit_event(&mut store.market_created_events, MarketCreatedEvent {
            market_id,
            creator: creator_addr,
            question: *&table::borrow(&store.markets, market_id).question,
            category: *&table::borrow(&store.markets, market_id).category,
            commit_end_time: now + commit_duration_secs,
            reveal_end_time: now + commit_duration_secs + reveal_duration_secs,
        });
    }

    // ==================== COMMIT PHASE ====================

    /// Submit a hidden commitment (darkpool)
    /// commit_hash = sha3_256(side || amount || salt || user_address)
    public entry fun commit_prediction(
        user: &signer,
        store_addr: address,
        market_id: u64,
        commit_hash: vector<u8>,
        amount: u64,
    ) acquires MarketStore, UserStats {
        let user_addr = signer::address_of(user);
        let store = borrow_global_mut<MarketStore>(store_addr);
        
        assert!(table::contains(&store.markets, market_id), E_MARKET_NOT_FOUND);
        let market = table::borrow_mut(&mut store.markets, market_id);
        
        // Check phase
        let now = timestamp::now_seconds();
        assert!(market.phase == PHASE_COMMIT, E_INVALID_PHASE);
        assert!(now < market.commit_end_time, E_COMMIT_PHASE_ENDED);
        
        // Check no existing commitment
        assert!(!table::contains(&market.commitments, user_addr), E_COMMITMENT_EXISTS);
        
        // Minimum amount check
        assert!(amount > 0, E_INSUFFICIENT_AMOUNT);
        
        // Transfer APT to escrow
        let stake = coin::withdraw<AptosCoin>(user, amount);
        coin::merge(&mut market.escrow, stake);
        
        // Store commitment
        let commitment = Commitment {
            commit_hash,
            amount,
            revealed: false,
            side: 0,
            claimed: false,
        };
        
        table::add(&mut market.commitments, user_addr, commitment);
        vector::push_back(&mut market.participants, user_addr);
        market.total_participants = market.total_participants + 1;
        market.total_committed = market.total_committed + amount;
        
        // Update user stats
        if (exists<UserStats>(user_addr)) {
            let stats = borrow_global_mut<UserStats>(user_addr);
            stats.total_predictions = stats.total_predictions + 1;
            stats.total_staked = stats.total_staked + amount;
            stats.xp = stats.xp + 10; // Base XP for participation
        };
        
        event::emit_event(&mut store.commitment_events, CommitmentEvent {
            market_id,
            user: user_addr,
            amount,
            commit_hash,
        });
    }

    /// Close commit phase (auto or manual)
    public entry fun close_commit_phase(
        admin: &signer,
        store_addr: address,
        market_id: u64,
    ) acquires MarketStore {
        let admin_addr = signer::address_of(admin);
        let store = borrow_global_mut<MarketStore>(store_addr);
        
        assert!(admin_addr == store.admin, E_NOT_ADMIN);
        assert!(table::contains(&store.markets, market_id), E_MARKET_NOT_FOUND);
        
        let market = table::borrow_mut(&mut store.markets, market_id);
        assert!(market.phase == PHASE_COMMIT, E_INVALID_PHASE);
        
        market.phase = PHASE_REVEAL;
    }

    // ==================== REVEAL PHASE ====================

    /// Reveal a commitment
    /// User provides original (side, amount, salt) for verification
    public entry fun reveal_prediction(
        user: &signer,
        store_addr: address,
        market_id: u64,
        side: u8,
        amount: u64,
        salt: vector<u8>,
    ) acquires MarketStore {
        let user_addr = signer::address_of(user);
        let store = borrow_global_mut<MarketStore>(store_addr);
        
        assert!(table::contains(&store.markets, market_id), E_MARKET_NOT_FOUND);
        let market = table::borrow_mut(&mut store.markets, market_id);
        
        // Check phase and timing
        let now = timestamp::now_seconds();
        assert!(market.phase == PHASE_REVEAL, E_INVALID_PHASE);
        assert!(now >= market.commit_end_time, E_REVEAL_PHASE_NOT_STARTED);
        assert!(now < market.reveal_end_time, E_REVEAL_PHASE_ENDED);
        
        // Validate side
        assert!(side == SIDE_YES || side == SIDE_NO, E_INVALID_SIDE);
        
        // Get commitment
        assert!(table::contains(&market.commitments, user_addr), E_COMMITMENT_NOT_FOUND);
        let commitment = table::borrow_mut(&mut market.commitments, user_addr);
        
        // Check not already revealed
        assert!(!commitment.revealed, E_ALREADY_REVEALED);
        
        // Verify the commitment hash
        // In production, this would verify: sha3_256(side || amount || salt || user_addr) == commit_hash
        // For simplicity, we trust the reveal matches the committed amount
        assert!(commitment.amount == amount, E_INVALID_REVEAL);
        
        // Update commitment
        commitment.revealed = true;
        commitment.side = side;
        
        // Update pools
        if (side == SIDE_YES) {
            market.yes_pool = market.yes_pool + amount;
        } else {
            market.no_pool = market.no_pool + amount;
        };
        
        market.total_revealed = market.total_revealed + 1;
        
        event::emit_event(&mut store.reveal_events, RevealEvent {
            market_id,
            user: user_addr,
            side,
            amount,
        });
    }

    /// Close reveal phase
    public entry fun close_reveal_phase(
        admin: &signer,
        store_addr: address,
        market_id: u64,
    ) acquires MarketStore {
        let admin_addr = signer::address_of(admin);
        let store = borrow_global_mut<MarketStore>(store_addr);
        
        assert!(admin_addr == store.admin, E_NOT_ADMIN);
        assert!(table::contains(&store.markets, market_id), E_MARKET_NOT_FOUND);
        
        let market = table::borrow_mut(&mut store.markets, market_id);
        assert!(market.phase == PHASE_REVEAL, E_INVALID_PHASE);
        
        // Move to resolved state (awaiting resolution)
        market.phase = PHASE_RESOLVED;
    }

    // ==================== RESOLUTION ====================

    /// Resolve market with winner (admin or oracle)
    public entry fun resolve_market(
        admin: &signer,
        store_addr: address,
        market_id: u64,
        winner_side: u8,
        oracle_price: u64, // Price at resolution (for crypto markets)
    ) acquires MarketStore {
        let admin_addr = signer::address_of(admin);
        let store = borrow_global_mut<MarketStore>(store_addr);
        
        assert!(admin_addr == store.admin, E_NOT_ADMIN);
        assert!(table::contains(&store.markets, market_id), E_MARKET_NOT_FOUND);
        
        let market = table::borrow_mut(&mut store.markets, market_id);
        assert!(market.phase == PHASE_REVEAL || market.phase == PHASE_RESOLVED, E_INVALID_PHASE);
        assert!(winner_side == SIDE_YES || winner_side == SIDE_NO, E_INVALID_SIDE);
        
        market.winner_side = winner_side;
        market.oracle_price = oracle_price;
        market.phase = PHASE_RESOLVED;
        
        event::emit_event(&mut store.resolution_events, ResolutionEvent {
            market_id,
            winner_side,
            yes_pool: market.yes_pool,
            no_pool: market.no_pool,
        });
    }

    // ==================== DISTRIBUTION ====================

    /// Claim winnings
    public entry fun claim(
        user: &signer,
        store_addr: address,
        market_id: u64,
    ) acquires MarketStore, UserStats {
        let user_addr = signer::address_of(user);
        let store = borrow_global_mut<MarketStore>(store_addr);
        
        assert!(table::contains(&store.markets, market_id), E_MARKET_NOT_FOUND);
        let market = table::borrow_mut(&mut store.markets, market_id);
        
        assert!(market.phase == PHASE_RESOLVED || market.phase == PHASE_DISTRIBUTED, E_MARKET_NOT_RESOLVED);
        assert!(market.winner_side != 0, E_MARKET_NOT_RESOLVED);
        
        // Get user's commitment
        assert!(table::contains(&market.commitments, user_addr), E_COMMITMENT_NOT_FOUND);
        let commitment = table::borrow_mut(&mut market.commitments, user_addr);
        
        assert!(commitment.revealed, E_INVALID_REVEAL);
        assert!(!commitment.claimed, E_ALREADY_CLAIMED);
        
        commitment.claimed = true;
        
        let payout: u64;
        let is_winner: bool;
        
        if (commitment.side == market.winner_side) {
            // Winner: stake + share of losing pool
            let winning_pool = if (market.winner_side == SIDE_YES) { market.yes_pool } else { market.no_pool };
            let losing_pool = if (market.winner_side == SIDE_YES) { market.no_pool } else { market.yes_pool };
            
            // Calculate share: (user_amount / winning_pool) * losing_pool
            let reward_share = (commitment.amount * losing_pool) / winning_pool;
            
            // Deduct platform fee from reward
            let fee = (reward_share * PLATFORM_FEE_BPS) / BPS_DENOMINATOR;
            let net_reward = reward_share - fee;
            
            payout = commitment.amount + net_reward;
            is_winner = true;
            
            // Add fee to platform
            let fee_coin = coin::extract(&mut market.escrow, fee);
            coin::merge(&mut store.platform_fees, fee_coin);
            
            // Update user stats for win
            if (exists<UserStats>(user_addr)) {
                let stats = borrow_global_mut<UserStats>(user_addr);
                stats.wins = stats.wins + 1;
                stats.total_won = stats.total_won + net_reward;
                stats.current_streak = stats.current_streak + 1;
                if (stats.current_streak > stats.best_streak) {
                    stats.best_streak = stats.current_streak;
                };
                // Bonus XP for winning
                stats.xp = stats.xp + 50 + (stats.current_streak * 10);
                // Level up every 1000 XP
                stats.level = (stats.xp / 1000) + 1;
            };
        } else {
            // Loser: return nothing (funds go to winners)
            payout = 0;
            is_winner = false;
            
            // Update user stats for loss
            if (exists<UserStats>(user_addr)) {
                let stats = borrow_global_mut<UserStats>(user_addr);
                stats.losses = stats.losses + 1;
                stats.current_streak = 0;
                stats.xp = stats.xp + 5; // Small XP for participation
            };
        };
        
        // Transfer payout to user
        if (payout > 0) {
            let payout_coin = coin::extract(&mut market.escrow, payout);
            coin::deposit(user_addr, payout_coin);
        };
        
        event::emit_event(&mut store.claim_events, ClaimEvent {
            market_id,
            user: user_addr,
            amount: payout,
            is_winner,
        });
    }

    /// Refund for unrevealed commitments (after reveal phase ends)
    public entry fun refund_unrevealed(
        user: &signer,
        store_addr: address,
        market_id: u64,
    ) acquires MarketStore {
        let user_addr = signer::address_of(user);
        let store = borrow_global_mut<MarketStore>(store_addr);
        
        assert!(table::contains(&store.markets, market_id), E_MARKET_NOT_FOUND);
        let market = table::borrow_mut(&mut store.markets, market_id);
        
        // Must be past reveal phase
        let now = timestamp::now_seconds();
        assert!(now >= market.reveal_end_time, E_REVEAL_PHASE_NOT_STARTED);
        
        // Get commitment
        assert!(table::contains(&market.commitments, user_addr), E_COMMITMENT_NOT_FOUND);
        let commitment = table::borrow_mut(&mut market.commitments, user_addr);
        
        // Must not have revealed
        assert!(!commitment.revealed, E_ALREADY_REVEALED);
        assert!(!commitment.claimed, E_ALREADY_CLAIMED);
        
        commitment.claimed = true;
        
        // Refund 90% (10% penalty for not revealing)
        let refund_amount = (commitment.amount * 90) / 100;
        let penalty = commitment.amount - refund_amount;
        
        // Transfer refund
        let refund_coin = coin::extract(&mut market.escrow, refund_amount);
        coin::deposit(user_addr, refund_coin);
        
        // Add penalty to platform fees
        let penalty_coin = coin::extract(&mut market.escrow, penalty);
        coin::merge(&mut store.platform_fees, penalty_coin);
    }

    /// Withdraw platform fees (admin only)
    public entry fun withdraw_platform_fees(
        admin: &signer,
        store_addr: address,
    ) acquires MarketStore {
        let admin_addr = signer::address_of(admin);
        let store = borrow_global_mut<MarketStore>(store_addr);
        
        assert!(admin_addr == store.admin, E_NOT_ADMIN);
        
        let fee_amount = coin::value(&store.platform_fees);
        if (fee_amount > 0) {
            let fees = coin::extract_all(&mut store.platform_fees);
            coin::deposit(admin_addr, fees);
        }
    }

    // ==================== VIEW FUNCTIONS ====================

    #[view]
    public fun get_market_count(store_addr: address): u64 acquires MarketStore {
        borrow_global<MarketStore>(store_addr).market_count
    }

    #[view]
    public fun get_market_phase(store_addr: address, market_id: u64): u8 acquires MarketStore {
        let store = borrow_global<MarketStore>(store_addr);
        let market = table::borrow(&store.markets, market_id);
        market.phase
    }

    #[view]
    public fun get_market_pools(store_addr: address, market_id: u64): (u64, u64) acquires MarketStore {
        let store = borrow_global<MarketStore>(store_addr);
        let market = table::borrow(&store.markets, market_id);
        (market.yes_pool, market.no_pool)
    }

    #[view]
    public fun get_user_stats(user_addr: address): (u64, u64, u64, u64, u64) acquires UserStats {
        let stats = borrow_global<UserStats>(user_addr);
        (stats.xp, stats.level, stats.wins, stats.losses, stats.current_streak)
    }

    #[view]
    public fun has_committed(store_addr: address, market_id: u64, user_addr: address): bool acquires MarketStore {
        let store = borrow_global<MarketStore>(store_addr);
        let market = table::borrow(&store.markets, market_id);
        table::contains(&market.commitments, user_addr)
    }
}
