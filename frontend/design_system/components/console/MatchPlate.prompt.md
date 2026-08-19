The bed-board plate — one facility result row on the Match Console. Four states get distinct left-rule colors and labels; `unknown` must always say UNKNOWN, never be visually softened into a maybe. `excluded` renders struck-through and dimmed, meant to sit inside a collapsed group.

```jsx
<MatchPlate name="Maple Grove Care Center" county="Butler County"
  figures={["$4,650/mo","2-person transfer","Memory care unit"]}
  reasoning="Accepts insulin-dependent residents; memory wing has 2 open beds."
  state="match" date="2026-08-18" />

<MatchPlate name="Cedarview Manor" state="confirm" confirmItem="wander guard availability"
  reasoning="everything else fits" figures={["$4,200/mo"]} date="2026-08-02" />

<MatchPlate name="Riverside Commons" state="unknown" reasoning="No survey data on record" />
```
