import {
    composeImmutablePolicy,
    DAOPolicy
} from "./BaseDAO.mjs";
import {conformAccess} from "./conform/conformAccess.mjs";
import {getDataAccess} from "../application/services/dataServices.mjs";
import {ACCESS} from "./names.mjs";

const kAccess = Symbol(ACCESS);

export class AccessDao extends DAOPolicy({
    conformVO: conformAccess,
    ...composeImmutablePolicy(kAccess)
}) {

    insertOne(data) {
        return getDataAccess(this).insertAccess(data);
    }

    selectOne() {
        return null;
    }

    selectMany() {
        return getDataAccess(this).selectAll();
    }

}