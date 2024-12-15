import {setupTestContext} from "./fixtures/setupTestContext.mjs";
import {
    getAuthDAO,
    getPreferenceDAO,
    getRoleDAO,
    getUserDAO
} from "../application/services/services.mjs";
import {getEventQueue} from "velor-services/application/services/services.mjs";
import {
    ELEMENT_CREATED,
    ELEMENT_DELETED
} from "../models/events.mjs";
import {PREFERENCE} from "../models/names.mjs";

const {
    expect,
    test,
    describe,
    afterEach,
    beforeEach,
    it,
} = setupTestContext();


describe('Model events', () => {
    const profile = {
        profileId: "mi@gmail.com",
        provider: "google.com",
        email: "mi@gmail.com",
        verified: false,
        displayName: "Mi Too",
        lastName: "Too",
        firstName: "Mi",
    };

    let user;

    beforeEach(async ({services}) => {
        let auth = await getAuthDAO(services).saveOne(profile);

        await getRoleDAO(services).saveOne({
            name: 'normal',
            description: 'Normal user with limited rights'
        });

        user = await getUserDAO(services).saveOne(auth)
    })

    it('should raise ELEMENT_CREATED on preferences', async ({services}) => {

        let preference = await getPreferenceDAO(services).saveOne({user, name: 'foo', value: 'bar'});
        let [dao, {name, value, id, userId}] = await getEventQueue(services).waitDequeue(ELEMENT_CREATED,
            data=>data[0] === PREFERENCE);

        expect(dao).to.eq(PREFERENCE);
        expect(name).to.eq('foo');
        expect(value).to.eq('bar');
        expect(id).to.not.be.undefined;
        expect(id).to.eq(preference.id);
        expect(userId).to.eq(user.id);
    })

    it('should raise ELEMENT_DELETED on preferences', async ({services}) => {

        let preference = await getPreferenceDAO(services).saveOne({user, name: 'foo', value: 'bar'});
        await getPreferenceDAO(services).delete(preference);

        let [dao, {name, value, id, userId}] = await getEventQueue(services)
            .waitDequeue(ELEMENT_DELETED);

        expect(dao).to.eq(PREFERENCE);
        expect(name).to.eq('foo');
        expect(value).to.eq('bar');
        expect(id).to.eq(preference.id);
        expect(userId).to.eq(user.id);
    })
})