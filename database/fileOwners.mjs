import {getTableNames} from "../installation/defaultTableNames.mjs";

export function getFileOwnersSql(schema, tableNames = {}) {
    const {
        fileOwners,
        files
    } = getTableNames(tableNames);

    return {};

}

export function composeFileOwnersDataAccess(schema, tableNames = {}) {
    const {} = getFileOwnersSql(schema, tableNames);


    const {
        fileOwners,
    } = getTableNames(tableNames);

    const {
        queryFilesForAll
    } = composeFileOwnersDataAccess(schema, tableNames);

    async function queryForUserFiles(client, userId,
                                     filter = {},
                                     sort = 'id asc',
                                     paging = {}) {

        let innerJoin = `inner join ${schema}.${fileOwners} o on f.id = o.file_id`;
        let whereClause = 'o.user_id = $';

        let [query, args] = new Request()
            .select(`${schema}.${files} f`)
            .innerJoin(`${schema}.${fileOwners} o on f.id = o.file_id`)
            .where(
                new Predicate()
                    .all(filter)
                    .and({})
            )
            .orderBy(sort)
            .page(paging)
            .build();

        return queryFilesForAll(filter, );

    }

    return {
        queryForUserFiles
    };
}