## [0.3.5](https://github.com/justindujardin/angular-rpg/compare/v0.3.4...v0.3.5) (2024-02-22)


### Bug Fixes

* **camera:** clip rect sometimes didn't overlap the whole view ([3c6060b](https://github.com/justindujardin/angular-rpg/commit/3c6060b8d0410472b689fc5171926f083b61d769))
* **camera:** clip rect sometimes didn't overlap the whole view ([bcce85d](https://github.com/justindujardin/angular-rpg/commit/bcce85dc4ff0a488e0c415b0795e841d4fb1bab7))
* **party:** if warrior died the party would have no sprite ([7ae03f8](https://github.com/justindujardin/angular-rpg/commit/7ae03f82eeebc7e137ce6e2954fb11e8a294f529))


### Features

* **combat:** add auto-combat button ([15df6db](https://github.com/justindujardin/angular-rpg/commit/15df6db352b8f63156811187487127becc5ed8fd))
* **combat:** add auto-combat button and setting ([55325a0](https://github.com/justindujardin/angular-rpg/commit/55325a04aaf50c76ecd082ba95b409ad5aa8ef7b))
* **combat:** auto-combat can use items / spells ([a3ec235](https://github.com/justindujardin/angular-rpg/commit/a3ec2359d1c2ee0477d1c77caef7d496ba1f4465))
* **combat:** show players face down if they die ([302417e](https://github.com/justindujardin/angular-rpg/commit/302417eaff613ab9f00dc3170f78e4d7a69da543))
* **point:** add ceil method ([2c95042](https://github.com/justindujardin/angular-rpg/commit/2c950423f0f689dc18b1576ca0956228b3de84c1))
* **state-machine:** add destroy method for state cleanup ([b0a262f](https://github.com/justindujardin/angular-rpg/commit/b0a262f353966ec0b4a41aae83819f9cbc1f42ba))

## [0.3.4](https://github.com/justindujardin/angular-rpg/compare/v0.3.3...v0.3.4) (2024-02-09)


### Features

* update to Angular 17 ([d3c2dc2](https://github.com/justindujardin/angular-rpg/commit/d3c2dc2563535fa32d1daf5e2ce74bd2565c45a4))

## [0.3.3](https://github.com/justindujardin/angular-rpg/compare/v0.3.2...v0.3.3) (2022-11-27)


### Bug Fixes

* **ci:** disable chrome background throttle for tests ([e70f2b2](https://github.com/justindujardin/angular-rpg/commit/e70f2b25dc5ccacd2b15d28a6dc65165364e7073))
* **combat:** only one player can use the same item ([0d866df](https://github.com/justindujardin/angular-rpg/commit/0d866df74d51797a7a1b423ada329e0990babdc2))
* **items:** apply item effects in combat instead of static heal(30) ([08062c7](https://github.com/justindujardin/angular-rpg/commit/08062c7bb2920ce06b055cf4b0ba4de9ead5aabf))


### Features

* **license:** add attribution for OpenGameArt sprites ([d7e416a](https://github.com/justindujardin/angular-rpg/commit/d7e416a5ad9b5897e12c2315186c57b0b82a928f))


### Reverts

* Revert "refactor(combat): remove CombatActionBehavior.select" ([23b4510](https://github.com/justindujardin/angular-rpg/commit/23b4510fdac9012ea89be0962486e4204b69c7dc))

## [0.3.2](https://github.com/justindujardin/angular-rpg/compare/v0.3.1...v0.3.2) (2022-11-23)


### Bug Fixes

* **animated:** fix async playChain ([94bd29c](https://github.com/justindujardin/angular-rpg/commit/94bd29c567c3bd0189799057f1ec194507b6cbb1))


### Features

* **testing:** add testCombatCreateComponent for building testable combat components ([b813191](https://github.com/justindujardin/angular-rpg/commit/b8131911e7ed6cd7fc6bd59cc4f58df3ad7fabb8))

## [0.3.1](https://github.com/justindujardin/angular-rpg/compare/v0.3.0...v0.3.1) (2022-11-07)


### Bug Fixes

* **sprites:** floor sprite render coords to avoid bleeding ([57adc64](https://github.com/justindujardin/angular-rpg/commit/57adc643ac0c53de375560fd77811ca0d5b4a4ed))

# [0.3.0](https://github.com/justindujardin/angular-rpg/compare/v0.2.8...v0.3.0) (2022-11-07)


### Bug Fixes

* **combat:** combat specific drop items were not awarded ([91fdad8](https://github.com/justindujardin/angular-rpg/commit/91fdad86fda0247a7c632a6506f5c1d5fde8b099))
* **combat:** CombatEnemyComponent null error on unload ([1c11a60](https://github.com/justindujardin/angular-rpg/commit/1c11a60366811ea8f5581c256eeb079407136ed7))
* **crypt:** remove unpassable tile from exit ([75c89e2](https://github.com/justindujardin/angular-rpg/commit/75c89e242c153d8e76c3980367c1dba95519694d))
* **store:** issue where selling would sell all you inventory ([ff6458e](https://github.com/justindujardin/angular-rpg/commit/ff6458e097589becee65caea62d4e695b7891316))
* **testing:** allow autoplay without interaction for karma ([9b2b078](https://github.com/justindujardin/angular-rpg/commit/9b2b078aaf294f5de1daeee6f0b46802997e82bb))
* **tile:** issue where setSprite ignored frame parameter ([c904cae](https://github.com/justindujardin/angular-rpg/commit/c904caeb6aebc4c9d92c519b7073da5316e5f1ac))


### Features

* **audio:** require using explicit file extension ([c7c6e67](https://github.com/justindujardin/angular-rpg/commit/c7c6e67f7f9cc910f39bb8209af926afd354ceef))
* **combat:** async act and preloading for actions ([7982793](https://github.com/justindujardin/angular-rpg/commit/79827933391524d3095c59e9b3526cc8cabd43ad))
* **components:** async data preloading for animated ([174870e](https://github.com/justindujardin/angular-rpg/commit/174870ed4c90c0ec0ff0cff86b495a2024f90510))
* **testing:** add app.testing.ts helpers ([53cbfa2](https://github.com/justindujardin/angular-rpg/commit/53cbfa23e81dcf1768b8f82d2691085cfa7a9f47))
* **testing:** add combat.testing.ts helpers ([4593a12](https://github.com/justindujardin/angular-rpg/commit/4593a12a3f593f989fc016bd2bc47cf0adc7122e))
* **testing:** random/fixed combat encounter mocks ([0f4252e](https://github.com/justindujardin/angular-rpg/commit/0f4252e5556074c9a3bb6ae7856392c1638abbde))


### BREAKING CHANGES

* **audio:** You used to be able to specify sound files without an extension, and the audio loader would try all the supported extensions to find the right one. This made more network requests, and left 404 errors in the console for the invalid extensions.

## [0.2.8](https://github.com/justindujardin/angular-rpg/compare/v0.2.7...v0.2.8) (2022-11-04)


### Bug Fixes

* **ship:** A* pathfinding works on water again ([bc0b2fd](https://github.com/justindujardin/angular-rpg/commit/bc0b2fda93c9a36e7950dc7be8f74d68c4613669))

## [0.2.7](https://github.com/justindujardin/angular-rpg/compare/v0.2.6...v0.2.7) (2022-11-04)


### Bug Fixes

* **ship:** ship animations did not work ([77969bf](https://github.com/justindujardin/angular-rpg/commit/77969bf15f49bd79360ad8da482da157ce96a149))

## [0.2.6](https://github.com/justindujardin/angular-rpg/compare/v0.2.5...v0.2.6) (2022-11-04)


### Features

* **game-state:** add GameStateHurtPartyAction ([9cc2ed5](https://github.com/justindujardin/angular-rpg/commit/9cc2ed5cb50193c44fa05541cab52a39917f791d))

## [0.2.5](https://github.com/justindujardin/angular-rpg/compare/v0.2.4...v0.2.5) (2022-11-03)


### Bug Fixes

* **combat-damage:** remove elements when hidden ([22a5e85](https://github.com/justindujardin/angular-rpg/commit/22a5e858a800cfb7accb2052408976de349d9804))
* **temple:** opting to pay for healing did not work ([320034f](https://github.com/justindujardin/angular-rpg/commit/320034f9327909f2a53d35ab77afc9afe837cc7f))

## [0.2.4](https://github.com/justindujardin/angular-rpg/compare/v0.2.3...v0.2.4) (2022-11-01)


### Bug Fixes

* **tilemap:** issue where dark overlay was offset when the map loads ([1625743](https://github.com/justindujardin/angular-rpg/commit/16257434f66ac8182a95e76e93f842d12c5ae517))

## [0.2.3](https://github.com/justindujardin/angular-rpg/compare/v0.2.2...v0.2.3) (2022-11-01)


### Performance Improvements

* **ng:** only write tiled data when source file hashes change ([5560c2d](https://github.com/justindujardin/angular-rpg/commit/5560c2d3772c6449866e22f3c73cea554b453ab7))

## [0.2.2](https://github.com/justindujardin/angular-rpg/compare/v0.2.1...v0.2.2) (2022-10-31)


### Bug Fixes

* **maps:** castle had an invalid tile and port had a blocked exit ([30dd9f3](https://github.com/justindujardin/angular-rpg/commit/30dd9f3d6ce93042236bddb41863f762e7bc363d))


### Features

* **angular:** enable strict template checking ([6495e24](https://github.com/justindujardin/angular-rpg/commit/6495e245e5a1db18c5599d0e5b234cca8bb03746))
* **angular:** update templates with strict checking ([5e75a30](https://github.com/justindujardin/angular-rpg/commit/5e75a304bf0e0fdeca52f77e53bef3d0b486e9df))

## [0.2.1](https://github.com/justindujardin/angular-rpg/compare/v0.2.0...v0.2.1) (2022-10-30)


### Bug Fixes

* **treasure:** non item chests were broken ([816618c](https://github.com/justindujardin/angular-rpg/commit/816618c1b5c046b59f1863a19979275b50ed8d1e))

# [0.2.0](https://github.com/justindujardin/angular-rpg/compare/v0.1.16...v0.2.0) (2022-10-30)


### Features

* **Events:** use strongly typed event emitters ([dbeb450](https://github.com/justindujardin/angular-rpg/commit/dbeb450372588c8ba20ca12d3e92478f5d963554))


### BREAKING CHANGES

* **Events:** This removes the string based on/off API that was present on most core game classes in favor of strongly typed event emitters that are compatible with Angular bindings.

This makes the API usage simpler, and adds strong types to emitted events making them more reliable to use in the frontend.

## [0.1.16](https://github.com/justindujardin/angular-rpg/compare/v0.1.15...v0.1.16) (2022-10-30)


### Bug Fixes

* **autosave:** don't save until combat is completed ([6a49c69](https://github.com/justindujardin/angular-rpg/commit/6a49c69cd73afa0e522b51eb748e895587ae346a))


### Features

* **store:** add large potion at castle store ([b6f8246](https://github.com/justindujardin/angular-rpg/commit/b6f8246d5917090536edcfccc3830042c6547ad2))
* **typescript:** enable compiler strict mode ([a88fe5e](https://github.com/justindujardin/angular-rpg/commit/a88fe5eed9217cb5a511ff96ba503755b8a8c25b))

## [0.1.15](https://github.com/justindujardin/angular-rpg/compare/v0.1.14...v0.1.15) (2022-10-29)


### Features

* **map:** add 'dark' for dungeon maps ([cde4d5b](https://github.com/justindujardin/angular-rpg/commit/cde4d5b34b575957aca757103e21de75cba3a6ec))
* **maps:** add music property for background music ([89bd42f](https://github.com/justindujardin/angular-rpg/commit/89bd42f414f01ab339ce5f7062c1093c19dfc659))

## [0.1.14](https://github.com/justindujardin/angular-rpg/compare/v0.1.13...v0.1.14) (2022-10-29)


### Features

* **store:** add custom icons for each store type ([5763d73](https://github.com/justindujardin/angular-rpg/commit/5763d7387b3f42d3d6b200f03b1bdea8b16a8150))

## [0.1.13](https://github.com/justindujardin/angular-rpg/compare/v0.1.12...v0.1.13) (2022-10-27)


### Features

* **tiled:** add template Tiled editor project ([cf689b2](https://github.com/justindujardin/angular-rpg/commit/cf689b265f03ca212158ae95107591aa6f4968f4))

## [0.1.12](https://github.com/justindujardin/angular-rpg/compare/v0.1.11...v0.1.12) (2022-10-27)


### Features

* **inventory:** only show equippable items for each player ([8c7d3e6](https://github.com/justindujardin/angular-rpg/commit/8c7d3e6ce6d635b5ecd44e4d2d0395fffc310b46))
* **store:** automatically equip single item purchases ([033b8d5](https://github.com/justindujardin/angular-rpg/commit/033b8d5ccc4fda1ea3fc706c174c9743cac0fceb))
* **store:** make mobile responsive and scrollable ([8608f8a](https://github.com/justindujardin/angular-rpg/commit/8608f8af4de75477adf2168b723639276b909ff9))
* **store:** show party stat changes from selected items ([a1bdf9f](https://github.com/justindujardin/angular-rpg/commit/a1bdf9fe508cb9b813d63ee59a0a3a0a1fd311cc))

## [0.1.11](https://github.com/justindujardin/angular-rpg/compare/v0.1.10...v0.1.11) (2022-10-27)


### Bug Fixes

* **inventory:** allow swapping equipment without unequipping first ([73dd417](https://github.com/justindujardin/angular-rpg/commit/73dd41785ad4baa72229ca8c830777ee1e50db81))

## [0.1.10](https://github.com/justindujardin/angular-rpg/compare/v0.1.9...v0.1.10) (2022-10-27)


### Bug Fixes

* **crypt:** make it possible to get to the boss ([4353387](https://github.com/justindujardin/angular-rpg/commit/4353387c9ed3cc81bf95bb7ea82dcf9364ab91db))
* **crypts:** add encounters and fix path to boss ([c83a040](https://github.com/justindujardin/angular-rpg/commit/c83a040f2cef65bef4c4d37ef8d5318ba00347ae))
* **quests:** castle to crypt quest fixes ([1a6c4d1](https://github.com/justindujardin/angular-rpg/commit/1a6c4d1994339908da62ed78c620dd2be4d6a1b5))
* **store:** bug preventing the sale of inventory items ([cbaff8a](https://github.com/justindujardin/angular-rpg/commit/cbaff8a24e67ebf7192d815d1634e018e2f30aa3))


### Features

* add BlockFeatureComponent for static blocks ([e17d795](https://github.com/justindujardin/angular-rpg/commit/e17d795ca5b1e6e7530f112a4158aba9b77b9a55))
* **combat:** add ocean specific combat zones ([1ec920c](https://github.com/justindujardin/angular-rpg/commit/1ec920c7e797d8eaa81381ce27b97e918ba35dc6))
* **combat:** add UI notificaiton if an enemy has no encounter data ([b6b3617](https://github.com/justindujardin/angular-rpg/commit/b6b3617fe61ddde6e59a2003ddbb7ae0ea01e8ab))
* **combat:** fix combat in bryarlake/sewers ([7da7ca3](https://github.com/justindujardin/angular-rpg/commit/7da7ca33ea810472241d9428dd7f885e6559547c))
* **debug-menu:** add "give gold" button that gives 1000 gold ([4d2144d](https://github.com/justindujardin/angular-rpg/commit/4d2144d87394e5f62b1a1471daabbdefb299dfd8))
* **debug-menu:** add dev menu for easier testing ([eb454ce](https://github.com/justindujardin/angular-rpg/commit/eb454ce191d41b41560df3f7daa056e4f63d13db))
* **debug-menu:** add table for game data sources ([3681fde](https://github.com/justindujardin/angular-rpg/commit/3681fdeac696f238f1802610494ed38a44912469))
* **Dialogs:** resolve dialog icon from tile gid if set ([73b0e90](https://github.com/justindujardin/angular-rpg/commit/73b0e909ff8be839d90409ef0b70a9272fa23868))
* **level-up:** combine stat increases into one notification ([c0c29ff](https://github.com/justindujardin/angular-rpg/commit/c0c29ff6e719c4b9172bdecbab6b9a918ad0e282))
* **store:** don't deselect after purchase to allow repeated buys ([3ec3ed6](https://github.com/justindujardin/angular-rpg/commit/3ec3ed6bddea4bd09ff991d05603519107ddeaee))
* **stores:** set store inventory in Tiled editor ([1433933](https://github.com/justindujardin/angular-rpg/commit/1433933d636ce6217cd8d2df04565992de088d54))
* **store:** support buying/selling multiple items at once ([86e2122](https://github.com/justindujardin/angular-rpg/commit/86e21223e7f074422d5c38e793c9c70942b43ab2))
* **tiled:** select target for portals with file picker ([28cc738](https://github.com/justindujardin/angular-rpg/commit/28cc73870cc93c13829d93f9fbf2caa2bd3b01b9))
* **tiled:** write game data to Tiled enums automatically ([59a9c33](https://github.com/justindujardin/angular-rpg/commit/59a9c336cdde5021c5eddf33af3b9ed05e6494cf))
* **village:** add a shop ([daa17d5](https://github.com/justindujardin/angular-rpg/commit/daa17d5ed1da73e697d17877515bee483828346b))

## [0.1.9](https://github.com/justindujardin/angular-rpg/compare/v0.1.8...v0.1.9) (2022-10-14)


### Features

* **ui:** Add autosave feature in settings to save after combat wins ([#27](https://github.com/justindujardin/angular-rpg/issues/27)) ([0282470](https://github.com/justindujardin/angular-rpg/commit/02824704e27fdd3a4fb872acdda370e0f114e618)), closes [#26](https://github.com/justindujardin/angular-rpg/issues/26)

## [0.1.8](https://github.com/justindujardin/angular-rpg/compare/v0.1.7...v0.1.8) (2022-08-28)


### Features

* **tiled:** add Ctrl-F shortcut to follow a selected map portal ([18d4271](https://github.com/justindujardin/angular-rpg/commit/18d42715071db835233f70da33821e840ba2f11b))
* **tiled:** add Tiled editor project file ([7bbeb94](https://github.com/justindujardin/angular-rpg/commit/7bbeb94b5e22feeaa1681ae04c8f958060dee52f))
* **tiled:** add Tiled property types for most map features ([6d91b32](https://github.com/justindujardin/angular-rpg/commit/6d91b324d9c893f5042ca50d0353a76ae49e7aaf))
* **tiled:** update maps to 1.9.0 format ([2b0594e](https://github.com/justindujardin/angular-rpg/commit/2b0594e203e80074c18feee0d088f740ef829c31))

## [0.1.7](https://github.com/justindujardin/angular-rpg/compare/v0.1.6...v0.1.7) (2022-08-09)


### Bug Fixes

* **dialog-feature-component:** setting game events and showing alt icons ([6b0799c](https://github.com/justindujardin/angular-rpg/commit/6b0799c88012076a2b62fe27fde8fd481deeeade))
* **game:** port town and goblin fortress questline ([4e4fb65](https://github.com/justindujardin/angular-rpg/commit/4e4fb65ea92353dbb752ab430b62eb3a33c21c46))
* **ship:** restore ship animations ([bf4f2b6](https://github.com/justindujardin/angular-rpg/commit/bf4f2b65942282d769468becefac74f17e1d4ca6))


### Features

* **devtools:** support redux devtools with `useDevTools` ([f49b027](https://github.com/justindujardin/angular-rpg/commit/f49b027b11bffbf81f981ea9efb26193302bca75))
* **environment:** add `alwaysLoadSprites` to force reloading sprite sheets ([e40f855](https://github.com/justindujardin/angular-rpg/commit/e40f8554b1f8250dd7b89dda468ded9fed027bba))
* **goblin-fortress:** add escape passage after goblin-king fight ([f49405f](https://github.com/justindujardin/angular-rpg/commit/f49405f0658551a5904d40ab5b71e5222fd8f76c))

## [0.1.6](https://github.com/justindujardin/angular-rpg/compare/v0.1.5...v0.1.6) (2022-08-08)


### Features

* **angular:** update material to 14.x ([30999dc](https://github.com/justindujardin/angular-rpg/commit/30999dce69922f7b10f9028b9de22347ad973c15))
* **angular:** update to 13.x ([d83a582](https://github.com/justindujardin/angular-rpg/commit/d83a582afdcb15b7a89316aa06aad2be966f5f17))
* **angular:** update to 14.x ([1531b8b](https://github.com/justindujardin/angular-rpg/commit/1531b8baa660fac1cdca0eb2c5225737b7336b90))
* **karma:** update to karma-coverage library for test coverage ([5fce0be](https://github.com/justindujardin/angular-rpg/commit/5fce0be4b27575b982c4e2948cdb78489380ecad))
* **ngrx:** update for angular 13.x ([0a055f9](https://github.com/justindujardin/angular-rpg/commit/0a055f92ca8ad494ef9791c763a697362a8c1221))
* **ngrx:** update to 14.x ([afbb6f5](https://github.com/justindujardin/angular-rpg/commit/afbb6f5be6cae1745fd7f785c4f21ab4108abc92))
* **storybook:** update to 6.x ([8e7cd79](https://github.com/justindujardin/angular-rpg/commit/8e7cd79e19112b8084fb875e735b557654e59c1b))

## [0.1.5](https://github.com/justindujardin/angular-rpg/compare/v0.1.4...v0.1.5) (2022-04-29)


### Bug Fixes

* remove google sheets game data ([cde649f](https://github.com/justindujardin/angular-rpg/commit/cde649f9ae642ee4c3a0a976085dff904847622d))

## [0.1.4](https://github.com/justindujardin/angular-rpg/compare/v0.1.3...v0.1.4) (2021-08-05)


### Bug Fixes

* **combat:** TypeError: setting getter-only property "visible" ([110be14](https://github.com/justindujardin/angular-rpg/commit/110be14507c1b3e9ef301b36116da25bcf04fb06))
* ChangedAfterChecked error when combat starts ([b17452e](https://github.com/justindujardin/angular-rpg/commit/b17452ea8b0064e50e08b13a2df7074db1549a2c))

## [0.1.3](https://github.com/justindujardin/angular-rpg/compare/v0.1.2...v0.1.3) (2021-08-05)


### Features

* update to angular@12, rxjs@12 and storybook@6.3.6 ([#18](https://github.com/justindujardin/angular-rpg/issues/18)) ([a734b52](https://github.com/justindujardin/angular-rpg/commit/a734b52c6d35d7c913e3c1e1ca63f37a63cbc579))

## [0.1.2](https://github.com/justindujardin/angular-rpg/compare/v0.1.1...v0.1.2) (2021-03-18)


### Features

* **angular:** update @angular/cdk @angular/material ([b80dfe0](https://github.com/justindujardin/angular-rpg/commit/b80dfe0348895cfcc16d4dc46f4b416f78f9ad75))
* **angular:** update @angular/core and @angular/cli ([572cbe3](https://github.com/justindujardin/angular-rpg/commit/572cbe3400f05d45eec8d7339a979e9dcc128ec9))
* **rxjs:** update @ngrx/store rxjs ([8c6a2af](https://github.com/justindujardin/angular-rpg/commit/8c6a2af58bcdc6dc83e8b9a2822eb926696f7004))

## [0.1.1](https://github.com/justindujardin/angular-rpg/compare/v0.1.0...v0.1.1) (2020-12-13)


### Bug Fixes

* **ci:** correct repositoryUrl in package.json ([aad9e22](https://github.com/justindujardin/angular-rpg/commit/aad9e229af05d9bb52c810afdd80dbea1036deab))
