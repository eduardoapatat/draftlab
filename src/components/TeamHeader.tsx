import { TEAM_STYLES } from '../lib/teamColors';

interface TeamHeaderProps {
  position: 'right' | 'left';
  team: 'blue' | 'red';
  name: string;
  timer: string;
}

export function TeamHeader({ position, team, name, timer }: TeamHeaderProps) {
  const isLeft = position === 'left';
  const bg = TEAM_STYLES[team].plate;

  const namePlateClip = isLeft
    ? '[clip-path:polygon(0_0,calc(100%_-_20px)_0,100%_100%,0_100%)]'
    : '[clip-path:polygon(20px_0,100%_0,100%_100%,0_100%)]';

  const timerClip = isLeft
    ? '[clip-path:polygon(0_0,calc(100%_-_20px)_0,100%_100%,20px_100%)]'
    : '[clip-path:polygon(20px_0,100%_0,calc(100%_-_20px)_100%,0_100%)]';

  const namePlate = (
    <div className={`${namePlateClip} ${bg} w-full h-16`}>
      <div
        className={`flex w-full items-center h-full ${
          isLeft ? 'justify-end pr-24' : 'justify-start pl-24'
        }`}
      >
        <p className="text-3xl">{name}</p>
      </div>
    </div>
  );

  const timerBox = (
    <div className={`${timerClip} ${bg} w-40 h-16`}>
      <div className="flex w-full items-center justify-center h-full">
        <p className="text-3xl">{timer ? `:${timer}` : ''}</p>
      </div>
    </div>
  );

  return (
    <div className="flex [&>div+div]:-ml-4 w-full">
      {isLeft ? (
        <>
          {namePlate}
          {timerBox}
        </>
      ) : (
        <>
          {timerBox}
          {namePlate}
        </>
      )}
    </div>
  );
}
