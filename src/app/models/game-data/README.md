# Google Sheets data source

The game data is constructed from a published Google Sheet document. The 
sheet that is used is specified in the `game-data.model.ts` file.

Each tab of the google sheet is loaded into a "table" in the redux store as 
a set of entities that can be used as templates to stamp out game instances.

Spreadsheets aren't databases, but in our limited case one can serve as a seed 
for an `@ngrx/store` data-set.  A trade-off is made in terms of scalability to 
offer great ease-of-use when authoring inside of Google's sheet editor.

## TODO

 - cache retrieved game data and bypass the network requests on saved game startup.
