import {
    DATA_ACCESS,
    DATA_ACL,
    DATA_API_KEYS,
    DATA_AUTHS,
    DATA_LOGINS,
    DATA_PREFERENCES,
    DATA_ROLES,
    DATA_USERS,
} from "./dataKeys.mjs";
import {getDatabase} from "velor-database/application/services/services.mjs";

export function getDataUsers(services) {
    return getDatabase(services)[DATA_USERS];
}

export function getDataAuths(services) {
    return getDatabase(services)[DATA_AUTHS];
}

export function getDataAccess(services) {
    return getDatabase(services)[DATA_ACCESS];
}

export function getDataLogins(services) {
    return getDatabase(services)[DATA_LOGINS];
}

export function getDataApiKeys(services) {
    return getDatabase(services)[DATA_API_KEYS];
}

export function getDataAcl(services) {
    return getDatabase(services)[DATA_ACL];
}

export function getDataRoles(services) {
    return getDatabase(services)[DATA_ROLES];
}

export function getDataPreferences(services) {
    return getDatabase(services)[DATA_PREFERENCES];
}