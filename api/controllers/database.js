const Wrapper = require('../../src/wrapper');
const {get} = require('lodash');

const validateDbType = (db, acceptedTypes) => {
    const dbType = db.type;
    const validate = acceptedTypes.reduce((accumulator, currentValue) => {
        return accumulator || currentValue === dbType;
    }, false);
    if (!validate)
        throw new Error('Not a valid db type for method');
};

module.exports = {

    get: Wrapper.wrap(async helper => {
        const address = helper.req.dbAddress;

        // Get params on how we should output the results
        const shouldStream = get(helper, 'req.query.live', false);

        // Set the limit on how many entries we should return in the result
        const limit = get(helper, 'req.query.limit', -1);

        // Open the requested database
        const db = await helper.orbitdb.open(address, {
            create: false,
            sync: true,
            localOnly: !shouldStream,
        });

        // Load the database
        await db.load();

        validateDbType(db, ['log', 'feed', 'counter']);

        const query = () => db.iterator({limit: limit}).collect();

        return helper.reply.ok(query());
    }),

    create: Wrapper.wrap(async helper => {
        // Get the name and type from the request
        const type = helper.req.getParam('type');
        const name = helper.req.getParam('name');
        const indexBy = helper.req.getParam('indexBy');


        let properties = {write: ['*']};

        if (type === 'docstore' && indexBy) {
            properties = {
                ...properties,
                indexBy
            };
        }

        // Create the database
        const db = await helper.req.orbitdb.create(name, type, properties);

        helper.reply.created(db.address.toString());
    }),

    add: Wrapper.wrap(async helper => {
        const address = helper.req.dbAddress;
        const isStream = helper.req.headers['content-type'] !== 'application/json';

        const db = await helper.orbitdb.open(address, {
            create: false,
            sync: false,
        });

        await db.load();

        validateDbType(db, ['log', 'feed', 'counter']);

        let result;
        const dbType = db.type;
        let data;
        const type = helper.req.getParam('value');
        switch (dbType) {
            case 'counter':
                if (type) {
                    result = await db.inc(type);

                } else {
                    result = await db.inc();
                }
                break;
            case 'log':
            case 'feed':
                if (isStream) {
                    data = get(helper, 'req.files');
                } else {
                    data = helper.req.body;
                }
                if (!data)
                    throw new Error('Database entry was undefined');
                result = await db.add(data);
        }


        return helper.reply.created(result);
    }),

    addKeyValue: Wrapper.wrap(async helper => {

        const key = helper.req.getParam('key');
        const address = helper.req.dbAddress;

        const isStream = helper.req.headers['content-type'] !== 'application/json';
        let data;
        if (isStream) {
            data = get(helper, 'req.files');
        } else {
            data = helper.req.body;
        }

        // Open the requested database
        const db = await helper.orbitdb.open(address, {
            create: false,
            sync: false,
        });

        // Load the database
        await db.load();

        validateDbType(db, ['keyvalue', 'docstore']);

        let result;
        const dbType = db.type;
        switch (dbType) {
            case 'docstore':
                result = await db.put({
                    _id: key,
                    ...data
                });
                break;
            case 'keyvalue':
                result = await db.put(key, data);
                break;
        }
        return helper.reply.created(result);
    }),

    getByKey: Wrapper.wrap(async helper => {
        const key = helper.req.getParam('key');
        const address = helper.req.dbAddress;
        const shouldStream = get(helper, 'req.query.live', false);

        const db = await helper.orbitdb.open(address, {
            create: false,
            sync: true,
            localOnly: !shouldStream,
        });

        await db.load();

        validateDbType(db, ['log', 'feed', 'keyvalue', 'docstore']);

        const event = db.get(key);

        helper.reply.ok(event);
    })
};
