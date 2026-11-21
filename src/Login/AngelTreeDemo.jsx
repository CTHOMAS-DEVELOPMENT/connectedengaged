import React, { useRef, useState } from 'react';

const needs = ['Socks', 'Hat', 'Gloves', 'Scarf', 'Shoes', 'Pyjamas', 'Underwear', 'Outerwear', 'Toothbrush', 'Personal hygiene products', 'Other'];
const empty = { age: '', gender: '', about: '', shoe: '', shirt: '', trousers: '', message: '', gift: '', description: '', other: '', needs: [] };
const sample = { age: '9', gender: 'Female', about: 'I love drawing animals and making colourful cards.', shoe: 'EU 33', shirt: 'Age 9–10 years', trousers: 'Age 9–10 years', message: 'Thank you! I would love to paint a picture of my favourite animals.', gift: 'Watercolour painting set', description: 'A beginner set with paints, brushes and a sketchbook, under €100.', other: '', needs: ['Hat', 'Gloves'] };

export default function AngelTreeDemo() {
  const [stage, setStage] = useState('create');
  const [name, setName] = useState('Aoife');
  const [answers, setAnswers] = useState({ ...empty });
  const [error, setError] = useState('');
  const heading = useRef(null);
  function move(next) {
    setStage(next); setError('');
    requestAnimationFrame(() => heading.current?.focus());
  }
  function reset() { setName('Aoife'); setAnswers({ ...empty }); move('create'); }
  function change(key, value) { setAnswers(previous => ({ ...previous, [key]: value })); }
  function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    for (const field of form.querySelectorAll('[required]')) {
      if (!field.value.trim() || !field.checkValidity()) {
        setError('Please complete each required answer. Age must be a whole number from 0 to 18.');
        field.focus(); return;
      }
    }
    if (!answers.needs.length) { setError('Please choose at least one winter item.'); form.querySelector('[name="demo-needs"]').focus(); return; }
    move('submitted');
  }
  function input(label, key, type = 'text') {
    return <label><span>{label} <span className="at-demo__required">*</span></span><input required type={type} value={answers[key]} onChange={e => change(key, e.target.value)} {...(key === 'age' ? { min: 0, max: 18, step: 1 } : {})} /></label>;
  }
  function textarea(label, key) {
    return <label><span>{label} <span className="at-demo__required">*</span></span><textarea required rows={3} value={answers[key]} onChange={e => change(key, e.target.value)} /></label>;
  }
  function checklist(readOnly = false) {
    return <fieldset><legend>Needs for winter</legend>{!readOnly && <p className="at-demo__required">Choose at least one item.</p>}<div className="at-demo__checklist">{needs.map(item => <label key={item}><input name="demo-needs" type="checkbox" checked={answers.needs.includes(item)} disabled={readOnly} onChange={e => change('needs', e.target.checked ? [...answers.needs, item] : answers.needs.filter(n => n !== item))} />{item}</label>)}</div>{answers.needs.includes('Other') && (readOnly ? <p>Other: {answers.other}</p> : input('Other winter need', 'other'))}</fieldset>;
  }
  const sponsorFields = [['Name', name], ['Age', answers.age], ['Gender', answers.gender], ['Message from the child', answers.message], ['About the child', answers.about]];
  const giftFields = [['Gift wish', answers.gift], ['Gift description', answers.description], ['Shoe size', answers.shoe], ['Shirt size', answers.shirt], ['Trouser size', answers.trousers]];
  const details = fields => <dl className="at-demo__details">{fields.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>;
  return <div className="at-demo">
    <header className="at-demo__header"><div><span className="at-demo__badge">Fictional demonstration</span><p>Nothing is sent or saved. Refreshing this page clears the practice request.</p></div><button type="button" onClick={reset}>Start again</button></header>
    <div className="at-demo__roles" aria-label="Current demonstration view"><span aria-current={['create', 'waiting', 'submitted'].includes(stage) ? 'step' : undefined}>Organiser</span><span aria-current={stage === 'parent' ? 'step' : undefined}>Parent</span><span aria-current={stage === 'sponsor' ? 'step' : undefined}>Sponsor</span></div>
    <div className="at-demo__body">
      <h3 tabIndex={-1} ref={heading}>{stage === 'create' ? 'Create a practice questionnaire' : stage === 'waiting' ? 'Ready for the parent' : stage === 'parent' ? `${name}’s practice questionnaire` : stage === 'submitted' ? 'The wishes are ready to share' : `${name}’s gift request`}</h3>
      {stage === 'create' && <form onSubmit={e => { e.preventDefault(); if (name.trim()) { setName(name.trim()); move('waiting'); } }}><p>In the working system, the organiser creates one private link for each child. Try the same handover here with an invented first name.</p><label>Fictional child’s first name<input required maxLength={60} value={name} onChange={e => setName(e.target.value)} /></label><button className="at-demo__primary" type="submit">Create practice questionnaire</button></form>}
      {stage === 'waiting' && <><p className="at-demo__status">{name} · Awaiting response</p><p>The organiser would copy the parent link and send it herself. This demo switches views here instead of generating a shareable link.</p><button className="at-demo__primary" onClick={() => move('parent')}>Open practice parent view</button></>}
      {stage === 'parent' && <form onSubmit={submit} noValidate><p>Use invented details only. Fill the form yourself or load the sample answers.</p><button type="button" onClick={() => { setAnswers({ ...sample, needs: [...sample.needs] }); setError(''); }}>Fill with fictional sample answers</button><p className="at-demo__required">Required *</p><div className="at-demo__columns">{input('Age in years (0–18)', 'age', 'number')}<label><span>Gender <span className="at-demo__required">*</span></span><select required value={answers.gender} onChange={e => change('gender', e.target.value)}><option value="">Select gender</option><option>Male</option><option>Female</option></select></label>{input('Shoe size', 'shoe')}{input('Shirt size', 'shirt')}{input('Trouser size', 'trousers')}</div>{textarea('Tell us about yourself', 'about')}{checklist()}{textarea('Personal message to the sponsor', 'message')}{input('Gift name', 'gift')}{textarea('Gift description', 'description')}<p>Choose a gift under €100. This is guidance for the wish.</p>{error && <p role="alert" className="at-demo__required">{error}</p>}<button className="at-demo__primary" type="submit">Submit practice answers</button></form>}
      {stage === 'submitted' && <><p className="at-demo__status">{name} · Submitted</p><p>The organiser now chooses a sponsor, considering what she knows about the child and the sponsor’s budget. She sends that person the separate viewing link.</p><p>The parent questionnaire is closed after submission. Corrections go through the organiser.</p><button className="at-demo__primary" onClick={() => move('sponsor')}>Open practice sponsor view</button></>}
      {stage === 'sponsor' && <><p>This is the read-only view for the chosen sponsor. The winter checklist shows both selected and unselected items.</p>{details(sponsorFields)}{checklist(true)}{details(giftFields)}<p className="at-demo__closing">The software handles the information. The organiser makes the match.</p><button onClick={() => move('submitted')}>Back to organiser view</button></>}
    </div>
  </div>;
}
