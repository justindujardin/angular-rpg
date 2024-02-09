/// <reference types="@mapeditor/tiled-api" />

interface ICreateDialogTool extends Tool {
  isActive: boolean;
  createDialog: () => Dialog;
  getMaps(): string[];
}

var tool = tiled.registerTool('CreateDialog', {
  name: 'Create Portal',
  icon: 'portal-tool.png',
  isActive: false,
  activated: function () {
    this.isActive = true;
  },

  deactivated: function () {
    this.isActive = false;
  },

  mousePressed: function (button, x, y, modifiers) {
    if (this.isActive) {
      if (button == 1) {
        this.statusInfo = 'cooler stuff';
        this.createDialog();
      } else {
        this.statusInfo = 'not cool';
      }
    }
  },
  createDialog: function (): Dialog {
    const dialog = new Dialog('Create Portal');
    const otherLocations = this.getMaps();

    const target = dialog.addComboBox('Target Location', otherLocations);

    const closeBtn = dialog.addButton('Close');
    closeBtn.clicked.connect(() => {
      dialog.done(Dialog.Accepted);
      this.statusInfo = 'accepted to = ' + otherLocations[target.currentIndex];
    });
    dialog.show();
    return dialog;
  },

  getMaps: function (): string[] {
    const mapsPath = tiled.activeAsset.fileName.substr(
      0,
      tiled.activeAsset.fileName.indexOf('maps/') + 5,
    );
    const files: string[] = File.directoryEntries(mapsPath);
    return files.filter((val) => val.endsWith('.tmx'));
  },
} as ICreateDialogTool);
