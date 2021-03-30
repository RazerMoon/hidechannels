const { inject } = require('powercord/injector');
const { getModule } = require('powercord/webpack');
const { findInReactTree } = require('powercord/util');

const RemoveHiddenChannelsButton = require('../ui/RemoveHiddenChannelsButton.jsx');

async function patchGuildCM (patchName, moduleName, settings = powercord.pluginManager.plugins.get('hidechannels').settings) {
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
}

module.exports = patchGuildCM;
