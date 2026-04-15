"""Update roadmap CSV with new commits #233 and #234."""
import os

csv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)),
                        "Roadmap \u0e01\u0e32\u0e23\u0e1e\u0e31\u0e12\u0e19\u0e32\u0e42\u0e1b\u0e23\u0e40\u0e08\u0e04.csv")

with open(csv_path, "rb") as f:
    lines = f.readlines()

row233 = (
    b"Commit ??? 233,2026-03-21 10:25:52 +0700,"
    b'"feat: Sprint 1+2 - form-schema.js integration, admin features, offline sync",'
    b'"???????????????: sprint 1+2 - form-schema.js integration, admin features, offline sync",'
    b"hash=de47798; author=Patchara Phongyeelar\r\n"
)
row234 = (
    b"Commit ??? 234,2026-03-22 10:00:48 +0700,"
    b'"feat: expand admin portal, org operations, and project docs",'
    b'"???????????????: expand admin portal, org operations, and project docs",'
    b"hash=36ea455; author=pchr-pyl\r\n"
)

# Insert after index 232 (last content row)
lines.insert(233, row234)
lines.insert(233, row233)

with open(csv_path, "wb") as f:
    f.writelines(lines)

print("Done.")
print("Row 233:", lines[233][:80])
print("Row 234:", lines[234][:80])
