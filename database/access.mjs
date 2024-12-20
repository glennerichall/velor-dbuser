import {getTableNames} from "../installation/defaultTableNames.mjs";

export function getAccessSql(schema, tableNames = {}) {
    const {
        access,
    } = getTableNames(tableNames);

    const insertAccessSql = `insert into ${schema}.${access}
                        (fingerprint, ip, resource, method, bv, fv, user_id, logged_in)
                    values ($1, $2, $3, $4, $5, $6, $7, $8)
                    returning *`;

    const selectAllSql = `select * from ${schema}.${access}`;

    return {
        insertAccessSql,
        selectAllSql,
    };
}

export function composeAccessDataAccess(schema, tableNames = {}) {

    const {
        insertAccessSql,
        selectAllSql,
    } = getAccessSql(schema, tableNames);

    async function insertAccess(client, {
        ip,
        url,
        method,
        fingerprint,
        backendVersion,
        frontendVersion,
        userId,
        loggedIn
    }) {
        const res = await client.query(insertAccessSql,
            [
                fingerprint, ip, url, method,
                backendVersion, frontendVersion, userId,
                loggedIn
            ]);

        return res.rowCount === 1 ? res.rows[0] : null;
    }


    async function selectAll(client) {
        const res = await client.query(selectAllSql);
        return res.rows;
    }


    return {
        insertAccess,
        selectAll,
    };
}
