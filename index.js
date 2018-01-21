const {get, noop} = require('lodash');
const tortilla = require('tortilla-api');
const startIpfsAndOrbitDB = require('./src/start-ipfs-and-orbitdb');
const Logger = require('logplease');
const config = require('config');
Logger.setLogLevel(get(config,'loglevel','INFO'));

let orbitdb, ipfs;


async function onServerStart() {
    const orbitServer = await startIpfsAndOrbitDB();
    orbitdb = orbitServer.orbitdb;
    ipfs = orbitServer.ipfs;
}

async function onTerminate() {
    get(orbitdb, 'logger.info', noop)('Terminating OrbitDb');
    await orbitdb.disconnect();
    await ipfs.stop(() => {
    });
}

const useOrbitDB = (req, res, next) => {
    const logger = req.logger;
    req.orbitdb = {
        ...orbitdb,
        open: function (address, options) {
            return orbitdb.open(address, {logger, ...options});
        },
        create: function (name, type, options) {
            return orbitdb.create(name, type, {logger, ...options});
        }
    };
    next();
};


const serverLogger = () => {

    const logger = Logger.create('orbit-db-http-server', {color: Logger.Colors.Yellow});
    return logger;
};


tortilla.create(
    {
        appRoot: __dirname,
        logger: () => {
            const guid = require('guid');
            const logplease = require('logplease');
            const defaultLogger = logplease.create(`Request:${guid.raw()}`, {color: logplease.Colors['Magenta']});
            return defaultLogger;
        }
    },
    {
        onServerStart,
        onTerminate,
        middleware: [
            useOrbitDB
        ]
    },
    {
        props: (req) => {
            const multihash = req.getParam('multihash');
            const name = req.getParam('name');
            const dbAddress = `/orbitdb/${multihash}/${name}`;
            return {
                orbitdb: req.orbitdb,
                dbAddress
            };
        },
        errorHandler: (statusCode, message, reply) => {
            if (message.includes('doesn\'t exist')) {
                return reply.notFound(message);
            } else if (message.includes('already exists')) {
                return reply.badRequest(message);
            } else if (message.includes('If you want to create a database')) {
                return reply.notFound(message);
            } else if (message.includes('Not allowed to write')) {
                return reply.forbidden(message);
            }
            return reply(statusCode, message);
        }
    },
    serverLogger()
);


