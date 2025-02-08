import {
    composeMutablePolicy,
    DAOPolicy
} from "./BaseDAO.mjs";
import {FILE,} from "./names.mjs";
import {conformFile} from "./conform/conformFile.mjs";
import {getDataFiles} from "../application/services/dataServices.mjs";

const kFile = Symbol(FILE);

export class FileDAO extends DAOPolicy({
    ...composeMutablePolicy(kFile),
    conformVO: conformFile,
}) {
    async selectOne(query) {
        let file;
        if (query.bucketname) {
            file = await getDataFiles(this).queryFileByBucketname(query.bucketname);
        }
        return file;
    }

    async selectMany(query) {
        let files = await getDataFiles(this).queryFilesForAll(query);
        return files;
    }

    async insertOne(data) {
        return await getDataFiles(this).createFile(
            data.bucket,
            data.bucketname, // generate random uuid if not provided
            data.status,     // default to ::created
            data.size,       // default to null
            data.hash,       // default to null
            data.creation    // default to current timestamp
        );
    }

    async updateOne(vo) {
        return await getDataFiles(this).updateFileByBucketname(vo.bucketname,
            vo.size, vo.hash,
            vo.status, vo.creation);
    }
}