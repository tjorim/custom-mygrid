# Documentation

Community documentation for MyGrid ModuleTwo and VoltBridge devices. This is an
unofficial project, not affiliated with, endorsed by or supported by MyGrid.

## Start with your device

| Device | Home Assistant setup | Python library and protocol documentation |
| --- | --- | --- |
| ModuleTwo home battery | [ModuleTwo installation and setup](moduletwo.md) | [python-mygrid-modbus](https://github.com/tjorim/python-mygrid-modbus) |
| VoltBridge P1 meter adapter | [VoltBridge installation and setup](voltbridge.md) | [VoltBridge API reference](voltbridge-api.md) · [Python library](https://github.com/tjorim/python-mygrid-voltbridge) |

The setup guides cover HACS installation, configuration, entities, the Energy
dashboard and troubleshooting. The VoltBridge API reference lives here; library usage and the ModuleTwo
protocol documentation remain in their source repositories. The hand-maintained
HACS repositories own the integration code and tests; Home Assistant installs
their Python library dependencies from PyPI automatically.

ModuleTwo Modbus is **closed by default**. Expect to need MyGrid support to
open it for your unit; selecting Home Assistant in the app alone did not open
TCP port 502 on the development unit. See the [known issue](moduletwo.md#known-issue-port-502-refuses-connections).

## Development and alternatives

- [Architecture and contributor guide](architecture.md): library and HACS source
  ownership, the dormant core overlay, release flow and tooling.
- [MyGrid's MQTT integration](https://github.com/MyGrid-Energy/mygrid-homeassistant-mqtt):
  the manufacturer's supported local MQTT Discovery interface for both devices.
- [Website development and publishing](../site/README.md).

Long-form hub content belongs in this directory as Markdown, rendered by GitHub.
The landing page links here without rendering or duplicating these documents.
