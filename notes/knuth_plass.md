# Optimal Line Breaking in Byzantine Notation

[Basil Crow](https://github.com/basil), March 2024

## Background

One of the most important operations necessary when text materials are prepared for printing or display is the task of breaking long paragraphs into lines of approximately equal length.
The traditional way to break paragraphs into lines is to place as many words on each line as possible until there are no words left to place.
This greedy “first-fit” algorithm always uses the minimum number of lines, but it often leads to undesirable large&nbsp;&nbsp;&nbsp;spaces &nbsp;&nbsp;&nbsp;between words in justified text.
It is the standard method of line breaking in word processors (e.g., Microsoft Word) and web browsers (e.g., Google Chrome).

In their seminal 1981 paper “[Breaking Paragraphs into Lines](http://www.eprg.org/G53DOC/pdfs/knuth-plass-breaking.pdf)” [^1], Knuth & Plass present a new approach to the problem
that considers a network of breakpoints for an entire paragraph rather than making decisions one line at a time.
This “optimum-fit” algorithm can strategically choose breakpoints early in the paragraph that eliminate especially unattractive breakpoints later on.
Not only does this avoid wide spaces, but also it keeps spaces nearly equal to the normal size and avoids rapid changes in the spacing of adjacent lines.
The Knuth-Plass approach is based on three simple primitive concepts called _boxes,_ _glue,_ and _penalties,_
and it computes the optimum breakpoints with a scoring system based on the sum of the squares of the lengths of the spaces at the end of lines.
Its flagship implementation is in the $\TeX$ typesetting system, where it is described in the source code as “probably the most interesting algorithm of $\TeX$.”
Adobe InDesign features a variation of this scheme called the [Adobe Paragraph Composer](https://helpx.adobe.com/indesign/using/text-composition.html).

A naïve implementation of the optimum-fit algorithm would need to search $2^n$ candidate solutions, where $n$ is the number of words.
In practice, the traditional implementation of this algorithm uses dynamic programming to achieve a quadratic time complexity of $O(\min(wn, n^2))$,
where $w$ is the maximum number of words on a line and $n$ is the number of words in the paragraph.
Since $w$ is fixed, the algorithm is linear for large $n$.
In a 1987 paper [^2], D.S. Hirschberg and L.L. Larmore show that this algorithm is a special case of the least weight subsequence problem
and present both an improved $O(n \log n)$ time algorithm as well as an $O(n)$ algorithm with additional assumptions.
In a 1999 paper [^3], Oege de Moor and Jeremy Gibbons present a Haskell implementation of the abovementioned $O(n)$ solution.
An efficient implementation of the Knuth-Plass approach requires a large amount of bookkeeping,
earning it a reputation for being “impossible for mere mortals to code.”
In practice, the traditional dynamic programming implementation in $\TeX$ is efficient enough for common use cases.
The Knuth & Plass algorithm is a _tour de force_ of computing research that is difficult to summarize in a small space,
and readers are encouraged to study the paper in its entirety.

## Western staff notation

Breaking lines in musical scores is a more complex task than breaking lines of text.
For example, in Western staff notation simultaneous voices must be vertically aligned.
In both Western staff notation and Byzantine neume notation, music must be vertically aligned with lyrics.

The origin of the Knuth-Plass approach lies in the typesetting of music. As Knuth & Plass write:

> The idea of applying dynamic programming to line breaking first occurred to D. E. Knuth in 1976,
> when Professor Leland Smith of Stanford’s music department raised a related question that arises in connection with the layout of music on a page (see [^4]).
> During a subsequent discussion with students in a problem-solving seminar,
> someone pointed out that essentially the same idea would apply to the texts of paragraphs as well as to music.

In their seminal 1988 paper “Optimal line breaking in music” [^5], Wael A. Hegazy and John S. Gourlay present an approach for breaking Western staff notation into lines based on the box/glue algebra of Knuth & Plass.
In this algorithm, a _force_ is exerted on glue elements with some constants to stretch or shrink the line to a particular length,
and box elements are used to ensure that noteheads and musical markup (e.g., accidentals) do not collide by pre-stretching the glue to a minimal extent.
A version of this algorithm is implemented in the [LilyPond](https://lilypond.org/) typesetting tool.

## Byzantine neume notation

This project presents an approach for breaking Byzantine neume notation into lines based on the box/glue algebra of Knuth & Plass and building on the ideas of Hegazy & Gourlay as implemented in LilyPond.
We extrapolate a general set of line breaking rules from examples in classical 19ᵗʰ-century publications of Byzantine music,
and we implement these rules using the box/glue/penalty algebra of Knuth & Plass.
Lyricless neumes can be modeled very similarly to text, but the introduction of lyrics adds additional complexity.
We handle lyrics in the same manner in which they are handled in Western staff notation in LilyPond using the Hegazy & Gourlay approach.
Once the score has been modeled in the box/glue/penalty algebra, we use the traditional dynamic programming implementation of the Knuth-Plass algorithm to compute the optimum set of breakpoints.
Our experience with this approach confirms that it is both efficient and effective in producing high-quality output that meets and exceeds that of the classical 19ᵗʰ-century publications.

## Past precedent

Examining many examples in classical 19ᵗʰ-century publications, we extrapolate the following rules:

1. A line break may not be inserted between a martyria and the preceding neume.
2. A line break may not be inserted between two neumes that are tied with a connecting heteron, connecting homalon, or yfen.
3. A line break may not be inserted between two neumes when the first neume has a vareia.

Without access to computational resources, the 19ᵗʰ-century publications necessarily employ a first-fit rather than optimum-fit approach.
However, they use some techniques to improve the quality of the output in spite of these constraints:

1. To compress a line, reduced width versions of neumes like the ison and oligon are sometimes used.
2. To compress a line, an ison followed by an apostrophos is sometimes written with the apostrophos beneath the ison rather than after it.
3. To compress a line, two apostrophoi are sometimes written with the second apostrophos beneath the first rather than after it.
4. When a line is not wide enough, the extra space is often added to the martyriæ before being added to the other neumes in order to keep the spacing of the other neumes consistent with the surrounding lines.

## Box/glue/penalty algebra

Consider the case of a lyricless score of Byzantine music.
Each neume group (e.g., a simple oligon, or an ison and kentimata placed over a supporting oligon) and martyria can be modeled as a box whose width is the width of the neume group or martyria.
Space between neumes is modeled as glue with a user-configurable width which can stretch or shrink by up to ½, similar to the stretchability and shrinkability of the glue used for interword spacing by Knuth & Plass.
Following the example of several classical 19ᵗʰ-century publications, we allow the glue before and after a martyria to stretch by up to 3× to keep the spacing of the other neumes consistent with the surrounding lines (see technique #4 above).
Right-aligned martyriæ are preceded by a glue element with infinite stretchability to absorb all the space between the last neume and the martyria.
As with Knuth & Plass, we end each paragraph with a finishing glue 0 width, infinite stretchability, and 0 shrinkability to absorb the space at the end of the line,
preceded by a maximum-cost penalty to prevent a line break and succeeded by a minimum-cost penalty to force a break at the end of the paragraph.

The introduction of lyrics adds additional complexity, as they can collide when they extend beyond the width of the neume.
We handle lyrics in the same manner in which they are handled in Western staff notation in LilyPond using the Hegazy & Gourlay approach.
LilyPond employs `LyricSpace` and `LyricHyphen` grobs, both of which call `ly:lyric-hyphen::set-spacing-rods` to create “an invisible object that prevents lyric words from being spaced too closely.”
(Here the term _rod_ is used for what Knuth & Plass call a _box._)
This is an application of the technique described by Hegazy and Gourlay to pre-stretch the glue to a minimal extent.
To compute the width of the invisible box, we compute lyric and neume offsets from the beginning of an idealized one-line paragraph of infinite width where no stretching or shrinking has been applied.
When we detect a lyric collision, we compute the amount of space needed to avoid the collision and add half of it on either side of the neume.

## Psychologically bad breaks

To enforce the three rules described above, we prevent line breaks by adding maximum-cost penalties.

In addition to the three rules described above, we identified a few cases where line breaks are permissible but undesirable:

1. A line that starts with a gorgon steals half a beat from the neume at the end of the previous line. While not uncommon in the classical 19ᵗʰ-century publications, this requires the reader to be reading one-line ahead. While not a significant problem within a page, this can be more annoying at a page boundary. Avoiding such breaks when possible lessens the burden on the reader.
2. Between a kentimata (or kentimata beneath an oligon) and the preceding neume. In this case, the kentimata are the upbeat associated with the previous neume’s downbeat, so it is awkward to place a break before it.

Without access to computational resources, the 19ᵗʰ-century publications necessarily permit such undesirable breaks,
but we add penalties for them at half of the maximum cost to guide the algorithm toward choosing a different set of breakpoints that still meet the constraints.
The computational resources of the 21ˢᵗ century allow such a solution to be found in milliseconds,
thus exceeding the quality of the 19ᵗʰ-century publications.

We do not make use of the flagged penalty items employed by Knuth & Plass to avoid consecutive hyphenated words, since in practice the large stretchability of the martyria glue is sufficient to maintain consistent neume spacing in adjacent lines.

## Maximum adjustment ratio

As mentioned in the paper by Knuth & Plass, in pathological cases a solution cannot be found that meets the constraints.
In this situation, Knuth & Plass offer a tolerance threshold that can be used to back off and retry the search with loosened constraints.
We begin the initial line breaking attempt with a maximum adjustment ratio of 1 and a strong penalty for adjacent lines with inconsistent spacing; that is, no tolerance for suboptimal solutions.
In the event that no solution is found, we try again with a maximum adjustment ratio of 2; that is, allowing twice the desired stretching but keeping the strong penalty for adjacent lines with inconsistent spacing.
If a solution still cannot be found, then we give up and allow lines to be stretched as much as necessary, also dropping the penalty for adjacent lines with inconsistent spacing.
In practice, a solution can almost always be found in the first line breaking attempt, in part due to the ability of martyriæ to absorb a large amount of each line’s stretchability.
Only in pathological cases, such as when the user has forced a line break in the middle of a paragraph, must we drop the adjustment ratio.

## Future work

The 19ᵗʰ-century publications use some techniques to compress lines, as described above (see techniques #1, #2, and #3).
Knuth & Plass draw an analogy to biblical Hebrew, which is never hyphenated, and mention that

> Hebrew fonts intended for sacred texts usually include wide variants of several letters,
> so that individual characters on a line can be replaced by their wider counterparts in order to avoid wide spaces between words.
> For example, there is a super-extended aleph in addition to the normal one.

Knuth & Plass acknowledge that an “extension would be needed to make the optimum-fit algorithm handle cases like [these]. …
The badness function of a line would […] depend not only on its natural width, stretchability, and shrinkability,” but also on “the number of dual-width characters present.”
In the absence of this extension, the three line compression techniques desscribed above are not yet implemented,
but we look forward to a future enhancement that adds support for such dual-width characters.

## References

[^1] Donald E. Knuth and Michael F. Plass. 1981. [Breaking paragraphs into lines](http://www.eprg.org/G53DOC/pdfs/knuth-plass-breaking.pdf). _Software Practice and Experience._ 11, 11 (1981), 1119–1184.

[^2] D. S. Hirschberg and L. L. Larmore. 1987. [The Least Weight Subsequence Problem](https://cse.hkust.edu.hk/mjg_lib/bibs/DPSu/DPSu.Files/0216043.pdf). _SIAM Journal on Computing._ 16, 4 (1987), 628–638.

[^3] Oege de Moor and Jeremy Gibbons. 1999. [Bridging the algorithm gap: A linear-time functional program for paragraph formatting](http://www.cs.ox.ac.uk/people/jeremy.gibbons/publications/bridging.ps.gz). _Science of Computer Programming._ 35, 1 (1999), 3–27.

[^4] Michael J. Clancy and Donald E. Knuth. 1977. [A programming and problem-solving seminar](http://infolab.stanford.edu/pub/cstr/reports/cs/tr/77/606/CS-TR-77-606.pdf). Computer Science Department Technical Report STAN-CS-77-606. Stanford University, 1977, 85-88.

[^5] Wael A. Hegazy and John S. Gourlay. 1988. Optimal line breaking in music. In _Proceedings of the International Conference on Electronic Publishing on Document manipulation and typography._ Cambridge University Press, USA, 157–169.
