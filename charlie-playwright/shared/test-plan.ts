export function testPlan(document: string, version: string) {
  return (caseId: string) => ({ type: 'Manual test plan', description: `${document}, version ${version}, ${caseId}` });
}
