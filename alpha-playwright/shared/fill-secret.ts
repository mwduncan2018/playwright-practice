import type { Locator } from '@playwright/test';

export async function fillSecret(secretField: Locator, secret: string): Promise<void> {
  await secretField.click();
  await secretField.evaluate((inputElement: HTMLInputElement, secretValue) => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(inputElement, secretValue);
    inputElement.dispatchEvent(new Event('input', { bubbles: true }));
    inputElement.dispatchEvent(new Event('change', { bubbles: true }));
  }, secret);
}
