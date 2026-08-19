Signage-style button for calls to action; use primary sparingly (one per view), secondary for supporting actions, ghost for inline text links.

```jsx
<Button variant="primary">Call (513) 555-0134</Button>
<Button variant="secondary" size="sm">Email us</Button>
<Button variant="ghost" as="a" href="#form">Send a message</Button>
```

Variants: `primary` (filled ink plate, offset shadow, presses flat), `secondary` (outlined), `ghost` (underlined inline link, no plate). Avoid sales language in children — this brand never says "Get Started" or "Free Consultation".
