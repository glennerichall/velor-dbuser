import {mergeDefaultDbUserOptions} from "../../application/services/mergeDefaultDbUserOptions.mjs";
import {
    createAppServicesInstance,
    getInstanceBinder
} from "velor-services/injection/ServicesContext.mjs";
import {getEventQueue} from "velor-services/application/services/services.mjs";
import {
    ELEMENT_CREATED,
    ELEMENT_DELETED
} from "../../models/events.mjs";
import {getDatabase} from "velor-database/application/services/services.mjs";
import {s_database} from "velor-database/application/services/serviceKeys.mjs";

export const services =
    async ({servicesOptions}, use) => {

        let options = mergeDefaultDbUserOptions(servicesOptions);
        let services = createAppServicesInstance(options);

        // shadow the real database with a transaction
        let database = getDatabase(services);

        database = await database.beginTransact();

        getInstanceBinder(services)
            .setInstance(s_database, database);

        getEventQueue(services)
            .listen(ELEMENT_CREATED)
            .listen(ELEMENT_DELETED);

        await use(services);

        await database.rollback();
    }
