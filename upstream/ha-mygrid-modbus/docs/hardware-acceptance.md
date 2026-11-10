# ModuleTwo hardware acceptance record

Status: **partial physical acceptance — setup, polling, diagnostics and small power-control tests verified on 2026-11-09; remaining checks pending**.

Tracking: [ha-mygrid-modbus #4](https://github.com/tjorim/ha-mygrid-modbus/issues/4).
Follow the [acceptance checklist](hardware-testing.md). Record observations, timestamps and failures below; a blank or pending result is not a pass.

## Confirmed prerequisite — 2026-11-09

The [library validation issue](https://github.com/tjorim/python-mygrid-modbus/issues/5) is resolved. The [library validation record](https://github.com/tjorim/python-mygrid-modbus/pull/22) documents read-only testing on the replacement battery:

- The owner reports that account linking started battery updates, and selecting Home Assistant control again made Modbus TCP available.
- Software **31.6** is owner-reported. The standard device-identification request returned Illegal Function, so this version was not read over Modbus.
- Register 0 reports map version **2**.
- Both read-only library smoke tests passed; the read-only CLI returned a valid snapshot and raw-register dump. No protocol correction was needed.
- No power or restart commands were sent. Activation persistence and operation without cloud access remain unverified.

These results validate the library prerequisite only.

## Integration test environment

| Field | Value |
| --- | --- |
| Test date/time and timezone | 2026-11-09, read-only checks 20:21–20:23 UTC; control checks 20:30–20:32 UTC (Europe/Brussels: UTC+1) |
| Tester | Codex via authenticated Home Assistant REST/WebSocket APIs, owner-provided endpoint |
| Installed integration version and commit | Manifest 0.1.0; HACS update entity reports installed revision `6e4ce48` (not independently verified against installed files) |
| Installed library version | Manifest requirement `mygrid-modbus==0.1.1`; runtime package not independently inspected |
| Home Assistant version | 2026.11.0, Home Assistant OS 18.5, Python 3.14.10, aarch64 |
| Battery software/firmware and source | Pending reconfirmation (owner-reported baseline: Software 31.6) |
| Observed register-map version | 2, reconfirmed in integration diagnostics/register 0 |
| Standalone/cluster and leader role | Pending |
| Control source and competing controllers disconnected | Pending |

Keep network addresses, credentials and unreviewed diagnostics out of published results.

## Integration observations

| Checklist steps | Check | Result and evidence |
| --- | --- | --- |
| 1–2 | Setup, one device, initial setpoint unchanged | Setup loaded successfully; one device, 38 registered entities, 13 enabled. First and subsequent setpoint readings were 0 W. No command actions invoked; no pre-setup setpoint capture, so unchanged initial setpoint is not independently established. |
| 2–3 | SOC, power/sign, limits, stored energy, capacity and lifetime counters compared with app | Live telemetry available: SOC 49%, power 0 W, limits +1200/−800 W, stored energy 2000 Wh, capacity 3978 Wh, lifetime charged/discharged 1446/111 Wh. Status normal, Problem off. Owner subsequently reported the readings looked alright; no itemized app comparison was captured. Nonzero power sign was observed in the control test below. |
| Connection visibility | Shared Modbus connection | `modbus/connections/list` reports a connected TCP endpoint held by this config entry on unit 1. Owner confirmed it is visible on the Modbus configuration page after refresh. |
| 3 | Cluster energy aggregation scope, if applicable | Pending |
| 4–5 | Explicitly supervised allowed setpoints, readback, measured response and explicit zero | Owner authorized input/output testing in chat. +100 W and −100 W were accepted through HA, both within fresh 1200 W charge / 800 W discharge limits. Positive and negative measured responses observed; final explicit zero confirmed in setpoint and power, including fresh raw registers. See timing observations below. |
| 6 | Connectivity loss, unavailable state, polling recovery and no command replay | Pending |
| 7 | Reconfiguration preserves entity IDs/history and permits connection | Pending |
| 8 | Energy dashboard selection and generated statistics | Both lifetime counters expose energy/Wh/total_increasing; recorder lists both IDs with has_sum=true. Subsequent read-only checks confirmed energy-class metadata in Wh and three five-minute samples for each counter. The existing Energy preferences contain no MyGrid battery source; dashboard selection/display remains pending. |
| 9 | Polling changes, reload/unload do not write power; last-consumer connection release | Integration-only reload returned HTTP 200 with require_restart=false; setup recovered immediately. Before/after diagnostics showed setpoint 0 W, measured power 0 W, normal status and no faults. The shared connection remained listed as connected on unit 1 after reload. Polling-option changes and isolated last-consumer release remain untested. |
| 10 | Optional supervised restart, single command and eventual read recovery | Not performed; requires separate authorization and maintenance window |
| Diagnostics | Download works, decoded telemetry/raw dump agree, identifying fields omitted | HTTP 200; last_update_success=true, battery updated, no failed components/faults, all 18 holding registers returned and consistent with decoded values/scales. Integration payload omits network addresses and entry identity. HA diagnostic wrapper includes other integrations and setup-time entry IDs; do not publish the complete download without review. |

For any control test, record authorization, requested value, fresh limits, readback, measured response, time and final state. Record uncertain command outcomes explicitly; do not automatically retry. Do not induce faults to test diagnostics.

## Discrepancies and completion

Setup, repeated polling, diagnostics and small charge/discharge commands succeeded. Restart remains disabled and was not invoked. The existing Home Assistant instance retains the configured entry and continues polling; no local HA instance was started. Integration-only reload/reconnection also passed at idle, with unchanged zero setpoint/power and no faults. Recorder generated five-minute samples for both lifetime counters. Network-outage recovery, reconfiguration, polling-option changes, isolated last-consumer release, detailed app comparison and dashboard selection/display remain pending. Optional restart may remain untested if explicitly recorded as such.

### Authorized control test — 2026-11-09

The owner said the readings looked alright and explicitly authorized playing with inputs and verifying outputs. Commands were sent through HA's `number.set_value`, with no competing test client. Baseline SOC was 49%, setpoint/power 0 W, status normal and fault flags zero. Each command below was sent once; every service call returned HTTP 200.

| UTC time | Requested input | Observed output |
| --- | --- | --- |
| 20:30:52 | +100 W | Setpoint +100 W at subsequent 5/10/15-second checks. Measured power remained 0 W during those checks. |
| 20:31:07 | 0 W | Setpoint 0 W at 20:31:12; measured power +64 W, then +68 W at 20:31:17. This delayed positive response is consistent with charging, but a steady +100 W response was not established. |
| 20:31:12 | −100 W | Setpoint −100 W at subsequent checks; measured power −108 W at 20:31:28, confirming discharge sign. |
| 20:31:28 | 0 W | At 20:31:33 the cached snapshot still showed −100 W / −108 W, so the five-second idle assertion failed. No command was resent. By the next inspection, the number entity reported 0 W with a 20:31:37 update timestamp, and fresh register 2 was zero. |
| 20:31:52–20:32:07 | No further commands | Four checks confirmed setpoint 0 W, measured power 0 W and raw registers 2/5 both zero. Status remained normal, with no fault flags. |

Readback and measured power did not settle immediately. These short tests establish accepted small commands, observed charge/discharge signs and eventual return to idle; they do not establish precise tracking accuracy, response-time guarantees or sustained operation. The five-second assertion failure is retained as an observation rather than counted as an immediate idle pass. No automatic write retry or restart was performed.

After reviewing the physical test evidence, update the README and the [documentation hub](https://github.com/tjorim/custom-mygrid#readme) with the tested versions, scope and remaining limitations. Library reads, simulator tests, hassfest and HACS validation alone do not establish physical-device acceptance.

## Low-impact follow-up

After the owner requested further checks without stressing the battery, baseline diagnostics confirmed zero setpoint/power and no faults. Only the MyGrid config entry was reloaded; Home Assistant and the battery were not restarted. Post-reload diagnostics and the shared-connection list confirmed successful setup/reconnection with zero setpoint/power. No charge/discharge commands, network interruptions or further physical cycling were performed.

Recorder metadata reports energy-class Wh statistics with sums for both lifetime counters, and three five-minute samples were returned for each since integration setup. Existing Energy preferences do not contain this MyGrid battery; they were left unchanged. Generating recorder samples is established; actual Energy dashboard display is not.
