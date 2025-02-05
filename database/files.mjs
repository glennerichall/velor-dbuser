import {getTableNames} from "../installation/defaultTableNames.mjs";
import {tryInsertUnique} from "velor-database/database/tryInsertUnique.mjs";

export function getFilesSql(schema, tableNames = {}) {
    const {
        files,
        filestatus,
    } = getTableNames(tableNames);

    const queryFileByBucketnameSql = `
        select * from ${schema}.${files}
        where bucketname = $1
    `;

    const queryFilesByHashSql = `
        select * from ${schema}.${files}
        where hash = $1
    `;

    const createFile1Sql = `
        insert into ${schema}.${files}
        (bucket, bucketname)
        values ($1, $2)
        returning *
    `;

    const createFile2Sql = `
        insert into ${schema}.${files}
        (bucket, bucketname)
        values ($1, gen_random_uuid())
        returning *
    `;

    const updateSetUploadedSql = `
        update ${schema}.${files}
        set status = 'uploaded'::${schema}.${filestatus}
        where bucketname = $1
            and status = 'created'::${schema}.${filestatus}
        returning *
    `;

    const updateSetDatetimeSql = `
        update ${schema}.${files}
        set creation = $2
        where bucketname = $1
    `;

    const updateSetStatusSql = `
        update ${schema}.${files}
        set status = $3::${schema}.${filestatus},
            size   = COALESCE($2, size),
            hash   = COALESCE($4, hash)
        where bucketname = $1
    `;

    const queryFilesForAllSql = `
        select * from ${schema}.${files}
        where bucket = $1
    `;

    const deleteByBucketnameSql = `
        delete from ${schema}.${files}
        where bucketname = $1
    `;

    const deleteAllFilesSql = `
        delete
       from ${schema}.${files}
       where bucket = $1
    `;

    const deleteOldFilesSql = `
        delete from ${schema}.${files}
        where bucket = $2 and
            (status = 'uploading'::${schema}.${filestatus}
            or status = 'created'::${schema}.${filestatus})
          and DATE_PART('day', current_timestamp - creation) >= $1
        returning *
    `;

    const queryForUnprocessedSql = `
        select *
        from ${schema}.${files}
        where (status = 'uploading'::${schema}.${filestatus}
            or status = 'created'::${schema}.${filestatus}
            or status = 'uploaded'::${schema}.${filestatus}
            )
          and (
                DATE_PART('day', current_timestamp - creation) >= $1
                or creation is NULL
            )
        order by id
    `;

    const deleteByBucketnamesSql = `
        delete
        from ${schema}.${files}
        where bucketname = any ($1::text[])
    `;

    const keepByBucketnamesSql = `
        delete
        from ${schema}.${files}
        where bucketname <> all ($1::text[])
    `;

    return {
        queryFilesByHashSql,
        createFile1Sql,
        createFile2Sql,
        updateSetUploadedSql,
        updateSetDatetimeSql,
        updateSetStatusSql,
        queryFilesForAllSql,
        deleteByBucketnameSql,
        deleteAllFilesSql,
        deleteOldFilesSql,
        queryForUnprocessedSql,
        deleteByBucketnamesSql,
        keepByBucketnamesSql,
        queryFileByBucketnameSql,

    };
}

export function composeFilesDataAccess(schema, tableNames = {}) {
    const {
        queryFilesByHashSql,
        createFile1Sql,
        createFile2Sql,
        updateSetUploadedSql,
        updateSetDatetimeSql,
        updateSetStatusSql,
        queryFilesForAllSql,
        deleteByBucketnameSql,
        deleteAllFilesSql,
        deleteOldFilesSql,
        queryForUnprocessedSql,
        deleteByBucketnamesSql,
        keepByBucketnamesSql,
        queryFileByBucketnameSql,

    } = getFilesSql(schema, tableNames);

    async function queryFileByBucketname(client, bucketname) {
        let res = await client.query(queryFileByBucketnameSql, [bucketname]);
        return res.rowCount >= 1 ? res.rows[0] : null;
    }

    async function queryFilesByHash(client, hash) {
        const res = await client.query(queryFilesByHashSql, [hash]);
        return res.rows;
    }

    async function createFile(client, bucket, bucketname) {
        if (bucketname) {
            const res = await client
                .query(createFile1Sql, [bucket, bucketname]);
            return res.rowCount >= 1 ? res.rows[0] : null;
        }
        return tryInsertUnique(client, createFile2Sql, [bucket]);
    }

    async function updateSetUploaded(client, bucketname) {
        const res = await client
            .query(updateSetUploadedSql, [bucketname]);
        return res.rowCount >= 1 ? res.rows[0] : null;
    }

    async function updateSetDatetime(client, bucketname, creation) {
        const res = await client
            .query(updateSetDatetimeSql, [bucketname, creation]);
        return res.rowCount;
    }

    async function updateSetStatus(client, bucketname, size, hash, status) {
        const res = await client
            .query(updateSetStatusSql, [bucketname, size, status, hash]);
        return res.rowCount;
    }

    async function queryFilesForAll(client, bucket) {
        const res = await client
            .query(queryFilesForAllSql, [bucket]);
        return res.rows;
    }

    async function deleteByBucketname(client, bucketname) {
        const res = await client
            .query(deleteByBucketnameSql, [bucketname]);
        return res.rowCount;
    }

    async function deleteAllFiles(client, bucket) {
        const res = await client
            .query(deleteAllFilesSql, [bucket]);
        return res.rowCount;
    }

    async function deleteOldFiles(client, bucket, numDays) {
        const res = await client
            .query(deleteOldFilesSql, [numDays, bucket]);
        return res.rowCount;
    }

    async function queryForUnprocessed(client, numDays) {
        const res = await client.query(queryForUnprocessedSql, [numDays]);
        return res.rows;
    }

    async function deleteByBucketnames(client, bucketnames) {
        const res = await client
            .query(deleteByBucketnamesSql, [bucketnames]);
        return res.rowCount;
    }

    async function keepByBucketnames(client, bucketnames) {
        const res = await client
            .query(keepByBucketnamesSql, [bucketnames]);
        return res.rowCount;
    }

    async function updateSetDone(client, bucketname, size, hash) {
        return updateSetStatus(client, bucketname, size, hash, 'ready');
    }

    async function updateSetRejected(client, bucketname, size, hash) {
        return updateSetStatus(client, bucketname, size, hash, 'rejected');
    }


    return {
        queryFileByBucketname,
        queryFilesByHash,
        createFile,
        updateSetUploaded,
        updateSetDatetime,
        updateSetStatus,
        queryFilesForAll,
        deleteByBucketname,
        deleteAllFiles,
        deleteOldFiles,
        queryForUnprocessed,
        deleteByBucketnames,
        keepByBucketnames,
        updateSetDone,
        updateSetRejected,
    };
}