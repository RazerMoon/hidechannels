const { React } = require('powercord/webpack');
const { ContextMenu } = require('powercord/components');

class RemoveHiddenChannelsButton extends React.PureComponent {
  static render () {
    const itb = new RemoveHiddenChannelsButton();
    return itb.renderContextMenu();
  }

  get items () {
    // server ids
    return [ '123', '456', '789' ];
  }

  renderContextMenu () {
    const [ res ] = ContextMenu.renderRawItems([ {
      type: 'submenu',
      id: 'remove-hidden-channels',
      name: 'context-name',
      items: this.getSubMenuItems(),
      getItems () {
        return this.items;
      }
    } ]);

    res.props.action = () => console.log('bruh');
    return res;
  }

  getSubMenuItems () {
    const { items } = this;

    if (items.length > 1) {
      return items.map((e) => ({
        type: 'button',
        id: `sub-${e}`,
        name: e,
        onClick: () => console.log('bruh')
      }));
    }
    return this.getBaseMenu();
  }

  getBaseMenu () {
    return [ { type: 'button',
      id: 'open' }, { type: 'button',
      id: 'close' } ];
  }
}

module.exports = RemoveHiddenChannelsButton;
