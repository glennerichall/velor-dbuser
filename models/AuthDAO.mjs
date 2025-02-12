import {getDataAuths} from "../application/services/dataServices.mjs";
import {conformAuth} from "./conform/conformAuth.mjs";
import {
    composeImmutablePolicy,
    DAOPolicy
} from "./BaseDAO.mjs";
import {AUTH} from "./names.mjs";

const kAuth = Symbol(AUTH);

export class AuthDAO extends DAOPolicy({
    conformVO: conformAuth,
    ...composeImmutablePolicy(kAuth),
}) {

    async selectOne(query) {
        let auth;
        if (query.id) {
            auth = await getDataAuths(this).getAuthById(query.id);
        } else if (query.profileId && query.provider) {
            auth = await getDataAuths(this).getAuthByProvider(
                query.profileId,
                query.provider);
        }
        return auth;
    }

    async markAsConfirmed(auth) {
        auth = await this.loadOne(auth);
        if (!this.isVO(auth)) return false;
        await getDataAuths(this).setUserVerifiedEmail(auth.id);
        auth = {
            ...auth,
            verified: true,
        };
        return this.makeVO(auth);
    }

    async insertOne(profile) {
        return getDataAuths(this).insertAuth(profile);
    }
}