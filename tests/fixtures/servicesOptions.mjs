import {mergeDefaultDbUserOptions} from "../../application/services/mergeDefaultDbUserOptions.mjs";
import {s_poolManager} from "velor-database/application/services/serviceKeys.mjs";
import {s_logger} from "velor-services/application/services/serviceKeys.mjs";
import {noOpLogger} from "velor-utils/utils/noOpLogger.mjs";
import {DATABASE_SCHEMA} from "velor-database/application/services/envKeys.mjs";
import {LOG_LEVEL} from "velor-services/application/services/envKeys.mjs";

export const servicesOptions = async ({configs, databaseConnectionPool}, use)=> {
    const {
        schema,
    } = configs;

    const {
        pool
    } = databaseConnectionPool;

    let options = mergeDefaultDbUserOptions(
        {
            factories: {
                [s_poolManager]: () => pool,
                [s_logger]: () => noOpLogger,
            },
            env: {
                [DATABASE_SCHEMA]: schema,
                [LOG_LEVEL]: "debug",
                ...process.env
            }
        });

    await use(options);
}