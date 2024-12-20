export function conformLogin(login) {
    if (!login) return null;

    return {
        authId: login.authId ?? login.auth_id ?? login.authid ?? null,
        type: login.type,
    }
}