import {setupTestContext} from "./fixtures/setupTestContext.mjs";
import {getServiceBinder} from "velor-services/injection/ServicesContext.mjs";
import {FileDAO} from "../models/FileDao.mjs";
import {generateCombinations} from "velor-utils/utils/collection.mjs";

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
            bucketname,
            filename: 'my-super-file.txt'
        });

        let loaded = await file.loadOne({bucketname});

        expect(saved).to.not.be.undefined;
        expect(loaded).to.deep.eq(saved);
    })

    it('should update file info', async () => {
        let bucket = 'a-bucket';
        let bucketname = 'a-bucketname';

        let saved = await file.saveOne({
            bucket,
            bucketname
        });

        saved.hash = '1234';
        saved.size = 4000;
        saved.status = 'uploaded';

        await file.saveOne(saved);

        let loaded = await file.loadOne({bucketname});

        expect(loaded).to.have.property("bucket", saved.bucket);
        expect(loaded).to.have.property("bucketname", saved.bucketname);
        expect(loaded).to.have.property("hash", saved.hash);
        expect(loaded).to.have.property("size", saved.size);
        expect(loaded).to.have.property("status", saved.status);
        expect(loaded.creation.getTime()).to.eq(saved.creation.getTime());

    })

    it('should get many files by page and filter', async () => {
        // Define the properties
        let options = {
            bucket: ['bucket-a', 'bucket-b'],
            hash: [undefined, '123', '456'],
            size: [undefined, 400, 500, 600, 700],
            status: [undefined, 'ready', 'created'],
            creation: [new Date('2019-01-01'), new Date('2019-01-02'), new Date('2019-01-04'), new Date('2019-01-07')]
        };

        // Generate the combinations
        let instances = generateCombinations(options);

        // save instances
        for (let inst of instances) {
            await file.saveOne(inst);
        }

        // -----------------------------------------------------------

        let files = await file.loadMany({
            hash: '123'
        });

        expect(files).to.have.length(options.bucket.length *
            options.size.length * options.status.length *
            options.creation.length);

        // -----------------------------------------------------------

        files = await file.loadMany({
            minSize: 500,
        });

        expect(files).to.have.length(options.bucket.length *
            options.hash.length * options.status.length *
            options.size.filter(x => x >= 500).length *
            options.creation.length);

        // -----------------------------------------------------------

        files = await file.loadMany({
            hash: '123',
            minSize: 500,
        });

        expect(files).to.have.length(options.bucket.length *
            options.status.length *
            options.size.filter(x => x >= 500).length *
            options.creation.length);

        // -----------------------------------------------------------

        files = await file.loadMany({
            maxSize: 600,
            minSize: 500,
        });

        expect(files).to.have.length(options.bucket.length *
            options.status.length * options.hash.length *
            options.size.filter(x => x >= 500 && x <= 600).length *
            options.creation.length);

        // -----------------------------------------------------------

        files = await file.loadMany({
            bucket: 'bucket-a',
            maxSize: 600,
            minSize: 500,
        });

        expect(files).to.have.length(options.status.length *
            options.hash.length *
            options.size.filter(x => x >= 500 && x <= 600).length *
            options.creation.length);

        // -----------------------------------------------------------

        files = await file.loadMany({
            bucket: 'bucket-a',
            maxSize: 600,
            minSize: 500,
            minDate: new Date('2019-01-02')
        });

        expect(files).to.have.length(options.status.length *
            options.hash.length *
            options.size.filter(x => x >= 500 && x <= 600).length *
            options.creation.filter(x => x.getTime() >= new Date('2019-01-02').getTime()).length);

        // -----------------------------------------------------------

        files = await file.loadMany({
            bucket: 'bucket-a',
            maxSize: 600,
            minSize: 500,
            minDate: new Date('2019-01-02'),
            maxDate: new Date('2019-01-04'),
        });

        expect(files).to.have.length(options.status.length *
            options.hash.length *
            options.size.filter(x => x >= 500 && x <= 600).length *
            options.creation.filter(x => x.getTime() >= new Date('2019-01-02').getTime() &&
                x.getTime() <= new Date('2019-01-04').getTime()).length);

        // -----------------------------------------------------------

        files = await file.loadMany({
            bucket: 'bucket-a',
            maxSize: 600,
            minSize: 500,
            minDate: new Date('2019-01-02'),
            maxDate: new Date('2019-01-04'),
            sort: 'size desc'
        });

        expect(files).to.have.length(options.status.length *
            options.hash.length *
            options.size.filter(x => x >= 500 && x <= 600).length *
            options.creation.filter(x => x.getTime() >= new Date('2019-01-02').getTime() &&
                x.getTime() <= new Date('2019-01-04').getTime()).length);

        for (let i = 1; i < files.length; i++) {
            expect(files[i].size).to.be.lessThanOrEqual(files[i - 1].size);
        }

        // -----------------------------------------------------------

        files = await file.loadMany({
            bucket: 'bucket-a',
            maxSize: 600,
            minSize: 500,
            minDate: new Date('2019-01-02'),
            maxDate: new Date('2019-01-04'),
            sort: 'size desc'
        });

        expect(files).to.have.length(options.status.length *
            options.hash.length *
            options.size.filter(x => x >= 500 && x <= 600).length *
            options.creation.filter(x => x.getTime() >= new Date('2019-01-02').getTime() &&
                x.getTime() <= new Date('2019-01-04').getTime()).length);

        for (let i = 1; i < files.length; i++) {
            expect(files[i].size).to.be.lessThanOrEqual(files[i - 1].size);
        }

        // -----------------------------------------------------------

        files = await file.loadMany({
            bucket: 'bucket-a',
            maxSize: 600,
            minSize: 500,
            minDate: new Date('2019-01-02'),
            maxDate: new Date('2019-01-04'),
            sort: 'size desc',
            page: 2,
            perPage: 5,
        });


        expect(files).to.have.length(5);


        // -----------------------------------------------------------
        let total = options.status.length *
            options.hash.length *
            options.size.filter(x => x >= 500 && x <= 600).length *
            options.creation.filter(x => x.getTime() >= new Date('2019-01-02').getTime() &&
                x.getTime() <= new Date('2019-01-04').getTime()).length;

        let pages = Math.ceil(total / 5);

        files = await file.loadMany({
            bucket: 'bucket-a',
            maxSize: 600,
            minSize: 500,
            minDate: new Date('2019-01-02'),
            maxDate: new Date('2019-01-04'),
            sort: 'size desc',
            page: pages + 1,
            perPage: 5,
        });

        expect(files).to.have.length(0);
    })

    it('should delete file', async () => {
        let bucket = 'a-bucket';
        let bucketname = 'a-bucketname';

        await file.saveOne({
            bucket,
            bucketname
        });

        await file.saveOne({bucket});

        let deleted = await file.deleteOne({bucketname});
        expect(deleted).to.have.property('bucketname', bucketname);

        let files = await file.loadMany();
        expect(files).to.have.length(1);
        expect(files[0].bucketname).to.not.eq(bucketname);
    })

    it('should delete many files by bucket', async () => {
        // Define the properties
        let options = {
            bucket: ['bucket-a', 'bucket-b'],
            hash: [undefined, '123', '456'],
            size: [undefined, 400, 500, 600, 700],
            status: [undefined, 'ready', 'created'],
            creation: [new Date('2019-01-01'), new Date('2019-01-02'), new Date('2019-01-04'), new Date('2019-01-07')]
        };

        // Generate the combinations
        let instances = generateCombinations(options);

        // save instances
        for (let inst of instances) {
            await file.saveOne(inst);
        }

        await file.deleteMany({
            minSize: 500,
            maxSize: 600,
            bucket: 'bucket-a'
        });

        let files = await file.loadMany();
        expect(files).to.have.length(
            // the total number of files
            options.bucket.length *
            options.hash.length *
            options.size.length *
            options.status.length *
            options.creation.length

            -

            // minus the number of removed files
            options.hash.length *
            options.size.filter(x => x >= 500 && x <= 600).length *
            options.status.length *
            options.creation.length
        );
    })

    it('should list unique buckets', async () => {
        await file.saveOne({bucket: 'a'});
        await file.saveOne({bucket: 'a'});
        await file.saveOne({bucket: 'a'});
        await file.saveOne({bucket: 'b'});
        await file.saveOne({bucket: 'b'});
        await file.saveOne({bucket: 'c'});

        let buckets = await file.getBuckets();

        expect(buckets).to.have.length(3);

        expect(buckets).to.include('a');
        expect(buckets).to.include('b');
        expect(buckets).to.include('c');
    })

    it('should not freeze file', async () => {
        let bucket = 'a-bucket';
        let saved = await file.saveOne({bucket});
        expect(Object.isFrozen(saved)).to.be.false;
    })
})