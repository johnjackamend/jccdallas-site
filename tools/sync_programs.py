#!/usr/bin/env python3
"""Regenerate the inline copies of data/programs.json inside index.html (var P=) and events/index.html (var DATA=).
Run after editing data/programs.json:  python3 tools/sync_programs.py"""
import json, os, sys
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = json.load(open(os.path.join(root, "data/programs.json"), encoding="utf-8"))
def splice(path, marker, payload, end):
    p = os.path.join(root, path); s = open(p, encoding="utf-8").read()
    i = s.find(marker); assert i > 0, (path, marker)
    j = s.find(end, i); assert j > 0
    s = s[:i] + marker + payload + s[j:]
    open(p, "w", encoding="utf-8").write(s)
# entries flagged "pre": true are staged (e.g. a season page in preview) and stay out of the homepage and /events
LIVE = dict(D); LIVE["P"] = [p for p in D["P"] if not p.get("pre")]
splice("index.html", "var P=", json.dumps(LIVE["P"], ensure_ascii=False), ";\n")
splice("events/index.html", "var DATA=", json.dumps(LIVE, ensure_ascii=False), ";\n")
print("synced", len(LIVE["P"]), "live programs into index.html and events/index.html;", len(D["P"]) - len(LIVE["P"]), "staged entries held back")
