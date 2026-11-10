# Documentation

Community documentation for MyGrid ModuleTwo and VoltBridge devices. This is an
unofficial project, not affiliated with, endorsed by or supported by MyGrid.

## Start with your device

| Device | Home Assistant setup | Python library and protocol documentation |
| --- | --- | --- |
| ModuleTwo home battery | [ModuleTwo installation and setup](moduletwo.md) | [Python library](https://tjorim.github.io/custom-mygrid/docs/moduletwo-python/) · [Protocol reference](https://tjorim.github.io/custom-mygrid/docs/moduletwo-protocol/) |
| VoltBridge P1 meter adapter | [VoltBridge installation and setup](voltbridge.md) | [VoltBridge API reference](voltbridge-api.md) · [Python library](https://tjorim.github.io/custom-mygrid/docs/voltbridge-python/) |

The setup guides cover Marketplace installation (or HACS on Home Assistant
2026.10), configuration, entities, the Energy dashboard, examples and
troubleshooting. The website publishes these guides and the Python/protocol
references from their owning repositories. Each page links to the exact source
revision and the upstream editing location. Home Assistant installs the Python
library dependencies from PyPI automatically.

ModuleTwo read-only library tests and partial Home Assistant hardware acceptance
passed on **2026-11-09**. Link the battery to your MyGrid account and select
Home Assistant control to enable Modbus. See the [acceptance record](https://tjorim.github.io/custom-mygrid/docs/moduletwo-acceptance/)
for the tested behavior and remaining limits.

## Development and alternatives

- [Architecture and contributor guide](architecture.md): library and integration source
  ownership, the dormant core overlay, release flow and tooling.
- [MyGrid's MQTT integration](https://github.com/MyGrid-Energy/mygrid-homeassistant-mqtt):
  the manufacturer's supported local MQTT Discovery interface for both devices.
- [Website development and publishing](../site/README.md).

Cross-device introductions, navigation and architecture belong in this hub.
Maintain detailed HA guides in the integration repositories and Python/protocol
references in the libraries. The website imports reviewed, commit-pinned
snapshots; do not edit a second copy here. See the
[publishing guide](../site/README.md#upstream-documentation-ownership) for updates.
