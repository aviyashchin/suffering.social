# Causal Clarity Revision

**Status:** Complete

## Outcome

Make the calculator teach how its estimate is constructed. A reader should be
able to distinguish an observed trend, a causal assumption, a study result,
and a public valuation without knowing causal-inference vocabulary.

## Boundaries

- Keep the active calculation engine, nine inputs, sticky result, source
  inspection, sharing, privacy boundary, and closing 2012 chapter.
- Do not change a model value unless its source and mapping have been checked.
- Do not add a framework, decorative causal diagram, new tracking, or new lead
  flow.
- Work locally on `feat/causal-clarity`. Do not publish without a new request.

## Current State

The page now leads with the causal question, defines the comparison, and shows
the formula beside the conditional total. Three useful presets remain. Straight
sensitivity ranges replace the bell-shaped illustrations. Compact evidence
receipts distinguish a model assumption from a directly mapped source, while
secondary source values stay collapsed until requested.

## Decisions

- Frame the result as conditional: it is the cost if the selected causal share
  and other inputs are true.
- Define the comparison as a United States where social media did not expand
  beyond its 2009 reach. State that this world cannot be observed.
- Replace bell curves with straight sensitivity ranges. The curves are not
  probability distributions and add no evidence.
- Label evidence by role and study design. Remove unsupported confidence grades.
- A paper may set a control only when its reported quantity matches that
  control. Otherwise it remains available as context without a selectable
  model value.
- Follow Gopen and Swan's reader-expectation method: give context before the new
  claim, keep subjects next to verbs, and place the important qualification at
  the end of the sentence.

## Milestones

1. Add contracts for the defined comparison, conditional result, evidence-role
   labels, direct source language, and non-probabilistic sensitivity ranges.
2. Revise the source schema and calculator copy without changing the default
   arithmetic.
3. Remove numbered scaffolding, bell-curve motion, unsupported confidence
   labels, and the oversized duplicate result treatment.
4. Prove the page with focused Jest contracts, a production build, and desktop
   and 390px browser journeys.

## Evidence and Discoveries

- Pearl and Mackenzie distinguish observation, intervention, and the
  counterfactual world needed for a causal claim.
- Braghieri, Levy, and Makarin estimate the effect of a staggered platform
  rollout on college students. Their reported depression change is not the
  percentage of all national harm caused by social media.
- CDC reports observed suicide counts and rates. It does not attribute an
  excess-death total to social media.
- The Surgeon General separates longitudinal associations, quasi-experimental
  estimates, randomized limits, and unresolved questions. The interface should
  preserve those distinctions.
- Gopen and Swan show that readers understand technical prose more readily when
  context comes before new information, subjects sit close to verbs, and the
  important qualification lands where the reader expects emphasis.
- The full Playwright suite needs production-like telemetry build flags. Port
  4174 was occupied by an unrelated checkout, so final browser proof used an
  isolated preview on port 4177 without disturbing that process.
- Final proof: `npm run lint` completed with zero errors and three pre-existing
  script warnings; `npm run verify:fast` passed 123 tests, the production build,
  and growth validation; Playwright passed 29 tests across desktop and 390px
  mobile, with one expected desktop skip for the mobile-only keyboard journey.
- Desktop and mobile full-page screenshots were inspected from the live source
  checkout at `http://127.0.0.1:4176/`.
- Follow-up interaction correction: large totals now compare formatted digits
  from right to left, so only changed odometer wheels move. The nine input
  visuals again show moving normal curves, explicitly labeled as visual guides
  rather than probability distributions. Source rows remain open instead of
  sitting behind disclosures. Direct mappings are selectable and highlighted;
  related findings are visible as context without setting an input.
- Follow-up proof: `npm run verify:fast` passed 126 tests, build, and growth
  validation. Production-style Playwright passed 29 desktop/mobile journeys
  with the one expected desktop skip for the mobile-only keyboard test.
- The odometer uses decimal place values rather than final-glyph comparison.
  For `100` to `110`, the hundreds wheel stays still, the tens wheel advances
  once, and the ones wheel completes ten steps. A focused browser rerun passed
  all six live-estimate and motion journeys across desktop and mobile.

## Recovery Step

Review the local version at `http://127.0.0.1:4176/`. The work remains local on
`feat/causal-clarity`; no commit, push, merge, deployment, or production claim
has been made.
