const { Plugin } = require('powercord/entities');
const { getModule } = require('powercord/webpack');
const { uninject } = require('powercord/injector');

const Settings = require('./ui/Settings.jsx');

const hideChannel = require('./utils/hideChannel.js');
// const patchGuildCM = require('./patches/patchGuildCM.js'); broke
const patchChannels = require('./patches/patchChannels.js');
const patchChannelCMs = require('./patches/patchChannelCMs.js');

/**
 * Hide text and voice channels using the context menu
 * @link https://github.com/RazerMoon/hidechannels
 * @license MIT
 * @extends Plugin
 */
module.exports = class HideChannels extends Plugin {
  startPlugin () {
    this.setApi = powercord.api.settings;
    this.patches = [ 'hidechannels-textchannel-patch', 'hidechannels-voicechannel-patch', 'hidechannels-context-patch', 'hidechannels-guildcm-patch', 'hidechannels-navchannels-patch' ];
    this.moduleNames = [ 'ConnectedTextChannel', 'ConnectedVoiceChannel', 'Menu' ]; // 'GuildContextMenu' removed cause broke
    this.getModules = () => Promise.all(this.moduleNames.map((name) => getModule((m) => (m.__powercordOriginal_default || m.default)?.displayName === name)));
    this.hideChannel = (channel) => hideChannel(channel, this.settings);

    this.setApi.registerSettings('hidechannels', {
      category: this.entityID,
      label: 'Hide Channels',
      render: Settings
    });

    this.getModules().then((val) => {
      const modules = val;

      if (modules.some(mod => mod === null)) {
        this.error('Could not find all of the modules! Cancelling...');
        return;
      }

      patchChannels(this.patches.slice(0, 2), this.moduleNames.slice(0, 2), this.settings);
      patchChannelCMs(this.patches[2], this.moduleNames[2]);
      // patchGuildCM(this.patches[3], this.moduleNames[3], this.settings); It broke
    }).catch((err) => {
      this.error('Something went wrong while fetching modules! Cancelling...', err);
    });
  }

  pluginWillUnload () {
    this.setApi.unregisterSettings('hidechannels');

    this.patches.forEach((name) => uninject(name));
  }
};
