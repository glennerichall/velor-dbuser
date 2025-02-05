import {setupTestContext} from "./fixtures/setupTestContext.mjs";
import {getServiceBinder} from "velor-services/injection/ServicesContext.mjs";
import {FileDAO} from "../models/FileDao.mjs";

const {
    expect,
    test,
    describe,
    afterEach,
    beforeEach,
    it,
} = setupTestContext();

describe('File', () => {
    let file;

    beforeEach(async ({services}) => {
        file = getServiceBinder(services).createInstance(FileDAO);
    })

    it('should create file', async () => {
        let bucket = 'a-bucket';
        let bucketname = 'a-bucketname';

        let saved = await file.saveOne({
            bucket,
            bucketname
        });

        let loaded = await file.loadOne({bucketname});

        expect(saved).to.not.be.undefined;
        expect(loaded).to.deep.eq(saved);
    })

    it('should freeze file', async () => {
        let bucket = 'a-bucket';
        let saved = await file.saveOne({bucket});
        expect(Object.isFrozen(saved)).to.be.true;
    })
})