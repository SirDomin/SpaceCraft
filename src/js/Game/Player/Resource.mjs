export class Resource {
    static FUEL = 'fuel';
    static HEALTH = 'health';
    static ENERGY = 'energy';

    constructor(type, maxAmount, currentAmount) {
        this.type = type;
        this.maxAmount = maxAmount;
        this.currentAmount = currentAmount;
    }

    setAmount(amount) {
        this.amount = amount;
    }

    setMaxAmount(amount) {
        this.maxAmount = amount;
    }

    addAmount(amount) {
        if (this.currentAmount + amount <= this.maxAmount && this.currentAmount + amount >= 0 ) {
            this.currentAmount += amount;
        }
    }

    max() {
        return this.maxAmount;
    }

    amount() {
        return this.currentAmount;
    }
}