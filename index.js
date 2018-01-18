const Logger = require('logplease');
const logger = Logger.create('orbit-db-http-server', {color: Logger.Colors.Yellow});
const tortilla = require('tortilla-api');
const startIpfsAndOrbitDB = require('./src/start-ipfs-and-orbitdb');
let orbitdb, ipfs;


async function onServerStart() {
    const orbitServer = await startIpfsAndOrbitDB();
    orbitdb = orbitServer.orbitdb;
    ipfs = orbitServer.ipfs;
}

async function onTerminate() {
    logger.info('Terminating OrbitDb');
    await orbitdb.disconnect();
    await ipfs.stop(() => {
    });
}

const useOrbitDB = (req, res, next) => {
    req.orbitdb = orbitdb;
    next();
};


tortilla.create(
    {
        appRoot: __dirname,
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
        errorHandler:(statusCode, message,reply)=>{
            if (message.includes('doesn\'t exist')) {
                return reply.notFound(message);
            } else if (message.includes('already exists')) {
                return reply.badRequest(message);
            } else if (message.includes('If you want to create a database')) {
                return reply.notFound(message);
            } else if (message.includes('Not allowed to write')){
                return reply.forbidden(message);
            }
            return reply(statusCode,message);
        }
    }
);


