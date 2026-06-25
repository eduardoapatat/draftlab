import type { Champion } from '../types/champion';
import { championImageUrl } from '../lib/ddragon';

interface CardButtonProps {
  imageUrl: string;
  label: string;
  disabled: boolean;
  onClick: () => void;
}

export function CardButton({
  imageUrl,
  label,
  disabled,
  onClick,
}: CardButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="group flex flex-col items-center text-gold w-full enabled:hover:cursor-pointer disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed"
    >
      <div className="overflow-hidden size-24 bg-neutral-900 border border-gold/40 rounded-xs transition-shadow duration-300 group-enabled:group-hover:shadow-[0_0_16px_3px_rgba(200,168,116,0.5)]">
        <img
          src={imageUrl}
          alt={label}
          className="size-24 transition-transform duration-300 group-enabled:group-hover:scale-110"
        />
      </div>
      <p className="text-sm font-extralight">{label}</p>
    </button>
  );
}

interface ChampionCardProps {
  champion: Champion;
  disabled: boolean;
  onSelect: (ddragonId: string) => void;
}

export function ChampionCard({ champion, disabled, onSelect }: ChampionCardProps) {
  return (
    <CardButton
      imageUrl={championImageUrl(champion.ddragonId)}
      label={champion.name}
      disabled={disabled}
      onClick={() => onSelect(champion.ddragonId)}
    />
  );
}
