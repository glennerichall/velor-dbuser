import {
    getAuthDAO,
    getRoleDAO,
    getUserDAO
} from "../../application/services/services.mjs";

export const users =
    async ({services}, use) => {
        const profile1 = {
            profileId: "mi@gmail.com",
            provider: "google.com",
            email: "mi@gmail.com",
            verified: false,
            displayName: "Mi Too",
            lastName: "Too",
            firstName: "Mi",
            avatar: 'avatoar'
        };

        const profile2 = {
            profileId: "yu@gmail.com",
            provider: "google.com",
            email: "yu@gmail.com",
            verified: false,
            displayName: "Yu Too",
            lastName: "Too",
            firstName: "Yu",
            avatar: 'avatoar'
        };

        await getRoleDAO(services).saveOne({
            name: 'normal',
            description: 'Normal user with limited rights'
        });

        let userDAO = getUserDAO(services);
        let authDAO = getAuthDAO(services);
        let auth1 = await authDAO.saveOne(profile1);
        let auth2 = await authDAO.saveOne(profile2);
        let user1 = await userDAO.saveOne(auth1);
        let user2 = await userDAO.saveOne(auth2);

        use([user1, user2]);

    }