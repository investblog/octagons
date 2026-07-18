---
name: proof-loop
description: Verify work independently, do not self-certify. Apply when claiming a task is done or correct.
---

# proof-loop

Do not confirm your own work by assertion. A task is "done" only after an independent
check passes:

- run the test / linter / type-check / validator — let the tool render the verdict;
- prefer a check that did not see your reasoning (a test, a fresh session, a reviewer)
  over "I wrote it and it looks right".

[CRITICAL] "It works" without an independent verification is not a completion. Give
yourself a way to *prove* the work, not arguments that it works.
