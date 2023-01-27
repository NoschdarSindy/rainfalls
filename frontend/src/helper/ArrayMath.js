export const sort = (arr, prop) => arr.sort((a, b) => a[prop] - b[prop]);

export const sum = (arr, prop) => arr.reduce((a, b) => a + b[prop], 0);

export const mean = (arr, prop) => sum(arr, prop) / arr.length;

export const quantile = (arr, prop, q) => {
  arr = arr.slice();
  const sorted = sort(arr, prop);
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1]) {
    return (
      sorted[base][prop] + rest * (sorted[base + 1][prop] - sorted[base][prop])
    );
  } else {
    return sorted[base][prop];
  }
};

export const outlier = (arr, prop, q) => {
  arr = arr.slice();
  const sorted = sort(arr, prop);
  const pos = (sorted.length - 1) * q;
  return sorted.slice(pos, sorted.length);
};

export const chunks = (arr, length) => {
  arr = arr.slice();
  const result = [];
  for (let i = 0; i < length; i++) {
    result.push(
      arr.slice((i * arr.length) / length, ((i + 1) * arr.length) / length)
    );
  }

  return result;
};
