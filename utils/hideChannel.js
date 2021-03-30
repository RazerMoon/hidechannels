function removeChannel (channel, settings = powercord.pluginManager.plugins.get('hidechannels').settings) {
  const list = settings.get('idlist', []);
  const details = settings.get('details', []);

  if (!list.includes(channel.id)) {
    list.push(channel.id);
  }

  if (!details.some(item => item.id === channel.id)) {
    details.push(channel);
  }

  // eslint-disable-next-line no-warning-comments
  // TODO: Don't update if nothing changed
  settings.set('idlist', list);
  settings.set('details', details);
}

module.exports = removeChannel;
