import {getDataUsers} from "../application/services/dataServices.mjs";
import {
    composeImmutablePolicy,
    DAOPolicy
} from "./BaseDAO.mjs";
import {
    getApiKeyDAO,
    getAuthDAO,
    getLoginDAO,
    getPreferenceDAO,
    getRoleDAO,
    getRuleDAO
} from "../application/services/services.mjs";
import {conformUser} from "./conform/conformUser.mjs";
import {USER} from "./names.mjs";

const kUser = Symbol(USER);

export class UserDAO extends DAOPolicy({
    conformVO: conformUser,
    ...composeImmutablePolicy(kUser)
}) {

    async selectOne(query) {
        let auth;

        if (getAuthDAO(this).isVO(query)) {
            query = {
                authId: query.id
            }
        }

        if (query.id) {
            auth = await getDataUsers(this).getPrimaryAuthByUserId(query.id);

        } else if (query.authId) {
            auth = await getDataUsers(this).getPrimaryAuthByAuthId(query.authId);

        } else if (query.profileId && query.provider) {
            auth = await getDataUsers(this).getPrimaryAuthByProfile(
                query.profileId,
                query.provider);

        }
        return auth;
    }

    async grantRole(user, role) {
        let userId = await this.loadId(user);
        let roleName = await getRoleDAO(this).getRoleName(role);
        await getDataUsers(this).grantUserRoleByUserId(userId, roleName);
    }

    async revokeRole(user, role) {
        let userId = await this.loadId(user);
        let roleName = await getRoleDAO(this).getRoleName(role);
        await getDataUsers(this).revokeUserRoleByUserId(userId, roleName);
    }

    async insertOne(data) {
        if (data.authId) {
            data.id = data.authId;
        }
        let authId = await getAuthDAO(this).loadId(data);
        let user = await getDataUsers(this).insertUser(authId);
        user = await this.loadOne(user);
        await this.grantRole(user, {name: "normal"});
        return user;
    }

    async countUsers() {
        return await getDataUsers(this).countUsers();
    }

    async getApiKeys(user) {
        return await getApiKeyDAO(this).loadMany({user});
    }

    async ownApiKey(user, apiKey) {
        let userId = await this.loadId(user);
        let apiKeyId = await getApiKeyDAO(this).loadId(apiKey);
        await getDataUsers(this).addApiKeyOwner(apiKeyId, userId);
    }

    async loseApiKey(user, apiKey) {
        let userId = await this.loadId(user);
        let apiKeyId = await getApiKeyDAO(this).loadId(apiKey);
        await getDataUsers(this).removeApiKeyOwner(apiKeyId, userId);
    }

    async createApiKey(user, name) {
        let apiKey = await getApiKeyDAO(this).saveOne({name});
        await this.ownApiKey(user, apiKey);
        return apiKey;
    }

    async getApiKey(user, apiKey) {
        return await getApiKeyDAO(this).loadOne({user, ...apiKey});
    }

    async getAclRules(user, ...categories) {
        return await getRuleDAO(this).loadMany({user, categories});
    }

    async getRoles(user) {
        return getRoleDAO(this).loadMany({user});
    }

    async getPreferences(user) {
        return await getPreferenceDAO(this).loadMany({user});
    }

    async getPreference(user, name) {
        return await getPreferenceDAO(this).loadOne({user, name});
    }

    async setPreference(user, name, value) {
        return await getPreferenceDAO(this).saveOne({user, name, value});
    }

    async saveLoginEvent(user, info, type = 'login') {
        let authId;

        if (!user.primaryAuthId) {
            user = this.loadOne(user);
        }
        authId = user.primaryAuthId;

        return getLoginDAO(this).saveOne({
            authId,
            ...info,
            type
        });
    }

    async saveLogoutEvent(user, info) {
        return this.saveLoginEvent(user, info, 'logout');
    }
}