# Webpack Plugins

Angular-RPG extends the angular build process with plugins.

## Sprite Sheet Plugin

This plugin generates spritesheets from source images automatically during `ng serve` and outputs the packed image files during `ng build`. The user never needs to worry about updating spritesheets. Just add new art to the appropriate `src/art/sprites` sub folder.

TODO: Add automatic Tiled Tileset generation for the sprite sheets that is output to the src/ folder directly. This way you don't need to update the tilesets in tiled manually for new sprites.
