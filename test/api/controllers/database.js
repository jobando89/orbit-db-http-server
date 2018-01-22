const sinon = require('sinon');
const proxyquire = require('proxyquire');
const Wrapper = require('tortilla-api').wrapper;
const {set} = require('lodash');

describe('controllers/database', function () {

    const sandbox = sinon.sandbox.create();


    let helper, orbitdb;

    describe('get', function () {

        afterEach(() => {
            sandbox.restore();
        });

        beforeEach(function () {
            const apiWrapper = new Wrapper();

            orbitdb = {
                load: sandbox.stub().resolves(),
                add: sandbox.stub().resolves('fake-result'),
                inc: sandbox.stub().resolves('fake-result'),
                set: sandbox.stub().returns('fake-result'),
                put: sandbox.stub().returns('fake-result'),
            };

            helper = {
                wrap: cb => () => cb(helper),
                req: apiWrapper.req,
                res: apiWrapper.res,
                reply: apiWrapper.reply
            };
        });

        function run() {
            const controller = proxyquire(`${__BASE}/api/controllers/database`, {
                'tortilla-api': {wrapper: helper}
            });
            return controller.get();
        }

        it('should throw an exception when a database type is not a valid one', async function () {
            set(helper, 'orbitdb', {
                open: sandbox.stub().returns({
                    type: '',
                    ...orbitdb
                })
            });
            try {
                await run();
            } catch (err) {
                return err.message.should.equal('Not a valid db type for method');
            }

            throw new Error('Test Failed');
        });

        describe('log', function () {

            afterEach(() => {
                sandbox.restore();
            });

            beforeEach(function () {
                const apiWrapper = new Wrapper();

                orbitdb = {
                    load: sandbox.stub().resolves(),
                    add: sandbox.stub().resolves('fake-result'),
                    inc: sandbox.stub().resolves('fake-result'),
                    set: sandbox.stub().returns('fake-result'),
                    put: sandbox.stub().returns('fake-result'),
                };

                helper = {
                    wrap: cb => () => cb(helper),
                    req: apiWrapper.req,
                    res: apiWrapper.res,
                    reply: apiWrapper.reply
                };

                set(helper.req, 'headers', {'content-type': 'fake-param'});
                set(helper.req, 'files', 'fake-files-result');
                set(helper.req, 'body', sandbox.stub().returns('fake-body-result'));
                set(helper.req, 'getParam', sandbox.stub().returns('fake-result'));
                set(helper.reply, 'ok', sandbox.stub().returns());

                set(helper, 'orbitdb', {
                    open: sandbox.stub().returns({
                        type: 'eventlog',
                        iterator: sandbox.stub().returns({
                            collect: sandbox.stub().returns('fake-value')
                        }),
                        ...orbitdb
                    })
                });
            });

            it('should reply with ok', async function () {
                await run();
                helper.reply.ok.should.have.been.calledWith('fake-value');
            });

        });

        describe('feed', function () {

            afterEach(() => {
                sandbox.restore();
            });

            beforeEach(function () {
                const apiWrapper = new Wrapper();

                orbitdb = {
                    load: sandbox.stub().resolves(),
                    add: sandbox.stub().resolves('fake-result'),
                    inc: sandbox.stub().resolves('fake-result'),
                    set: sandbox.stub().returns('fake-result'),
                    put: sandbox.stub().returns('fake-result'),
                };

                helper = {
                    wrap: cb => () => cb(helper),
                    req: apiWrapper.req,
                    res: apiWrapper.res,
                    reply: apiWrapper.reply
                };

                set(helper.req, 'headers', {'content-type': 'fake-param'});
                set(helper.req, 'files', 'fake-files-result');
                set(helper.req, 'body', sandbox.stub().returns('fake-body-result'));
                set(helper.req, 'getParam', sandbox.stub().returns('fake-result'));
                set(helper.reply, 'ok', sandbox.stub().returns());

                set(helper, 'orbitdb', {
                    open: sandbox.stub().returns({
                        type: 'feed',
                        iterator: sandbox.stub().returns({
                            collect: sandbox.stub().returns('fake-value')
                        }),
                        ...orbitdb
                    })
                });
            });

            it('should reply with ok', async function () {
                await run();
                helper.reply.ok.should.have.been.calledWith('fake-value');
            });

        });

        describe('counter', function () {

            afterEach(() => {
                sandbox.restore();
            });

            beforeEach(function () {
                const apiWrapper = new Wrapper();

                orbitdb = {
                    load: sandbox.stub().resolves(),
                    add: sandbox.stub().resolves('fake-result'),
                    inc: sandbox.stub().resolves('fake-result'),
                    set: sandbox.stub().returns('fake-result'),
                    put: sandbox.stub().returns('fake-result'),
                };

                helper = {
                    wrap: cb => () => cb(helper),
                    req: apiWrapper.req,
                    res: apiWrapper.res,
                    reply: apiWrapper.reply
                };

                set(helper.req, 'headers', {'content-type': 'fake-param'});
                set(helper.req, 'files', 'fake-files-result');
                set(helper.req, 'body', sandbox.stub().returns('fake-body-result'));
                set(helper.req, 'getParam', sandbox.stub().returns('fake-result'));
                set(helper.reply, 'ok', sandbox.stub().returns());

                set(helper, 'orbitdb', {
                    open: sandbox.stub().returns({
                        type: 'counter',
                        value: 'fake-value',
                        ...orbitdb
                    })
                });
            });


            it('should reply with ok', async function () {
                await run();
                helper.reply.ok.should.have.been.calledWith('fake-value');
            });
        });

    });

    describe('create', function () {

        beforeEach(function () {
            const apiWrapper = new Wrapper();

            orbitdb = {
                load: sandbox.stub().resolves(),
                add: sandbox.stub().resolves('fake-result'),
                inc: sandbox.stub().resolves('fake-result'),
                set: sandbox.stub().returns('fake-result'),
                put: sandbox.stub().returns('fake-result'),
            };

            helper = {
                wrap: cb => () => cb(helper),
                req: apiWrapper.req,
                res: apiWrapper.res,
                reply: apiWrapper.reply
            };

            set(helper.req, 'headers', {'content-type': 'fake-param'});
            set(helper.req, 'files', 'fake-files-result');
            set(helper.req, 'body', sandbox.stub().returns('fake-body-result'));
            set(helper.req, 'getParam', sandbox.stub().returns('fake-result'));
            set(helper.reply, 'created', sandbox.stub().returns());

        });

        function run() {
            const controller = proxyquire(`${__BASE}/api/controllers/database`, {
                'tortilla-api': {wrapper: helper}
            });
            return controller.create();
        }

        it('should create a database with the parameters assigned', async function () {
            set(helper, 'orbitdb', {
                open: sandbox.stub().returns({
                    type: '',
                    ...orbitdb
                }),
                key: {
                    getPublic: sandbox.stub().returns('fake-key')
                },
                create: sandbox.stub().resolves({
                    address: {
                        toString: sandbox.stub().returns('fake-address')
                    }
                })
            });
            helper.req.getParam.withArgs('type').returns('fake-datastore');
            helper.req.getParam.withArgs('name').returns('fake-name');
            helper.req.getParam.withArgs('properties').returns({props: 'fake-props'});

            await run();

            helper.orbitdb.create.should.have.been.calledWith('fake-name', 'fake-datastore', {
                props: 'fake-props',
                write: [
                    'fake-key'
                ]
            });
        });

        it('should create a database db address', async function () {
            set(helper, 'orbitdb', {
                open: sandbox.stub().returns({
                    type: '',
                    ...orbitdb,
                    address:{
                        toString: sandbox.stub().returns('fake-address')
                    }
                }),
                key: {
                    getPublic: sandbox.stub().returns('fake-key')
                },
                create: sandbox.stub().resolves({
                    address: {
                        toString: sandbox.stub().returns('fake-address')
                    }
                })
            });
            helper.req.getParam.withArgs('name').returns('fake-name');
            helper.req.getParam.withArgs('type').returns();

            await run();

            helper.orbitdb.open.should.have.been.calledWith('fake-name');
        });

        it('should create a database without properties', async function () {

            helper.req.getParam.withArgs('properties').returns(undefined);
            set(helper, 'orbitdb', {
                open: sandbox.stub().returns({
                    type: undefined,
                    ...orbitdb
                }),
                key: {
                    getPublic: sandbox.stub().returns('fake-key')
                },
                create: sandbox.stub().resolves({
                    address: {
                        toString: sandbox.stub().returns('fake-address')
                    }
                })
            });

            await run();

            helper.orbitdb.create.should.have.been.calledWith(
                'fake-result',
                'fake-result',
                {
                    'write': [
                        'fake-key'
                    ]
                }
            );

        });
    });

    describe('add', function () {

        beforeEach(function () {
            const apiWrapper = new Wrapper();

            orbitdb = {
                load: sandbox.stub().resolves(),
                add: sandbox.stub().resolves('fake-result'),
                inc: sandbox.stub().resolves('fake-result'),
                set: sandbox.stub().returns('fake-result'),
                put: sandbox.stub().returns('fake-result'),
            };

            helper = {
                wrap: cb => () => cb(helper),
                req: apiWrapper.req,
                res: apiWrapper.res,
                reply: apiWrapper.reply
            };

            set(helper.req, 'headers', {'content-type': 'fake-param'});
        });

        function run() {
            const controller = proxyquire(`${__BASE}/api/controllers/database`, {
                'tortilla-api': {wrapper: helper}
            });
            return controller.add();
        }

        it('should throw an exception when a database type is not a valid one', async function () {
            set(helper, 'orbitdb', {
                open: sandbox.stub().returns({
                    type: '',
                    ...orbitdb
                })
            });
            try {
                await run();
            } catch (err) {
                return err.message.should.equal('Not a valid db type for method');
            }

            throw new Error('Test Failed');
        });

        describe('feed', function () {

            beforeEach(function () {
                const apiWrapper = new Wrapper();

                orbitdb = {
                    load: sandbox.stub().resolves(),
                    add: sandbox.stub().resolves('fake-result'),
                    inc: sandbox.stub().resolves('fake-result'),
                    set: sandbox.stub().returns('fake-result'),
                    put: sandbox.stub().returns('fake-result'),
                };

                helper = {
                    wrap: cb => () => cb(helper),
                    req: apiWrapper.req,
                    res: apiWrapper.res,
                    reply: apiWrapper.reply
                };

                set(helper.req, 'headers', {'content-type': 'fake-param'});
                set(helper.req, 'files', 'fake-files-result');
                set(helper.req, 'body', sandbox.stub().returns('fake-body-result'));
                set(helper.req, 'getParam', sandbox.stub().returns('fake-result'));
                set(helper.reply, 'created', sandbox.stub().returns());

                set(helper, 'orbitdb', {
                    open: sandbox.stub().returns({
                        type: 'feed',
                        ...orbitdb
                    })
                });
            });

            it('should call created', async function () {
                await run();

                helper.reply.created.should.have.been.calledWith('fake-result');
            });

            it('should call add for log and feed', async function () {
                await run();

                orbitdb.add.should.have.been.calledWith('fake-files-result');
            });

            it('should call add for log and feed with json content type', async function () {
                helper.req.headers = {'content-type': 'application/json'};
                set(helper.req, 'body', 'fake-file');

                await run();

                orbitdb.add.should.have.been.calledWith('fake-file');
            });


            it('should throw an error if the database is not defined', async function () {
                try {
                    helper.req.headers = {'content-type': 'application/json'};
                    set(helper.req, 'body', undefined);

                    await run();
                } catch (err) {
                    return err.message.should.equal('Database entry was undefined');
                }

                throw new Error('Test Failed');
            });

        });

        describe('log', function () {

            beforeEach(function () {
                const apiWrapper = new Wrapper();

                orbitdb = {
                    load: sandbox.stub().resolves(),
                    add: sandbox.stub().resolves('fake-result'),
                    inc: sandbox.stub().resolves('fake-result'),
                    set: sandbox.stub().returns('fake-result'),
                    put: sandbox.stub().returns('fake-result'),
                };

                helper = {
                    wrap: cb => () => cb(helper),
                    req: apiWrapper.req,
                    res: apiWrapper.res,
                    reply: apiWrapper.reply
                };

                set(helper.req, 'headers', {'content-type': 'fake-param'});
                set(helper.req, 'files', 'fake-files-result');
                set(helper.req, 'body', sandbox.stub().returns('fake-body-result'));
                set(helper.req, 'getParam', sandbox.stub().returns('fake-result'));
                set(helper.reply, 'created', sandbox.stub().returns());

                set(helper, 'orbitdb', {
                    open: sandbox.stub().returns({
                        type: 'eventlog',
                        ...orbitdb
                    })
                });

            });


            it('should call created', async function () {
                await run();

                helper.reply.created.should.have.been.calledWith('fake-result');
            });
            it('should call add for log and feed', async function () {
                await run();

                orbitdb.add.should.have.been.calledWith('fake-files-result');
            });

            it('should call add for log and feed with json content type', async function () {
                helper.req.headers = {'content-type': 'application/json'};
                set(helper.req, 'body', 'fake-file');

                await run();

                orbitdb.add.should.have.been.calledWith('fake-file');
            });

        });

        describe('counter', function () {

            beforeEach(function () {
                const apiWrapper = new Wrapper();

                orbitdb = {
                    load: sandbox.stub().resolves(),
                    add: sandbox.stub().resolves('fake-result'),
                    inc: sandbox.stub().resolves('fake-result'),
                    set: sandbox.stub().returns('fake-result'),
                    put: sandbox.stub().returns('fake-result'),
                };

                helper = {
                    wrap: cb => () => cb(helper),
                    req: apiWrapper.req,
                    res: apiWrapper.res,
                    reply: apiWrapper.reply
                };

                set(helper.req, 'headers', {'content-type': 'fake-param'});
                set(helper.req, 'files', 'fake-files-result');
                set(helper.req, 'body', sandbox.stub().returns('fake-body-result'));
                set(helper.req, 'getParam', sandbox.stub().returns('fake-result'));
                set(helper.reply, 'created', sandbox.stub().returns());

                set(helper, 'orbitdb', {
                    open: sandbox.stub().returns({
                        type: 'counter',
                        ...orbitdb
                    })
                });
            });

            it('should call inc for counter', async function () {

                helper.req.getParam.withArgs('value').returns('fake-value');

                await run();

                orbitdb.inc.should.have.been.calledWith('fake-value');
            });

            it('should call inc with a value for counter', async function () {
                helper.req.getParam.withArgs('value').returns();

                await run();

                orbitdb.inc.should.have.been.calledWith();
                orbitdb.inc.args[0].length.should.equal(0);
            });
        });

    });

    describe('addKeyValue', function () {

        beforeEach(function () {
            const apiWrapper = new Wrapper();

            orbitdb = {
                load: sandbox.stub().resolves(),
                add: sandbox.stub().resolves('fake-result'),
                inc: sandbox.stub().resolves('fake-result'),
                set: sandbox.stub().returns('fake-result'),
                put: sandbox.stub().returns('fake-result'),
            };

            helper = {
                wrap: cb => () => cb(helper),
                req: apiWrapper.req,
                res: apiWrapper.res,
                reply: apiWrapper.reply
            };

            set(helper.req, 'headers', {'content-type': 'fake-param'});
        });

        function run() {
            const controller = proxyquire(`${__BASE}/api/controllers/database`, {
                'tortilla-api': {wrapper: helper}
            });
            return controller.addKeyValue();
        }

        it('should throw an exception when a database type is not a valid one', async function () {
            set(helper, 'orbitdb', {
                open: sandbox.stub().returns({
                    type: '',
                    ...orbitdb
                })
            });
            try {
                await run();
            } catch (err) {
                return err.message.should.equal('Not a valid db type for method');
            }

            throw new Error('Test Failed');
        });


        describe('keyvalue', function () {

            beforeEach(function () {

                const apiWrapper = new Wrapper();

                orbitdb = {
                    load: sandbox.stub().resolves(),
                    add: sandbox.stub().resolves('fake-result'),
                    inc: sandbox.stub().resolves('fake-result'),
                    set: sandbox.stub().returns('fake-result'),
                    put: sandbox.stub().returns('fake-result'),
                };

                helper = {
                    wrap: cb => () => cb(helper),
                    req: apiWrapper.req,
                    res: apiWrapper.res,
                    reply: apiWrapper.reply
                };

                set(helper.req, 'headers', {'content-type': 'fake-param'});
                set(helper.req, 'files', 'fake-files-result');
                set(helper.req, 'body', sandbox.stub().returns('fake-body-result'));
                set(helper.req, 'getParam', sandbox.stub().returns('fake-result'));
                set(helper.reply, 'created', sandbox.stub().returns());

                set(helper, 'orbitdb', {
                    open: sandbox.stub().returns({
                        type: 'keyvalue',
                        ...orbitdb
                    })
                });
                helper.req.getParam.withArgs('key').returns('fake-key');

            });

            it('should call created', async function () {
                await run();

                helper.reply.created.should.have.been.calledWith('fake-result');
            });

            it('should call created when call is not a stream', async function () {
                set(helper, 'req.headers.content-type', 'application/json');
                set(helper, 'req.body', 'fake-result');

                await run();

                helper.reply.created.should.have.been.calledWith('fake-result');
            });


            it('should call put for a stream', async function () {
                await run();

                orbitdb.put.should.have.been.calledWith('fake-key', 'fake-files-result');
            });

        });

        describe('docstore', function () {

            beforeEach(function () {

                const apiWrapper = new Wrapper();

                orbitdb = {
                    load: sandbox.stub().resolves(),
                    add: sandbox.stub().resolves('fake-result'),
                    inc: sandbox.stub().resolves('fake-result'),
                    set: sandbox.stub().returns('fake-result'),
                    put: sandbox.stub().returns('fake-result'),
                };

                helper = {
                    wrap: cb => () => cb(helper),
                    req: apiWrapper.req,
                    res: apiWrapper.res,
                    reply: apiWrapper.reply
                };

                set(helper.req, 'headers', {'content-type': 'fake-param'});
                set(helper.req, 'files', 'fake-files-result');
                set(helper.req, 'body', sandbox.stub().returns('fake-body-result'));
                set(helper.req, 'getParam', sandbox.stub().returns('fake-result'));
                set(helper.reply, 'created', sandbox.stub().returns());

                set(helper, 'orbitdb', {
                    open: sandbox.stub().returns({
                        type: 'docstore',
                        ...orbitdb
                    })
                });
                helper.req.getParam.withArgs('key').returns('fake-key');
                helper.req.files = {value: 'fake-body-result'};
            });

            it('should call created', async function () {
                await run();

                helper.reply.created.should.have.been.calledWith('fake-result');
            });

            it('should call put for a stream', async function () {
                await run();

                orbitdb.put.should.have.been.calledWith({
                    _id: 'fake-key',
                    value: 'fake-body-result'
                });
            });

        });
    });

    describe('getByKey', function () {

        beforeEach(function () {
            const apiWrapper = new Wrapper();

            orbitdb = {
                load: sandbox.stub().resolves(),
                add: sandbox.stub().resolves('fake-result'),
                inc: sandbox.stub().resolves('fake-result'),
                set: sandbox.stub().returns('fake-result'),
                put: sandbox.stub().returns('fake-result'),
            };

            helper = {
                wrap: cb => () => cb(helper),
                req: apiWrapper.req,
                res: apiWrapper.res,
                reply: apiWrapper.reply
            };
        });

        function run() {
            const controller = proxyquire(`${__BASE}/api/controllers/database`, {
                'tortilla-api': {wrapper: helper}
            });
            return controller.getByKey();
        }

        it('should throw an exception when a database type is not a valid one', async function () {
            set(helper, 'orbitdb', {
                open: sandbox.stub().returns({
                    type: '',
                    ...orbitdb
                })
            });
            try {
                await run();
            } catch (err) {
                return err.message.should.equal('Not a valid db type for method');
            }

            throw new Error('Test Failed');
        });

        describe('keyvalue', function () {

            afterEach(() => {
                sandbox.restore();
            });

            beforeEach(function () {
                const apiWrapper = new Wrapper();

                orbitdb = {
                    load: sandbox.stub().resolves(),
                    add: sandbox.stub().resolves('fake-result'),
                    inc: sandbox.stub().resolves('fake-result'),
                    set: sandbox.stub().returns('fake-result'),
                    put: sandbox.stub().returns('fake-result'),
                };

                helper = {
                    wrap: cb => () => cb(helper),
                    req: apiWrapper.req,
                    res: apiWrapper.res,
                    reply: apiWrapper.reply
                };

                set(helper.reply, 'ok', sandbox.stub().returns());

                set(helper, 'orbitdb', {
                    open: sandbox.stub().returns({
                        type: 'keyvalue',
                        get: sandbox.stub().returns('fake-result'),
                        ...orbitdb
                    })
                });
            });

            it('should call ok', async function () {
                await run();

                helper.reply.ok.should.have.been.calledWith('fake-result');
            });
        });

        describe('log', function () {

            afterEach(() => {
                sandbox.restore();
            });

            beforeEach(function () {
                const apiWrapper = new Wrapper();

                orbitdb = {
                    load: sandbox.stub().resolves(),
                    add: sandbox.stub().resolves('fake-result'),
                    inc: sandbox.stub().resolves('fake-result'),
                    set: sandbox.stub().returns('fake-result'),
                    put: sandbox.stub().returns('fake-result'),
                };

                helper = {
                    wrap: cb => () => cb(helper),
                    req: apiWrapper.req,
                    res: apiWrapper.res,
                    reply: apiWrapper.reply
                };

                set(helper.reply, 'ok', sandbox.stub().returns());

                set(helper, 'orbitdb', {
                    open: sandbox.stub().returns({
                        type: 'eventlog',
                        get: sandbox.stub().returns('fake-result'),
                        ...orbitdb
                    })
                });
            });

            it('should call ok', async function () {
                await run();

                helper.reply.ok.should.have.been.calledWith('fake-result');
            });

        });

        describe('feed', function () {

            afterEach(() => {
                sandbox.restore();
            });

            beforeEach(function () {
                const apiWrapper = new Wrapper();

                orbitdb = {
                    load: sandbox.stub().resolves(),
                    add: sandbox.stub().resolves('fake-result'),
                    inc: sandbox.stub().resolves('fake-result'),
                    set: sandbox.stub().returns('fake-result'),
                    put: sandbox.stub().returns('fake-result'),
                };

                helper = {
                    wrap: cb => () => cb(helper),
                    req: apiWrapper.req,
                    res: apiWrapper.res,
                    reply: apiWrapper.reply
                };

                set(helper.reply, 'ok', sandbox.stub().returns());

                set(helper, 'orbitdb', {
                    open: sandbox.stub().returns({
                        type: 'feed',
                        get: sandbox.stub().returns('fake-result'),
                        ...orbitdb
                    })
                });
            });

            it('should call ok', async function () {
                await run();

                helper.reply.ok.should.have.been.calledWith('fake-result');
            });

        });

        describe('docstore', function () {

            afterEach(() => {
                sandbox.restore();
            });

            beforeEach(function () {
                const apiWrapper = new Wrapper();

                orbitdb = {
                    load: sandbox.stub().resolves(),
                    add: sandbox.stub().resolves('fake-result'),
                    inc: sandbox.stub().resolves('fake-result'),
                    set: sandbox.stub().returns('fake-result'),
                    put: sandbox.stub().returns('fake-result'),
                };

                helper = {
                    wrap: cb => () => cb(helper),
                    req: apiWrapper.req,
                    res: apiWrapper.res,
                    reply: apiWrapper.reply
                };

                set(helper.reply, 'ok', sandbox.stub().returns());

                set(helper, 'orbitdb', {
                    open: sandbox.stub().returns({
                        type: 'docstore',
                        get: sandbox.stub().returns('fake-result'),
                        ...orbitdb
                    })
                });
            });

            it('should call ok', async function () {
                await run();

                helper.reply.ok.should.have.been.calledWith('fake-result');
            });

        });

    });

    describe('deleteKeyValue', function () {

        beforeEach(function () {
            const apiWrapper = new Wrapper();

            orbitdb = {
                load: sandbox.stub().resolves(),
                add: sandbox.stub().resolves('fake-result'),
                inc: sandbox.stub().resolves('fake-result'),
                set: sandbox.stub().returns('fake-result'),
                put: sandbox.stub().returns('fake-result'),
            };

            helper = {
                wrap: cb => () => cb(helper),
                req: apiWrapper.req,
                res: apiWrapper.res,
                reply: apiWrapper.reply
            };
        });

        function run() {
            const controller = proxyquire(`${__BASE}/api/controllers/database`, {
                'tortilla-api': {wrapper: helper}
            });
            return controller.deleteKeyValue();
        }

        it('should throw an exception when a database type is not a valid one', async function () {
            set(helper, 'orbitdb', {
                open: sandbox.stub().returns({
                    type: '',
                    ...orbitdb
                })
            });
            try {
                await run();
            } catch (err) {
                return err.message.should.equal('Not a valid db type for method');
            }

            throw new Error('Test Failed');
        });

        describe('feed', function () {

            afterEach(() => {
                sandbox.restore();
            });

            beforeEach(function () {
                const apiWrapper = new Wrapper();

                orbitdb = {
                    load: sandbox.stub().resolves(),
                    add: sandbox.stub().resolves('fake-result'),
                    inc: sandbox.stub().resolves('fake-result'),
                    set: sandbox.stub().returns('fake-result'),
                    put: sandbox.stub().returns('fake-result'),
                };

                helper = {
                    wrap: cb => () => cb(helper),
                    req: apiWrapper.req,
                    res: apiWrapper.res,
                    reply: apiWrapper.reply
                };

                set(helper.reply, 'ok', sandbox.stub().returns());

                set(helper, 'orbitdb', {
                    open: sandbox.stub().returns({
                        type: 'feed',
                        remove: sandbox.stub().resolves(),
                        ...orbitdb
                    })
                });
            });

            it('should call ok', async function () {
                await run();

                helper.reply.ok.should.have.been.calledWith();
            });

        });

        describe('docstore', function () {

            afterEach(() => {
                sandbox.restore();
            });

            beforeEach(function () {
                const apiWrapper = new Wrapper();

                orbitdb = {
                    load: sandbox.stub().resolves(),
                    add: sandbox.stub().resolves('fake-result'),
                    inc: sandbox.stub().resolves('fake-result'),
                    set: sandbox.stub().returns('fake-result'),
                    put: sandbox.stub().returns('fake-result'),
                };

                helper = {
                    wrap: cb => () => cb(helper),
                    req: apiWrapper.req,
                    res: apiWrapper.res,
                    reply: apiWrapper.reply
                };

                set(helper.reply, 'ok', sandbox.stub().returns());

                set(helper, 'orbitdb', {
                    open: sandbox.stub().returns({
                        type: 'docstore',
                        del: sandbox.stub().resolves(),
                        ...orbitdb
                    })
                });
            });

            it('should call ok', async function () {
                await run();

                helper.reply.ok.should.have.been.calledWith();
            });

        });

    });
});