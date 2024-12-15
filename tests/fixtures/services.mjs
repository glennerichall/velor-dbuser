import {mergeDefaultDbUserOptions} from "../../application/services/mergeDefaultDbUserOptions.mjs";
import {createAppServicesInstance} from "velor-services/injection/ServicesContext.mjs";
import {getEventQueue} from "velor-services/application/services/services.mjs";
import {
    ELEMENT_CREATED,
    ELEMENT_DELETED
} from "../../models/events.mjs";

export const services =
    async ({servicesOptions}, use) => {

        let options = mergeDefaultDbUserOptions(servicesOptions);
        let services = createAppServicesInstance(options);

        getEventQueue(services)
            .listen(ELEMENT_CREATED)
            .listen(ELEMENT_DELETED);

        await use(services);
    }