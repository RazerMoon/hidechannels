const { React } = require('powercord/webpack');
const { ContextMenu } = require('powercord/components');
const showChannel = require('../utils/showChannel');

// Stripped down version of this: https://github.com/userXinos/image-tools/blob/main/components/Button.jsx
module.exports = class RemoveHiddenChannelsButton extends React.PureComponent {
  static render (props) {
    const itb = new RemoveHiddenChannelsButton(props);
    return itb.renderContextMenu();
  }

  get items () {
    return this.props.settings.get('details').filter((item) => item.guild_id === this.props.guild_id);
  }

  renderContextMenu () {
    const [ res ] = ContextMenu.renderRawItems([ {
      type: 'submenu',
      id: 'remove-hidden-channels',
      name: 'Show Hidden Channel',
      items: this.getSubMenuItems(),
      getItems () {
        return this.items;
      }
    } ]);

    return res;
  }

  getSubMenuItems () {
    return this.items.map(({ id, name }) => ({
      type: 'button',
      id: `sub-${id}`,
      name,
      onClick: () => showChannel(id, this.settings)
    }));
  }
};
