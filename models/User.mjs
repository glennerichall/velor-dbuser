import {getUserDAO} from "../application/services/services.mjs";

export class User {
    #data;
    #loaded;
    #apiKeys;
    #roles;

    constructor(data) {
        this.#data = data;
    }

    async save() {
        await getUserDAO(this).saveOne(this.#data);
    }

    async load() {
        this.#loaded = getUserDAO(this).loadOne(this.#data);
    }

    async getApiKeys() {
        if (!this.#apiKeys) {
            this.#apiKeys = await getUserDAO(this).getApiKeys(this.#loaded);
        }
        return this.#apiKeys;
    }

    async getRoles() {
        if (!this.#roles) {
            this.#roles = await getUserDAO(this).getRoles(this.#loaded);
        }
        return this.#roles;
    }

    async getRules() {
        if (!this.#roles) {
            this.#roles = await getUserDAO(this).getAclRules(this.#loaded);
        }
        return this.#roles;
    }

    async getPreferences() {
        if (!this.#roles) {
            this.#roles = await getUserDAO(this).getPreferences(this.#loaded);
        }
        return this.#roles;
    }

}