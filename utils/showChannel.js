function showChannel (id, settings = powercord.pluginManager.plugins.get('hidechannels').settings) {
  const list = settings.get('idlist', []);
  const details = settings.get('details', []);

  if (!list || !details || list.length === 0 || details.length === 0) {
    return;
  }

  if (list.includes(id)) {
    settings.set(
      'idlist',
      list.filter((item) => item !== id)
    );
  }

  if (details.some((item) => item.id === id)) {
    settings.set(
      'details',
      details.filter((item) => item.id !== id)
    );
  }
}

module.exports = showChannel;
