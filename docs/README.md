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
protocol documentation remain in their source repositories.

## Development and alternatives

- [ha-mygrid-core](https://github.com/tjorim/ha-mygrid-core): integration source
  and the generator for the two HACS repositories.
- [MyGrid's MQTT integration](https://github.com/MyGrid-Energy/mygrid-homeassistant-mqtt):
  the manufacturer's supported local MQTT Discovery interface for both devices.
- [Website development and publishing](../site/README.md).

Long-form hub content belongs in this directory as Markdown, rendered by GitHub.
The landing page links here without rendering or duplicating these documents.
