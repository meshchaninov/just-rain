class BGStore {
    constructor() {
        this.store = {};
    }

    set(key, value) {
        this.store[key] = value;
    }

    get(key) {
        return this.store[key];
    }
}