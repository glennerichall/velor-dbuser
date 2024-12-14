import {mergeDefaultDatabaseOptions} from "velor-database/application/services/mergeDefaultDatabaseOptions.mjs";
import {factories as defaultFactories} from "./factories.mjs";
import {chain} from "velor-utils/utils/functional.mjs";
import {mergeDefaultServicesOptions} from "velor-services/application/services/mergeDefaultServicesOptions.mjs";


export function mergeDefaultDbUserOptions(options = {}) {
    let {
        factories = {}
    } = options;
    return chain(
        mergeDefaultDatabaseOptions,
        mergeDefaultServicesOptions)(
        {
            ...options,
            factories: {
                ...defaultFactories,
                ...factories,
            },
        });
}