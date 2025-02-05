import {composeFilesDataAccess} from "../database/files.mjs";
import {setupTestContext} from "./fixtures/setupTestContext.mjs";

const {
    expect,
    test,
    describe,
    afterEach,
    beforeEach,
    it,
} = setupTestContext();

describe('database files', () => {

    let createFile, queryFileByBucketname,
        updateSetStatus, queryFilesForAll,
        deleteByBucketname;

    beforeEach(async ({database}) => {
        let {schema} = database;
        ({
            createFile,
            queryFileByBucketname,
            updateSetStatus,
            queryFilesForAll,
            deleteByBucketname
        } = composeFilesDataAccess(schema));
    })

    it('should create file with bucket and bucketname', async ({database}) => {
        const {
            client,
        } = database;

        let bucket = 'a-bucket';
        let bucketname = 'a-bucketname';

        let file = await createFile(client, bucket, bucketname);
        expect(file).to.not.be.undefined;

        expect(file).to.have.property('bucketname', bucketname);
        expect(file).to.have.property('bucket', bucket);

        expect(file).to.have.property('creation');
        expect(file).to.have.property('status', 'created');
        expect(file).to.have.property('size', null);
        expect(file).to.have.property('hash', null);

        let loaded = await queryFileByBucketname(client, bucketname);
        expect(loaded).to.not.be.undefined;

        expect(file).to.have.property('bucketname', bucketname);
        expect(file).to.have.property('bucket', bucket);

        expect(file).to.have.property('creation');
        expect(file).to.have.property('status', 'created');
        expect(file).to.have.property('size', null);
        expect(file).to.have.property('hash', null);
    })

    it('should create file without bucketname', async ({database}) => {
        const {
            client,
        } = database;

        let bucket = 'a-bucket';

        let file = await createFile(client, bucket);
        expect(file).to.not.be.undefined;

        expect(file).to.have.property('bucketname');
        expect(file.bucketname).to.not.be.undefined;
        expect(file).to.have.property('bucket', bucket);

        expect(file).to.have.property('creation');
        expect(file).to.have.property('status', 'created');
        expect(file).to.have.property('size', null);
        expect(file).to.have.property('hash', null);

        let loaded = await queryFileByBucketname(client, file.bucketname);
        expect(loaded).to.not.be.undefined;

        expect(file).to.have.property('bucketname', file.bucketname);
        expect(file).to.have.property('bucket', bucket);

        expect(file).to.have.property('creation');
        expect(file).to.have.property('status', 'created');
        expect(file).to.have.property('size', null);
        expect(file).to.have.property('hash', null);

        let file2 = await createFile(client, bucket);
        expect(file2.bucketname).to.not.be.undefined;
        expect(file2.bucketname).to.not.eq(file.bucketname);
    })

    test('it should not have duplicate bucketnames', async ({database}) => {
        const {
            client,
        } = database;

        let bucket = 'a-bucket';
        let bucketname = 'a-bucketname';

        let file1 = await createFile(client, bucket, bucketname);
        expect(file1).to.not.be.undefined;
        expect(createFile(client, bucket, bucketname)).to.be.rejected;
    })

    test('should set file status', async ({database}) => {
        const {
            client,
        } = database;

        let bucket = 'a-bucket';
        let status = 'uploaded';
        let size = 100;
        let hash = '12345';

        let {bucketname} = await createFile(client, bucket);
        let ok = await updateSetStatus(client, bucketname, size, hash, status);
        expect(!!ok).to.be.true;

        let file = await queryFileByBucketname(client, bucketname);

        expect(file).to.have.property('bucketname', bucketname);
        expect(file).to.have.property('bucket', bucket);

        expect(file).to.have.property('creation');
        expect(file).to.have.property('status', 'uploaded');
        expect(file).to.have.property('size', size);
        expect(file).to.have.property('hash', hash);
    })

    test('should get all files from bucket', async({database})=> {
        const {
            client,
        } = database;

        await createFile(client, 'bucket-1');
        await createFile(client, 'bucket-1');
        await createFile(client, 'bucket-2');
        await createFile(client, 'bucket-2');
        await createFile(client, 'bucket-2');

        let files = await queryFilesForAll(client, 'bucket-2');
        expect(files).to.have.length(3);
        for(let file of files) {
            expect(file).to.have.property('bucketname');
            expect(file.bucketname).to.not.be.undefined;
            expect(file).to.have.property('bucket', 'bucket-2');

            expect(file).to.have.property('creation');
            expect(file).to.have.property('status', 'created');
            expect(file).to.have.property('size', null);
            expect(file).to.have.property('hash', null);

        }
    })

    test('should delete file by bucketname', async({database})=> {
        const {
            client,
        } = database;

        let bucket = 'a-bucket';
        let bucketname = 'a-bucketname';

        await createFile(client, bucket, bucketname);
        await createFile(client, bucket);

        await deleteByBucketname(client, bucketname);

        let files = await queryFilesForAll(client, bucket);

        expect(files).to.have.length(1);

        let file = files[0];
        expect(file).to.have.property('bucketname');
        expect(file.bucketname).to.not.eq(bucketname);
    })
})