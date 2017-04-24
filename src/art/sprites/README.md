# Sprite Sheets

Briefly:
 - Each folder in this directory has a set of source sprite PNGs (usually 16x16 pixels) that are combined into
output sprite sheets (see `source/assets/images/[folder].png`)
 - If there is a `spriteDefaults.json` file in a folder, its properties will be inherited by each image in that path.
 - Each output sprite sheet has a corresponding metadata file that describes where the source sprites are in the
 sheet. (see `source/assets/images/[folder].json`)
 - You can override the cell size for sprites that are not 16x16 (see `./characters/spriteDefaults.json`)
 - Player animations are expressed in the source directories as well (see `characters/magic/spriteDefaults.json`)

# License 

Most of the source sprites are from the excellent E.B.U.R.P. game project:
- http://pents90.github.io/eburp/
- https://github.com/pents90/eburp

```
 Copyright (C) 2013 by John Watkinson

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
```

