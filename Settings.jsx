const { React } = require("powercord/webpack");
const { ButtonItem } = require("powercord/components/settings");

module.exports = ({ getSetting, updateSetting, settings }) => {
  const settingsApi = powercord.pluginManager.plugins.get("hidechannels").settings;

  const [error, setError] = React.useState(false);

  const details = getSetting("details", []);

  const Note = ({ id, guild_id, type }) => (
    <div style={{ display: "flex", flexFlow: "column", marginTop: "8px" }}>
      <span>
        <b>Type:</b> {type} ({type === 0 ? "Text" : "Voice"})
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
    settingsApi.delete("idlist");
    settingsApi.delete("details");
  };

  const removeID = (id) => {
    const list = getSetting("idlist", []);
    const details = getSetting("details", []);

    if (!list || !details || list.length === 0 || details.length === 0) return;

    if (list.includes(id)) {
      updateSetting(
        "idlist",
        list.filter((item) => item !== id)
      );
    }

    if (details.some((item) => item.id === id)) {
      updateSetting(
        "details",
        details.filter((item) => item.id !== id)
      );
    }
  };

  /*
  const onChange = (val) => {
    // Removes whitespace
    const sanitized = val.replace(/\s/g, "")

    // Tests if string only consists of digits seperate by commas
    if (sanitized !== "" && !(/^\d+(,\d+)*$/).test(sanitized)) {
      setError(true)
      return;
    }

    error && setError(false)

    updateSetting("idlist", sanitized.split(","))
  }
  */

  return (
    <div>
      {/*
      <TextInput
        note="List of Text Channel IDs to block, seperated by commas."
        defaultValue={getSetting("idlist", [""])}
        onChange={onChange}
        placeholder={["805984053131870209", "691183062792536104"]}
        error={error && "Illegal value! Make sure to only use digits and no comma at the end!"}
      >
        ID List
      </TextInput>
      */}
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
      {details.map(({ name, guild_id, id, type }) => (
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
