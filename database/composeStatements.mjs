import {
    DATA_ACCESS,
    DATA_ACL,
    DATA_API_KEYS,
    DATA_AUTHS,
    DATA_LOGINS,
    DATA_PREFERENCES,
    DATA_ROLES,
    DATA_USERS
} from "../application/services/dataKeys.mjs";
import {composeAuthsDataAccess} from "./auths.mjs";
import {composeUsersDataAccess} from "./users.mjs";
import {composeApiKeysDataAccess} from "./apiKeys.mjs";
import {composeAclDataAccess} from "./acl.mjs";
import {composeRolesDataAccess} from "./roles.mjs";
import {composePreferencesDataAccess} from "./preferences.mjs";
import {composeAccessDataAccess} from "./access.mjs";
import {composeLoginDataAccess} from "./logins.mjs";

export function composeStatements(schema, tableNames = {}) {
    return {
        [DATA_AUTHS]: composeAuthsDataAccess(schema, tableNames),
        [DATA_USERS]: composeUsersDataAccess(schema, tableNames),
        [DATA_API_KEYS]: composeApiKeysDataAccess(schema, tableNames),
        [DATA_ACL]: composeAclDataAccess(schema, tableNames),
        [DATA_ROLES]: composeRolesDataAccess(schema, tableNames),
        [DATA_PREFERENCES]: composePreferencesDataAccess(schema, tableNames),
        [DATA_ACCESS]: composeAccessDataAccess(schema, tableNames),
        [DATA_LOGINS]: composeLoginDataAccess(schema, tableNames),
    }
}