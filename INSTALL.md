# Add AngelTree to Connected Engager

This update is for the MAIN Connected Engager website, not the live AngelTree application.

1. Back up your current LoginForm.js.
2. Replace that component with src/LoginForm.js from this ZIP. The uploaded source was named LoginForm(1).js; the replacement keeps the exported LoginForm component.
3. Place AngelTreeDemo.jsx and AngelTreeCaseStudy.css beside LoginForm.js, in the same directory as its existing DomainOwnerStudio.css.
4. Keep your existing DomainOwnerStudio.css. It was not supplied and has not been replaced. The new CSS is scoped to the AngelTree addition.
5. Run your main website's usual local preview/build and check desktop plus phone widths before publishing through your existing hosting workflow. No new dependencies, database migration, environment settings or AngelTree VPS deployment are required.

## What changed

The navigation now says Case studies and the hero says See the projects in practice. The existing Special Needs section, public demo link, principles, contact details and other sections are retained.

AngelTree appears as a second case study after Special Needs. It explains the organiser's role, the private parent and sponsor links, and why matching remains a human decision. Its embedded fictional demonstration goes through creating a practice request, the parent questionnaire, submitted organiser view and read-only sponsor view. Visitors can load sample answers or enter invented details and start again.

The demo creates NO shareable or private links, reads NO live records, calls NO backend and writes NO browser storage. Its temporary state disappears when refreshed or unmounted. There is no operational organiser URL in the public source. Do not paste a real organiser/parent/sponsor token into this public homepage.

## Checks

A production build of the supplied components passed. Automated DOM checks passed for the original Special Needs link, new section, missing-field focus, winter selection validation, sample-answer submission, organiser/parent/sponsor progression, disabled sponsor checklist and reset. The demo was checked with backend access blocked.

The original DomainOwnerStudio.css was not supplied, so full visual integration with that stylesheet has not been checked here. Verify the final layout in your main site's local preview. QA harness files and placeholder styles are NOT included in this ZIP.
