export function evaluateWorkModePolicyCompliance(
  homePct: number,
  officePct: number,
  policyHomePct = 40,
  tolerance = 5, // acceptable +/- range
) {
  let chartSummary: string;
  if (homePct > policyHomePct + tolerance) {
    chartSummary = 'Remote days is above average';
  } else {
    chartSummary = 'Within average work mode ratio';
  }

  const note = `Office: ${officePct.toFixed(0)}% | Home: ${homePct.toFixed(0)}%`;

  return { chartSummary, note };
}
