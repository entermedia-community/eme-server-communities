---
name: eme-brand-voice
description: Use whenever you write or rewrite copy for EME World (web pages, graphics text, proposals, documents, chat blurbs, English or Spanish). Defines the voice, the four values with their exact wording, vocabulary to use and avoid, and the hard punctuation and naming rules the user has set (no em dashes, Fundación not nonprofit, short text, bold key words).
---

# EME brand voice

## Voice

- Calm, warm, plain. Short sentences. Speak to leaders and communities, not engineers (the Developers page is the exception).
- Human first: people decide, EME helps. Say "keeps humans in control", never "automates people away".
- Concrete over grand. Name the thing: calendars, tickets, carpool, translation, transcripts.
- Soft, not hype. No exclamation marks, no "revolutionary", no "disrupt".
- Lead with the most compelling points and use few words. The user's steer on the home page was "most compelling parts only, not too many words": one line per idea, detail goes in cards.
- Decide the amount of text yourself and keep it short. Chart and card blurbs are about 3 to 5 short lines.
- Bold only the key words in a short blurb, never whole sentences.

## Hard rules from the user

1. **Never use an em dash.** Not in pages, documents, graphics or replies. Use a comma, colon or new sentence.
2. In chart and graphic text, avoid hyphens. Keep a hyphen only when the user's own wording has one (for example "Open-source tools" in the Light on the Earth blurb).
3. **Never write "sin fines de lucro" or "nonprofit"** for EME World Inc. Say **Fundación** (a 501(c)(3) foundation).
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
| EME, My EME, your EME | "the bot", "the chatbot" |
| digital twin, **EME Profile** (the entity name) | "clone", "avatar", "persona" |
| AI Harness | "AI wrapper", "middleware" |
| EME Server | "instance" in public copy |
| open source, 100% open source | "free software" (unless quoting) |
| Collective Intelligence | "AGI", "superintelligence" |
| humans in control, human guided | "autonomous", "hands off" |
| Fundación | "nonprofit", "sin fines de lucro" |
| flat rate, full data privacy | "pay per use", "usage fees" (the Open API has no usage charge) |

## Spanish

Mirror the English meaning, same warmth. Keep product names (EME, Mi EME, AI Harness) as is. Keep "Fundación". Use the
`cumbre-de-cocreacion-*` files as the reference for tone.

## Quick check before you finish

- Search the text for the em dash character and remove it.
- Search for "nonprofit" and "sin fines de lucro".
- Confirm every claim appears in `eme-brand-story`.
