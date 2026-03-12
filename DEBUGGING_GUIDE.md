# Playwright Test Debugging Guide

## Option 1: Run Tests with Playwright Inspector (RECOMMENDED)

The Playwright Inspector opens automatically and lets you step through your test line-by-line with a live browser.

### Command:
```bash
npx playwright test e2e/Estimate_Verified_Flow.spec.ts --debug
```

Or use the shortcut scripts:
```bash
npm run test:debug:estimate
npm run test:debug:main
```

### What Opens:
1. **Playwright Inspector** - Shows test code with step-through debugging
2. **Browser Window** - Shows live page state
3. **DevTools** - For inspecting elements

### How to Use:
- **Step Over** (▶️): Execute the next line
- **Pause/Resume** (⏸️): Pause at current step
- **Step Into**: Go inside function calls
- **Continue**: Run until next breakpoint
- **Click elements** in the Inspector to see them highlighted in browser

---

## Option 2: Add Manual Pause Points

Add `page.pause()` at specific points in your test to break execution:

```typescript
async function addAudienceFor_VerifiedFlow(page: Page, ...) {
  await page.getByRole('button', { name: 'Create First Audience', exact: true }).click();
  await page.getByRole('textbox', { name: 'Audience Name *' }).click();
  await page.getByRole('textbox', { name: 'Audience Name *' }).fill(...);
  
  // Pause here to inspect the page
  await page.pause();
  
  await page.getByRole('textbox', { name: 'Audience Description' }).click();
  // ... rest of function
}
```

Then run normally:
```bash
npx playwright test e2e/Estimate_Verified_Flow.spec.ts --headed
```

The test will pause at each `page.pause()` call and open the Inspector.

---

## Option 3: View Recorded Traces (After Test Completes)

If a test fails, traces are automatically recorded. View them:

```bash
npx playwright show-report
```

Then click on a test to see:
- Step-by-step trace
- Network calls
- Console logs
- Screenshots at each step
- Full DOM state

---

## Useful Playwright Inspector Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `F10` | Step over |
| `F11` | Step into |
| `Shift+F11` | Step out |
| `F5` or `F8` | Resume/Continue |
| `Ctrl+Shift+P` | Open command palette |

---

## Quick Start Commands

```bash
# Debug main test
npm run test:debug:main

# Debug estimate flow test  
npm run test:debug:estimate

# View recorded traces
npm run test:trace

# Run with video recording
npx playwright test e2e/Estimate_Verified_Flow.spec.ts --headed

# Run with headed browser visible
npx playwright test e2e/Estimate_Verified_Flow.spec.ts --headed
```

---

## Troubleshooting

### Inspector window doesn't open:
- Ensure you're using `--debug` flag
- Check that no other processes are using the Inspector port
- Try running as Administrator

### `page.pause()` not working:
- Make sure it's `page.pause()` not `page.Pause()` (case-sensitive)
- Ensure the test is run with `--headed` flag
- Check that you're waiting for the pause to complete: `await page.pause()`

### Can't find elements in Inspector:
- Click the **Pick Locator** button (🎯) in the Inspector
- Click on the element in the browser
- The Inspector will show you the selector
- Copy it into your test code

---

## Best Practices for Debugging

1. **Use `--debug` flag for interactive debugging** - Step through code line-by-line
2. **Add `page.pause()` only at critical points** - Before important actions
3. **Use Inspector Pick Tool** - Click elements to automatically generate selectors
4. **Check console logs** - Inspector shows all console output
5. **Review trace recordings** - For understanding failures after they occur

