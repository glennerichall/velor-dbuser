import {NotImplementedError} from "velor-utils/utils/errors/NotImplementedError.mjs";
import {identOp} from "velor-utils/utils/functional.mjs";
import {
    isPristine,
    saveInitialState
} from "velor-utils/utils/objects.mjs";

export class BaseDAO {
    isVO(obj) {
        throw new NotImplementedError();
    }

    conformVO(vo) {
        throw new NotImplementedError();
    }

    makeVO(vo) {
        throw new NotImplementedError();
    }

    insertOne(vo) {
        throw new NotImplementedError();
    }

    updateOne(vo) {
        throw new NotImplementedError();
    }

    selectOne(query) {
        throw new NotImplementedError();
    }

    selectMany(query) {
        throw new NotImplementedError();
    }

    insertMany(list) {
        throw new NotImplementedError();
    }

    async canInsert(data) {
        throw new NotImplementedError();
    }

    async canUpdate(vo) {
        throw new NotImplementedError();
    }

    async loadOne(query) {
        if (!query) {
            return null;
        } else if (this.isVO(query)) {
            return query;
        }

        let vo = await this.selectOne(query);
        if (vo) {
            vo = this.conformVO(vo);
            vo = this.makeVO(vo);
        }

        return vo;
    }

    async loadId(query) {
        if (query.id) {
            return query.id;
        }
        let vo = await this.loadOne(query);
        return vo?.id;
    }

    async loadMany(query) {
        let list = await this.selectMany(query);
        for (let i = 0; i < list.length; i++) {
            let vo = list[i];
            vo = this.conformVO(vo);
            vo = this.makeVO(vo);
            list[i] = vo;
        }
        return list;
    }

    async saveOne(data) {
        let vo = data;

        if (await this.canInsert(data)) {
            vo = await this.insertOne(vo);
            vo = this.conformVO(vo);
            vo = this.makeVO(vo);
        } else if (await this.canUpdate(vo)) {
            vo = await this.updateOne(vo);
            vo = this.conformVO(vo);
            vo = this.makeVO(vo);
        }

        return vo;
    }

    async loadOrSave(data) {
        data = await this.loadOne(data) ?? data;
        return this.saveOne(data);
    }
}

export function freezeVo(vo) {
    Object.freeze(vo);
    return vo;
}

const typeSym = Symbol('VO-Type');

export const composeIsVO = symbol => (vo) => vo && vo[typeSym] === symbol;
export const composeCanInsertIfNotVo = (isVo) => async (data) => !isVo(data)
export const composeCanUpdateIfModified = (isVo, isPristine) => async (data) => isVo(data) && !isPristine(data);

export const composeMakeFrozenVo = symbol => (vo) => {
    vo[typeSym] = symbol;
    freezeVo(vo);
    return vo;
};

export const composeMakeSaveStateVo = symbol => (vo) => {
    vo[typeSym] = symbol;
    saveInitialState(vo);
    return vo;
}

export const composeMutablePolicy = symbol => {
    const isVO = composeIsVO(symbol);
    return {
        symbol,
        isVO,
        makeVO: composeMakeSaveStateVo(symbol),
        canInsert: composeCanInsertIfNotVo(isVO),
        canUpdate: composeCanUpdateIfModified(composeIsVO(symbol), isPristine),
    };
}

export const composeImmutablePolicy = symbol => {
    const isVO = composeIsVO(symbol);
    return {
        symbol,
        isVO,
        makeVO: composeMakeFrozenVo(symbol),
        canInsert: composeCanInsertIfNotVo(isVO),
        canUpdate: () => false,
    };
}

export const DAOPolicy = (policy = {}) => {

    const {
        conformVO = identOp,
        isVO,
        makeVO,
        canInsert,
        canUpdate,
    } = policy;

    if (!isVO || !makeVO || !canInsert || !canUpdate) {
        throw new Error("Must provide policies for isVO, makeVO, canInsert and canUpdate")
    }

    return class extends BaseDAO {

        isVO(obj) {
            return isVO(obj);
        }

        conformVO(vo) {
            return conformVO(vo);
        }

        makeVO(vo) {
            return makeVO(vo);
        }

        async canInsert(data) {
            return canInsert(data);
        }

        async canUpdate(vo) {
            return canUpdate(vo);
        }
    };
}