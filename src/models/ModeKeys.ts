import { Fthora, ModeSign, QuantitativeNeume } from '@/models/Neumes';
import { Scale, ScaleNote } from './Scales';

export interface ModeKeyTemplate {
  id: number;
  mode: number;
  scale: Scale;
  scaleNote: ScaleNote;
  fthora?: Fthora;

  // Visual representation
  martyria: ModeSign;
  note?: ModeSign;
  note2?: ModeSign;
  fthoraAboveNote?: Fthora;
  fthoraAboveNote2?: Fthora;
  fthoraAboveQuantitativeNeumeRight?: Fthora;
  quantitativeNeumeAboveNote?: ModeSign;
  quantitativeNeumeAboveNote2?: ModeSign;
  quantitativeNeumeRight?: QuantitativeNeume;
}

export const modeKeyTemplates: ModeKeyTemplate[] = [
  {
    id: 100,
    mode: 1,
    scale: Scale.Diatonic,
    scaleNote: ScaleNote.Pa,
    martyria: ModeSign.AlphaWithDeltaHat,
    note: ModeSign.Pa,
  },
  {
    id: 101,
    mode: 1,
    scale: Scale.Diatonic,
    scaleNote: ScaleNote.Ke,
    martyria: ModeSign.AlphaWithDeltaHat,
    note: ModeSign.Ke,
  },
  {
    id: 102,
    mode: 1,
    scale: Scale.Diatonic,
    scaleNote: ScaleNote.Ke,
    martyria: ModeSign.AlphaWithDeltaHat,
    note: ModeSign.Pa,
    quantitativeNeumeRight: QuantitativeNeume.OligonPlusHypsiliRight,
  },
  {
    id: 103,
    mode: 1,
    scale: Scale.SoftChromatic,
    scaleNote: ScaleNote.Ke,
    fthora: Fthora.SoftChromaticThi_Top,
    martyria: ModeSign.AlphaWithDeltaHat,
    note: ModeSign.Ke,
    fthoraAboveNote: Fthora.SoftChromaticThi_Top,
  },
  {
    id: 104,
    mode: 1,
    scale: Scale.Diatonic,
    scaleNote: ScaleNote.Thi,
    martyria: ModeSign.AlphaWithDeltaHat,
    note: ModeSign.Pa,
    quantitativeNeumeRight: QuantitativeNeume.OligonPlusKentimaAbove,
  },
  {
    id: 105,
    mode: 1,
    scale: Scale.Diatonic,
    scaleNote: ScaleNote.PaHigh,
    martyria: ModeSign.AlphaWithDeltaHat,
    quantitativeNeumeRight:
      QuantitativeNeume.OligonPlusHypsiliPlusKentimaVertical,
  },
  {
    id: 106,
    mode: 1,
    scale: Scale.Diatonic,
    scaleNote: ScaleNote.PaHigh,
    fthora: Fthora.DiatonicPa_Top,
    martyria: ModeSign.AlphaWithDeltaHat,
    quantitativeNeumeRight:
      QuantitativeNeume.OligonPlusHypsiliPlusKentimaVertical,
    fthoraAboveQuantitativeNeumeRight: Fthora.DiatonicPa_Top,
  },
  {
    id: 200,
    mode: 2,
    scale: Scale.SoftChromatic,
    scaleNote: ScaleNote.Thi,
    martyria: ModeSign.SoftChromatic2,
    note: ModeSign.Thi,
    fthoraAboveNote: Fthora.SoftChromaticThi_Top,
  },
  {
    id: 201,
    mode: 2,
    scale: Scale.SoftChromatic,
    scaleNote: ScaleNote.Vou,
    martyria: ModeSign.SoftChromatic2,
    note: ModeSign.Vou,
    fthoraAboveNote: Fthora.SoftChromaticThi_Top,
  },
  {
    id: 202,
    mode: 2,
    scale: Scale.HardChromatic,
    scaleNote: ScaleNote.Pa,
    martyria: ModeSign.SoftChromatic2,
    note: ModeSign.Pa,
    fthoraAboveNote: Fthora.HardChromaticPa_Top,
  },
  {
    id: 203,
    mode: 2,
    scale: Scale.HardChromatic,
    scaleNote: ScaleNote.Vou,
    fthora: Fthora.HardChromaticPa_Top,
    martyria: ModeSign.SoftChromatic2,
    note: ModeSign.Vou,
    fthoraAboveNote: Fthora.HardChromaticPa_Top,
  },
  {
    id: 300,
    mode: 3,
    scale: Scale.Diatonic,
    scaleNote: ScaleNote.Ga,
    martyria: ModeSign.Nana,
    note: ModeSign.Ga,
  },
  {
    id: 301,
    mode: 3,
    scale: Scale.Diatonic,
    scaleNote: ScaleNote.Ga,
    martyria: ModeSign.NanaOld,
    note: ModeSign.Ga,
  },
  {
    id: 302,
    mode: 3,
    scale: Scale.Diatonic,
    scaleNote: ScaleNote.Pa,
    martyria: ModeSign.Nana,
    note: ModeSign.Ga,
    quantitativeNeumeRight: QuantitativeNeume.RunningElaphron,
  },
  {
    id: 303,
    mode: 3,
    scale: Scale.Diatonic,
    scaleNote: ScaleNote.Ga,
    fthora: Fthora.DiatonicNiLow_Top,
    martyria: ModeSign.Nana,
    note: ModeSign.Ga,
    fthoraAboveNote: Fthora.DiatonicNiLow_Top,
  },
  {
    id: 400,
    mode: 4,
    scale: Scale.Diatonic,
    scaleNote: ScaleNote.Thi,
    martyria: ModeSign.DeltaWithDeltaHat,
    note: ModeSign.Thi,
  },
  {
    id: 401,
    mode: 4,
    scale: Scale.SoftChromatic,
    scaleNote: ScaleNote.Thi,
    martyria: ModeSign.DeltaWithDeltaHat,
    note: ModeSign.Thi,
    fthoraAboveNote: Fthora.SoftChromaticThi_Top,
  },
  {
    id: 402,
    mode: 4,
    scale: Scale.Diatonic,
    scaleNote: ScaleNote.Pa,
    martyria: ModeSign.DeltaWithDeltaHat,
    note: ModeSign.Pa,
  },
  {
    id: 403,
    mode: 4,
    scale: Scale.Diatonic,
    scaleNote: ScaleNote.Vou,
    martyria: ModeSign.DeltaWithDeltaHat,
    quantitativeNeumeRight: QuantitativeNeume.RunningElaphron,
  },
  {
    id: 404,
    mode: 4,
    scale: Scale.Diatonic,
    scaleNote: ScaleNote.Vou,
    martyria: ModeSign.Legetos,
    note: ModeSign.Vou,
  },
  {
    id: 405,
    mode: 4,
    scale: Scale.HardChromatic,
    scaleNote: ScaleNote.Thi,
    martyria: ModeSign.DeltaWithDeltaHat,
    note: ModeSign.Thi,
    fthoraAboveNote: Fthora.HardChromaticThi_Top,
  },
  {
    id: 406,
    mode: 4,
    scale: Scale.Kliton,
    scaleNote: ScaleNote.Thi,
    martyria: ModeSign.FourthCapital,
    note: ModeSign.Thi,
    fthoraAboveNote: Fthora.Kliton_Top,
  },
  {
    id: 500,
    mode: 5,
    scale: Scale.Diatonic,
    scaleNote: ScaleNote.Pa,
    martyria: ModeSign.Alpha,
    note: ModeSign.Pa,
  },
  {
    id: 501,
    mode: 5,
    scale: Scale.Diatonic,
    scaleNote: ScaleNote.Ke,
    martyria: ModeSign.Alpha,
    note: ModeSign.Ke,
    quantitativeNeumeAboveNote: ModeSign.OligonPlusHypsili,
  },
  {
    id: 502,
    mode: 5,
    scale: Scale.Spathi,
    scaleNote: ScaleNote.Ke,
    martyria: ModeSign.Alpha,
    quantitativeNeumeRight: QuantitativeNeume.OligonPlusHypsiliRight,
    fthoraAboveQuantitativeNeumeRight: Fthora.Spathi_Bottom,
  },
  {
    id: 600,
    mode: 6,
    scale: Scale.HardChromatic,
    scaleNote: ScaleNote.Pa,
    martyria: ModeSign.SoftChromatic6,
    note: ModeSign.Pa,
    fthoraAboveNote: Fthora.HardChromaticPa_Top,
  },
  {
    id: 601,
    mode: 6,
    scale: Scale.SoftChromatic,
    scaleNote: ScaleNote.Vou,
    martyria: ModeSign.SoftChromatic6,
    note: ModeSign.Vou,
    fthoraAboveNote: Fthora.SoftChromaticThi_Top,
  },
  {
    id: 602,
    mode: 6,
    scale: Scale.SoftChromatic,
    scaleNote: ScaleNote.Thi,
    martyria: ModeSign.SoftChromatic6,
    note: ModeSign.Vou,
    fthoraAboveNote: Fthora.SoftChromaticThi_Top,
    quantitativeNeumeRight: QuantitativeNeume.KentemataPlusOligon,
  },
  {
    id: 603,
    mode: 6,
    scale: Scale.HardChromatic,
    scaleNote: ScaleNote.Thi,
    martyria: ModeSign.SoftChromatic6,
    note: ModeSign.Pa,
    note2: ModeSign.Thi,
    fthoraAboveNote: Fthora.HardChromaticPa_Top,
    quantitativeNeumeAboveNote2: ModeSign.OligonPlusKentima,
  },
  {
    id: 700,
    mode: 7,
    scale: Scale.Diatonic,
    scaleNote: ScaleNote.Ga,
    martyria: ModeSign.VarysZo,
    note: ModeSign.Ga,
  },
  {
    id: 701,
    mode: 7,
    scale: Scale.Diatonic,
    scaleNote: ScaleNote.Zo,
    martyria: ModeSign.VarysZo,
    note: ModeSign.Zo,
  },
  {
    id: 800,
    mode: 8,
    scale: Scale.Diatonic,
    scaleNote: ScaleNote.Ni,
    martyria: ModeSign.Delta,
    note: ModeSign.Ni,
  },
  {
    id: 801,
    mode: 8,
    scale: Scale.Diatonic,
    scaleNote: ScaleNote.Ga,
    fthora: Fthora.DiatonicNiLow_Top,
    martyria: ModeSign.Delta,
    quantitativeNeumeRight: QuantitativeNeume.OligonPlusKentimaAbove,
    fthoraAboveQuantitativeNeumeRight: Fthora.DiatonicNiLow_Top,
  },
  {
    id: 802,
    mode: 8,
    scale: Scale.Diatonic,
    scaleNote: ScaleNote.Vou,
    martyria: ModeSign.Delta,
    note: ModeSign.Ni,
    quantitativeNeumeRight: QuantitativeNeume.KentemataPlusOligon,
  },
];
