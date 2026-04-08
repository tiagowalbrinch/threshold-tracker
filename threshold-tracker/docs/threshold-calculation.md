# How Your Threshold Is Calculated

Your **threshold** is a daily target score — set just above your recent average performance, scaled to how consistent you are. Play consistently and the bar moves up gradually. Play erratically and it moves up faster, since you've shown you can hit higher scores.

---

## The Goal

The threshold should always feel like something you *almost* achieved on a recent good run — challenging enough to drive improvement, realistic enough to stay motivating.

---

## Step by Step

### 1. Minimum sessions required

If you have fewer than **5 sessions** recorded, no threshold is calculated yet. Play a few more times first.

---

### 2. Take the last 10 sessions

Only your **most recent 10 plays** are considered. Older sessions are ignored — the threshold reflects your *current* form, not ancient history.

---

### 3. Calculate your mean score

The 10 scores are averaged to find your current baseline performance.

**Example (5 sessions shown for brevity):**
```
120, 130, 125, 140, 135  →  mean = 130
```

---

### 4. Normalize each score

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

### 5. Remove outliers (dynamic sigma cutoff)

To prevent a single exceptional (or unusually bad) run from distorting the target, outliers are removed using a dynamic cutoff:

- The cutoff scales with how naturally inconsistent you are (measured by the standard deviation of the normalized scores).
- A consistent player gets a tighter cutoff (1.5σ) — even a "nearly exceptional" run gets trimmed so it doesn't inflate the mean.
- An inconsistent player gets a looser cutoff (up to 2.5σ) — their wide variance is genuine, not noise.

After filtering, the mean and spread are recalculated on the clean set.

---

### 6. Compute the standard deviation of the clean set

Standard deviation measures how spread out your remaining scores are — i.e. how consistent you are.

| Behaviour       | StdDev | Effect on target |
|-----------------|--------|------------------|
| Very consistent | Low    | Small increase   |
| Inconsistent    | High   | Larger increase  |

A minimum floor of **0.05** is applied so that even perfectly consistent players always get a small upward nudge.

---

### 7. Calculate the target

```
target = mean × (1 + stdDev)
```

In the example above, stdDev ≈ 0.055, so:

```
target = 130 × 1.055 ≈ 137
```

---

### 8. Safety cap

The target is capped at **95% of the best score in the clean window** to prevent unreachable targets after a single exceptional run.

---

## What This Means in Practice

| Situation | What happens |
|---|---|
| You're improving consistently | Mean rises, target follows |
| You had one amazing lucky run | Outlier removal + 95% cap prevents an impossible target |
| You're inconsistent | Higher stdDev → larger boost (you've shown you can do it) |
| You play perfectly every session | stdDev floors to 0.05 → 5% nudge above mean |

---

## The Threshold Never Goes Down

Once your threshold is set, it will only ever increase. Even if you have a rough week, your threshold stays where it was. It only updates when your new calculated value is higher than the current one.

---

## Autosync

When **autosync** is on, the threshold is recalculated automatically every time you open the task page.

- **First open of the day**: if the new value is higher, it is applied automatically and saved.
- **Subsequent opens the same day**: the calculation still runs, but the result is shown as a **suggestion** — you decide whether to apply it manually.

When **autosync** is off, the calculation always runs as a suggestion — you are always in control.
