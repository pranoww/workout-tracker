# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke.test.js >> Critical Smoke Test & Auth UI >> Email submission validation and error handling
- Location: tests\e2e\smoke.test.js:17:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /Enter your code/i }).or(locator('.text-red-400'))
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('heading', { name: /Enter your code/i }).or(locator('.text-red-400')) with timeout 5000ms
  - waiting for getByRole('heading', { name: /Enter your code/i }).or(locator('.text-red-400'))

```

```yaml
- main:
  - text: F Fitness Tracker
  - paragraph: Train smarter
  - heading "Build consistency. Track progress. Get stronger." [level=1]
  - paragraph: Your workouts, progress and personalized recommendations in one place.
  - paragraph: "01"
  - paragraph: Profile
  - paragraph: "02"
  - paragraph: Workout
  - paragraph: "03"
  - paragraph: Progress
  - paragraph: Your training journey starts here.
  - paragraph: Welcome back
  - heading "Sign in to your account" [level=2]
  - paragraph: Enter your email and we'll send you a verification code.
  - text: Email address
  - textbox "Email address":
    - /placeholder: you@example.com
    - text: test@example.com
  - button "Sending code..." [disabled]
  - text: PASSWORDLESS
  - paragraph: No password required. We'll securely verify your email with a one-time code.
  - paragraph: By continuing, you agree to our Terms and Privacy Policy.
- alert
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Critical Smoke Test & Auth UI', () => {
  4  |   test('Application loads and login page renders', async ({ page }) => {
  5  |     // 1. Open /
  6  |     await page.goto('/');
  7  | 
  8  |     // 2. Verify login page renders
  9  |     await expect(page).toHaveTitle(/PulseFit/i);
  10 |     
  11 |     // 3. Verify the expected authentication UI is visible
  12 |     await expect(page.getByRole('heading', { name: /Sign in to your account/i })).toBeVisible();
  13 |     await expect(page.getByLabel(/Email address/i)).toBeVisible();
  14 |     await expect(page.getByRole('button', { name: /Continue with email/i })).toBeVisible();
  15 |   });
  16 | 
  17 |   test('Email submission validation and error handling', async ({ page }) => {
  18 |     await page.goto('/');
  19 | 
  20 |     // Try submitting without email
  21 |     await page.getByRole('button', { name: /Continue with email/i }).click();
  22 |     await expect(page.getByText(/Please enter your email address/i)).toBeVisible();
  23 | 
  24 |     // Test with email (this should transition to the OTP step, but we won't bypass backend OTP)
  25 |     await page.getByLabel(/Email address/i).fill('test@example.com');
  26 |     await page.getByRole('button', { name: /Continue with email/i }).click();
  27 | 
  28 |     // Verify switch to OTP input step OR verify an error is shown (since backend might be mocked/unavailable in CI)
  29 |     const otpHeading = page.getByRole('heading', { name: /Enter your code/i });
  30 |     const errorMessage = page.locator('.text-red-400');
  31 |     
> 32 |     await expect(otpHeading.or(errorMessage)).toBeVisible();
     |                                               ^ Error: expect(locator).toBeVisible() failed
  33 | 
  34 |     if (await otpHeading.isVisible()) {
  35 |       // Verify OTP validation (submitting empty or short code)
  36 |       await page.getByRole('button', { name: /Verify & continue/i }).click();
  37 |       await expect(page.getByText(/Please enter the 6-digit verification code/i)).toBeVisible();
  38 |     }
  39 |   });
  40 | 
  41 |   // Note: We cannot safely automate the actual OTP verification step in this environment
  42 |   // without hardcoding OTPs or bypassing the backend architecture.
  43 |   // The OTP verification, Dashboard navigation, Exercises, Workout Execution, 
  44 |   // and Progress flow require a safe authenticated context which is missing in the CI environment.
  45 |   // These steps require MANUAL VERIFICATION.
  46 | });
  47 | 
```