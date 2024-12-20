import sinon from "sinon";
import {setupTestContext} from "./fixtures/setupTestContext.mjs";
import {getDatabase} from "velor-database/application/services/services.mjs";
import {composeClearDataAccess} from "./fixtures/database-clear.mjs";
import {composeApiKeysDataAccess} from "../database/apiKeys.mjs";
import {getServiceBinder} from "velor-services/injection/ServicesContext.mjs";
import {ApiKeyDAO} from "../models/ApiKeyDAO.mjs";
import {AccessDao} from "../models/AccessDao.mjs";

const {
    expect,
    test,
    describe,
    afterEach,
    beforeEach,
    it,
} = setupTestContext();

describe('Access', ()=> {
    let services;
    let access;

    beforeEach(async ({services: s}) => {
        services = s;
        const database = getDatabase(services);
        const {schema} = database;
        let {clearDatabase} = composeClearDataAccess(schema);

        await clearDatabase(database);
        access = getServiceBinder(services).createInstance(AccessDao);
    })

    it('should save access', async () => {
        let data = {
            ip: '127.0.0.1',
            url: '/foo/bar',
            method: 'GET',
            fingerprint: '123456',
            backendVersion: '1.3.4',
            frontendVersion: '1.3.4',
            userId: null,
            loggedIn: false
        };


        let result = await access.saveOne(data);

        expect(result).to.not.be.undefined;

        expect(result).excluding('id', 'datetime').to.deep.eq(data);

    })
})