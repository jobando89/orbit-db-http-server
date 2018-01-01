const sinon = require('sinon');
const proxyquire = require('proxyquire');
const Wrapper = require(`${__BASE}/src/wrapper`);
const {set} = require('lodash');

describe('controllers/database', function () {

    const sandbox = sinon.sandbox.create();

    afterEach(() => {
        sandbox.restore();
    });

    let helper, orbitdb;

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
            orbitdb: {},
            reply: apiWrapper.reply
        };


        sandbox.stub(helper.reply, 'created').resolves();
        set(helper.req, 'headers', {'content-type': 'fake-param'});
        set(helper.req, 'files', 'fake-files-result');
        set(helper.req, 'body', sandbox.stub().returns('fake-body-result'));
        set(helper.req, 'getParam', sandbox.stub().returns('fake-result'));

    });

    describe('add', function () {

        function run() {
            const controller = proxyquire(`${__BASE}/api/controllers/database`, {
                '../../src/wrapper': helper
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
                set(helper, 'orbitdb', {
                    open: sandbox.stub().returns({
                        type: 'feed',
                        ...orbitdb
                    })
                });
            })

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

        describe('log', function () {

            beforeEach(function () {
                set(helper, 'orbitdb', {
                    open: sandbox.stub().returns({
                        type: 'log',
                        ...orbitdb
                    })
                });
            })

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
                set(helper, 'orbitdb', {
                    open: sandbox.stub().returns({
                        type: 'counter',
                        ...orbitdb
                    })
                });
            })

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

        function run() {
            const controller = proxyquire(`${__BASE}/api/controllers/database`, {
                '../../src/wrapper': helper
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
                set(helper, 'orbitdb', {
                    open: sandbox.stub().returns({
                        type: 'keyvalue',
                        ...orbitdb
                    })
                });
                helper.req.getParam.withArgs('key').returns('fake-key');
            })

            it('should call created', async function () {
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

    describe('create', function () {

        function run() {
            const controller = proxyquire(`${__BASE}/api/controllers/database`, {
                '../../src/wrapper': helper
            });
            return controller.create();
        }

        describe('keyvalue', function () {
        });

        describe('log', function () {
        });

        describe('feed', function () {
        });

        describe('docs', function () {
        });

        describe('counter', function () {
        });

    });

    describe('get', function () {

        function run() {
            const controller = proxyquire(`${__BASE}/api/controllers/database`, {
                '../../src/wrapper': helper
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

            beforeEach(function () {
                set(helper, 'orbitdb', {
                    open: sandbox.stub().returns({
                        type: 'log',
                        ...orbitdb
                    })
                });
            });

        });

        describe('feed', function () {

            beforeEach(function () {
                set(helper, 'orbitdb', {
                    open: sandbox.stub().returns({
                        type: 'feed',
                        ...orbitdb
                    })
                });
            });

        });

        describe('counter', function () {

            beforeEach(function () {
                set(helper, 'orbitdb', {
                    open: sandbox.stub().returns({
                        type: 'counter',
                        ...orbitdb
                    })
                });
            });

        });

    });

    describe('getByKey', function () {

        function run() {
            const controller = proxyquire(`${__BASE}/api/controllers/database`, {
                '../../src/wrapper': helper
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
        });

        describe('log', function () {
        });

        describe('feed', function () {
        });

        describe('docs', function () {
        });

    });
});