export function conformAccess(access) {
    if (!access) return null;

    return {
        ip: access.ip ?? access.ip_address ?? access.ipaddress ?? access.ipAddress ?? null,
        url: access.url ?? access.path ??access.resource ?? null,
        method: access.method ?? null,
        fingerprint: access.fingerprint ?? null,
        backendVersion: access.backendVersion ?? access.backend_version ??  access.backendversion ?? access.bv ?? null,
        frontendVersion: access.frontendVersion ?? access.frontend_version ??  access.frontendversion ?? access.fv ?? null,
        userId: access.userId ?? access.userid ?? access.user_id ?? access.user ?? null,
        loggedIn: access.loggedIn ?? access.logged_in ?? access.loggedin ?? access.logged ?? null
    };
}