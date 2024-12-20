import {setupTestContext} from "./fixtures/setupTestContext.mjs";
import {composeRolesDataAccess} from "../database/roles.mjs";

const {
    expect,
    test,
    describe,
    afterEach,
    beforeEach,
    it,
} = setupTestContext();

describe('database roles', () => {
    let createRole,
        getAllRoles;

    beforeEach(async ({database}) => {
        const {
            client,
            schema,
        } = database;

        ({
            createRole,
            getAllRoles
        } = composeRolesDataAccess(schema));

        await createRole(client, 'god', 'God mode');
        await createRole(client, 'power', 'Power user');
    })

    it('should create role', async ({database}) => {
        const {
            client,
            schema
        } = database;

        let roles = await getAllRoles(client, schema);

        expect(roles).to.have.length(2);

        expect(roles[0]).to.have.property('name', 'god');
        expect(roles[0]).to.have.property('description', 'God mode');
    })

    it('should not create duplicate roles', async ({database}) => {
        const {
            client,
        } = database;
        expect(createRole(client, 'god', 'There is only one')).to.eventually.be.rejected;
    })
});