import { NapBox } from '../types';
import { NapBoxCard } from './NapBoxCard';

export function NapBoxesGrid({
  napBoxes,
  onViewPorts,
}: {
  napBoxes: NapBox[];
  onViewPorts: (napBox: NapBox) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {napBoxes.map((nap) => (
        <NapBoxCard
          key={nap.id}
          napBox={nap}
          onViewPorts={() => onViewPorts(nap)}
        />
      ))}
    </div>
  );
}
