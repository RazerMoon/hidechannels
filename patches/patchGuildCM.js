const { inject } = require('powercord/injector');
const { getModule } = require('powercord/webpack');
const { findInReactTree } = require('powercord/util');

const RemoveHiddenChannelsButton = require('../ui/RemoveHiddenChannelsButton.jsx');

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
 * Patches the guild context menu
 * @param {String} patchName Name of the patch
 * @param {String} moduleName Name of the guild context menu module
 * @param {Object} settings Settings object for plugin with get and set methods
 * @param {getSetting} settings.get
 * @param {setSetting} settings.set
 * @returns {Promise<void>}
 */
module.exports = async function patchGuildCM (patchName, moduleName, settings = powercord.pluginManager.plugins.get('hidechannels').settings) {
  const guildCM = await getModule((m) => (m.__powercordOriginal_default || m.default)?.displayName === moduleName);

  inject(patchName, guildCM, 'default', ([ { guild: { id } } ], res) => {
    const hasShowChannelsButton = findInReactTree(res.props.children, child => child.props && child.props.id === 'remove-hidden-channels');

    if (!hasShowChannelsButton) {
      const mutedchannels = findInReactTree(res.props.children, child => child.props?.children && findInReactTree(child.props.children, child => child.props && child.props.id === 'hide-muted-channels'));

      if (!mutedchannels) {
        return res;
      }

      const HideChannelItem = RemoveHiddenChannelsButton.render({ guild_id: id,
        settings });

      mutedchannels.props.children.push(HideChannelItem);
    }

    return res;
  });
};
