import { ParentSize } from '@visx/responsive';
import { EnergyVsDiameter } from './EnergyVsDiameter';
import { EnergyVsVelocity } from './EnergyVsVelocity';

interface EnergyCurvesProps {
  currentDiameter: number;
  currentVelocity: number;
  currentEnergy: number;
}

export default function EnergyCurves({ currentDiameter, currentVelocity, currentEnergy }: EnergyCurvesProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 w-full h-[300px] md:h-[400px]">
      <div className="flex-1 h-full min-h-[200px]">
        <ParentSize>
          {({ width, height }) => (
            <EnergyVsDiameter
              width={width}
              height={height}
              currentDiameter={currentDiameter}
              currentEnergy={currentEnergy}
            />
          )}
        </ParentSize>
      </div>
      <div className="flex-1 h-full min-h-[200px]">
        <ParentSize>
          {({ width, height }) => (
            <EnergyVsVelocity
              width={width}
              height={height}
              currentVelocity={currentVelocity}
              currentEnergy={currentEnergy}
            />
          )}
        </ParentSize>
      </div>
    </div>
  );
}
