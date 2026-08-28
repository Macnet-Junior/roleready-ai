# RoleReady — Accessibility (a11y) Guide

## Target: WCAG 2.1 Level AA

---

## Keyboard Navigation

```
Every interactive element must be reachable via Tab:
- Tab → move forward
- Shift+Tab → move backward
- Enter/Space → activate buttons and links
- Arrow keys → navigate within groups (tabs, menus, dropdowns)
- Escape → close modals, cancel actions

Skip link (first element on page):
"Skip to main content" → jumps past navigation
```

## Color Contrast

```
Minimum ratios (AA):
- Normal text: 4.5:1 against background
- Large text (18px+ bold, 24px+ regular): 3:1
- UI components (borders, icons): 3:1

Our palette check:
- Text #0F172A on #F8FAFC bg = 15.4:1 ✅
- Text #64748B on #F8FAFC bg = 4.6:1 ✅
- Text #94A3B8 on #F8FAFC bg = 3.1:1 ⚠️ (large text only)
- Blue #2563EB on white = 4.6:1 ✅
- Green #10B981 on white = 3.4:1 ⚠️ (large text only)
- Red #F43F5E on white = 4.1:1 ✅

Rule: Never use color alone to convey information.
Always pair with text, icon, or pattern.
```

## ARIA Labels

```html
<!-- Buttons without visible text -->
<button aria-label="Close dialog">✕</button>
<button aria-label="Delete application">🗑️</button>
<button aria-label="Next page">→</button>

<!-- Form inputs -->
<label for="email">Email</label>
<input id="email" type="email" aria-describedby="email-hint email-error">
<span id="email-hint">We'll send verification to this address</span>
<span id="email-error" role="alert">Email is required</span>

<!-- Live regions (dynamic content) -->
<div aria-live="polite" aria-atomic="true">
  <!-- Score updates, status changes -->
  Your resume score is 82 out of 100
</div>

<!-- Modals -->
<div role="dialog" aria-modal="true" aria-labelledby="dialog-title">
  <h2 id="dialog-title">Delete Application?</h2>
</div>

<!-- Progress -->
<div role="progressbar" aria-valuenow="73" aria-valuemin="0" aria-valuemax="100">
  73% complete
</div>
```

## Screen Reader Announcements

```
Page load:     "RoleReady — Dashboard. Good afternoon, Mac."
Score update:  "Resume score updated. 82 out of 100."
Error:         "Error. Email is required." (role="alert")
Success:       "Resume saved successfully." (aria-live="polite")
Loading:       "Loading resume analysis..." (aria-busy="true")
Empty state:   "No applications yet. Start by matching to a job."
```

## Focus Management

```
- Modal opens → focus moves to modal
- Modal closes → focus returns to trigger
- Page navigation → focus moves to main heading
- Error occurs → focus moves to error message
- Delete confirmation → focus moves to cancel button (safe default)
```

## Images

```
Informative images: alt="Resume score showing 82 out of 100"
Decorative images:  alt="" (empty alt, screen reader skips)
Complex images:     aria-describedby linking to detailed description
Icons in buttons:   aria-label on button (icon doesn't need alt)
```

## Forms

```
- Every input has a visible label (not just placeholder)
- Error messages linked via aria-describedby
- Required fields marked with aria-required="true"
- Invalid fields marked with aria-invalid="true"
- Group related fields with <fieldset> and <legend>
- Autocomplete attributes for common fields
```

## Motion

```
- Respect prefers-reduced-motion
- No auto-playing animations > 5 seconds
- No flashing content (seizure risk)
- Provide pause/stop for any animated content
```

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Testing Checklist

```
□ All pages pass axe-core automated scan
□ Full keyboard navigation (no keyboard traps)
□ Screen reader test (VoiceOver on Mac, NVDA on Windows)
□ Zoom to 200% without content loss
□ Color contrast verified with WebAIM checker
□ Focus indicators visible on all interactive elements
□ Form errors announced to screen readers
□ Dynamic content updates announced
□ Skip link works on every page
□ Reduced motion respected
```