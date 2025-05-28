const colors: string[] = [
  '#ff7700',
  '#ff0072',
  '#ff00e4',
  '#ae00ff',
  '#6000ff',
  '#00a2ff',
  '#1874ff',
  '#00ff90',
  '#ffc600',
  '#ff594d',
  '#ff66f6',
  '#00ccff',
];

const getColorIndex = (seed: string): string => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export { colors, getColorIndex };
