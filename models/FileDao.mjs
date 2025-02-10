import {
    composeMutablePolicy,
    DAOPolicy
} from "./BaseDAO.mjs";
import {FILE,} from "./names.mjs";
import {conformFile} from "./conform/conformFile.mjs";
import {
    getDataFiles,
    getDataUserFiles
} from "../application/services/dataServices.mjs";
import {getUserDAO} from "../application/services/services.mjs";

const kFile = Symbol(FILE);

export class FileDAO extends DAOPolicy({
    ...composeMutablePolicy(kFile),
    conformVO: conformFile,
}) {

    async #getUserId(query) {
        return query.userId ?? await getUserDAO(this).loadId(query.user);
    }

    async selectOne(query) {
        let file;
        if (query.bucketname) {
            if (query.userId || query.user) {
                let userId = await this.#getUserId(query);
                file = await getDataUserFiles(this).queryUserFileByBucketname(userId, query.bucketname);
            } else {
                file = await getDataFiles(this).queryFileByBucketname(query.bucketname);
            }
        }
        return file;
    }

    async selectMany(query = {}) {
        let files;
        if (query.userId || query.user) {
            let userId = await this.#getUserId(query);
            files = await getDataUserFiles(this).queryFilesForUser(userId, query);
        } else {
            files = await getDataFiles(this).queryFilesForAll(query);
        }
        return files;
    }

    async insertOne(data) {
        let file = await getDataFiles(this).createFile(
            data.bucket,
            data.bucketname, // generate random uuid if not provided
            data.status,     // default to ::created
            data.size,       // default to null
            data.hash,       // default to null
            data.creation    // default to current timestamp
        );

        if (data.userId || data.user) {
            let userId = await this.#getUserId(data);
            await getDataUserFiles(this).insertFileOwner(userId, file.id);
            file.owners = [userId];
        }

        return file;
    }

    async updateOne(vo) {
        return await getDataFiles(this).updateFileByBucketname(vo.bucketname,
            vo.size, vo.hash,
            vo.status, vo.creation);
    }
}