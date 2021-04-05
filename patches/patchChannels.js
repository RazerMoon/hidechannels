const { inject } = require('powercord/injector');
const { findInTree } = require('powercord/util');
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

  const Channels = await getModule((m) => (m.__powercordOriginal_default || m.default)?.displayName === 'NavigableChannels');

  inject('awdawd', Channels, 'default', (args, res) => {
    // args[0].categories._categories = [];
    const idlist = settings.get('idlist', []);
    // const items = findInTree(args[0].channels, (c) => c.channel && idlist.includes(c.channel.id));
    // const tree = findInTree(args[0].channels, c => Array.isArray(c) && c.includes(items));
    [ args[0].channels.VOCAL, args[0].channels.SELECTABLE ].forEach((x) => {
      x = x.map((item) => {
        if (idlist.includes(item.channel.id)) {
          item.channel.hidden = true;
        } else {
          item.channel.hidden = false;
        }

        return item;
      });
    });
    // console.dir(items);
    // console.dir(tree);
    console.dir(args);
    // res.props.children.props.channels.VOCAL = [];
    // res.props.children.props.categories['518859740655386634'] = [];
    console.dir(res);
    return args;
  }, true);

  patches.slice(0, 2).forEach((name, index) => {
    inject(name, chanmods[index], 'default', (_, res) => {
      // * Maybe try finding a more efficient solution than calling settings
      console.dir(res.props.channel);
      if (res.props.channel.hidden === true) {
        res = React.createElement('p', { style: { display: 'none' } });
      }

      return res;
    });

    chanmods[index].default.displayName = moduleNames[index];
  });
};

