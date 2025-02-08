import {getTableNames} from "../installation/defaultTableNames.mjs";
import {tryInsertUnique} from "velor-database/database/tryInsertUnique.mjs";

// export function buildWhereClause(filter, tableName) {
//     let clauses = [];
//     let index = 1;
//     for (let key in filter) {
//         let value = filter[key];
//         if (value !== undefined) {
//             clauses.push(`(${tableName}.${key} = \$${index})\n`);
//             index++;
//         }
//     }
//     return clauses.join(' AND ');
// }

export function getFilesSql(schema, tableNames = {}) {
    const {
        files,
        filestatus,
    } = getTableNames(tableNames);

    const queryFileByBucketnameSql = `
        select * from ${schema}.${files}
        where bucketname = $1
    `;

    const queryFileByIdSql = `
        select * from ${schema}.${files}
        where id = $1
    `;

    const createFileSql = `
        insert into ${schema}.${files}
        (bucket, bucketname, status, size, hash, creation)
        values (
            $1, 
            COALESCE($2, gen_random_uuid()::text), 
            COALESCE($3, 'created'::"${schema}".${filestatus}), 
            $4,
            $5,
            COALESCE($6, CURRENT_TIMESTAMP))
        returning *
    `;

    const updateFileSql = `
        update ${schema}.${files}
        set status = COALESCE($3::${schema}.${filestatus}, status),
            size   = COALESCE($2, size),
            hash   = COALESCE($4, hash),
            creation = COALESCE($5, creation)
        where bucketname = $1
        returning *
    `;

    const queryFilesForAllSql = ({
                                     bucket, hash,
                                     minSize, maxSize,
                                     minDate, maxDate,
                                     status, filename,
                                     bucketname,
                                     sort = 'id asc',
                                     page, perPage,
                                 } = {}) => {
        if (filename) {
            filename = "%" + filename + "%";
        }

        if (bucketname) {
            bucketname = "%" + bucketname + "%";
        }

        if (status !== null && status !== undefined) {
            if (!Array.isArray(status)) {
                status = [status];
            }
        }

        let args = [];
        let where = [];
        let select = `select * from ${schema}.${files} f`;
        let orderBy = '';
        let offset = '';
        let limit = '';

        if (sort) {
            orderBy = `order by ${sort}`;
        }

        if (bucket) {
            args.push(bucket);
            where.push(` f.bucket = \$${args.length}`);
        }

        if (hash) {
            args.push(hash);
            where.push(`f.hash = \$${args.length}`);
        }

        if (minSize) {
            args.push(minSize);
            where.push(`f.size >= \$${args.length}`);
        }

        if (maxSize) {
            args.push(maxSize);
            where.push(`f.size <= \$${args.length}`);
        }

        if (minDate) {
            args.push(minDate);
            where.push(`f.creation >= \$${args.length}`);
        }

        if (maxDate) {
            args.push(maxDate);
            where.push(`f.creation >= \$${args.length}`);
        }

        if (status) {
            args.push(status);
            where.push(`f.status = ANY(\$${args.length}::${schema}.${filestatus}[])`);
        }

        if (filename) {
            args.push(filename);
            where.push(`f.filename ILIKE \$${args.length}`);
        }

        if (bucketname) {
            args.push(bucketname);
            where.push(`f.bucketname ILIKE \$${args.length}`);
        }

        where = "where " + where.join('\nAND ');

        if (page !== null && page !== undefined &&
            perPage !== null && perPage !== undefined) {

            args.push(perPage);
            limit = `limit \$${args.length}`;

            args.push((page - 1) * perPage);
            offset = `offset \$${args.length}`;
        }

        return {
            select,
            where,
            orderBy,
            limit,
            offset,
            args
        };

    };

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
        createFileSql,
        updateFileSql,
        queryFilesForAllSql,
        deleteByBucketnameSql,
        deleteAllFilesSql,
        deleteOldFilesSql,
        queryForUnprocessedSql,
        deleteByBucketnamesSql,
        keepByBucketnamesSql,
        queryFileByBucketnameSql,
        queryFileByIdSql,

    };
}

export function composeFilesDataAccess(schema, tableNames = {}) {
    const {
        createFileSql,
        updateFileSql,
        queryFilesForAllSql,
        deleteByBucketnameSql,
        deleteAllFilesSql,
        deleteOldFilesSql,
        queryForUnprocessedSql,
        deleteByBucketnamesSql,
        keepByBucketnamesSql,
        queryFileByBucketnameSql,
        queryFileByIdSql,

    } = getFilesSql(schema, tableNames);

    async function queryFileById(client, id) {
        let res = await client.query(queryFileByIdSql, [id]);
        return res.rowCount >= 1 ? res.rows[0] : null;
    }

    async function queryFileByBucketname(client, bucketname) {
        let res = await client.query(queryFileByBucketnameSql, [bucketname]);
        return res.rowCount >= 1 ? res.rows[0] : null;
    }

    async function createFile(client, bucket, bucketname, status, size, hash, creation) {
        const args = [bucket, bucketname, status, size, hash, creation];
        if (bucketname) {
            const res = await client.query(createFileSql, args);
            return res.rowCount >= 1 ? res.rows[0] : null;
        }
        return tryInsertUnique(client, createFileSql, args);
    }

    async function updateFileByBucketname(client, bucketname, size, hash, status, creation) {
        const res = await client
            .query(updateFileSql, [bucketname, size, status, hash, creation]);
        return res.rowCount >= 1 ? res.rows[0] : null;
    }

    async function queryFilesForAll(client, query = {}) {

        const {
            select,
            where,
            orderBy,
            limit,
            offset,
            args
        } = queryFilesForAllSql(query)

        let querySql = `
            ${select}
            ${where}
            ${orderBy}
            ${offset}
            ${limit}
        `;

        const res = await client.query(querySql, args);
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


    return {
        queryFileByBucketname,
        queryFileById,
        createFile,
        updateFileByBucketname,
        queryFilesForAll,
        deleteByBucketname,
        deleteAllFiles,
        deleteOldFiles,
        queryForUnprocessed,
        deleteByBucketnames,
        keepByBucketnames,
    };
}