/**
 * Turns text such as "Priority and reason", "1 month" or "neededBy" into part of a test ID:
 * "priority-and-reason", "1-month", "needed-by". Test IDs are lowercase words joined by hyphens.
 */
export function testIdPart(text: string): string {
  return text
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
