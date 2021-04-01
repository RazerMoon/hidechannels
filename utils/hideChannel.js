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
 * Adds the channel to the list of hidden channels
 * @param {string} id ID of the channel
 * @param {Object} settings Settings object for plugin with get and set methods
 * @param {getSetting} settings.get
 * @param {setSetting} settings.set
 * @returns
 */
module.exports = function removeChannel (channel, settings = powercord.pluginManager.plugins.get('hidechannels').settings) {
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
};
