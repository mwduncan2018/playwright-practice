/**
 * Links tests to their cases in a manual test plan. The annotation shows in the HTML report, so a
 * reviewer can see which plan, and which version of it, a test follows.
 *
 *   const plan = testPlan('Super Catalog Manual Test Plan', '1.0');
 *   test('SC-001 Sign in and sign out', { annotation: plan('SC-001') }, async () => { ... });
 */
export function testPlan(document: string, version: string) {
  return (caseId: string) => ({ type: 'Manual test plan', description: `${document}, version ${version}, ${caseId}` });
}
