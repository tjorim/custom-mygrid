# VoltBridge: Home Assistant installation and setup

The [MyGrid VoltBridge integration](https://github.com/tjorim/ha-mygrid-voltbridge)
reads your P1 meter locally over HTTP and UDP. No cloud account or MQTT broker is
needed. This is an unofficial community integration with no official Home
Assistant quality rating. Its reverse-engineered API has been checked on one
single-phase meter with firmware build 15.6; other phases and export readings
have not been verified on hardware.

## Before you start

- Run **Home Assistant 2026.10.2 or newer** (Python 3.14.2+). The integration
  includes its Python library; do not install a separate Python package.
- Connect the VoltBridge to your LAN and to an enabled P1 port on the meter.
  Wait for a telegram before adding it: setup needs a P1 serial and a first
  snapshot, and entities depend on the data available then.
- From the Home Assistant network, check that `http://<voltbridge-address>/`
  opens. Keep the device on a trusted LAN: its API has no authentication.

## Install with HACS

1. With [HACS](https://hacs.xyz/) installed, open **HACS → ⋮ → Custom repositories**.
2. Add `https://github.com/tjorim/ha-mygrid-voltbridge`, choosing **Integration**
   as the category.
3. Find **MyGrid VoltBridge** in HACS and download it.
4. Restart Home Assistant.

For a manual installation, copy the repository's entire
`custom_components/mygrid_voltbridge` directory into
`<config>/custom_components/mygrid_voltbridge`, then restart Home Assistant.

## Add the device

Open **Settings → Devices & services**. Confirm the discovered VoltBridge, or
choose **Add integration → MyGrid VoltBridge** and enter its hostname or IP
address. No credentials are required. Add a separate entry for each VoltBridge.

Automatic discovery uses mDNS **`_mygrid._tcp`**. DHCP discovery follows a
registered device when its address changes; it is not a scan for every new
VoltBridge. Entries are identified by the **P1 meter serial**. If discovery
cannot follow an address change, use the entry menu's **Reconfigure** action.
It preserves the entry and history, but refuses a different meter serial.

## Updates and options

Live values arrive by local UDP broadcast on **port 49491**, about once a second.
The device also broadcasts **one-minute aggregates on UDP 49492**; the current
integration listens to the live stream on 49491, rather than using those
aggregates. Broadcasts may not cross VLANs or reach a container without suitable
networking. Allow the live stream to reach the Home Assistant host for fast
updates.

HTTP polling reads the snapshot, raw DSMR telegram and optional status data.
It supplies energy totals, gas, water, breaker and peak history, and provides
updates when UDP is unavailable. Under the integration's **Configure** action,
set the HTTP polling interval to an integer from **5–600 seconds**; the default
is **30 seconds**. This does not change the device's UDP broadcast rate.

## Entities

| Entity | Meaning and availability |
| --- | --- |
| Net / import / export power | W; positive net power means import, negative means export |
| Energy imported / exported, day and night | Cumulative `total_increasing` energy counters for the Energy dashboard |
| Phase voltage and current | Created for phases reported by the meter; per-phase import/export power is disabled by default |
| Current average demand / peak demand / peak demand time | Quarter-hour average and monthly peak; peak history is in the peak sensor's `history` attribute |
| Tariff | `day` or `night` |
| Gas / water | m³, when reported by connected M-Bus meters; updated by polling at the meter's own reporting pace |
| Breaker | Diagnostic state: open, closed or ready to reconnect |
| Wi-Fi signal | Optional diagnostic in dBm; updated by the live stream too |
| P1 packet error rate | Optional diagnostic percentage of telegrams failing their checksum; check the P1 cable if it rises |
| Limiter / fuse threshold | Disabled by default; created only for real limits, not the meter's “no limit” sentinel values |
| Reboot | Button, **disabled by default**; enable it in the device's entity list only if needed |

Optional status endpoints may be absent on older firmware. Missing optional
status does not make the main snapshot unavailable. Reload the entry after
connecting another meter or adding a phase so newly available entities can be
created. Gas and water readings may change only every few minutes to an hour.

The opt-in Reboot button is the integration's only device command. It sends once,
is never retried automatically, and makes readings unavailable while the device
restarts.

## Energy dashboard

Under **Settings → Dashboards → Energy**, add **Energy imported (day)** and
**Energy imported (night)** as grid consumption, and the two **Energy exported**
counters as return to grid. Add Gas or Water as sources when available. Use the
cumulative energy counters, rather than instantaneous power, for energy inputs.

## Troubleshooting, repairs and diagnostics

| Symptom | What to check |
| --- | --- |
| Integration does not appear | Verify the HACS download or manual directory, then restart Home Assistant; check the minimum Home Assistant version |
| No discovery card | mDNS may be blocked across networks; use the manual config flow with the device's address |
| Cannot connect | Open the device's HTTP page from the Home Assistant network; check its address, power and network access |
| Setup says no P1 telegram / no P1 data | Connect the P1 cable, enable the meter's P1 port and wait for a valid telegram with a serial |
| Repair “VoltBridge receives no P1 data” (`no_p1_data`) | Check the P1 cable and port. A successful HTTP P1 snapshot clears the repair automatically; there is no repair wizard |
| Values update only every 30 seconds | HTTP fallback is working; check UDP 49491, VLAN broadcast routing, firewall and container networking |
| Missing gas, water or phase entities | Confirm the meter reports them, then reload the entry; optional readings depend on meter and firmware support |
| Poor or intermittent readings | Check Wi-Fi signal and P1 packet error rate where available; inspect Wi-Fi coverage and the P1 cable |
| Reconfigure reports the wrong device | The P1 serial differs; add the replacement meter as a new entry |

Download **diagnostics** from the device/integration menu when reporting an issue.
The integration redacts the host and meter serial; review the file for household
usage information before sharing it. Include your Home Assistant and device
firmware versions and describe whether HTTP polling and UDP push work.

Delete the entry under **Settings → Devices & services** to remove its device,
entities and repair issue. Remove the HACS download (or manual directory) and
restart to uninstall the integration.

## Sources and related guides

These instructions follow the [integration README](https://github.com/tjorim/ha-mygrid-voltbridge#readme),
[canonical integration source](https://github.com/tjorim/ha-mygrid-core/tree/main/homeassistant/components/mygrid)
and [UDP implementation](https://github.com/tjorim/python-mygrid-voltbridge/blob/main/src/mygrid_voltbridge/udp.py).
For protocol details, use the [library documentation](https://github.com/tjorim/python-mygrid-voltbridge).
See also the [ModuleTwo setup guide](moduletwo.md) and [documentation index](README.md).
