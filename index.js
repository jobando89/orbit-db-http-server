const { merge, pick, noop, get, set, isNil, castArray, has} = require('lodash');
const Promise = require('bluebird');
const swaggerRestify = require('swagger-restify-mw');
const restify = require('restify');
const path = require('path');
const swaggerParser = require('swagger-parser');
const config = require('config');
const startIpfsAndOrbitDB = require('./src/start-ipfs-and-orbitdb');
const bodyParser = require('body-parser');
const busboyBodyParcer = require('busboy-body-parser');
const Logger = require('logplease');
const logger = Logger.create('Main Application', {color: Logger.Colors.Yellow});

Logger.setLogLevel(get(config,'loglevel','INFO'));

let orbitdb, ipfs ;

module.exports = create();


async function create() {

    const context = {
        env: process.env,
        config,
        internal: {
            definition: {
                name: '',
                version: '0.0',
                appRoot: __dirname,
                port: 37373
            },
        }
    };
    const initialize = () => Object.assign({}, context);
    const terminateTimeout = 5000;
    const error = noop;
    registerErrorHandler(error);

    try {
        const result = initialize();
        await registerTerminationHandler(terminate, terminateTimeout, result);
        start(result);
    } catch (err) {
        logger.error({err}, 'Service failed to start');
        process.exit(exitCode.startFailed);
    }
}

async function start(context) {
    const slimDefinition = pick(context.internal.definition, 'name', 'version', 'port');
    logger.info({definition: slimDefinition}, 'Starting API %s %s', slimDefinition.name, slimDefinition.version);

    const orbitServer = await startIpfsAndOrbitDB();
    orbitdb = orbitServer.orbitdb;
    ipfs  = orbitServer.ipfs;
    await loadSwaggerYaml(context);
    createServer(context);
    await swaggerize(context);
    await listen(context);


    return get(context, ['restify', 'server']);
}

async function loadSwaggerYaml(context) {
    const appRoot = context.internal.definition.appRoot;
    const swaggerPath = path.join(appRoot, 'api/swagger/swagger.yaml');
    const swaggerDefinition = await swaggerParser.dereference(swaggerPath);
    set(context, ['swagger', 'definition'], swaggerDefinition);
    global.swaggerDefinition = swaggerDefinition;
}

function createServer(context) {
    logger.debug('Creating restify server');
    const server = restify.createServer(Object.assign(
        pick(context.internal.definition, 'name', 'formatters')
    ));
    server.on('uncaughtException', (req, res, route, err) => {
        logger.error({route, err}, 'An unhandled exception has occurred');
        res.send(500, 'An internal error has occurred, see the api log for more details.');
    });
    server.use(useOrbitDB);
    server.use(bodyParser.json());
    server.use(busboyBodyParcer());
    set(context, ['restify', 'server'], server);
}

async function swaggerize(context) {
    logger.debug('Loading swagger definition');
    const create = Promise.promisify(swaggerRestify.create);

    const fittingsPath = path.resolve(`${__dirname}/fittings`);
    const swaggerConfig = require('./config/defaultSwaggerConfig.json');
    castArray(get(swaggerConfig, 'fittingsDirs', [])).push(fittingsPath);

    const cors = [
        get(context, 'config.cors'),
        get(context, 'env.NODE_ENV', '').toLowerCase() === 'local_dev' ? true : null,
        false
    ].find(x => !isNil(x));
    set(swaggerConfig, 'bagpipes._preflight.cors', cors);

    const options = merge(
        {},
        swaggerConfig,
        get(context, 'config.swagger', {}),
        {
            swagger: context.swagger.definition,
            appRoot: context.internal.definition.appRoot
        }
    );
    const swagger = await create(options);
    logger.debug('Swagger definition loaded, registering routes with restify server');
    swagger.register(context.restify.server);
    set(context, ['swagger', 'server'], swagger);
}

async function listen(context) {
    logger.info('Starting restify server');
    const port = context.internal.definition.port;
    const server = context.restify.server;
    const listen = Promise.promisify(server.listen, {context: server});
    await listen(port);
    logger.info(`API started, now listening on ${port}`);
}

async function terminate(context) {
    logger.info('Shutting down API');
    await has(context, ['resources', 'settingsCache']) ? context.resources.settingsCache.close() : Promise.resolve();
    await orbitdb.disconnect();
    await ipfs.stop(() => {});




    logger.info('Clean shutdown successful');
}

async function registerTerminationHandler(terminate, timeout, res) {
    async function onSignal() {
        logger.info('Shutdown signalled, executing terminate function');
        Promise.race([
            Promise.delay(timeout).then(() => logger.warn('Cleanup taking too long, forcing exit!')),
            async () => {
                try {
                    await terminate(res);
                } catch (err) {
                    logger.error({err}, 'An error occurred in terminate handler');
                }
            }
        ]);
        process.exit(exitCode.success);
    }

    const signals = [
        'SIGINT',
        'SIGTERM',
        'SIGQUIT',
        'SIGHUP'
    ];
    signals.forEach(sig => process.on(sig, onSignal));
}

function registerErrorHandler(callback = noop) {

    function unhandledError(err) {
        logger.error({err: err}, 'An unhandled error has occurred');
        return Promise.try(() => callback(err))
            .catch(err => logger.error({err}, 'Exception handler failed'))
            .finally(() => process.exit(exitCode.uncaughtError));
    }

    process.on('uncaughtException', unhandledError);
    process.on('unhandledRejection', unhandledError);
}


const exitCode = {
    success: 0,
    uncaughtError: 99,
    startFailed: 999
};

const useOrbitDB = (req, res, next) => {
    req.orbitdb = orbitdb;
    next();
};