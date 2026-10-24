# ModuleTwo: Home Assistant installation and setup

The [MyGrid ModuleTwo integration](https://github.com/tjorim/ha-mygrid-modbus)
provides local monitoring and explicit power control over Modbus TCP. It needs
no cloud account or MQTT broker for Modbus communication; how Modbus is enabled
is still being clarified with MyGrid (see below). This is an unofficial community
integration, with no official Home Assistant quality rating. Physical battery validation is
pending; it targets **Modbus register map version 2**.

## Before you start

- Run **Home Assistant 2026.10.2 or newer** (Python 3.14.2+). Home Assistant installs the
  integration’s Python library from PyPI automatically; no separate installation
  is needed.
- In the **MyGrid v2 app**, set the battery's **control source to Home Assistant**.
  The manufacturer's Modbus manual says this opens the port, and that the
  MyGrid control source leaves it closed. Home Assistant appears as a choice
  only when it has been configured for that battery. **Modbus is closed by
  default**: expect to need MyGrid support’s IT team to open TCP port 502 for
  your unit. The app setting alone did not open it on the development unit;
  see the [known issue and open questions](#known-issue-port-502-refuses-connections).
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

## Known issue: port 502 refuses connections

As of **2026-10-24**, following MyGrid's Modbus manual and selecting Home
Assistant as the control source in the MyGrid v2 app did not open TCP port 502
on the development unit. MyGrid support confirmed that **Modbus is closed
by default** and said they would ask their IT team to open it, with no timeline
given. Hardware validation remains pending while the port refuses connections.

If the app setting is correct and port 502 still refuses connections, contact
[MyGrid support](mailto:support@mygrid.energy) and ask them to **enable Modbus TCP
for the battery**. The integration cannot open a closed device port. Until
MyGrid clarifies otherwise, expect to need support to open the port; the manual
describes the app setting alone as opening it.

### Open questions for MyGrid

These questions remain unanswered as of **2026-10-24**:

- What exactly does the IT team change to enable Modbus TCP, and is this
  enabled per unit, per account or by firmware?
- Which firmware version provides Modbus, and which version is the development
  unit running?
- Is the control-source setting stored on the battery or checked against MyGrid's
  cloud?
- Once enabled, does port 502 stay open without internet access? After it works,
  test by blocking the battery's internet access at the router while preserving
  LAN access, then retry a read-only Modbus connection.
- Is there a local-only way to enable Modbus TCP?
- Do Modbus and MQTT's **Home Assistant control** share one setting? Does enabling
  Modbus require the Home Assistant/MQTT configuration described below?

If enabling Modbus depends on MyGrid's cloud, users could lose the ability to
**enable** it if the company or its cloud disappears. This is an unresolved
risk, not evidence that an already enabled local Modbus connection needs internet.

Track answers and test results in [issue #5](https://github.com/tjorim/custom-mygrid/issues/5).
When MyGrid answers, update this page together with the
[library README](https://github.com/tjorim/python-mygrid-modbus#readme),
[HACS README](https://github.com/tjorim/ha-mygrid-modbus#readme) and
[dormant core overlay’s draft Home Assistant documentation](https://github.com/tjorim/ha-mygrid-core/blob/main/documentation/home-assistant.io/source/_integrations/mygrid.markdown),
keeping confirmed behavior separate from untested hypotheses.

### Manufacturer-supported MQTT alternative

MyGrid documents a separate [local MQTT integration for ModuleTwo](https://github.com/MyGrid-Energy/mygrid-homeassistant-mqtt/tree/main/moduletwo).
Configure a local broker under **Features → Home Assistant** in the app. For
ModuleTwo, **Enable Home Assistant** is diagnostics only; after **Connected**,
choose **Home Assistant control** in the **Control** tab to allow power control.
Follow MyGrid's [setup guide](https://github.com/MyGrid-Energy/mygrid-homeassistant-mqtt/blob/main/moduletwo/setup.md)
for that route, which requires a local MQTT broker.

Those MQTT instructions do not document Modbus. Configuring a local broker and
then retrying port 502 is an **untested diagnostic hypothesis**, not a confirmed
Modbus prerequisite or fix. Whether MQTT configuration or a different firmware
version affects Modbus availability still needs MyGrid's confirmation.

## Register map version 2

The map contains 18 holding registers at zero-based addresses **0–17**, read
with function **03** over TCP port **502**, unit ID **1**. It covers map version,
state of charge, power setpoint and live limits, measured power, status and fault
flags, restart, stored energy, lifetime charged/discharged energy and capacity.
Only the power setpoint and restart registers are writable; the library uses
function **06** for single-register writes. Positive power charges and negative
power discharges; setpoints and limits use 100 W steps, measured power uses W,
and energy uses Wh. Two-register values use the low word first.

Use the library's [protocol reference](https://github.com/tjorim/python-mygrid-modbus/blob/main/docs/protocol.md)
for addresses, scaling and fault definitions, and its copy of the
[MyGrid Modbus TCP manual](https://github.com/tjorim/python-mygrid-modbus/blob/main/docs/mygrid-modbus-tcp-manual-en.md)
for the manufacturer specification. The full register table stays there to avoid
drifting copies. This integration supports map **2** only.

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
and [HACS integration source](https://github.com/tjorim/ha-mygrid-modbus/tree/main/custom_components/mygrid_modbus).
See the integration's [hardware acceptance checklist](https://github.com/tjorim/ha-mygrid-modbus/blob/main/docs/hardware-testing.md)
and [protocol reference](https://github.com/tjorim/ha-mygrid-modbus/blob/main/docs/protocol.md)
for validation and register details, the [VoltBridge setup guide](voltbridge.md)
for the P1 adapter, or the [documentation index](README.md).
