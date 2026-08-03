import type { NoteElement } from '@/models/Element';

export type MovableMarkKey =
  'fthora' | 'secondaryFthora' | 'tertiaryFthora' | 'koronis' | 'ison';

export interface NoteMarkOffset {
  x: number | null;
  y: number | null;
}

// The mapped type pins each entry to its own mark's field names, and the
// indexed accesses below pin those names to real NoteElement fields, so a
// renamed or missing field is a compile error.
const noteMarkOffsetKeys: {
  [Mark in MovableMarkKey]: {
    authoredX: `${Mark}OffsetX`;
    authoredY: `${Mark}OffsetY`;
    computedX: `computed${Capitalize<Mark>}OffsetX`;
    computedY: `computed${Capitalize<Mark>}OffsetY`;
  };
} = {
  fthora: {
    authoredX: 'fthoraOffsetX',
    authoredY: 'fthoraOffsetY',
    computedX: 'computedFthoraOffsetX',
    computedY: 'computedFthoraOffsetY',
  },
  secondaryFthora: {
    authoredX: 'secondaryFthoraOffsetX',
    authoredY: 'secondaryFthoraOffsetY',
    computedX: 'computedSecondaryFthoraOffsetX',
    computedY: 'computedSecondaryFthoraOffsetY',
  },
  tertiaryFthora: {
    authoredX: 'tertiaryFthoraOffsetX',
    authoredY: 'tertiaryFthoraOffsetY',
    computedX: 'computedTertiaryFthoraOffsetX',
    computedY: 'computedTertiaryFthoraOffsetY',
  },
  koronis: {
    authoredX: 'koronisOffsetX',
    authoredY: 'koronisOffsetY',
    computedX: 'computedKoronisOffsetX',
    computedY: 'computedKoronisOffsetY',
  },
  ison: {
    authoredX: 'isonOffsetX',
    authoredY: 'isonOffsetY',
    computedX: 'computedIsonOffsetX',
    computedY: 'computedIsonOffsetY',
  },
};

export function getAuthoredNoteMarkOffset(
  noteElement: NoteElement,
  markKey: MovableMarkKey,
): NoteMarkOffset {
  const keys = noteMarkOffsetKeys[markKey];

  return { x: noteElement[keys.authoredX], y: noteElement[keys.authoredY] };
}

export function setComputedNoteMarkOffset(
  noteElement: NoteElement,
  markKey: MovableMarkKey,
  offset: NoteMarkOffset,
) {
  const keys = noteMarkOffsetKeys[markKey];

  noteElement[keys.computedX] = offset.x;
  noteElement[keys.computedY] = offset.y;
}

export function getEffectiveNoteMarkOffset(
  noteElement: NoteElement,
  markKey: MovableMarkKey,
): NoteMarkOffset {
  const keys = noteMarkOffsetKeys[markKey];

  return {
    x: noteElement[keys.computedX] ?? noteElement[keys.authoredX],
    y: noteElement[keys.computedY] ?? noteElement[keys.authoredY],
  };
}
