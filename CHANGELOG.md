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
