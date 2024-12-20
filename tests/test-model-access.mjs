import {setupTestContext} from "./fixtures/setupTestContext.mjs";
import {getServiceBinder} from "velor-services/injection/ServicesContext.mjs";
import {AccessDao} from "../models/AccessDao.mjs";

const {
    expect, test, describe, afterEach, beforeEach, it,
} = setupTestContext();

describe('Access', () => {
    let services;
    let accessDao;

    beforeEach(async ({services: s}) => {
        services = s;
        accessDao = getServiceBinder(services).createInstance(AccessDao);
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


        let result = await accessDao.saveOne(data);

        expect(result).to.not.be.undefined;

        expect(result).excluding('id', 'datetime').to.deep.eq(data);

    })

    it('should save multiple access', async () => {
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

        await accessDao.saveOne(data);
        await accessDao.saveOne(data);
        let all = await accessDao.loadMany();
        expect(all).to.have.length(2);

    })
})