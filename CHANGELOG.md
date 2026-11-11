## [2.20.0](https://github.com/blueprint-chart/blueprint-chart/compare/v2.19.0...v2.20.0) (2026-11-11)

### Features

* **editor:** add an overlays panel ([d5b872c](https://github.com/blueprint-chart/blueprint-chart/commit/d5b872c58e0ec53e5dd79c9d0fa7589b03088b31))
* **editor:** carry overlays through the chart state ([8ced675](https://github.com/blueprint-chart/blueprint-chart/commit/8ced675d92d8bf2dd4bead564610c726e0275ee1))
* **editor:** edit overlay cues ([e293fb6](https://github.com/blueprint-chart/blueprint-chart/commit/e293fb6a84c946ea8afd13885af1250d321bd97f))
* **editor:** edit overlay repeat and scene overlays ([e3ce8bc](https://github.com/blueprint-chart/blueprint-chart/commit/e3ce8bc0ae6684bcaea3797534310246552e1f7d))
* **editor:** pick the target bar of an overlay ([3336589](https://github.com/blueprint-chart/blueprint-chart/commit/33365896a8656949b53523c37b78dbf2bfcd8f7e))
* **editor:** preview overlays by their repeat ([a106412](https://github.com/blueprint-chart/blueprint-chart/commit/a106412efdbe4152908b3cfd0c09f87169a08eb7))
* **editor:** render scene thumbnails from the chart snapshot ([7358905](https://github.com/blueprint-chart/blueprint-chart/commit/7358905af0fbadba34702d5f241840e7145b4e52))
* **editor:** reuse an overlay column once none is free ([bf825e0](https://github.com/blueprint-chart/blueprint-chart/commit/bf825e0b350201bbbd0a56c72ce7ac2b228c212b))
* **editor:** warn that cue titles are hidden while the legend is off ([40460c9](https://github.com/blueprint-chart/blueprint-chart/commit/40460c954ebd4196d2cb976841109b2079f292f2))
* **editor:** write the overlay repeat to the DSL ([356c219](https://github.com/blueprint-chart/blueprint-chart/commit/356c219f87a80eb9364586bf535182b4bb23bc48))
* **lib:** accept directLabelling on bar-grouped and bar-split ([51ef672](https://github.com/blueprint-chart/blueprint-chart/commit/51ef6721f1c4418fd9a7dc289c82324a8729f4a6))
* **lib:** add an overlay key to vertical bars ([9c7234c](https://github.com/blueprint-chart/blueprint-chart/commit/9c7234c75af8c973d314ac040e1b8ad855a8a243))
* **lib:** add cue entries to the overlay key ([72d41fc](https://github.com/blueprint-chart/blueprint-chart/commit/72d41fc68ee4dd8ebb5df9631c15df82d14fef04))
* **lib:** add NATO and election margin samples ([511c031](https://github.com/blueprint-chart/blueprint-chart/commit/511c031d49c6af52500ad57367e6172b51653fa5))
* **lib:** apply overlay cues to multi-series and stacked bars ([523e07f](https://github.com/blueprint-chart/blueprint-chart/commit/523e07fd1c2b6e7dfbd9b13eff851b8d94236f83))
* **lib:** compute overlay cues per bar ([09518cc](https://github.com/blueprint-chart/blueprint-chart/commit/09518cc914abe84147fe09f6d640d9bf8fcbee49))
* **lib:** describe overlays in the text alternative ([327b8b9](https://github.com/blueprint-chart/blueprint-chart/commit/327b8b96e5ec042f6d86c0d1f395d484adc8e727))
* **lib:** draw overlays in bar-split panels ([1a8e96f](https://github.com/blueprint-chart/blueprint-chart/commit/1a8e96f2062902f48ea491f454b5a98082d48aab))
* **lib:** draw overlays on horizontal bars ([c5d4fb6](https://github.com/blueprint-chart/blueprint-chart/commit/c5d4fb6e57c01ed8bc8e4dd2ed59568c41751aa8))
* **lib:** draw overlays on multi and grouped bars ([a51c900](https://github.com/blueprint-chart/blueprint-chart/commit/a51c9007a845743daf9d97cf251589c6e925b2c2))
* **lib:** draw overlays on stacked bars and columns ([6c5bacc](https://github.com/blueprint-chart/blueprint-chart/commit/6c5bacc266d708f0ae390061ebe7c8bfb490e212))
* **lib:** draw overlays on vertical bars ([7847651](https://github.com/blueprint-chart/blueprint-chart/commit/7847651cbde35a40df3ee1ea7b9b3135b16e7a4f))
* **lib:** fade and recolor single-series bars from overlays ([7a6ca39](https://github.com/blueprint-chart/blueprint-chart/commit/7a6ca3960cdd0f6147c37dbd3517928fc1f81dc5))
* **lib:** let overlays repeat across scenes like annotations ([04aa246](https://github.com/blueprint-chart/blueprint-chart/commit/04aa24600eef7454e2eb1857b8e9123313efdde1))
* **lib:** list overlays in the key of multi-series and stacked bars ([4fdada8](https://github.com/blueprint-chart/blueprint-chart/commit/4fdada89801e64158771e12f69dff8c448eaae62))
* **lib:** parse and serialize the overlay directive ([75f6213](https://github.com/blueprint-chart/blueprint-chart/commit/75f62139c5acfa869e2dd5594728e120824af79e))
* **lib:** parse overlay cue keys ([0a8c584](https://github.com/blueprint-chart/blueprint-chart/commit/0a8c5840fa30da4f3502bdec0a1948869d0e8fbc))
* **lib:** resolve overlays for series and stacked bar types ([01944ec](https://github.com/blueprint-chart/blueprint-chart/commit/01944ec0b03c452dd8fcadf7e1d262e888a7bae0))
* **lib:** resolve overlays through definitions and scenes ([700850e](https://github.com/blueprint-chart/blueprint-chart/commit/700850e6fac16afeaabe7a1fb08a9b047866c2a7))
* **lib:** split overlay columns from bar data ([c79d50e](https://github.com/blueprint-chart/blueprint-chart/commit/c79d50ef6f569bb6b0727a69e29ae68ae97e356d))
* **lib:** warn on overlays that cannot render ([6e61ea0](https://github.com/blueprint-chart/blueprint-chart/commit/6e61ea0a09b1caeae26d0b8520c5c58f5408028c))

### Bug Fixes

* **editor:** clear overlay cue colors ([9d6461d](https://github.com/blueprint-chart/blueprint-chart/commit/9d6461d6391791d56ee73fc8b30b98b4b19a5525))
* **editor:** default the above cue color away from the bar color ([b694556](https://github.com/blueprint-chart/blueprint-chart/commit/b694556009982fb0872e946c57c90fb6103b96b0))
* **editor:** disable adding an overlay when no column is free ([abf163c](https://github.com/blueprint-chart/blueprint-chart/commit/abf163cb663c1c53e189ce85dffd5080a4043d18))
* **editor:** keep base overlays out of the active scene ([ba48515](https://github.com/blueprint-chart/blueprint-chart/commit/ba485158f7d32acd2ba9e16604ea6a25405a175c))
* **editor:** keep single-series bars when extra columns are overlays ([f6ede3a](https://github.com/blueprint-chart/blueprint-chart/commit/f6ede3a1066bc1714d8a040085728355c11ae580))
* **editor:** keep the selected column as the bar when adding overlays ([176fbd2](https://github.com/blueprint-chart/blueprint-chart/commit/176fbd2e839f6dbc794489f4e598d8952f5047a4))
* **editor:** keep typed text in the fade field ([04342ad](https://github.com/blueprint-chart/blueprint-chart/commit/04342ad1f0c9b8105e9d41a0f35ac4accb6c3579))
* **editor:** key overlay items by overlay, not by index ([635b627](https://github.com/blueprint-chart/blueprint-chart/commit/635b627d68cb0338456d4b2799fc1941bd712157))
* **editor:** leave the overlay color empty when unset ([e81f62a](https://github.com/blueprint-chart/blueprint-chart/commit/e81f62a4ed4e90bd8e292f4d589b5af4dee47719))
* **editor:** never pick the bar column for a new overlay ([dfd6833](https://github.com/blueprint-chart/blueprint-chart/commit/dfd6833a7be0650e278189d97e6b7dcb1a1a0e37))
* **editor:** reuse the least used overlay column with a unique title ([37539ff](https://github.com/blueprint-chart/blueprint-chart/commit/37539ff377257c328c24c106982f8542f663cc4f))
* **editor:** share the lib repeat rule and keep hidden overlay columns claimed ([066fe6e](https://github.com/blueprint-chart/blueprint-chart/commit/066fe6e1b8c9f0e4a9d93505115f0e989dac2ea2))
* **editor:** skip columns other shown overlays use when adding one ([a98079e](https://github.com/blueprint-chart/blueprint-chart/commit/a98079e05825673d64c4996f0610ed97d7eb9a8d))
* **editor:** switch overlays back to a single column ([3d401af](https://github.com/blueprint-chart/blueprint-chart/commit/3d401aff496474b2e910f8db276385b0c7ffbb3e))
* **editor:** turn the legend on for the first bar-multi overlay ([e715e96](https://github.com/blueprint-chart/blueprint-chart/commit/e715e96f10c5a856c866b7ca11274120df1c69d8))
* **editor:** write the bar when adding an overlay on a series chart ([da5bc3d](https://github.com/blueprint-chart/blueprint-chart/commit/da5bc3da3c82014c4b9c57fb5c1e68518cb06a29))
* **lib:** align horizontal overlays with bars under category labels ([25d7fb8](https://github.com/blueprint-chart/blueprint-chart/commit/25d7fb8d81b5b51c25a5d3ed9d5c93b9003c7996))
* **lib:** always show the overlay key on bar-multi ([d0a5e02](https://github.com/blueprint-chart/blueprint-chart/commit/d0a5e0221ba9c6500e2de268552f8c1d54236a20))
* **lib:** contrast inside value labels against the colorize color ([553657c](https://github.com/blueprint-chart/blueprint-chart/commit/553657c2b74d163a4f1f7f79b77f8d4b1727ea3d))
* **lib:** contrast-adjust the overlay color with autoContrast ([5400fbc](https://github.com/blueprint-chart/blueprint-chart/commit/5400fbcd9fb1df2bade610f897b10482e648d30a))
* **lib:** describe overlays in exported images ([88471e1](https://github.com/blueprint-chart/blueprint-chart/commit/88471e13354951666a92ae9f45ce4508055a6361))
* **lib:** draw striped overlay ranges as a mask on the bars ([3d9d626](https://github.com/blueprint-chart/blueprint-chart/commit/3d9d6269b3828fbd4d7695a383f631000e3722ec))
* **lib:** drop stale stripe patterns when an overlay moves ([3b031f5](https://github.com/blueprint-chart/blueprint-chart/commit/3b031f5867e61ac287f8cc055377dc4ca0a8ded9))
* **lib:** flag a target title without its own color ([e878e90](https://github.com/blueprint-chart/blueprint-chart/commit/e878e90b5f72c47c058f1b587f743d12ed219e6d))
* **lib:** keep overlay columns claimed in frames that hide the overlay ([78b6254](https://github.com/blueprint-chart/blueprint-chart/commit/78b62547ea2d92329471f62e5ae08e3deb0d3dc0))
* **lib:** keep overlay direct labels on the right row and panel ([31c7958](https://github.com/blueprint-chart/blueprint-chart/commit/31c7958a506e4a2f74da88845856a0994f81e29c))
* **lib:** keep overlay keys stable across scenes ([b3c6868](https://github.com/blueprint-chart/blueprint-chart/commit/b3c6868b52aed9295e053ec53ce2491d09bc9aea))
* **lib:** keep overlay ranges under value markers across scenes ([356787b](https://github.com/blueprint-chart/blueprint-chart/commit/356787bc413e66005ae9a4ec9a01ca944b01b9c7))
* **lib:** keep the bar column in resolved overlay data ([f6ed9fd](https://github.com/blueprint-chart/blueprint-chart/commit/f6ed9fd04a95c8f2eea26198cd42d1d7c1cb3685))
* **lib:** keep the stripes of overlays that share columns ([4ba562b](https://github.com/blueprint-chart/blueprint-chart/commit/4ba562b6cacdce1358a04b839864ae34db12e2f3))
* **lib:** leave overlays on a hidden series out of the key and axis ([0ba5190](https://github.com/blueprint-chart/blueprint-chart/commit/0ba5190320486f195758cab26b917b210c5a651a))
* **lib:** move striped range overlays between scenes ([34a97bb](https://github.com/blueprint-chart/blueprint-chart/commit/34a97bb0e23198649bf83351521b7108cc65e853))
* **lib:** note Iceland's absence in the NATO sample ([2310655](https://github.com/blueprint-chart/blueprint-chart/commit/23106559980ebbe1c69c089cd0f9e7c6e3266416))
* **lib:** place overlay direct labels past the bars or in the key ([99183a4](https://github.com/blueprint-chart/blueprint-chart/commit/99183a41f074f4470d2b26ba2f1debf83ac5b80b))
* **lib:** point overlay warnings at the overlay declaration ([6f9f19a](https://github.com/blueprint-chart/blueprint-chart/commit/6f9f19a86ee83a26f7ab5282e0497c751ac7c665))
* **lib:** read a non-numeric muteIfCrosses as NaN ([0591ec1](https://github.com/blueprint-chart/blueprint-chart/commit/0591ec1ac9174a411e729f92a8c1656afed61286))
* **lib:** read overlay cells by raw column name ([118bfd8](https://github.com/blueprint-chart/blueprint-chart/commit/118bfd8178f5c9c00db5193130327f937a7f6f19))
* **lib:** share the stripes pattern between overlays and their key ([04c6547](https://github.com/blueprint-chart/blueprint-chart/commit/04c654728e7481f0f8ac578f4f3a816dc4d558f0))
* **lib:** show an overlay only in the tooltip of the bar it targets ([edc7019](https://github.com/blueprint-chart/blueprint-chart/commit/edc701969562be9fa96830dc54a966d2ea783d3e))
* **lib:** size overlays to the bar thickness ([dca4037](https://github.com/blueprint-chart/blueprint-chart/commit/dca4037acdc7b21a6ea97703d823ba1fd5314c20))
* **lib:** skip overlay stripe rects with no bound data ([37649c8](https://github.com/blueprint-chart/blueprint-chart/commit/37649c86c594a8283d5d21c1774bb62c7289de40))
* **lib:** slide bar value labels with their bars across scenes ([c012572](https://github.com/blueprint-chart/blueprint-chart/commit/c0125728616ab4cc7724c2f2192e91b99c36a0e1))
* **lib:** use the cue-aware fill for bar-multi inside direct labels ([0fe86b7](https://github.com/blueprint-chart/blueprint-chart/commit/0fe86b7e511b128377de02ef2ff58f272007f999))
* **lib:** warn for every overlay that shares an issue ([9312fde](https://github.com/blueprint-chart/blueprint-chart/commit/9312fdec4f9c1b873c0ee1f79d72dd3b0698862f))

## [2.19.0](https://github.com/blueprint-chart/blueprint-chart/compare/v2.18.0...v2.19.0) (2026-11-09)

### Features

* **editor:** add autoplay, loop and pace controls to the scene player panel ([c189ffb](https://github.com/blueprint-chart/blueprint-chart/commit/c189ffb0af7c27bbccc29f487ba602653f01522a))
* **editor:** autoplay, pace and loop in the preview and render page ([e8f7f91](https://github.com/blueprint-chart/blueprint-chart/commit/e8f7f91414c3598659b6b90a964498444e7fd0ba))
* **editor:** do not autoplay scenes in the editor preview ([a757906](https://github.com/blueprint-chart/blueprint-chart/commit/a757906398a8e80332c8407b7fabf8b6b775578b))
* **editor:** read and write scene playback properties ([8d45ce6](https://github.com/blueprint-chart/blueprint-chart/commit/8d45ce6165be86719ec82d0280a865905c914f0b))
* **lib:** add a shared scene playback helper ([91bfef5](https://github.com/blueprint-chart/blueprint-chart/commit/91bfef53eb2aed39497a8603737a44b56283a25e))
* **lib:** autoplay, pace and loop in the embedded scene player ([df03a95](https://github.com/blueprint-chart/blueprint-chart/commit/df03a95b7ddb632cbbd7fad63acddbfa8f714c95))
* **lib:** validate scene playback properties ([9c49cbc](https://github.com/blueprint-chart/blueprint-chart/commit/9c49cbc23a6517c549f7d09428fabc1eb523c54a))
* **ui:** add a description to FormControlCheckbox ([f4d7394](https://github.com/blueprint-chart/blueprint-chart/commit/f4d7394d27d8853837080345e7f4328397827e1c))

### Bug Fixes

* **editor:** autoplay charts imported from a file ([31e6f46](https://github.com/blueprint-chart/blueprint-chart/commit/31e6f46e5ce5203c28f6eb41c49cbcac51ed6100))
* **editor:** autoplay once per chart load ([8ead9b0](https://github.com/blueprint-chart/blueprint-chart/commit/8ead9b083850eeb45a9947fef5c6fc7ee5ec70d5))
* **editor:** do not autosave or record history during scene playback ([a6f13db](https://github.com/blueprint-chart/blueprint-chart/commit/a6f13db94755dccae2ed41d6af9d4ff137319d00))
* **editor:** keep the scene duration within 1 to 10 seconds ([1c1fba7](https://github.com/blueprint-chart/blueprint-chart/commit/1c1fba77998ba8db3a8ff44dd14ec21e0a83ee0e))
* **editor:** let the scene duration box be cleared ([126df71](https://github.com/blueprint-chart/blueprint-chart/commit/126df71318d0f3a72999cd1b07118299269bb734))
* **editor:** re-check autoplay when the render page chart becomes visible ([e327b89](https://github.com/blueprint-chart/blueprint-chart/commit/e327b897fd32978726efcc660b9a15d26de2af5a))
* **editor:** show the autoplay note under its switch label ([58d2eb1](https://github.com/blueprint-chart/blueprint-chart/commit/58d2eb134678474b435ba9789901bf932513fd96))
* **editor:** stop scene playback on unmount and record edits made during it ([b1e7236](https://github.com/blueprint-chart/blueprint-chart/commit/b1e7236cdb594eff03f10464c4a1039a53fe4e79))
* **lib:** apply a new scene duration to the pending scene ([92d021f](https://github.com/blueprint-chart/blueprint-chart/commit/92d021f625d005b59be82028b8a23d8146027190))
* **lib:** fall back to 3 s for a non-number scene duration ([4ad2016](https://github.com/blueprint-chart/blueprint-chart/commit/4ad2016b036cd96ba17000398478f9c584fd20a9))
* **lib:** harden scene playback timing and autoplay visibility ([c9a90ae](https://github.com/blueprint-chart/blueprint-chart/commit/c9a90aea7862817e54afbf85b47048d401f80237))
* **lib:** mount no controls for player none during autoplay ([d119fcc](https://github.com/blueprint-chart/blueprint-chart/commit/d119fcc9c34db77872022fdce06f0457aca3665d))
* **lib:** validate scene playback keys once and as booleans ([3f8b7ad](https://github.com/blueprint-chart/blueprint-chart/commit/3f8b7ad22c8db6f2fa34a6c9dc165d51459e9615))

## [2.18.0](https://github.com/blueprint-chart/blueprint-chart/compare/v2.17.1...v2.18.0) (2026-11-09)

### Features

* **lib:** add plain-DOM scene players matching the editor ([e40aee0](https://github.com/blueprint-chart/blueprint-chart/commit/e40aee0aae454ff4cd8c7c6a0ab8adb94070f208))
* **lib:** add scene playback to the embedded player ([b29868a](https://github.com/blueprint-chart/blueprint-chart/commit/b29868a6ae0601d435288974c10fb533b9c6280b))
* **lib:** add shared scene player stylesheet ([c1eae56](https://github.com/blueprint-chart/blueprint-chart/commit/c1eae5658b53f2f7784cbc68152c9b86380b6e6d))
* **lib:** render the editor scene player in embedded charts ([d027c65](https://github.com/blueprint-chart/blueprint-chart/commit/d027c65af685b90d89ba8402d2943f0ab9ad900f))

### Bug Fixes

* **build:** keep auto-imports out of the built lib ([fc806c1](https://github.com/blueprint-chart/blueprint-chart/commit/fc806c1557e7ae7d57e2ae41781b4cf532ed65f6))
* **lib:** dispatch player actions on data attributes and keep focus in the player ([bf74239](https://github.com/blueprint-chart/blueprint-chart/commit/bf74239bdb5d8245d1ab65b1302c88f4e05e33f7))
* **lib:** keep focus on the player when a scene re-renders the frame ([1220422](https://github.com/blueprint-chart/blueprint-chart/commit/12204225abb6e665c31fa2c1f0a053da6b1b9474))
* **lib:** keep the light player inside a light preview on a dark page ([3ba4821](https://github.com/blueprint-chart/blueprint-chart/commit/3ba4821faefe33d7c95132e099d078cf256264eb))
* **lib:** leave room for the player in constrained embedded charts ([d5a7d51](https://github.com/blueprint-chart/blueprint-chart/commit/d5a7d511108e7a25fadb98549ef11e22c9941404))
* **lib:** report errors from the embed's constrained re-render ([4da7fc6](https://github.com/blueprint-chart/blueprint-chart/commit/4da7fc634b69a95993c8af9ee211abf27a0e4a8e))
* **ui:** share scene player styles with lib and fix dark mode ([2c28c5f](https://github.com/blueprint-chart/blueprint-chart/commit/2c28c5f94f294fbd2d75554d33102972779357e2))
* **ui:** ship scene player styles in the built stylesheet ([eb529b2](https://github.com/blueprint-chart/blueprint-chart/commit/eb529b25505cfcebf598d930ff7042db503aeae6))

## [2.17.1](https://github.com/blueprint-chart/blueprint-chart/compare/v2.17.0...v2.17.1) (2026-11-09)

### Bug Fixes

* **lib:** add scene navigation to embedded charts ([6302b54](https://github.com/blueprint-chart/blueprint-chart/commit/6302b542d3765f23aab0e9c5ff550aefee34702b))

## [2.17.0](https://github.com/blueprint-chart/blueprint-chart/compare/v2.16.0...v2.17.0) (2026-11-08)

### Features

* **editor:** move the auto-resize toggle into each embed block with a description ([04b15b1](https://github.com/blueprint-chart/blueprint-chart/commit/04b15b150b7967c9048e0c8d65c280bfbe23837a))
* **editor:** put the embed resize script on its own line ([012b324](https://github.com/blueprint-chart/blueprint-chart/commit/012b3249d6814e4134c0d70a6ab8dff05135d656))

## [2.16.0](https://github.com/blueprint-chart/blueprint-chart/compare/v2.15.0...v2.16.0) (2026-11-08)

### Features

* **editor:** make the embed auto-resize script optional ([06d12c5](https://github.com/blueprint-chart/blueprint-chart/commit/06d12c5c31492886d480d330227986de8e0cd55b))

### Bug Fixes

* **editor:** offset the form check focus ring from the checked box ([20677be](https://github.com/blueprint-chart/blueprint-chart/commit/20677be4e38f31b6bab2babb4a2ef39eff9f6586))
* **editor:** paint the canvas surface behind frameless scene thumbnails ([e3ab408](https://github.com/blueprint-chart/blueprint-chart/commit/e3ab408d5f86c18f0f962e3ca3131f6ce1e2029d))

## [2.15.0](https://github.com/blueprint-chart/blueprint-chart/compare/v2.14.0...v2.15.0) (2026-11-07)

### Features

* **lib:** add area fill baseline option to fill down to zero on line and area charts ([9b284a7](https://github.com/blueprint-chart/blueprint-chart/commit/9b284a7cfc9e46e8ccbcfa3f677a47ba16f11046))
* **lib:** add custom tick values to value axes ([1eea693](https://github.com/blueprint-chart/blueprint-chart/commit/1eea6930fb7ce1153adf8dd075c88e2396d5585e))
* **lib:** connect line gaps for all or selected series ([9d19fa5](https://github.com/blueprint-chart/blueprint-chart/commit/9d19fa5e02f2376a068f01075da915440546274d))

## [2.14.0](https://github.com/blueprint-chart/blueprint-chart/compare/v2.13.0...v2.14.0) (2026-11-07)

### Features

* **lib:** add donut center label options for slice share, custom text and total caption ([35076b6](https://github.com/blueprint-chart/blueprint-chart/commit/35076b66929c29514a73c9001c725cd75a17cd4b))
* **lib:** add dot plot label choices for start, end, difference and change ([cb15293](https://github.com/blueprint-chart/blueprint-chart/commit/cb15293a7fd851322a557f35ea03af46bd70d4b8))
* **lib:** add negative color option to vertical bar charts ([51eec75](https://github.com/blueprint-chart/blueprint-chart/commit/51eec75209c9a9d01e27366679eebbe131787056))
* **lib:** sort dot plot rows by last column or percent change ([a5ff41f](https://github.com/blueprint-chart/blueprint-chart/commit/a5ff41f28b9d21af0d8c237d6ffe0dd9421145d7))
* **lib:** sort multi-series bars by series with reverse and within-groups ([08b4f70](https://github.com/blueprint-chart/blueprint-chart/commit/08b4f703845f298551570435f4c8a34489493640))

### Bug Fixes

* **editor:** shorten the get the data toggle label ([b1b56cc](https://github.com/blueprint-chart/blueprint-chart/commit/b1b56cc2daa25353065e1e8ad7e7abfcbba20870))
* **editor:** type the dot plot labels fallback as a string ([a14b95a](https://github.com/blueprint-chart/blueprint-chart/commit/a14b95a58b29aaebf29ff772495e65f44b49d9af))

## [2.13.0](https://github.com/blueprint-chart/blueprint-chart/compare/v2.12.0...v2.13.0) (2026-11-07)

### Features

* **editor:** add get the data link toggle to the text panel ([eb15f3f](https://github.com/blueprint-chart/blueprint-chart/commit/eb15f3ff6f81e94b32507d08e98546872e1e5253))
* **editor:** add show total toggle to the stacking section ([d5b8674](https://github.com/blueprint-chart/blueprint-chart/commit/d5b86744bb757682e3a09987af8cbba60f4b33e3))
* **editor:** make the copied iframe embed snippet resize itself ([dab09e0](https://github.com/blueprint-chart/blueprint-chart/commit/dab09e0e559d00ae3a6bc00f1d8569a453394417))
* let authors write the chart alt text ([4b88b86](https://github.com/blueprint-chart/blueprint-chart/commit/4b88b864e3f6aceb3da9cedba05f1daa12181dab))
* **lib:** add opt-in get the data footer link with csv download ([53fcf0b](https://github.com/blueprint-chart/blueprint-chart/commit/53fcf0bb9b66076a361497538eb3d5272e136d74))
* **lib:** add showTotal labels above column-stacked columns ([ffa33c1](https://github.com/blueprint-chart/blueprint-chart/commit/ffa33c1ab4188f78065cc332be76a2311d8405f6))
* **lib:** add value label point selection, format and color to line charts ([6ecd699](https://github.com/blueprint-chart/blueprint-chart/commit/6ecd699c7a9f832a92f453efc8496e963ed82242))
* **lib:** add value-label number format to pie and donut ([1f8684e](https://github.com/blueprint-chart/blueprint-chart/commit/1f8684e0f9cc089b60208a04f1d30a4b9222ba75))
* **lib:** apply vertical number format to bar-multi and column-stacked value labels ([4ce22a0](https://github.com/blueprint-chart/blueprint-chart/commit/4ce22a0b47dd823a49f5ef670e54653302c827f5))
* **lib:** follow prefers-color-scheme when no theme is set ([de8ba48](https://github.com/blueprint-chart/blueprint-chart/commit/de8ba4854858be071af5df804f530b0713b0bf8f))

## [2.12.0](https://github.com/blueprint-chart/blueprint-chart/compare/v2.11.0...v2.12.0) (2026-11-07)

### Features

* **lib:** register barGap and areaFillOpacity on types whose renderers read them ([13fa2cf](https://github.com/blueprint-chart/blueprint-chart/commit/13fa2cfb715a8e82afc06e13d991b89179a48965))

### Bug Fixes

* **lib:** grow bar-split bars from the zero baseline for signed values ([b23c967](https://github.com/blueprint-chart/blueprint-chart/commit/b23c9671e0e82e629a92cef9a91ca0d658493ea5))
* **lib:** honor valueLabelPosition in column-stacked ([5486581](https://github.com/blueprint-chart/blueprint-chart/commit/5486581fb065dae88332e2f61dc0248e71789a9e))

## [2.11.0](https://github.com/blueprint-chart/blueprint-chart/compare/v2.10.0...v2.11.0) (2026-11-07)

### Features

* **editor:** add a dumbbell or range style toggle to dot plot settings ([734bfe3](https://github.com/blueprint-chart/blueprint-chart/commit/734bfe3ef4d16a1b69a2ce164c2c0d5c09008869))
* **editor:** add a preview section to the export view picker ([7e2a47c](https://github.com/blueprint-chart/blueprint-chart/commit/7e2a47c28e15f2980139223c4e3b36aba8110c32))
* **editor:** add dot plot settings and sort choices ([cee79d0](https://github.com/blueprint-chart/blueprint-chart/commit/cee79d0893d1edf98e3ac7c6b80fe0f6eb6f745b))
* **editor:** add dot plot to the chart picker ([36bfde7](https://github.com/blueprint-chart/blueprint-chart/commit/36bfde7367f92eb7179c132fe8fce849c8d2d4d9))
* **editor:** add dot plot to the chart type grid ([bdc528c](https://github.com/blueprint-chart/blueprint-chart/commit/bdc528c650ea26721e4c9b5432876f0d450dbd68))
* **editor:** add skeleton article wrapper for the export preview ([c91f76b](https://github.com/blueprint-chart/blueprint-chart/commit/c91f76bd7540e1a8aa1a0204dab07fc818271f92))
* **editor:** filter samples by chart family ([4937094](https://github.com/blueprint-chart/blueprint-chart/commit/493709453673a9da025501f0dbe0311c0dbf8909))
* **editor:** frame the article preview as a news page ([f40a519](https://github.com/blueprint-chart/blueprint-chart/commit/f40a519e4beaf448ee5a7a3c19b3c5ab0ba5572e))
* **editor:** pick chart type from a grouped thumbnail grid ([03c3b0f](https://github.com/blueprint-chart/blueprint-chart/commit/03c3b0ffb39f6a850b4a209bdffa7eb4a409645b))
* **editor:** pick dot plot arrow direction with icon buttons ([9e99b22](https://github.com/blueprint-chart/blueprint-chart/commit/9e99b227b528a0eb4caf09251f4520d7474dd1f6))
* **editor:** preview the exported chart inside a skeleton article ([fa202bb](https://github.com/blueprint-chart/blueprint-chart/commit/fa202bbeab10f90a30d6edcf3a2b67e48c054d3b))
* **editor:** remember the export preview context ([b024815](https://github.com/blueprint-chart/blueprint-chart/commit/b02481580df0dcc9be39781363870dbf92bce5e6))
* **editor:** run the article preview edge to edge on narrow screens ([88d1183](https://github.com/blueprint-chart/blueprint-chart/commit/88d118311637b6c2c7170802d8ca4beba24ef402))
* **editor:** show data column and stack mode in style tab ([41add1f](https://github.com/blueprint-chart/blueprint-chart/commit/41add1f1fd5ca96f6b8bf60274bba89fcf7827f2))
* **editor:** show samples as a gallery below the upload card ([4bc4d9a](https://github.com/blueprint-chart/blueprint-chart/commit/4bc4d9affa4c9f32efe26390b438ad25fc029f6d))
* **editor:** store the export preview context ([976610d](https://github.com/blueprint-chart/blueprint-chart/commit/976610da9c67a6e907f21e9969cb1e2a5d8c8c72))
* **lib:** add dot plot arrows, labels, tooltips and emphasis ([00bc475](https://github.com/blueprint-chart/blueprint-chart/commit/00bc47500708294e1d724daa70bb69882a475237))
* **lib:** add dot plot chart type ([20c0271](https://github.com/blueprint-chart/blueprint-chart/commit/20c0271be7d06f4eb2b93278ac19cb2b72d5ddd4))
* **lib:** add dot plot samples ([82472a6](https://github.com/blueprint-chart/blueprint-chart/commit/82472a6b22e89e219a9482dd09a0ec0f0500fb72))
* **lib:** anchor point annotations around a mark centre ([b532fbb](https://github.com/blueprint-chart/blueprint-chart/commit/b532fbb0c81edaa8dc10c4b9b374787cc484b792))
* **lib:** animate dot plot marks between scenes ([2e199a7](https://github.com/blueprint-chart/blueprint-chart/commit/2e199a7d42d26778ee67936db912e719cf4f2f9d))
* **lib:** build and sort dot plot rows ([04e5339](https://github.com/blueprint-chart/blueprint-chart/commit/04e5339f4ec768d65d9f72b1d9348ac9c7591351))
* **lib:** centre category ranges on the mark centre line ([aedec25](https://github.com/blueprint-chart/blueprint-chart/commit/aedec25e5deeaff2ae0b19609c6b0aa1c96ac802))
* **lib:** choose dot plot arrow direction with none, forward, backward or both ([cb36ac7](https://github.com/blueprint-chart/blueprint-chart/commit/cb36ac7709cf83721ef24cf0189d48c555fa93f5))
* **lib:** move dot plot annotations across scenes ([c2b507b](https://github.com/blueprint-chart/blueprint-chart/commit/c2b507beae5d0addd727a790822233d9e08322b4))
* **lib:** pick the dot plot style explicitly with dotStyle ([a8532e0](https://github.com/blueprint-chart/blueprint-chart/commit/a8532e009af48096b52ed8a267a612a9b3832f98))
* **lib:** recommend dot plot for range questions ([ce45898](https://github.com/blueprint-chart/blueprint-chart/commit/ce458983f25304e4be1322b109161d790760c882))
* **lib:** render annotations on dot plots ([7c5db1b](https://github.com/blueprint-chart/blueprint-chart/commit/7c5db1b525073b14140f1d76cb56ba88245793ed))
* **lib:** resolve dot plot column mapping ([896f273](https://github.com/blueprint-chart/blueprint-chart/commit/896f273ede0e684c328508872ea9b290f124ea30))
* **lib:** set dotStyle to range in the poll sample and recommendation ([0eb31bb](https://github.com/blueprint-chart/blueprint-chart/commit/0eb31bbbbda098a1f759f6d1a072d6c4d5a0bfe8))
* **lib:** validate dot plot mapping and rows ([10902a2](https://github.com/blueprint-chart/blueprint-chart/commit/10902a2f3451ddc6942b6d32e586945ac59ce5cb))
* **ui:** label and badge for dot plot ([fbf40cf](https://github.com/blueprint-chart/blueprint-chart/commit/fbf40cfb943a10b8d292c02f296115466146ec45))

### Bug Fixes

* **editor:** bake the chart frame background into scene thumbnails ([cfd8d29](https://github.com/blueprint-chart/blueprint-chart/commit/cfd8d2969bbe5cca7b6bb5de6f1df9320d5a625c))
* **editor:** clear the high column when low takes it ([059f62a](https://github.com/blueprint-chart/blueprint-chart/commit/059f62a1a3c2ed6670113349fdb3ef68aca2c1f1))
* **editor:** drop sort modes the new chart type lacks ([c622e2a](https://github.com/blueprint-chart/blueprint-chart/commit/c622e2a5382eb1f93b512ee4c440477e4b1655ed))
* **editor:** drop the leftover Google Fonts link ([f8b4af1](https://github.com/blueprint-chart/blueprint-chart/commit/f8b4af19a9a1ee6cb83ed4b9bf13514e82381f7f))
* **editor:** drop the unreachable sort mode fallback and restore the ascending icon ([d7d7942](https://github.com/blueprint-chart/blueprint-chart/commit/d7d7942c95d2b1a81839fa5a24cc17c4d3613b74))
* **editor:** float the view toolbar above the chart on narrow screens ([7dae6af](https://github.com/blueprint-chart/blueprint-chart/commit/7dae6af196aec9adf067b57550aa50b013a98aa5))
* **editor:** follow the app theme and fit wide charts in the article preview ([313c8c1](https://github.com/blueprint-chart/blueprint-chart/commit/313c8c12d6b84eb6ee3d4c9c0644557b62efc5a4))
* **editor:** force the preview card light only on a dark canvas ([a9292ce](https://github.com/blueprint-chart/blueprint-chart/commit/a9292cea99b700de53f0a9612c4e88bb3356be7e))
* **editor:** hide the sample gallery once data is loaded or a scene is active ([61feb9f](https://github.com/blueprint-chart/blueprint-chart/commit/61feb9f1429fbf4b89a31a2b9c54badf20541ed9))
* **editor:** keep article skeleton bars visible on the auto canvas ([ecf5089](https://github.com/blueprint-chart/blueprint-chart/commit/ecf5089ffefbe4bf9e04baf1eb7c7748ba1561fe))
* **editor:** keep chart type badges above the 12px type floor ([c1e67b2](https://github.com/blueprint-chart/blueprint-chart/commit/c1e67b249e278788f638889c7dba727e0fc510fb))
* **editor:** keep sample previews in colour on touch screens ([2e5c36d](https://github.com/blueprint-chart/blueprint-chart/commit/2e5c36d4d957466291f487df7583296f436bf13f))
* **editor:** keep sample thumbnails mounted when switching filters ([f121a46](https://github.com/blueprint-chart/blueprint-chart/commit/f121a462d7127e7ba67f457a3b20cfb110707c0f))
* **editor:** keep the floating scene timeline on the app theme ([7a09cd8](https://github.com/blueprint-chart/blueprint-chart/commit/7a09cd83457b3d85e94efc19421c85134ee60c9b))
* **editor:** keep the low column out of the high picker ([7cfa47a](https://github.com/blueprint-chart/blueprint-chart/commit/7cfa47a38304077fb9537e48da4637277c54bf5b))
* **editor:** keep the remembered export preview context valid across resets ([dec2624](https://github.com/blueprint-chart/blueprint-chart/commit/dec262463dd9e6f614b437892ae2929fd1fcab73))
* **editor:** pick chart type with toggle buttons instead of radios ([72fc9da](https://github.com/blueprint-chart/blueprint-chart/commit/72fc9da7f299be1041e3aec36a1a241931589df3))
* **editor:** re-measure canvas dimensions when the preview context changes ([377dc08](https://github.com/blueprint-chart/blueprint-chart/commit/377dc08a451ce375aab6631938d8ffdc5f4cc729))
* **editor:** render scene thumbnails with the canvas theme ([c239490](https://github.com/blueprint-chart/blueprint-chart/commit/c239490d6c439167e0a8767366db69dca32dc27d))
* **editor:** render the auto export canvas like its matching theme mode ([daeca86](https://github.com/blueprint-chart/blueprint-chart/commit/daeca8607897e96329192ce5b9f1ae5d6d0dd14b))
* **editor:** resolve the auto canvas mode on the edit step and use the theme ruler colors ([94976b8](https://github.com/blueprint-chart/blueprint-chart/commit/94976b80fa8aad1f4ff967d4f7666b754421b129))
* **editor:** show a valid data column without storing a default ([6babe45](https://github.com/blueprint-chart/blueprint-chart/commit/6babe450d5037964265f2739c409a19b49377e9f))
* **editor:** theme the chart preview with the canvas mode ([05ec4cb](https://github.com/blueprint-chart/blueprint-chart/commit/05ec4cb52632a43cbf2041c106a12fdaf65e27c8))
* **editor:** use sentence case for the sample gallery heading ([a6248f5](https://github.com/blueprint-chart/blueprint-chart/commit/a6248f54f5d14e17e9bf60073e4d8025b18cc7ca))
* **editor:** use SortMode enum in chart type options test ([8ba3c15](https://github.com/blueprint-chart/blueprint-chart/commit/8ba3c15533cd395f9c1ef538ad3628221007634b))
* **lib:** accept swapped low and high bounds in the dot plot range warning ([ff02334](https://github.com/blueprint-chart/blueprint-chart/commit/ff02334c837e26e8af902bc9e93072dcf312be29))
* **lib:** cap chart tooltip width ([0c03fb1](https://github.com/blueprint-chart/blueprint-chart/commit/0c03fb145f578347cb33ea9387521a8775847e25))
* **lib:** color dot plot tooltip swatches with colorize ([9e6c564](https://github.com/blueprint-chart/blueprint-chart/commit/9e6c564f0374065fea641e8fc450bc010ebdf370))
* **lib:** detect snake_case low and high column names ([cf7a9ee](https://github.com/blueprint-chart/blueprint-chart/commit/cf7a9ee915a55b9816a9feedf0ce36c3c08ca3ae))
* **lib:** draw both arms of the dot plot arrowhead ([143538b](https://github.com/blueprint-chart/blueprint-chart/commit/143538bcb27ebb460dab87e560dc7fe3e1eb1e2a))
* **lib:** drop hidden horizontal axis parts when a scene transition starts ([e0eeac2](https://github.com/blueprint-chart/blueprint-chart/commit/e0eeac22492cbcbc673663d84e53fe2c0932b9cd))
* **lib:** hide the annotation line when showLine is off ([1cd9e41](https://github.com/blueprint-chart/blueprint-chart/commit/1cd9e41d01ade0b5007c5a299934ec507e66cce9))
* **lib:** keep the dot plot arrowhead at the end of the line ([11bc94b](https://github.com/blueprint-chart/blueprint-chart/commit/11bc94b1b9486adfffb0280adefdcb6529b7165b))
* **lib:** make room inside the dot plot for value labels ([aeb00cb](https://github.com/blueprint-chart/blueprint-chart/commit/aeb00cbf6f350360c69f4b2f38d94a68279ea399))
* **lib:** name the dot plot sample source in full ([e934cb6](https://github.com/blueprint-chart/blueprint-chart/commit/e934cb6afac882cec569fa99891f6359fcf9f2ad))
* **lib:** skip dot plot annotations on rows without values ([6b01f0a](https://github.com/blueprint-chart/blueprint-chart/commit/6b01f0a9de92e0a2b3d115ae1662b26deacd00f5))
* **lib:** stop dark chart themes at nested light sections ([6f76115](https://github.com/blueprint-chart/blueprint-chart/commit/6f76115529c281fab7cbeb0dbc6c0962fc6cae93))
* **lib:** stop dark chart themes at nested light sections without [@scope](https://github.com/scope) ([d8ef488](https://github.com/blueprint-chart/blueprint-chart/commit/d8ef488aa03640fef3ebe5a64068a8a88cfecb7b))
* **lib:** tween annotation labels and range bands across scenes ([be3e26a](https://github.com/blueprint-chart/blueprint-chart/commit/be3e26aad0f1e9f009fc9cbfa8c62f3301104620))
* **lib:** tween range labels and mid-tween labels from where they are drawn ([3827e15](https://github.com/blueprint-chart/blueprint-chart/commit/3827e150b51c8599d33d93eefc9492c6ba2c18c8))
* **ui:** let a light canvas keep its background inside a dark app ([1429ad7](https://github.com/blueprint-chart/blueprint-chart/commit/1429ad713856af225d3cfff5e17da80194cfa34d))
* **ui:** resolve card and frame border tokens in nested dark sections ([b21bb49](https://github.com/blueprint-chart/blueprint-chart/commit/b21bb494e0c0c1e4573615e0e599cf373064a6b7))

## [2.10.0](https://github.com/blueprint-chart/blueprint-chart/compare/v2.9.0...v2.10.0) (2026-11-06)

### Features

* **editor:** show palette actions like chart actions ([98ca84d](https://github.com/blueprint-chart/blueprint-chart/commit/98ca84d3af8a89bc4cd4cff9e1d05d1103037bb4))

## [2.9.0](https://github.com/blueprint-chart/blueprint-chart/compare/v2.8.0...v2.9.0) (2026-11-06)

### Features

* **ui:** edit a color by clicking its pill in the colors input ([5e0ca75](https://github.com/blueprint-chart/blueprint-chart/commit/5e0ca75ed98fc0582f3b213b0314a82df55d1c34))

## [2.8.0](https://github.com/blueprint-chart/blueprint-chart/compare/v2.7.0...v2.8.0) (2026-11-06)

### Features

* **editor:** offer category colors as swatches in the color picker ([7e6758c](https://github.com/blueprint-chart/blueprint-chart/commit/7e6758cfb0ee5fa4340409761d1acfcbd47c82e7))
* **editor:** use the shared color picker for category colors ([1b40f83](https://github.com/blueprint-chart/blueprint-chart/commit/1b40f835f1d35fcb7ebdd30cc35deb075ccb8386))
* **ui:** replace vue-color with a built-in color picker ([5063ef2](https://github.com/blueprint-chart/blueprint-chart/commit/5063ef219c32977b1e46fedec77b0e666ef4bb6b))

## [2.7.0](https://github.com/blueprint-chart/blueprint-chart/compare/v2.6.0...v2.7.0) (2026-11-06)

### Features

* **editor:** add a live ChartThumbnail that mirrors the editor canvas ([aea16e5](https://github.com/blueprint-chart/blueprint-chart/commit/aea16e50526c6701fdba2b43793a8ae5ff3eb356))
* **editor:** show live thumbnails for dataset charts and the command palette ([0a8ce29](https://github.com/blueprint-chart/blueprint-chart/commit/0a8ce29fcd224b9cdb49d159aa1b7fec7cfa8307))
* **editor:** show live thumbnails in the charts list and side panel ([a9be0d4](https://github.com/blueprint-chart/blueprint-chart/commit/a9be0d4957a080086cc1ae6104a8b2b73008a28f))
* **ui:** let GalleryCard take a custom thumbnail slot ([87740a0](https://github.com/blueprint-chart/blueprint-chart/commit/87740a082ae93e987446d42c3f1a793e7f30470b))

### Bug Fixes

* **editor:** keep cloud dataset chart thumbnails ([9d3ae8a](https://github.com/blueprint-chart/blueprint-chart/commit/9d3ae8a259bf0db3fde73a70db992bf567d446c0))
* **editor:** keep the thumbnail scale at 0 for an empty card ([85925d2](https://github.com/blueprint-chart/blueprint-chart/commit/85925d24adc0432cb3a6b8b1c8a2fd6d4403022a))
* **editor:** refetch a cloud chart once its cloud copy changes ([e4021ed](https://github.com/blueprint-chart/blueprint-chart/commit/e4021ed8a53b7b7aca58fe24a46a27cac45bd281))
* **editor:** render legacy charts in thumbnails and survive render errors ([189998e](https://github.com/blueprint-chart/blueprint-chart/commit/189998eda3794fc6812f912ed2275922ee356d8a))
* **editor:** shrink thumbnail padding in small boxes ([0892176](https://github.com/blueprint-chart/blueprint-chart/commit/0892176f6cb726ca8a2e1ff6a3662ae713b15a85))
* **lib:** keep fractional body sizes unless a transform scales the chart ([173a038](https://github.com/blueprint-chart/blueprint-chart/commit/173a03835e8588b09f1b8503f064041e5337988b))
* **lib:** measure the chart body in layout pixels, not transformed ones ([d27b90b](https://github.com/blueprint-chart/blueprint-chart/commit/d27b90b8fdba2170482899784bf88b574077addb))

### Performance Improvements

* **editor:** keep only visible thumbnails rendered ([71aa2db](https://github.com/blueprint-chart/blueprint-chart/commit/71aa2db7730de2ff244386bc7f11d622417e147c))
* **editor:** parse thumbnails only once they are visible ([a299b36](https://github.com/blueprint-chart/blueprint-chart/commit/a299b362137de6f944fbead6f5f510eb3f4be748))
* **editor:** reuse loaded cloud chart DSLs on refresh ([40c20f4](https://github.com/blueprint-chart/blueprint-chart/commit/40c20f40b6e625d85968f143b8c69bf68c2b8f36))

## [2.6.0](https://github.com/blueprint-chart/blueprint-chart/compare/v2.5.1...v2.6.0) (2026-11-06)

### Features

* **editor:** add scatter columns and points settings ([d14f67b](https://github.com/blueprint-chart/blueprint-chart/commit/d14f67be53f3e4fc6ed94c87afbd4cee705edee4))
* **editor:** add scatter to the chart picker ([e8674fc](https://github.com/blueprint-chart/blueprint-chart/commit/e8674fc84c4f887743172cc7f8c153c4c93fa881))
* **editor:** show validation warnings as lint warnings ([35e0cb9](https://github.com/blueprint-chart/blueprint-chart/commit/35e0cb9282ac7d6158dbe4fb8bfbfeb4793f83ae))
* **lib:** add life expectancy vs wealth scatter sample ([af8f5f1](https://github.com/blueprint-chart/blueprint-chart/commit/af8f5f12c874fb7993bed0827632938aa690a649))
* **lib:** add scatter chart type ([788eba5](https://github.com/blueprint-chart/blueprint-chart/commit/788eba52d5293b61cdb177ba850c168e208d285b))
* **lib:** add scatter group, size and trend legends ([7bf1431](https://github.com/blueprint-chart/blueprint-chart/commit/7bf1431fba7ca064df381f0cc5070250fc3831d3))
* **lib:** add scatter tooltips with 2D nearest-point lookup ([c161d75](https://github.com/blueprint-chart/blueprint-chart/commit/c161d75788508f3cd0242bd9feb54822324bd98e))
* **lib:** add true log10 and symlog scales for scatter ([66c371e](https://github.com/blueprint-chart/blueprint-chart/commit/66c371ec1867a1a845c317f739345975f65a0ad5))
* **lib:** animate scatter points between scenes ([d59c9e6](https://github.com/blueprint-chart/blueprint-chart/commit/d59c9e6c30d0ee99c52b3c8a0c53ca7c802082d0))
* **lib:** build scatter points and report dropped rows ([a8af22f](https://github.com/blueprint-chart/blueprint-chart/commit/a8af22f2d0f72b1f5fd98ebd53df978e47bb1baf))
* **lib:** dim other scatter groups when hovering a legend item ([e640420](https://github.com/blueprint-chart/blueprint-chart/commit/e6404207fc03fa62390be0179a4b543b51cfe715))
* **lib:** draw scatter trend lines ([3b45697](https://github.com/blueprint-chart/blueprint-chart/commit/3b456973ad6a32a3c3eb90793331289f6614e0ad))
* **lib:** fit scatter trend lines in display space ([6816507](https://github.com/blueprint-chart/blueprint-chart/commit/6816507ce25d39ebbbdf51b2450bf46be6ae397a))
* **lib:** highlight, colorize and label scatter points ([6fca7a2](https://github.com/blueprint-chart/blueprint-chart/commit/6fca7a24aed6c58b3f88261ca7fe4d3a16c0065b))
* **lib:** infer scatter column mapping ([42dd0c5](https://github.com/blueprint-chart/blueprint-chart/commit/42dd0c5f0e2f5c63a7f639c8616c4f42811b7835))
* **lib:** keep text columns in parsed chart data ([c25dad1](https://github.com/blueprint-chart/blueprint-chart/commit/c25dad1e06437ec959e2d511dadfd992479f6479))
* **lib:** keep text columns through scene transforms ([c063588](https://github.com/blueprint-chart/blueprint-chart/commit/c063588cd441e38630afdb2d61a4d0c42ab56d58))
* **lib:** recommend scatter for relationship questions ([d8f5728](https://github.com/blueprint-chart/blueprint-chart/commit/d8f572831daacbfa90ba72476a037f7053203dbd))
* **lib:** validate scatter mapping, dropped rows and trend ([db61e51](https://github.com/blueprint-chart/blueprint-chart/commit/db61e5102a29b7b13783818796c2ce8ba6a9f767))
* **ui:** label and badge for scatter ([8a20fdc](https://github.com/blueprint-chart/blueprint-chart/commit/8a20fdc1d9ce171aab6c5603502ee2c464db8826))

### Bug Fixes

* **editor:** generate chart ids outside secure contexts ([5e0e6c6](https://github.com/blueprint-chart/blueprint-chart/commit/5e0e6c68a12aecd9d4b8b7a0f91ceabafc4c59db))
* **editor:** offer scatter points and groups in the highlight section ([74fee0b](https://github.com/blueprint-chart/blueprint-chart/commit/74fee0ba9742c6cc63df7b1e5d1963187a54ab2f))
* **editor:** redraw annotations live while dragging them ([c5c10aa](https://github.com/blueprint-chart/blueprint-chart/commit/c5c10aa131c000b387263d1129857c0f7ae494eb))
* **editor:** render the scatter thumbnail without importing lib ([9df101e](https://github.com/blueprint-chart/blueprint-chart/commit/9df101eb44abf9bc77ddaecb70bf45e8e2d2920c))
* **lib:** animate scatter point labels with their bubbles ([5908473](https://github.com/blueprint-chart/blueprint-chart/commit/5908473267050fe1cc7122d424e2440c97147200))
* **lib:** continue a scene tween when a plain re-render lands mid-tween ([6ccbec5](https://github.com/blueprint-chart/blueprint-chart/commit/6ccbec59b361460a2d74fcbf6d68d768b99f0051))
* **lib:** drop scatter size legend labels that would collide ([708773c](https://github.com/blueprint-chart/blueprint-chart/commit/708773cbf6c82816b22d9df166d15e18e8a488e2))
* **lib:** drop the redundant 2019 scene from the scatter sample ([a8d7b98](https://github.com/blueprint-chart/blueprint-chart/commit/a8d7b98be32c0665069bc0e5eefce37b4fc7b1da))
* **lib:** fit the scatter key and group legend to the plot they frame ([3b257fe](https://github.com/blueprint-chart/blueprint-chart/commit/3b257fe832b37a52d7f5add641ca7427324b47eb))
* **lib:** give each scatter sample region its own color ([13c3ced](https://github.com/blueprint-chart/blueprint-chart/commit/13c3ced0f95f5a71f3498cf944e484eff8c56f96))
* **lib:** honor log range bounds without positive values ([556d128](https://github.com/blueprint-chart/blueprint-chart/commit/556d1281d67ed8fcb6085dbf4a9255ed3f5889d1))
* **lib:** ignore string log range bounds at or below zero ([79dd28f](https://github.com/blueprint-chart/blueprint-chart/commit/79dd28feff7b59bafc0c884570120a9f197151ad))
* **lib:** keep a gap between scatter point labels ([e894165](https://github.com/blueprint-chart/blueprint-chart/commit/e89416515bc31aabd7f770ffab78033f2ffcbc1c))
* **lib:** keep each scatter tooltip tied to its own row ([9c32151](https://github.com/blueprint-chart/blueprint-chart/commit/9c32151b636ba2293c7348e9920ff2c4b1bef0b8))
* **lib:** keep scatter draw order across scenes ([b630ea9](https://github.com/blueprint-chart/blueprint-chart/commit/b630ea92e1853d59e721fde62d0e852a20e400a7))
* **lib:** keep scatter point label line boxes apart ([fa858b2](https://github.com/blueprint-chart/blueprint-chart/commit/fa858b200837c71f73dcbd183a81b4f07512c341))
* **lib:** keep shared log ticks unchanged for scatter ([4a0320a](https://github.com/blueprint-chart/blueprint-chart/commit/4a0320a2bb7133aba837d9063d1dfdae5e822b31))
* **lib:** keep the scatter log scale valid without positive values ([06cf5c8](https://github.com/blueprint-chart/blueprint-chart/commit/06cf5c805c073b96e4d2cf23f2c2591cc698fd5b))
* **lib:** let a point name beat a group name in scatter colorize ([564d823](https://github.com/blueprint-chart/blueprint-chart/commit/564d82342c666e0ef1b7dd9836b40d105b3a6847))
* **lib:** only reserve scatter plot margin for bubbles that reach an edge ([a430097](https://github.com/blueprint-chart/blueprint-chart/commit/a4300971b78a87324bf4e13ac3640b2d357dce33))
* **lib:** place scatter legends outside the plot and honor legend position ([3eee53f](https://github.com/blueprint-chart/blueprint-chart/commit/3eee53f895890a4e05adfcc072cdcbf8b9aeca10))
* **lib:** reserve a taller line box for scatter point labels ([74aca83](https://github.com/blueprint-chart/blueprint-chart/commit/74aca83c03250ceb89e0e92f72cbe9f5beadd94f))
* **lib:** size the scatter hover ring to the hovered bubble ([e25c799](https://github.com/blueprint-chart/blueprint-chart/commit/e25c799320aa26e862730361b3bafda1b90e9191))
* **lib:** stop point annotation lines at the target distance along the line ([eb51247](https://github.com/blueprint-chart/blueprint-chart/commit/eb512473789048cd07d19b05413acabdfb36d66a))
* **lib:** wait for scene tweens to end before fitting the svg to annotations ([860a77d](https://github.com/blueprint-chart/blueprint-chart/commit/860a77d5f20bf579d6e414f2ac0abe2c5aed01ad))

## [2.5.1](https://github.com/blueprint-chart/blueprint-chart/compare/v2.5.0...v2.5.1) (2026-11-06)

### Bug Fixes

* **editor:** list only owned charts in my charts ([58b96b6](https://github.com/blueprint-chart/blueprint-chart/commit/58b96b6a8aa4ce624abac3933a565629d770f7e5))

## [2.5.0](https://github.com/blueprint-chart/blueprint-chart/compare/v2.4.0...v2.5.0) (2026-11-05)

### Features

* **editor:** list datasets from cloud charts ([dc10c04](https://github.com/blueprint-chart/blueprint-chart/commit/dc10c042424e185f8ccb02ebb0128b97e8bd29bd))
* **editor:** render saved chart thumbnails from a given dsl source ([8eb910c](https://github.com/blueprint-chart/blueprint-chart/commit/8eb910cde9286787c74480381b3ce1f436cbec7f))

### Bug Fixes

* **editor:** load owned cloud datasets in one request ([a3146eb](https://github.com/blueprint-chart/blueprint-chart/commit/a3146eb08ebc7525bed8ed21b6b160c19c3b2e01))

## [2.4.0](https://github.com/blueprint-chart/blueprint-chart/compare/v2.3.0...v2.4.0) (2026-11-05)

### Features

* **editor:** add category color matcher ([a799063](https://github.com/blueprint-chart/blueprint-chart/commit/a79906350a6b4e55279a1f8d37104466c2bc7b17))
* **editor:** add category colors store ([1a0651f](https://github.com/blueprint-chart/blueprint-chart/commit/1a0651f60832e1e4c1f06b273db12339e1bfc820))
* **editor:** add category colors tab ([00649bc](https://github.com/blueprint-chart/blueprint-chart/commit/00649bc1b1d8a31e1495c1137d6f1f67fcb491a3))
* **editor:** add custom palettes store ([ade0676](https://github.com/blueprint-chart/blueprint-chart/commit/ade0676a1af8e496a9fae2334de6235f6aa559bd))
* **editor:** add datasets page ([0ec8473](https://github.com/blueprint-chart/blueprint-chart/commit/0ec847382bc9e005d32b026042348912a9f67997))
* **editor:** add palettes page ([99660ba](https://github.com/blueprint-chart/blueprint-chart/commit/99660baf67aeefbdb2c9164dcd3d7e4ad1d4ee4e))
* **editor:** add useDatasets composable ([21dd835](https://github.com/blueprint-chart/blueprint-chart/commit/21dd835c3f9c1b433f32b069266cc08e7c0e0f71))
* **editor:** align the my charts empty state with datasets ([74a1752](https://github.com/blueprint-chart/blueprint-chart/commit/74a17521d3c8e28dab8f918ad52929cd22bdb390))
* **editor:** apply custom palettes and category colors in the editor ([ff89c5f](https://github.com/blueprint-chart/blueprint-chart/commit/ff89c5f9ccadeaf8b5f5ab5d82c0acc7eeaebeda))
* **editor:** derive datasets from saved charts ([41a00c1](https://github.com/blueprint-chart/blueprint-chart/commit/41a00c180216209f25f94b00068ed4d5b326ead6))
* **editor:** edit palettes in the side panel ([80a87d5](https://github.com/blueprint-chart/blueprint-chart/commit/80a87d5adbd3567d4f15e3d305600c435dc9252d))
* **editor:** group datasets that share the same raw data ([bf56b3b](https://github.com/blueprint-chart/blueprint-chart/commit/bf56b3b31f535d7169ddcbff6117ae67fcd01ee6))
* **editor:** keep the pasted source when creating a chart from bpc ([5f2ec7c](https://github.com/blueprint-chart/blueprint-chart/commit/5f2ec7c8882fd2da3e5306d47051bf3dfb289b9c))
* **editor:** let users dismiss or remove applied category colors ([60b4545](https://github.com/blueprint-chart/blueprint-chart/commit/60b45454aab3d8a216c929babd88ddbf5229e871))
* **editor:** list documentation sections in sidebar ([c99bfde](https://github.com/blueprint-chart/blueprint-chart/commit/c99bfde9cb607a53b5e9de35a48df905f11a7580))
* **editor:** list your palettes first in the palette picker ([79c8685](https://github.com/blueprint-chart/blueprint-chart/commit/79c8685221ce64844aa9350ee52a085c9d6be916))
* **editor:** show datasets as cards with pipelines and a detail panel ([5d2b335](https://github.com/blueprint-chart/blueprint-chart/commit/5d2b3359e5dad59d13c7af35aeaafac1e90a61df))
* **editor:** show Palettes in the breadcrumb ([50e3a5a](https://github.com/blueprint-chart/blueprint-chart/commit/50e3a5a739b1b15f896792dd0deceed6bcf3f511))
* **ui:** add title, icon and actions to the empty state ([f8f8988](https://github.com/blueprint-chart/blueprint-chart/commit/f8f8988c2ebb9aa7b32a3d22e81e821238f612ad))

### Bug Fixes

* **editor:** accept readonly store state in palettes consumers ([51557cc](https://github.com/blueprint-chart/blueprint-chart/commit/51557cc1872459b54d1ffedb024478fad6c5ca3e))
* **editor:** confirm before deleting a palette ([0fe52f8](https://github.com/blueprint-chart/blueprint-chart/commit/0fe52f87910af49a367737aa94893d6c149b0b64))
* **editor:** explain palette edit limits instead of dropping them ([f79826b](https://github.com/blueprint-chart/blueprint-chart/commit/f79826b6b17f9af1be2785fb816f8fb2ffacb512))
* **editor:** keep the datasets page up on corrupt storage ([bf586f7](https://github.com/blueprint-chart/blueprint-chart/commit/bf586f703c5243be583d6e88c784360c90d260a1))
* **editor:** make palette chips keyboard reachable ([9654449](https://github.com/blueprint-chart/blueprint-chart/commit/9654449a18dec8e74a35a301f71b29cfdad1f1a1))
* **editor:** match category colors by the key each chart type colors by ([9aaa3fa](https://github.com/blueprint-chart/blueprint-chart/commit/9aaa3faf41ae5578fce2e7d75b0dc60d342d215c))
* **editor:** match datasets panel counts and pipelines to what they show ([1093964](https://github.com/blueprint-chart/blueprint-chart/commit/109396414988d4e6f46d56cfd1d1c53456a7d8fe))
* **editor:** never write a custom palette id into colorPalette ([3de88b1](https://github.com/blueprint-chart/blueprint-chart/commit/3de88b1fef26a82f607a6218875ab5cff7cd2ddd))
* **editor:** respect reduced motion on dataset card and panel hovers ([8adac1e](https://github.com/blueprint-chart/blueprint-chart/commit/8adac1e06fa48b88991a38815b98607a9b529ce9))
* **editor:** show relative last used on datasets ([70df07f](https://github.com/blueprint-chart/blueprint-chart/commit/70df07f96589a8e06bd348745f7b2d66b6192309))
* **editor:** show the picked custom palette in the color picker ([c9edcf0](https://github.com/blueprint-chart/blueprint-chart/commit/c9edcf0ddf51db54f10b02eec429cb7b415bab87))
* **editor:** stop retrying chart thumbnails that fail to render ([534bce3](https://github.com/blueprint-chart/blueprint-chart/commit/534bce344fa3fcb74ae027874ed5980806126e02))
* **editor:** title the palettes page ([f51aa83](https://github.com/blueprint-chart/blueprint-chart/commit/f51aa83345f5250c49971c98efb3e5cbaaa9162d))

## [2.3.0](https://github.com/blueprint-chart/blueprint-chart/compare/v2.2.3...v2.3.0) (2026-11-05)

### Features

* **editor:** group the sidebar account menu and show the full email ([00a5e81](https://github.com/blueprint-chart/blueprint-chart/commit/00a5e8174a539fda4811882a95ae8772a5e2c341))
* **editor:** make the whole sidebar footer row open the account menu ([c8f324c](https://github.com/blueprint-chart/blueprint-chart/commit/c8f324c956d67d5ad9afbed3feae2c528c7f8f7b))
* **editor:** move search, theme toggle and account menu into the sidebar ([2d75323](https://github.com/blueprint-chart/blueprint-chart/commit/2d7532373420fc422f90c7b7a747df6e1310d362))
* **editor:** neutral canvas, drop Blueprint canvas mode ([47ee0cc](https://github.com/blueprint-chart/blueprint-chart/commit/47ee0cc426bbc89d994e8b308a0e2c3b23f7990b))
* **editor:** share the sidebar account menu with the landing navbar ([9851ce4](https://github.com/blueprint-chart/blueprint-chart/commit/9851ce4f07fd6178a4a0613105f8c66e7ccca91c))
* **editor:** vercel-style sidebar footer with account and theme menu ([4767531](https://github.com/blueprint-chart/blueprint-chart/commit/4767531193ce93c5749a91803bbe0292f01f1ff0))
* **ui:** enforce 12px type floor ([982abcd](https://github.com/blueprint-chart/blueprint-chart/commit/982abcd2f0916553f3708852f1cd7082c7527283))

### Bug Fixes

* **a11y:** honor reduced motion, use dvh and fix guard dir matching ([03a483a](https://github.com/blueprint-chart/blueprint-chart/commit/03a483a63828d487c4efca883cceed4530b0e769))
* **a11y:** keep focus on stepper tabs and show ring after keyboard skip ([14d2ab1](https://github.com/blueprint-chart/blueprint-chart/commit/14d2ab11c8ecdeb188a549be7c9394115d81765b))
* **a11y:** keyboard and screen-reader fixes for cards, titles and skip link ([833cf37](https://github.com/blueprint-chart/blueprint-chart/commit/833cf3741d82fbdc91a9a944a3e5a79db7b36a81))
* **a11y:** skip link under hash routing, focus rings, route focus and e2e selectors ([14f6d1f](https://github.com/blueprint-chart/blueprint-chart/commit/14f6d1f57a8cb410472bb862398a79e5cb894d8d))
* **copy:** sentence case labels and docs titles, actionable export and sign-in errors ([c0a3399](https://github.com/blueprint-chart/blueprint-chart/commit/c0a339960c67b91749973ac610bc0829a9ea2e7d))
* **docs:** keep a transparent outline under the focus ring ([c1a3386](https://github.com/blueprint-chart/blueprint-chart/commit/c1a338625d219e00606a1d5fbfd4f4e85d5bb04c))
* **docs:** switch theme without running color transitions ([82414f1](https://github.com/blueprint-chart/blueprint-chart/commit/82414f160e1deb46fc7b4b220967b868a1686489))
* **docs:** use high-contrast code themes and drop Prussian from editor meta ([e8d5f5e](https://github.com/blueprint-chart/blueprint-chart/commit/e8d5f5eade02810526cfb0242947e8ff629b1056))
* **editor:** hide canvas dimensions by default ([092728b](https://github.com/blueprint-chart/blueprint-chart/commit/092728b6776a5ae8d8e59e9d5419d8d7c9cc777d))
* **editor:** include the provider cause in sign-in errors ([ed6b667](https://github.com/blueprint-chart/blueprint-chart/commit/ed6b66711e5c443dbda69607646cda0274dda702))
* **editor:** keep input focus border visible in dark mode ([539748b](https://github.com/blueprint-chart/blueprint-chart/commit/539748b1f47b9ea0462108ee5b7a8f10e332f843))
* **editor:** keep shadows off form controls ([f4ff408](https://github.com/blueprint-chart/blueprint-chart/commit/f4ff40872c3fd72bf22149c6545f5cf8df4888bf))
* **editor:** mount a single sidebar on narrow viewports ([2bbed00](https://github.com/blueprint-chart/blueprint-chart/commit/2bbed001663b9276c5fd1b1d27ec4d2917996b90))
* **editor:** show the account menu above the sidebar offcanvas ([97c7080](https://github.com/blueprint-chart/blueprint-chart/commit/97c708045222da45a06ab6c72b2eb0b7c2eccd04))
* **editor:** show the no-chart message for SVG export too ([b2634ba](https://github.com/blueprint-chart/blueprint-chart/commit/b2634ba854211318aede328aa5fdc5283ff94caa))
* **editor:** skip title and focus updates on failed navigation ([20d8892](https://github.com/blueprint-chart/blueprint-chart/commit/20d889294e2a9c6e2d26da9b2f529fd6dd04582f))
* **editor:** switch theme without running color transitions ([81ff52b](https://github.com/blueprint-chart/blueprint-chart/commit/81ff52b26d2aa2225334e3af58836b24d0a32a53))
* **landing:** render format and mcp panes on page theme, fit 320px header ([2b812c1](https://github.com/blueprint-chart/blueprint-chart/commit/2b812c1685b7dfc45a15f6e570a06250869c0a71))
* **landing:** theme-aware text on primary fills and landing eyebrow assertion ([dc07088](https://github.com/blueprint-chart/blueprint-chart/commit/dc0708857a1e568be29bed27b586cc0164879c32))
* **ui:** always remove the transition freeze style ([27491b4](https://github.com/blueprint-chart/blueprint-chart/commit/27491b43fd9553438e1ec6ef03255872c781c61c))
* **ui:** derive dark primary tints and tertiary text from the neutral ramp ([d4595e1](https://github.com/blueprint-chart/blueprint-chart/commit/d4595e1ab3b33d94b28e7dc61c6684124eabde9d))
* **ui:** fall back to vh when dvh is unsupported for drawer height ([b477b24](https://github.com/blueprint-chart/blueprint-chart/commit/b477b24724ef5be2a23a768a0c0d649e45eebb4a))
* **ui:** keep scene timeline edge rings unclipped ([1d7a12e](https://github.com/blueprint-chart/blueprint-chart/commit/1d7a12e00598d697d612b5aa7f385c07a6e6d6aa))
* **ui:** keep selected ring visible on focused gallery card and move landing footer out of main ([e729aec](https://github.com/blueprint-chart/blueprint-chart/commit/e729aecc23781d46b80b7ee5b50f2bd4683b6b70))
* **ui:** use body background as label color on primary fills ([17edfc7](https://github.com/blueprint-chart/blueprint-chart/commit/17edfc75650c7377fffa7a05599bdf6b729b3c7a))

## [2.2.3](https://github.com/blueprint-chart/blueprint-chart/compare/v2.2.2...v2.2.3) (2026-08-30)

### Bug Fixes

* **editor:** apply review fixes to the typecheck sweep ([14c7dcc](https://github.com/blueprint-chart/blueprint-chart/commit/14c7dcc80725ecc54e4563014ef2da46036f19a7))
* trigger release ([cc6c6c9](https://github.com/blueprint-chart/blueprint-chart/commit/cc6c6c97330bfa9b61b7487ae0c7844d0f39e1f8))

## [2.2.2](https://github.com/blueprint-chart/blueprint-chart/compare/v2.2.1...v2.2.2) (2026-08-29)

### Bug Fixes

* **lib:** place the bottom legend from the granted margin and keep a floor under the label space ([b713218](https://github.com/blueprint-chart/blueprint-chart/commit/b713218bac537a6152b77f1051611b0a4a6dca68))
* **lib:** reserve category-label space consistently around the legend ([b908e16](https://github.com/blueprint-chart/blueprint-chart/commit/b908e16804030bfb0068034e18d8f8ccd7b67102))

## [2.2.1](https://github.com/blueprint-chart/blueprint-chart/compare/v2.2.0...v2.2.1) (2026-08-29)

### Bug Fixes

* **editor:** compose the stashed base pipeline into the Data step while a scene is selected ([370920a](https://github.com/blueprint-chart/blueprint-chart/commit/370920a4114736d073c5a2ba35c26dff4b150c2c))
* **editor:** keep the view toolbar in flow above the canvas at narrow widths ([2e72d85](https://github.com/blueprint-chart/blueprint-chart/commit/2e72d85857299665c4b8cd35d44cf201255a07ba))
* **editor:** make the scene stash idempotent so a deferred watcher re-run cannot wipe the pipeline ([ce7140e](https://github.com/blueprint-chart/blueprint-chart/commit/ce7140ef72488f64f73b196e6731ac0ab080c55c))
* **lib:** clamp the constrained-frame header so the footer and chart keep their room ([091f2c1](https://github.com/blueprint-chart/blueprint-chart/commit/091f2c1b3c9cb29ca64224db103f0025a2d12cdd))

## [2.2.0](https://github.com/blueprint-chart/blueprint-chart/compare/v2.1.0...v2.2.0) (2026-08-29)

### Features

* **editor:** add undo and redo keyboard shortcuts ([9ae27a0](https://github.com/blueprint-chart/blueprint-chart/commit/9ae27a0f1a517fe3a74906c1655bbf1cae8a0841))

### Bug Fixes

* **editor:** apply a scene's transform steps once, composed on the inherited ones ([3fea10c](https://github.com/blueprint-chart/blueprint-chart/commit/3fea10c7267d97621615b442d84e4bfbfdf15ea6))
* **editor:** include the generated type declarations in the typecheck ([3e88c86](https://github.com/blueprint-chart/blueprint-chart/commit/3e88c8663757d78dc5ec8f6b1c41a189b99d4699))
* **editor:** mount the sort section so sort and sortMode have a control ([bbdd2d5](https://github.com/blueprint-chart/blueprint-chart/commit/bbdd2d54733a816f475fdb00d332cca938ebdc5d))
* **editor:** read DSL booleans case-insensitively, report parse errors, and render card art from one source ([723ccf0](https://github.com/blueprint-chart/blueprint-chart/commit/723ccf03f1ddf70091c0ec03b861fb60eca58d64))
* **lib:** give arc slices the value their tooltip prints ([52a3ac5](https://github.com/blueprint-chart/blueprint-chart/commit/52a3ac5fa61c3796d3f72ce44fe27599b0628a8e))
* **lib:** honour the registered sortMode default when rendering ([cd42893](https://github.com/blueprint-chart/blueprint-chart/commit/cd42893e3c824c1ec18d937291709666e05b927c))
* **lib:** join the horizontal grid lines instead of appending them ([4c02394](https://github.com/blueprint-chart/blueprint-chart/commit/4c02394014f4484591045f6d9213670cdc3f9768))
* **lib:** keep a percentage unit through a data table round trip ([8d4f171](https://github.com/blueprint-chart/blueprint-chart/commit/8d4f171983d64ecc1f4e031c5db9a41c67fa2b17))
* **lib:** keep an inside arc label off a band too thin to hold it ([0b59ad9](https://github.com/blueprint-chart/blueprint-chart/commit/0b59ad95dfa529de3ac9df6e4f5e20e7b0b916f5))
* **lib:** keep axis labels legible when the plot goes narrow ([cfaa11e](https://github.com/blueprint-chart/blueprint-chart/commit/cfaa11e50cc200d9b5d64545c7614e1f2b28dcdb))
* **lib:** key line, area and arc marks by series name like the legend ([f3eb586](https://github.com/blueprint-chart/blueprint-chart/commit/f3eb58601571359fb17e6b9f19ba5e584e3a5822))
* **lib:** let line charts fit their data instead of forcing a zero baseline ([2f9fffc](https://github.com/blueprint-chart/blueprint-chart/commit/2f9fffcb281160fa0e49b1164648b06278b9b6b7))
* **lib:** make arc charts honest about totals, slices, labels and annotations ([6f24cfa](https://github.com/blueprint-chart/blueprint-chart/commit/6f24cfa05e517ce4955971d804ba33eace6de696))
* **lib:** measure the last three per-character text estimates ([cbf97b4](https://github.com/blueprint-chart/blueprint-chart/commit/cbf97b4044268d767484b08dab4167780539cb70))
* **lib:** name the series in a multi-series bar tooltip ([5259075](https://github.com/blueprint-chart/blueprint-chart/commit/525907589b3c85e10c530919da7bf0004842e342))
* **lib:** read BPC data the same way in the transform pipeline as in the renderer ([2f066b4](https://github.com/blueprint-chart/blueprint-chart/commit/2f066b47e6d1bc412770cdb78420313b0afe385b))
* **lib:** read the series name the stacked and grouped families actually set ([c6cf0a3](https://github.com/blueprint-chart/blueprint-chart/commit/c6cf0a318c065a5e1bc954b192c6218d557f25a4))
* **lib:** reserve bottom space for rotated labels on the line and area families ([e37f514](https://github.com/blueprint-chart/blueprint-chart/commit/e37f514b5e7747c8a7f16047e5bce31c666b3a41))
* **lib:** ship the constrained-height rules the embed runtime was missing ([2ae58d1](https://github.com/blueprint-chart/blueprint-chart/commit/2ae58d1dc9c51363eead5693d7c2b47a8bc6fdb6))
* **lib:** stop decorative text from swallowing the hover on its own mark ([2acce81](https://github.com/blueprint-chart/blueprint-chart/commit/2acce81957646d9ce52d2d9d7bb3d2887730d722))
* **ui:** give the bottom drawer dialog semantics, Escape and a close button ([7d65ce2](https://github.com/blueprint-chart/blueprint-chart/commit/7d65ce2f82f91539d1e04b0e6c36f20b2e0c1bd4))

## [2.1.0](https://github.com/blueprint-chart/blueprint-chart/compare/v2.0.0...v2.1.0) (2026-08-26)

### Features

* **lib:** add one shared text measurer for the layout estimators ([3dc169e](https://github.com/blueprint-chart/blueprint-chart/commit/3dc169e6369dd6e0894c48bdc8b09d4dd5510c16)), closes [#24](https://github.com/blueprint-chart/blueprint-chart/issues/24) [#29](https://github.com/blueprint-chart/blueprint-chart/issues/29) [#35](https://github.com/blueprint-chart/blueprint-chart/issues/35) [#46](https://github.com/blueprint-chart/blueprint-chart/issues/46)

### Bug Fixes

* **editor:** copy the note frame property out of the DSL ([8d24b06](https://github.com/blueprint-chart/blueprint-chart/commit/8d24b06979f739ffea079860aa56b0cb33f417f7)), closes [#32](https://github.com/blueprint-chart/blueprint-chart/issues/32)
* **editor:** keep localStorage from losing or resurrecting a chart ([c1fb143](https://github.com/blueprint-chart/blueprint-chart/commit/c1fb14398dd41813106dbcb554d98b73e16353c4)), closes [#115](https://github.com/blueprint-chart/blueprint-chart/issues/115) [#116](https://github.com/blueprint-chart/blueprint-chart/issues/116)
* **editor:** keep replace for the first step move off /new ([a188d38](https://github.com/blueprint-chart/blueprint-chart/commit/a188d383b0fd9db99a372960ebff6e6cbb61ea62)), closes [#118](https://github.com/blueprint-chart/blueprint-chart/issues/118)
* **editor:** make /render decode like /copy and say when it cannot ([ce60d4f](https://github.com/blueprint-chart/blueprint-chart/commit/ce60d4f6ef44b6a77cfc577ac607d44ca4e216cf)), closes [#10](https://github.com/blueprint-chart/blueprint-chart/issues/10) [#56](https://github.com/blueprint-chart/blueprint-chart/issues/56) [#117](https://github.com/blueprint-chart/blueprint-chart/issues/117)
* **editor:** persist replaced data when it is loaded, not on step change ([6c1d9ec](https://github.com/blueprint-chart/blueprint-chart/commit/6c1d9ecff7d83345da7cf624cdaef355e3bbd640)), closes [#70](https://github.com/blueprint-chart/blueprint-chart/issues/70)
* **editor:** push wizard steps so browser Back walks them ([6941fe4](https://github.com/blueprint-chart/blueprint-chart/commit/6941fe42895f4ee9307e60313f37f114d4599887)), closes [#118](https://github.com/blueprint-chart/blueprint-chart/issues/118)
* **editor:** put the validator's semantic errors in the lint gutter ([abba83c](https://github.com/blueprint-chart/blueprint-chart/commit/abba83ce8cfae8a7640f7856f63f192f2b253c9d)), closes [#72](https://github.com/blueprint-chart/blueprint-chart/issues/72)
* **lib:** choose horizontal tick density from measured label width ([f67e33e](https://github.com/blueprint-chart/blueprint-chart/commit/f67e33ef1f29e47211faaeaacc592639530c9cec)), closes [#24](https://github.com/blueprint-chart/blueprint-chart/issues/24) [#20](https://github.com/blueprint-chart/blueprint-chart/issues/20)
* **lib:** clamp and clear the annotation viewBox expansion ([eb52612](https://github.com/blueprint-chart/blueprint-chart/commit/eb52612bd23c80a451edd264cb59ea32b155a46f)), closes [#44](https://github.com/blueprint-chart/blueprint-chart/issues/44) [#81](https://github.com/blueprint-chart/blueprint-chart/issues/81)
* **lib:** keep a usable radius when arc labels claim the canvas ([0d2a392](https://github.com/blueprint-chart/blueprint-chart/commit/0d2a392c8664030e1be346a2ff9ad4182dde1842)), closes [#29](https://github.com/blueprint-chart/blueprint-chart/issues/29)
* **lib:** measure legend items instead of counting characters ([1a7f192](https://github.com/blueprint-chart/blueprint-chart/commit/1a7f192651133e4d07508a7e06080a1b4886fd01)), closes [#35](https://github.com/blueprint-chart/blueprint-chart/issues/35)
* **lib:** render a default-sized annotation circle for an unusable circleSize ([322059e](https://github.com/blueprint-chart/blueprint-chart/commit/322059e71297adb0c8482aac087c0dbc7212f97f)), closes [#26](https://github.com/blueprint-chart/blueprint-chart/issues/26) [#121](https://github.com/blueprint-chart/blueprint-chart/issues/121)
* **lib:** resolve range annotation endpoints or draw no band ([683e077](https://github.com/blueprint-chart/blueprint-chart/commit/683e077f93a811b7394bbb8f6ee0044b99ff4a7a)), closes [#48](https://github.com/blueprint-chart/blueprint-chart/issues/48) [#109](https://github.com/blueprint-chart/blueprint-chart/issues/109) [#47](https://github.com/blueprint-chart/blueprint-chart/issues/47)
* **lib:** stop reusing one chart type's axes for the next ([07605b4](https://github.com/blueprint-chart/blueprint-chart/commit/07605b44c8f8f033c0346be58f46f2943850cc67)), closes [#55](https://github.com/blueprint-chart/blueprint-chart/issues/55) [#82](https://github.com/blueprint-chart/blueprint-chart/issues/82)
* **lib:** wrap annotation text with no break opportunity ([600911d](https://github.com/blueprint-chart/blueprint-chart/commit/600911d0cc7e42982d66a1334b4a4d2beff12044)), closes [#46](https://github.com/blueprint-chart/blueprint-chart/issues/46)

## [2.0.0](https://github.com/blueprint-chart/blueprint-chart/compare/v1.8.3...v2.0.0) (2026-08-26)

### ⚠ BREAKING CHANGES

* **lib:** every existing note positioned in percent moves. The old
mapping put an authored `v` at `50 + v` percent of the plot box, so `v + 50`
preserves a note's position, and the old usable range of -50..50 becomes
0..100. The editor's "Add note" default moves from `0, 0` to `50, 50` to keep
landing in the middle of the plot.

### Features

* **lib:** give every chart a text alternative on the plot SVG ([5b3c27d](https://github.com/blueprint-chart/blueprint-chart/commit/5b3c27d5035eff55e762cf1fc5038b249e51dcde)), closes [#87](https://github.com/blueprint-chart/blueprint-chart/issues/87)
* **lib:** render the frame chrome as SVG so toSvg and toPng carry it ([f699361](https://github.com/blueprint-chart/blueprint-chart/commit/f6993615f1863f7729bd51d2a202cf291fe03291)), closes [#9](https://github.com/blueprint-chart/blueprint-chart/issues/9)

### Bug Fixes

* **ci:** install the changelog writer the preset needs, alongside the pinned runtime ([154c7cb](https://github.com/blueprint-chart/blueprint-chart/commit/154c7cb1753ec6c885e95c93dae125696aaa74ae))
* **ci:** pin the changelog preset and install the writer it needs ([cb5ad3d](https://github.com/blueprint-chart/blueprint-chart/commit/cb5ad3d4d759cff211187b522d7f2e8f4aaa776f))
* **ci:** pin the changelog preset to the major the release writer can render ([a057600](https://github.com/blueprint-chart/blueprint-chart/commit/a057600ed626ca3dea74db79922a3cffb5e94730))
* **ci:** run the semantic-release version this repo declares ([6c5d670](https://github.com/blueprint-chart/blueprint-chart/commit/6c5d6701139eab1c844cf97b0e305c16f37ab397))
* **editor:** adopt pre-v2 documents as they stand instead of re-deriving them ([fe44523](https://github.com/blueprint-chart/blueprint-chart/commit/fe445237dfd83201df31bd45ba6873f9d2a43d4e)), closes [#111](https://github.com/blueprint-chart/blueprint-chart/issues/111)
* **editor:** keep a padding value that is not a bare number ([5b5972e](https://github.com/blueprint-chart/blueprint-chart/commit/5b5972e30a42bb398b53672a8f1d93d608efc5df)), closes [#8](https://github.com/blueprint-chart/blueprint-chart/issues/8)
* **editor:** keep the chart data block as the pipeline's source, not its output ([8dc4398](https://github.com/blueprint-chart/blueprint-chart/commit/8dc439829de4d5cb28d179e8387ffb289ac17f2e)), closes [#111](https://github.com/blueprint-chart/blueprint-chart/issues/111) [#112](https://github.com/blueprint-chart/blueprint-chart/issues/112) [#113](https://github.com/blueprint-chart/blueprint-chart/issues/113)
* **editor:** pass sortMode only when it is set, and make the parity harness see it ([553232a](https://github.com/blueprint-chart/blueprint-chart/commit/553232a73bfd5847ecac0e1c25bc57a246166bac)), closes [#93](https://github.com/blueprint-chart/blueprint-chart/issues/93) [#53](https://github.com/blueprint-chart/blueprint-chart/issues/53) [#53](https://github.com/blueprint-chart/blueprint-chart/issues/53) [#111](https://github.com/blueprint-chart/blueprint-chart/issues/111)
* **editor:** rasterise the frame as SVG so the PNG download stops tainting the canvas ([b8ec19a](https://github.com/blueprint-chart/blueprint-chart/commit/b8ec19a6d38659ee07d33322565a7fbe989410d9)), closes [#69](https://github.com/blueprint-chart/blueprint-chart/issues/69)
* **editor:** read transparentBackground case-insensitively ([cc47064](https://github.com/blueprint-chart/blueprint-chart/commit/cc4706447b3789d4ebaca98870b49bd02333dfea)), closes [#98](https://github.com/blueprint-chart/blueprint-chart/issues/98)
* **editor:** route sortMode through the chart-type option it is registered as ([8cda90a](https://github.com/blueprint-chart/blueprint-chart/commit/8cda90aa8c26240154622f4f62d5e1dcc5006a8b)), closes [#53](https://github.com/blueprint-chart/blueprint-chart/issues/53) [#54](https://github.com/blueprint-chart/blueprint-chart/issues/54)
* **editor:** serve the stale optimized chunk instead of a cold-start 504 ([d92f5d0](https://github.com/blueprint-chart/blueprint-chart/commit/d92f5d00ab47f6c873124d89269fa9ae8aa20fb6)), closes [#111](https://github.com/blueprint-chart/blueprint-chart/issues/111)
* **lib:** accept the five layout properties the editor writes ([562ea89](https://github.com/blueprint-chart/blueprint-chart/commit/562ea89b4cee94df6c2b58456befc19f05656fd3)), closes [#51](https://github.com/blueprint-chart/blueprint-chart/issues/51)
* **lib:** bounds-check the direct-label index against the filtered categories ([825068c](https://github.com/blueprint-chart/blueprint-chart/commit/825068c69dd4e2d565948fda2a1e2485891118c8)), closes [#107](https://github.com/blueprint-chart/blueprint-chart/issues/107)
* **lib:** build a value axis per panel on bar-split ([b9c4670](https://github.com/blueprint-chart/blueprint-chart/commit/b9c46709f7adf65bdf2712d0ac1c7035a0a8f249)), closes [#73](https://github.com/blueprint-chart/blueprint-chart/issues/73)
* **lib:** clamp line symbols at zero and reject negative lengths ([58baf15](https://github.com/blueprint-chart/blueprint-chart/commit/58baf15b002caf8d1ed9279df47d44fda890e663)), closes [#26](https://github.com/blueprint-chart/blueprint-chart/issues/26)
* **lib:** clear the library colourblind check for 11 shipped palettes ([92cdaad](https://github.com/blueprint-chart/blueprint-chart/commit/92cdaad06d789bc508a92e633c955fc4d7ab430a)), closes [#63](https://github.com/blueprint-chart/blueprint-chart/issues/63)
* **lib:** compare every autoContrast colour against all the ones before it ([1b83e66](https://github.com/blueprint-chart/blueprint-chart/commit/1b83e66cf7f42f85e0c14841807c8fbef70e88eb)), closes [#ffa91d](https://github.com/blueprint-chart/blueprint-chart/issues/ffa91d) [#803c15](https://github.com/blueprint-chart/blueprint-chart/issues/803c15) [#61](https://github.com/blueprint-chart/blueprint-chart/issues/61)
* **lib:** defer the colors validation and accept an empty frame-choice value ([5210dd9](https://github.com/blueprint-chart/blueprint-chart/commit/5210dd9795504d6934f072f02011aaa0fec4e32a)), closes [#42](https://github.com/blueprint-chart/blueprint-chart/issues/42) [#51](https://github.com/blueprint-chart/blueprint-chart/issues/51) [#58](https://github.com/blueprint-chart/blueprint-chart/issues/58)
* **lib:** draw single-series data on the multi-series bar and area types ([0327086](https://github.com/blueprint-chart/blueprint-chart/commit/03270863567a818dfcc2ca23cbba2eba8b9c28c0)), closes [#43](https://github.com/blueprint-chart/blueprint-chart/issues/43)
* **lib:** escape quoted identifiers on every DSL emit path ([6e48d11](https://github.com/blueprint-chart/blueprint-chart/commit/6e48d1107523c1da14058040cf02e933b899b17d)), closes [#13](https://github.com/blueprint-chart/blueprint-chart/issues/13) [#57](https://github.com/blueprint-chart/blueprint-chart/issues/57)
* **lib:** expand the padding shorthand into per-side custom properties ([0f997bf](https://github.com/blueprint-chart/blueprint-chart/commit/0f997bf8cf98b44c71bb810ea269b966216d3906)), closes [#8](https://github.com/blueprint-chart/blueprint-chart/issues/8)
* **lib:** fit bar-split panel headers and value labels to their panel ([0b6e5d1](https://github.com/blueprint-chart/blueprint-chart/commit/0b6e5d1a301e8f617e291f277b529add559f6773)), closes [#39](https://github.com/blueprint-chart/blueprint-chart/issues/39)
* **lib:** format bar value labels like the axis they belong to ([e3bbf4c](https://github.com/blueprint-chart/blueprint-chart/commit/e3bbf4ce32ffea3553f04958002360f3119faae0)), closes [#23](https://github.com/blueprint-chart/blueprint-chart/issues/23)
* **lib:** give a type-switching scene its own axis label positions ([3291ed9](https://github.com/blueprint-chart/blueprint-chart/commit/3291ed9d7a98d18a012a0cd70ba2ddf1d6dc937e)), closes [#55](https://github.com/blueprint-chart/blueprint-chart/issues/55)
* **lib:** honour explicit newlines in frame title, description and byline ([905d057](https://github.com/blueprint-chart/blueprint-chart/commit/905d05707f8eae02a9882e582eff4dfbd78ecd9a)), closes [#38](https://github.com/blueprint-chart/blueprint-chart/issues/38)
* **lib:** honour the theme option in toSvg and toPng ([1a11c33](https://github.com/blueprint-chart/blueprint-chart/commit/1a11c33574b05233965eae24c2d1a37b0aab7af7)), closes [#65](https://github.com/blueprint-chart/blueprint-chart/issues/65)
* **lib:** interpolate the palette when a chart has more series than colours ([59719ce](https://github.com/blueprint-chart/blueprint-chart/commit/59719ce3f9f4f16f2aef5cf73060be892c9b8a33)), closes [#60](https://github.com/blueprint-chart/blueprint-chart/issues/60)
* **lib:** join the vertical grid lines instead of appending them ([6705517](https://github.com/blueprint-chart/blueprint-chart/commit/67055172e7abcc3aeeaf307c7b748e739725d9b3)), closes [#71](https://github.com/blueprint-chart/blueprint-chart/issues/71)
* **lib:** keep a data row whose label is empty when a transform runs ([1224960](https://github.com/blueprint-chart/blueprint-chart/commit/12249603081111fbdfa7c67cbcbabacec068e120)), closes [#93](https://github.com/blueprint-chart/blueprint-chart/issues/93)
* **lib:** keep a data row whose multi-value cell is quoted ([377e3a2](https://github.com/blueprint-chart/blueprint-chart/commit/377e3a2542ce903bcea53bb3933b73091d041ebd)), closes [#13](https://github.com/blueprint-chart/blueprint-chart/issues/13) [#57](https://github.com/blueprint-chart/blueprint-chart/issues/57)
* **lib:** keep a numeric format off the category axis ([f28424f](https://github.com/blueprint-chart/blueprint-chart/commit/f28424fc7791c8cc95b631094aa42445c182797d)), closes [#106](https://github.com/blueprint-chart/blueprint-chart/issues/106)
* **lib:** keep an empty label, and stop splitting a lone series name ([be4abe2](https://github.com/blueprint-chart/blueprint-chart/commit/be4abe296fc3689b6c9a467c160c633ff25daee7)), closes [#101](https://github.com/blueprint-chart/blueprint-chart/issues/101) [#13](https://github.com/blueprint-chart/blueprint-chart/issues/13)
* **lib:** keep every data row that shares a category label ([5903235](https://github.com/blueprint-chart/blueprint-chart/commit/5903235e66f9173e3a9758834cc2b1dbc616859f)), closes [#22](https://github.com/blueprint-chart/blueprint-chart/issues/22)
* **lib:** keep line and area value labels out of the plot clip ([1e7f010](https://github.com/blueprint-chart/blueprint-chart/commit/1e7f010857d1ada2db664f483e4bbe830eee1a9d)), closes [#21](https://github.com/blueprint-chart/blueprint-chart/issues/21) [#88](https://github.com/blueprint-chart/blueprint-chart/issues/88)
* **lib:** keep the comment that ends a property block ([323500e](https://github.com/blueprint-chart/blueprint-chart/commit/323500ebc2fe434ba723bb2746bdfcf1d74c8b90)), closes [#104](https://github.com/blueprint-chart/blueprint-chart/issues/104)
* **lib:** keep trailing and end-of-block comments through a round trip ([aabaa1f](https://github.com/blueprint-chart/blueprint-chart/commit/aabaa1f09b2d11bb10a8a5cc427b98d2db8cc04f)), closes [#104](https://github.com/blueprint-chart/blueprint-chart/issues/104)
* **lib:** lay a headless render out at the requested width and height ([0db5894](https://github.com/blueprint-chart/blueprint-chart/commit/0db5894096d5fa2a353f05efddd0a964847da8eb)), closes [#7](https://github.com/blueprint-chart/blueprint-chart/issues/7)
* **lib:** let a series lineWidth outrank the .bc-line stylesheet rule ([77a93a4](https://github.com/blueprint-chart/blueprint-chart/commit/77a93a42680e7880157e47368e1884a89b5f7f1b)), closes [#50](https://github.com/blueprint-chart/blueprint-chart/issues/50)
* **lib:** let crosshairColor outrank the .bc-crosshair stylesheet rule ([8c0fb57](https://github.com/blueprint-chart/blueprint-chart/commit/8c0fb578c7751039c9da7e52e8f95bb48cd51600)), closes [#999](https://github.com/blueprint-chart/blueprint-chart/issues/999) [#89](https://github.com/blueprint-chart/blueprint-chart/issues/89)
* **lib:** lift every palette entry off the frame background ([d5d1d19](https://github.com/blueprint-chart/blueprint-chart/commit/d5d1d19031f540c608d05607179a1413b05effed)), closes [#fff](https://github.com/blueprint-chart/blueprint-chart/issues/fff) [#0e0e0e](https://github.com/blueprint-chart/blueprint-chart/issues/0e0e0e) [#1c1c1c](https://github.com/blueprint-chart/blueprint-chart/issues/1c1c1c) [#62](https://github.com/blueprint-chart/blueprint-chart/issues/62)
* **lib:** measure note percentages from the plot box, not its centre ([c0f498d](https://github.com/blueprint-chart/blueprint-chart/commit/c0f498db4ae2414d86517ca1cb23bf39d5cdf0c6)), closes [#45](https://github.com/blueprint-chart/blueprint-chart/issues/45)
* **lib:** move category labels above their bars on narrow stacked, grouped and split bars ([22199fa](https://github.com/blueprint-chart/blueprint-chart/commit/22199fad0ae39546eb81066f0172106ca6351945)), closes [#67](https://github.com/blueprint-chart/blueprint-chart/issues/67)
* **lib:** never under-report the width of a bar-horizontal value label ([33f3fc8](https://github.com/blueprint-chart/blueprint-chart/commit/33f3fc8f7da6f7e56efd58115a1cf1f8f1935bd2)), closes [#110](https://github.com/blueprint-chart/blueprint-chart/issues/110) [#21](https://github.com/blueprint-chart/blueprint-chart/issues/21) [#110](https://github.com/blueprint-chart/blueprint-chart/issues/110)
* **lib:** normalise percent stacking on magnitudes, not on a signed total ([786f205](https://github.com/blueprint-chart/blueprint-chart/commit/786f2059d9901d75bda50cad1f39acff18563db3)), closes [#28](https://github.com/blueprint-chart/blueprint-chart/issues/28)
* **lib:** parse axis range bounds in the unit space of their own axis ([0197034](https://github.com/blueprint-chart/blueprint-chart/commit/0197034479ac2fd9b03381752cf8031a33f4e4bf)), closes [#14](https://github.com/blueprint-chart/blueprint-chart/issues/14)
* **lib:** pass every registered chart option through to the renderer ([70a1b95](https://github.com/blueprint-chart/blueprint-chart/commit/70a1b95d954e59f8aad1a3a8f5a08282b064c3d3)), closes [#102](https://github.com/blueprint-chart/blueprint-chart/issues/102) [#100](https://github.com/blueprint-chart/blueprint-chart/issues/100)
* **lib:** pick the inside value label colour from the segment on column-stacked ([9b600d4](https://github.com/blueprint-chart/blueprint-chart/commit/9b600d4b24fdbc47c432bc31fa6e7cb5a2063b79)), closes [#555](https://github.com/blueprint-chart/blueprint-chart/issues/555) [#40](https://github.com/blueprint-chart/blueprint-chart/issues/40)
* **lib:** place a column value label on the clipped bar, not the raw datum ([3d7c822](https://github.com/blueprint-chart/blueprint-chart/commit/3d7c822bddfcd396bd3d7f7b3c42d2f92523bdd6)), closes [#25](https://github.com/blueprint-chart/blueprint-chart/issues/25)
* **lib:** re-emit a multi-line trailing comment as a block comment ([266b36a](https://github.com/blueprint-chart/blueprint-chart/commit/266b36a6b5647ee605b988ecfdaf3357d7e4ead3)), closes [#104](https://github.com/blueprint-chart/blueprint-chart/issues/104)
* **lib:** read DSL booleans case-insensitively ([fed1bac](https://github.com/blueprint-chart/blueprint-chart/commit/fed1baccbdee9de996d68582c765356b1c61d008)), closes [#98](https://github.com/blueprint-chart/blueprint-chart/issues/98)
* **lib:** read the annotation repeat property case-insensitively ([c72683f](https://github.com/blueprint-chart/blueprint-chart/commit/c72683f3ed16dc0039255d87f3511a0af0ea37a3)), closes [#98](https://github.com/blueprint-chart/blueprint-chart/issues/98)
* **lib:** read the value-axis range and scale type on the stacked families ([579ec50](https://github.com/blueprint-chart/blueprint-chart/commit/579ec5028bd54a4c3b3ea5cf66c066e55c3782b8)), closes [#27](https://github.com/blueprint-chart/blueprint-chart/issues/27)
* **lib:** render a default-sized symbol when lineSymbolSize is not positive ([51d5e9a](https://github.com/blueprint-chart/blueprint-chart/commit/51d5e9a88d03ba74646c8bc8d0444ae3d9f3a7bb)), closes [#26](https://github.com/blueprint-chart/blueprint-chart/issues/26)
* **lib:** render a gap for a bar whose value is not a number ([051bc2e](https://github.com/blueprint-chart/blueprint-chart/commit/051bc2ed60907ae81dd82b4271ff032277632a74)), closes [#52](https://github.com/blueprint-chart/blueprint-chart/issues/52)
* **lib:** render annotations on bar-grouped and bar-split ([aec1074](https://github.com/blueprint-chart/blueprint-chart/commit/aec10747baf3ef5231eb5bb4b0e2348657f823f1)), closes [#108](https://github.com/blueprint-chart/blueprint-chart/issues/108)
* **lib:** reserve headroom for the labels bar-multi stacks above its bars ([c48dde8](https://github.com/blueprint-chart/blueprint-chart/commit/c48dde8a3a91841b1f70d66ec7efc8cf7890bd55)), closes [#11](https://github.com/blueprint-chart/blueprint-chart/issues/11)
* **lib:** reserve the bottom margin whenever the value axis draws its labels ([dc39866](https://github.com/blueprint-chart/blueprint-chart/commit/dc39866324fc11b57b2901e2a197cdd25e3b9aaa)), closes [#110](https://github.com/blueprint-chart/blueprint-chart/issues/110)
* **lib:** return a copy of the memoised chart type defaults ([6afd1c2](https://github.com/blueprint-chart/blueprint-chart/commit/6afd1c29d721e996c3c5843d8f1204cbdd5a9b08)), closes [#103](https://github.com/blueprint-chart/blueprint-chart/issues/103)
* **lib:** run the documented transform types on the render path ([53cb702](https://github.com/blueprint-chart/blueprint-chart/commit/53cb7024719506b717e64b9ea326a18a5e86517c)), closes [#93](https://github.com/blueprint-chart/blueprint-chart/issues/93)
* **lib:** shrink the category label line instead of erasing the bars ([264a4ab](https://github.com/blueprint-chart/blueprint-chart/commit/264a4ab4d448cfe8311f51d417dc5224905406df)), closes [#5](https://github.com/blueprint-chart/blueprint-chart/issues/5)
* **lib:** split series names and colour lists on top-level commas only ([b9b959a](https://github.com/blueprint-chart/blueprint-chart/commit/b9b959af00309391b8d802e61a92af5a3d660618)), closes [#101](https://github.com/blueprint-chart/blueprint-chart/issues/101) [#59](https://github.com/blueprint-chart/blueprint-chart/issues/59)
* **lib:** stop a bar-horizontal value label from being clipped mid-number ([95fc0bc](https://github.com/blueprint-chart/blueprint-chart/commit/95fc0bc4c042817501f1cd42dd9c91202db0e1b0)), closes [#21](https://github.com/blueprint-chart/blueprint-chart/issues/21) [#25](https://github.com/blueprint-chart/blueprint-chart/issues/25)
* **lib:** stop an unparseable color from taking down pie and donut ([cd19dc6](https://github.com/blueprint-chart/blueprint-chart/commit/cd19dc66b035490038ff73e85d00cca115e7aaff)), closes [#58](https://github.com/blueprint-chart/blueprint-chart/issues/58)
* **lib:** stop an unparseable color from throwing out of the CVD check ([1241df0](https://github.com/blueprint-chart/blueprint-chart/commit/1241df0982f49a82a46a5292dcbc50e64ca6a7ca)), closes [#58](https://github.com/blueprint-chart/blueprint-chart/issues/58)
* **lib:** stop recommending bar-split for a range goal on one numeric column ([8b3f927](https://github.com/blueprint-chart/blueprint-chart/commit/8b3f9270894fb70c5239aa43df12bf55dcc8e9e0)), closes [#99](https://github.com/blueprint-chart/blueprint-chart/issues/99)
* **lib:** stop the zero-baseline default from clipping negative data ([d25623d](https://github.com/blueprint-chart/blueprint-chart/commit/d25623d349fc8fb741b91a988b53e07c3628b0a5)), closes [#17](https://github.com/blueprint-chart/blueprint-chart/issues/17)
* **lib:** tick a logarithmic axis by decade ([6efb8e3](https://github.com/blueprint-chart/blueprint-chart/commit/6efb8e37c5aea6d16e1736c61d820273d3556a84)), closes [#19](https://github.com/blueprint-chart/blueprint-chart/issues/19)
* **lib:** treat a highlight target that matches nothing as no highlight ([c61c9cf](https://github.com/blueprint-chart/blueprint-chart/commit/c61c9cf6255af445d33bebaf349bcca93873fb7a)), closes [#64](https://github.com/blueprint-chart/blueprint-chart/issues/64)
* **lib:** treat an unreadable cell as a gap in the line and area family ([7d476e4](https://github.com/blueprint-chart/blueprint-chart/commit/7d476e4df22555d18676822bce3aaeebb738ec8a)), closes [#16](https://github.com/blueprint-chart/blueprint-chart/issues/16)
* **lib:** validate series override blocks, and fix the docs examples they hid ([5447f67](https://github.com/blueprint-chart/blueprint-chart/commit/5447f673a0499a5932fa0c9efcb0de3dcb7e2669)), closes [#80](https://github.com/blueprint-chart/blueprint-chart/issues/80) [#91](https://github.com/blueprint-chart/blueprint-chart/issues/91)
* **lib:** validate theme against the themes that actually exist ([50c5e96](https://github.com/blueprint-chart/blueprint-chart/commit/50c5e960db8ea9e7e50e9317e18d08c33b21bdfc)), closes [#42](https://github.com/blueprint-chart/blueprint-chart/issues/42)

## [1.8.3](https://github.com/blueprint-chart/blueprint-chart/compare/v1.8.2...v1.8.3) (2026-08-14)

## [1.8.2](https://github.com/blueprint-chart/blueprint-chart/compare/v1.8.1...v1.8.2) (2026-08-13)

## [1.8.1](https://github.com/blueprint-chart/blueprint-chart/compare/v1.8.0...v1.8.1) (2026-08-08)

## [1.8.0](https://github.com/blueprint-chart/blueprint-chart/compare/v1.7.0...v1.8.0) (2026-08-08)

## [1.7.0](https://github.com/blueprint-chart/blueprint-chart/compare/v1.6.0...v1.7.0) (2026-08-08)

## [1.6.0](https://github.com/blueprint-chart/blueprint-chart/compare/v1.5.0...v1.6.0) (2026-07-12)

## [1.5.0](https://github.com/blueprint-chart/blueprint-chart/compare/v1.4.0...v1.5.0) (2026-07-12)

## [1.4.0](https://github.com/blueprint-chart/blueprint-chart/compare/v1.3.0...v1.4.0) (2026-07-11)

## [1.3.0](https://github.com/blueprint-chart/blueprint-chart/compare/v1.2.0...v1.3.0) (2026-07-07)

## [1.2.0](https://github.com/blueprint-chart/blueprint-chart/compare/v1.1.0...v1.2.0) (2026-07-06)

## [1.1.0](https://github.com/blueprint-chart/blueprint-chart/compare/v1.0.0...v1.1.0) (2026-07-02)

## [1.0.0](https://github.com/blueprint-chart/blueprint-chart/compare/v0.4.0...v1.0.0) (2026-06-24)

### ⚠ BREAKING CHANGES

* **annotation:** repeat = N means N additional scenes (own + next N)
* **editor:** emit annotation repeat, drop id and visibility verbs from DSL output
* **editor:** remove annotation visibility plumbing from scene model
* **editor:** drop annotation visibility verbs from DSL grammar
* **dsl:** remove annotation id property, validate repeat
* **dsl:** remove annotation visibility verbs and AnnotationVisibility node

### Features

* **annotation:** repeat = N means N additional scenes (own + next N) ([13d0e2e](https://github.com/blueprint-chart/blueprint-chart/commit/13d0e2e2e910fde7b34d62cee414a224c546b173))
* **annotations:** key transitions on internal annotation key ([1ece27d](https://github.com/blueprint-chart/blueprint-chart/commit/1ece27d44462e43f5e82ebf42ab78a2cb68c1ed1))
* **dsl:** parse annotation repeat into AnnotationConfig ([6d79007](https://github.com/blueprint-chart/blueprint-chart/commit/6d79007076a6eae07d396aad54dd5ec57b652027))
* **dsl:** remove annotation id property, validate repeat ([3c5b57e](https://github.com/blueprint-chart/blueprint-chart/commit/3c5b57e8870c066f4e9d0ad86b083e98137fe487))
* **dsl:** remove annotation visibility verbs and AnnotationVisibility node ([0c99a52](https://github.com/blueprint-chart/blueprint-chart/commit/0c99a52a2d7385712863e2670e8a1255c626cda5))
* **editor:** add annotation Repeat control, drop visibility toggle and id ([af329d8](https://github.com/blueprint-chart/blueprint-chart/commit/af329d8a01b901ed8b22a3613b9f835d66c4001b))
* **editor:** add repeat-windowing helper resolveVisibleAnnotations ([c8b5d11](https://github.com/blueprint-chart/blueprint-chart/commit/c8b5d110a82795de7ba560c6d95e987632de2b60))
* **editor:** drop annotation visibility verbs from DSL grammar ([79c2e91](https://github.com/blueprint-chart/blueprint-chart/commit/79c2e91ffbdcc1875cc1a60d67cee57ca5678ec1))
* **editor:** emit annotation repeat, drop id and visibility verbs from DSL output ([36710b1](https://github.com/blueprint-chart/blueprint-chart/commit/36710b1e096b74cb3d4f17e9c78d5d5fcd408499))
* **editor:** origin-grouped annotation editing with key-based selection ([de03d11](https://github.com/blueprint-chart/blueprint-chart/commit/de03d11820e403be25d77ec592f8ac8b582082e3))
* **editor:** remove annotation visibility plumbing from scene model ([a0cf9e8](https://github.com/blueprint-chart/blueprint-chart/commit/a0cf9e808a5b4922f506f29f7e6275436aa90e19))
* **editor:** window preview annotations by repeat ([31961f9](https://github.com/blueprint-chart/blueprint-chart/commit/31961f94b656b175700e799c07490a3ff5ba69df))
* **render:** preserve caller-supplied annotation key in resolveScene ([ec7f258](https://github.com/blueprint-chart/blueprint-chart/commit/ec7f258d6f74d94108b6a0082124610b25393c9c))
* **render:** resolve annotation visibility by repeat window ([b59e4c9](https://github.com/blueprint-chart/blueprint-chart/commit/b59e4c9439aa8839564b26b795bcbde3c6e20dd4))

### Bug Fixes

* **annotation:** anchor top-level annotations at the base/first frame ([4240c03](https://github.com/blueprint-chart/blueprint-chart/commit/4240c0337cb1fe0c7f064a57e731a37137697471))
* **editor:** drag annotations by key, not index, in two-group tab ([0a46a5b](https://github.com/blueprint-chart/blueprint-chart/commit/0a46a5b3502cb30bb45ee6af8ff41da229581072))
* **editor:** label the no-repeat annotation option "Never" not "Once" ([b6afd8e](https://github.com/blueprint-chart/blueprint-chart/commit/b6afd8e24925690404edbd9b562f87e5f91e4ed2))
* **editor:** refresh MCP landing copy-link for updated letter-frequency sample ([20a66c4](https://github.com/blueprint-chart/blueprint-chart/commit/20a66c497de16d3f3a96c86055140b440b13cdc9))

## [0.4.0](https://github.com/blueprint-chart/blueprint-chart/compare/v0.3.0...v0.4.0) (2026-06-21)

### Features

* add compactSerializeDeep for top-level default purging ([5182184](https://github.com/blueprint-chart/blueprint-chart/commit/5182184d31ad77a52cc8fc78f375655745c6d1d3))
* add floating purge-defaults button to the DSL editor ([94e9d97](https://github.com/blueprint-chart/blueprint-chart/commit/94e9d974d8d66bd70cccc7efc89df345fe0fb2bf))
* add value-label fit helper for bar charts ([be7d5a6](https://github.com/blueprint-chart/blueprint-chart/commit/be7d5a6320faa590bf2fda8537da6516e3122065))
* auto-fit value labels on grouped and stacked column charts ([32c24ed](https://github.com/blueprint-chart/blueprint-chart/commit/32c24edf4286420f894134bdf05ded375c66952f))
* auto-fit value labels on horizontal grouped, stacked, and split bars ([a97fb51](https://github.com/blueprint-chart/blueprint-chart/commit/a97fb510aa1ab1b462915bada724379d61335b8a))
* bar charts hide value-axis number labels by default ([aa3b5d5](https://github.com/blueprint-chart/blueprint-chart/commit/aa3b5d5c568a2d936a19fb32a9588c8be484f63a))
* deep inheritance-aware purge of scene and series overrides ([8abc80b](https://github.com/blueprint-chart/blueprint-chart/commit/8abc80b9f4b40ca739ffcbd72a6c6309a91ff00f))
* **editor:** add Chart + BPC option to the view toggle ([c5a6d00](https://github.com/blueprint-chart/blueprint-chart/commit/c5a6d00de92f3c6d4be8bc6971a0a927caafa132))
* **editor:** add diffEdit minimal-diff helper for DSL writes ([f1fbec1](https://github.com/blueprint-chart/blueprint-chart/commit/f1fbec118728161594ba0ec5df70adecd4772ec8))
* **editor:** add focus-aware DSL sync controller ([190070c](https://github.com/blueprint-chart/blueprint-chart/commit/190070cdd0e0de6cdff02c4dfbd62be8ed9f180f))
* **editor:** add split view mode and splitRatio to editorPanel store ([51f2c8e](https://github.com/blueprint-chart/blueprint-chart/commit/51f2c8eb4b6a8320513a8bf0188e126e06d19061))
* **editor:** collapse options panel to the icon rail in split and BPC modes ([b8f96e2](https://github.com/blueprint-chart/blueprint-chart/commit/b8f96e2f9afc895a1d0a8a98e48c7e287c73214c))
* **editor:** focus-aware DSL editor with inline diagnostics and polish ([a72fe37](https://github.com/blueprint-chart/blueprint-chart/commit/a72fe371dc683ddc31ab6f7664ab4e5fc3d6034f))
* **editor:** make the split divider draggable ([5670469](https://github.com/blueprint-chart/blueprint-chart/commit/56704692439eef37ac4ce198e76fbb0d2573022b))
* **editor:** map DSL parse errors to lint diagnostics ([277f3b6](https://github.com/blueprint-chart/blueprint-chart/commit/277f3b64fa5c70967f9ac6b60e21c98046132ec5))
* **editor:** refine split view toggle, narrow handling, mode picker ([1458dce](https://github.com/blueprint-chart/blueprint-chart/commit/1458dceb4595750908f7a1f383cabfddcd9ff8d0))
* **editor:** render chart and DSL side by side in split mode ([4ce549e](https://github.com/blueprint-chart/blueprint-chart/commit/4ce549ee0b80dbf8f0685560ae7ffa240e8163b8))
* **editor:** stack chart over DSL on narrow split view ([32b8da0](https://github.com/blueprint-chart/blueprint-chart/commit/32b8da00fb27190536a97504e7d9c05001fe9044))
* **editor:** surface parse error location from applyDsl ([64c7041](https://github.com/blueprint-chart/blueprint-chart/commit/64c704135976a46bd87ba877cec4b5aca1ff4209))
* expose canPurge and purge from the DSL editor ([42ba243](https://github.com/blueprint-chart/blueprint-chart/commit/42ba2434436970f8a67ec7289edaa20cc73ca9f3))
* horizontal bar charts hide value axis line and gridlines by default ([0817b21](https://github.com/blueprint-chart/blueprint-chart/commit/0817b21c5a28455a9d6fc83178a2ef24769e332b))
* **lib:** add dom render backend ([d275287](https://github.com/blueprint-chart/blueprint-chart/commit/d275287ddca93faa7fc939c0a5e4cd4eb6e7175a))
* **lib:** add node render backend with browser stub ([42e2e42](https://github.com/blueprint-chart/blueprint-chart/commit/42e2e42fc36de51bf03019bcc10ab338262d575b))
* **lib:** add render error types and backend interface ([85bd148](https://github.com/blueprint-chart/blueprint-chart/commit/85bd1486f913ce1290551824cba14339178170aa))
* **lib:** add toHtml() to the render handle ([3eff307](https://github.com/blueprint-chart/blueprint-chart/commit/3eff30706739c3ca1f8d65ca453ad2d701871b16))
* **lib:** add unified render() front door and chart handle ([968a036](https://github.com/blueprint-chart/blueprint-chart/commit/968a036b6715cc29fc3247753b07616a60156da1))
* **lib:** expose parse error location on SyntaxError ([a295a32](https://github.com/blueprint-chart/blueprint-chart/commit/a295a323071887565013d675b20aaad2e234748d))
* **lib:** relocate headless jsdom/text-shim/rasterize internals into render backends ([414c071](https://github.com/blueprint-chart/blueprint-chart/commit/414c0714faa0469877cfe9cec6eacd42c5470448))
* suppress unfit value labels on single-series bar charts ([c79949d](https://github.com/blueprint-chart/blueprint-chart/commit/c79949d5ea01a16ee386a464158cce0528892073))
* **ui:** support per-option tooltip on segmented control / toggle ([80f95f6](https://github.com/blueprint-chart/blueprint-chart/commit/80f95f69fd0ad397720934dcdeda2cac71960049))
* vertical bar charts default to direct labels, no value gridlines ([c474496](https://github.com/blueprint-chart/blueprint-chart/commit/c4744962231ed065e3c859218ebd0d2dc7587d06))

### Bug Fixes

* compute canPurge from editor doc, not compact canonical dsl ([c5f994d](https://github.com/blueprint-chart/blueprint-chart/commit/c5f994dc57bbf449eed7652f153d8f16ac7a4e9e))
* **docs:** externalize lib node-backend from vitepress build ([ec0f996](https://github.com/blueprint-chart/blueprint-chart/commit/ec0f9963ec0feecbf120085265adf9c2ec963714))
* **editor:** clamp diagnostic offset to line end ([426d369](https://github.com/blueprint-chart/blueprint-chart/commit/426d369c4abce4cc7166b32a4ac5c3107979faa4))
* **editor:** generate compact DSL so deleted lines aren't restored ([84bb068](https://github.com/blueprint-chart/blueprint-chart/commit/84bb0689e77cdb73a14bd4f02c923484ae37456c))
* **editor:** harden DSL sync — cancel on unmount, useTimeoutFn debounce, buffer external edits, preserve comments, share theme ([9389c9a](https://github.com/blueprint-chart/blueprint-chart/commit/9389c9aa8d51eac1e502f7ee9011867544d5d834))
* **editor:** keep options panel reachable in narrow split view ([aa675d9](https://github.com/blueprint-chart/blueprint-chart/commit/aa675d9cd47953ebc5206f938b713454690550e5))
* **editor:** match canvas auto mode to theme light/dark surface ([9e5386a](https://github.com/blueprint-chart/blueprint-chart/commit/9e5386ac3cd1fcac6e1bac94320fcd31220f5394))
* **editor:** mute DSL line numbers further ([992d73e](https://github.com/blueprint-chart/blueprint-chart/commit/992d73e899a40cc516347b7d8bf184336bf2eef2))
* **editor:** render a visible underline for end-of-line DSL parse errors ([aa8c297](https://github.com/blueprint-chart/blueprint-chart/commit/aa8c297dd8b1ef7c59b45df02e96f7df46a04d59))
* **editor:** single scrollbar, muted line numbers, hide scene timeline in DSL view ([f331084](https://github.com/blueprint-chart/blueprint-chart/commit/f331084f316120744a1842cbf12218d85473ac11))
* **editor:** square the icon-only view toggle options ([00d73fc](https://github.com/blueprint-chart/blueprint-chart/commit/00d73fc1fc083840f79a6079d9c89545f5f77667))
* **editor:** stop scene playback when leaving preview view ([b0828cd](https://github.com/blueprint-chart/blueprint-chart/commit/b0828cd6559c0f21f6ade3c14cfec05f1f938d12))
* **editor:** use stable scene ids across DSL re-parses ([a54a040](https://github.com/blueprint-chart/blueprint-chart/commit/a54a040883316ab35352cfa75696619ad3e15e8f))
* float purge button via positioned wrapper, removing bottom strip ([c554844](https://github.com/blueprint-chart/blueprint-chart/commit/c554844d37f722eb14fe80b666ef3592d62564fb))
* **ui:** square icon-only segmented-control options ([d5cae6d](https://github.com/blueprint-chart/blueprint-chart/commit/d5cae6d125c7a943844ce0c068631c2a69b2bbec))
* **ui:** support per-option title on NavigationToggle and fix item type ([ea4f2d7](https://github.com/blueprint-chart/blueprint-chart/commit/ea4f2d768929708d110a8a95b1b31aba2a43363a))

## [Unreleased]

### Features

* **Unified `render()` API.** One function returns a chart handle that works in
  both the browser and Node: `const chart = await render(bpc)`, then
  `chart.toSvg()`, `chart.toPng()` (Node-only), `chart.toHtml()`,
  `chart.mount(target)`, and `chart.scene(n)`. Handle methods are destructurable
  bound closures. The Node render path (jsdom + resvg) ships as
  `optionalDependencies` and is lazily loaded behind a conditional export, so
  browser bundles stay free of the native deps.
* **Bar charts now default to no value axis with direct value labels.** Every bar
  variant (vertical, horizontal, grouped, stacked, split) hides the value-axis
  line, ticks, numbers, and value gridlines, and labels each bar directly; labels
  that don't fit their bar are suppressed and fall back to the tooltip instead. Restore the
  previous look with `showVerticalAxis`/`showHorizontalAxis`, `verticalGridStyle`/
  `horizontalGridStyle`, or by setting `valueLabels` off.

## [0.3.0](https://github.com/blueprint-chart/blueprint-chart/compare/v0.2.0...v0.3.0) (2026-06-20)

### Features

* add point-wise SVG path interpolator for scene transitions ([e295470](https://github.com/blueprint-chart/blueprint-chart/commit/e295470f6bf2855377abbe45bf53355b7b0b4113))
* area marks resize on one clock via featureJoin + frame-geometry tween ([6eeb823](https://github.com/blueprint-chart/blueprint-chart/commit/6eeb8232158bfa75d0795900b1912def11cc9909))
* area-stacked marks resize on one clock via featureJoin + frame-geometry tween ([4b23e33](https://github.com/blueprint-chart/blueprint-chart/commit/4b23e33552bec545d3e0f7a6946ff94b5de4224b))
* bar-grouped marks resize via featureJoin migration + frame-geometry tween ([cff803d](https://github.com/blueprint-chart/blueprint-chart/commit/cff803d909c8f5121afd290b12cf1139665cb7ac))
* bar-horizontal marks resize on one clock via featureJoin reinsert + frame-geometry tween ([733de6b](https://github.com/blueprint-chart/blueprint-chart/commit/733de6b5cc8de4d08bb6aca417771f8d25423a66))
* bar-multi marks resize on one clock via featureJoin reinsert + frame-geometry tween ([a605143](https://github.com/blueprint-chart/blueprint-chart/commit/a60514350be838ec4e03159b8b968e0dc615ec89))
* bar-split marks resize via featureJoin migration + frame-geometry tween ([bfb62db](https://github.com/blueprint-chart/blueprint-chart/commit/bfb62db0fac258c947a5c824bccb4d012c6a54eb))
* bar-stacked marks resize via featureJoin migration + frame-geometry tween ([9bdd82a](https://github.com/blueprint-chart/blueprint-chart/commit/9bdd82a8e7790748fe11f415a67d668194ef7c6d))
* bar-vertical marks resize on one clock via featureJoin reinsert + frame-geometry tween ([d52c796](https://github.com/blueprint-chart/blueprint-chart/commit/d52c796908d7418aa17457ecfebd99e7b4802e47))
* **canvas:** make blueprint canvas adaptive to dark theme ([f924335](https://github.com/blueprint-chart/blueprint-chart/commit/f924335c442e5dd7fd8c04c73dcc0e21bad0e40c))
* column-stacked marks resize via featureJoin migration + frame-geometry tween ([b1e2bb0](https://github.com/blueprint-chart/blueprint-chart/commit/b1e2bb0264ecc628c76e4511e8811c66fd6c943b))
* frame-geometry tween (group transform + clip) on the scene clock ([c896e0c](https://github.com/blueprint-chart/blueprint-chart/commit/c896e0c36596f839623754632796c22693c40e32))
* line marks resize on one clock via featureJoin + frame-geometry tween ([199ebfc](https://github.com/blueprint-chart/blueprint-chart/commit/199ebfcaa0577f4bfcc22176ee13ab24161cd902))
* line-multi marks resize on one clock via featureJoin + frame-geometry tween ([c5624d0](https://github.com/blueprint-chart/blueprint-chart/commit/c5624d0d97eafa6a53ad25d9fa05266c35e5d42c))
* shared tweenPlotFrame helper + cached plot rect, plugin-host factory, distinct series-area/line roles ([c599c0f](https://github.com/blueprint-chart/blueprint-chart/commit/c599c0f91ade8baf22f4136ead8d5845a012d733))
* tween d/transform via point-wise interpolation in the orchestrator ([4a0e48a](https://github.com/blueprint-chart/blueprint-chart/commit/4a0e48af4c62c9fe8c48b283b5762dcbea9e50a5))

### Bug Fixes

* area-stacked path transitions use point-wise interpolation (no corruption) ([815ac81](https://github.com/blueprint-chart/blueprint-chart/commit/815ac81e872853535532a8427f44e7db2682c306))
* **docs:** drive dark bridge surfaces from shared tokens ([dd0ca79](https://github.com/blueprint-chart/blueprint-chart/commit/dd0ca7900e7faf86bcb38d867d8532dcde29b923))
* **editor:** token-drive dark range-slider track ([f78d23b](https://github.com/blueprint-chart/blueprint-chart/commit/f78d23b165abe560ff81fe5b6626876332643db2))
* exit area-stacked edge lines when areaLines toggles off mid-transition ([87fc3d3](https://github.com/blueprint-chart/blueprint-chart/commit/87fc3d37238d19dc72239569c53ec31e10ebb342))
* **lib:** neutralize dark blueprint-framed footer tint ([d59b5bd](https://github.com/blueprint-chart/blueprint-chart/commit/d59b5bd4e92c1cad131a99a129704039ee9fa5a1))
* reset stale highlight/opacity on reused bars across transitions ([7f73a2a](https://github.com/blueprint-chart/blueprint-chart/commit/7f73a2a130a5669cbfdd55f8c4e025fed5248a01))
* snap non-interpolable attrs, exact interpolatePath endpoints, interrupt orchestrator on non-transition render ([399e626](https://github.com/blueprint-chart/blueprint-chart/commit/399e62639cef8f75319b06a25a50680782c6c491))
* **ui:** deepen dark canvas well below the void ([494b442](https://github.com/blueprint-chart/blueprint-chart/commit/494b442a0c7726d1fb147853ab9447e283be406b))
* **ui:** unify dark surfaces on a cool-slate ramp ([01a2fd7](https://github.com/blueprint-chart/blueprint-chart/commit/01a2fd7123bce6b97cfc0e4a849f15eb5c0f3157))
* widen line-multi priorMargin type so the frame-geometry tween typechecks ([6e99fdf](https://github.com/blueprint-chart/blueprint-chart/commit/6e99fdf8a68788393dec9596f31258e35f01085d))

## [0.2.0](https://github.com/blueprint-chart/blueprint-chart/compare/v0.1.35...v0.2.0) (2026-06-19)

### Features

* **docs:** redirect home to getting-started with section tiles ([0a240c8](https://github.com/blueprint-chart/blueprint-chart/commit/0a240c84582e01065fa2f2bfb3545ef5d366005b))
* **dsl:** add optional leadingComments to AST node types ([56f1135](https://github.com/blueprint-chart/blueprint-chart/commit/56f113598015025af655759c47ce263879029f65))
* **dsl:** capture leading // comments into AST nodes ([bff9498](https://github.com/blueprint-chart/blueprint-chart/commit/bff949870e67d814b0bafc0b6d75acdda0bac9e0))
* **dsl:** serialize leadingComments above their nodes ([307ada4](https://github.com/blueprint-chart/blueprint-chart/commit/307ada46cf5a2c82f58fabc6c8d924788bd8be83))
* **samples:** add didactic // comments to the CO₂ samples ([d6a3334](https://github.com/blueprint-chart/blueprint-chart/commit/d6a3334cab7ab172e3ece5eb074c561874eabdec))

### Bug Fixes

* **dsl:** handle multi-line comments and discard inline trailing comments ([1e2f920](https://github.com/blueprint-chart/blueprint-chart/commit/1e2f9201612fc1e626dd9f774dab5101d46878e8))

## [0.1.35](https://github.com/blueprint-chart/blueprint-chart/compare/v0.1.34...v0.1.35) (2026-06-13)

### Bug Fixes

* verify automated release and site deploy pipeline ([a33d112](https://github.com/blueprint-chart/blueprint-chart/commit/a33d11272a71624e4d3c697b16188e2b30b232e4))

# Changelog

All notable changes to Blueprint Chart are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
Versions are published from `origin/main` and tagged `vX.Y.Z`; all three workspace
packages (`@blueprint-chart/lib`, `@blueprint-chart/ui`, `@blueprint-chart/editor`)
share a single version.

## [0.1.32] — 2026-06-05

### Fixed

- exported SVG and PNG images now carry the chart background: the chart SVG embeds a background rect resolved from the frame theme, omitted when the BPC sets `transparentBackground = true`. Bare-SVG consumers (MCP renders, resvg rasterization) previously produced transparent images regardless of the BPC.

## [0.1.31] — 2026-06-05

### Fixed

- the bundled samples and docs no longer use the dead `dy` annotation key (silently ignored by the renderer); `textOffsetY` replaces it, and a guard test now requires every bundled sample to pass `validateChart` with no errors or warnings.

## [0.1.30] — 2026-06-05

### DSL

- **BREAKING**: `areafill` renamed to `area-fill`.
- **BREAKING**: `hide_annotation` / `show_annotation` renamed to `hide-annotation` / `show-annotation`.
- **BREAKING**: `hide_range` / `show_range` renamed to `hide-range` / `show-range`.
- **BREAKING**: `hide_note` / `show_note` renamed to `hide-note` / `show-note`.
- **BREAKING**: the data meta-row key `_series` renamed to `series` (unquoted; quoted labels stay data rows).
- **BREAKING**: the `step` alias for `scene` removed; old keyword forms are now parse errors with no backward-compatible fallback.
- **BREAKING**: the unused `StepNode` type alias removed from the public API.
- a quoted `"series"` data row now survives round-trips as a real data category instead of being re-read as the column header.

### Added

- value-level validation via `validateChart`: unknown chart types, property keys, enum and boolean values, transform types, and annotation body keys all get errors with did-you-mean suggestions; suspicious `series` meta-rows get warnings.
- friendly parser errors with line/column for duplicate data blocks and missing quoted targets on `colorize`, `highlight`, `annotation`, `area-fill`, and `series`.
- embeds now render a visible error message when a chart fails to parse or render, instead of staying blank.
- two new bundled samples: `bitcoin-price.bpc` and `co2-emissions-story.bpc`.
- a "Was this page helpful?" feedback link on every docs page.
- shared `ANNOTATION_KIND_KEYWORD` map exported from the lib.

### Changed

- the editor's syntax highlighter now understands the full language: visibility directives, bodyless `highlight`, block comments, and scientific-notation numbers.

### Fixed

- duplicate `data` block error now reports the offending line/column.
- a malformed `highlight` body now reports the error inside the body instead of a confusing stray-brace message.
- DSL documentation corrections across the reference pages (comment syntax, number and escape grammar, annotation `start`/`end` keys, round-trip and versioning scope); guard tests now pin every docs snippet and sample reference to the canonical grammar.

## [0.1.27] — 2026-06-03

### Added
- add AccountAvatar initial-badge component
- add account menu to landing nav, remove GitHub button
- add cloudCharts store (CRUD, publish, fetch-published)
- add DashboardSyncPill component
- add debounced cloud sync composable
- add lazy code-split Supabase client factory (PKCE)
- add local→cloud import composable
- add magic-link account store
- add mergeChartLists for unified chart model
- add publish + id-link options to export panel (gated)
- add reusable ExportEmbedBlock for one embed type
- add runtime Supabase config resolution with accountsEnabled gate
- add sign-in modal and navbar account menu (gated)
- add #status slot overlay to GalleryCard
- add supabase dependency and config typing scaffolding
- add unmarkCloudBacked to cloud index
- add useCloudSave composable for explicit cloud save
- anchored edit, sync-to-cloud and confirmed delete in detail panel
- brand Supabase magic-link and signup confirmation emails
- brand the sign-in modal with value-led copy and benefit rows
- cache thumbnail+preview from a DSL string
- clarify the two embed types across all four states
- cloud-primary dashboard with local import banner
- forward sync/open events through the gallery
- hide sync affordances when signed out and soften card status pill
- let users return to the form from the sent confirmation
- lift sign-in modal open-state into the account store
- link the MIT value-prop cell to the GitHub repo
- make bulk sync id-preserving and keep local copies
- make delete confirmation a modal
- polish account menu with avatar toggle, identity header, and primary sign-in CTA
- purge synced charts from local storage on sign out and redirect to dashboard
- render published charts via /render?id=
- render sync pill in dashboard toolbar
- replace import banner with toolbar sync pill
- reset sign-in modal to the form each time it opens
- resolve config and handle PKCE auth redirect during boot
- reword import banner as sync-all-to-cloud
- show sync-status pill on chart cards
- unified dashboard charts composable with sync/remove/duplicate
- unify local and cloud charts in one dashboard list
- wire continuous cloud sync for owned charts (edit + new + cloud-open)

### Fixed
- add td to border-collapse reset in branded emails
- align account menu toggle height with navbar btn-sm controls
- dashboard cold-load refresh and scroll containment
- delete cloud-only charts even when absent from the local cloud index
- drop brand row from sign-in modal, lead with the headline
- gate publish on cloud-backed chart and reflect real published state
- grant table privileges to anon/authenticated on charts
- guard publish-state race and make embed-panel hints buttons
- hide the live-link hint when the cloud is not configured
- keep useCloudSave saving flag reset on failure
- lay out account menu header avatar beside the identity text
- make charts migration usable with supabase db push
- make dashboard cloud-mode actions operate on cloud charts
- memoize account init() so concurrent callers await session restore
- offset account menu dropdown to sit just below the navbar
- pin account menu dropdown above app chrome z-index
- purge synced charts before sign-out so the dashboard list refreshes correctly
- round card background and border together in branded emails
- scope sign-in modal body, use AppIcon spin, add close focus ring
- shrink navbar toggle avatar for breathing room inside the button
- stop listing the cloud-index key as a phantom chart
- use defined design tokens for ExportEmbedBlock font sizes
- use no-footer so delete modal shows only its custom buttons
- use no-footer so sign-in modal shows only its own form
- use the in-cloud icon for cloud-only charts on the dashboard

### Changed
- bind AccountMenu sign-in modal to shared store state
- cap account menu width to the viewport on small screens
- dedupe initial dashboard refresh and guard bulk sync
- dedup storage-key helpers and iframe sizing in cloud feature
- drop redundant vue import and static-string computed in detail actions
- extract summarizeDsl helper from listSavedCharts
- let AccountMenu own session init, drop navbar call
- match export embed section titles to .form-label
- persist cloud-only previews and make metadata enrichment reactive-safe
- resolve lint errors in dashboard chart tests
- satisfy eslint for landing account-menu changes
- use static imports in router cloud-load to silence build warnings

_+11 docs/test/build/ci commits._

## [0.1.26] — 2026-06-02

### Added
- add charts table migration with RLS policies
- clearer, plainer hero sub-paragraph
- fold the AI-writable angle into the value strip
- lead hero with the AI/format wedge
- neutral open-source footer tagline
- renumber AI section to 01
- renumber defaults to 03, keep newsroom rigor as credibility
- renumber format section to 02
- renumber scenes section to 05
- renumber transforms section to 04
- reorder nav menu to match new spine
- reorder spine to lead with AI then format

### Changed
- rewrap copy lines and align LandingPage imports with spine order

_+9 docs/test/build/ci commits._

## [0.1.25] — 2026-06-01

### Added
- add percent type + converter parse + percentValueLabel formatter
- add shared buildColorOverrides helper
- apply colorize; omit redundant opacity when unhighlighted
- apply colorize to arcs; omit redundant opacity when unhighlighted
- apply colorize to series via shared override map
- valueLabels='percent' renders share of column
- valueLabels='percent' renders share of total

### Fixed
- parse chart-level valueLabels='percent' too

### Changed
- use shared buildColorOverrides

## [0.1.24] — 2026-06-01

### Added
- add shared highlight-dim helper
- dim non-highlighted arcs via shared helper
- dim non-highlighted series via shared helper

### Changed
- drop redundant parens around arrow argument
- standardise class-event highlight dim to shared 0.35
- standardise highlight dim to shared 0.35

## [0.1.23] — 2026-06-01

### Fixed
- showArrow implies showLine + clamp text Y to canvas

_+1 docs/test/build/ci commits._

## [0.1.22] — 2026-05-31

### Added
- add floating variant to SceneTimeline
- add timeline slot to chart-edit canvas
- add timeline slot to data-structure canvas
- float the wide-mode scene-timeline over the canvas

### Fixed
- open command palette when landing search pill is clicked

### Changed
- pass copy deep-link payload via bpc64 query param

## [0.1.21] — 2026-05-30

### Added
- add LandingMcp "Author with AI" section
- expand the LandingMcp demo conversation
- redesign LandingMcp as a chat window with a stepper
- use a static chart image in LandingMcp
- wire LandingMcp into the landing page and nav

### Fixed
- fix the data pipeline demo layout on narrow screens
- rework the LLM format footnote

_+7 docs/test/build/ci commits._

## [0.1.20] — 2026-05-23

### Fixed
- ensure dist/ is built before publish via prepublishOnly

## [0.1.19] — 2026-05-23

_+3 docs/test/build/ci commits._

## [0.1.18] — 2026-05-23

### Added
- expose Node API (listDocs, getDoc) and make package public
- extract recommendCharts into lib as a pure function
- generate dist/manifest.json at build time

### Changed
- split single-line if-blocks across recommender and docs api

_+1 docs/test/build/ci commits._

## [0.1.16] — 2026-05-23

### Added
- add core types for scene transition orchestrator
- add ensureClipPath helper for deterministic clip ids
- add featureJoin primitive (idle path)
- add SceneTransition lifecycle and registry
- add snapshotLiveAttrs helper
- add transitionMode to RenderOptions
- add useSheetNumber composable
- buffer features during commit and tween on animate
- drive SceneTransition lifecycle from renderChart
- expose orchestrator and primitives from lib
- honour prefers-reduced-motion at the orchestrator
- migrate bar-horizontal marks and value labels to featureJoin
- migrate bar-multi cells to featureJoin
- migrate bar-vertical marks to featureJoin
- migrate bar-vertical value labels to featureJoin
- migrate donut slices to featureJoin
- migrate pie slices to featureJoin
- persist sheetNumber and sheetId on chartSession
- render frame credit as a clickable link to baseUrl
- scaffold cross-type role-matcher
- warn-once and snap for unknown transition modes

### Fixed
- add 2px buffer in inside-label mode to prevent edge clipping
- apply scene title/description/source overrides to returned frame
- balance spacing above and below top legend
- bar family lifecycle, namespaced legend handlers, and data-series keyed by name
- cache post-paint footer height to handle teleported content
- cancel inflight fade overlays and strip stale snapshots on rapid swaps
- dispose proximity tooltip, interrupt axis transitions, and use ensureClipPath in line family
- fade only chart body on cross-type transition to keep footer stable
- give fade overlay a flex layout so snapshot fills it
- guard contrast helpers against invalid hex strings
- harden SceneController against NaN, Infinity, empty, and destroyed inputs
- keep horizontal-axis label positioning aligned through merge:transition
- keep inside y-axis labels positioned through merge:transition
- make computeLinearDomain robust for large data and log scales
- mark non-numeric cells undefined in parseData
- parse dates as UTC and pick the format that matches every label
- preserve highlight body, accept top-level visibility, comments, scientific notation, and dedup data
- preserve same-value axis ticks across scene renders
- relax constrained frame to live header/footer heights
- remove anchor underline from frame credit
- restore tickTextSel transition-aware positioning (accidentally reverted)
- scope line-symbol selectors by tag to prevent stale shape DOM
- share a single message router across blueprint scripts
- skip annotation enter/move animation when identical across scenes
- style fade-snapshot frames so cross-type crossfade is visible
- tag body-form highlight as colorize to preserve visual semantics on round-trip
- threshold axis margin-delta compensation to >=1px
- use diverging offsets in stack helpers
- wire scene data, accumulate annotations, transform sort, stripColors, theme and layout resets

### Changed
- drop showCredit field from ChartLayout
- drop showCredit option from FrameOptions
- narrow frame-property type before assignment
- satisfy lint after stage 2 migration
- simplify horizontal-axis target ternary
- split one-line statements to satisfy lint
- stop reading showCredit from chart layout
- tighten em-dash comment spacing in useSheetNumber

_+15 docs/test/build/ci commits._

## [0.1.15] — 2026-05-22

### Added
- add LayoutNarrowDock
- add PanelOpenButton pill
- add per-step icons with done-state check swap to NavigationStepperTabs
- add SceneListItem
- add SceneList vertical layout (no reorder yet)
- add SceneTimelineCompact skeleton
- add stacked layout to NavigationStepperTabs
- add WAI-ARIA arrow/home/end keyboard nav to NavigationStepperTabs
- export NavigationStepperTabs, drop NavigationStepperChevron export
- export SceneList + SceneListItem
- export SceneTimelineCompact
- export StepEntry and add focus-visible to NavigationStepperTabs
- render chevron separators between inline NavigationStepperTabs
- render icons in PanelTabBar tabs and drop horizontal row padding
- render LayoutNarrowDock on narrow viewports
- render SceneList inside the narrow scenes sheet
- scaffold NavigationStepperTabs with renders-one-tab-per-step test
- swap WizardShell stepper to NavigationStepperTabs with breakpoint layout
- track last narrow tab on editorPanel store
- track last narrow tab on exportPanel store
- wire sortablejs drag-reorder into SceneList

### Fixed
- address critical/important code-review findings
- address final review (counter dedup, aria-expanded, test mocks)
- address minor code-review findings
- address scenes-sheet review (ts mock types, role=list, remove e2e)
- make LayoutBottomDrawer content-driven with 70vh cap
- move scene-list-item border to row wrapper so remove sits inside
- pin scene-list-item remove to top-right of the row

### Changed
- drive DataStructurePanel drawer via lastNarrowDataTab
- drive ExportPanel drawer from exportTab
- extract panel-section composables shared by rail and tab bar
- match PanelTabBar active state to navigation rail (primary pill)
- remove drag-reorder from SceneList (out of scope)
- remove horizontal rail from ChartEditPanel

_+15 docs/test/build/ci commits._

## [0.1.14] — 2026-05-21

### Added
- add --bc-drawer-height token

### Fixed
- raise LayoutBottomDrawer backdrop to z-index 1049

### Changed
- collapse light-mode --bc-content-bg to match --bc-tile-bg-elevated
- drop ButtonDetach, ButtonDock, ButtonDrag (floating-only)
- drop dead --bs-tertiary-bg fallback from LayoutPanel toolbar
- drop floating branch from shell and docked chrome
- drop page-header z-index override now drawer is modal
- emphasize active button with filled primary pill
- harmonize CodeMirror DSL surface to --bc-tile-bg-elevated
- harmonize ExportEmbedPanel code-block header to --bc-tile-bg-elevated
- harmonize FormatCard options background to --bc-tile-bg-elevated
- harmonize GalleryCard thumb background to --bc-tile-bg-elevated
- harmonize LayoutPageHeader background to --bc-tile-bg-elevated
- icon rail toggle now flips docked and closed
- narrow page tabs-slot guard to drawer-only
- pin LayoutBottomDrawer height to --bc-drawer-height
- remove floating mode from store
- remove PanelFloating component and panel-drag composable
- split saved indicator into compact dot and full pill

_+5 docs/test/build/ci commits._

## [0.1.13] — 2026-05-20

### Fixed
- use pnpm 11 allowBuilds syntax for esbuild and @parcel/watcher

_+5 docs/test/build/ci commits._

## [0.1.12] — 2026-05-20

_+1 docs/test/build/ci commits._

## [0.1.11] — 2026-05-20

_+1 docs/test/build/ci commits._

## [0.1.10] — 2026-05-20

### Added
- add astToDefinition
- add cross-type fade orchestration
- add cta-secondary slot to NavigationDocsBar, pin spacer between actions and ctas
- add layout-constraints helper
- add NavigationDocsBar component
- add NavigationMarketingBar component
- add NavigationSectionDropdown for sidebar section switching
- add NavigationSectionTabs component for docs section nav
- add post-render class application
- add renderChart orchestrator
- add render module types
- add resolveScene with cascading fold
- add sceneOverrideToSceneNode adapter
- add useCurrentSection composable resolving active section from nav[]
- add useDocsTheme composable with 3-state cycle
- adopt useDocsTheme + phosphor icons in marketing bar
- bump type scale to looser reading-friendly values
- consolidate design tokens into tokens.scss
- export NavigationDocsBar
- export NavigationMarketingBar
- expose renderBpc/renderChart unified API
- extract LayoutBreadcrumb from LayoutNavbar
- import shared design tokens from @blueprint-chart/ui
- move brand into sidebar, offset slim nav, restructure slot order
- NavigationCommandBar gains collapsed icon-only mode
- override VitePress layout with shared nav components
- remove navbar section tabs, keep dropdown as sole cross-section affordance
- store docked panel width as viewport fraction, default 22%
- wire section tabs into navbar and section dropdown into sidebar

### Fixed
- add 0.25rem margin to sidebar brand logo
- add pill padding and pin sidebar to left edge at ≥1440px
- add search trigger button to nav
- add theme toggle and proper GitHub button, fix nav to position fixed
- add -webkit-backdrop-filter to NavigationMarketingBar for Safari 14-17
- align NavigationSidebar header with navbar row
- always create frame DOM when not in thumbnail mode
- blur and translucent backdrop on NavigationDocsBar
- blur and translucent backdrop on slim navbar
- bridge --bs-body-color / --bs-secondary-color to VP text vars
- bump GitHub-hide specificity to beat scoped button display
- bump sidebar selector specificity to win in dev mode
- center group eyebrow vertically in its flex row
- center navbar tabs by moving auto margins onto brand slot
- click VP search button directly to open modal
- close NavigationSectionDropdown panel when a menuitem is selected
- correct tokens export path and skip partials in styles emit
- default percent suffix on y-axis when stackPercent is on
- drive --vp-nav-height from isHome via JS
- drop hardcoded z-index from NavigationDocsBar so docs search modal stacks above
- even gaps across NavigationMarketingBar sections, hold brand-menu spacing
- even spacing across landing nav buttons by colocating My charts in #actions
- import ui library css bundle so component styles ship to docs
- inflate clip path to avoid stroke clipping at plot edges and drop redundant inline stroke-width
- inherit body line-height on brand so baseline matches navbar
- interpolate palette when fewer colors than slices and suppress trivial center total when displayAsPercentage
- keep category x-axis labels visible on narrow charts
- keep search on left, push right only on narrow
- landing nav matches narrow logic — collapse search, hide GitHub, keep brand
- make sidebar group span full nav width
- match editor bc-theme storage format, restore bidirectional sync, hide empty brand wrapper
- match editor workspace switcher logo size and line-height
- match sidebar width to VP's 272px
- NavigationSectionDropdown global Escape + focus return to trigger
- NavigationSidebarItem uses 14px (--bs-font-size-sm)
- no-wrap docs brand wordmarks in sidebar and top nav
- no-wrap nav buttons and hide GitHub on narrow
- pin NavigationCommandBar kbd line-height so docs renders chip at editor's height
- place narrow-mode search before cta buttons on the right
- point hamburger at VPLocalNav .menu so it actually opens the sidebar
- prevent package-name wrap in README and getting-started tables
- raise highlight dim opacity from 0.2 to 0.35 for dark-mode visibility
- remove ClientOnly wrapper to avoid hydration FOUC
- reserve VPContent top padding under 960px so fixed nav stays clear of content
- restore labeled GitHub button on wide viewports
- show Blueprint Chart wordmark in narrow navbar
- swap search icon for NavigationCommandBar input pill
- tighten sidebar padding and align brand with navbar row
- tokens dark block honors .dark selector for VitePress-style consumers
- unify editor + docs marketing nav order to [search][gh][theme]
- use --bc-radius-xs token in NavigationSectionTabs
- use Geist Sans family name to match editor convention
- use theme token for label colors and lift default font size to 12px
- widen sidebar section switcher to item column, tighten spacing

### Changed
- BpcPreview uses renderBpc
- consume design tokens from @blueprint-chart/ui
- dashboard header shows breadcrumb instead of h1
- drop breadcrumb from LayoutNavbar, move search left
- fix remaining lint violations across docs and editor
- harmonize sidebar with editor NavigationSidebar
- LandingTopNav consumes NavigationMarketingBar
- lint
- prune theme style.css to VP-token aliases
- push navbar search to the right, collapse on narrow
- renderDsl wraps renderBpc
- restore rationale comments and relocate dark-mode form overrides
- sidebar item labels shift sm→md
- strip redundant defaults from all .bpc samples
- strip redundant defaults from temperature-anomaly
- tighten useCurrentSection types and drop unused index-strip
- unify nav cta slot vocabulary to cta-primary
- use 0.375rem horizontal padding for editor parity
- useChartPreview uses renderChart
- useChartThumbnail uses renderBpc/renderChart
- wizard header shows breadcrumb instead of chart title h1

_+26 docs/test/build/ci commits._

## [0.1.9] — 2026-05-18

### Fixed
- rephrase runtime feature blurb so YAML doesn't inject a literal script tag

## [0.1.8] — 2026-05-18

### Added
- add Bootstrap breakpoint constants module
- add BpcBlock with code/preview tabs and 'Open in editor' deep link
- add canvas-cramped axis to panel store
- add /charts catalogue covering all 13 chart types
- add /copy/:base64 hash route to hydrate sessions from URL-safe BPC payload
- add Documentation and GitHub links to sidebar Resources group
- add /handbook dataviz section with 11 KB-sourced pages
- add usePanelCanvasSync composable
- clamp PanelDocked displayed width by canvas room
- clamp PanelFloating max-width to container bounds
- close-button slot in LayoutSidebar header for offcanvas
- consolidate top nav and sidebar across guide, charts, handbook, spec, api
- enrich /guide pages with real BPC samples from the lib catalogue
- expand /guide with scenes, palettes, accessibility, data transforms, and DSL editor
- export BOOTSTRAP_BREAKPOINTS from package barrel
- hamburger + logo leading cluster in LayoutNavbar
- illustrate /handbook principles with real BPC samples
- link landing URL bar to the actual embed render route
- match editor theming with Geist + DM Serif and Prussian palette
- NavigationSidebarItem supports external href links with trailing indicator
- reopen panel from PanelIconRail when selecting a tab while closed
- scaffold @blueprint-chart/docs VitePress site with guide, DSL spec, and API reference
- sidebar in BOffcanvas at narrow viewports
- swap synthesized snippets for real samples in /spec and /api
- useBreakpoint accepts symbolic Bootstrap breakpoint names
- wire canvas-cramped detection in PanelShell

### Fixed
- clamp floating panel position on mount and container resize
- drop grid row-gap on stacked LayoutPageHeader so border-top is sole divider
- drop line symbols on farm-compass vegetable and jobs scenes
- drop priors whose series is gone from next line-multi scene
- lift sidebar offcanvas z-index above page chrome (1050/1055)
- lower cramped threshold to 480 so panel width-clamp has visible range
- measure parent flex container to break cramped oscillation
- migrate chart.scss themes from @import to @use for Sass 3.0 compat
- preserve every category x-axis label regardless of chart width
- remove width transition that lags canvas-driven clamp
- slave line-multi symbols to their series across scene transitions
- teleported BOffcanvas body padding needs global rule

### Changed
- add hairline left border to NavigationIconRail vertical variant
- add soft-pill BBadge overrides for info and success variants
- collapse sidebar into offcanvas below xl (1200px), was md (768px)
- drop manual editor link from chart pages now that BpcBlock provides it
- inset sample card thumbnails with internal padding
- LayoutShell uses Bootstrap media-breakpoint-down mixin
- remove BOffcanvas body padding around LayoutSidebar
- replace ad-hoc series colors with palettes and highlights
- tighten default chart vertical margins
- use BBadge variant=info for landing hero eyebrow
- use BBadge variant=success for wizard saved-at label

_+13 docs/test/build/ci commits._

## [0.1.7] — 2026-05-18

_+2 docs/test/build/ci commits._

## [0.1.6] — 2026-05-17

### Added
- add .bc-display utility for DM Serif Display headlines
- add --bc-shadow-overlay token
- add LandingDefaultCard primitive
- add LandingDefaults merging Philosophy + Practices
- add LandingValuePropStrip with hairline reflow
- add LayoutSceneTimeline chrome wrapper
- add LayoutSidebar with workspace + recent groups
- add motion and focus tokens with reduced-motion fallback
- add NavigationCommandBar ⌘K trigger pill
- add NavigationSegmentedControl primitive
- add NavigationSidebar container
- add NavigationSidebarGroup with eyebrow label
- add NavigationSidebarItem with pill active state
- add NavigationStepperChevron primitive
- add NavigationWorkspaceSwitcher with initial badge
- add sticky hairline top nav with brand, links, CTAs
- adopt Geist Sans as the body font stack
- btn-outline-secondary inherits the wash + hairline treatment
- btn-secondary adopts segmented-control wash + hairline
- DM Serif Display title, chrome-surface scene timeline
- export NavigationSegmentedControl
- export NavigationSidebar* and NavigationCommandBar
- export NavigationStepperChevron
- extend tile token scale with radius variants
- float navbar and merge page-header into composite tile
- GalleryCard supports serifTitle modifier
- import DM Serif Display, Geist Sans, and Geist Mono
- introduce two-tone surface, hairline, and radius tokens
- LandingFormat carries static-first story
- LandingHero copy, sample swap, mobile chart visible
- LandingPage adopts new spine, drops dividers + OSS slab
- LandingTopNav adopts new link roster + GitHub pill
- landing topnav theme toggle, alignment, hero polish, format URL, scenes player
- NavigationSegmentedControl story
- NavigationStepperChevron story
- NavigationWorkspaceSwitcher accepts logoSrc and hideName
- NavigationWorkspaceSwitcher accepts optional to prop for routing
- PanelDocked uses hairline left-border on content surface
- pulse-dot eyebrow pill, hairline chart frame, radial wash
- render My Charts title in DM Serif Display
- restyle GalleryCard with hairline border and Prussian selection
- rewrite LandingHero around 'great stories, great data viz'
- SceneTimelineItem adopts hairline tokens and Geist Mono label
- SectionTitle adopts DM Serif Display headline treatment
- sidebar workspace switcher links to home
- use DM Serif Display for chart card titles
- wash tokens, compact density, drop dead brand-gradient

### Fixed
- align content tiles with header by removing doubled padding
- DashboardToolbar controls use default md size for alignment
- declare vue-router as peer + dev dep to fix TS2307 build errors
- drop border-radius on ChartEditDsl cm-editor
- drop wizard back button — breadcrumb already routes to charts
- flatten export canvas + scene timeline chrome conflict
- full-height sidebar, narrow-viewport collapse, flush page header
- LandingDefaultCard uses --bc-tile-bg + --bs-info-bg-subtle
- LandingDefaults chart tile uses --bc-radius-lg
- LandingFormat removes spurious computed, adds URL aria-hidden, polish
- landing internal links use router-link + hash scrollBehavior
- LandingScenes theme mock + drop no-op order rule
- LandingTopNav GitHub link points to canonical repo
- NavigationCommandBar height matches btn-sm for toolbar alignment
- NavigationSegmentedControl renders slot for child entries
- pin .dropdown-toggle to .btn token chain
- post-review cleanup — breadcrumb topbar, drop dead timeline slot
- section hairlines + surfaces, Scenes order, E2E mobile asserts
- sidebar workspace switcher shows Blueprint Chart name
- strip dashboard + chart-edit tile chrome, drop wizard y-gap

### Changed
- apply lint --fix to Navigation primitives
- bump LayoutNavbar to 2.75rem and pad to 1.25rem
- CanvasModePicker adopts overlay tokens
- DashboardDetailPreview uses canonical radius tokens
- DashboardMetaChip uses canonical radius token
- DashboardToolbar uses NavigationSegmentedControl
- DataPanel uses canonical tokens
- drop em-dashes from landing copy in favor of commas, colons, periods
- flatten DataStructurePanel main surface
- LandingFooter joins chrome surface, single row
- LandingHero SFC order, explicit mobile overflow
- LandingScenes flips grid, chart-on-top mobile
- LandingSectionHeader eyebrow goes mono + faint
- LandingTopNav theme toggle moves to far right
- LandingTransforms hover token, SFC order, test stub cleanup
- LandingTransforms uses LandingDefaultCard, trims to 4 cards
- LandingValuePropStrip uses semantic section + dl/dt/dd
- LayoutBottomDrawer adopts overlay tokens
- migrate canvas, chart and dashboard surfaces to tile tokens
- migrate sub-components to explicit hairline tokens
- Navigation primitives consume --bc-wash-* tokens
- NavigationSegmentedControl active uses primary bg, .btn-matched md
- NavigationToggle uses NavigationSegmentedControl
- PanelFloating adopts overlay tokens
- PanelTabBar uses canonical radius token
- pill active state on panel tabs
- reshape LayoutNavbar into 40px topbar
- restructure LayoutShell into sidebar/topbar/main grid
- WizardShell uses NavigationStepperChevron

_+14 docs/test/build/ci commits._

## [0.1.5] — 2026-05-16

### Added
- add CommandPaletteModal
- add LayoutPageHeader frame component
- add NavigationLink primitive
- add NavigationSearchPill primitive
- add NavigationStepperTabs primitive
- add usePlatformShortcut composable
- center wizard step nav via LayoutPageHeader center slot

### Fixed
- always show navbar border and put navbar below modal stack
- create annotated tags so --follow-tags pushes them
- install BootstrapVueNext plugin and stylesheet for modals
- keep navbar clickable above bottom-drawer backdrop
- polish wizard tier 2 with tab stepper, round back button, edge-aligned header
- stack LayoutPageHeader on mobile to keep tier 2 content visible
- use canonical thumbnail helpers in CommandPaletteModal
- use shown event and disable BModal autofocus to focus search input

### Changed
- align NavigationLink with AGENTS conventions
- align NavigationPillBase sizes with Bootstrap button heights
- apply BEM root and SFC order in Dashboard files
- drop unused default slot from LayoutPageHeader
- enable parallel execution
- fix navigation selector, trim waits, strip unasserted logs
- move wizard chrome into LayoutPageHeader with saved status
- place layout selector before sort in DashboardToolbar
- render LayoutPageHeader as Dashboard tier 2 with New chart action
- replace inline :class literals with computed bindings
- replace LayoutNavbar theme conditionals with lookup maps
- rework LayoutNavbar to tier-1 only with right-aligned search
- tidy LayoutShell prop binding and types
- tidy WizardShell renderOne signature and comments
- tighten CommandPaletteModal ARIA and styles
- tighten wizard saved-status types and tests
- use useSlots() for LayoutPageHeader mode detection
- wire navbar to command palette in LayoutShell

_+7 docs/test/build/ci commits._

## [0.1.4] — 2026-05-15

### Fixed
- extract dist artifact under packages/ for downstream jobs

_+1 docs/test/build/ci commits._

## [0.1.3] — 2026-05-14

### Fixed
- build lib and ui before editor in build-editor target

_+1 docs/test/build/ci commits._

## [0.1.2] — 2026-05-14

### Fixed
- correct types for ButtonIcon.type, popover ignore option, and NavigationToggle disabled
- drop vitest preset from auto-import to keep it out of runtime bundle
- make plugin factories generic in TData so they apply to typed charts
- pass element + datum generics to selectAll so .data keyFn picks up datum type
- relax computeMarginDelta priorMargin type to match callers
- silence remaining d3 type quirks (transition/selection union, axis tickValues cast)
- use enum members instead of bare string literals for enum-typed fields
- widen scale unions to include ScaleSymLog across axis service and annotations

_+5 docs/test/build/ci commits._

## [0.1.1] — 2026-05-14

Initial public release: the D3 charting engine (`lib`), the Vue 3 component library (`ui`), and the editor SPA (`editor`), published to npm under `@blueprint-chart/*` with GitHub Pages deploy. Ships the BPC DSL parser/serializer, 13 chart types, scenes, standalone + embed export, light/dark theming, and the WCAG/CVD accessibility toolkits.
