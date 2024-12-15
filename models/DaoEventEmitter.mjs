import {getEmitter as getDefaultEmitter} from "velor-services/application/services/services.mjs";
import {
    ELEMENT_CREATED,
    ELEMENT_DELETED
} from "./events.mjs";

export const DaoEventEmitter = (DAO, name, getEmitter = getDefaultEmitter) => {
    return class DaoEventEmitter extends DAO {

        constructor(...args) {
            super(...args);
        }

        async saveOne(vo) {
            let result = await super.saveOne(vo);
            getEmitter(this).emit(ELEMENT_CREATED, name, result, vo);
            return result;
        }

        async delete(query) {
            let result = await super.delete(query);
            getEmitter(this).emit(ELEMENT_DELETED, name, result, query);
            return result;
        }
    };
}