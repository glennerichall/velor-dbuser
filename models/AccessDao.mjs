import {DAOPolicy} from "./BaseDAO.mjs";
import {conformAccess} from "./conform/conformAccess.mjs";
import {getDataAccess} from "../application/services/dataServices.mjs";

const accessSymbol = Symbol("access");

export class AccessDao extends DAOPolicy({
    symbol: accessSymbol,
    conformVO: conformAccess
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