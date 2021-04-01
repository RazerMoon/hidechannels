const { inject } = require('powercord/injector');
const { React, getModule } = require('powercord/webpack');

/**
 * Returns the value of a setting
 * @callback getSetting
 * @param {String} name Name of the setting
 * @param {*} defaultValue Default value for setting
 */

/**
 * Sets the value of a setting
 * @callback setSetting
 * @param {String} name Name of the setting
 * @param {*} newValue New value to set
 */

/**
 * Patches the channels
 * @param {String} patchName Name of the patches
 * @param {String} moduleName Name of the channel modules
 * @param {Object} settings Settings object for plugin with get and set methods
 * @param {getSetting} settings.get
 * @param {setSetting} settings.set
 * @returns {Promise<void>}
 */
module.exports = async function patchChannels (patches, moduleNames, settings = powercord.pluginManager.plugins.get('hidechannels').settings) {
  const chanmods = await Promise.all(moduleNames.map((name) => getModule((m) => (m.__powercordOriginal_default || m.default)?.displayName === name)));

  patches.slice(0, 2).forEach((name, index) => {
    inject(name, chanmods[index], 'default', (_, res) => {
      // * Maybe try finding a more efficient solution than calling settings everytime
      if (settings.get('idlist', []).includes(res.props.channel.id)) {
        res = React.createElement('p', { style: { display: 'none' } });
      }

      return res;
    });

    chanmods[index].default.displayName = moduleNames[index];
  });
};

