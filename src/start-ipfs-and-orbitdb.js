const path = require('path');
const IPFS = require('ipfs');
const OrbitDB = require('orbit-db');
const {get} = require('lodash');
const Logger = require('logplease');
const logger = Logger.create('orbit-db-http-server', {color: Logger.Colors.Yellow});
const config = require('config');


const startIpfsAndOrbitDB = async (options = {}) => {
    const defaultDataDir = './orbitdb';
    logger.debug('IPFS path:', get(options, 'ipfsPath'));
    logger.debug('OrbitDB path:', get(options, 'orbitdbPath'));
    const swarm = get(config,'swarm.items',[]);
    const repo = options.ipfsPath || path.join(defaultDataDir, '/ipfs');

    return new Promise((resolve, reject) => {
        logger.debug('Starting IPFS');
        const ipfs = new IPFS({
            start: true,
            repo,
            EXPERIMENTAL: {
                pubsub: true,
            },
            config: {
                Addresses: {
                    Swarm:swarm,
                },
            },
        });
        ipfs.on('error', reject);
        ipfs.on('ready', () => {
            logger.info('IPFS started');
            logger.info('Starting OrbitDB');
            const orbitdb = new OrbitDB(ipfs, defaultDataDir, options);
            resolve({orbitdb: orbitdb, ipfs: ipfs});
        });
    });
};

module.exports = startIpfsAndOrbitDB;
