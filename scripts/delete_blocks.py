"""Delete CH1_COLUMNS and CH1_SUMMARY_SECTIONS duplicate blocks from admin.html."""
import os, sys

fname = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'admin.html')
with open(fname, 'r', encoding='utf-8') as f:
    lines = f.readlines()

orig_len = len(lines)

# --- Block 1: const CH1_COLUMNS array declaration ---
# Starts at 'const CH1_COLUMNS = ['
# Ends at ']; ' immediately before 'function renderCh1RawSheet'
b1_start = b1_end = None
for i, line in enumerate(lines):
    if b1_start is None and line.strip().startswith('const CH1_COLUMNS = ['):
        b1_start = i
    if b1_start is not None and b1_end is None:
        if line.strip() == '];' and any(
            'function renderCh1RawSheet' in lines[i + k]
            for k in range(1, 4) if i + k < len(lines)
        ):
            b1_end = i
            break

# --- Block 2: const CH1_SUMMARY_SECTIONS ---
b2_start = b2_end = None
for i, line in enumerate(lines):
    if 'const CH1_SUMMARY_SECTIONS = [' in line:
        b2_start = i
    if b2_start is not None and b2_end is None:
        if line.strip() == '];' and any(
            'function renderCh1SummaryChart' in lines[i + k]
            for k in range(1, 4) if i + k < len(lines)
        ):
            b2_end = i
            break

if b1_start is None or b1_end is None:
    print("ERROR: Could not find Block 1 boundaries", file=sys.stderr)
    sys.exit(1)
if b2_start is None or b2_end is None:
    print("ERROR: Could not find Block 2 boundaries", file=sys.stderr)
    sys.exit(1)

print(f"Block 1: lines {b1_start+1}-{b1_end+1}  ({b1_end-b1_start+1} lines)")
print(f"Block 2: lines {b2_start+1}-{b2_end+1}  ({b2_end-b2_start+1} lines)")

# Delete block 2 first (higher index), then block 1 to preserve indices
new_lines = lines[:b2_start] + lines[b2_end + 1:]
new_lines = new_lines[:b1_start] + new_lines[b1_end + 1:]

print(f"Lines before: {orig_len}  After: {len(new_lines)}  Removed: {orig_len - len(new_lines)}")

with open(fname, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Done.")
