import type { Box, InputItem, Penalty } from 'tex-linebreak';
import { MAX_COST } from 'tex-linebreak';
import { describe, expect, it } from 'vitest';

import type { ScoreElement } from '../models/Element';
import {
  MartyriaElement,
  NoteElement,
  TempoElement,
  TextBoxElement,
} from '../models/Element';
import {
  Fthora,
  GorgonNeume,
  Ison,
  QuantitativeNeume,
  restNeumes,
} from '../models/Neumes';
import { Line, Page } from '../models/Page';
import { PageSetup } from '../models/PageSetup';
import { Scale } from '../models/Scales';
import { LayoutService } from './LayoutService';
const itif = (condition: boolean) => (condition ? it : it.skip);

describe('LayoutService.calculateMartyriae', () => {
  it('applies an attached quantitative-neume fthora after its interval', () => {
    const martyria = new MartyriaElement();
    martyria.auto = false;
    martyria.alignRight = true;
    martyria.quantitativeNeume = QuantitativeNeume.OligonPlusKentimaAbove;
    martyria.quantitativeNeumeFthora = Fthora.Zygos_Top;

    const nextMartyria = new MartyriaElement();

    LayoutService.calculateMartyriae([martyria, nextMartyria], new PageSetup());

    expect(martyria.quantitativeNeumeFthora).toBe(Fthora.Zygos_Top);
    expect(martyria.quantitativeNeumeFthoraCarry).toBeNull();
    expect(nextMartyria.scale).toBe(Scale.Zygos);
  });
});

describe.each([true, false])(
  'LayoutService.findFinalAndNextElement',
  (isHyphen) => {
    it(`works for adjacent melismas (no next) [isHyphen=${isHyphen}]`, () => {
      const melismaStart = new NoteElement();
      melismaStart.isHyphen = isHyphen;
      melismaStart.isMelisma = true;
      melismaStart.isMelismaStart = true;

      const expectedFinalElement = new NoteElement();
      expectedFinalElement.isMelisma = true;

      const element = melismaStart;
      const line = getLine(melismaStart, expectedFinalElement);
      const firstElementOnNextLine = null;

      const { finalElement, nextElement } =
        LayoutService.findFinalAndNextElement(
          line,
          element,
          firstElementOnNextLine,
          1,
        );

      expect(finalElement).toBe(expectedFinalElement);
      expect(nextElement).toBeNull();
    });

    it(`works for adjacent melismas (with next) [isHyphen=${isHyphen}]`, () => {
      const melismaStart = new NoteElement();
      melismaStart.isHyphen = isHyphen;
      melismaStart.isMelisma = true;
      melismaStart.isMelismaStart = true;

      const expectedFinalElement = new NoteElement();
      expectedFinalElement.isMelisma = true;

      const expectedNextElement = new NoteElement();
      expectedNextElement.isMelisma = true;
      expectedNextElement.isMelismaStart = true;

      const element = melismaStart;
      const line = getLine(
        melismaStart,
        expectedFinalElement,
        expectedNextElement,
      );
      const firstElementOnNextLine = null;

      const { finalElement, nextElement } =
        LayoutService.findFinalAndNextElement(
          line,
          element,
          firstElementOnNextLine,
          1,
        );

      expect(finalElement).toBe(expectedFinalElement);
      expect(nextElement).toBe(expectedNextElement);
    });

    it.each([
      { type: 'martyria', expectedNextElement: new MartyriaElement() },
      { type: 'tempo', expectedNextElement: new TempoElement() },
      { type: 'inline text box', expectedNextElement: getInlineTextBox() },
    ])(`skips $type (no next) [isHyphen=${isHyphen}]`, () => {
      const melismaStart = new NoteElement();
      melismaStart.isHyphen = isHyphen;
      melismaStart.isMelisma = true;
      melismaStart.isMelismaStart = true;

      const expectedFinalElement = new NoteElement();
      expectedFinalElement.isMelisma = true;

      const martyria = new MartyriaElement();

      const element = melismaStart;
      const line = getLine(melismaStart, martyria, expectedFinalElement);
      const firstElementOnNextLine = null;

      const { finalElement, nextElement } =
        LayoutService.findFinalAndNextElement(
          line,
          element,
          firstElementOnNextLine,
          1,
        );

      expect(finalElement).toBe(expectedFinalElement);
      expect(nextElement).toBeNull();
    });

    it.each([
      { type: 'martyria', expectedNextElement: new MartyriaElement() },
      { type: 'tempo', expectedNextElement: new TempoElement() },
      { type: 'inline text box', expectedNextElement: getInlineTextBox() },
    ])(`skips $type (with next) [isHyphen=${isHyphen}]`, () => {
      const melismaStart = new NoteElement();
      melismaStart.isHyphen = isHyphen;
      melismaStart.isMelisma = true;
      melismaStart.isMelismaStart = true;

      const martyriaElement = new MartyriaElement();

      const expectedFinalElement = new NoteElement();
      expectedFinalElement.isMelisma = true;

      const expectedNextElement = new NoteElement();
      expectedNextElement.isMelisma = true;
      expectedNextElement.isMelismaStart = true;

      const element = melismaStart;
      const line = getLine(
        melismaStart,
        martyriaElement,
        expectedFinalElement,
        expectedNextElement,
      );
      const firstElementOnNextLine = null;

      const { finalElement, nextElement } =
        LayoutService.findFinalAndNextElement(
          line,
          element,
          firstElementOnNextLine,
          1,
        );

      expect(finalElement).toBe(expectedFinalElement);
      expect(nextElement).toBe(expectedNextElement);
    });

    it.each([
      { type: 'martyria', expectedNextElement: new MartyriaElement() },
      { type: 'tempo', expectedNextElement: new TempoElement() },
      { type: 'inline text box', expectedNextElement: getInlineTextBox() },
    ])(
      `skips $type (with next and consecutive continouous elements) [isHyphen=${isHyphen}]`,
      () => {
        const melismaStart = new NoteElement();
        melismaStart.isHyphen = isHyphen;
        melismaStart.isMelisma = true;
        melismaStart.isMelismaStart = true;

        const martyriaElement = new MartyriaElement();
        const tempoElement = new TempoElement();

        const expectedFinalElement = new NoteElement();
        expectedFinalElement.isMelisma = true;

        const expectedNextElement = new NoteElement();
        expectedNextElement.isMelisma = true;
        expectedNextElement.isMelismaStart = true;

        const element = melismaStart;
        const line = getLine(
          melismaStart,
          martyriaElement,
          tempoElement,
          expectedFinalElement,
          expectedNextElement,
        );
        const firstElementOnNextLine = null;

        const { finalElement, nextElement } =
          LayoutService.findFinalAndNextElement(
            line,
            element,
            firstElementOnNextLine,
            1,
          );

        expect(finalElement).toBe(expectedFinalElement);
        expect(nextElement).toBe(expectedNextElement);
      },
    );

    itif(!isHyphen).each([
      { type: 'martyria', expectedNextElement: new MartyriaElement() },
      { type: 'tempo', expectedNextElement: new TempoElement() },
      { type: 'inline text box', expectedNextElement: getInlineTextBox() },
    ])(
      `skips $type and ends in correct place (with next and consecutive continouous elements) [isHyphen=${isHyphen}]`,
      () => {
        const melismaStart = new NoteElement();
        melismaStart.isHyphen = isHyphen;
        melismaStart.isMelisma = true;
        melismaStart.isMelismaStart = true;

        const expectedNextElement = new TempoElement();
        const martyriaNote = new MartyriaElement();

        const expectedFinalElement = new NoteElement();
        expectedFinalElement.isMelisma = true;

        const newNote = new NoteElement();
        newNote.isMelisma = true;
        newNote.isMelismaStart = true;

        const element = melismaStart;
        const line = getLine(
          melismaStart,
          expectedFinalElement,
          expectedNextElement,
          martyriaNote,
          newNote,
        );
        const firstElementOnNextLine = null;

        const { finalElement, nextElement } =
          LayoutService.findFinalAndNextElement(
            line,
            element,
            firstElementOnNextLine,
            1,
          );

        expect(finalElement).toBe(expectedFinalElement);
        expect(nextElement).toBe(expectedNextElement);
      },
    );

    itif(!isHyphen).each([
      { type: 'martyria', expectedNextElement: new MartyriaElement() },
      { type: 'tempo', expectedNextElement: new TempoElement() },
      { type: 'inline text box', expectedNextElement: getInlineTextBox() },
    ])(`stops at $type [isHyphen=${isHyphen}]`, ({ expectedNextElement }) => {
      const melismaStart = new NoteElement();
      melismaStart.isHyphen = isHyphen;
      melismaStart.isMelisma = true;
      melismaStart.isMelismaStart = true;

      const expectedFinalElement = new NoteElement();
      expectedFinalElement.isMelisma = true;

      const element = melismaStart;
      const line = getLine(
        melismaStart,
        expectedFinalElement,
        expectedNextElement,
        new NoteElement(),
      );
      const firstElementOnNextLine = null;

      const { finalElement, nextElement } =
        LayoutService.findFinalAndNextElement(
          line,
          element,
          firstElementOnNextLine,
          1,
        );

      expect(finalElement).toBe(expectedFinalElement);
      expect(nextElement).toBe(expectedNextElement);
    });
  },
);

describe('LayoutService movable mark collisions', () => {
  const movingBox = { left: 0, right: 1, top: 0, bottom: 1 };
  const lowerObstacle = { left: 0, right: 1, top: 0.8, bottom: 1.8 };

  it.each([
    {
      name: 'stops in a gap below a higher obstacle',
      fixedBoxes: [lowerObstacle, { left: 0, right: 1, top: -2, bottom: -1 }],
      expectedY: -0.25,
    },
    {
      name: 'continues upward when the first move encounters another obstacle',
      fixedBoxes: [
        { left: 0, right: 1, top: -0.8, bottom: -0.2 },
        lowerObstacle,
      ],
      expectedY: -1.85,
    },
    {
      name: 'ignores obstacles outside the horizontal span',
      fixedBoxes: [
        lowerObstacle,
        { left: 1, right: 2, top: -0.8, bottom: -0.3 },
      ],
      expectedY: -0.25,
    },
    {
      name: 'leaves an already clear mark in place',
      fixedBoxes: [{ left: 0, right: 1, top: -2, bottom: -1 }],
      expectedY: null,
    },
    {
      name: 'rechecks a gap closed by font-unit rounding',
      fixedBoxes: [
        { left: 0, right: 1, top: 0.7996, bottom: 1.8 },
        { left: 0, right: 1, top: -1, bottom: -0.3005 },
      ],
      expectedY: -2.05,
    },
  ])('$name', ({ fixedBoxes, expectedY }) => {
    const result = LayoutService['resolveMovableCollisionPlacement'](
      { x: null, y: null },
      [movingBox],
      ['right', 'left'],
      0.05,
      {
        collisionBoxes: [movingBox, ...fixedBoxes],
        fixedBoxes,
        baseBounds: movingBox,
      },
    );

    expect(result).toEqual({ x: null, y: expectedY });
  });

  it('still prefers a sideways move that fits inside the base', () => {
    const fixedBoxes = [{ left: 0, right: 0.2, top: 0, bottom: 1 }];
    const result = LayoutService['resolveMovableCollisionPlacement'](
      { x: null, y: null },
      [movingBox],
      ['right', 'left'],
      0.05,
      {
        collisionBoxes: [movingBox, ...fixedBoxes],
        fixedBoxes,
        baseBounds: { left: 0, right: 2, top: 0, bottom: 1 },
      },
    );

    expect(result).toEqual({ x: 0.25, y: null });
  });
});

describe('LayoutService.alignIsonIndicators', () => {
  it.each([-0.8, -0.6, -0.4, -0.2, 0])(
    'keeps aligned isons clear with a gorgon offset of %s',
    (gorgonOffsetY) => {
      const pageSetup = new PageSetup();
      pageSetup.neumeDefaultFontFamily = 'Neanes';
      const notes = [-0.1, gorgonOffsetY].map((offsetY) => {
        const note = new NoteElement();
        note.quantitativeNeume = QuantitativeNeume.Oligon;
        note.ison = Ison.Unison;
        note.gorgonNeume = GorgonNeume.Gorgon_Top;
        note.gorgonNeumeOffsetY = offsetY;
        return note;
      });
      const page = new Page();
      page.lines = [getLine(...notes)];

      LayoutService.alignIsonIndicators([page], pageSetup);
      LayoutService['resolveAlignedIsonNoteMarkCollisionsForElements'](
        notes,
        pageSetup,
      );

      expect(notes[0].computedIsonOffsetY).toBe(notes[1].computedIsonOffsetY);
      for (const note of notes) {
        const context = LayoutService['getNoteMarkCollisionContext'](
          note,
          pageSetup,
        );
        const placement = LayoutService['getMovableNoteMarkPlacement'](
          note,
          LayoutService['getMovableMarkSpec']('ison'),
          context,
        );

        expect(placement.shiftX).toBe(0);
        expect(placement.shiftY).toBe(0);
        expect(note.isonOffsetY).toBeNull();
      }
    },
  );

  it.each([
    [null, null, 0],
    [-0.05, -0.25, -0.25],
  ])(
    'aligns ison indicators with authored offsets %s and %s',
    (firstY, secondY, expectedY) => {
      const pageSetup = new PageSetup();
      pageSetup.neumeDefaultFontFamily = 'Neanes';

      const note1 = new NoteElement();
      note1.quantitativeNeume = QuantitativeNeume.Ison;
      note1.ison = Ison.Unison;
      note1.isonOffsetY = firstY;

      const note2 = new NoteElement();
      note2.quantitativeNeume = QuantitativeNeume.Oligon;
      note2.ison = Ison.Unison;
      note2.isonOffsetY = secondY;

      const page = new Page();
      page.lines = [getLine(note1, note2)];

      LayoutService.alignIsonIndicators([page], pageSetup);

      // Both glyphs have the same ison anchor in Neanes. Alignment moves both
      // indicators to the higher authored position without changing the source.
      expect(note1.computedIsonOffsetY).toBeCloseTo(expectedY);
      expect(note2.computedIsonOffsetY).toBeCloseTo(expectedY);
      expect(note1.isonOffsetY).toBe(firstY);
      expect(note2.isonOffsetY).toBe(secondY);
    },
  );

  it('leaves notes without ison indicators alone', () => {
    const note = new NoteElement();
    note.ison = null;
    const page = new Page();
    page.lines = [getLine(note)];

    LayoutService.alignIsonIndicators([page], new PageSetup());

    expect(note.computedIsonOffsetY).toBeNull();
  });

  it('handles empty pages', () => {
    const page = new Page();
    page.lines = [];

    expect(() =>
      LayoutService.alignIsonIndicators([page], new PageSetup()),
    ).not.toThrow();
  });
});

describe('LayoutService.applyRuntPenalty', () => {
  it.each(restNeumes)(
    'discourages a break that leaves one %s rest',
    (restNeume) => {
      const { items, notes, breakPenalties } = getRuntPenaltyItems(3);
      notes[2].quantitativeNeume = restNeume;

      LayoutService.applyRuntPenalty(items, null);

      expect(breakPenalties.map((penalty) => penalty.cost)).toEqual([
        0,
        MAX_COST * 0.15,
        0,
      ]);
    },
  );

  it('discourages a break that leaves two notes', () => {
    const { items, notes, breakPenalties } = getRuntPenaltyItems(4);
    notes[2].quantitativeNeume = QuantitativeNeume.VareiaDotted;

    LayoutService.applyRuntPenalty(items, null);

    expect(breakPenalties.map((penalty) => penalty.cost)).toEqual([
      0,
      MAX_COST * 0.15,
      0,
      0,
    ]);
  });

  it('applies the penalty to the end of a melisma', () => {
    const { items, notes, breakPenalties } = getRuntPenaltyItems(3);
    notes[0].isMelisma = true;
    notes[0].isMelismaStart = true;
    notes[1].isMelisma = true;
    notes[2].isMelisma = true;

    LayoutService.applyRuntPenalty(items, null);

    // Only the last note of the melisma qualifies. The two-note breakpoint
    // would begin the final line with notes[1], which is mid-melisma.
    expect(breakPenalties.map((penalty) => penalty.cost)).toEqual([
      0,
      MAX_COST * 0.15,
      0,
    ]);
  });

  it('does not apply the penalty to ordinary notes', () => {
    const { items, breakPenalties } = getRuntPenaltyItems(3);

    LayoutService.applyRuntPenalty(items, null);

    expect(breakPenalties.map((penalty) => penalty.cost)).toEqual([0, 0, 0]);
  });

  it('penalizes a two-note paragraph without reading past the first item', () => {
    const { items, notes, breakPenalties } = getRuntPenaltyItems(2);
    notes[1].quantitativeNeume = QuantitativeNeume.VareiaDotted;

    LayoutService.applyRuntPenalty(items, null);

    expect(breakPenalties.map((penalty) => penalty.cost)).toEqual([
      MAX_COST * 0.15,
      0,
    ]);
  });

  it('leaves a one-note paragraph alone', () => {
    const { items, notes, breakPenalties } = getRuntPenaltyItems(1);
    notes[0].quantitativeNeume = QuantitativeNeume.VareiaDotted;

    LayoutService.applyRuntPenalty(items, null);

    expect(breakPenalties.map((penalty) => penalty.cost)).toEqual([0]);
  });

  it('adds to an existing penalty', () => {
    const { items, notes, breakPenalties } = getRuntPenaltyItems(3);
    notes[2].quantitativeNeume = QuantitativeNeume.VareiaDotted;
    breakPenalties[1].cost = MAX_COST * 0.5;

    LayoutService.applyRuntPenalty(items, null);

    expect(breakPenalties[1].cost).toBe(MAX_COST * 0.65);
  });

  it('caps the total at the worst cost the break rules produce', () => {
    const { items, notes, breakPenalties } = getRuntPenaltyItems(3);
    notes[2].quantitativeNeume = QuantitativeNeume.VareiaDotted;
    breakPenalties[1].cost = MAX_COST * 0.85;

    LayoutService.applyRuntPenalty(items, null);

    expect(breakPenalties[1].cost).toBe(MAX_COST * 0.95);
  });

  it('leaves a breakpoint that is already at the cap alone', () => {
    const { items, notes, breakPenalties } = getRuntPenaltyItems(3);
    notes[2].quantitativeNeume = QuantitativeNeume.VareiaDotted;
    breakPenalties[1].cost = MAX_COST * 0.95;

    LayoutService.applyRuntPenalty(items, null);

    expect(breakPenalties[1].cost).toBe(MAX_COST * 0.95);
  });

  it('does not weaken a prohibited breakpoint', () => {
    const { items, notes, breakPenalties } = getRuntPenaltyItems(3);
    notes[2].quantitativeNeume = QuantitativeNeume.VareiaDotted;
    breakPenalties[1].cost = MAX_COST;

    LayoutService.applyRuntPenalty(items, null);

    expect(breakPenalties[1].cost).toBe(MAX_COST);
  });

  it('does not count a terminal non-note element as a tail element', () => {
    const { items, notes, breakPenalties } = getRuntPenaltyItems(
      3,
      new MartyriaElement(),
    );
    notes[1].quantitativeNeume = QuantitativeNeume.VareiaDotted;
    notes[2].quantitativeNeume = QuantitativeNeume.VareiaDotted;

    LayoutService.applyRuntPenalty(items, null);

    // Were the martyria counted, it would consume a tail slot and the
    // two-note breakpoint would fall one note earlier, leaving this one at 0.
    expect(breakPenalties.map((penalty) => penalty.cost)).toEqual([
      MAX_COST * 0.15,
      MAX_COST * 0.15,
      0,
    ]);
  });

  it('sees through a non-note box between the tail notes', () => {
    const { items, notes, breakPenalties } = getRuntPenaltyItems(
      3,
      undefined,
      new TempoElement(),
    );
    notes[1].quantitativeNeume = QuantitativeNeume.VareiaDotted;
    notes[2].quantitativeNeume = QuantitativeNeume.VareiaDotted;

    LayoutService.applyRuntPenalty(items, null);

    // Were the tempo counted, it would consume a tail slot and the walk would
    // stop one note earlier, leaving the two-note breakpoint at 0.
    expect(breakPenalties.map((penalty) => penalty.cost)).toEqual([
      MAX_COST * 0.15,
      MAX_COST * 0.15,
      0,
    ]);
  });

  it('leaves the martyria breakpoint itself unpenalized', () => {
    const { items, notes, terminalBreakPenalty } = getRuntPenaltyItems(
      3,
      new MartyriaElement(),
    );
    notes[2].quantitativeNeume = QuantitativeNeume.VareiaDotted;

    LayoutService.applyRuntPenalty(items, null);

    // The martyria's breakpoint is preceded by its pre-break glue rather than
    // a note box, so the rule does not reach it even though breaking there
    // would strand the trailing rest.
    expect(terminalBreakPenalty!.cost).toBe(0);
  });
});

describe('LayoutService.mayShowLeadingLyricHyphen', () => {
  it('suppresses Greek start hyphens when Greek melismata are enabled', () => {
    const pageSetup = getMockPageSetup();

    const note = new NoteElement();
    note.isHyphen = true;
    note.lyrics = 'τω';

    expect(LayoutService.mayShowLeadingLyricHyphen(note, pageSetup)).toBe(
      false,
    );
  });

  it('suppresses Greek continuation hyphens when Greek melismata are enabled', () => {
    const pageSetup = getMockPageSetup();

    const note = new NoteElement();
    note.isHyphen = true;
    note.isMelisma = true;
    note.lyrics = '';

    expect(LayoutService.mayShowLeadingLyricHyphen(note, pageSetup, true)).toBe(
      false,
    );
  });

  it('allows non-Greek hyphens', () => {
    const pageSetup = getMockPageSetup();

    const note = new NoteElement();
    note.isHyphen = true;
    note.lyrics = 'test';

    expect(LayoutService.mayShowLeadingLyricHyphen(note, pageSetup)).toBe(true);
  });

  it('allows Greek hyphens when Greek melismata are disabled', () => {
    const pageSetup = getMockPageSetup();
    pageSetup.disableGreekMelismata = true;

    const note = new NoteElement();
    note.isHyphen = true;
    note.lyrics = 'τω';

    expect(LayoutService.mayShowLeadingLyricHyphen(note, pageSetup)).toBe(true);
  });

  it('does not allow non-hyphen notes', () => {
    const pageSetup = getMockPageSetup();

    const note = new NoteElement();
    note.isHyphen = false;
    note.lyrics = 'τω';

    expect(LayoutService.mayShowLeadingLyricHyphen(note, pageSetup)).toBe(
      false,
    );
  });

  it('allows non-Greek continuation hyphens outside active Greek melismas', () => {
    const pageSetup = getMockPageSetup();

    const note = new NoteElement();
    note.isHyphen = true;
    note.isMelisma = true;
    note.lyrics = '';

    expect(
      LayoutService.mayShowLeadingLyricHyphen(note, pageSetup, false),
    ).toBe(true);
  });

  it('allows Greek continuation hyphens when Greek melismata are disabled', () => {
    const pageSetup = getMockPageSetup();
    pageSetup.disableGreekMelismata = true;

    const note = new NoteElement();
    note.isHyphen = true;
    note.isMelisma = true;
    note.lyrics = '';

    expect(LayoutService.mayShowLeadingLyricHyphen(note, pageSetup, true)).toBe(
      true,
    );
  });
});

function getInlineTextBox() {
  const inlineTextBox = new TextBoxElement();
  inlineTextBox.inline = true;
  return inlineTextBox;
}

function getLine(...elements: ScoreElement[]) {
  const line = new Line();
  line.elements = elements;
  return line;
}

function elementBox(element: ScoreElement): Box & { element: ScoreElement } {
  return { type: 'box', width: 10, element };
}

function penaltyItem(cost: number): Penalty {
  return { type: 'penalty', cost, width: 0, flagged: false };
}

function glueItem(width: number, stretch: number, shrink: number): InputItem {
  return { type: 'glue', width, stretch, shrink };
}

function getRuntPenaltyItems(
  noteCount: number,
  terminalElement?: ScoreElement,
  elementBeforeLastNote?: ScoreElement,
) {
  const items: InputItem[] = [];
  const notes: NoteElement[] = [];
  const breakPenalties: Penalty[] = [];
  // The martyria's own breakpoint, when a terminal element is present. It is
  // not preceded by a note box, so applyRuntPenalty never reaches it.
  let terminalBreakPenalty: Penalty | null = null;

  for (let i = 0; i < noteCount; i++) {
    if (elementBeforeLastNote != null && i === noteCount - 1) {
      // A tempo or inline text box between two notes: a box followed by
      // standard glue, contributing no penalty of its own.
      items.push(elementBox(elementBeforeLastNote), glueItem(5, 5, 5));
    }

    const note = new NoteElement();
    notes.push(note);
    items.push(elementBox(note));

    // Break opportunity after the neume: an unlabeled penalty immediately
    // after the box, then the post-break glue.
    const penalty = penaltyItem(0);
    breakPenalties.push(penalty);
    items.push(penalty, glueItem(5, 5, 5));
  }

  if (terminalElement != null) {
    // addProtectedBreakpointEncoding: the break must occur at the penalty
    // rather than before the pre-break glue, so the post-break glue is
    // skipped on the next line.
    terminalBreakPenalty = penaltyItem(0);
    items.push(
      elementBox(terminalElement),
      penaltyItem(MAX_COST),
      glueItem(0, 0, 0),
      terminalBreakPenalty,
      glueItem(5, 5, 5),
    );
  }

  // removeGlue strips the paragraph's trailing glue before the finishing glue
  // is applied.
  while (items[items.length - 1].type === 'glue') {
    items.pop();
  }

  // The paragraph terminator that endParagraph appends before the penalties
  // are applied: prevent-break, finishing glue, forced break.
  items.push(
    penaltyItem(MAX_COST),
    glueItem(0, MAX_COST, 0),
    penaltyItem(-MAX_COST),
  );

  return { items, notes, breakPenalties, terminalBreakPenalty };
}

function getMockPageSetup() {
  const pageSetup = new PageSetup();
  pageSetup.neumeDefaultFontFamily = 'MockFont';
  return pageSetup;
}
