const {get} = require('lodash');
const guid = require('guid');
const Logger = require('logplease');
const logger = Logger.create(`Request:${guid.raw()}`, {color: Logger.Colors.Yellow});
Logger.setLogLevel('DEBUG');

class Wrapper {
    constructor(req, res) {
        this._req = req;
        this._res = res;
    }

    static wrap(operation) {
        return async (req, res) => {
            const wrapper = new Wrapper(req, res);
            try {
                return await operation(wrapper);
            }
            catch (err) {
                try {
                    const message = get(err, 'message', 'Unknown error occurred');
                    let statusCode = get(err, 'statusCode', 500);
                    if (message.includes('doesn\'t exist')) {
                        return wrapper.reply.notFound(message);
                    } else if (message.includes('already exists')) {
                        return wrapper.reply.badRequest(message);
                    } else if (message.includes('If you want to create a database')) {
                        return wrapper.reply.notFound(message);
                    }
                    logger.error(message, err);

                    return wrapper.reply(statusCode, message);
                }
                catch (sendError) {
                    logger.error('Failed to send API response', sendError);
                }
            }
        };
    }

    get req() {
        const getParam = (name) => {
            return get(this._req, ['swagger', 'params', name, 'value']);
        };
        const multihash = getParam('multihash');
        const name = getParam('name');
        const dbAddress = `/orbitdb/${multihash}/${name}`;
        return {
            ...this._req,
            getParam,
            dbAddress
        };
    }

    get res() {
        return this._res;
    }

    get orbitdb() {
        return this._req.orbitdb;
    }

    get reply() {
        const reply = (code, payload) => this._res.send(code, payload);
        reply.ok = payload => reply(200, payload);
        reply.created = payload => reply(201, payload);
        reply.noContent = payload => reply(204, payload);
        reply.badRequest = payload => reply(400, payload);
        reply.unauthorized = payload => reply(401, payload);
        reply.forbidden = payload => reply(403, payload);
        reply.notFound = payload => reply(404, payload);
        reply.internalServerError = payload => reply(500, payload);
        return reply;
    }

    get logger(){
        return logger;
    }
}


module.exports = Wrapper;