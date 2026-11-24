#!/usr/bin/env python3
"""Recompute automationposition rows for the automation diagram (labels in a grid, scenarios on a half circle).

Run from the repo root:  python3 .agents/skills/automation-diagram-layout/layout.py [--dry-run]
Reads labels and scenarios from BOTH data trees, writes the positions back to the file each id belongs to.
"""
import glob, math, re, sys

PLUGIN = 'plugins/catalog/html/data/lists/'
SITE = 'webapp/site/catalog/data/lists/'
POS_PLUGIN = PLUGIN + 'automationposition/scenariopositions.xml'
POS_SITE = SITE + 'automationposition/eme_chatbot.xml'
# Grid order, left to right then top to bottom. Labels not listed here go last, in file order.
LABEL_ORDER = ['communication_tools', 'content_creation_tools', 'eme_server', 'entity_chat', 'team_chat',
               'eme_chatbot', 'eme_chatbot_employees', 'file_management_tools']
SITE_PREFIX = 'eme_chatbot'          # ids starting with this are written to the site file

NODE = 200      # scenario group is 200x200 in agentautomation.js
GAP = 40        # space between neighbouring scenarios on an arc
COLS = 3        # labels per row
SEP = 20        # space between clusters
CX, CY = 1740, 1720   # centre of the whole diagram (the old hand-placed layout centred here)
LABEL_DROP = 60       # label box is shorter than a node, so sit it lower inside its row


def read(dirs, name):
    out = []
    for d in dirs:
        for f in sorted(glob.glob(d + name + '/*.xml')):
            out.append(open(f).read())
    return '\n'.join(out)


def main():
    labels = re.findall(r'<data id="([^"]+)"', read([PLUGIN, SITE], 'automationlabel'))
    labels = [l for l in LABEL_ORDER if l in labels] + [l for l in labels if l not in LABEL_ORDER]
    kids = {l: [] for l in labels}
    for m in re.finditer(r'<data id="([^"]+)"([^>]*)>', read([PLUGIN, SITE], 'automationscenario')):
        top = re.search(r'connectedtop="([^"]+)"', m.group(2))
        if top and top.group(1) in kids:
            order = re.search(r'ordering="(\d+)"', m.group(2))
            kids[top.group(1)].append((int(order.group(1)) if order else 0, m.group(1)))

    radius = {l: max(300, math.ceil(len(kids[l]) * (NODE + GAP) / math.pi)) for l in labels}
    rows = [labels[i:i + COLS] for i in range(0, len(labels), COLS)]
    row_h = [max(radius[l] for l in r) + NODE * 2 + SEP for r in rows]

    pos = {}
    y0 = CY - sum(row_h) / 2
    for row, h in zip(rows, row_h):
        widths = [2 * radius[l] + NODE for l in row]       # a cluster is as wide as its own arc
        x = CX - (sum(widths) + SEP * (len(row) - 1)) / 2  # each row is centred on CX
        for l, w in zip(row, widths):
            cx, cy = x + w / 2, y0 + NODE / 2
            pos[l] = (cx - NODE / 2, cy - NODE / 2 + LABEL_DROP)
            ids = [s for _, s in sorted(kids[l])]
            for j, s in enumerate(ids):
                th = math.pi * (j + 0.5) / len(ids)        # left to right along the bottom half circle
                pos[s] = (cx - radius[l] * math.cos(th) - NODE / 2, cy + LABEL_DROP + radius[l] * math.sin(th))
            x += w + SEP
        y0 += h

    def render(items, comment):
        body = ''.join('  <data id="%s" posx="%.1f" posy="%.1f">\n    <name/>\n  </data>\n' % (k, x, y) for k, (x, y) in items)
        return '<?xml version="1.0" encoding="UTF-8"?>\n\n%s<root>\n%s</root>\n' % (comment, body)

    site = [(k, v) for k, v in pos.items() if k.startswith(SITE_PREFIX)]
    plug = [(k, v) for k, v in pos.items() if not k.startswith(SITE_PREFIX)]
    files = {POS_SITE: render(site, '<!-- Diagram positions for the EME Chatbot Visitor and Employees labels and scenarios -->\n'),
             POS_PLUGIN: render(plug, '')}
    for path, text in files.items():
        if '--dry-run' in sys.argv:
            print(path, 'identical' if open(path).read() == text else 'WOULD CHANGE')
        else:
            open(path, 'w').write(text)
    print('%d positions (%d site, %d plugin)' % (len(pos), len(site), len(plug)))


main()
