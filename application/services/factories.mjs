import {
    s_accessDAO,
    s_apiKeyDAO,
    s_authDAO,
    s_fileDAO,
    s_loginDAO,
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
    ACCESS,
    API_KEY,
    AUTH,
    FILE,
    LOGIN,
    PREFERENCE,
    ROLE,
    RULE,
    USER
} from "../../models/names.mjs";
import {AccessDao} from "../../models/AccessDao.mjs";
import {LoginDao} from "../../models/LoginDao.mjs";
import {FileDAO} from "../../models/FileDao.mjs";

export const factories = {
    [s_databaseStatements]: createStatementsInstance,
    [s_roleDAO]: DaoEventEmitter(RoleDAO, ROLE),
    [s_ruleDAO]: DaoEventEmitter(RuleDAO, RULE),
    [s_authDAO]: DaoEventEmitter(AuthDAO, AUTH),
    [s_apiKeyDAO]: DaoEventEmitter(ApiKeyDAO, API_KEY),
    [s_userDAO]: DaoEventEmitter(UserDAO, USER),
    [s_preferenceDAO]: DaoEventEmitter(PreferenceDAO, PREFERENCE),
    [s_accessDAO]: DaoEventEmitter(AccessDao, ACCESS),
    [s_loginDAO]: DaoEventEmitter(LoginDao, LOGIN),
    [s_fileDAO]: DaoEventEmitter(FileDAO, FILE),
}