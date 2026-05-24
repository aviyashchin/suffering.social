# Simulated reader feedback on suffering.social/

Three LLM personas (policy staffer, tech journalist, layperson) were each asked to fetch and read the page cold and answer three questions. They ran independently with no shared context. Reactions below are verbatim.

These are NOT a substitute for real human responses (still queued as drafts in Gmail). They're a pre-send signal. Three independent reads converging on the same issue is real evidence the issue exists.

## Convergent findings (all three readers, independently)

1. **The $2.5T headline is the problem.** Reads as a modeling artifact, marketing pitch, or "Mad Lib that always outputs a trillion-dollar number." Burns credibility for the genuine evidence underneath.
2. **Subconscious.ai branding reads as lead-gen.** Layperson and journalist both flagged it as a tell that "someone is selling me something." Currently kills the page's credibility as research.
3. **The chart and inflection argument LAND.** All three understood the structural claim by the time they reached the calculator. The narrative spine works.

## Specific fixable items

- **Calculator output should be a range, not a point estimate.** Policy and journalist both said the headline single-number is indefensible; a band (low/high) honors the uncertainty the sliders represent.
- **The 110K suicides number needs explicit labeling.** Reader read it as annual; CDC's annual U.S. suicide total is ~49K. The number is cumulative teen suicides since 2010 (per llms.txt) but the calculator label doesn't say so.
- **VSL methodology should be inline next to the slider, not in a footer details block.** Policy reader wanted it visible at the point of interaction.
- **De-emphasize Subconscious branding above the fold.** Keep it in the footer or pitch section. Currently visible at the top.

## Per-reader responses

### Policy staffer (state AG's office)

A. Yes, the argument lands: smartphone-era inflection, ~18% attribution, multiplied through VSL to a headline number; the structure is legible even if the multiplication is doing most of the work.

B. I poked the sliders to see how sensitive the $2.5T is. Answer: extremely. Dropping attribution from 18% to Odgers's <10% and VSL to a more conservative figure roughly halves it, which tells me the headline number is a modeling artifact, not a finding.

C. Not to my AG, not to outside counsel, not in any internal memo. The $2.5T number gets laughed out of a conference room with DOJ economists in it, and it would taint the more defensible parts (Allcott, the SAMHSA trend, the leaked Meta docs) by association.

**What I'd want to see different:** Bury the $2.5T headline. Lead instead with the Allcott deactivation effect size, the SAMHSA prevalence delta, and the Meta internal documents, in that order. Those are the parts that survive a Daubert challenge. The calculator should default to a range (Odgers low / Twenge high) and show the output as a band, not a single trillion-dollar figure, with VSL methodology cited inline next to the slider, not in a footnote. The 110K annual suicide figure needs to be unlocked or sourced visibly; CDC's number is ~49K and the discrepancy is the first thing a hostile reviewer will notice.

### Tech journalist

A. Yes. Synchronous 2012 inflection across six Anglophone countries, smartphones as the suspect, Haidt's thesis dressed up with a price tag.

B. I moved the sliders once, then stopped. The "what % do you blame on social?" input is the whole argument hiding inside a UI element, so it's not a calculator, it's a Mad Lib that always outputs a trillion-dollar headline.

C. Maybe with one source, a health economist I trust, to ask whether the VSL-times-attribution-fraction math is defensible. I would not send it to readers, because the "Subconscious.ai" branding makes it look like a lead-gen asset and a $2.5T number with a marketing logo on it is exactly the kind of thing my editor would bounce.

**Could I file 800 words from this?** Not from the page. The page is the Haidt argument with a slider on top, and that story has been filed to death since *Anxious Generation*. It's a jumping-off point at best: the actual story is "AI consultancy builds a viral cost-calculator to dramatize a contested social-science claim, and the number is $2.5T," which is a media-criticism piece, not a youth-mental-health piece. The March-May 2026 "verdicts" section is the only genuinely newsy hook, and if those cases are real I'd skip this page entirely and go report the dockets.

### Layperson (high-school chemistry teacher, parent of a 14-year-old)

A. Yeah, mostly. The "what happened in 2012" hook plus the six-country chart did the work, I got that they're saying smartphones broke teen mental health and someone should put a price on it.

B. No, I scrolled past it. I'm a chemistry teacher, not an economist, and the second I see sliders for "mortality assumptions" my brain goes "this is somebody's spreadsheet, not mine."

C. I'd send the first chart to two other parents at my daughter's school, but not the whole page. The calculator and the trillion-dollar number make it feel like a pitch, and my mom-friends will smell that and tune out.

**Where I bounced or got lost:** The opening grabbed me. That flatline-then-cliff chart is the kind of thing I'd actually screenshot. But somewhere around "externality" and "300 times the tobacco settlement" I felt the page shift from "here's what's happening to your kid" to "here's a policy argument," and I'm not the audience for that. The Meta verdict and the Subconscious.ai link at the bottom made me suspicious. Wait, is this a real nonprofit thing or is someone selling me AI simulation software? That's where I'd close the tab and just text my friend back "scary chart, thanks."
