import {setupTestContext} from "./fixtures/setupTestContext.mjs";
import {
    getFileDAO,
    getUserDAO
} from "../application/services/services.mjs";

const {
    expect,
    test,
    describe,
    afterEach,
    beforeEach,
    it,
} = setupTestContext();

describe('File Owners', () => {
    const profile = {
        profileId: "mi@gmail.com",
        provider: "google.com",
        email: "mi@gmail.com",
        verified: false,
        displayName: "Mi Too",
        lastName: "Too",
        firstName: "Mi",
        avatar: 'avatoar'
    };

    let fileDAO, userDAO;

    beforeEach(async ({services}) => {
        fileDAO = getFileDAO(services);
        userDAO = getUserDAO(services);
    })

    it('should get files of user', async ({users}) => {
        let bucket = 'a-bucket';
        let user = users[0];

        await fileDAO.saveOne({user, bucket});
        await fileDAO.saveOne({user, bucket});
        await fileDAO.saveOne({user, bucket: 'another-bucket'});
        await fileDAO.saveOne({bucket});
        await fileDAO.saveOne({user: users[1], bucket});

        let files = await fileDAO.loadMany();
        expect(files).to.have.lengthOf(5);

        files = await fileDAO.loadMany({user});
        expect(files).to.have.lengthOf(3);

        files = await fileDAO.loadMany({user, bucket});
        expect(files).to.have.lengthOf(2);

        files = await userDAO.getFiles(user);
        expect(files).to.have.lengthOf(3);

        files = await userDAO.getFiles(user, {bucket});
        expect(files).to.have.lengthOf(2);
    })

    it('should get file by bucketname of user', async ({users}) => {
        let bucket = 'a-bucket';

        let user = users[0];

        await fileDAO.saveOne({user, bucket, bucketname: 'a'});
        await fileDAO.saveOne({user: users[1], bucket, bucketname: 'b'});

        let file = await fileDAO.loadOne({user, bucketname: 'a'});
        expect(file).to.not.be.null;
        expect(file).to.have.property('bucketname', 'a');

        file = await fileDAO.loadOne({user, bucketname: 'b'});
        expect(file).to.be.null;
    })
})