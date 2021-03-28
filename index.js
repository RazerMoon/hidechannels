const { Plugin } = require("powercord/entities");
const { React, getModule } = require("powercord/webpack");

const Settings = require('./Settings.jsx');

const { inject, uninject } = require('powercord/injector');

module.exports = class HideChannels extends Plugin {
  startPlugin () {
    const idlist = this.settings.get('idlist', '');

    powercord.api.settings.registerSettings('hidechannels', {
      category: this.entityID,
      label: 'Hide Channels',
      render: Settings
    });

    this.log(idlist)

    this.patchChannel(idlist) // Remmember to add uninject
  }

  async patchChannel(idlist) {
    const Channel = await getModule(m => (m.__powercordOriginal_default || m.default)?.toString().includes('isDefaultChannel'))
    console.dir(Channel)

    inject('test-patch', Channel, 'default', (_, res) => {
      if (idlist.includes(res.props.channel.id)) {
        res = React.createElement("p", {style: {display: "none"}})
      }
      return res;
    });
  }

  pluginWillUnload () {
    powercord.api.settings.unregisterSettings('hidechannels');
    uninject('test-patch');
  }
};
