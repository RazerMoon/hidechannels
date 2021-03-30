const { inject } = require('powercord/injector');
const { React, getModule } = require('powercord/webpack');
const { findInReactTree, getOwnerInstance } = require('powercord/util');

const hideChannel = require('../utils/hideChannel.js');

async function patchChannelCMs (patchName, moduleName) {
  // eslint-disable-next-line no-warning-comments
  // TODO: Update component immediately after hiding so user doesn't have to click somewhere
  // eslint-disable-next-line no-warning-comments
  // TODO: Investigate why patching text channelCM is brokey
  // Most of this code is yoinked from here: https://github.com/21Joakim/copy-avatar-url/blob/master/index.js
  // Useful patch examples https://github.com/userXinos/image-tools/blob/main/index.js

  const Menu = await getModule((m) => (m.__powercordOriginal_default || m.default)?.displayName === moduleName);

  inject(patchName, Menu, 'default', (args) => {
    const [ { navId } ] = args;

    if (navId !== 'channel-context') {
      return args;
    }

    const hasHideChannelItem = findInReactTree(args[0].children, child => child.props && child.props.id === 'hide-channel');

    if (!hasHideChannelItem) {
      let channel;
      let mute;

      // ? Maybe this can be switched to use react instead of dom
      if (document.querySelector('#channel-context')) {
        const instance = getOwnerInstance(document.querySelector('#channel-context'));
        // ? Maybe these can shortened
        channel = (instance?._reactInternals || instance?._reactInternalFiber)?.child.child.child.return?.memoizedProps.children.props.channel;
        const buttons = (instance?._reactInternals || instance?._reactInternalFiber)?.child.child.child.child.child.child.child.memoizedProps.children;

        // eslint-disable-next-line no-warning-comments
        // TODO: Find out how efficient this is
        mute = findInReactTree(buttons, child => child.props && child.props.label === 'Until I turn it back on')?.props.action;
      }

      if (!channel) {
        return args;
      }

      // Category
      if (!(channel.type === 2 || channel.type === 0)) {
        return args;
      }

      const HideChannelItem = React.createElement(Menu.MenuItem, {
        id: 'hide-channel',
        label: 'Hide Channel',
        action: () => {
          hideChannel(channel);
          mute?.();
        }
      });

      const devmodeItem = findInReactTree(args[0].children, child => child.props && child.props.id === 'devmode-copy-id');
      const developerGroup = args[0].children.find(child => child.props && child.props.children === devmodeItem);

      if (developerGroup) {
        if (!Array.isArray(developerGroup.props.children)) {
          developerGroup.props.children = [ developerGroup.props.children ];
        }

        developerGroup.props.children.push(HideChannelItem);
      } else {
        args[0].children.push([ React.createElement(Menu.MenuSeparator), React.createElement(Menu.MenuGroup, {}, HideChannelItem) ]);
      }
    }


    return args;
  }, true);

  Menu.default.displayName = 'Menu';
}

module.exports = patchChannelCMs;
