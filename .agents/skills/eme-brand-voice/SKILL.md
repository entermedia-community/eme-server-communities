---
name: eme-brand-voice
description: Use whenever you write or rewrite copy for EME World (web pages, graphics text, proposals, documents, chat blurbs, English or Spanish). Defines the voice, the four values with their exact wording, vocabulary to use and avoid, and the hard punctuation and naming rules the user has set (no em dashes, Foundation not nonprofit, short text, no bold inside text).
---

# EME brand voice

## Voice

- Calm, warm, plain. Short sentences. Speak to leaders and communities, not engineers (the Developers page is the exception).
- Human first: people decide, EME helps. Say "keeps humans in control", never "automates people away".
- Concrete over grand. Name the thing: calendars, tickets, carpool, translation, transcripts.
- Soft, not hype. No exclamation marks, no "revolutionary", no "disrupt".
- Lead with the most compelling points and use few words. The user's steer on the home page was "most compelling parts only, not too many words": one line per idea, detail goes in cards.
- Decide the amount of text yourself and keep it short. Chart and card blurbs are about 3 to 5 short lines.
- **Never bold words inside body text** (paragraphs, card blurbs, lists, graphics text). Use plain text. Headings and labels carry the emphasis.

## The name eME

- **Spelling:** write **eME** in general use, the way people write email. Keep the lowercase e even at the start of a sentence or a title.
- **Meaning:** the e stands for electronic, so eME means **electronic me**. Like email is electronic mail, an eME is the electronic version of you.
- **The premise:** each of us will have an electronic version of ourselves. It knows our style, our schedule and our knowledge, and it works for us with us in control.
- **Augment, not replace:** eME does not create synthetic agents. It augments the staff you have. Each person trains their own eME to be more productive and to lower their cognitive burden. Say "your team, with less on their minds", never "AI that does the job for you".
- **One line to explain it:** "eME is short for electronic me. Like email, but for you."
- **A person's eME is named after them:** a lowercase e, then their first name with a capital first letter, no space. Christopher's is **eChristopher**, Mike's is **eMike**, Tammy's is **eTammy**. This is the product standard. Never "EME Christopher", "e-Mike", "E Mike" or "emike". In a sentence: "eMike drafted the reply, and Mike sent it."
- **Names built on it:** eME, My eME, your eME, eME Profile, eME Server, eME Salesbot, eME Team, eME Pro.
- **Uppercase EME only in two places:** the logo, and the company name (EME World Inc., EME World). Everywhere else it is mixed case eME: products, features, people's eMEs, headings, nav, alt text, meta tags.
- **Keep as is:** the domain eme.world, and code, file names, ids, env vars and URLs (`eme.sh`, `EME_USER`, `/site/emeworld/`). Do not rename them.
- Translation keys in `_text_*.txt` files must match the `[[...]]` text in the HTML. Change both together, and leave keys used by plugin pages (for example `Powered by EME`) alone.

## Hard rules from the user

1. **Never use an em dash.** Not in pages, documents, graphics or replies. Use a comma, colon or new sentence.
2. In chart and graphic text, avoid hyphens. Keep a hyphen only when the user's own wording has one (for example "Open-source tools" in the Light on the Earth blurb).
3. EME World Inc. is a **company**. It is no longer a Foundation (changed 2026-11-25). Never call it a Foundation, Fundación, nonprofit or sin fines de lucro, and never say anything is "sponsored by the EME Foundation".
4. Do not read or show the `description` field as a description; it is search text. Use `longdescription`.
5. Do not invent customers, numbers or claims. Use the proof points in `eme-brand-story`.
6. Say **EME Profile**, not "persona", for a person's digital twin entity.
7. Fix typos in the user's supplied wording (for example Bidirectional, Component, WYSIWYG, flexibility) and say so in the reply.

## The four values (exact wording)

| Value | Statement |
|---|---|
| **Respect for Time** | Technology carries the routine so people focus on **what matters**. |
| **Stronger Together** | Communities solve problems best when **people and AI** work **side by side**. |
| **Light on the Earth** | We honor **nature**. Open-source tools on idle hardware and solar nodes keep technology **sustainable**. |
| **Open to Everyone** | **Knowledge** belongs to everyone, with **free** and **lifelong** access. |

Chart title: "EME Values" (the pie is titled "Our Values" in its accessible title). Slice order and colors are fixed:
Respect for Time, Stronger Together, Light on the Earth, Open to Everyone.

## Vocabulary

| Prefer | Avoid |
|---|---|
| eME, My eME, your eME (for a person's electronic me) | "the bot", "the chatbot" |
| electronic me, digital twin, **eME Profile** (the entity name) | "clone", "avatar", "persona" |
| AI Harness | "AI wrapper", "middleware" |
| eME Server | "instance" in public copy |
| eME (lowercase e) | "Eme", "E.M.E." (EME only in EME World Inc.) |
| open source, 100% open source | "free software" (unless quoting) |
| Collective Intelligence | "AGI", "superintelligence" |
| humans in control, human guided | "autonomous", "hands off" |
| augments your staff, lowers cognitive burden, more productive | "replaces staff", "AI employee", "digital worker", "synthetic agent", "cut headcount" |
| EME World Inc., EME World | "Foundation", "Fundación", "nonprofit", "sin fines de lucro" |
| flat rate, flat pricing, no caps on tokens, full data privacy | "pay per use", "usage fees", "token limits" (the AI API has flat pricing and no token caps) |
| open source, open models, self hosted, independent of big tech providers (say all four together) | "partners with big tech", "powered by" a closed model |

## Spanish

Mirror the English meaning, same warmth. Keep product names (eME, Mi eME, AI Harness) as is. Explain eME as "yo electrónico". Use the
`cumbre-de-cocreacion-*` files as the reference for tone.

## Quick check before you finish

- Search the text for the em dash character and remove it.
- Search for "Foundation", "Fundación", "nonprofit", "sin fines de lucro" and "EnterMediaLibrary".
- Confirm every claim appears in `eme-brand-story`.
