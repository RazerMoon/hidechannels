const { Plugin } = require("powercord/entities");
const { React, getModule } = require("powercord/webpack");
const { inject, uninject } = require("powercord/injector");
const { findInReactTree, getOwnerInstance } = require('powercord/util');

const Settings = require("./Settings.jsx");

module.exports = class HideChannels extends Plugin {
  setApi = powercord.api.settings;
  patches = ["textchannel-patch", "voicechannel-patch"];
  moduleNames = ["ConnectedTextChannel", "ConnectedVoiceChannel"]
  moduleError;

  startPlugin() {
    this.moduleError = false;

    this.setApi.registerSettings("hidechannels", {
      category: this.entityID,
      label: "Hide Channels",
      render: Settings,
    });

    this.patchContextMenu()
    this.patchChannels();
  }

  handleHide({id}) {
    let list = this.settings.get("idlist", [""])
    list.push(id)

    this.settings.set("idlist", list)
  }

  async patchContextMenu() {
    // Most of the code yoinked from here https://github.com/21Joakim/copy-avatar-url/blob/master/index.js
    const Menu = await getModule([ 'MenuItem' ]);

    inject('hidden-context-patch', Menu, 'default', (args) => {
      const [ { navId, children } ] = args;

      if (navId !== "channel-context") {
        return args;
      }

      const hasHideChannelItem = findInReactTree(children, child => child.props && child.props.id === 'hide-channel');

      if (!hasHideChannelItem) {
        let channel;

        if (document.querySelector('#channel-context')) {
          const instance = getOwnerInstance(document.querySelector('#channel-context'));
          channel = (instance?._reactInternals || instance?._reactInternalFiber)?.child?.child?.child?.return?.memoizedProps?.children?.props?.channel;
        }

        if (!channel) {
          return args;
        }

        const HideChannelItem = React.createElement(Menu.MenuItem, {
          id: 'hide-channel',
          label: 'Hide Channel',
          action: () => this.handleHide(channel)
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

      return args
    }, true)

    Menu.default.displayName = 'Menu';
  }

  getChannels() {
      // * Further testing may be needed for these
      const textPromise = getModule((m) => (m.__powercordOriginal_default || m.default)?.displayName === "ConnectedTextChannel");
  
      const voicePromise = getModule((m) => (m.__powercordOriginal_default || m.default)?.displayName === "ConnectedVoiceChannel");

      // For context menu
      const itemPromise = getModule((m) => (m.__powercordOriginal_default || m.default)?.displayName === "ChannelListTextChannelContextMenu");
  
      return Promise.all([textPromise, voicePromise, itemPromise]);
  }

  async patchChannels() {
    let channels;

    try {
      // TODO: Add null check
      channels = await this.getChannels()
    } catch (error) {
      this.error("Could not get channel modules! Please restart plugin", error)
      this.moduleError = true
    } 

    if (this.moduleError) return;

    this.patches.forEach((name, index) => {
      inject(name, channels[index], "default", (_, res) => {
        const idlist = this.settings.get("idlist", [""]);

        if (idlist && Array.isArray(idlist) && idlist.includes(res.props.channel.id)) {
          res = React.createElement("p", { style: { display: "none" } });
        }
        return res;
      });
      channels[index].default.displayName = this.moduleNames[index]
    });
  }

  pluginWillUnload() {
    this.setApi.unregisterSettings("hidechannels");

    if (this.moduleError) return;
    this.patches.forEach((name) => uninject(name));
    uninject("hidden-context-patch")
  }
};
