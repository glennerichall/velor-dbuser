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

export const factories = {
    [s_databaseStatements]: createStatementsInstance,
    [s_roleDAO]: RoleDAO,
    [s_ruleDAO]: RuleDAO,
    [s_authDAO]: AuthDAO,
    [s_apiKeyDAO]: ApiKeyDAO,
    [s_userDAO]: UserDAO,
    [s_preferenceDAO]: PreferenceDAO,
}