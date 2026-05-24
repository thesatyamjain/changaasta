def gen_path(color):
    gridSize = 5
    numRings = gridSize // 2
    center = (gridSize // 2) + 1
    
    if color == 'red': startCell = (gridSize, center)
    elif color == 'green': startCell = (center, 1)
    elif color == 'yellow': startCell = (1, center)
    else: startCell = (center, gridSize)
    
    fullPath = []
    currentEntry = startCell
    
    for k in range(numRings):
        r1, r2 = 1 + k, gridSize - k
        c1, c2 = 1 + k, gridSize - k
        coords = []
        for c in range(c2, c1, -1): coords.append((r2, c))
        for r in range(r2, r1, -1): coords.append((r, c1))
        for c in range(c1, c2): coords.append((r1, c))
        for r in range(r1, r2): coords.append((r, c2))
        
        if k % 2 == 0:
            coords.reverse()
            last = coords.pop()
            coords.insert(0, last)
            
        entryIdx = coords.index(currentEntry)
        rotated = coords[entryIdx:] + coords[:entryIdx]
        fullPath.extend(rotated)
        
        lastCell = rotated[-1]
        nr, nc = lastCell
        kk = min(lastCell[0]-1, gridSize-lastCell[0], lastCell[1]-1, gridSize-lastCell[1])
        rr1, rr2, cc1, cc2 = 1+kk, gridSize-kk, 1+kk, gridSize-kk
        if lastCell[0] == rr2: nr -= 1
        elif lastCell[1] == cc1: nc += 1
        elif lastCell[0] == rr1: nr += 1
        elif lastCell[1] == cc2: nc -= 1
        
        currentEntry = (nr, nc)
        
    fullPath.append((center, center))
    return fullPath

def gen_md(color, title, sr, sc):
    path = gen_path(color)
    md = '#### ' + title + f' (Start at Row {sr}, Col {sc})\n'
    md += '1. **Outer Ring (16 Steps - Anti-clockwise):**\n'
    for i in range(16):
        ann = ''
        if i == 0: ann = ' [Start / Safe]'
        if i == 15: ann = ' [Transition Square]'
        if 0 < i < 15:
            if path[i] in [(5,3), (3,1), (1,3), (3,5)]: ann = ' [Safe]'
        md += f'   {i+1}. $({path[i][0]}, {path[i][1]})${ann}\n'
        
    md += '2. **Inner Ring (8 Steps - Clockwise):**\n'
    for i in range(16, 24):
        ann = ' [Inner Start]' if i == 16 else ''
        md += f'   {i+1}. $({path[i][0]}, {path[i][1]})${ann}\n'
    md += f'3. **Center Goal (1 Step):**\n   25. $({path[24][0]}, {path[24][1]})$ [Goal / Safe]\n\n'
    return md

with open("paths_output.md", "w", encoding="utf-8") as f:
    f.write("### Player Coordinate Paths (25-Step Array)\n\n")
    f.write(gen_md("red", "South Player", 5, 3) + "---\n\n")
    f.write(gen_md("green", "West Player", 3, 1) + "---\n\n")
    f.write(gen_md("yellow", "North Player", 1, 3) + "---\n\n")
    f.write(gen_md("blue", "East Player", 3, 5))
