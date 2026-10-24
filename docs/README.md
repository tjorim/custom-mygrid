# Documentation

Community documentation for MyGrid ModuleTwo and VoltBridge devices. This is an
unofficial project, not affiliated with, endorsed by or supported by MyGrid.

## Start with your device

| Device | Home Assistant setup | Python library and protocol documentation |
| --- | --- | --- |
| ModuleTwo home battery | [ha-mygrid-modbus](https://github.com/tjorim/ha-mygrid-modbus) | [python-mygrid-modbus](https://github.com/tjorim/python-mygrid-modbus) |
| VoltBridge P1 meter adapter | [ha-mygrid-voltbridge](https://github.com/tjorim/ha-mygrid-voltbridge) | [python-mygrid-voltbridge](https://github.com/tjorim/python-mygrid-voltbridge) |

Library repositories own their documentation; link to it instead of copying it
here. The planned exception is the VoltBridge API reference, which will move
here in a separate change. Until then, use the VoltBridge library documentation.

## Development and alternatives

- [ha-mygrid-core](https://github.com/tjorim/ha-mygrid-core): integration source
  and the generator for the two HACS repositories.
- [MyGrid's MQTT integration](https://github.com/MyGrid-Energy/mygrid-homeassistant-mqtt):
  the manufacturer's supported local MQTT Discovery interface for both devices.
- [Website development and publishing](../site/README.md).

Long-form hub content belongs in this directory as Markdown, rendered by GitHub.
The landing page links here without rendering or duplicating these documents.
