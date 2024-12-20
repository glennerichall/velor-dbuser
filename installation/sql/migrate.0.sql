alter table "@{SCHEMA}".@{TABLE_USER_ROLE}
    alter column "role" set not null;

alter table "@{SCHEMA}".@{TABLE_USER_ROLE}
    rename column "role" to role_id;

alter table "@{SCHEMA}".@{TABLE_USER_ROLE}
    alter column "user" set not null;

alter table "@{SCHEMA}".@{TABLE_USER_ROLE}
    rename column "user" to user_id;

alter table "@{SCHEMA}".@{TABLE_ROLE_ACL}
    rename column "role" to role_id;

alter table "@{SCHEMA}".@{TABLE_ROLE_ACL}
    rename column "acl" to acl_id;

create unique index users_primary_auth_id_uindex
    on "@{SCHEMA}".@{TABLE_USERS} ("primary_auth_id");