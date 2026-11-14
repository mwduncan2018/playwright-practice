import type { Locator } from '@playwright/test';

/**
 * Types a secret, such as a password, into a field without it showing in the test report: fill()
 * would show it in its step's title, as Fill "<the password>". This clicks the field as a person
 * would, then sets its value through the browser's own setter and sends an input event, so plain
 * forms and frameworks such as React both take it.
 *
 * A trace still records the secret, since it records what's typed and sent. So a test that types
 * one turns its trace off: test.use({ trace: 'off' }).
 */
export async function fillSecret(field: Locator, secret: string): Promise<void> {
  await field.click();
  await field.evaluate((input: HTMLInputElement, value) => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, secret);
}
