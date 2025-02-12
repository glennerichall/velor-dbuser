import {
    s_apiKeyDAO,
    s_authDAO,
    s_fileDAO,
    s_loginDAO,
    s_preferenceDAO,
    s_roleDAO,
    s_ruleDAO,
    s_userDAO,
} from "./serviceKeys.mjs";

import {getProvider} from "velor-services/injection/ServicesContext.mjs";

export function getRoleDAO(services) {
    return getProvider(services)[s_roleDAO]();
}

export function getRuleDAO(services) {
    return getProvider(services)[s_ruleDAO]();
}

export function getApiKeyDAO(services) {
    return getProvider(services)[s_apiKeyDAO]();
}

export function getUserDAO(services) {
    return getProvider(services)[s_userDAO]();
}

export function getAuthDAO(services) {
    return getProvider(services)[s_authDAO]();
}

export function getPreferenceDAO(services) {
    return getProvider(services)[s_preferenceDAO]();
}

export function getLoginDAO(services) {
    return getProvider(services)[s_loginDAO]();
}

export function getFileDAO(services) {
    return getProvider(services)[s_fileDAO]();
}