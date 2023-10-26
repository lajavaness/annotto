## [1.4.2](https://github.com/lajavaness/annotto/compare/v1.4.1...v1.4.2) (2023-10-26)


### Performance Improvements

* Trigger a release ([1394176](https://github.com/lajavaness/annotto/commit/13941763b1c978187f65cd99f1d5dc16c78c2864))

## [1.4.1](https://github.com/lajavaness/annotto/compare/v1.4.0...v1.4.1) (2023-09-20)

# [1.4.0](https://github.com/lajavaness/annotto/compare/v1.3.0...v1.4.0) (2023-09-14)


### Features

* Upgrade to keycloak 22 ([#48](https://github.com/lajavaness/annotto/issues/48)) ([035ccc6](https://github.com/lajavaness/annotto/commit/035ccc68665a260ead788d6d3edf237eeb3785ab))

# [1.3.0](https://github.com/lajavaness/annotto/compare/v1.2.10...v1.3.0) (2023-09-06)


### Features

* Add management of overlaps on NER annotations, 45 ([#46](https://github.com/lajavaness/annotto/issues/46)) ([7c726f2](https://github.com/lajavaness/annotto/commit/7c726f2e5c566e5dfa13f626059d6fd8f3c3ba15)), closes [#45](https://github.com/lajavaness/annotto/issues/45)

## [1.2.10](https://github.com/lajavaness/annotto/compare/v1.2.9...v1.2.10) (2023-06-21)


### Bug Fixes

* Upgrade semantic-release to match peer dependencies ([2f47915](https://github.com/lajavaness/annotto/commit/2f47915e7b905e30d3ec5d3bd8231b6980bacdc6))

## [1.2.9](https://github.com/lajavaness/annotto/compare/v1.2.8...v1.2.9) (2023-06-20)


### Bug Fixes

* Upgrade node version in dockerfile ([1072179](https://github.com/lajavaness/annotto/commit/1072179c56b040a34ac02f7dad76c6eb920252ab))

## [1.2.8](https://github.com/lajavaness/annotto/compare/v1.2.7...v1.2.8) (2023-06-20)


### Bug Fixes

* Missing keycloak config secrets to make sure admin calls can be made from local development ([3e48072](https://github.com/lajavaness/annotto/commit/3e48072b665c9891959ff11a18fd601d8cc8f5d1))
* Remove the region in the S3 specs as its already included into the given URL ([1acbbd8](https://github.com/lajavaness/annotto/commit/1acbbd8c1640f7703ff850e2a73798dbf692be8e))
* Specify latest version for semantic-release github action ([15aab99](https://github.com/lajavaness/annotto/commit/15aab997b3d6a70dbf13b10fbca7aa7f2e10059f))
* Specify semantic-version for  semantic-release github action ([a2c63a2](https://github.com/lajavaness/annotto/commit/a2c63a2a95d29d201ede93e1a8600dcbfef0baa8))
* Specify version for semantic-release github action ([3eded64](https://github.com/lajavaness/annotto/commit/3eded64987fdd6af0a68a07dad38816f3f925ebd))
* Try using node-version 14 for semantic-release ([06c39ac](https://github.com/lajavaness/annotto/commit/06c39ac81df13e2a9b3187ac785cd57e301441f0))
* Trying with node 18 and v 3.4.1 semantic-version for  semantic-release github action ([864a5cc](https://github.com/lajavaness/annotto/commit/864a5ccb163bcdbe6780ddc9346daa1597e86d15))
* Upgrade to Node18 ([2d53b66](https://github.com/lajavaness/annotto/commit/2d53b66ad9a1f588a8f96637bd50fa05d870941e))
* Upgrade to Node18 github workflows ([38e8ed7](https://github.com/lajavaness/annotto/commit/38e8ed71e3e8401e15c9d2f0c12de87c2a1f3b37))

## [1.2.7](https://github.com/lajavaness/annotto/compare/v1.2.6...v1.2.7) (2023-03-30)


### Bug Fixes

* Add missing secret for Master Realm Admin cli on Keycloak ([#43](https://github.com/lajavaness/annotto/issues/43)) ([146a1cf](https://github.com/lajavaness/annotto/commit/146a1cf9abbe8a1443be4ca284b00e2add0d0eb6))

## [1.2.6](https://github.com/lajavaness/annotto/compare/v1.2.5...v1.2.6) (2023-03-06)


### Bug Fixes

* Remove name of realm to be imported so all realms will be imported from the folder ([#40](https://github.com/lajavaness/annotto/issues/40)) ([48b156f](https://github.com/lajavaness/annotto/commit/48b156f5422fe7f03437982c281c07bd24e7085c))

## [1.2.5](https://github.com/lajavaness/annotto/compare/v1.2.4...v1.2.5) (2023-02-09)

## [1.2.4](https://github.com/lajavaness/annotto/compare/v1.2.3...v1.2.4) (2023-02-08)


### Bug Fixes

* Add region in project so S3 from AWS url works ([#35](https://github.com/lajavaness/annotto/issues/35)) ([9fe464f](https://github.com/lajavaness/annotto/commit/9fe464fed33a851d8a3bc2556eb2a3c938447f29))

## [1.2.3](https://github.com/lajavaness/annotto/compare/v1.2.2...v1.2.3) (2023-02-07)


### Bug Fixes

* Set the signature version for AWS cli to v4, [#28](https://github.com/lajavaness/annotto/issues/28) ([#34](https://github.com/lajavaness/annotto/issues/34)) ([7bc5590](https://github.com/lajavaness/annotto/commit/7bc5590aadd91f5f15b22dea97b0e71e99813946))

## [1.2.2](https://github.com/lajavaness/annotto/compare/v1.2.1...v1.2.2) (2023-02-02)


### Bug Fixes

* Use admin-cli to make admin calls to Keycloak ([#31](https://github.com/lajavaness/annotto/issues/31)) ([ff29da0](https://github.com/lajavaness/annotto/commit/ff29da0629f6e8ed9b0230e3de6af430e2bc507c)), closes [#30](https://github.com/lajavaness/annotto/issues/30)

## [1.2.1](https://github.com/lajavaness/annotto/compare/v1.2.0...v1.2.1) (2023-01-17)

# [1.2.0](https://github.com/lajavaness/annotto/compare/v1.1.0...v1.2.0) (2023-01-16)


### Features

* Add Html datatype ([#25](https://github.com/lajavaness/annotto/issues/25)) ([a4ab47c](https://github.com/lajavaness/annotto/commit/a4ab47c822488f3ba40cc97270c9ad296336705e))

# [1.1.0](https://github.com/lajavaness/annotto/compare/v1.0.13...v1.1.0) (2023-01-12)


### Features

* Add video and audio datatypes ([#22](https://github.com/lajavaness/annotto/issues/22)) ([5e396ea](https://github.com/lajavaness/annotto/commit/5e396ea9ad3c34671b8fdde0d22584453502ed57))

## [1.0.13](https://github.com/lajavaness/annotto/compare/v1.0.12...v1.0.13) (2022-12-16)

## [1.0.12](https://github.com/lajavaness/annotto/compare/v1.0.11...v1.0.12) (2022-12-12)


### Bug Fixes

* Update profile roles in annotto according to the role from keycloak, [#12](https://github.com/lajavaness/annotto/issues/12) ([6b37f49](https://github.com/lajavaness/annotto/commit/6b37f49efcb52d94f15a459abd4811e6a5364111))

## [1.0.11](https://github.com/lajavaness/annotto/compare/v1.0.10...v1.0.11) (2022-12-12)

## [1.0.10](https://github.com/lajavaness/annotto/compare/v1.0.9...v1.0.10) (2022-12-09)

## [1.0.9](https://github.com/lajavaness/annotto/compare/v1.0.8...v1.0.9) (2022-12-02)

## [1.0.8](https://github.com/lajavaness/annotto/compare/v1.0.7...v1.0.8) (2022-12-02)

## [1.0.7](https://github.com/lajavaness/annotto/compare/v1.0.6...v1.0.7) (2022-12-02)

## [1.0.6](https://github.com/lajavaness/annotto/compare/v1.0.5...v1.0.6) (2022-12-01)

## [1.0.5](https://github.com/lajavaness/annotto/compare/v1.0.4...v1.0.5) (2022-12-01)

## [1.0.4](https://github.com/lajavaness/annotto/compare/v1.0.3...v1.0.4) (2022-12-01)

## [1.0.3](https://github.com/lajavaness/annotto/compare/v1.0.2...v1.0.3) (2022-12-01)

## [1.0.2](https://github.com/lajavaness/annotto/compare/v1.0.1...v1.0.2) (2022-12-01)

## [1.0.1](https://github.com/lajavaness/annotto/compare/v1.0.0...v1.0.1) (2022-12-01)

# 1.0.0 (2022-11-30)

## [1.0.27](https://github.com/lajavaness/annotto-api/compare/v1.0.26...v1.0.27) (2022-10-25)


### Bug Fixes

* Fix filters that returned undefined ([#42](https://github.com/lajavaness/annotto-api/issues/42)) ([fef7f67](https://github.com/lajavaness/annotto-api/commit/fef7f674fddb431bd530af507c7dfae598a952f8))

## [1.0.26](https://github.com/lajavaness/annotto-api/compare/v1.0.25...v1.0.26) (2022-10-24)

## [1.0.25](https://github.com/lajavaness/annotto-api/compare/v1.0.24...v1.0.25) (2022-10-24)

## [1.0.24](https://github.com/lajavaness/annotto-api/compare/v1.0.23...v1.0.24) (2022-10-24)

## [1.0.23](https://github.com/lajavaness/annotto-api/compare/v1.0.22...v1.0.23) (2022-10-21)

## [1.0.22](https://github.com/lajavaness/annotto-api/compare/v1.0.21...v1.0.22) (2022-09-06)

## [1.0.21](https://github.com/lajavaness/annotto-api/compare/v1.0.20...v1.0.21) (2022-07-12)

## [1.0.20](https://github.com/lajavaness/annotto-api/compare/v1.0.19...v1.0.20) (2022-07-12)

## [1.0.19](https://github.com/lajavaness/annotto-api/compare/v1.0.18...v1.0.19) (2022-07-11)

## [1.0.18](https://github.com/lajavaness/annotto-api/compare/v1.0.17...v1.0.18) (2022-06-29)

## [1.0.17](https://github.com/lajavaness/annotto-api/compare/v1.0.16...v1.0.17) (2022-06-29)

## [1.0.16](https://github.com/lajavaness/annotto-api/compare/v1.0.15...v1.0.16) (2022-06-29)

## [1.0.15](https://github.com/lajavaness/annotto-api/compare/v1.0.14...v1.0.15) (2022-06-29)

## [1.0.14](https://github.com/lajavaness/annotto-api/compare/v1.0.13...v1.0.14) (2022-06-29)

## [1.0.13](https://github.com/lajavaness/annotto-api/compare/v1.0.12...v1.0.13) (2022-06-29)

## [1.0.12](https://github.com/lajavaness/annotto-api/compare/v1.0.11...v1.0.12) (2022-06-29)

## [1.0.11](https://github.com/lajavaness/annotto-api/compare/v1.0.10...v1.0.11) (2022-06-29)

## [1.0.10](https://github.com/lajavaness/annotto-api/compare/v1.0.9...v1.0.10) (2022-06-29)

## [1.0.9](https://github.com/lajavaness/annotto-api/compare/v1.0.8...v1.0.9) (2022-06-29)

## [1.0.8](https://github.com/lajavaness/annotto-api/compare/v1.0.7...v1.0.8) (2022-06-29)

## [1.0.7](https://github.com/lajavaness/annotto-api/compare/v1.0.6...v1.0.7) (2022-06-29)

## [1.0.6](https://github.com/lajavaness/annotto-api/compare/v1.0.5...v1.0.6) (2022-06-29)

## [1.0.5](https://github.com/lajavaness/annotto-api/compare/v1.0.4...v1.0.5) (2022-06-29)

## [1.0.4](https://github.com/lajavaness/annotto-api/compare/v1.0.3...v1.0.4) (2022-06-29)

## [1.0.3](https://github.com/lajavaness/annotto-api/compare/v1.0.2...v1.0.3) (2022-06-29)

## [1.0.2](https://github.com/lajavaness/annotto-api/compare/v1.0.1...v1.0.2) (2022-06-23)

## [1.0.1](https://github.com/lajavaness/annotto-api/compare/v1.0.0...v1.0.1) (2022-06-22)


### Bug Fixes

* Fix undefined task properties in project config, [#1](https://github.com/lajavaness/annotto-api/issues/1) ([f84713e](https://github.com/lajavaness/annotto-api/commit/f84713e4724dc2cc65c7fb837ad6674930ca819a))

# 1.0.0 (2022-06-16)


### Features

* Initial commit ([7a95b56](https://github.com/lajavaness/annotto-api/commit/7a95b5669e2b5442e585cf7c9b3583e63fae0b10))
