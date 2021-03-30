const { React } = require('powercord/webpack');
const { ButtonItem } = require('powercord/components/settings');
const showChannel = require('../utils/showChannel');

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
          button="Show"
          onClick={() => showChannel(id, { get: getSetting,
            set: updateSetting })}
        >
          {name}
        </ButtonItem>
      ))}
    </div>
  );
};
