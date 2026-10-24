# ModuleTwo: Home Assistant installation and setup

The [MyGrid ModuleTwo integration](https://github.com/tjorim/ha-mygrid-modbus)
provides local monitoring and explicit power control over Modbus TCP. It needs
no cloud account or MQTT broker. This is an unofficial community integration,
with no official Home Assistant quality rating. Physical battery validation is
pending; it targets **Modbus register map version 2**.

## Before you start

- Run **Home Assistant 2026.10.2 or newer** (Python 3.14.2+). The HACS package
  includes its library; no separate Python package installation is needed.
- In the MyGrid app, set the battery's **control source to Home Assistant**.
  The MyGrid control source leaves the Modbus port closed.
- Use the **Auto cluster leader**, never a Follow unit. Leader setpoints and live
  limits represent household totals. One configured leader creates one device;
  the protocol does not enumerate followers.
- Put Home Assistant and the battery on a reachable LAN; reserve its IP address.
  The default port is **TCP 502**, and the unit ID is fixed at **1**. Keep Modbus
  on a trusted LAN: it has no TLS or authentication, and must not be exposed to
  the internet.
- Disconnect other Modbus test tools: the battery accepts **one TCP client at a
  time**. Home Assistant's shared Modbus connection can serialize requests from
  compatible integrations, but this does not let a separate program share the
  battery's connection.
- Choose **one power controller**. App controls, automations and other writers
  can overwrite the shared setpoint; the last write wins.

**Known port-502 issue:** the integration README reports a unit whose port stayed
closed despite selecting Home Assistant as the control source (2026-10-24).
MyGrid support said Modbus should be allowed by default and referred enablement
to their IT team. If the correct settings still produce a refused connection,
contact MyGrid support with the battery's hostname and MAC address and ask them
to enable Modbus TCP. The integration cannot open a closed device port.

## Install with HACS

1. With [HACS](https://hacs.xyz/) installed, open **HACS → ⋮ → Custom repositories**.
2. Add `https://github.com/tjorim/ha-mygrid-modbus`, choosing **Integration** as
   the category.
3. Find **MyGrid ModuleTwo** in HACS and download it.
4. Restart Home Assistant.

For a manual installation, copy the repository's entire
`custom_components/mygrid_modbus` directory into
`<config>/custom_components/mygrid_modbus`, then restart Home Assistant.

## Add the battery

There is **no automatic discovery** for ModuleTwo. Open **Settings → Devices &
services → Add integration → MyGrid ModuleTwo**. Enter the battery hostname or
IP address without a URL scheme, and its port (default **502**). Setup reads and
checks the register map before creating an entry; it sends no power commands.

Use one address per physical endpoint. There is no hardware identity register,
so aliases cannot be reliably deduplicated and replacement hardware cannot be
detected. Use **Reconfigure** to change the host or port while keeping history.
For a replacement battery, delete and recreate the entry to avoid combining
histories.

## Polling options

Use the integration's **Configure** action to set an integer polling interval
from **2–300 seconds**; the default is **5 seconds**. Each poll reads all 18
registers in one function-03 request. Commands add fresh-limit and readback
requests. Changing options reloads the connection without writing power.

## Entities and power control

| Entity | Meaning and behavior |
| --- | --- |
| State of charge | % |
| Battery power | W; positive charging, negative discharging |
| Charging power / discharging power | Separate nonnegative power readings in W |
| Maximum charge / discharge power | Live positive limits in W |
| Power setpoint | Number in W; positive charges, negative discharges, zero requests idle; 100 W increments |
| Status | `normal`, `fault` or `telemetry_stale` |
| Stored energy / total capacity | Current snapshots in Wh, not cumulative energy flow |
| Lifetime charged / discharged energy | Cumulative `total_increasing` counters in Wh |
| Problem | On for `fault` status or any set fault bit, including unknown bits |
| Fault flags / individual fault indicators | Raw flags with `active_faults` names and 22 documented bit indicators; disabled by default |
| Map version | Diagnostic, disabled by default |
| Restart | Diagnostic button, disabled by default |

Enable optional entities from the device's entity list. During `telemetry_stale`,
SOC, measured/derived power and fault indicators become **unknown**. A connection
failure makes live measurements **unavailable**. Lifetime counters retain their
last confirmed values and restore saved values across entity restarts.

Change **Power setpoint** or use the standard `number.set_value` action. Commands
read fresh limits, validate the requested 100 W step, write once, then read back
the accepted value. The device may clamp the request if limits change. Check
measured power and status afterward: accepted setpoint does not prove delivery.

**There is no documented command watchdog or connection-loss fallback. Do not
assume the battery stops when Home Assistant stops.** Explicitly write zero to
request idle. Setup, polling, reconnect, option changes and unloading never write
power, and the integration does not restore old commands or run a charging
strategy. If a write/readback fails, the command may already have been applied;
check current readings before deciding whether to send another command.
Automatic write retries are disabled.

Restart also sends once, then invalidates cached telemetry and resumes normal
polling. If the battery restarts before acknowledging, the result can be
uncertain; the command is not automatically resent.

## Energy dashboard

Under **Settings → Dashboards → Energy**, add battery storage with **Lifetime
charged energy** as energy into the battery and **Lifetime discharged energy**
as energy out. Choose the separate Charging power and Discharging power entities
where power inputs are offered. Do not use Stored energy or Total capacity as
cumulative flows.

The manual establishes cluster-wide SOC, limits and setpoints, but not the scope
of every energy register. Verify energy totals on your cluster before relying
on whole-house statistics.

## Troubleshooting, repairs and diagnostics

| Symptom | What to check |
| --- | --- |
| Integration does not appear | Check the HACS download or manual directory, restart, and verify the minimum Home Assistant version |
| Cannot connect / connection refused | Check address, TCP 502, Home Assistant control source, Auto leader and competing clients. If the port stays closed, contact MyGrid support as described above |
| Incompatible Modbus settings | Another Home Assistant consumer holds the endpoint with conflicting parameters; align the connection settings |
| Unsupported map | Only register map 2 is supported; check the firmware and matching manufacturer manual |
| Command rejected | Use a multiple of 100 W within fresh charge/discharge limits; discharge is negative |
| Power changes unexpectedly | Check for competing app controls, integrations or automations writing the setpoint |
| Measurements unknown | `telemetry_stale` means firmware telemetry is stale; wait for `normal` or `fault` before assessing measurements |
| Measurements unavailable | Restore device/network access; polling reconnects without replaying commands |
| Restart or power command not confirmed | Check current availability and measurements before retrying manually; the command may have succeeded |

The `no_p1_data` repair belongs to [VoltBridge](voltbridge.md), not ModuleTwo.
ModuleTwo reports communication and telemetry problems through availability,
Status and Problem entities rather than that P1 repair.

Download **diagnostics** from the integration menu. They include decoded telemetry,
update-report status and a fresh raw-register dump. Network addresses and entry
identifiers are omitted, but the dump may reveal household usage: review it
before sharing. Offline diagnostics report the failure type; an unloaded entry
reports `NotLoaded`. Diagnostic reads never issue commands. Include Home
Assistant version, firmware/map version and relevant logs in a problem report.

Deleting the entry stops polling and releases its connection hold. Home Assistant
closes the connection after its last consumer releases it. **Removal does not
send a zero setpoint.** Request idle explicitly beforehand if needed. Remove the
HACS download (or manual directory) and restart to uninstall.

## Sources and related guides

These instructions follow the [integration README](https://github.com/tjorim/ha-mygrid-modbus#readme)
and [canonical integration source](https://github.com/tjorim/ha-mygrid-core/tree/main/homeassistant/components/mygrid).
See the integration's [hardware acceptance checklist](https://github.com/tjorim/ha-mygrid-modbus/blob/main/docs/hardware-testing.md)
and [protocol reference](https://github.com/tjorim/ha-mygrid-modbus/blob/main/docs/protocol.md)
for validation and register details, the [VoltBridge setup guide](voltbridge.md)
for the P1 adapter, or the [documentation index](README.md).
