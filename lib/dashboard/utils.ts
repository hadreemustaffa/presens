export function evaluateWorkModePolicyCompliance(
  homePct: number,
  officePct: number,
  policyHomePct = 40,
  policyOfficePct = 60,
  tolerance = 5, // acceptable +/- range
) {
  const officeDelta = Math.abs(officePct - policyOfficePct);
  const homeDelta = Math.abs(homePct - policyHomePct);

  let chartSummary: string;
  if (officeDelta <= tolerance && homeDelta <= tolerance) {
    chartSummary = 'Aligned with 60/40 policy';
  } else if (officePct > policyOfficePct + tolerance) {
    chartSummary = 'More onsite days than policy allows';
  } else if (homePct > policyHomePct + tolerance) {
    chartSummary = 'More remote days than policy allows';
  } else {
    chartSummary = 'Work mode ratio slightly off policy target';
  }

  const note = `Office: ${officePct.toFixed(0)}% | Home: ${homePct.toFixed(0)}%`;

  return { chartSummary, note };
}
