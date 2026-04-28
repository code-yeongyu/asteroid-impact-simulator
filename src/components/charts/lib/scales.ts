import { scaleLog, scaleLinear } from '@visx/scale';

export const createDiameterScale = (width: number) =>
  scaleLog<number>({
    range: [0, width],
    domain: [1, 20000], // 1m to 20km
  });

export const createVelocityScale = (width: number) =>
  scaleLinear<number>({
    range: [0, width],
    domain: [11, 80], // 11 to 80 km/s
  });

export const createEnergyScale = (height: number) =>
  scaleLog<number>({
    range: [height, 0],
    domain: [1e9, 1e25], // 1 GJ to 10 YJ
  });
