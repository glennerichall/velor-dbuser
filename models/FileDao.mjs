import {DAOPolicy} from "./BaseDAO.mjs";
import {FILE,} from "./names.mjs";
import {conformFile} from "./conform/conformFile.mjs";
import {getDataFiles} from "../application/services/dataServices.mjs";

const fileSym = Symbol(FILE);

export class FileDAO extends DAOPolicy({
    symbol: fileSym,
    conformVO: conformFile,
    loadBeforeSave: true,
}) {
    async selectOne(query) {
        let file;
        if (query.bucketname) {
            file = await getDataFiles(this).queryFileByBucketname(query.bucketname);
        }
        return file;
    }

    async selectMany(query) {
        let files;
        if (query.bucket) {
            files = await getDataFiles(this).queryFilesForAll(query.bucket);
        } else if (query.hash) {
            files = await getDataFiles(this).queryFilesByHash(query.hash);
        }
        return files;
    }

    async insertOne(vo) {
       return await getDataFiles(this).createFile(vo.bucket, vo.bucketname);
    }
}