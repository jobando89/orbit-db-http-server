//TODO how to add query for docs on get

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

        //Setting up options
        const gt = helper.req.getParam('gt');
        const gte = helper.req.getParam('gte');
        const lt = helper.req.getParam('lt');
        const lte = helper.req.getParam('lte');
        const limit = helper.req.getParam('limit', -1);
        const reverse = helper.req.getParam('reverse', false);
        const iteratorOptions = {
            gt,
            gte,
            lt,
            lte,
            limit,
            reverse,
        };

        // Open the requested database
        const db = await helper.orbitdb.open(address, {
            create: false,
            sync: true,
            //localOnly: !shouldStream, TODO WHAT IS THIS?
        });

        // Load the database
        await db.load();

        validateDbType(db, ['log', 'feed', 'counter']);

        let result;
        switch (db.type) {
            case 'counter':
                result = db.value;
                break;
            default:
                result = db.iterator(iteratorOptions).collect();
                break;
        }

        //Return results
        return helper.reply.ok(result);
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
    }),

    deleteKeyValue: Wrapper.wrap(async helper => {

        const key = helper.req.getParam('key');
        const address = helper.req.dbAddress;

        const db = await helper.orbitdb.open(address, {
            create: false,
            sync: false,
        });

        await db.load();

        validateDbType(db, ['feed', 'docstore']);

        const dbType = db.type;

        switch (dbType) {
            case 'feed':
                await db.remove(key);
                break;
            case 'docstore':
                await db.del(key);
                break;
        }

        return helper.reply.ok();
    }),
};
