import {getEnvValue} from "velor-services/application/services/baseServices.mjs";
import {DATABASE_SCHEMA} from "velor-database/application/services/envKeys.mjs";
import {composeStatements} from "../../database/composeStatements.mjs";

export function createStatementsInstance(services) {
    const schema = getEnvValue(services, DATABASE_SCHEMA);
    return composeStatements(schema);
}