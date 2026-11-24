---
name: automation-diagram-layout
description: Use when adding, renaming, moving or deleting an automationlabel (the coloured group boxes such as "EME Server" or "EME Chatbot Visitor") or an automationscenario on the automation diagram, or when the diagram looks wrong, is empty, or nodes overlap. Explains where the label, scenario and position data live, how the diagram is drawn, the grid and half circle layout rules, and layout.py, which recomputes every automationposition row. Also the reload steps after any change.
---

# Skill: automation-diagram-layout

The automation diagram (smart automation editor / preview page) draws each **label** as a coloured box and each
**scenario** as a circle node connected to its label. Where everything sits comes from the `automationposition` table.

## How it is drawn

- Data feed: `plugins/mediadb/html/services/automation/preview.json` returns `scenarios[]` and `labels[]`, each with a
  `position` (`posx`, `posy`) looked up by the row's own id (`AutomationManager.getPosition(id)`).
- Renderer: `plugins/community/html/default/components/javascript/emedia/agentautomation.js` (`renderPreview`).
  A scenario with no position is skipped and logs `Positions not set!` in the browser console. A label with no position
  fails to draw. So **every label and scenario id needs an `automationposition` row with the same id.**
- A scenario is joined to its label by `connectedtop="<label id>"` on the scenario row.
- A scenario group is 200 x 200; `posx`/`posy` are its top-left corner. The label box is shorter, so it sits 60 lower
  than its row's top.

## Where the data lives (two trees, same table folders)

| Table | Shared (all sites) `plugins/catalog/html/data/lists/<table>/` | EME Chatbot, this site `webapp/site/catalog/data/lists/<table>/` |
|---|---|---|
| `automationlabel` | `scenariolabels.xml` (EME Server, Entity Chat, Team Chat, ...) | `eme_chatbot.xml` (Visitor, Employees) |
| `automationscenario` | `eme_server.xml`, `entity_chat.xml`, ... | `eme_chatbot.xml`, `eme_chatbot_employees.xml` |
| `automationstep` | `eme_server_*.xml`, ... | `eme_chatbot.xml`, `eme_chatbot_employees.xml` |
| `aiskill` | `*.xml` | `eme_chatbot.xml` |
| `automationposition` | `scenariopositions.xml` | `eme_chatbot.xml` |

Both trees are read by `restoredata`, so a table folder may have several files. `plugins/catalog` is git-ignored;
`webapp/site/catalog` is tracked, so put site-specific rows there. EME Chatbot ids all start with `eme_chatbot`
(label ids `eme_chatbot` = "EME Chatbot Visitor" and `eme_chatbot_employees` = "EME Chatbot Employees"; the Visitor id
was kept when the text was renamed so its scenarios stay linked).

## The layout (what the owner asked for)

1. **Labels in a grid**, 3 per row (`COLS`), in `LABEL_ORDER`.
2. **Scenarios on a half circle** hanging below their label, left to right in `ordering` order, evenly spaced.
3. Radius per label = `max(300, ceil(n * 240 / pi))` (240 = node 200 + gap 40), so a label with many scenarios gets a
   wider arc and nodes never overlap.
4. **Clusters packed side by side**: a cluster is only as wide as its own arc (`2R + 200`) with 20 between neighbours,
   and **each row is centred** on x = 1740. Rows are stacked, and the whole diagram is **centred on (1740, 1720)**, the
   centre of the old hand-placed layout, so the page's saved scroll/zoom still lands on it. (A grid started at (0, 0)
   made all labels look lost: they were off-screen.)

## Recompute the positions: `layout.py`

```bash
python3 .agents/skills/automation-diagram-layout/layout.py --dry-run   # says identical / WOULD CHANGE per file
python3 .agents/skills/automation-diagram-layout/layout.py             # rewrites both automationposition files
```

Run from the repo root. It reads labels and scenarios from both trees and writes ids starting with `eme_chatbot` to the
site file and the rest to the shared file. Constants at the top (`COLS`, `GAP`, `SEP`, `CX/CY`, `LABEL_ORDER`) are the
only knobs. It overwrites any hand-dragged positions, so re-running after the owner drags nodes in the editor loses
that work; say so first. **When you add a label, add its id to `LABEL_ORDER`**, or it goes last.

## Adding or removing things

1. Add the label row (`text`, `strokecolor`, `bgcolor`), then scenarios with `connectedtop`, then steps and skills.
2. Run `layout.py`.
3. Reload (see `reload-list-data` for the auth headers). `automationlabel` and `automationposition` are `dataSearcher`
   tables, but `restoredata` still loads them from the folders (verified):

```bash
TT='X-Tokentype: signature'; A="X-Token: $(bin/refreshtoken.sh --signature)"
B=http://localhost:8080/site/find/views/settings/lists/datamanager/list
for t in aiskill automationlabel automationscenario automationstep automationposition; do
  curl -s -H "$TT" -H "$A" -o /dev/null "$B/restoredata.html?searchtype=$t&oemaxlevel=1"; done
curl -s -H "$TT" -H "$A" http://localhost:8080/site/find/views/settings/status/tools/clearcaches.html
curl -s -H "$TT" -H "$A" http://localhost:8080/openedit/views/filemanager/clearpagemanager.html
```

4. **Removing** a label, scenario, step, skill or position: `restoredata` never deletes, so also delete the rows:
   `curl -H "$TT" -H "$A" -X DELETE http://localhost:8080/site/mediadb/services/lists/data/<table>/<id>`.
   Positions go stale silently (an old `goals_manager` row stayed behind once), so compare counts:
   `positions = labels + scenarios`. Check with `.../services/lists/search/<table>` (`totalhits`).
5. Verify `GET /site/mediadb/services/automation/preview.json` (every label and scenario has a `position`), then
   **hard-reload the page** (Ctrl+Shift+R); the browser keeps the old scroll and zoom.

A scenario whose skill is a Java class or bean changed in `plugin.xml` also needs `bin/restart.sh` before it runs.
