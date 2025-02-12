import {
    getDataRoles,
    getDataUsers
} from "../application/services/dataServices.mjs";
import {conformRole} from "./conform/conformRole.mjs";
import {
    composeImmutablePolicy,
    DAOPolicy
} from "./BaseDAO.mjs";
import {
    getRuleDAO,
    getUserDAO
} from "../application/services/services.mjs";
import {ROLE} from "./names.mjs";

const kRole = Symbol(ROLE);


export class RoleDAO extends DAOPolicy({
    ...composeImmutablePolicy(kRole),
    conformVO: conformRole,
}) {
    async selectOne(query) {
        let role;
        if (query.id) {
            role = await getDataRoles(this).getRoleById(query.id);
        } else if (query.name) {
            role = await getDataRoles(this).getRoleByName(query.name);
        }
        return role;
    }

    async selectMany(query) {
        let roles;
        if (query.id || query.name) {
            let role = await this.selectOne(query);
            if (role) {
                roles = [role];
            } else {
                roles = [];
            }

        } else if (query.user) {
            let userId = await getUserDAO(this).loadId(query.user);
            roles = await getDataUsers(this).getUserRolesByUserId(userId);
        }

        return roles;
    }

    async getRoleName(role) {
        if (role?.name) {
            return role.name;
        }
        role = await this.loadOne(role);
        return role.name;
    }

    async addAclRule(role, rule) {
        let roleName = await this.getRoleName(role);
        let ruleName = await getRuleDAO(this).getRuleName(rule);
        await getDataRoles(this).addAclRuleToRole(roleName, ruleName);
    }

    async getAclRules(role, ...categories) {
        let name = await this.getRoleName(role);
        return getRuleDAO(this).loadMany({
            role: {name},
            categories
        });
    }

    async insertOne(data) {
        return getDataRoles(this).createRole(data.name, data.description);
    }
}