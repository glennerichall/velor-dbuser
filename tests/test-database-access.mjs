import {setupTestContext} from "./fixtures/setupTestContext.mjs";
import {composeAccessDataAccess} from "../database/access.mjs";
import {conformAccess} from "../models/conform/conformAccess.mjs";
import {beginTransact} from "velor-database/database/beginTransact.mjs";

const {
    expect,
    describe,
    afterEach,
    beforeEach,
    it,
} = setupTestContext();


describe('database access', () => {
    let statements;
    let insertAccess,
        selectAll;

    beforeEach(async ({database}) => {
        const {schema} = database;
        statements = composeAccessDataAccess(schema);

        ({
            insertAccess,
            selectAll,
        } = statements);
    })

    it('should insert access', async ({database}) => {
        const {
            client,
        } = database;

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

        let access = await insertAccess(client, data);
        access = conformAccess(access);
        expect(access).to.not.be.undefined;
        expect(access).excluding('id', 'datetime').to.deep.eq(data);

        let allAccess = await selectAll(client);

        expect(allAccess).to.have.length(1);
    })
})
