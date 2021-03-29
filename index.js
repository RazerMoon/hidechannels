const { Plugin } = require('powercord/entities');
const { React, getModule } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');
const { findInReactTree, getOwnerInstance } = require('powercord/util');

const Settings = require('./Settings.jsx');

module.exports = class HideChannels extends Plugin {
  startPlugin () {
    this.setApi = powercord.api.settings;
    this.patches = [ 'hidechannels-textchannel-patch', 'hidechannels-voicechannel-patch' ];
    this.moduleNames = [ 'ConnectedTextChannel', 'ConnectedVoiceChannel' ];
    this.moduleError = false;

    this.setApi.registerSettings('hidechannels', {
      category: this.entityID,
      label: 'Hide Channels',
      render: Settings
    });

    this.patchChannels();
    this.patchContextMenu();
  }

  async patchContextMenu () {
    // eslint-disable-next-line no-warning-comments
    // TODO: Update component immediately after hiding so user doesn't have to click somewhere
    // Most of this code is yoinked from here: https://github.com/21Joakim/copy-avatar-url/blob/master/index.js
    const Menu = await getModule([ 'MenuItem' ]);

    inject('hidechannels-context-patch', Menu, 'default', (args) => {
      const [ { navId, children } ] = args;

      if (navId !== 'channel-context') {
        return args;
      }

      const hasHideChannelItem = findInReactTree(children, child => child.props && child.props.id === 'hide-channel');

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
            this.handleHide(channel);
            mute?.();
          }
        });

        const devmodeItem = findInReactTree(children, child => child.props && child.props.id === 'devmode-copy-id');
        const developerGroup = children.find(child => child.props && child.props.children === devmodeItem);

        if (developerGroup) {
          if (!Array.isArray(developerGroup.props.children)) {
            developerGroup.props.children = [ developerGroup.props.children ];
          }

          developerGroup.props.children.push(HideChannelItem);
        } else {
          children.push([ React.createElement(Menu.MenuSeparator), React.createElement(Menu.MenuGroup, {}, HideChannelItem) ]);
        }
      }

      return args;
    }, true);

    Menu.default.displayName = 'Menu';
  }

  handleHide (channel) {
    const list = this.settings.get('idlist', []);
    const details = this.settings.get('details', []);

    if (!list.includes(channel.id)) {
      list.push(channel.id);
    }

    if (!details.some(e => e.id === channel.id)) {
      details.push(channel);
    }

    // eslint-disable-next-line no-warning-comments
    // TODO: Don't update if nothing changed
    this.settings.set('idlist', list);
    this.settings.set('details', details);
  }

  getChannelModules () {
    // * Further testing may be needed for these
    const textPromise = getModule((m) => (m.__powercordOriginal_default || m.default)?.displayName === this.moduleNames[0]);

    const voicePromise = getModule((m) => (m.__powercordOriginal_default || m.default)?.displayName === this.moduleNames[1]);

    return Promise.all([ textPromise, voicePromise ]);
  }

  async patchChannels () {
    let channels;

    try {
      // eslint-disable-next-line no-warning-comments
      // TODO: Add null check and other tests
      channels = await this.getChannelModules();
    } catch (error) {
      this.error('Could not get channel modules! Please restart plugin', error);
      this.moduleError = true;
    }

    if (this.moduleError) {
      return;
    }

    this.patches.forEach((name, index) => {
      inject(name, channels[index], 'default', (_, res) => {
        const idlist = this.settings.get('idlist', []);

        if (idlist.includes(res.props.channel.id)) {
          res = React.createElement('p', { style: { display: 'none' } });
        }

        return res;
      });

      channels[index].default.displayName = this.moduleNames[index];
    });
  }

  pluginWillUnload () {
    this.setApi.unregisterSettings('hidechannels');

    this.patches.forEach((name) => uninject(name));
    uninject('hidechannels-context-patch');
  }
};
