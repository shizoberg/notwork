export type MatchQualityGroup = {
  id: string;
  name: string;
  eventId: string;
  date: string;
  round: number;
  ruleScore: number;
  direct: number[];
  eventRatings: number[];
  training: number[];
  prediction?: number;
};

const mean = (values: number[]) => values.reduce((sum, n) => sum + n, 0) / values.length;
const features = (row: MatchQualityGroup) => [
  Math.log1p(Math.max(0, row.ruleScore)),
  Math.log1p(row.round),
];

function fit(rows: MatchQualityGroup[]) {
  const inputs = rows.map(features);
  const targets = rows.map((row) => mean(row.training));
  const centers = [mean(inputs.map((row) => row[0])), mean(inputs.map((row) => row[1]))];
  const scales = centers.map(
    (center, j) => Math.sqrt(mean(inputs.map((row) => (row[j] - center) ** 2))) || 1,
  );
  const centerY = mean(targets);
  let xx = 1,
    yy = 1,
    xy = 0,
    xt = 0,
    yt = 0;
  inputs.forEach((input, i) => {
    const x = (input[0] - centers[0]) / scales[0];
    const y = (input[1] - centers[1]) / scales[1];
    xx += x * x;
    yy += y * y;
    xy += x * y;
    xt += x * (targets[i] - centerY);
    yt += y * (targets[i] - centerY);
  });
  const determinant = xx * yy - xy * xy;
  const slopes = [(yy * xt - xy * yt) / determinant, (xx * yt - xy * xt) / determinant];
  return {
    baseline: centerY,
    predict(row: MatchQualityGroup) {
      const values = features(row);
      const result =
        centerY +
        slopes.reduce((sum, slope, j) => sum + (slope * (values[j] - centers[j])) / scales[j], 0);
      return Math.min(5, Math.max(1, result));
    },
  };
}

export function assessMatchQuality(groups: MatchQualityGroup[]) {
  const eligible = groups
    .filter((row) => row.training.length)
    .sort((a, b) => a.date.localeCompare(b.date));
  const eventIds = [...new Set(eligible.map((row) => row.eventId))];
  const latestEvent = eventIds.at(-1);
  const training = eligible.filter((row) => row.eventId !== latestEvent);
  const holdout = eligible.filter((row) => row.eventId === latestEvent);
  const enough = training.length >= 20 && holdout.length >= 5;
  const fitted = enough ? fit(training) : null;
  const mae = fitted
    ? mean(holdout.map((row) => Math.abs(fitted.predict(row) - mean(row.training))))
    : null;
  const baselineMae = fitted
    ? mean(holdout.map((row) => Math.abs(fitted.baseline - mean(row.training))))
    : null;
  const validated = mae !== null && baselineMae !== null && mae < baselineMae;
  const model = validated ? fit(eligible) : null;
  return {
    model: {
      eligibleGroups: eligible.length,
      trainingGroups: training.length,
      holdoutGroups: holdout.length,
      mae,
      baselineMae,
      validated,
    },
    groups: groups.map(({ training: _training, ...group }) => ({
      ...group,
      prediction: model?.predict({ ...group, training: [] }),
    })),
  };
}
