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
 * Removes the channel from the list of hidden channels
 * @param {string} id ID of the channel
 * @param {Object} settings Settings object for plugin with get and set methods
 * @param {getSetting} settings.get
 * @param {setSetting} settings.set
 * @returns
 */
module.exports = function showChannel (id, settings = powercord.pluginManager.plugins.get('hidechannels').settings) {
  const list = settings.get('idlist', []).slice();
  const details = settings.get('details', []).slice();

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
};
