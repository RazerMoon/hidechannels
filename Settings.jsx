const { React } = require("powercord/webpack");
const { TextInput, SwitchItem } = require("powercord/components/settings");

module.exports = ({ getSetting, updateSetting, toggleSetting }) => {
  const [error, setError] = React.useState(false)

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

  return (
    <div>
      <TextInput
        note="List of Text Channel IDs to block, seperated by commas."
        defaultValue={getSetting("idlist", [""])}
        onChange={onChange}
        placeholder={["805984053131870209", "691183062792536104"]}
        error={error && "Illegal value! Make sure to only use digits and no comma at the end!"}
      >
        ID List
      </TextInput>
    </div>
  );
};
