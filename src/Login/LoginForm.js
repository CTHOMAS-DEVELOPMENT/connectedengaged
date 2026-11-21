import React, { useEffect } from "react";
import "./DomainOwnerStudio.css";
import AngelTreeDemo from "./AngelTreeDemo.jsx";
import "./AngelTreeCaseStudy.css";

const ArrowIcon = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true">
    <path d="M4 10h11M11 5l5 5-5 5" />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 3 20 6v5c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6l8-3Z" />
    <path d="m8.5 12 2.2 2.2 4.8-5" />
  </svg>
);

const LoginForm = () => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Domain Owner Studio | Connected Engager";

    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <main className="domain-studio">
      <nav className="domain-studio__nav" aria-label="Primary navigation">
        <a className="domain-studio__brand" href="#top" aria-label="Domain Owner Studio home">
          <span className="domain-studio__brand-mark" aria-hidden="true">
            DO
          </span>
          <span>
            <strong>Domain Owner Studio</strong>
            <small>by Connected Engager</small>
          </span>
        </a>

        <div className="domain-studio__nav-links">
          <a href="#method">Method</a>
          <a href="#pilot">Case studies</a>
          <a href="#principles">Data principles</a>
          <a className="domain-studio__nav-cta" href="#enquiry">
            Start a conversation
          </a>
        </div>
      </nav>

      <header className="domain-studio__hero" id="top">
        <div className="domain-studio__hero-glow domain-studio__hero-glow--one" />
        <div className="domain-studio__hero-glow domain-studio__hero-glow--two" />

        <div className="domain-studio__hero-copy">
          <p className="domain-studio__eyebrow">
            <span /> Small systems. Deep knowledge. Human control.
          </p>
          <h1>
            Are you a <em>Domain owner</em> at work?
          </h1>
          <p className="domain-studio__lede">
            You know the exceptions, the shortcuts, the risks and the real sequence of work.
            That knowledge can become a focused system—without turning your working life into
            somebody else&apos;s platform.
          </p>

          <div className="domain-studio__hero-actions">
            <a className="domain-studio__button domain-studio__button--primary" href="#method">
              Explore the method <ArrowIcon />
            </a>
            <a className="domain-studio__button domain-studio__button--ghost" href="#pilot">
              See the projects in practice
            </a>
          </div>

          <dl className="domain-studio__hero-facts">
            <div>
              <dt>01</dt>
              <dd>Your knowledge leads</dd>
            </div>
            <div>
              <dt>02</dt>
              <dd>Safety starts in development</dd>
            </div>
            <div>
              <dt>03</dt>
              <dd>Your data stays portable</dd>
            </div>
          </dl>
        </div>

        <div className="domain-studio__map" aria-label="A visual map showing domain knowledge becoming a focused system">
          <div className="domain-studio__map-orbit domain-studio__map-orbit--outer" />
          <div className="domain-studio__map-orbit domain-studio__map-orbit--inner" />
          <div className="domain-studio__map-core">
            <span>DOMAIN</span>
            <strong>YOU</strong>
            <small>The person who knows how the work really works</small>
          </div>
          <span className="domain-studio__map-node domain-studio__map-node--one">Rules</span>
          <span className="domain-studio__map-node domain-studio__map-node--two">Exceptions</span>
          <span className="domain-studio__map-node domain-studio__map-node--three">Decisions</span>
          <span className="domain-studio__map-node domain-studio__map-node--four">Records</span>
          <span className="domain-studio__map-node domain-studio__map-node--five">Outcomes</span>
          <div className="domain-studio__map-caption">
            <span className="domain-studio__pulse" /> Knowledge worth mining
          </div>
        </div>
      </header>

      <section className="domain-studio__trust-strip" aria-label="Our working principles">
        <p><strong>Local-first</strong><span>when the work allows it</span></p>
        <p><strong>Standalone</strong><span>without isolated data</span></p>
        <p><strong>Parallel-run</strong><span>before handover</span></p>
        <p><strong>Exportable</strong><span>in understandable formats</span></p>
      </section>

      <section className="domain-studio__section domain-studio__intro">
        <div className="domain-studio__section-label">The opportunity</div>
        <div className="domain-studio__intro-copy">
          <h2>The best software brief may already be walking around your workplace.</h2>
          <p>
            A domain owner is not necessarily a manager or a technologist. It is the person
            colleagues rely on when the documented process stops matching reality. We work with
            that knowledge carefully: observing before automating, testing before replacing, and
            keeping the resulting system understandable.
          </p>
        </div>
        <aside className="domain-studio__quote">
          <span>“</span>
          <p>The system begins with the person who can explain why the ordinary case is never quite ordinary.</p>
        </aside>
      </section>

      <section className="domain-studio__section domain-studio__method" id="method">
        <div className="domain-studio__section-heading">
          <div>
            <p className="domain-studio__kicker">Knowledge mining, without extraction</p>
            <h2>From lived expertise to a system that fits</h2>
          </div>
          <p>
            The domain owner remains visible in every decision. A prototype is evidence for a
            conversation—not an excuse to rush into production.
          </p>
        </div>

        <ol className="domain-studio__steps">
          <li>
            <span className="domain-studio__step-number">01</span>
            <div className="domain-studio__step-icon">OBSERVE</div>
            <h3>Find the real workflow</h3>
            <p>Listen for handoffs, exceptions, duplicate entry and the knowledge held outside formal documentation.</p>
          </li>
          <li>
            <span className="domain-studio__step-number">02</span>
            <div className="domain-studio__step-icon">MODEL</div>
            <h3>Make knowledge visible</h3>
            <p>Turn language, records and decisions into a small shared model that the domain owner can challenge.</p>
          </li>
          <li>
            <span className="domain-studio__step-number">03</span>
            <div className="domain-studio__step-icon">PROVE</div>
            <h3>Run a bounded pilot</h3>
            <p>Use fictional data first, introduce protection early, and run the new approach beside the old one.</p>
          </li>
          <li>
            <span className="domain-studio__step-number">04</span>
            <div className="domain-studio__step-icon">HANDOVER</div>
            <h3>Leave control behind</h3>
            <p>Deliver understandable data, documented recovery and a system that can evolve without becoming a trap.</p>
          </li>
        </ol>
      </section>

      <section className="domain-studio__pilot" id="pilot">
        <div className="domain-studio__pilot-visual">
          <div className="domain-studio__window">
            <div className="domain-studio__window-bar">
              <span /><span /><span />
              <small>local-first pilot</small>
            </div>
            <div className="domain-studio__window-body">
              <div className="domain-studio__window-nav" />
              <div className="domain-studio__window-banner">
                <span>Protected local workspace</span>
              </div>
              <div className="domain-studio__window-grid">
                <span /><span /><span />
              </div>
              <div className="domain-studio__window-lines">
                <span /><span /><span /><span />
              </div>
            </div>
          </div>
          <div className="domain-studio__pilot-stamp">LIVE<br />LEARNING</div>
        </div>

        <div className="domain-studio__pilot-copy">
          <p className="domain-studio__kicker">Case study · Special Needs</p>
          <h2>A teacher&apos;s expertise, shaped into a local-first pilot.</h2>
          <p>
            The Special Needs project began with one domain expert, one machine and a deliberately
            small scope. Records stay in the chosen browser profile, encrypted backups are explicit,
            and the pilot is introduced alongside the existing way of working.
          </p>
          <ul>
            <li><ShieldIcon /> Fictional information during early testing</li>
            <li><ShieldIcon /> Encrypted backup and reviewed recovery</li>
            <li><ShieldIcon /> Parallel running before operational use</li>
            <li><ShieldIcon /> Portable records rather than platform lock-in</li>
          </ul>
          <a className="domain-studio__text-link" href="https://specialneeds-demo.netlify.app/">
            Open the public fictional demonstration <ArrowIcon />
          </a>
          <small className="domain-studio__pilot-note">
            The protected operational pilot is intentionally not linked from this public page.
          </small>
        </div>
      </section>

      <section className="domain-studio__pilot domain-studio__angeltree" id="angeltree" aria-labelledby="angeltree-heading">
        <div className="domain-studio__pilot-copy">
          <p className="domain-studio__kicker">Case study · AngelTree</p>
          <h2 id="angeltree-heading">A thoughtful match begins with the person who knows.</h2>
          <p>
            A community organiser knows the families, the children and the people offering to help.
            AngelTree gives her a simple way to collect each child’s wishes and share them with
            a chosen sponsor. The matching decision stays with her.
          </p>
          <ul>
            <li><ShieldIcon /> One private questionnaire link for each child</li>
            <li><ShieldIcon /> Parents submit online without creating an account</li>
            <li><ShieldIcon /> The organiser chooses who receives each request</li>
            <li><ShieldIcon /> Sponsors open a separate, read-only gift page</li>
          </ul>
          <p className="angeltree-case__lesson">
            <strong>What the domain owner taught us</strong>
            The first design let sponsors choose a child. Her knowledge of relationships and
            different budgets showed why she needed to make that choice herself. The workflow
            changed around that decision.
          </p>
          <a className="domain-studio__text-link" href="#angeltree-demo">Try the fictional AngelTree example</a>
          <small className="domain-studio__pilot-note">
            This public example is separate from the working system. No family records or private organiser links are shared here.
          </small>
        </div>
        <aside className="angeltree-case__visual" aria-label="How AngelTree supports the organiser">
          <span className="angeltree-case__tag">Small wishes. Wonderful moments.</span>
          <div className="angeltree-case__gift" aria-hidden="true"><span /></div>
          <h3>She knows who to ask.</h3>
          <p>Parents share the wishes.<br />The organiser makes the match.<br />Sponsors see what matters.</p>
          <span className="angeltree-case__signature">Human judgement, supported.</span>
        </aside>
      </section>

      <section className="domain-studio__section angeltree-case__demo-section" id="angeltree-demo" aria-labelledby="angeltree-demo-heading">
        <div className="domain-studio__section-heading">
          <div><p className="domain-studio__kicker">Try the handover</p><h2 id="angeltree-demo-heading">One child. Three perspectives.</h2></div>
          <p>Step into the organiser, parent and sponsor views using a fictional practice request. No account or real information needed.</p>
        </div>
        <AngelTreeDemo />
      </section>

      <section className="domain-studio__section domain-studio__principles" id="principles">
        <div className="domain-studio__section-heading">
          <div>
            <p className="domain-studio__kicker">Protection is architecture</p>
            <h2>Safe data practices begin during development</h2>
          </div>
          <p>
            Security is not a badge added at release. It is a trail of restrained decisions that
            begins before a real person&apos;s information enters the system.
          </p>
        </div>

        <div className="domain-studio__principle-grid">
          <article>
            <span>MINIMISE</span>
            <h3>Collect less</h3>
            <p>No visitor IP profiling, behavioural tracking or speculative personal data collection on this page.</p>
          </article>
          <article>
            <span>PROTECT</span>
            <h3>Design recovery early</h3>
            <p>Backups, restore checks and clear storage guidance are part of the pilot—not deferred maintenance.</p>
          </article>
          <article>
            <span>TRANSFER</span>
            <h3>Keep data understandable</h3>
            <p>A standalone system should exchange records through documented formats rather than imprison them.</p>
          </article>
          <article>
            <span>PROVE</span>
            <h3>Earn operational trust</h3>
            <p>Use fictional information, bounded trials and parallel running before relying on a fledgling system.</p>
          </article>
        </div>
      </section>

      <section className="domain-studio__enquiry" id="enquiry">
        <div>
          <p className="domain-studio__kicker">Bring the awkward workflow</p>
          <h2>What do you understand at work that software still ignores?</h2>
          <p>
            The full enquiry form is the next step. Until it opens, you can start with a short email:
            describe the work, the recurring friction and who currently carries the knowledge.
          </p>
        </div>
        <div className="domain-studio__enquiry-card">
          <span className="domain-studio__enquiry-status"><i /> Enquiry form in development</span>
          <a href="mailto:connectedengaged@gmail.com?subject=Domain%20Owner%20Studio%20enquiry">
            connectedengaged@gmail.com <ArrowIcon />
          </a>
          <small>No mailing list. No automated sales sequence. A human conversation first.</small>
        </div>
      </section>

      <footer className="domain-studio__footer">
        <a className="domain-studio__brand" href="#top">
          <span className="domain-studio__brand-mark" aria-hidden="true">DO</span>
          <span><strong>Domain Owner Studio</strong><small>by Connected Engager</small></span>
        </a>
        <p>Focused software for people who know the work.</p>
        <div>
          <a href="/privacy-policy">Privacy</a>
          <a href="mailto:connectedengaged@gmail.com">Contact</a>
        </div>
      </footer>
    </main>
  );
};

export default LoginForm;
