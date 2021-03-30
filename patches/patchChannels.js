const { inject } = require('powercord/injector');
const { React, getModule } = require('powercord/webpack');

async function patchChannels (patches, moduleNames, settings = powercord.pluginManager.plugins.get('hidechannels').settings) {
  const chanmods = await Promise.all(moduleNames.map((name) => getModule((m) => (m.__powercordOriginal_default || m.default)?.displayName === name)));

  patches.slice(0, 2).forEach((name, index) => {
    inject(name, chanmods[index], 'default', (_, res) => {
      if (settings.get('idlist', []).includes(res.props.channel.id)) {
        res = React.createElement('p', { style: { display: 'none' } });
      }

      return res;
    });

    chanmods[index].default.displayName = moduleNames[index];
  });
}

module.exports = patchChannels;