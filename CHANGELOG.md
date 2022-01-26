# [1.98.0](https://github.com/webex/sdk-component-adapter/compare/v1.97.2...v1.98.0) (2022-01-26)


### Features

* **ActivitiesSdkAdapter:** create a method to fetch an activity by id ([bf83567](https://github.com/webex/sdk-component-adapter/commit/bf83567f558e32eb36603d6b8723850f76f349c5))
* **ActivitiesSdkAdapter:** implement empty ActivitiesSDKAdapter ([e4495b2](https://github.com/webex/sdk-component-adapter/commit/e4495b255c2220182474af57a1232109862f662c))

## [1.97.2](https://github.com/webex/sdk-component-adapter/compare/v1.97.1...v1.97.2) (2021-12-09)


### Bug Fixes

* **logger:** prevent logger js errors by handling logging objects with circular references ([a154bd6](https://github.com/webex/sdk-component-adapter/commit/a154bd6be82321812fbef83b404f0b5a140e2baa))

## [1.97.1](https://github.com/webex/sdk-component-adapter/compare/v1.97.0...v1.97.1) (2021-12-09)


### Bug Fixes

* **MeetingsSdkAdapter:** obtain remote sharing stream for a user who joins after sharing is started ([06d5db5](https://github.com/webex/sdk-component-adapter/commit/06d5db541f95b68a0f5d83e360c9bf0c892ac2f4))

# [1.97.0](https://github.com/webex/sdk-component-adapter/compare/v1.96.0...v1.97.0) (2021-12-09)


### Features

* **MeetingsSdkAdapter:** emit empty list from getAvailableDevices() if media not accessible ([6f206f7](https://github.com/webex/sdk-component-adapter/commit/6f206f76da76c7dfc3dc7bb2d15d3a584c19fa0e))

# [1.96.0](https://github.com/webex/sdk-component-adapter/compare/v1.95.0...v1.96.0) (2021-12-07)


### Features

* **MeetingsSdkAdapter:** mapping layout types ([0cb1567](https://github.com/webex/sdk-component-adapter/commit/0cb156738da377043e43e436060ba78b2eb82142))

# [1.95.0](https://github.com/webex/sdk-component-adapter/compare/v1.94.1...v1.95.0) (2021-12-07)


### Features

* **MeetingsSdkAdapter:** add changeLayout function ([e690972](https://github.com/webex/sdk-component-adapter/commit/e690972084c0a62d2212a3c1a004cee92d034cfc))
* **MeetingsSdkAdapter:** set media permissions according to received sdk media error ([c769bfa](https://github.com/webex/sdk-component-adapter/commit/c769bfab4f4205ecd09ea473f5b73a0f16b6f95c))

## [1.94.1](https://github.com/webex/sdk-component-adapter/compare/v1.94.0...v1.94.1) (2021-12-06)


### Bug Fixes

* **MembershipsSdkAdapter:** treat sdk members with isModerator set to true as meeting hosts ([493a261](https://github.com/webex/sdk-component-adapter/commit/493a2616b73a41b8a15899d7701d30cd27a781f8))

# [1.94.0](https://github.com/webex/sdk-component-adapter/compare/v1.93.0...v1.94.0) (2021-11-26)


### Features

* **puppeteer:** testing interface improvements: ([e9fde42](https://github.com/webex/sdk-component-adapter/commit/e9fde42983585f04170b6b425fa097c4e947c0fe))

# [1.93.0](https://github.com/webex/sdk-component-adapter/compare/v1.92.1...v1.93.0) (2021-11-26)


### Features

* **MeetingsSdkAdapter:** add muting/unmuting intermediary states ([09e635a](https://github.com/webex/sdk-component-adapter/commit/09e635a5d9dee9d55ba74f30752f5848a4d75954))

## [1.92.1](https://github.com/webex/sdk-component-adapter/compare/v1.92.0...v1.92.1) (2021-11-25)


### Bug Fixes

* **MeetingsSdkAdapter:** set preview video stream in correct field when switching camera ([1c99081](https://github.com/webex/sdk-component-adapter/commit/1c9908158d9d811f888de96b1e38024a2a727757))
* **puppeteer:** code cleanup for testing interface ([15b4c34](https://github.com/webex/sdk-component-adapter/commit/15b4c343aeaf56f56ba773aa20243e3d78b21bdd))

# [1.92.0](https://github.com/webex/sdk-component-adapter/compare/v1.91.3...v1.92.0) (2021-11-24)


### Features

* **MembershipsSdkAdapter:** return non-user members from getMembers() ([6c4de60](https://github.com/webex/sdk-component-adapter/commit/6c4de60fe3f638742b38b8d088a8fcd6b38a0abc))

## [1.91.3](https://github.com/webex/sdk-component-adapter/compare/v1.91.2...v1.91.3) (2021-11-24)


### Bug Fixes

* **MeetingsSdkAdapter:** password and hostKey validation ([dce3e7c](https://github.com/webex/sdk-component-adapter/commit/dce3e7c87f9ff7a7810f754cf8ab39f24172463b))

## [1.91.2](https://github.com/webex/sdk-component-adapter/compare/v1.91.1...v1.91.2) (2021-11-22)


### Bug Fixes

* **MeetingsSdkAdapter:** check settings preview streams before updating sdk local streams ([e553368](https://github.com/webex/sdk-component-adapter/commit/e5533683cb68326154501c744d4b1921fb1a48d2))

## [1.91.1](https://github.com/webex/sdk-component-adapter/compare/v1.91.0...v1.91.1) (2021-11-19)


### Bug Fixes

* **package:** update js-sdk to 1.149.2 ([abf4ee2](https://github.com/webex/sdk-component-adapter/commit/abf4ee2a02cd2d7e696cf33538b2eef5ada78015))

# [1.91.0](https://github.com/webex/sdk-component-adapter/compare/v1.90.0...v1.91.0) (2021-11-19)


### Features

* **MeetingsSdkAdapter:** add browser default speaker to the available speaker list ([e149789](https://github.com/webex/sdk-component-adapter/commit/e1497892523f5413bbe1937f1f35801949387cfb))

# [1.90.0](https://github.com/webex/sdk-component-adapter/compare/v1.89.1...v1.90.0) (2021-11-16)


### Features

* **meeting-controls:** add debug logs ([bc2eeb7](https://github.com/webex/sdk-component-adapter/commit/bc2eeb7846659026bc3810b21066f3ec93091b39))

## [1.89.1](https://github.com/webex/sdk-component-adapter/compare/v1.89.0...v1.89.1) (2021-11-15)


### Bug Fixes

* **MeetingsSdkAdapter:** correct the state of video/audio control when permissions are not granted ([026836a](https://github.com/webex/sdk-component-adapter/commit/026836ae7b1bcaf636c57929d2be5ba7bef037ba))

# [1.89.0](https://github.com/webex/sdk-component-adapter/compare/v1.88.0...v1.89.0) (2021-11-12)


### Features

* **MembershipsSdkAdapter:** add debug logs ([0b433f9](https://github.com/webex/sdk-component-adapter/commit/0b433f982097910ed2031f1f31cc26eceb9371a4))

# [1.88.0](https://github.com/webex/sdk-component-adapter/compare/v1.87.4...v1.88.0) (2021-11-11)


### Features

* **MeetingsSdkAdapter:** change joining state to lobby state ([a11986f](https://github.com/webex/sdk-component-adapter/commit/a11986ff42d1d23e9b98e0effdc23fc441e2701b))

## [1.87.4](https://github.com/webex/sdk-component-adapter/compare/v1.87.3...v1.87.4) (2021-11-11)


### Bug Fixes

* **WebexSdkAdapter:** update debug logs ([7e80a60](https://github.com/webex/sdk-component-adapter/commit/7e80a603eca75c5d4efe75ca93a524ea7cc1f599))

## [1.87.3](https://github.com/webex/sdk-component-adapter/compare/v1.87.2...v1.87.3) (2021-11-11)


### Bug Fixes

* **VideoControl:** correct the video control text for disabled state ([e14397b](https://github.com/webex/sdk-component-adapter/commit/e14397bee201693b29e3399f71cfc894105af7f1))

## [1.87.2](https://github.com/webex/sdk-component-adapter/compare/v1.87.1...v1.87.2) (2021-11-10)


### Bug Fixes

* **package:** update component adapter interfaces to v1.22.0 ([0f34878](https://github.com/webex/sdk-component-adapter/commit/0f348783a4ea51aa1773f9e020c49e2efea5add5))

## [1.87.1](https://github.com/webex/sdk-component-adapter/compare/v1.87.0...v1.87.1) (2021-11-10)


### Bug Fixes

* **package:** move winston to peer dependencies ([53e0ca0](https://github.com/webex/sdk-component-adapter/commit/53e0ca0db3e3a157e598071d0c12d59cedbd7c46))

# [1.87.0](https://github.com/webex/sdk-component-adapter/compare/v1.86.0...v1.87.0) (2021-11-08)


### Features

* **src:** replace all console.log/warn/error with Winston logger ([318a190](https://github.com/webex/sdk-component-adapter/commit/318a19032609505d0f44fef3971d5b91e874c0f0))

# [1.86.0](https://github.com/webex/sdk-component-adapter/compare/v1.85.2...v1.86.0) (2021-11-08)


### Features

* **WebexSdkAdapter:** add debug logs ([355a106](https://github.com/webex/sdk-component-adapter/commit/355a106f749558073313c336517991bbb351e57c))

## [1.85.2](https://github.com/webex/sdk-component-adapter/compare/v1.85.1...v1.85.2) (2021-11-08)


### Bug Fixes

* **rollup:** replace deprecated rollup plugins with recommended ones ([76f327b](https://github.com/webex/sdk-component-adapter/commit/76f327b30dba3fd73d6aab65a87c31b0cf3e2dd5))

## [1.85.1](https://github.com/webex/sdk-component-adapter/compare/v1.85.0...v1.85.1) (2021-11-08)


### Bug Fixes

* **MeetingsSdkAdapter:** show default camera and microphone in webex settings ([a1f865c](https://github.com/webex/sdk-component-adapter/commit/a1f865cbb35a0e20e46f965d3c60f99090671440))

# [1.85.0](https://github.com/webex/sdk-component-adapter/compare/v1.84.0...v1.85.0) (2021-11-04)


### Features

* **MeetingsSdkAdapter:** change the identification mode of error stack for meetings with password ([073faf5](https://github.com/webex/sdk-component-adapter/commit/073faf5fed50654b6e7950b81a4be1ddb8578121))

# [1.84.0](https://github.com/webex/sdk-component-adapter/compare/v1.83.0...v1.84.0) (2021-11-04)


### Bug Fixes

* **package:** update parcel and parcel-bundle versions to latest ([38075d2](https://github.com/webex/sdk-component-adapter/commit/38075d2d04a113cd2a1d07d0085ba1cd48a1b8c1))


### Features

* **scripts:** add input elements related to pasword, host key and meeting state in sdk demo page ([883ff36](https://github.com/webex/sdk-component-adapter/commit/883ff363d6c0df485aac10515479da76cb752ed8))

# [1.83.0](https://github.com/webex/sdk-component-adapter/compare/v1.82.1...v1.83.0) (2021-11-03)


### Features

* **logger:** enable debug logs from the console ([b794ae6](https://github.com/webex/sdk-component-adapter/commit/b794ae681a9eb6f87c9e9e3d9f5d424ca5e77514))

## [1.82.1](https://github.com/webex/sdk-component-adapter/compare/v1.82.0...v1.82.1) (2021-11-03)


### Bug Fixes

* **Winston:** repair winston export for widgets ([d7ad8d1](https://github.com/webex/sdk-component-adapter/commit/d7ad8d17bbf86c61ebc87ab73dc157516f9234de))

# [1.82.0](https://github.com/webex/sdk-component-adapter/compare/v1.81.0...v1.82.0) (2021-11-02)


### Features

* **PeopleSdkAdapter:** add debug logs ([9360692](https://github.com/webex/sdk-component-adapter/commit/93606922bb03e153ab8015409d767a5a9db756de))

# [1.81.0](https://github.com/webex/sdk-component-adapter/compare/v1.80.0...v1.81.0) (2021-11-02)


### Bug Fixes

* **logger:** add the correct type property of media stream tracks ([fdb75bb](https://github.com/webex/sdk-component-adapter/commit/fdb75bb54f9e54a52d763bb1966e69e7dae18025))


### Features

* **MeetingsSdkAdapter:** update meeting controls type ([b78c306](https://github.com/webex/sdk-component-adapter/commit/b78c3061fd1bc13a6c027a96208c4d5023549361))
* **OrganizationsSdkAdapter:** add debug logs ([38f24fa](https://github.com/webex/sdk-component-adapter/commit/38f24faa5c2a07abbe21e99fb4f07bd0ee81834e))

# [1.80.0](https://github.com/webex/sdk-component-adapter/compare/v1.79.0...v1.80.0) (2021-10-28)


### Features

* **MeetingsSdkAdapter:** remove size from icon names ([c333624](https://github.com/webex/sdk-component-adapter/commit/c3336240ad486c20e286ea1bfe0b708d0bef79a5))

# [1.79.0](https://github.com/webex/sdk-component-adapter/compare/v1.78.0...v1.79.0) (2021-10-28)


### Features

* **MeetingsSdkAdapter:** add debug logs ([53e95b7](https://github.com/webex/sdk-component-adapter/commit/53e95b7082e74b6d1e66a1787c6f516c1d511b46))

# [1.78.0](https://github.com/webex/sdk-component-adapter/compare/v1.77.0...v1.78.0) (2021-10-28)


### Features

* **RoomsSdkAdapter:** add debug logs ([713eae7](https://github.com/webex/sdk-component-adapter/commit/713eae7ad593fc065c4f263e712ddaba03a89fae))

# [1.77.0](https://github.com/webex/sdk-component-adapter/compare/v1.76.0...v1.77.0) (2021-10-28)


### Features

* **MeetingsSdkAdapter:** change 'type' for 'Settings', 'Audio' and 'Video' controls ([1659670](https://github.com/webex/sdk-component-adapter/commit/1659670b56809b845057b1ff35e6fc198516a218))

# [1.76.0](https://github.com/webex/sdk-component-adapter/compare/v1.75.0...v1.76.0) (2021-10-27)


### Features

* **MeetingsSdkAdapter:** implement host key to join meeting ([25c1df5](https://github.com/webex/sdk-component-adapter/commit/25c1df5aa3c9f981f7f3efd65c88cc2e8fe0d359))

# [1.75.0](https://github.com/webex/sdk-component-adapter/compare/v1.74.0...v1.75.0) (2021-10-26)


### Features

* **MeetingsSdkAdapter:** add 'type' for ProceedWithoutCamera and ProceedWithoutMicrophone controls ([c532dda](https://github.com/webex/sdk-component-adapter/commit/c532dda71771ee202775f61cacd9cf58442a685a))

# [1.74.0](https://github.com/webex/sdk-component-adapter/compare/v1.73.0...v1.74.0) (2021-10-26)


### Features

* **MeetingsSdkAdapter:** implement custom logger using winston ([a271787](https://github.com/webex/sdk-component-adapter/commit/a2717879776e268ca66bff5d0fbd9e60de6b1e8f))

# [1.73.0](https://github.com/webex/sdk-component-adapter/compare/v1.72.0...v1.73.0) (2021-10-26)


### Features

* **MeetingsSdkAdapter:** deactivate join while waiting for host ([31692e8](https://github.com/webex/sdk-component-adapter/commit/31692e84f91e95211aecd7e9cf5a043446e77c36))

# [1.72.0](https://github.com/webex/sdk-component-adapter/compare/v1.71.0...v1.72.0) (2021-10-22)


### Features

* **MeetingsSdkAdapter:** add hints for settings controls ([bac0b47](https://github.com/webex/sdk-component-adapter/commit/bac0b4775740ba9ff385a56e30519a2e09fad4a6))

# [1.71.0](https://github.com/webex/sdk-component-adapter/compare/v1.70.1...v1.71.0) (2021-10-21)


### Features

* **MeetingsSdkAdapter:** update tooltips text ([8cc638b](https://github.com/webex/sdk-component-adapter/commit/8cc638bcea8da424eae8469579f6464a8216b06b))

## [1.70.1](https://github.com/webex/sdk-component-adapter/compare/v1.70.0...v1.70.1) (2021-10-21)


### Bug Fixes

* **MeetingsSdkAdapter:** update meeting controls text ([6e53159](https://github.com/webex/sdk-component-adapter/commit/6e5315974769428808251be8424d71bdd13e3b85))

# [1.70.0](https://github.com/webex/sdk-component-adapter/compare/v1.69.2...v1.70.0) (2021-10-21)


### Features

* **MeetingsSdkAdapter:** handle invalid password when joining ([7e5d143](https://github.com/webex/sdk-component-adapter/commit/7e5d1431b511cb0e527955bcef6a28828b914f18))

## [1.69.2](https://github.com/webex/sdk-component-adapter/compare/v1.69.1...v1.69.2) (2021-10-20)


### Bug Fixes

* **MeetingsSdkAdapter:** don't enable camera or microphone when it is switched from settings ([584440e](https://github.com/webex/sdk-component-adapter/commit/584440efd6dddbb4eae2421d59863ed9e275f109))

## [1.69.1](https://github.com/webex/sdk-component-adapter/compare/v1.69.0...v1.69.1) (2021-10-20)


### Bug Fixes

* **MeetingsSdkAdapter:** add local media after the sdk meeting moves to the ACTIVE state ([8c05c87](https://github.com/webex/sdk-component-adapter/commit/8c05c87b5d0f0f727c04dce895bf5193821362dd))

# [1.69.0](https://github.com/webex/sdk-component-adapter/compare/v1.68.0...v1.69.0) (2021-10-20)


### Features

* **MeetingsSdkAdapter:** add a flag to the meeting object when password is required ([84fa4d7](https://github.com/webex/sdk-component-adapter/commit/84fa4d7c44017e29be6f34b7a26b34423c20f43b))

# [1.68.0](https://github.com/webex/sdk-component-adapter/compare/v1.67.0...v1.68.0) (2021-10-19)


### Features

* **MeetingsSdkAdapter:** add 'hint' for ProceedWithoutCamera and ProceedWithoutMicrophone controls ([07a07ed](https://github.com/webex/sdk-component-adapter/commit/07a07ed45297aa1b4e3bbe46c681a836d455b4bc))

# [1.67.0](https://github.com/webex/sdk-component-adapter/compare/v1.66.1...v1.67.0) (2021-10-14)


### Features

* **MeetingsSdkAdapter:** send name and password when joining ([e0a0a85](https://github.com/webex/sdk-component-adapter/commit/e0a0a85e82dddb254c645686c3d034595b0b28c5))

## [1.66.1](https://github.com/webex/sdk-component-adapter/compare/v1.66.0...v1.66.1) (2021-10-14)


### Bug Fixes

* **package:** update webex to v.1.142.0 ([fd51a1d](https://github.com/webex/sdk-component-adapter/commit/fd51a1d66e60993d1449d9239690d634045317d3))

# [1.66.0](https://github.com/webex/sdk-component-adapter/compare/v1.65.0...v1.66.0) (2021-10-13)


### Features

* **MeetingSdkAdapter:** implement share control in its own file and create the tests accordingly ([fd81198](https://github.com/webex/sdk-component-adapter/commit/fd81198178e516565e7af070d24892aed8ab4d73))

# [1.65.0](https://github.com/webex/sdk-component-adapter/compare/v1.64.0...v1.65.0) (2021-10-13)


### Features

* **MeetingsSdkAdapter:** add 'hint' for joinControl ([541912f](https://github.com/webex/sdk-component-adapter/commit/541912fc0c9c03fa2d6f142ea2b5e53d735833b4))
* **MeetingsSdkAdapter:** add tests for 'supportedControls()' method ([2e33562](https://github.com/webex/sdk-component-adapter/commit/2e335627b4cd9ea0255ec2ed5bac3b52114a961d))
* **SwitchSpeakerControl:** update tooltip message when no speakers in Firefox and Safari ([cdd5c47](https://github.com/webex/sdk-component-adapter/commit/cdd5c4711e74d05eb029ed37ce7d480d01f27cb3))

# [1.64.0](https://github.com/webex/sdk-component-adapter/compare/v1.63.0...v1.64.0) (2021-10-04)


### Features

* **MeetingsSdkAdapter:** create 'supportedControls()' method ([b2877cd](https://github.com/webex/sdk-component-adapter/commit/b2877cd42ea998676675f3d38f811a547a54c13d))

# [1.63.0](https://github.com/webex/sdk-component-adapter/compare/v1.62.0...v1.63.0) (2021-09-23)


### Features

* **MembershipsSdkAdapter:** check if org id exists ([5a5efc8](https://github.com/webex/sdk-component-adapter/commit/5a5efc872db30c6bbba74140a4c7635e3a182219))

# [1.62.0](https://github.com/webex/sdk-component-adapter/compare/v1.61.1...v1.62.0) (2021-09-16)


### Features

* **config:** add maxWorkers to jest command ([9e83401](https://github.com/webex/sdk-component-adapter/commit/9e834018758d5a8e4bd95a43f18b12c5c1a59976))

## [1.61.1](https://github.com/webex/sdk-component-adapter/compare/v1.61.0...v1.61.1) (2021-09-15)


### Bug Fixes

* **MeetingsSdkAdapter:** add type multiselect to switch camera and switch speaker controls ([63d5609](https://github.com/webex/sdk-component-adapter/commit/63d560914c73d8090c70cc8524c7d49870d46cc4))

# [1.61.0](https://github.com/webex/sdk-component-adapter/compare/v1.60.0...v1.61.0) (2021-09-08)


### Features

* **MeetingsSdkAdapter:** move video control in a separate file ([6e5b2a2](https://github.com/webex/sdk-component-adapter/commit/6e5b2a229dea958aba4ce45448bd4a54bbb3977d))

# [1.60.0](https://github.com/webex/sdk-component-adapter/compare/v1.59.0...v1.60.0) (2021-09-08)


### Bug Fixes

* **MeetingsSdkAdapter:** stop stream when switching cameras ([6ac8ebf](https://github.com/webex/sdk-component-adapter/commit/6ac8ebfa6136afe44ceda745969ed0381658c77c))
* **MeetingsSdkAdapter:** stop stream when switching microphones ([cd98107](https://github.com/webex/sdk-component-adapter/commit/cd9810711b5ceef78181eda4323c89f96eafade0))


### Features

* **MeetingsSdkAdapter:** move proceed without microphone control in its own file and create tests ([ca80867](https://github.com/webex/sdk-component-adapter/commit/ca8086714e49f617d99c2e396304cd7605a812d9))

# [1.59.0](https://github.com/webex/sdk-component-adapter/compare/v1.58.0...v1.59.0) (2021-09-06)


### Features

* **MeetingsSdkAdapter:** add missing text on controls ([c439fe7](https://github.com/webex/sdk-component-adapter/commit/c439fe7dd6a4579169eef543ca73516531d1ca70))

# [1.58.0](https://github.com/webex/sdk-component-adapter/compare/v1.57.0...v1.58.0) (2021-09-03)


### Features

* **MeetingSdkAdapter:** implement switch speaker in its own file and create the tests accordingly ([8d8d955](https://github.com/webex/sdk-component-adapter/commit/8d8d955740a447565fe5f1309d5a0228008b547e))
* **MeetingsSdkAdapter:** stop disabled stream when leaving the meeting ([6a8204e](https://github.com/webex/sdk-component-adapter/commit/6a8204ea77ed4041295c0e19decf9047480ac9aa))

# [1.57.0](https://github.com/webex/sdk-component-adapter/compare/v1.56.0...v1.57.0) (2021-08-27)


### Features

* **MeetingSdkAdapter:** implement switch microphone control in its own file and create the tests ([e1d0de9](https://github.com/webex/sdk-component-adapter/commit/e1d0de986ce34adbb6479a9a764161af5d3e30fa))
* **MeetingSdkAdapter:** move proceed without camera control in its own file and create the tests ([857cff2](https://github.com/webex/sdk-component-adapter/commit/857cff2a90371a5a6fb78ef13a5ac69538b03df0))
* **MeetingsSdkAdapter:** add unmuted icon on audio control ([1bfc314](https://github.com/webex/sdk-component-adapter/commit/1bfc3141881bfda030a15f6757eacee1b65300ae))

# [1.56.0](https://github.com/webex/sdk-component-adapter/compare/v1.55.0...v1.56.0) (2021-08-24)


### Features

* **MeetingControls:** add types for meeting controls ([a26bc09](https://github.com/webex/sdk-component-adapter/commit/a26bc0956c94b9789daa02693dd3109ee9702c24))
* **MeetingSdkAdapter:** implement switch camera control in its own file and create the tests ([e08bd48](https://github.com/webex/sdk-component-adapter/commit/e08bd4814228c437c0dad6baf1148baa536eac62))
* **MeetingsSdkAdapter:** take meeting title ([c9cbf10](https://github.com/webex/sdk-component-adapter/commit/c9cbf1013265ea7283160b5a0f3eb46ec827431d))

# [1.55.0](https://github.com/webex/sdk-component-adapter/compare/v1.54.0...v1.55.0) (2021-08-11)


### Features

* **MeetingsSdkAdapter:** add text to control buttons ([75ed197](https://github.com/webex/sdk-component-adapter/commit/75ed19704c0160f9d56fa06ad491a8e7e7371ed7))
* **MeetingsSdkAdapter:** move audio control in a separate file ([42a797e](https://github.com/webex/sdk-component-adapter/commit/42a797e76a96c5e3ffef24c8af07e3b0fa34ccf8))

# [1.54.0](https://github.com/webex/sdk-component-adapter/compare/v1.53.1...v1.54.0) (2021-08-06)


### Features

* **MeetingSdkAdapter:** implement join control in its own file and create the tests accordingly ([68a4376](https://github.com/webex/sdk-component-adapter/commit/68a4376e43d2ee8cf65e73caf05c0c1286833c45))

## [1.53.1](https://github.com/webex/sdk-component-adapter/compare/v1.53.0...v1.53.1) (2021-08-04)


### Bug Fixes

* **MeetingsSdkAdapter:** check for deviceId when filtering available devices ([f6adfdc](https://github.com/webex/sdk-component-adapter/commit/f6adfdc50dcc8db8966cef7495e04c9f54cfe25e))

# [1.53.0](https://github.com/webex/sdk-component-adapter/compare/v1.52.2...v1.53.0) (2021-08-04)


### Features

* **MeetingSdkAdapter:** implement exit control in its own file and create the tests accordingly ([3489eaf](https://github.com/webex/sdk-component-adapter/commit/3489eaf932484e6f00669d5d7309f4c23ac35dc0))

## [1.52.2](https://github.com/webex/sdk-component-adapter/compare/v1.52.1...v1.52.2) (2021-07-30)


### Bug Fixes

* **MeetingsSdkAdapter:** refactor tests to use global MediaStream mock object ([13ab533](https://github.com/webex/sdk-component-adapter/commit/13ab533ba2575ba4cff6eeff0a4089038f0afd57))

## [1.52.1](https://github.com/webex/sdk-component-adapter/compare/v1.52.0...v1.52.1) (2021-07-30)


### Bug Fixes

* **MeetingsSdkAdapter:** use meetingsSDKAdapter variable in tests file ([c53bfeb](https://github.com/webex/sdk-component-adapter/commit/c53bfebae97b4b201d4f43b7c60ca69d6ca1bfb4))

# [1.52.0](https://github.com/webex/sdk-component-adapter/compare/v1.51.0...v1.52.0) (2021-07-27)


### Features

* **MeetingsSdkAdapter:** implement proceed without microphone control ([0518b04](https://github.com/webex/sdk-component-adapter/commit/0518b049a35b7c9a20c3cf108a4a0961b0986e5c))

# [1.51.0](https://github.com/webex/sdk-component-adapter/compare/v1.50.0...v1.51.0) (2021-07-27)


### Features

* **MeetingsSdkAdapter:** avoid emitting 'asking' state when user already allowed or denied access ([ae22028](https://github.com/webex/sdk-component-adapter/commit/ae220281aa499fce890edd611a8928f7bc7bad97))

# [1.50.0](https://github.com/webex/sdk-component-adapter/compare/v1.49.2...v1.50.0) (2021-07-27)


### Features

* **MeetingsSdkAdapter:** remove "Personal Room" from meeting title ([2c3d94f](https://github.com/webex/sdk-component-adapter/commit/2c3d94f1f102293776b98c6880f6c082e928d322))

## [1.49.2](https://github.com/webex/sdk-component-adapter/compare/v1.49.1...v1.49.2) (2021-07-26)


### Bug Fixes

* **MeetingsSdkAdapter:** stop local share stream when sdk event is emitted ([f41ae02](https://github.com/webex/sdk-component-adapter/commit/f41ae027793378920ee4e277b07740898214b641))

## [1.49.1](https://github.com/webex/sdk-component-adapter/compare/v1.49.0...v1.49.1) (2021-07-23)


### Bug Fixes

* **MeetingsSdkAdapter:** chain dependent observables on createMeeting ([6a6ce40](https://github.com/webex/sdk-component-adapter/commit/6a6ce404f35f692ba708d45e7a59a30aa7d01ff4))

# [1.49.0](https://github.com/webex/sdk-component-adapter/compare/v1.48.0...v1.49.0) (2021-07-22)


### Features

* **MeetingSdkAdapter:** implement settings control in its own file and create the tests accordingly ([9d085a2](https://github.com/webex/sdk-component-adapter/commit/9d085a2eb2c5f583b7e0d936e17dae29f9dccfe1))

# [1.48.0](https://github.com/webex/sdk-component-adapter/compare/v1.47.0...v1.48.0) (2021-07-22)


### Features

* **MeetingsSdkAdapter:** implement proceed without camera control ([208e69b](https://github.com/webex/sdk-component-adapter/commit/208e69b78c041c6a9673367349394c7cb5314084))

# [1.47.0](https://github.com/webex/sdk-component-adapter/compare/v1.46.0...v1.47.0) (2021-07-21)


### Features

* **MeetingSdkAdapter:** implement roster control in its own file and create the tests accordingly ([fbfaa8b](https://github.com/webex/sdk-component-adapter/commit/fbfaa8be7c734399e9f2d90d70002988d5aa99f9))

# [1.46.0](https://github.com/webex/sdk-component-adapter/compare/v1.45.1...v1.46.0) (2021-07-21)


### Features

* **MeetingsSdkAdapter:** add no devices messages to dropdown controls ([e4348c7](https://github.com/webex/sdk-component-adapter/commit/e4348c706c2cf61db6b2d228ffa5cc2a769bbc9e))

## [1.45.1](https://github.com/webex/sdk-component-adapter/compare/v1.45.0...v1.45.1) (2021-07-21)


### Bug Fixes

* **MeetingSdkAdapter:** access the local share stream correctly in handleLocalShare() ([3bd829b](https://github.com/webex/sdk-component-adapter/commit/3bd829bb17f838ad00af2321e0c3728145fe31d8))

# [1.45.0](https://github.com/webex/sdk-component-adapter/compare/v1.44.2...v1.45.0) (2021-07-20)


### Features

* **MeetingSdkAdapter:** remove media before leave meeting ([e4357c5](https://github.com/webex/sdk-component-adapter/commit/e4357c55591d1e5b2f32326e84d6ad2bbfd9107b))

## [1.44.2](https://github.com/webex/sdk-component-adapter/compare/v1.44.1...v1.44.2) (2021-07-19)


### Bug Fixes

* **MeetingsSdkAdapter:** use getMeeting for audio and video controls ([b1bf081](https://github.com/webex/sdk-component-adapter/commit/b1bf0815b14119adf891cdf000014b983ab03733))

## [1.44.1](https://github.com/webex/sdk-component-adapter/compare/v1.44.0...v1.44.1) (2021-07-19)


### Bug Fixes

* **MeetingsSdkAdapter:** make getMeeting observable also emit messages emitted by createMeeting ([4e9dc62](https://github.com/webex/sdk-component-adapter/commit/4e9dc629dd6da167b25e02ed35300ac914b68422))

# [1.44.0](https://github.com/webex/sdk-component-adapter/compare/v1.43.1...v1.44.0) (2021-07-16)


### Bug Fixes

* **dropdown-controls:** select initial value ([8fdb304](https://github.com/webex/sdk-component-adapter/commit/8fdb304d86368eb7ed0cd8728f58640405e6bae9))
* **MeetingSdkAdapter:** stop local sharing stream immediately after clicking the stop share button ([911f450](https://github.com/webex/sdk-component-adapter/commit/911f45007fbaac7d7ab3c23d6925ec42aae982ed))


### Features

* **package:** configure winston logger ([9f88804](https://github.com/webex/sdk-component-adapter/commit/9f88804932c893dc450e1e8f2f15f27f46402d4f))

## [1.43.1](https://github.com/webex/sdk-component-adapter/compare/v1.43.0...v1.43.1) (2021-07-16)


### Bug Fixes

* **MeetingsSdkAdapter:** handle switch microphone control events in getMeeting() ([a64064d](https://github.com/webex/sdk-component-adapter/commit/a64064dae9339cadfea8538c09b275e4eea987e4))

# [1.43.0](https://github.com/webex/sdk-component-adapter/compare/v1.42.0...v1.43.0) (2021-07-16)


### Features

* **MeetingsAdapter:** transform localAudio and localVideo into objects ([55ee723](https://github.com/webex/sdk-component-adapter/commit/55ee723224ff821e06957c4a4b0407ab0d456327))

# [1.42.0](https://github.com/webex/sdk-component-adapter/compare/v1.41.3...v1.42.0) (2021-07-14)


### Features

* **MeetingSdkAdapter:** transform localShare into an object ([f5d1c61](https://github.com/webex/sdk-component-adapter/commit/f5d1c6184a715c7e12420049e45755627651156b))

## [1.41.3](https://github.com/webex/sdk-component-adapter/compare/v1.41.2...v1.41.3) (2021-07-13)


### Bug Fixes

* **MeetingsSdkAdapter:** keep only audio (video) tracks in audio (video) streams ([312a05f](https://github.com/webex/sdk-component-adapter/commit/312a05f4010fbde0900a78b8dbe7dcf8f07a0ca0))

## [1.41.2](https://github.com/webex/sdk-component-adapter/compare/v1.41.1...v1.41.2) (2021-07-13)


### Bug Fixes

* **MeetingSdkAdapter:** modify meeting tests to use MediaStream-like objects ([e739a9d](https://github.com/webex/sdk-component-adapter/commit/e739a9dd7d149e7123da98b4e092c95c69ec81ad))

## [1.41.1](https://github.com/webex/sdk-component-adapter/compare/v1.41.0...v1.41.1) (2021-07-12)


### Bug Fixes

* **MeetingsSdkAdapter:** rename handleSettings to toggleSettings ([a0852ea](https://github.com/webex/sdk-component-adapter/commit/a0852eaf20ac6db60c53b6f984da0ebe009223ac))

# [1.41.0](https://github.com/webex/sdk-component-adapter/compare/v1.40.0...v1.41.0) (2021-07-09)


### Features

* **MeetingsSdkAdapter:** add speaker selection control ([fe9da04](https://github.com/webex/sdk-component-adapter/commit/fe9da04020b8a83a988c6702cd05124d993afc46))
* **MeetingsSdkAdapter:** allow switching microphone after joining the meeting ([a4352ad](https://github.com/webex/sdk-component-adapter/commit/a4352ad0e22fa264e9f86bd43a237a70634dcaec))

# [1.40.0](https://github.com/webex/sdk-component-adapter/compare/v1.39.0...v1.40.0) (2021-07-06)


### Features

* **MeetingsSdkAdapter:** allow switching camera after joining the meeting ([9271813](https://github.com/webex/sdk-component-adapter/commit/9271813d7e4f5290b9a6c874e7d0ae47e4916cb7))

# [1.39.0](https://github.com/webex/sdk-component-adapter/compare/v1.38.3...v1.39.0) (2021-07-05)


### Features

* **MeetingsSdkAdapter:** add microphone selection control ([acedefa](https://github.com/webex/sdk-component-adapter/commit/acedefaad3ffadf1ad94800e3c93edc17ba26a9f))

## [1.38.3](https://github.com/webex/sdk-component-adapter/compare/v1.38.2...v1.38.3) (2021-07-05)


### Bug Fixes

* **MeetingsSdkAdapter:** update switch-camera control to use observable returned by getStream ([00b229b](https://github.com/webex/sdk-component-adapter/commit/00b229bf7a4f83027c4e11c8957ea4515fea921a))

## [1.38.2](https://github.com/webex/sdk-component-adapter/compare/v1.38.1...v1.38.2) (2021-07-03)


### Bug Fixes

* **MeetingsSdkAdapter:** stop share stream before setting it to null ([ab2033d](https://github.com/webex/sdk-component-adapter/commit/ab2033d4f92b48a55f27a9f548fc9619836f76b1))

## [1.38.1](https://github.com/webex/sdk-component-adapter/compare/v1.38.0...v1.38.1) (2021-06-29)


### Bug Fixes

* **src:** remove retro file ([6002708](https://github.com/webex/sdk-component-adapter/commit/600270874bed3c54d718b23e6365d5b6ca930778))

# [1.38.0](https://github.com/webex/sdk-component-adapter/compare/v1.37.0...v1.38.0) (2021-06-29)


### Features

* **MeetingsSdkAdapter:** set audio/video permissions ([38ce4e7](https://github.com/webex/sdk-component-adapter/commit/38ce4e7cfe813f5144f79d80454744c0df44cd11))

# [1.37.0](https://github.com/webex/sdk-component-adapter/compare/v1.36.1...v1.37.0) (2021-06-29)


### Features

* **MeetingsSdkAdapter:** add camera selection control ([5e65024](https://github.com/webex/sdk-component-adapter/commit/5e65024724b69ee6c061cc024d05ff556440d4a1))

## [1.36.1](https://github.com/webex/sdk-component-adapter/compare/v1.36.0...v1.36.1) (2021-06-24)


### Bug Fixes

* **MeetingSdkAdapter:** share button doesn't update the display ([16f0900](https://github.com/webex/sdk-component-adapter/commit/16f0900f235a3cb20de2a1f62be2199616e69cbb))

# [1.36.0](https://github.com/webex/sdk-component-adapter/compare/v1.35.0...v1.36.0) (2021-06-16)


### Features

* **MeetingSdkAdapter:** make createMeeting() emit an intermediary message without local media ([707df7e](https://github.com/webex/sdk-component-adapter/commit/707df7e1e40b7c61d0683670188e21dd53c71447))

# [1.35.0](https://github.com/webex/sdk-component-adapter/compare/v1.34.0...v1.35.0) (2021-06-08)


### Features

* **MeetingSdkAdapter:** disable audio/video controls when no media ([863cd79](https://github.com/webex/sdk-component-adapter/commit/863cd79dcb9bab0ef24eb866638326bbbbf62f53))

# [1.34.0](https://github.com/webex/sdk-component-adapter/compare/v1.33.4...v1.34.0) (2021-06-03)


### Bug Fixes

* **MeetingSdkAdapter:** share button doesn't update the display ([b53ded7](https://github.com/webex/sdk-component-adapter/commit/b53ded78bd9662d776f21d2f5ebe77833db652e7))


### Features

* **MeetingSdkAdapter:** add settings control ([cd19dd6](https://github.com/webex/sdk-component-adapter/commit/cd19dd6988fc4f366d939a13782b7375a45c6aa5))

## [1.33.4](https://github.com/webex/sdk-component-adapter/compare/v1.33.3...v1.33.4) (2021-05-21)


### Bug Fixes

* **package:** update component adapter interfaces version to v1.17.0 ([1a67d6d](https://github.com/webex/sdk-component-adapter/commit/1a67d6dff1b68eddf5f070c91caa9b009d5281c7))

## [1.33.3](https://github.com/webex/sdk-component-adapter/compare/v1.33.2...v1.33.3) (2021-05-13)


### Bug Fixes

* **MembershipSdkAdapter:** change member id ([64669cf](https://github.com/webex/sdk-component-adapter/commit/64669cfdbd8b82be7a8e5cb5ff733872e8db82c3))

## [1.33.2](https://github.com/webex/sdk-component-adapter/compare/v1.33.1...v1.33.2) (2021-04-27)


### Bug Fixes

* **MeetingsSdkAdapter:** prevent JavaScript errors when access to camera/microphone is denied ([d9117c3](https://github.com/webex/sdk-component-adapter/commit/d9117c36731aa8bf0540e1b7b2aea8c7220963ea))

## [1.33.1](https://github.com/webex/sdk-component-adapter/compare/v1.33.0...v1.33.1) (2021-04-20)


### Bug Fixes

* **MeetingsAdapter:** change states for meeting ([02c8263](https://github.com/webex/sdk-component-adapter/commit/02c82634922e4b890d2a90c7a2913cdcf4803259))

# [1.33.0](https://github.com/webex/sdk-component-adapter/compare/v1.32.0...v1.33.0) (2021-04-20)


### Features

* **MembershipsSdkAdapter:** add boolean guest field to emitted membership members ([369ed10](https://github.com/webex/sdk-component-adapter/commit/369ed10800174ec601c5071cc26b8bb5e6203b76))

# [1.32.0](https://github.com/webex/sdk-component-adapter/compare/v1.31.1...v1.32.0) (2021-04-14)


### Bug Fixes

* **dependencies:** use latest version for component adapter interfaces ([7de5c37](https://github.com/webex/sdk-component-adapter/commit/7de5c37c1399fb5eb1aa703d041b62d571d381cd))


### Features

* **OrganizationsSdkAdaper:** add organizations adapter ([fadb715](https://github.com/webex/sdk-component-adapter/commit/fadb715eee44125833a990d50b3923cbf755545c))

## [1.31.1](https://github.com/webex/sdk-component-adapter/compare/v1.31.0...v1.31.1) (2021-04-14)


### Bug Fixes

* **MeetingsSdkAdapter:** set size on each control icon ([7417163](https://github.com/webex/sdk-component-adapter/commit/7417163b39693b9bf0677c8dbbe973b6e42465aa))

# [1.31.0](https://github.com/webex/sdk-component-adapter/compare/v1.30.1...v1.31.0) (2021-04-13)


### Features

* **MembershipsSdkAdapter:** add boolean host field to emitted membership members ([0b5c5f9](https://github.com/webex/sdk-component-adapter/commit/0b5c5f9fd6bfab1ed8250a21c1edec3c0c580332))

## [1.30.1](https://github.com/webex/sdk-component-adapter/compare/v1.30.0...v1.30.1) (2021-04-09)


### Bug Fixes

* **MeetingsSdkAdapter:** update screen sharing icon ([3b8da37](https://github.com/webex/sdk-component-adapter/commit/3b8da3792f25a37c3cc9587604516a944e880fe5))

# [1.30.0](https://github.com/webex/sdk-component-adapter/compare/v1.29.0...v1.30.0) (2021-04-07)


### Features

* **MeetingsSdkAdapter:** add member-roster control ([0f22f71](https://github.com/webex/sdk-component-adapter/commit/0f22f71e502a644308b996153e9f7397a227f6cf))

# [1.29.0](https://github.com/webex/sdk-component-adapter/compare/v1.28.0...v1.29.0) (2021-04-07)


### Features

* **MembershipsSdkAdapter:** add orgID field to meeting members ([262ea4c](https://github.com/webex/sdk-component-adapter/commit/262ea4c151ab9e5edc97529190ac2ec301dee192))

# [1.28.0](https://github.com/webex/sdk-component-adapter/compare/v1.27.0...v1.28.0) (2021-04-06)


### Bug Fixes

* **MembershipsSdkAdapter:** add unresolvable named export SDK_EVENT ([a47fe23](https://github.com/webex/sdk-component-adapter/commit/a47fe234f1a8095679ea65ba265d6e2b0c896494))


### Features

* **MembershipsSdkAdapter:** return members of a room ([637109f](https://github.com/webex/sdk-component-adapter/commit/637109f64c50e57ba940b819c5f1c6e35d096f25))

# [1.27.0](https://github.com/webex/sdk-component-adapter/compare/v1.26.2...v1.27.0) (2021-03-31)


### Features

* **MembershipsSdkAdapter:** return the sharing status of each member ([bef5099](https://github.com/webex/sdk-component-adapter/commit/bef50998ef0b1af86cc0d6dd354f003846c7aa05))

## [1.26.2](https://github.com/webex/sdk-component-adapter/compare/v1.26.1...v1.26.2) (2021-03-25)


### Bug Fixes

* **memberships:** update Webex SDK ([867a9b6](https://github.com/webex/sdk-component-adapter/commit/867a9b6182aae43fd5084ef746ba3398294eb016))

## [1.26.1](https://github.com/webex/sdk-component-adapter/compare/v1.26.0...v1.26.1) (2021-03-24)


### Bug Fixes

* fetch room data with globalId ([12a135e](https://github.com/webex/sdk-component-adapter/commit/12a135ec84a46a7c422599524ee9d0a5cf8c32f1))

# [1.26.0](https://github.com/webex/sdk-component-adapter/compare/v1.25.0...v1.26.0) (2021-03-22)


### Bug Fixes

* **MembershipsSdkAdapter:** fix test ([65baa63](https://github.com/webex/sdk-component-adapter/commit/65baa63db9977b8b29c57ec750989d5f282dac34))


### Features

* **MembershipsSDKAdapter:** return membership status and all members ([825a0ed](https://github.com/webex/sdk-component-adapter/commit/825a0ed320e36ffbbf6ef8fe0a96f0cd54412e1f))

# [1.25.0](https://github.com/webex/sdk-component-adapter/compare/v1.24.1...v1.25.0) (2021-03-18)


### Features

* **MembershipsSdkAdapter:** return muted status ([dee4ff0](https://github.com/webex/sdk-component-adapter/commit/dee4ff07ec6783710ed4abe0f7b47efe5aca2486))

## [1.24.1](https://github.com/webex/sdk-component-adapter/compare/v1.24.0...v1.24.1) (2020-09-16)


### Bug Fixes

* **MembershipsSdkAdapter:** get in meeting members ([685764d](https://github.com/webex/sdk-component-adapter/commit/685764dc59b2474707a01f1319c3c0643d6fb19a))

# [1.24.0](https://github.com/webex/sdk-component-adapter/compare/v1.23.0...v1.24.0) (2020-09-15)


### Features

* **MeetingsSdkAdapter:** add support for remote sharing events ([ffaacf4](https://github.com/webex/sdk-component-adapter/commit/ffaacf43e57bb6b5eb1383b59b22088213da5b42))

# [1.23.0](https://github.com/webex/sdk-component-adapter/compare/v1.22.1...v1.23.0) (2020-09-11)


### Features

* **MembershipsSdkAdapter:** add ability to find meeting memberships ([c0f2750](https://github.com/webex/sdk-component-adapter/commit/c0f27502b7938a6399c68108001078ec0dcaea38))

## [1.22.1](https://github.com/webex/sdk-component-adapter/compare/v1.22.0...v1.22.1) (2020-09-09)


### Bug Fixes

* **meetingsSDKAdapter:** check media stream exists before getting tracks when joining ([685556c](https://github.com/webex/sdk-component-adapter/commit/685556ca8b50ec83004149c380b95ac83a52452d))

# [1.22.0](https://github.com/webex/sdk-component-adapter/compare/v1.21.2...v1.22.0) (2020-09-03)


### Features

* **package:** update webex dependency to ^1.92.0 ([f089502](https://github.com/webex/sdk-component-adapter/commit/f089502bb32b6ae1b76ca1dedcaa086188ccddcf))

## [1.21.2](https://github.com/webex/sdk-component-adapter/compare/v1.21.1...v1.21.2) (2020-07-21)


### Bug Fixes

* **MeetingsSdkAdapter:** attach local audio at join even when muted ([b9bc5fe](https://github.com/webex/sdk-component-adapter/commit/b9bc5fe1d298d791bbd98ba7e27dcc599aa795ea))
* **MeetingsSdkAdapter:** attach local video stream at join when muted ([95f4ede](https://github.com/webex/sdk-component-adapter/commit/95f4ede18e0b8052d369ceacb8759071d2f8c022))

## [1.21.1](https://github.com/webex/sdk-component-adapter/compare/v1.21.0...v1.21.1) (2020-07-08)


### Bug Fixes

* **MeetingsSdkAdapter:** use correct key for media settings on addMedia ([a51531a](https://github.com/webex/sdk-component-adapter/commit/a51531ac51e6e06410513c71a1c03bcf6eada87f))

# [1.21.0](https://github.com/webex/sdk-component-adapter/compare/v1.20.0...v1.21.0) (2020-06-16)


### Features

* **MeetingSdkAdapter:** add screen share meeting control ([4083451](https://github.com/webex/sdk-component-adapter/commit/4083451730029b4b41f9ff12bb728bdd9e9c404a))

# [1.20.0](https://github.com/webex/sdk-component-adapter/compare/v1.19.5...v1.20.0) (2020-03-01)


### Bug Fixes

* **release:** exclude  umd and cjs bundles to publish ([49066a5](https://github.com/webex/sdk-component-adapter/commit/49066a5164f2bfcdccd5bb4c5a2453e7bd4bbf14))
* **package:** main attribute now points to esm bundle ([8190b1f](https://github.com/webex/sdk-component-adapter/commit/8190b1fe15dfbf9232c1b9c28a8d0f899365bd2a))
* **rollup:** remove extra externals ([a4164c3](https://github.com/webex/sdk-component-adapter/commit/a4164c34ff03006964a0654f46554e48967b524f))


### Features

* **rollup:** exclude webex from the bundle ([7ec7394](https://github.com/webex/sdk-component-adapter/commit/7ec7394dc06cba24710494520e324974fe0a970d))
* **rollup:** remove cjs and umd bundles ([908c251](https://github.com/webex/sdk-component-adapter/commit/908c251b2503689fef5b625261696be16374f2a3))
* **rollup:** remove extra configuration ([becd8a4](https://github.com/webex/sdk-component-adapter/commit/becd8a451d1f4fa1cb4982e157c6df90f33bc30f))
* **package:** remove rollup builtin plugin dependency ([30da5e6](https://github.com/webex/sdk-component-adapter/commit/30da5e6a4085dca21e2f89e02b6a877aab47b1c2))
* **package:** remove rollup json plugin dependency ([149c414](https://github.com/webex/sdk-component-adapter/commit/149c4142f8f7a93b6e0c8587f4c4cf0c3be622a0))

## [1.19.5](https://github.com/webex/sdk-component-adapter/compare/v1.19.4...v1.19.5) (2020-02-24)


### Bug Fixes

* **package-lock:** fix dependency vulnerabilities ([ebe6b13](https://github.com/webex/sdk-component-adapter/commit/ebe6b13d135d110cb5780c271f027178ee7d9d7a))
* **package:** update webex dependency to V1.80.132 ([e4d77a8](https://github.com/webex/sdk-component-adapter/commit/e4d77a83deab26e4a25e3b389881ed031951c4ed))

## [1.19.4](https://github.com/webex/sdk-component-adapter/compare/v1.19.3...v1.19.4) (2020-02-06)


### Bug Fixes

* **PeopleSdkAdapter:** handle null state in getStatus() ([6da9928](https://github.com/webex/sdk-component-adapter/commit/6da99282c32b35b8fafca101b29082f473861004))
* **PeopleSdkAdapter:** handle presence being turned off in getPerson() ([79f472c](https://github.com/webex/sdk-component-adapter/commit/79f472cb897ddd3d29ae0ba618ad3d2a460eff09))
* **PeopleSdkAdapter:** handle presence plug-in error in getMe() ([c99fcf9](https://github.com/webex/sdk-component-adapter/commit/c99fcf99e98b76fbee258e775d07d6c1c9243568))

## [1.19.3](https://github.com/webex/sdk-component-adapter/compare/v1.19.2...v1.19.3) (2020-01-30)


### Bug Fixes

* **MeetingsSdkAdapter:** fetch the title from the destination ([cf0c0bd](https://github.com/webex/sdk-component-adapter/commit/cf0c0bd0847cc229ab339a15be650db3afe010a4))
* **package:** webex is @webex/common dependency ([4ed5411](https://github.com/webex/sdk-component-adapter/commit/4ed5411540ab2c9b0c76e507f895da5084908bce))

## [1.19.2](https://github.com/webex/sdk-component-adapter/compare/v1.19.1...v1.19.2) (2020-01-29)


### Bug Fixes

* **JestApp:** remove addLocalMedia ([86497b7](https://github.com/webex/sdk-component-adapter/commit/86497b7b5724fce18d2a571458f0988b6cdb8eb8))
* **package:** update @webex/sdk-adapter-interfaces to 1.8.0 ([ebf7b22](https://github.com/webex/sdk-component-adapter/commit/ebf7b22d4ba04f50a88c7e196abda2fa4576c02f))

## [1.19.1](https://github.com/webex/sdk-component-adapter/compare/v1.19.0...v1.19.1) (2020-01-29)


### Bug Fixes

* **MeetingSdkAdapter:** complete getMeeting when remote media is removed ([8a854e6](https://github.com/webex/sdk-component-adapter/commit/8a854e6bdda153a8d66a4545c9ffc5d828366469))
* **MeetingSdkAdapter:** rename controls to match component ([48c6051](https://github.com/webex/sdk-component-adapter/commit/48c6051358373b0566b07463fbb52fc239c0b261))

# [1.19.0](https://github.com/webex/sdk-component-adapter/compare/v1.18.2...v1.19.0) (2020-01-29)


### Features

* **MeetingsSdkAdapter:** fetchMeetingTitle method is implemented ([c3f118d](https://github.com/webex/sdk-component-adapter/commit/c3f118d36443916157204e401d5d9baaa4381ff6))

## [1.18.2](https://github.com/webex/sdk-component-adapter/compare/v1.18.1...v1.18.2) (2020-01-28)


### Bug Fixes

* **MeetingsSdkAdapter:** remove finalize from getMeeting() ([c335a84](https://github.com/webex/sdk-component-adapter/commit/c335a8459589c48339559dbc9256452bfd798df0))

## [1.18.1](https://github.com/webex/sdk-component-adapter/compare/v1.18.0...v1.18.1) (2020-01-28)


### Bug Fixes

* **rollup:** exclude rxjs/operators from the bundle ([8f24387](https://github.com/webex/sdk-component-adapter/commit/8f2438789a9b71c0758c84adc418a21087ba4cf7))

# [1.18.0](https://github.com/webex/sdk-component-adapter/compare/v1.17.0...v1.18.0) (2020-01-25)


### Features

* **MeetingsSdkAdapter:** add the capability to join the meeting muted ([2e1e2c2](https://github.com/webex/sdk-component-adapter/commit/2e1e2c212430cc62ba95b2040ea31d183ebeef48))

# [1.17.0](https://github.com/webex/sdk-component-adapter/compare/v1.16.1...v1.17.0) (2020-01-25)


### Features

* **JestMeetingWebApplication:** implement one ([12236ff](https://github.com/webex/sdk-component-adapter/commit/12236ffe13d9a68d84f0710e08d079d4ae0c0fa1))
* **package:** install and configure parcel ([67d2dfb](https://github.com/webex/sdk-component-adapter/commit/67d2dfb006339cf97e812463629ba643f4c1b548))
* **package:** remove babel regenrate plugin ([e960e76](https://github.com/webex/sdk-component-adapter/commit/e960e76d7ba48419ee393160b7d04c6d39203a46))

## [1.16.1](https://github.com/webex/sdk-component-adapter/compare/v1.16.0...v1.16.1) (2020-01-16)


### Bug Fixes

* **MeetingSdkAdapter:** emit stopped events for remote media ([7539dc2](https://github.com/webex/sdk-component-adapter/commit/7539dc20cc130e631491b02dbe29a3853238d86e))

# [1.16.0](https://github.com/webex/sdk-component-adapter/compare/v1.15.0...v1.16.0) (2020-01-15)


### Features

* **MeetingSdkAdapter:** implement exitControl method ([1368f40](https://github.com/webex/sdk-component-adapter/commit/1368f4059ff1bdbb2cbe0f93b7929bf979ebcadd))

# [1.15.0](https://github.com/webex/sdk-component-adapter/compare/v1.14.3...v1.15.0) (2020-01-15)


### Features

* **MeetingSdkAdapter:** implemenet leaveMeeting and removeMedia methods ([35db245](https://github.com/webex/sdk-component-adapter/commit/35db24581f4c0cfdfc2bda8228f2f607a1c45c7f))

## [1.14.3](https://github.com/webex/sdk-component-adapter/compare/v1.14.2...v1.14.3) (2020-01-15)


### Bug Fixes

* **MeetingAdapter:** sdk addMedia logic is inside join meeting logic ([32c0c51](https://github.com/webex/sdk-component-adapter/commit/32c0c51054a5543cc74308a5682573d8526f7c11))

## [1.14.2](https://github.com/webex/sdk-component-adapter/compare/v1.14.1...v1.14.2) (2019-12-19)


### Bug Fixes

* **WebexAdapter:** activities adapter must be defined ([3b314c1](https://github.com/webex/sdk-component-adapter/commit/3b314c1e48524e125fd197c253de96b3e9bdb5a2))

## [1.14.1](https://github.com/webex/sdk-component-adapter/compare/v1.14.0...v1.14.1) (2019-12-19)


### Bug Fixes

* **package:** set webex packages to 1.80.43 ([54d6f63](https://github.com/webex/sdk-component-adapter/commit/54d6f63b66b9ba3e6f5768d3a4910ba3baf3b930))

# [1.14.0](https://github.com/webex/sdk-component-adapter/compare/v1.13.0...v1.14.0) (2019-12-17)


### Features

* **PeopleSdkAdapter:** getMe() fetches and emits the person data once ([d056f2c](https://github.com/webex/sdk-component-adapter/commit/d056f2c55cc993182c10dda74b1bd219e27e811b))

# [1.13.0](https://github.com/webex/sdk-component-adapter/compare/v1.12.0...v1.13.0) (2019-12-16)


### Features

* **CircleCi:** separate integration test job from unit test job ([3db4aec](https://github.com/webex/sdk-component-adapter/commit/3db4aecfb6d9bad4583dceee07c644a2f6d483bd))

# [1.12.0](https://github.com/webex/sdk-component-adapter/compare/v1.11.0...v1.12.0) (2019-12-14)


### Features

* **PeopleSdkAdapter:** implement getMe ([6709838](https://github.com/webex/sdk-component-adapter/commit/67098382705afbc0af1dd9c2dcf2c2fd2f1ae1d9))

# [1.11.0](https://github.com/webex/sdk-component-adapter/compare/v1.10.0...v1.11.0) (2019-12-14)


### Bug Fixes

* **MeetingSdkAdapterTest:** delete extra the ([83a562e](https://github.com/webex/sdk-component-adapter/commit/83a562e1a521891f43170c584d4de89e7d0fe548))


### Features

* **MeetingSdkAdapter:** update localAudio after mute/unmute actions ([b707b28](https://github.com/webex/sdk-component-adapter/commit/b707b28daf131a9b4417e44967813cace754ac06))
* **MeetingSdkAdapter:** update localVideo after mute/unmute actions ([dede1cb](https://github.com/webex/sdk-component-adapter/commit/dede1cb548d204774a02a040be818db6fd1b8d62))

# [1.10.0](https://github.com/webex/sdk-component-adapter/compare/v1.9.0...v1.10.0) (2019-12-13)


### Bug Fixes

* **JestPuppeteer:** install and configure dependencies ([a66aa87](https://github.com/webex/sdk-component-adapter/commit/a66aa87dd356be49849686d84b5459d173041322))


### Features

* **eslint:** add document as a global term ([30d1e9e](https://github.com/webex/sdk-component-adapter/commit/30d1e9e4f4e70e09433c9d8ed5090fc10bcdae88))

# [1.9.0](https://github.com/webex/sdk-component-adapter/compare/v1.8.0...v1.9.0) (2019-12-13)


### Features

* **MeetingSdkAdapter:** convert promises to async/await ([31b233c](https://github.com/webex/sdk-component-adapter/commit/31b233cec3f01174525bc5c64c7b1407b9218634))
* **MeetingSdkAdapter:** implement audio control handler ([6cf9949](https://github.com/webex/sdk-component-adapter/commit/6cf9949de1ba921e159474a3ec5b219f4c5f5182))
* **MeetingSdkAdapter:** implement video control handler ([155fc6b](https://github.com/webex/sdk-component-adapter/commit/155fc6bcbcab42a7490f7473067a29b35264823b))

# [1.8.0](https://github.com/webex/sdk-component-adapter/compare/v1.7.0...v1.8.0) (2019-12-12)


### Bug Fixes

* **MeetingSdkAdapter:** convert local tracks to streams ([e793690](https://github.com/webex/sdk-component-adapter/commit/e793690e337547df40de03c9d6afff663cb165a1))


### Features

* **MeetingSdkAdapter:** implement audio & video mute functionalities ([5edd0cd](https://github.com/webex/sdk-component-adapter/commit/5edd0cdefce8e50319e9a23f9c054e5750fb1815))
* **MeetingSdkAdapter:** implement mute audio & video contorl methods ([44d965f](https://github.com/webex/sdk-component-adapter/commit/44d965fc8e377e74fa44ac4242fdd1a12624b080))

# [1.7.0](https://github.com/webex/sdk-component-adapter/compare/v1.6.0...v1.7.0) (2019-12-10)


### Features

* **MeetingSdkAdapter:** add joinMeeting control meeting ([ae19cc1](https://github.com/webex/sdk-component-adapter/commit/ae19cc12fad05f8d837d23a09486784077749fcf))

# [1.6.0](https://github.com/webex/sdk-component-adapter/compare/v1.5.0...v1.6.0) (2019-12-10)


### Bug Fixes

* **MeetingSdkAdapter:** fix default meeting shape ([02f3361](https://github.com/webex/sdk-component-adapter/commit/02f33619bc458614d637ea8626e01b5d23878f96))
* **MeetingSdkAdapter:** leave attachMedia default case empty ([1f554c7](https://github.com/webex/sdk-component-adapter/commit/1f554c79fc866dc7c47e5088404e5d3ded73a0ec))
* **package:** upgrade @webex/component-adapter-interfaces to 1.7.0 ([914e9ab](https://github.com/webex/sdk-component-adapter/commit/914e9ab9dd645855b4a0d7f2aa6fa03ecadabf0f))


### Features

* **MeetingSdkAdapter:** implement joinMeeting method ([3542ff4](https://github.com/webex/sdk-component-adapter/commit/3542ff471ad8e99e4fd28acc9471427041b91d59))

# [1.5.0](https://github.com/webex/sdk-component-adapter/compare/v1.4.1...v1.5.0) (2019-12-10)


### Bug Fixes

* **package:** update  @webex/component-adapter-interfaces to 1.6.0 ([27e5d5f](https://github.com/webex/sdk-component-adapter/commit/27e5d5f389b8db6644e7714f77ef2edb470b726b))


### Features

* **WebexSdkAdapter:** connect/disconnect meeting adapter ([c30f213](https://github.com/webex/sdk-component-adapter/commit/c30f2138397d9a2252c71570bb2c5682f816b4d9))
* **MeetingsSdkAdapter:** implement adapter ([9b326cf](https://github.com/webex/sdk-component-adapter/commit/9b326cfc3c3ad396f23177a662e1a14ebfcf9ea7))
* **MeetingAdapter:** implement createMeeting method ([f0de9b8](https://github.com/webex/sdk-component-adapter/commit/f0de9b8e5d2b1a6924d2f57351dc95343a944e19))

## [1.4.1](https://github.com/webex/sdk-component-adapter/compare/v1.4.0...v1.4.1) (2019-12-04)


### Bug Fixes

* **package:** add eslint-plugin-jest ([5a8a52a](https://github.com/webex/sdk-component-adapter/commit/5a8a52aca0630703d6ea0082d1de10d90ee7ee2d))

# [1.4.0](https://github.com/webex/sdk-component-adapter/compare/v1.3.1...v1.4.0) (2019-11-18)


### Features

* **WebexAdapter:** implement connect/disconnect methods ([fc31be2](https://github.com/webex/sdk-component-adapter/commit/fc31be2621776084d87c695ecf6ea4ae7a30270c))

## [1.3.1](https://github.com/webex/sdk-component-adapter/compare/v1.3.0...v1.3.1) (2019-11-15)


### Bug Fixes

* **package:** add @webex/test-users ([0bd4572](https://github.com/webex/sdk-component-adapter/commit/0bd457268ed214eaf15f8e96f3b95572ca59b000))
* **RoomsSdkAdapter:** fetch room every update ([c99b145](https://github.com/webex/sdk-component-adapter/commit/c99b145848d1c0fd978af9ecb10823281cd49fce))

# [1.3.0](https://github.com/webex/sdk-component-adapter/compare/v1.2.2...v1.3.0) (2019-11-15)


### Bug Fixes

* **rollup:** define custom export for @webex/common module ([d3f5c03](https://github.com/webex/sdk-component-adapter/commit/d3f5c03aa25533af10abe6de95b47fe971e280e1))
* **package:** install latest @webex/common dependency ([56dde5b](https://github.com/webex/sdk-component-adapter/commit/56dde5b64aca5a5f102cec6c860a09331c652533))
* **package:** update webex to version 1.80.43 ([0500f55](https://github.com/webex/sdk-component-adapter/commit/0500f55d4c8522c10d8eec7613636679f345b5a3))


### Features

* **PeopleSdkAdapter:** implement adapter ([9739bca](https://github.com/webex/sdk-component-adapter/commit/9739bca1a8983f3f835e92c9327f2b1a2f648103))

## [1.2.2](https://github.com/webex/sdk-component-adapter/compare/v1.2.1...v1.2.2) (2019-10-30)


### Bug Fixes

* **package:** install meetings adapter interface ([2a477cf](https://github.com/webex/sdk-component-adapter/commit/2a477cfd74c2b86e6fdccbb17e00090193bb1ee6))

## [1.2.1](https://github.com/webex/sdk-component-adapter/compare/v1.2.0...v1.2.1) (2019-10-25)


### Bug Fixes

* **release:** define paths to export the modules properly ([1db8231](https://github.com/webex/sdk-component-adapter/commit/1db8231))

# [1.2.0](https://github.com/webex/sdk-component-adapter/compare/v1.1.1...v1.2.0) (2019-10-25)


### Features

* **RoomsSdkAdapter:** import RoomsAdapter interface properly ([51a619a](https://github.com/webex/sdk-component-adapter/commit/51a619a))

## [1.1.1](https://github.com/webex/sdk-component-adapter/compare/v1.1.0...v1.1.1) (2019-10-25)


### Bug Fixes

* **WebexAdapter:** export default ([118aa23](https://github.com/webex/sdk-component-adapter/commit/118aa23))

# 1.0.0 (2019-09-26)


### Features

* **circleci:** add release job ([25ba578](https://github.com/webex/sdk-component-adapter/commit/25ba578))
* **webex:** import webex into src ([a709448](https://github.com/webex/sdk-component-adapter/commit/a709448))
* **readme:** write up ([f731c7f](https://github.com/webex/sdk-component-adapter/commit/f731c7f))
