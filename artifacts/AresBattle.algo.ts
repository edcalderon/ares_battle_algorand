import { Contract } from '@algorandfoundation/tealscript';

export type ContributorInfo = {
  account: Address;
  balance: uint64;
  entryRound: uint64;
};

const MAX_CONTRIBUTORS_PER_BOSS = 20;
export const ALGORAND_ACCOUNT_MIN_BALANCE = 100000;
const ALGORAND_STAKING_BLOCK_DELAY = 320;

export class AresBattle extends Contract {
  programVersion = 10;
  bossHP = GlobalStateKey<uint64>({ key: 'h' }); // Current boss HP
  bossTotalHP = GlobalStateKey<uint64>({ key: 'th' }); // Initial boss HP and max
  totalAlgoStaked = GlobalStateKey<uint64>({ key: 'p' }); // Total reward pool
  governor = GlobalStateKey<Address>({ key: 'g' });
  bossName = GlobalStateKey<string>({ key: 'n' });
  bossState = GlobalStateKey<string>({ key: 's' });
  contractVersion = GlobalStateKey<string>({ key: 'v' });
  numStakers = GlobalStateKey<uint64>({ key: 'numStakers' });
  stakers = BoxKey<StaticArray<ContributorInfo, typeof MAX_CONTRIBUTORS_PER_BOSS>>({ key: 'stakers' });

  createApplication(hp: uint64, name: string): void {
    this.governor.value = this.txn.sender;
    this.bossHP.value = hp;
    this.bossTotalHP.value = hp;
    this.bossName.value = name;
    this.bossState.value = 'ALIVE'
    this.contractVersion.value = 'v1.5.2'
  }

  initStorage(): void {
    assert(!this.stakers.exists, 'staking pool already initialized');
    this.stakers.create();
  }

  private addStake(stakedAmountPayment: PayTxn): uint64 {
    assert(this.stakers.exists, 'staking pool must be initialized first');

    const entryRound = globals.round + ALGORAND_STAKING_BLOCK_DELAY;
    let firstEmpty = 0;

    this.totalAlgoStaked.value += stakedAmountPayment.amount;

    // firstEmpty should represent 1-based index to first empty slot we find - 0 means none were found
    for (let i = 0; i < this.stakers.value.length; i += 1) {
      if (globals.opcodeBudget < 100) {
        increaseOpcodeBudget();
      }

      const cmpStaker = clone(this.stakers.value[i]);
      if (cmpStaker.account === stakedAmountPayment.sender) {
        cmpStaker.balance += stakedAmountPayment.amount;
        cmpStaker.entryRound = entryRound;
        this.stakers.value[i] = cmpStaker;

        return entryRound;
      }
      if (firstEmpty === 0 && cmpStaker.account === globals.zeroAddress) {
        firstEmpty = i + 1;
      }
    }

    if (firstEmpty === 0) {
      // nothing was found - pool is full and this staker can't fit
      throw Error('Staking pool full');
    }

    assert(this.stakers.value[firstEmpty - 1].account === globals.zeroAddress);
    this.stakers.value[firstEmpty - 1] = {
      account: stakedAmountPayment.sender,
      balance: stakedAmountPayment.amount,
      entryRound: entryRound,
    };
    this.numStakers.value += 1;
    return entryRound;
  }

  @nonABIRouterFallback.call('NoOp')
  nonAbiNoOp(): void {

  }

  /**
   * Slash action to damage the boss.
   *
   * @param damagePayment The specified damage payment.
   * @returns The final boss heal.
   */
  slash(damagePayment: PayTxn, times: uint64): uint64 {
    //const cost = 0.1; // Cost in Algorand
    verifyPayTxn(damagePayment, { amount: 1_000 * times }); // Verify payment
    const damage = times
    if (damage < 1 || damage > 100) throw Error('Damage must be between 1 and 100');
    if (this.bossHP.value < 0) throw Error('Boss is DEFEATED!');

    const actualDamage = damage;
    this.bossHP.value -= actualDamage;
    this.totalAlgoStaked.value += damagePayment.amount; // Cost calculation
    this.addStake(damagePayment)

    if (this.bossHP.value <= 0) {
      this.bossHP.value = 0;
      this.bossState.value = 'DEFEATED';
      this.distributeRewards();
    }
    return this.bossHP.value;
  }

  /**
   * Heal action to restore HP to the boss.
   * @param healPayment The user performing the action.
   * @returns The final boss heal.
   */
  heal(healPayment: PayTxn): uint64 {
    const cost = 80;
    verifyPayTxn(healPayment, { amount: 10_000 * cost });
    const healAmount = cost;
    this.bossHP.value += healAmount;

    if (this.bossHP.value <= 0) {
      this.bossHP.value = healAmount;
      this.bossState.value = 'ALIVE';
    }

    this.totalAlgoStaked.value += healPayment.amount;
    this.addStake(healPayment);
    return this.bossHP.value;
  }

  /**
   * Nuke action to inflict damage to the boss.
   * @param nukePayment The user performing the action.
   *  @returns The final boss heal.
   */
  nuke(nukePayment: PayTxn): uint64 {
    verifyPayTxn(nukePayment, { amount: 1_330_000 })
    const actualDamage = this.random(133, 200, nukePayment.sender); // Random damage between 100-200
    this.bossHP.value -= actualDamage;
    this.totalAlgoStaked.value += nukePayment.amount;
    this.addStake(nukePayment)
    if (this.bossHP.value <= 0) {
      this.bossHP.value = 0;
      this.bossState.value = 'DEFEATED';
      this.distributeRewards();
    }
    return this.bossHP.value;
  }

  /**
   * Distribute rewards when the boss is defeated.
   */
  private distributeRewards(): void {
    const totalExpendeableBalance = this.app.address.balance - this.app.address.minBalance;

    // Assert that there are more than 1 stakers
    assert(this.numStakers.value >= 1, 'Not enough stakers to distribute rewards');

    // Initialize variables for the top 3 stakers
    let first: ContributorInfo = { account: globals.zeroAddress, balance: 0, entryRound: 0 };
    let second: ContributorInfo = { account: globals.zeroAddress, balance: 0, entryRound: 0 };
    let third: ContributorInfo = { account: globals.zeroAddress, balance: 0, entryRound: 0 };

    // Find the top 3 stakers by balance
    for (let i = 0; i < this.stakers.value.length; i += 1) {
      if (globals.opcodeBudget < 100) {
        increaseOpcodeBudget();
      }
      const staker = clone(this.stakers.value[i]);
      if (staker.balance > first.balance) {
        third = second;
        second = first;
        first = staker;
      } else if (staker.balance > second.balance) {
        third = second;
        second = staker;
      } else if (staker.balance > third.balance) {
        third = staker;
      }
    }

    // Calculate rewards for the top 3 stakers
    const firstReward = this.divide(totalExpendeableBalance, (totalExpendeableBalance * 15));
    const secondReward = this.divide(totalExpendeableBalance, (totalExpendeableBalance * 12));
    const thirdReward = this.divide(totalExpendeableBalance, (totalExpendeableBalance * 7));

    // Send payments to the top 3 stakers

    sendPayment({
      receiver: Address.fromAddress('WWIPOXC5CUGBTIJVQWT3RBACJM6FBKKDPWCN3GIADEKWPRXN55NOBMCRDU'),
      amount: firstReward,
    });
    sendPayment({
      receiver: Address.fromAddress('REFI7CU5YME7KWSKDYKIMHBV6EEYL2VP3JI6EYG7PLIGAYI6QC5YQT2OZA'),
      amount: secondReward,
    });
    sendPayment({
      receiver: Address.fromAddress('REFI7CU5YME7KWSKDYKIMHBV6EEYL2VP3JI6EYG7PLIGAYI6QC5YQT2OZA'),
      amount: thirdReward,
    });


    this.stakers.delete()

    // Calculate remaining balance to send to creator
    //const totalRewardsDistributed = firstReward + secondReward + thirdReward;
    //const remainingBalance = totalExpendeableBalance - totalRewardsDistributed;

    // Send remaining balance to the creator
    /* sendPayment({
      receiver: globals.creatorAddress,
      amount: totalExpendeableBalance,
    }); */
  }

  /**
   * Reset the battle for a new round.
   */
  private resetBattle(): void {
    //this.bossHP = GlobalStateKey<uint64>(); // Reset boss HP
    //this.contributions; // Clear contributions
    //this.totalPool = GlobalStateKey<uint64>(); // Reset total pool
  }

  @nonABIRouterFallback.call('DeleteApplication')
  nonAbiDeleteApplication(): void {
    assert(this.txn.sender === this.app.creator)
    sendPayment({
      receiver: globals.creatorAddress,
      amount: this.app.address.balance,
    });
  }

  /**
   * Pseudo-random number generator.
   *
   * @param min The minimum value (inclusive).
   * @param max The maximum value (exclusive).
   * @returns A pseudo-random number between min and max.
   */
  private random(min: uint64, max: uint64, seed: Address): uint64 {
    const seedNum = seed.balance; // Use address directly as bytes
    const randomValue = (seedNum % (max - min)) + min;
    return randomValue;
  }

  /**
   * Change the contract governor.
   * The new governor must pay the total amount of the current governor's contributions.
   * @param governorPayment The new governor payment.
   */
  private changeGovernor(governorPayment: PayTxn): void {
    const currentGovernor = this.governor.value;
    //const totalContributions = this.stakers(currentGovernor).value; // Get total contributions of the current governor
    // verifyPayTxn(governorPayment, { amount: totalContributions }); // Verify payment from the new governor
    this.governor.value = governorPayment.sender; // Change the governor
  }

  /**
   * Division using only sums and rests.
   *
   * @param dividend The number to be divided.
   * @param divisor The number to divide by.
   * @returns The quotient of the division.
   */
  private divide(dividend: uint64, divisor: uint64): uint64 {
    assert(divisor != 0, 'Division by zero is not allowed');
    let quotient = 0;
    let sum = divisor;

    while (sum <= dividend) {
      sum += divisor;
      quotient += quotient;
    }
    return quotient;
  }

}
