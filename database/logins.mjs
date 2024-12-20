import {getTableNames} from "../installation/defaultTableNames.mjs";

export function getLoginsSql(schema, tableNames = {}) {
    const {
        userAuths,
        logins,
    } = getTableNames(tableNames);

    const queryForLastUserLoginOnAnyAuthSql = `
        select ${logins}.id, ip, date, fingerprint
        from ${schema}.${userAuths}
            inner join ${schema}.${logins} on ${logins}.auth_id = ${userAuths}.auth_id
        where user_id = $1
          and type = 'login'
        order by date desc
            limit 2
    `;

    const insertEventSql = `
        insert into ${schema}.${logins} (fingerprint, auth_id, ip, type)
        values ($1, $2, $3, $4)
        returning *
    `;

    const queryLoginsForAuthSql = `
       select * from ${schema}.${logins}
       where auth_id = $1  
    `;

    const queryLastLoginForAuthSql = `
       select * from ${schema}.${logins}
       where auth_id = $1
       order by date desc
       limit 1
    `;

    const queryLoginForIdSql = `
        select * from ${schema}.${logins} 
        where id = $1
    `;


    return {
        queryForLastUserLoginOnAnyAuthSql,
        insertEventSql,
        queryLoginsForAuthSql,
        queryLastLoginForAuthSql,
        queryLoginForIdSql,
    };
}

export function composeLoginDataAccess(schema, tableNames = {}) {

    const {
        queryForLastUserLoginOnAnyAuthSql,
        insertEventSql,
        queryLoginsForAuthSql,
        queryLastLoginForAuthSql,
        queryLoginForIdSql,
    } = getLoginsSql(schema, tableNames);

    async function getLastUserLoginOnAnyAuth(client, userId) {
        const res = await client.query(queryForLastUserLoginOnAnyAuthSql, [userId]);
        return res.rowCount === 1 ? res.rows[0] : null;
    }

    async function getAuthLogins(client, authId) {
        const res = await client.query(queryLoginsForAuthSql, [authId]);
        return res.rows;
    }

    async function getLastAuthLogin(client, authId) {
        const res = await client.query(queryLastLoginForAuthSql, [authId]);
        return res.rowCount === 1 ? res.rows[0] : null;
    }

    async function insertEvent(client, {fingerprint, authId, ip, type}) {
        const res = await client.query(insertEventSql, [fingerprint, authId, ip, type]);
        return res.rowCount === 1 ? res.rows[0] : null;
    }

    async function insertLoginEvent(client, data) {
        return insertEvent(client, {
            ...data,
            type: 'login'
        });
    }

    async function getLoginById(client, id) {
        let res = await client.query(queryLoginForIdSql, [id]);
        return res.rowCount === 1 ? res.rows[0] : null;
    }


    async function insertLogoutEvent(client, data) {
        return insertEvent(client, {
            ...data,
            type: 'logout'
        });
    }

    return {
        getLastUserLoginOnAnyAuth,
        insertEvent,
        insertLoginEvent,
        insertLogoutEvent,
        getAuthLogins,
        getLastAuthLogin,
        getLoginById,
    };
}
