import {
    getDataApiKeys,
    getDataUsers
} from "../application/services/dataServices.mjs";
import {conformApiKey} from "./conform/conformApiKey.mjs";
import {
    composeImmutablePolicy,
    DAOPolicy
} from "./BaseDAO.mjs";
import {
    getApiKeyDAO,
    getRuleDAO,
    getUserDAO
} from "../application/services/services.mjs";
import {services} from "../tests/fixtures/services.mjs";
import {NotImplementedError} from "velor-utils/utils/errors/NotImplementedError.mjs";
import {API_KEY} from "./names.mjs";

const kApiKey = Symbol(API_KEY);

export class ApiKeyDAO extends DAOPolicy({
    conformVO: conformApiKey,
    ...composeImmutablePolicy(kApiKey)
}) {

    async selectOne(query) {
        let apiKey;
        if (query.publicId) {
            if (query.user) {
                let userId = await getUserDAO(this).loadId(query.user);
                apiKey = await getDataUsers(this).getApiKeyByUser(query.publicId, userId);
            } else {
                apiKey = await getDataApiKeys(this).getApiKeyByPublicId(query.publicId);
            }

        } else if (query.value) {
            apiKey = await getDataApiKeys(this).getApiKeyByValue(query.value);

        } else if (query.id) {
            apiKey = await getDataApiKeys(this).getApiKeyById(query.id);
        }
        return apiKey;
    }

    async selectMany(query) {
        let apiKeys;
        if (query.publicId || query.value || query.id) {
            let apiKey = await this.selectOne(query);
            if (apiKey) {
                apiKeys = [apiKey];
            } else {
                apiKeys = [];
            }

        } else if (query.user) {
            let id = await getUserDAO(this).loadId(query.user);
            apiKeys = await getDataUsers(this).getUserApiKeysByUserId(id);

        } else {
            apiKeys = await getApiKeyDAO(services).getAllApiKeys();
        }

        return apiKeys;
    }

    async addAclRule(apiKey, rule) {
        apiKey = await this.loadOne(apiKey);
        let ruleName = await getRuleDAO(this).getRuleName(rule);
        await getDataApiKeys(this).addAclRuleToApiKey(apiKey.id, ruleName);
    }

    async getAclRules(apiKey, ...categories) {
        apiKey = await this.loadOne(apiKey);
        return getRuleDAO(this).loadMany({
            apiKey,
            categories
        });
    }

    async insertOne(data) {
        return getDataApiKeys(this).createApiKey(data.name);
    }

    async delete(query) {
        let result;

        if (query.publicId) {
            result = await getDataApiKeys(this).deleteApiKeyByPublicId(query.publicId);

        } else if (query.value) {
            throw new NotImplementedError();

        } else if (query.id) {
            throw new NotImplementedError();
        }

        if(result) {
            result = this.conformVO(result);
            result = this.makeVO(result);
        }

        return result;
    }
}