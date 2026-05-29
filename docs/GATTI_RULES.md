# 👑 Changa Asta: Gatti (Group of Gotis) Rules & Logic Guide

In the premium **Changa Asta (Chowka Bara / Ashta Chamma)** game, a **Gatti** is formed when two pawns of the same color occupy the same square. Gatti mechanics introduce deep strategic depth, acting as defensive shields, blockades, and coordinated assault units.

Below is the complete rulebook and engine logic explaining how Gattis function in this edition.

---

## 1. Gatti Formation (Gatti Banana)

* **Trigger:** When two single pawns of the same player land on the **same square** (cell) on the board (except the starting yard or the final center goal), they automatically merge to form a **Gatti**.
* **Visual indicator:** On the board, the two merged pawns will display locked together with a golden Gatti ring aura.
* **Toggle Requirement:** This feature relies on the `Gatti Banana (Blockades)` rule being active in the game setup.

---

## 2. Gatti Movement Rules (Chaal Ke Niyam)

Unlike single pawns, a Gatti moves under a specialized distance and score coordination:

* **Even Roll Requirement:** A Gatti can only move as a coordinated group when the selected roll value from the queue is **even** (`2`, `4`, `6`, `8`, or `12`).
* **Odd Roll Restriction:** If the selected roll is odd (`1`, `3`, `5`), the Gatti cannot move together as a group.
* **Halved Step Distance:** When moving as a group, the Gatti moves exactly **half the distance** of the roll score:
  
| Dice Roll Value | Steps Moved by Gatti | Group Movement Allowed? |
| :---: | :---: | :---: |
| **1** | — | ❌ No (Odd) |
| **2** | **1 step** |  Yes (Even) |
| **3** | — | ❌ No (Odd) |
| **4** | **2 steps** |  Yes (Even) |
| **5** | — | ❌ No (Odd) |
| **6** | **3 steps** |  Yes (Even) |
| **8** | **4 steps** |  Yes (Even) |
| **12** | **6 steps** |  Yes (Even) |

---

## 3. Splitting a Gatti (Goti Alag Karna)

When you click on a Gatti pawn on your turn:
* **The Choice Dialog:** If both a single move and a group move are valid, the game displays a choice overlay:
  1. **Dono Gotiyan (Group Move):** Move both pawns together for `roll / 2` steps (only available on even rolls).
  2. **Ek Goti (Single Move):** Move only **one** pawn out of the Gatti for the full roll distance (`roll` steps).
* **Splitting Impact:** If you choose to move a single pawn, the Gatti **splits**. The moved pawn travels to the destination and becomes a single pawn, while the partner pawn remains at the starting square and also reverts to a single pawn.
* **Auto-Execute:** If only one of the options is valid (e.g., if the roll is odd, or if one path is blocked), the game automatically executes the valid move without popping up the choice dialog.

---

## 4. Blockades (Rasta Rokna)

A Gatti acts as a physical wall (blockade) on the board:
* **Blocking Single Pawns:** Opponents' **single pawns** cannot pass through or land on a cell occupied by an opponent's Gatti. They are completely blocked.
* **Neutral Safe Cells:** A Gatti standing on any **Safe Cell** (cross-marked star cells, starting cells) does **NOT** act as a blockade. Any player's single or group pawns can freely pass through or share safe cells.

---

## 5. Capture Logic (Gotiyan Kaatna)

Gatti combat is highly balanced to ensure fairness:
* **Single Goti Cannot Capture Gatti:** A single goti can never capture a Gatti. It is blocked from landing on it.
* **Group-on-Group Captures Only:** A Gatti can **only** capture another opponent's Gatti. To capture it, your Gatti must land **exactly** on the opponent Gatti's cell.
* **Peaceful Sharing (No Capture):** If your Gatti lands on a cell occupied by an opponent's **single goti**, it does **not** capture it. The Gatti and the single goti share the square peacefully.
* **Captured Gatti Penalty:** When a Gatti is captured by another Gatti, both pawns in the captured Gatti split apart and are sent all the way back to their starting yard (spawn area), losing their Gatti status.

---

## 6. Gatti Protection Shield (Suraksha Kavach)

To add strategic placement options, Gattis extend a protective aura to single pawns:
* **Shielding Rule:** If a player's single goti occupies the same square as **any Gatti** (belonging to any player), that single goti is shielded.
* **Safety from Singles:** While sharing a square with a Gatti, the single goti is **safe from being captured by any opponent's single goti**. If an opponent's single goti lands on this square, it shares the square peacefully and no capture occurs.

---

## 7. AI Bot Intelligence (Computer Bot Logic)

The game's smart computer bots are fully integrated with Gatti rules:
* **DFS Search Permutations:** The bots use a Depth-First Search tree simulator to look ahead. They evaluate moves by testing both Gatti group movements and Gatti splitting options.
* **Evaluation Scoring:**
  * Bots gain a **blockade bonus (+450)** for forming and maintaining defensive Gattis.
  * Bots apply a **danger penalty (-400)** if a single goti is left vulnerable to an opponent Gatti, or **(-250)** if vulnerable to a single goti.
  * Bots prioritize shielding single gotis under Gatti positions when under immediate threat.
