# Changa Asta (Ashta Chamma / Chowka Bara) – Deep Research & Comprehensive Rulebook

Changa Asta is an ancient Indian board game belonging to the cross-and-circle family, closely related to Pachisi (Ludo). It has been played for centuries under various regional names, serving as a game of strategy, probability, and tactical movement. 

This document serves as the absolute, exhaustive reference for all rules, mechanics, logic, variations, and coordinate mappings required to perfectly simulate the game.

---

## 1. Nomenclature & Regional Variations
The game's name varies significantly across India, though the core rules remain largely identical:
* **Changa Asta / Changa Ashta:** Common digital store name, representing the two highest scoring rolls: *Changa* (4) and *Ashta* (8).
* **Ashta Chamma:** Telugu (Andhra Pradesh/Telangana). *Ashta* = 8, *Chamma* = 4.
* **Chowka Bara / Chowka Bhara:** Kannada (Karnataka). *Chowka* = 4, *Bara* = 8.
* **Daayam / Thaayam:** Tamil (Tamil Nadu).
* **Katte Mane:** Kannada variant.
* **Kanna Dudi:** Hindi / North Indian variant.

---

## 2. Board Grid & Coordinate Mapping
The game can be played on a **5x5 grid** (most common) or a **7x7 grid**. We map the 5x5 grid using 1-based coordinate indices $(row, column)$ from the top-left $(1, 1)$ to the bottom-right $(5, 5)$.

```text
   1      2      3      4      5
1 [   ]  [   ]  [ X ]  [   ]  [   ]  (North Player Start)
2 [   ]  [   ]  [   ]  [   ]  [   ]
3 [ X ]  [   ]  [ H ]  [   ]  [ X ]  (West / East Player Start)
4 [   ]  [   ]  [   ]  [   ]  [   ]
5 [   ]  [   ]  [ X ]  [   ]  [   ]  (South Player Start)
```
* **X** denotes a **Safe Square (Palace)**. Pawns on these squares cannot be killed.
* **H** denotes the **Home / Goal Square** at the center $(3,3)$.

### Player Starting Positions
Four players can play, each assigned a starting safe square on the outer perimeter:
* **South Player (Red):** $(5, 3)$
* **West Player (Green):** $(3, 1)$
* **North Player (Yellow):** $(1, 3)$
* **East Player (Blue):** $(3, 5)$

---

## 3. The Cowrie Shells (Dice) & Probabilities
The game uses **cowrie shells** thrown by the player. A 5x5 board uses 4 cowries, while a 7x7 board uses 6 cowries. The value of the roll depends on how many shells land with their openings (mouths) facing up.

### 5x5 Board Scoring (4 Cowries)
| Mouths Up | Roll Value | Traditional Name | Grants Extra Turn? | Probability |
| :---: | :---: | :---: | :---: | :---: |
| **0** | **4** | *Chowka / Chamma* | **Yes** | 1/16 (6.25%) |
| **1** | **1** | *Kano* | No | 4/16 (25.0%) |
| **2** | **2** | *Ducca* | No | 6/16 (37.5%) |
| **3** | **3** | *Teeji* | No | 4/16 (25.0%) |
| **4** | **8** | *Ashta* | **Yes** | 1/16 (6.25%) |

### 7x7 Board Scoring (6 Cowries)
| Mouths Up | Roll Value | Name | Grants Extra Turn? |
| :---: | :---: | :---: | :---: |
| **0** | **6** | *Chhaka* | **Yes** |
| **1** | **1** | - | No |
| **2** | **2** | - | No |
| **3** | **3** | - | No |
| **4** | **4** | - | No |
| **5** | **5** | - | No |
| **6** | **12** | *Bara* | **Yes** |

### High-Value Roll Rules
1. **Consecutive Rolls:** If a player rolls a max value (4 or 8 in a 5x5 game), they **must** roll again. The values of their rolls accumulate in a queue for that turn (e.g., if they roll $8$ then $4$ then $1$, their move options are $[8, 4, 1]$).
2. **Three-Strike Penalty:** If a player rolls three consecutive high rolls ($4$ or $8$, e.g. $4-4-4$, $8-8-8$, $4-8-4$), their turn is **canceled entirely**. All accumulated rolls are voided, and play passes to the next player.
3. **Pawn Splitting:** The accumulated rolls can be distributed among different pawns in any order. (e.g., with moves $[8, 4, 2]$, a player can move Pawn A by 8 steps, Pawn B by 4 steps, and Pawn C by 2 steps; or they can move Pawn A by $8+4+2=14$ steps).

---

## 4. Movement Logic & Paths
Every player's pawn moves in a strictly alternating spiral path toward the center:
1. **Outer Ring (Anti-clockwise):** 16 squares around the border.
2. **Inner Ring (Clockwise):** 8 squares around the center.
3. **Center Square (Goal):** The center square $(3, 3)$.
*(For a 7x7 board, the rings alternate: Outer=Anti-clockwise, Middle=Clockwise, Inner=Anti-clockwise).*

### Player Coordinate Paths (25-Step Array)

#### South Player (Start at Row 5, Col 3)
1. **Outer Ring (16 Steps - Anti-clockwise):**
   1. $(5, 3)$ [Start / Safe]
   2. $(5, 4)$
   3. $(5, 5)$
   4. $(4, 5)$
   5. $(3, 5)$ [Safe]
   6. $(2, 5)$
   7. $(1, 5)$
   8. $(1, 4)$
   9. $(1, 3)$ [Safe]
   10. $(1, 2)$
   11. $(1, 1)$
   12. $(2, 1)$
   13. $(3, 1)$ [Safe]
   14. $(4, 1)$
   15. $(5, 1)$
   16. $(5, 2)$ [Transition Square]
2. **Inner Ring (8 Steps - Clockwise):**
   17. $(4, 2)$ [Inner Start]
   18. $(3, 2)$
   19. $(2, 2)$
   20. $(2, 3)$
   21. $(2, 4)$
   22. $(3, 4)$
   23. $(4, 4)$
   24. $(4, 3)$
3. **Center Goal (1 Step):**
   25. $(3, 3)$ [Goal / Safe]

---

#### West Player (Start at Row 3, Col 1)
1. **Outer Ring (16 Steps - Anti-clockwise):**
   1. $(3, 1)$ [Start / Safe]
   2. $(4, 1)$
   3. $(5, 1)$
   4. $(5, 2)$
   5. $(5, 3)$ [Safe]
   6. $(5, 4)$
   7. $(5, 5)$
   8. $(4, 5)$
   9. $(3, 5)$ [Safe]
   10. $(2, 5)$
   11. $(1, 5)$
   12. $(1, 4)$
   13. $(1, 3)$ [Safe]
   14. $(1, 2)$
   15. $(1, 1)$
   16. $(2, 1)$ [Transition Square]
2. **Inner Ring (8 Steps - Clockwise):**
   17. $(2, 2)$ [Inner Start]
   18. $(2, 3)$
   19. $(2, 4)$
   20. $(3, 4)$
   21. $(4, 4)$
   22. $(4, 3)$
   23. $(4, 2)$
   24. $(3, 2)$
3. **Center Goal (1 Step):**
   25. $(3, 3)$ [Goal / Safe]

---

#### North Player (Start at Row 1, Col 3)
1. **Outer Ring (16 Steps - Anti-clockwise):**
   1. $(1, 3)$ [Start / Safe]
   2. $(1, 2)$
   3. $(1, 1)$
   4. $(2, 1)$
   5. $(3, 1)$ [Safe]
   6. $(4, 1)$
   7. $(5, 1)$
   8. $(5, 2)$
   9. $(5, 3)$ [Safe]
   10. $(5, 4)$
   11. $(5, 5)$
   12. $(4, 5)$
   13. $(3, 5)$ [Safe]
   14. $(2, 5)$
   15. $(1, 5)$
   16. $(1, 4)$ [Transition Square]
2. **Inner Ring (8 Steps - Clockwise):**
   17. $(2, 4)$ [Inner Start]
   18. $(3, 4)$
   19. $(4, 4)$
   20. $(4, 3)$
   21. $(4, 2)$
   22. $(3, 2)$
   23. $(2, 2)$
   24. $(2, 3)$
3. **Center Goal (1 Step):**
   25. $(3, 3)$ [Goal / Safe]

---

#### East Player (Start at Row 3, Col 5)
1. **Outer Ring (16 Steps - Anti-clockwise):**
   1. $(3, 5)$ [Start / Safe]
   2. $(2, 5)$
   3. $(1, 5)$
   4. $(1, 4)$
   5. $(1, 3)$ [Safe]
   6. $(1, 2)$
   7. $(1, 1)$
   8. $(2, 1)$
   9. $(3, 1)$ [Safe]
   10. $(4, 1)$
   11. $(5, 1)$
   12. $(5, 2)$
   13. $(5, 3)$ [Safe]
   14. $(5, 4)$
   15. $(5, 5)$
   16. $(4, 5)$ [Transition Square]
2. **Inner Ring (8 Steps - Clockwise):**
   17. $(4, 4)$ [Inner Start]
   18. $(4, 3)$
   19. $(4, 2)$
   20. $(3, 2)$
   21. $(2, 2)$
   22. $(2, 3)$
   23. $(2, 4)$
   24. $(3, 4)$
3. **Center Goal (1 Step):**
   25. $(3, 3)$ [Goal / Safe]


---

## 5. Capture & Progression Rules
> [!IMPORTANT]
> **The Capture Requirement ("Cutting")**
> A player's pawns **cannot** enter the inner ring until that player has captured ("cut") at least one opponent pawn during the game. 
> 
> If a player reaches the transition cell at the end of the outer loop without having secured at least one capture, their pawn **cannot turn inward** and must perform another loop around the outer ring. Once a capture is made, the inner ring path is unlocked for **all** of that player's pawns for the rest of the game.

### Mechanics of Capture
* **Normal Squares:** Only one player's active pawns can occupy a normal square. If Player A's pawn lands on a square occupied by Player B's pawn, Player B's pawn is **captured** and sent back to their starting position.
* **Safe Squares (Palaces):** The starting squares (midpoints of the outer edges) and the central goal are marked as safe. Pawns on these squares **cannot be captured**. Any number of pawns from any number of players can rest on a safe square together.
* **Bonus Turn for Capturing:** Capturing an opponent grants Player A an **extra throw** of the cowrie shells during that turn.

### Board Entry Rule (Strict Variation)
In the traditional variation, pawns do not start on the board. They wait in a "yard" off-board. A player **must** roll a 4 (Chamma) or 8 (Ashta) to spawn a single pawn onto their starting Safe Square. Once spawned, that pawn can be moved with subsequent rolls. 

---

## 6. Advanced Mechanics: Pawn Pairing (*Gatti*)
Some regional variations introduce the **Gatti (Toughening / Pairing)** rule:
* **Forming a Pair:** If a player has two of their own pawns on the same square (usually restricted to the inner ring, though some play with outer ring pairing), they form a temporary double unit (*Tollu*).
* **Solidifying a Gatti:** To lock them into an invincible pair (*Gatti*), the player must roll a **2** during their turn. 
* **Properties of a Gatti:**
  * Moves together as a single double-strength unit.
  * Blockade: Single pawns cannot land on or jump over a Gatti.
  * Invincibility: A single pawn cannot capture a Gatti. Only another Gatti pair from an opponent can capture a Gatti.
  * Movement: Moving a Gatti requires either even rolls or splitting rolls specifically.

---

## 7. Winning Conditions
* **Exact Roll to Home:** To enter the Center Home $(3, 3)$ (Step 25), a pawn must land exactly on it. If a pawn is on Step 24 and the player rolls a 3, that pawn cannot move using the 3.
* **Victory:** The first player to successfully move all 4 pawns into the Center Home is declared the winner.

---

## 8. State Representation (Data Structure Design)
For coding Changa Asta in a web app, a clean React/JS state structure is:

```typescript
type PlayerColor = 'red' | 'green' | 'yellow' | 'blue';

interface Pawn {
  id: number;          // 0, 1, 2, 3
  color: PlayerColor;
  pathIndex: number;   // -1 if in yard, 0 to 24 on path
}

interface Player {
  color: PlayerColor;
  name: string;
  hasKilled: boolean;  // Unlocks inner ring entry
  pawns: Pawn[];
}

interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  rollQueue: number[]; // e.g. [8, 4, 1]
  consecutiveHighRolls: number; // Max 3
  gamePhase: 'rolling' | 'moving' | 'ended';
  winner: PlayerColor | null;
}
```
