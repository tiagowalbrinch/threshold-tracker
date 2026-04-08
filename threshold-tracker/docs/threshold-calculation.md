# How Your Threshold Is Calculated

Your **threshold** is a daily target score — set just above your average performance, scaled to how consistent you are. Play consistently and the bar moves up gradually. Play erratically and it moves up faster, since you've shown you can hit higher scores.

---

## The Goal

The threshold should always feel like something you *almost* achieved on a recent good run — challenging enough to drive improvement, realistic enough to stay motivating.

---

## Step by Step

### 1. Minimum sessions required

If you have fewer than **5 sessions** recorded, no threshold is calculated yet. Play a few more times first.

---

### 2. Calculate your mean score

All your recorded scores are averaged to find your baseline performance.

**Example (5 sessions):**
```
120, 130, 125, 140, 135  →  mean = 130
```

---

### 3. Normalize each score

Each score is divided by the mean to produce a scale-independent value:

```
120 / 130 = 0.92
130 / 130 = 1.00
125 / 130 = 0.96
140 / 130 = 1.08
135 / 130 = 1.04
```

Normalization ensures the algorithm works the same whether scores are in the hundreds or the tens of thousands.

---

### 4. Compute the standard deviation of normalized scores

Standard deviation measures how spread out your scores are — i.e. how consistent you are.

| Behaviour     | StdDev | Effect on target |
|---------------|--------|------------------|
| Very consistent | Low  | Small increase   |
| Inconsistent    | High | Larger increase  |

A minimum floor of **0.05** is applied so that even perfectly consistent players always get a small upward nudge.

---

### 5. Calculate the target

```
target = mean × (1 + stdDev)
```

In the example above, stdDev ≈ 0.055, so:

```
target = 130 × 1.055 ≈ 137
```

---

### 6. Safety cap

The target is capped at **95% of your best score** to prevent unreachable targets after a single exceptional run.

---

## What This Means in Practice

| Situation | What happens |
|---|---|
| You're improving consistently | Mean rises, target follows |
| You had one amazing lucky run | Cap at 95% of best prevents an impossible target |
| You're inconsistent | Higher stdDev → larger boost (you've shown you can do it) |
| You play perfectly every session | stdDev floors to 0.05 → 5% nudge above mean |

---

## The Threshold Never Goes Down

Once your threshold is set, it will only ever increase. Even if you have a rough week, your threshold stays where it was. It only updates when your new calculated value is higher than the current one.

---

## Autosync

When **autosync** is on, the threshold is recalculated automatically every time you open the task page. If you've improved, it updates silently. If you haven't, it stays the same.

When **autosync** is off, the calculation still runs but the result is shown as a **suggestion** — you decide whether to apply it manually.
