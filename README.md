# Econt-js

A Econt API client for JavaScript. Supports TypeScript.

## Configuration

| Environmental variable | Description |
| --- | --- |
| API_ECONT_TEST_MODE | Whether the client should make calls to test endpoint (default: **false**) |
| API_ECONT_TEST_URL | Econt test url (default: `http://demo.econt.com/services/`) |
| API_ECONT_PRODUCTION_URL | Econt production url (default: `http://ee.econt.com/services/` ) |
| API_ECONT_USERNAME | The authentication username (Required only when test mode is **false**) |
| API_ECONT_PASSWORD | The authentication password (Required only when test mode is **false**) |

## OpenAPI schema & docs

Econt publishes a ready-made OpenAPI spec at
[`ee.econt.com/services/openapi.yaml`](https://ee.econt.com/services/openapi.yaml), but it has no
version numbers and no changelog feed. This repo archives a dated copy each time that spec changes
and publishes an interactive reference site from it.

| Artifact | Description |
| --- | --- |
| `openapi.yaml` | The latest Econt OpenAPI 3.0 schema. |
| `versions/<YYYY-MM-DD>.yaml` | An archived schema for each day the spec changed. |
| `versions/index.json` | Manifest of all known versions, with `latest` and snapshot timestamps. |
| Scalar reference site | Interactive API docs deployed to GitHub Pages (see [`docs/index.html`](docs/index.html)). |

The schema is keyed by the **date it changed**: [`gen/release.mjs`](gen/release.mjs) fetches the live
spec, and only when its bytes differ from the committed `openapi.yaml` does it write a new
`versions/<date>.yaml`, refresh `openapi.yaml`, and update the manifest. Upstream bytes are preserved
verbatim, so re-running against an unchanged spec produces no diff.

```bash
# Fetch the live schema and snapshot it if it changed
yarn schema:release

# Snapshot from a local file instead (deterministic)
node gen/release.mjs --offline path/to/openapi.yaml
```

A weekly [`check-schema`](.github/workflows/check-schema.yml) workflow runs the same fetch and opens a
PR when Econt's spec changes. The reference site is redeployed to GitHub Pages on every push to
`main` that touches `openapi.yaml` or the docs shell (see
[`.github/workflows/deploy-docs.yml`](.github/workflows/deploy-docs.yml)). Enable it once under repo
**Settings → Pages → Source: "GitHub Actions"**.

## Progress

- [Nomenclatures](http://ee.econt.com/services/Nomenclatures/)

    - [NomenclaturesService](http://ee.econt.com/services/Nomenclatures/#NomenclaturesService)

        - [ ] [getCountries](http://ee.econt.com/services/Nomenclatures/#NomenclaturesService-getCountries "getCountries")
        - [ ] [getCities](http://ee.econt.com/services/Nomenclatures/#NomenclaturesService-getCities "getCities")
        - [x] [getOffices](http://ee.econt.com/services/Nomenclatures/#NomenclaturesService-getOffices "getOffices")
        - [ ] [getStreets](http://ee.econt.com/services/Nomenclatures/#NomenclaturesService-getStreets "getStreets")
        - [ ] [getQuarters](http://ee.econt.com/services/Nomenclatures/#NomenclaturesService-getQuarters "getQuarters")
    - [AddressService](http://ee.econt.com/services/Nomenclatures/#AddressService)

        - [ ] [validateAddress](http://ee.econt.com/services/Nomenclatures/#AddressService-validateAddress "validateAddress")
        - [ ] [getNearestOffices](http://ee.econt.com/services/Nomenclatures/#AddressService-getNearestOffices "getNearestOffices")
- [Shipments](http://ee.econt.com/services/Shipments/)

    - [LabelService](http://ee.econt.com/services/Shipments/#LabelService)

        - [ ] [createLabel](http://ee.econt.com/services/Shipments/#LabelService-createLabel "createLabel")
        - [ ] [createLabels](http://ee.econt.com/services/Shipments/#LabelService-createLabels "createLabels")
        - [ ] [deleteLabels](http://ee.econt.com/services/Shipments/#LabelService-deleteLabels "deleteLabels")
    - [ShipmentService](http://ee.econt.com/services/Shipments/#ShipmentService)

        - [ ] [requestCourier](http://ee.econt.com/services/Shipments/#ShipmentService-requestCourier "requestCourier")
        - [ ] [getShipmentStatuses](http://ee.econt.com/services/Shipments/#ShipmentService-getShipmentStatuses "getShipmentStatuses")
        - [ ] [getRequestCourierStatus](http://ee.econt.com/services/Shipments/#ShipmentService-getRequestCourierStatus "getRequestCourierStatus")
- [Profile](http://ee.econt.com/services/Profile/)

    - [ProfileService](http://ee.econt.com/services/Profile/#ProfileService)
        - [ ] [getClientProfiles](http://ee.econt.com/services/Profile/#ProfileService-getClientProfiles "getClientProfiles")
- [ThreeWayLogistics](http://ee.econt.com/services/ThreeWayLogistics/)

    - [ThreeWayLogisticsService](http://ee.econt.com/services/ThreeWayLogistics/#ThreeWayLogisticsService)
        - [ ] [threeWayLogistics](http://ee.econt.com/services/ThreeWayLogistics/#ThreeWayLogisticsService-threeWayLogistics "threeWayLogistics")
- [PaymentReport](http://ee.econt.com/services/PaymentReport/)

    - [PaymentReportService](http://ee.econt.com/services/PaymentReport/#PaymentReportService)
        - [ ] [PaymentReport](http://ee.econt.com/services/PaymentReport/#PaymentReportService-PaymentReport "PaymentReport")
