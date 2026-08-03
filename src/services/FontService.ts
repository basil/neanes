import metadataLegacy from '@/assets/fonts/neanes.metadata.json';
import metadata from '@/assets/fonts/neanesengraving.metadata.json';
import metadataRtlLegacy from '@/assets/fonts/neanesrtl.metadata.json';
import metadataRtl from '@/assets/fonts/neanesrtlengraving.metadata.json';
import metadataStathisLegacy from '@/assets/fonts/neanesstathisseries.metadata.json';
import metadataStathis from '@/assets/fonts/neanesstathisseriesengraving.metadata.json';
import type { SbmuflGlyphName } from '@/services/NeumeMappingService';

interface Metrics {
  ascent: number;
  descent: number;
  winAscent: number;
  winDescent: number;
  oligonMidpoint: number;
}

interface EngravingGlue {
  width: number;
  stretch: number;
  shrink: number;
}

interface EngravingDefaults {
  martyriaGlue: EngravingGlue;
  standardGlue: EngravingGlue;
  vareiaGap: number;
}

interface GlyphBBox {
  bBoxNE: [number, number];
  bBoxSW: [number, number];
}

interface MarkAnchorPair {
  baseAnchor: [number, number];
  markAnchor: [number, number];
}

interface CollisionRegion extends GlyphBBox {
  name: string;
}

interface ContextualSubstitution {
  inputGlyphs: SbmuflGlyphName[][];
  backtrackGlyphs: SbmuflGlyphName[][];
  lookaheadGlyphs: SbmuflGlyphName[][];
  substitutions: Array<{
    index: number;
    from: SbmuflGlyphName;
    to: SbmuflGlyphName;
  }>;
}

const metadataMap = new Map();
metadataMap.set('Neanes', metadata);
metadataMap.set('NeanesRTL', metadataRtl);
metadataMap.set('NeanesStathisSeries', metadataStathis);
metadataMap.set('NeanesLegacy', metadataLegacy);
metadataMap.set('NeanesRTLLegacy', metadataRtlLegacy);
metadataMap.set('NeanesStathisSeriesLegacy', metadataStathisLegacy);

class FontService {
  getMetadata(fontFamily: string) {
    return metadataMap.get(fontFamily);
  }

  getMetrics(fontFamily: string) {
    return this.getMetadata(fontFamily).metrics as Metrics;
  }

  getAdvanceWidth(fontFamily: string, glyph: SbmuflGlyphName) {
    return this.getMetadata(fontFamily).glyphAdvanceWidths[glyph];
  }

  getGlyphBBox(fontFamily: string, glyph: SbmuflGlyphName): GlyphBBox {
    return this.getMetadata(fontFamily).glyphBBoxes[glyph];
  }

  getGlyphCollisionRegions(
    fontFamily: string,
    glyph: SbmuflGlyphName,
  ): CollisionRegion[] {
    return this.getMetadata(fontFamily).collisionRegions?.[glyph] ?? [];
  }

  getContextualSubstitutions(fontFamily: string): ContextualSubstitution[] {
    return this.getMetadata(fontFamily).contextualSubstitutions ?? [];
  }

  resolveContextualSubstitutions(
    fontFamily: string,
    glyphs: SbmuflGlyphName[],
  ) {
    const resolvedGlyphs = [...glyphs];

    for (const rule of this.getContextualSubstitutions(fontFamily)) {
      for (
        let inputStart = 0;
        inputStart <= resolvedGlyphs.length - rule.inputGlyphs.length;
        inputStart++
      ) {
        if (
          !this.contextualSubstitutionMatches(rule, resolvedGlyphs, inputStart)
        ) {
          continue;
        }

        for (const substitution of rule.substitutions) {
          const glyphIndex = inputStart + substitution.index;
          if (resolvedGlyphs[glyphIndex] === substitution.from) {
            resolvedGlyphs[glyphIndex] = substitution.to;
          }
        }
      }
    }

    return resolvedGlyphs;
  }

  private contextualSubstitutionMatches(
    rule: ContextualSubstitution,
    glyphs: SbmuflGlyphName[],
    inputStart: number,
  ) {
    return (
      this.glyphClassesMatch(
        rule.backtrackGlyphs,
        glyphs,
        inputStart - rule.backtrackGlyphs.length,
      ) &&
      this.glyphClassesMatch(rule.inputGlyphs, glyphs, inputStart) &&
      this.glyphClassesMatch(
        rule.lookaheadGlyphs,
        glyphs,
        inputStart + rule.inputGlyphs.length,
      )
    );
  }

  private glyphClassesMatch(
    glyphClasses: SbmuflGlyphName[][],
    glyphs: SbmuflGlyphName[],
    start: number,
  ) {
    if (start < 0 || start + glyphClasses.length > glyphs.length) {
      return false;
    }

    return glyphClasses.every((glyphClass, index) =>
      glyphClass.includes(glyphs[start + index]),
    );
  }

  getEngravingDefaults(fontFamily: string): EngravingDefaults {
    return this.getMetadata(fontFamily).engravingDefaults;
  }

  getStandardGlue(fontFamily: string) {
    return this.getEngravingDefaults(fontFamily).standardGlue;
  }

  getMartyriaGlue(fontFamily: string) {
    return this.getEngravingDefaults(fontFamily).martyriaGlue;
  }

  getVareiaGap(fontFamily: string) {
    return this.getEngravingDefaults(fontFamily).vareiaGap;
  }

  getMarkOffset(
    fontFamily: string,
    base: SbmuflGlyphName,
    mark: SbmuflGlyphName,
  ) {
    const offset = this.tryGetMarkOffset(fontFamily, base, mark);

    if (offset == null) {
      console.warn(`Missing anchor for base: ${base} mark: ${mark}`);
      return { x: 0, y: 0 };
    }

    return offset;
  }

  tryGetMarkOffset(
    fontFamily: string,
    base: SbmuflGlyphName,
    mark: SbmuflGlyphName,
    anchorName?: string,
  ) {
    const anchorPair = this.tryGetMarkAnchorPair(
      fontFamily,
      base,
      mark,
      anchorName,
    );

    if (anchorPair == null) {
      return null;
    }

    return {
      x: anchorPair.baseAnchor[0] - anchorPair.markAnchor[0],
      y: -(anchorPair.baseAnchor[1] - anchorPair.markAnchor[1]),
    };
  }

  getMarkAnchorOffset(
    fontFamily: string,
    base: SbmuflGlyphName,
    mark: SbmuflGlyphName,
    anchorName?: string,
  ) {
    const anchorPair = this.tryGetMarkAnchorPair(
      fontFamily,
      base,
      mark,
      anchorName,
    );

    if (anchorPair == null) {
      console.warn(`Missing anchor for base: ${base} mark: ${mark}`);
      return { x: 0, y: 0 };
    }

    return {
      x: anchorPair.baseAnchor[0],
      y: this.getMetrics(fontFamily).winAscent - anchorPair.baseAnchor[1],
    };
  }

  private tryGetMarkAnchorPair(
    fontFamily: string,
    base: SbmuflGlyphName,
    mark: SbmuflGlyphName,
    anchorName?: string,
  ): MarkAnchorPair | null {
    const metadata = this.getMetadata(fontFamily);
    const baseAnchors = metadata.glyphsWithAnchors[base];
    const markAnchors = metadata.glyphsWithAnchors[mark];

    if (baseAnchors == null || markAnchors == null) {
      return null;
    }

    const candidateAnchorNames =
      anchorName != null
        ? [anchorName, ...Object.keys(markAnchors)]
        : Object.keys(markAnchors);
    const sharedAnchorName = candidateAnchorNames.find(
      (name) => baseAnchors[name] != null && markAnchors[name] != null,
    );

    if (sharedAnchorName == null) {
      return null;
    }

    const baseAnchor = baseAnchors[sharedAnchorName] as [number, number];
    const markAnchor = markAnchors[sharedAnchorName] as [number, number];

    return {
      baseAnchor,
      markAnchor,
    };
  }
}

const fontService = new FontService();

export { fontService };
