const { CustomizedLogin } = require('cypress-social-logins').plugins;

module.exports = (on, config) => {
    // Add the following line to load the plugin
    CustomizedLogin(on, config);
    // IMPORTANT to return the config object
    // with the any changed environment variables
    return config;
};
