A physical date stamp, not a status badge — crisp/dark when fresh, fading with age, flips to amber "UNCONFIRMED" past 21 days. Requires a `@keyframes lnh-stamp-land` defined once per page (rotate + overshoot, 180ms) and respects `prefers-reduced-motion`.

```jsx
<StaleStamp date="2026-08-10" />
<StaleStamp date="2026-07-01" />          // ages into UNCONFIRMED
<StaleStamp date="2026-08-19" justConfirmed />  // plays the landing animation
```
