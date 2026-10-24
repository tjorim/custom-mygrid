# Architecture and contributor guide

The project focuses on two Python device libraries and two hand-maintained HACS
integrations. Make protocol changes in the library for the device, and Home
Assistant behavior changes in its HACS repository.

## Libraries own the device interface

- [python-mygrid-modbus](https://github.com/tjorim/python-mygrid-modbus) provides
  the ModuleTwo interface over Modbus TCP and is published on PyPI as
  `mygrid-modbus`.
- [python-mygrid-voltbridge](https://github.com/tjorim/python-mygrid-voltbridge)
  provides the VoltBridge interface over HTTP and UDP and is published on PyPI as
  `mygrid-voltbridge`.

These libraries own device communication and protocol decoding. The
`python-mygrid-*` names are repository names only; use the `mygrid-*` package
names when declaring dependencies.

## HACS repositories own the integrations

- [ha-mygrid-modbus](https://github.com/tjorim/ha-mygrid-modbus) owns the ModuleTwo
  integration, domain `mygrid_modbus`.
- [ha-mygrid-voltbridge](https://github.com/tjorim/ha-mygrid-voltbridge) owns the
  VoltBridge integration, domain `mygrid_voltbridge`.

Both repositories are hand-maintained and are the source of truth for their
integration code and tests. They import their library from PyPI. The library
version pin lives in both the integration's `manifest.json` and the `dev`
dependency group in `pyproject.toml`; `scripts/validate_metadata.py` fails if
those pins differ.

HACS allows one integration (one domain) per repository, so each device has its
own HACS repository. The naming convention is `ha-mygrid-<library>`, such as
`ha-mygrid-modbus` for `mygrid-modbus`.

## Dormant Home Assistant core overlay

[ha-mygrid-core](https://github.com/tjorim/ha-mygrid-core) is a dormant
overlay using the `mygrid` domain, retained for a possible Home Assistant core
contribution. It is not the source of the HACS repositories. **Do not run
`scripts/sync_hacs.py` against the HACS repositories.**

A future core PR would be ported from the HACS integrations once the ModuleTwo
is validated on hardware. A core contribution is not guaranteed. Existing HACS
entries would not migrate to a core entry because the domains differ.

## Release flow

1. Tag the library release as `vX.Y.Z` in its repository.
2. Approve the publish workflow in the `pypi` environment. Publishing uses PyPI
   trusted publishing.
3. In the corresponding HACS repository, bump the library pin in both
   `manifest.json` and the `dev` dependency group of `pyproject.toml`, then run
   `uv lock` to update the lockfile.
4. Run metadata validation and the repository's checks, then release the HACS
   integration.

## Contributor tooling

The repositories use `uv` for dependency and environment management,
`hatch-vcs` for versioning, Ruff with `ALL` rules, and mypy in strict mode.
Integration tests use `pytest-homeassistant-custom-component`.

Live tests are selected with `-m live`; provide `VOLTBRIDGE_HOST` for VoltBridge
or `MYGRID_HOST` for ModuleTwo. Follow the target repository's test instructions
and hardware requirements before running them. ModuleTwo still needs hardware
validation; see the [setup guide](moduletwo.md) and its linked acceptance
checklist.

## Website tooling

This hub uses Astro with static output on GitHub Pages. See
[website development and publishing](../site/README.md) for the project structure,
Markdown routing, repository prefix, local commands and CI conventions that other
projects can reuse.

## Why older commits look different

Until 2026-10-24, the HACS repositories were generated from `ha-mygrid-core`,
with the libraries vendored byte for byte. That model was replaced to focus on
the libraries and custom HACS integrations. The transition was prepared on
`own-the-source` in both HACS repositories and `park-core` in the core
repository, and all three branches were merged on 2026-10-24. The HACS
repositories are now hand-maintained, and `ha-mygrid-core` is the dormant
overlay described above. Historical generator and vendoring references describe
the earlier model.

See the [documentation index](README.md) for device setup and protocol guides.
