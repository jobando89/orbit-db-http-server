const Wrapper = require('tortilla-api').wrapper;
const packageJson = require('../../package.json');

module.exports={
    get : Wrapper.wrap(async helper => {
        return helper.reply.ok({
            Version:packageJson.version,
            App: packageJson.name
        });
    })
};