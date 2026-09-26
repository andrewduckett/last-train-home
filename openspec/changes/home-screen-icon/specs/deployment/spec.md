## ADDED Requirements

### Requirement: Home-screen icon and app manifest

The site SHALL give phones an app-icon tile: the app's train icon in the board ink color on the board background. The site SHALL take both colors from the palette source. The browser tab icon SHALL show the same tile and SHALL NOT be an emoji.

The site SHALL serve an opaque 180-pixel Apple touch icon and SHALL link it from every page. The site SHALL serve a web app manifest and SHALL link it from every page. The manifest SHALL list 192- and 512-pixel icons and a 512-pixel maskable icon. It SHALL set its theme and background colors to the board color. It SHALL set `display` to `standalone`. It SHALL NOT set `start_url`, so a home-screen icon opens the page the participant added.

Every icon file and the manifest SHALL be same-origin. The committed tile files SHALL match what the palette source and the train icon produce.

#### Scenario: iOS shows the train tile

- **WHEN** a participant adds any crawl to an iPhone home screen
- **THEN** the page links a 180 by 180 pixel PNG Apple touch icon with no transparent pixels
- **THEN** the home-screen icon shows the train tile

#### Scenario: Android shows the train tile

- **WHEN** a participant adds any crawl to an Android home screen
- **THEN** the manifest lists a 192-pixel icon, a 512-pixel icon, and a 512-pixel icon whose purpose is `maskable`
- **THEN** each listed icon file has the size the manifest states

#### Scenario: The home-screen icon opens full screen

- **WHEN** a participant opens the app from its home-screen icon
- **THEN** the app opens without the browser's address bar, and the header fills the top of the screen below the status bar

#### Scenario: The home-screen icon opens the crawl it was added from

- **WHEN** a participant adds `/cory-trent` to the home screen and later opens the icon
- **THEN** the app opens `/cory-trent`
- **THEN** the manifest has no `start_url`

#### Scenario: The tile uses the palette's board colors

- **WHEN** the tile files are generated
- **THEN** the tile background is the palette's `board` color and the train is its `board-ink` color
- **THEN** the manifest's theme and background colors and the page's `theme-color` equal the `board` color

#### Scenario: The browser tab shows the train tile

- **WHEN** a participant opens any crawl in a browser tab
- **THEN** the tab icon is the train tile, and the favicon file contains no emoji

#### Scenario: A stale tile fails the tests

- **WHEN** the palette's board colors or the train icon change and the tile files are not regenerated
- **THEN** the test suite fails and names the stale file

#### Scenario: The icons need no policy change

- **WHEN** the built site loads the manifest and icons
- **THEN** every icon file and the manifest come from the site's own origin, and the Content Security Policy is unchanged
