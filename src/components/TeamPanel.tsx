import { useState } from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PickSlot } from './PickSlot';
import type { Team } from '../lib/draft';
import { t } from '../lib/i18n';

const LANES = [
  t('lane.top'),
  t('lane.jungle'),
  t('lane.mid'),
  t('lane.bot'),
  t('lane.support'),
];
const PICK_LABELS = [1, 2, 3, 4, 5].map((n) => t('pick.n', { n }));

interface TeamPanelProps {
  picks: (string | null)[];
  order: number[];
  side: Team;
  editable: boolean;
  showLanes: boolean;
  onReorder: (order: number[]) => void;
}

export function TeamPanel({
  picks,
  order,
  side,
  editable,
  showLanes,
  onReorder,
}: TeamPanelProps) {
  if (editable) {
    return (
      <EditablePanel
        picks={picks}
        order={order}
        side={side}
        showLanes={showLanes}
        onReorder={onReorder}
      />
    );
  }

  return (
    <div className="flex flex-col w-92 space-y-2">
      {buildRows(order, picks, showLanes).map((r) => (
        <div key={r.pickIndex} className={r.gapBefore ? 'mt-6' : undefined}>
          <PickSlot playerName={r.label} ddragonId={r.ddragonId} side={side} />
        </div>
      ))}
    </div>
  );
}

function EditablePanel({
  picks,
  order,
  side,
  showLanes,
  onReorder,
}: Omit<TeamPanelProps, 'editable'>) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } })
  );
  const [localOrder, setLocalOrder] = useState(order);
  const [syncedOrder, setSyncedOrder] = useState(order);

  if (order !== syncedOrder) {
    setSyncedOrder(order);
    setLocalOrder(order);
  }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = localOrder.indexOf(Number(active.id));
    const to = localOrder.indexOf(Number(over.id));
    const next = arrayMove(localOrder, from, to);
    setLocalOrder(next);
    onReorder(next);
  }

  const rows = buildRows(localOrder, picks, showLanes);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={localOrder}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col w-96 space-y-2">
          {rows.map((r) => (
            <div key={r.pickIndex} className={r.gapBefore ? 'mt-6' : undefined}>
              <SortableRow
                id={r.pickIndex}
                label={r.label}
                ddragonId={r.ddragonId}
                side={side}
              />
            </div>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function buildRows(
  order: number[],
  picks: (string | null)[],
  showLanes: boolean
) {
  return order.map((pickIndex, pos) => ({
    pickIndex,
    label: showLanes ? LANES[pos] : PICK_LABELS[pos],
    ddragonId: picks[pickIndex] ?? null,
    gapBefore: pos === 3,
  }));
}

interface SortableRowProps {
  id: number;
  label: string;
  ddragonId: string | null;
  side: Team;
}

function SortableRow({ id, label, ddragonId, side }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        transition: isDragging ? undefined : transition,
        opacity: isDragging ? 0.6 : 1,
        zIndex: isDragging ? 10 : undefined,
      }}
      className="cursor-grab touch-none active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      <PickSlot playerName={label} ddragonId={ddragonId} side={side} />
    </div>
  );
}
