import {
    composeImmutablePolicy,
    DAOPolicy
} from "./BaseDAO.mjs";
import {LOGIN} from "./names.mjs";
import {conformLogin} from "./conform/conformLogin.mjs";
import {getDataLogins} from "../application/services/dataServices.mjs";
import {getAuthDAO} from "../application/services/services.mjs";

const kLogin = Symbol(LOGIN);

export class LoginDao extends DAOPolicy({
    conformVO: conformLogin,
    ...composeImmutablePolicy(kLogin)
}) {

    insertOne(data) {
        return getDataLogins(this).insertEvent(data);
    }

    async selectOne(query) {
        let login;

        if (query.id) {
            login = await getDataLogins(this).getLoginById(query.id);
        } else if (query.authId) {
            login = await getDataLogins(this).getLastAuthLogin(query.authId);
        } else if (query.auth) {
            let authId = await getAuthDAO(this).loadId(query.auth);
            login = await getDataLogins(this).getLastAuthLogin(authId);
        }

        return login;
    }

    async selectMany(query) {
        let logins = [];

        if (query.authId) {
            logins = await getDataLogins(this).getAuthLogins(query.authId);
        } else if (query.auth) {
            let authId = await getAuthDAO(this).loadId(query.auth);
            logins = await getDataLogins(this).getAuthLogins(authId);
        }

        return logins;
    }

}