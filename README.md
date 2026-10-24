# custom-mygrid

Unofficial documentation hub for community Home Assistant integrations and Python libraries for **MyGrid** devices: the ModuleTwo home battery and the VoltBridge P1 meter adapter.

This project is not affiliated with, endorsed by or supported by MyGrid. Protocol notes for the VoltBridge come from reverse engineering one device; the ModuleTwo notes come from MyGrid's published Modbus manual.

## Repositories

| Repository | Purpose |
| --- | --- |
| [python-mygrid-modbus](https://github.com/tjorim/python-mygrid-modbus) | Python library for the ModuleTwo (Modbus TCP, register map 2), PyPI `mygrid-modbus` |
| [python-mygrid-voltbridge](https://github.com/tjorim/python-mygrid-voltbridge) | Python client for the VoltBridge (HTTP API, DSMR telegram, UDP push), PyPI `mygrid-voltbridge` |
| [ha-mygrid-modbus](https://github.com/tjorim/ha-mygrid-modbus) | HACS custom integration for the ModuleTwo (hand-maintained, imports the library from PyPI) |
| [ha-mygrid-voltbridge](https://github.com/tjorim/ha-mygrid-voltbridge) | HACS custom integration for the VoltBridge (hand-maintained, imports the library from PyPI) |
| [ha-mygrid-core](https://github.com/tjorim/ha-mygrid-core) | Dormant overlay for a possible Home Assistant core contribution (domain `mygrid`) |

See the [architecture and contributor guide](docs/architecture.md) for source ownership,
dependency pins, release flow and tooling.

## Related

- [MyGrid-Energy/mygrid-homeassistant-mqtt](https://github.com/MyGrid-Energy/mygrid-homeassistant-mqtt) is MyGrid's own repository. It documents the supported local MQTT interface (MQTT Discovery) for the ModuleTwo and the VoltBridge, configured in the MyGrid app under Features → Home Assistant. The integrations in this project use Modbus TCP (ModuleTwo) and the local HTTP and UDP interfaces (VoltBridge) instead, so a local MQTT broker is not required.
- Manufacturer pages: [ModuleTwo](https://moduletwo.mygrid.energy/nl) and [VoltBridge](https://moduletwo.mygrid.energy/nl/voltbridge).

## Status

The buildless landing page lives in [`site/`](site/README.md) and is published at
https://tjorim.github.io/custom-mygrid/ after the Pages workflow runs on `main`.
Start with the [ModuleTwo setup guide](docs/moduletwo.md) or
[VoltBridge setup guide](docs/voltbridge.md). See the
[VoltBridge API reference](docs/voltbridge-api.md) and
[documentation index](docs/README.md) for protocol documentation and repository links.
Work is tracked in the [issues](https://github.com/tjorim/custom-mygrid/issues).

## License

Apache-2.0
