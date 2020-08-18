### [1.5.1](https://github.com/hitokoto-osc/hitokoto-api/compare/v1.5.0+1...v1.5.1) (2020-07-02)


### Features

* v1.5.1 ([49bbdac](https://github.com/hitokoto-osc/hitokoto-api/commit/49bbdac2eec564e17ba36c25b63ccf1da2acfe17))
* **process:** better logger highlight ([9cadedd](https://github.com/hitokoto-osc/hitokoto-api/commit/9cadedd7eda385005a63f3f6296ff08487ea3053))
* **process:** fork process with environment env ([3026d92](https://github.com/hitokoto-osc/hitokoto-api/commit/3026d920b0125873503af5250014b397f7937a66))


### Bug Fixes

* **cron:** too frequent view in update sentences cron ([4571875](https://github.com/hitokoto-osc/hitokoto-api/commit/4571875695951f19f54cffc3e29e90f9030ac789))
* **hitokoto:** request unexpected failture ([517aeef](https://github.com/hitokoto-osc/hitokoto-api/commit/517aeeffdaa71fc99de0d21a15f8ed504ab2618f))
* **hitokoto:** request unexpected failture ([bb2afb8](https://github.com/hitokoto-osc/hitokoto-api/commit/bb2afb8ecb5f70b45201cdb76624fecc7ea21d37))
* **prestart:** logger settings are ignored ([fccacbd](https://github.com/hitokoto-osc/hitokoto-api/commit/fccacbdc22e70d0b1e518d0465e5d55cb8445414))
* **process:** lock in verbose level ([51ee07c](https://github.com/hitokoto-osc/hitokoto-api/commit/51ee07c6cca1e24bb320ba47be4341378dfbdd27))
* **process:** lock in verbose level ([f42071b](https://github.com/hitokoto-osc/hitokoto-api/commit/f42071b59c6b2e9dbb3f97a0bc1604d5b8c9f9a6))
* **status:** potential issues ([8404d18](https://github.com/hitokoto-osc/hitokoto-api/commit/8404d1895312198e9793149c98f91563aea7954b))

## [1.5.0](https://github.com/hitokoto-osc/hitokoto-api/compare/v1.5.0-beta.3...v1.5.0) (2020-06-15)


### Features

* **cache, ab:** attach module name ([935be87](https://github.com/hitokoto-osc/hitokoto-api/commit/935be873a87385abc3256c23a7be4a3a077dfd01))
* **cache, ab:** attach module name ([1ff2924](https://github.com/hitokoto-osc/hitokoto-api/commit/1ff2924a4cd30feee210a6b0cbd19a49972589e4))
* **logger:** attach module name ([1a28d82](https://github.com/hitokoto-osc/hitokoto-api/commit/1a28d8271324e078a341ea37a3290be3c9196933))
* **pkg:** v1.5.0 ([2126ca8](https://github.com/hitokoto-osc/hitokoto-api/commit/2126ca8c1b0581e51be6ba8edfe917a3e166529c))
* **prestart:** attach module name ([c28e9f1](https://github.com/hitokoto-osc/hitokoto-api/commit/c28e9f1f75a01875f0bcc4dc4d1bc7f543edd023))


### Bug Fixes

* **cache,ab:** wrong command func definations ([700e4ed](https://github.com/hitokoto-osc/hitokoto-api/commit/700e4ed00f845e9a6c7445aefd2063e19a9547bd))
* **middleware:** better log highlight ([e50c63b](https://github.com/hitokoto-osc/hitokoto-api/commit/e50c63b5e0a2909cbfcc0a0443c1bbe3330670ec))
* **middlewares:** friendly dev load note ([cbe6ee9](https://github.com/hitokoto-osc/hitokoto-api/commit/cbe6ee981945e59252b4f4d7c718e029629a69aa))
* **task:** a potential update failture while counting total sentences ([c98dfe3](https://github.com/hitokoto-osc/hitokoto-api/commit/c98dfe381f1a85768ad8b0d88c6afa948d2d4d27))
* **task:** a potential update failture while counting total sentences ([3850c20](https://github.com/hitokoto-osc/hitokoto-api/commit/3850c201652ecd1504129e1c711419f3181762a3))
* **task, process:** task not run as expection and process receivers are not work ([2adde8c](https://github.com/hitokoto-osc/hitokoto-api/commit/2adde8ca10e02525cd423a14b9519b21579c0e3b))

## [1.5.0-beta.3](https://github.com/hitokoto-osc/hitokoto-api/compare/v1.5.0-beta.2...v1.5.0-beta.3) (2020-06-14)


### Features

* **core:** better log format, and process interaction ([9aba0e1](https://github.com/hitokoto-osc/hitokoto-api/commit/9aba0e19bea3c215830dbc2f118ce0eebf5d07c4))
* **core:** prepare for worker threads ([e1f284f](https://github.com/hitokoto-osc/hitokoto-api/commit/e1f284f915e225e39ec4e471bc0408374aebf37c))
* **core:** v1.5.0-beta.3 ([9568b9f](https://github.com/hitokoto-osc/hitokoto-api/commit/9568b9f1fac470bc2f480fa5846142bde17b49fc))
* **deps:** support uuid v8 ([2b7d99d](https://github.com/hitokoto-osc/hitokoto-api/commit/2b7d99d5f446efc4cc341f4918dd4bd2667c99dd))
* **middleware:** abstract middlewares loader into a module ([c81d045](https://github.com/hitokoto-osc/hitokoto-api/commit/c81d045208d0be03e4893b4114509f20854126ab))
* **middleware:** abstract middlewares loader into a module ([8da79cf](https://github.com/hitokoto-osc/hitokoto-api/commit/8da79cfb559208463307607fa62abd77c6d2862d))
* **process:** auto load processMap while booting ([dffe295](https://github.com/hitokoto-osc/hitokoto-api/commit/dffe295d2acb823d094e7a12b89ffed84c4d4506))
* **route:** allow to inject middlewares to routeMap ([b206713](https://github.com/hitokoto-osc/hitokoto-api/commit/b20671368c259a7f19efe5f8c5fcdd9eb169ac0d))
* **route:** let crash and test route dev mode access only ([4598d55](https://github.com/hitokoto-osc/hitokoto-api/commit/4598d554119035b9025991d2997ae7fee5ad770c))
* **task:** translate ([6d96fc3](https://github.com/hitokoto-osc/hitokoto-api/commit/6d96fc3eb74d74f544f83d9c75cba6fa340d8aeb))


### Bug Fixes

* **core:** request will cause crash ([ddadd1c](https://github.com/hitokoto-osc/hitokoto-api/commit/ddadd1c626e27a2cdff26b98b4d0edeb02f9becb))
* **core,ab,task:** can't switch db effectively while task running at child process ([cf16b74](https://github.com/hitokoto-osc/hitokoto-api/commit/cf16b74b3140c476c8670993a662e7a7c0194a8b))
* **middleware:** failed to load middlewares ([77c9fa5](https://github.com/hitokoto-osc/hitokoto-api/commit/77c9fa571cd6c2722d3103c497b952fe98c49bdd))
* **middleware:** failed to load middlewares ([bf19217](https://github.com/hitokoto-osc/hitokoto-api/commit/bf19217c5a3520a3465e0f1d8d9fde8ec412b4bf))
* **middleware,cron:** break changes in countRequests, it is work now ([03ee54c](https://github.com/hitokoto-osc/hitokoto-api/commit/03ee54c55999149feac7e91dbdc6c7d3df75d246))
* **route,task,core:** break changes in status, it is work now ([0d330b6](https://github.com/hitokoto-osc/hitokoto-api/commit/0d330b6153f06fbf02a161894607150532e59843))

## [1.5.0-beta.2](https://github.com/hitokoto-osc/hitokoto-api/compare/v1.5.0-beta.1...v1.5.0-beta.2) (2020-05-29)


### Features

* **core:** skip invalid middlewares instead of self-destory ([0a18e64](https://github.com/hitokoto-osc/hitokoto-api/commit/0a18e6485c6a1a23d2319f27b5da61de5a96d011))
* **core:** skip invalid middlewares instead of self-destory ([cc2e24d](https://github.com/hitokoto-osc/hitokoto-api/commit/cc2e24da1d29e0671e6adfb2ce65c9cb1fcecf1f))
* **debug:** more friendly debug mode ([3aa4474](https://github.com/hitokoto-osc/hitokoto-api/commit/3aa44744edbc23248a66cf15c262ecd4b52441c8))
* **docker:** rm useless config ([3782e43](https://github.com/hitokoto-osc/hitokoto-api/commit/3782e434f94b58d20f6c9281f4847bfb3b482557))
* **prestart:** gerneare necessnary files while start ([94b1afe](https://github.com/hitokoto-osc/hitokoto-api/commit/94b1afe9f219876ceb8d68131acfb82b11933bbb))
* **sentence:** exclude categories that are out of length range ([8ad285f](https://github.com/hitokoto-osc/hitokoto-api/commit/8ad285f35ddc0486ae85ec3a346279af1c48a8e8))
* **sentences:** non-aware update implemented by a/b switcher ([8971773](https://github.com/hitokoto-osc/hitokoto-api/commit/897177372128dc5a9430b7a4af423de948cb8e80))


### Bug Fixes

* **cache:** loop error thrown while can't connect to the redis ([77f94cd](https://github.com/hitokoto-osc/hitokoto-api/commit/77f94cd923ba983efd1f9ee29057968c52318195))
* **cache:** loop error thrown while can't connect to the redis ([2167415](https://github.com/hitokoto-osc/hitokoto-api/commit/2167415fe4537d17fe80a4d0372c3852a02fbcb0))
* **core:** exit child process while master process exited ([fa17bc9](https://github.com/hitokoto-osc/hitokoto-api/commit/fa17bc911a42368fca59055115b40bed45943e59))
* **core:** exit child process while master process exited ([5d3cd6f](https://github.com/hitokoto-osc/hitokoto-api/commit/5d3cd6fbda80785a60d6b22239569d3b757fecfb))
* **prod:** prod env will not work ([5589408](https://github.com/hitokoto-osc/hitokoto-api/commit/55894089e6a4ef08bb80d73c80f561f56f95bfbf))

## [1.5.0-beta.1](https://github.com/hitokoto-osc/hitokoto-api/compare/v1.4.8+1...v1.5.0-beta.1) (2020-05-16)


### Features

* v1.5.0-beta.1 ([00f74e2](https://github.com/hitokoto-osc/hitokoto-api/commit/00f74e25b0137ce2f3d0ec241c021a1ca7833ec7))
* **ci:** init ([43e4498](https://github.com/hitokoto-osc/hitokoto-api/commit/43e449851d1fa19cbf62e236982716a91daeb585))
* **commander:** parse option with commander ([ce84c55](https://github.com/hitokoto-osc/hitokoto-api/commit/ce84c559e6ddfdfc64632a6e75e1505181b6f19c))
* **core:** add updateSentence task ([3d482a4](https://github.com/hitokoto-osc/hitokoto-api/commit/3d482a46befc898fb6ff862f2e64f562fc36bc5b))
* **cron:** use child process to run cron job ([dccd20b](https://github.com/hitokoto-osc/hitokoto-api/commit/dccd20b2d2406a9c2318378557b854464a0cb6c6))
* **hitokoto:** support length and redis based data collection ([add32bf](https://github.com/hitokoto-osc/hitokoto-api/commit/add32bf8d1be5ede071c174f5f9ada4de5096f5f))
* **plugin:** split prod and dev plugins ([8f233c1](https://github.com/hitokoto-osc/hitokoto-api/commit/8f233c12b6a95f93944d78e483eddfc6531d67ac))
* **test:** use jest instead of mocha + chai ([0405d84](https://github.com/hitokoto-osc/hitokoto-api/commit/0405d84b47e269cf497551b46ea5615b5c998050))
* support docker ([18e65e6](https://github.com/hitokoto-osc/hitokoto-api/commit/18e65e62ed08a3153f5669dc5937aa5e40d8e7d6))
* support docker ([ac68b4e](https://github.com/hitokoto-osc/hitokoto-api/commit/ac68b4ee7b8677fef2baa6c2a5d12be09085227b))


### Bug Fixes

* **charset:** respond corrent data while request async func ([ee56750](https://github.com/hitokoto-osc/hitokoto-api/commit/ee56750c67802f6dcd35064c177d1c0abe9b714d))

### [1.4.8+1](https://github.com/hitokoto-osc/hitokoto-api/compare/1.4.8...v1.4.8+1) (2020-04-13)


### Features

* rm user data ([7df5d53](https://github.com/hitokoto-osc/hitokoto-api/commit/7df5d5346e13d561b7ca0dac9a3d6587c006ae69))
* use fast-json-stringify and flatstr to optimize ([c944628](https://github.com/hitokoto-osc/hitokoto-api/commit/c9446284970f066dfcc74c2d65dd85d6d4179fb9))
* v1.4.8 ([679994f](https://github.com/hitokoto-osc/hitokoto-api/commit/679994fd57f86c2d45137606774159b6800dda8d))
* **dep:** import fast-json-stringify and flatstr ([f9f6d61](https://github.com/hitokoto-osc/hitokoto-api/commit/f9f6d619f892dede2881c070bf05f67329956437))
* **dep:** update ([654bcf9](https://github.com/hitokoto-osc/hitokoto-api/commit/654bcf92f23f6c6f50be055a92010012ea55f549))


### Bug Fixes

* **hitokoto:** wrong content-type ([37fe368](https://github.com/hitokoto-osc/hitokoto-api/commit/37fe368bfbda362e3453b02dce2bea7c5d34f289))
* **hitokoto:** wrong content-type, close [#4](https://github.com/hitokoto-osc/hitokoto-api/issues/4) ([9357251](https://github.com/hitokoto-osc/hitokoto-api/commit/935725186e443804734b3240415edca4229c8eb3))

### [1.4.7+1](https://github.com/hitokoto-osc/hitokoto-api/compare/v1.4.7...v1.4.7+1) (2020-01-22)


### Features

* v1.4.7+1 ([f168d38](https://github.com/hitokoto-osc/hitokoto-api/commit/f168d3839d3c578803e5f6fee1973ec169b8d88c))

### [1.4.7](https://github.com/hitokoto-osc/hitokoto-api/compare/dd73654622c8fea8c2f26af696c4a20dbfe112b0...v1.4.7) (2020-01-22)


### Features

* v1.4.7 ([dd73654](https://github.com/hitokoto-osc/hitokoto-api/commit/dd73654622c8fea8c2f26af696c4a20dbfe112b0))

