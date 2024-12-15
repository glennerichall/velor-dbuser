import {
    s_apiKeyDAO,
    s_authDAO,
    s_preferenceDAO,
    s_roleDAO,
    s_ruleDAO,
    s_userDAO,
} from "./serviceKeys.mjs";
import {s_databaseStatements} from "velor-database/application/services/serviceKeys.mjs";
import {RoleDAO} from "../../models/RoleDAO.mjs";
import {RuleDAO} from "../../models/RuleDAO.mjs";
import {AuthDAO} from "../../models/AuthDAO.mjs";
import {ApiKeyDAO} from "../../models/ApiKeyDAO.mjs";
import {UserDAO} from "../../models/UserDAO.mjs";
import {PreferenceDAO} from "../../models/PreferenceDAO.mjs";
import {createStatementsInstance} from "../factories/createStatementsInstance.mjs";
import {DaoEventEmitter} from "../../models/DaoEventEmitter.mjs";
import {
    API_KEY,
    AUTH,
    PREFERENCE,
    ROLE,
    RULE,
    USER
} from "../../models/names.mjs";

export const factories = {
    [s_databaseStatements]: createStatementsInstance,
    [s_roleDAO]: DaoEventEmitter(RoleDAO, ROLE),
    [s_ruleDAO]: DaoEventEmitter(RuleDAO, RULE),
    [s_authDAO]: DaoEventEmitter(AuthDAO, AUTH),
    [s_apiKeyDAO]: DaoEventEmitter(ApiKeyDAO, API_KEY),
    [s_userDAO]: DaoEventEmitter(UserDAO, USER),
    [s_preferenceDAO]: DaoEventEmitter(PreferenceDAO, PREFERENCE),
}