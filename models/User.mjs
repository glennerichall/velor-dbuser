import {getUserDAO} from "../application/services/services.mjs";

const kp_data = Symbol();
const kp_loaded = Symbol();
const kp_apiKeys = Symbol();
const kp_roles = Symbol();

export class User {

    constructor(data) {
        this[kp_data] = data;
        this[kp_loaded] = null;
        this[kp_apiKeys] = null;
        this[kp_roles] = null;
    }

    async save() {
        await getUserDAO(this).saveOne(this[kp_data]);
    }

    async load() {
        this[kp_loaded] = getUserDAO(this).loadOne(this[kp_data]);
    }

    async getApiKeys() {
        if (!this[kp_apiKeys]) {
            this[kp_apiKeys] = await getUserDAO(this).getApiKeys(this[kp_loaded]);
        }
        return this[kp_apiKeys];
    }

    async getRoles() {
        if (!this[kp_roles]) {
            this[kp_roles] = await getUserDAO(this).getRoles(this[kp_loaded]);
        }
        return this[kp_roles];
    }

    async getRules() {
        if (!this[kp_roles]) {
            this[kp_roles] = await getUserDAO(this).getAclRules(this[kp_loaded]);
        }
        return this[kp_roles];
    }

    async getPreferences() {
        if (!this[kp_roles]) {
            this[kp_roles] = await getUserDAO(this).getPreferences(this[kp_loaded]);
        }
        return this[kp_roles];
    }

}