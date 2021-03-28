const { React } = require('powercord/webpack');
const { TextInput, SwitchItem } = require('powercord/components/settings');

module.exports = ({ getSetting, updateSetting, toggleSetting }) => (
  <div>
    <TextInput
      note='List of Text Channel IDs to block, seperated by commas.'
      defaultValue={getSetting('idlist', '')}
      onChange={val => updateSetting('idlist', val)}
    >
      ID List
    </TextInput>
  </div>
);
