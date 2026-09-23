# 0005. Per-crawl device checks behind a store

- Status: proposed
- Date: 2026-09-23
- Supersedes: none
- Superseded by: none

## Context

Last Train Home renders multiple timed outings, called crawls. Each crawl has authored tasks and a participant's private checkmarks. The app ships as static files and has no account or backend. A participant can open different crawls on one device.

The authored crawl is shared data. Checkmarks belong to the participant and can differ on every device. If screens mix those two kinds of data, or save all checks under one key, one crawl can change another's tally. A future hosted service may also need to store checkmarks without changing how the Tasks view works.

## Decision

We keep checkmarks outside the authored crawl and key them by its stable logical id. The Tasks view reads and saves them through a small state-store interface. A localStorage adapter is the current implementation. It stores one record at `crawl-checks:<id>` for each crawl.

We chose this boundary over adding checkmarks to crawl records. Authored records must remain the same for every participant, while checkmarks are private to one device. We also rejected direct localStorage calls in the view. Those calls would make a future source change touch presentation code.

The interface loads a local snapshot synchronously so the tally is ready when the Tasks view appears. A hosted phase can use a device cache behind this boundary. Live remote updates would need a separate extension to the contract.

## Consequences

- Two crawls can use the same task id without sharing checkmarks.
- A different storage implementation can replace the adapter without changing the Tasks view's persistence calls.
- The app can keep checkmarks usable in memory when device storage fails.
- The checklist controller must reconcile saved task ids with the current crawl's tasks before displaying a tally. The store does not know the task list.
- The synchronous snapshot does not provide cross-device or cross-tab live updates. Those behaviors need later design work.
