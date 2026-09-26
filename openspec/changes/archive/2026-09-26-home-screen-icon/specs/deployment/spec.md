## ADDED Requirements

### Requirement: Home-screen icon and app manifest

The site SHALL give phones an app icon: the train icon in the board ink color on a square of the board color. The site SHALL take both colors from the palette source. The browser tab icon SHALL be the same app icon and SHALL NOT be an emoji.

The site SHALL serve the app icon as an opaque 180-pixel Apple touch icon and SHALL link it from every page. The site SHALL serve a web app manifest and SHALL link it from every page. The manifest SHALL list the app icon at 192 and 512 pixels, and again as a 512-pixel maskable icon. It SHALL set its theme and background colors to the board color. It SHALL set `display` to `standalone`. It SHALL NOT set `start_url`, so the home-screen app opens the page the participant added.

The manifest and every app icon file SHALL be same-origin. The build SHALL fail when a committed app icon file or the manifest does not match what the palette source and the train icon produce.

On Android, the site SHALL rely on Chrome's menu option to install the app. It SHALL NOT depend on Chrome offering an install prompt. Checks on a real iPhone and a real Android phone SHALL confirm the home-screen scenarios before the repository owner merges the change.

#### Scenario: iOS shows the app icon

- **WHEN** a participant adds any crawl to an iPhone home screen
- **THEN** the page links a 180 by 180 pixel PNG Apple touch icon with no transparent pixels
- **THEN** the home-screen icon shows the train on the board color

#### Scenario: Android shows the app icon

- **WHEN** a participant installs any crawl from Chrome's menu on an Android phone
- **THEN** the manifest lists a 192-pixel icon, a 512-pixel icon, and a 512-pixel icon whose purpose is `maskable`
- **THEN** each listed icon file has the size the manifest states
- **THEN** the home-screen icon shows the train on the board color

#### Scenario: The home-screen app opens full screen

- **WHEN** a participant opens the app from its home-screen icon on an iPhone or an Android phone
- **THEN** the app opens without the browser's address bar, and the header text sits below the status bar

#### Scenario: The home-screen app opens the crawl it was added from

- **WHEN** a participant adds `/cory-trent` to the home screen of an iPhone or an Android phone and later opens the icon
- **THEN** the app opens `/cory-trent`
- **THEN** the manifest has no `start_url`

#### Scenario: The app icon uses the palette's board colors

- **WHEN** the app icon files are generated
- **THEN** each app icon's background is the palette's `board` color and its train is the `board-ink` color
- **THEN** the manifest's theme and background colors and the page's `theme-color` equal the `board` color

#### Scenario: The browser tab shows the app icon

- **WHEN** a participant opens any crawl in a browser tab
- **THEN** the tab icon is the app icon, and the favicon file contains no emoji

#### Scenario: A stale app icon fails the build

- **WHEN** the palette's board colors or the train icon change and the app icon files are not regenerated
- **THEN** the build fails before it writes the site, and names the stale file

#### Scenario: The app icons need no policy change

- **WHEN** the built site loads the manifest and the app icons
- **THEN** the manifest and every app icon file come from the site's own origin, and the Content Security Policy is unchanged
