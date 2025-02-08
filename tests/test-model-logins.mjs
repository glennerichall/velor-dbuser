import {setupTestContext} from "./fixtures/setupTestContext.mjs";
import {getServiceBinder} from "velor-services/injection/ServicesContext.mjs";
import {LoginDao} from "../models/LoginDao.mjs";
import {getAuthDAO} from "../application/services/services.mjs";

const {
    expect,
    test,
    describe,
    afterEach,
    beforeEach,
    it,
} = setupTestContext();

describe('Login', () => {
    let services;
    let loginDao;

    beforeEach(async ({services: s}) => {
        services = s;
        loginDao = getServiceBinder(services).createInstance(LoginDao);
    })

    it('should save login event', async ({services}) => {
        let auth = await getAuthDAO(services).saveOne({
            profileId: 'munchies',
            provider: 'token',
            verified: true,
        });

        let data = {
            authId: auth.id,
            type: 'login',
            fingerprint: '12345',
            ip: '127.0.0.1'
        };

        let result = await loginDao.saveOne(data);

        expect(result).to.not.be.undefined;

        expect(result).to.have.property('authId', data.authId);
        expect(result).to.have.property('type', 'login');
    })


    it('should freeze login', async () => {
        let auth = await getAuthDAO(services).saveOne({
            profileId: 'munchies',
            provider: 'token',
            verified: true,
        });

        let data = {
            authId: auth.id,
            type: 'login',
            fingerprint: '12345',
            ip: '127.0.0.1'
        };

        let saved = await loginDao.saveOne(data);

        expect(Object.isFrozen(saved)).to.be.true;
    })
})