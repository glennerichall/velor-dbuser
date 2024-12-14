import {mergeDefaultDbUserOptions} from "../../application/services/mergeDefaultDbUserOptions.mjs";
import {createAppServicesInstance} from "velor-services/injection/ServicesContext.mjs";

export const services =
    async ({servicesOptions}, use) => {

        let options = mergeDefaultDbUserOptions(servicesOptions);
        let services = createAppServicesInstance(options);

        await use(services);
    }