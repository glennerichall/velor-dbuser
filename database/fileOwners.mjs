import {getTableNames} from "../installation/defaultTableNames.mjs";
import {getFilesSql} from "./files.mjs";

export function getFileOwnersSql(schema, tableNames = {}) {
    const {
        fileOwners,
        files
    } = getTableNames(tableNames);


    const insertFileOwnerSql = `
        insert into ${schema}.${fileOwners}
        (file_id, user_id)
        values ($1, $2)
    `;

    const queryUserFileByBucketnameSql = `
        select * from ${schema}.${files} f
        inner join ${schema}.${fileOwners} o on o.file_id = f.id
        where f.bucketname = $1 and
              o.user_id = $2
    `;

    return {
        insertFileOwnerSql,
        queryUserFileByBucketnameSql,
    };

}

export function composeFileOwnersDataAccess(schema, tableNames = {}) {
    const {
        insertFileOwnerSql,
        queryUserFileByBucketnameSql,
    } = getFileOwnersSql(schema, tableNames);


    const {
        fileOwners,
    } = getTableNames(tableNames);

    const {
        queryFilesForAllSql
    } = getFilesSql(schema, tableNames);

    async function queryFilesForUser(client, userId, query) {
        let {
            select,
            where,
            orderBy,
            limit,
            offset,
            args
        } = queryFilesForAllSql(query);

        let innerJoin = `inner join ${schema}.${fileOwners} o on f.id = o.file_id`;

        args.push(userId);

        if (!where) {
            where = "where "
        } else {
            where += ' AND ';
        }
        where += `o.user_id = \$${args.length}`;

        let querySql = `
            ${select}
            ${innerJoin}
            ${where}
            ${orderBy}
            ${offset}
            ${limit}
        `;

        let res = await client.query(querySql, args);
        return res.rows;
    }

    async function deleteAllFilesForUser(client, userId, query) {
        let {
            remove,
            where,
            args
        } = queryFilesForAllSql(query);

        let innerJoin = `using ${schema}.${fileOwners} o`;

        args.push(userId);

        if (!where) {
            where = "where "
        } else {
            where += ' AND ';
        }
        where += `o.user_id = \$${args.length} AND f.id = o.file_id`;

        let querySql = `
            ${remove}
            ${innerJoin}
            ${where}
        `;

        let res = await client.query(querySql, args);
        return res.rowCount;
    }

    async function insertFileOwner(client, userId, fileId) {
        const res = await client.query(insertFileOwnerSql, [fileId, userId]);
        return res.rowCount;
    }

    async function queryUserFileByBucketname(client, userId, bucketname) {
        const res = await client.query(queryUserFileByBucketnameSql, [bucketname, userId]);
        return res.rowCount === 1 ? res.rows[0]: null;
    }

    return {
        queryFilesForUser,
        insertFileOwner,
        queryUserFileByBucketname,
        deleteAllFilesForUser,
    };
}