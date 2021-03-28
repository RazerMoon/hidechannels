const { React } = require('powercord/webpack');
const { ButtonItem } = require('powercord/components/settings');

// eslint-disable-next-line no-warning-comments
// TODO: Make the channel items more distinct/seperate from the actual settings
module.exports = ({ getSetting, updateSetting, settings }) => {
  const Note = ({ id, guild_id, type }) => (
    <div style={{ display: 'flex',
      flexFlow: 'column',
      marginTop: '8px' }}>
      <span>
        <b>Type:</b> {type} ({type === 0 ? 'Text' : 'Voice'})
      </span>
      <span>
        <b>ID:</b> {id}
      </span>
      <span>
        <b>Guild ID:</b> {guild_id}
      </span>
    </div>
  );

  const removeAll = () => {
    updateSetting('idlist', []);
    updateSetting('details', []);
  };

  const removeID = (id) => {
    const list = getSetting('idlist', []);
    const details = getSetting('details', []);

    if (!list || !details || list.length === 0 || details.length === 0) {
      return;
    }

    if (list.includes(id)) {
      updateSetting(
        'idlist',
        list.filter((item) => item !== id)
      );
    }

    if (details.some((item) => item.id === id)) {
      updateSetting(
        'details',
        details.filter((item) => item.id !== id)
      );
    }
  };

  return (
    <div>
      <ButtonItem
        note="Log all setting data to console"
        button="Do it"
        onClick={() => console.dir(settings)}
      >
        Log data
      </ButtonItem>
      <ButtonItem
        note="Remove all channel data"
        button="Do it"
        onClick={() => removeAll()}
      >
        Reset
      </ButtonItem>
      {getSetting('details', []).map(({ name, guild_id, id, type }) => (
        <ButtonItem
          note={<Note guild_id={guild_id} id={id} type={type} />}
          button="Remove"
          onClick={() => removeID(id)}
        >
          {name}
        </ButtonItem>
      ))}
    </div>
  );
};
