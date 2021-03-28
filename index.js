const { Plugin } = require("powercord/entities");
const { React, getModule } = require("powercord/webpack");

const Settings = require('./Settings.jsx');

const { inject, uninject } = require('powercord/injector');

module.exports = class HideChannels extends Plugin {
  setApi = powercord.api.settings
  patches = ["textchannel-patch", "voicechannel-patch"]

  startPlugin () {
    this.setApi.registerSettings('hidechannels', {
      category: this.entityID,
      label: 'Hide Channels',
      render: Settings
    });

    this.patchChannel()
  }

  async patchChannel() {
    const textPromise = getModule(m => (m.__powercordOriginal_default || m.default)?.toString().includes('isDefaultChannel'))
    const voicePromise = getModule(m => {return (m.__powercordOriginal_default || m.default)?.toString().includes('embeddedApplication')})

    const channels = await Promise.all([textPromise, voicePromise])

    this.patches.forEach((name, index) => {
      inject(name, channels[index], 'default', (_, res) => {
        if (powercord.pluginManager.plugins.get(this.entityID).settings.get('idlist', [""]).includes(res.props.channel.id)) {
          res = React.createElement("p", {style: {display: "none"}})
        }
        return res;
      });
    });
  }

  pluginWillUnload () {
    this.setApi.unregisterSettings('hidechannels');
    this.patches.forEach(name => uninject(name))
  }
};
