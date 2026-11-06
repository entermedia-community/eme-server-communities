---
name: eme-content-guide
description: Start here to create new EME World content such as white papers, web sites, landing pages, one pagers, decks, proposals and press text. Holds the master fact sheet (who EME is, the six core messages, the Fundación, EME World, EME Servers, digital brain, agent economy), the full eme.world section inventory, logo and design summary, and white paper and web site templates. Points to eme-brand-voice, eme-brand-story, eme-brand-site and eme-graphics for the detailed rules.
---

# EME content guide

Use this skill first for any new long form or multi page piece. It gives the facts and the structure. For details, load the others:

| Need | Skill |
|---|---|
| Wording, punctuation, vocabulary, Spanish | `eme-brand-voice` |
| Positioning, exact names, proof points, story order | `eme-brand-story` |
| Web page look, tokens, components, crawler conventions | `eme-brand-site` |
| SVG and PNG graphics (3000px, palette, render script) | `eme-graphics` |

If facts here disagree with the newest edit by the user, the user wins. Update this skill.

## Hard rules (always)

1. **No em dashes, ever.** Use a comma, colon or new sentence.
2. **Say Fundación**, never "nonprofit" or "sin fines de lucro". In English write "a Fundación (501(c)(3) foundation)". The user's source notes say "non profit 501c foundation"; translate that to this wording.
3. Keep text short. Bold only key words. Decide the length yourself.
4. Humans stay in control. EME assists, it does not act alone on key actions.
5. Do not invent customers, numbers, prices or integrations. Use only the facts below and the proof points in `eme-brand-story`.
6. Never read or show the `description` field as a description. Use `longdescription`.
7. Say **EME Profile** for the digital twin entity, never "persona".
8. Lead with the most compelling points and use few words. Put detail in cards or a second level, not in the hero or the pictures.

## Master fact sheet

### Who we are
- **EME World Inc.**, a **Fundación** (501(c)(3) foundation). The product family is **EME Collective Intelligence** (the EME Collective Intelligence Assistant).
- **Reach and trust:** servers hosted worldwide. Works with the United Nations. Clients include **Yale** and the **Canadian Broadcasting Corporation (CBC)**. Monthly **EME Community** meetings give feedback to the Open Source Program Office (OSPO).
- **Mission:** inspired to support the principles of **United Nations Open Source Week**: build a **free, reusable, open platform** that empowers autonomous AI **without dependency on large corporations**.
- **Positioning:** Collective Intelligence Platform. Tagline: "Empowering Collective Intelligence". Vision line: "Customizable AI for Everyone". Use "infrastructure" only as a supporting word for government and enterprise copy. Sub line: "One open platform. Every AI need. Humans fully in control."
- **Sign off:** "Own your intelligence. Own your content. Own your future."
- **Contact:** EME World OSPO Team. President Christopher Burkey, cburkey@eme.world, +1 513 898-2063. Portal https://eme.world. Code https://github.com/entermedia-community/eme-server. Login `/site/app/`.

### The six core messages (the spine of every piece)
1. **Foundation and mission.** EME is a Fundación inspired by UN Open Source Week. It builds a free reusable platform for autonomous AI with no dependency on big corporations.
2. **EME.world is a free chat platform for everyone.** Mobile and web. Built to support **thousands of users and servers** working together. People join team chats or talk peer to peer, and their **EME digital twin** joins the conversation to augment it when needed.
3. **Built from hundreds of skills, customized by AI.** The EME platform is made of hundreds of AI skills. AI can build a **custom EME Server** around each client's needs. Every organization can run its own server as part of the **EME World economy**. For mid size organizations this means **accelerating AI native operations**: domain expertise, knowledge engineering, AI agents and **human in the loop (HITL) governance**, to deliver measurable operational gains, fast.
4. **Anyone can create an EME Server.** A directory lists available servers. Users are assigned to a server or choose to join one. Think of it like an **app store** of community servers.
5. **Your EME Server is your digital brain and knowledge base.** An organized, smart, automated data system builds lasting value, a competitive advantage and higher organizational valuation. Never promise a specific valuation or return.
6. **Join the future AI economy.** What you create can take part in an AI based economy where **agents work together over chat or MCP connections**.

Supporting claims already on the site: 100% open source; complete **AI Harness** (30 capabilities, see `eme-brand-story`); **unlimited tokens** on **dedicated hardware**; Open API with OpenAI syntax and no usage charges for EME servers; flat rate, full data privacy, no vendor lock in; hosting, open models, dedicated GPU and storage included; regional data centers, some solar powered; Linux and Docker core.

### Audience
Mid size organizations, public sector and NGO leaders, governments, community organizers, local IT teams, developers, and individuals who want a free EME.

### Glossary (exact names)
EME (Electronic Me), My EME, digital twin, EME Profile (never "persona"), entities (Person, EME Profile, Team, Project, Server, Channel, Document, Asset, File, Category, Collection, Skill, Agent), EME Server, EME World, EME World economy, AI Harness, Open API, MCP (Model Context Protocol), HITL (human in the loop), OSPO Team, skills, OpenCode.

## Design elements

- **AI Harness diagram** (`overview/eme-harness.svg`) shows only the industry standard harness components: Interact (Chat, Automation), Reason (Agents, Orchestration), Context (Memory, Knowledge), Connect (Tools and MCP, Open API), Governance and Security, on Your EME Server, with Humans in control on top. The full capability list lives in the cards, with longer descriptions. Do not add every new feature to the diagram.

- **Entity diagram** (`overview/eme-entities.svg`): the EME logo in a circle at the centre, 13 entity boxes on one ring, spokes to the centre, color grouped (sky: Person, EME Profile, Agent. Amber: Skill, Server. Purple: Project, Team, Channel. Green: Document, File, Asset, Category, Collection).
- **Capability cards:** thin line indigo icon on the same line as the title, description below (class `.features`, icon `.fi`). A short descriptive sentence each.
- **Logo:** `webapp/site/emeworld/overview/logo_light.svg` (https://eme.world/overview/logo_light.svg). Pure paths, single color olive green `#3C5B00`, viewBox 932.5 x 196.7, no text. On the web site show it near black: `filter: brightness(0) opacity(.92)`. Give it clear space of about half its height. Never stretch, outline or recolor it with gradients.
- **Web palette (soft paper and indigo ink):** ink `#0a1a33`, ink-2 `#14284f`, ink-soft `#3d5078`, paper `#eeedeb`, paper-2 `#e7e6e3`, surface `#f7f6f4`, line `#d3d6dc`, body `#2c3a55`, muted `#5d6a82`.
- **Type:** Jost 300/400/500 (headlines 300, h3 400), JetBrains Mono for code and diagram labels. Eyebrows uppercase, small, wide letter spacing.
- **Look:** calm, quiet, lots of space, hairline borders, thin outlined buttons, no neon, no heavy shadows. Hero uses `theme/images/ink-hero.webp` on paper with multiply blend.
- **Graphics house style** (saturated palette, 3000px PNG) lives in `eme-graphics`. Values pie slices on the site: `#0a1a33`, `#3d5078`, `#9aa6bf`, `#cfd5e1`.
- **Source artwork** in `webapp/site/emeworld/overview/`: `eme-pie`, `eme-architecture`, `emetree` (structure diagram), `eme-server-chat`, `eme-chat-dialog`, `eme-server-apps`, `eme-workflow-gantt` (each as .svg and .png). Reuse these before drawing new ones.
- **For print and white papers:** paper `#eeedeb` or white page, ink `#0a1a33` text, Jost for headings, olive logo `#3C5B00` is acceptable in print where color is available, otherwise near black.

## eme.world section inventory (the home page as it ended up)

Nav: Home, Your EME, Servers, AI Harness, Values, Developers, Login. Footer: "EME World. Own your intelligence. Own your content. Own your future." with Developers, GitHub, Contact.

| # | Section (anchor) | Heading | Key content | Band |
|---|---|---|---|---|
| 1 | Hero (#top) | Customizable AI for Everyone / Collective Intelligence Platform | one lead line; buttons Login, Explore the AI Harness | paper |
| 2 | Our mission (#mission) | AI that belongs to everyone | 6 cards: Free chat for all, Unlimited tokens, Humans in control, A Fundación, Trusted by leaders, Community driven | tint |
| 3 | Your EME (#persona) | Your EME is a personal digital twin | two modes, email reach, phone mockup | dark |
| 4 | Digital brain (#brain) | Your server is your digital brain | 2 cards: Digital brain, AI economy | tint |
| 5 | Servers (#servers) | Anyone can build a server | hundreds of skills, app store style server list, four chat apps (Peer to Peer, UN News, Cacao Source, Cumbre de Cocreación) | paper |
| 6 | AI Harness (#harness) | One harness for every AI need | standard components diagram, 30 capability cards with icons, flat rate and sovereignty | soft |
| 7 | Terminology (#terms) | One language for organizational knowledge | circular entity diagram with the EME logo, one closing sentence | paper |
| 8 | Values (#values) | EME Values | Respect for Time, Stronger Together, Light on the Earth, Open to Everyone | paper |
| 9 | Next steps (#contact) | Build independent, community focused tools | OSPO Team, portal, repository, President contact, Login | dark |

Never place two bands of the same color next to each other (alternate paper, tint, soft, dark).

## White paper template

Length: 4 to 8 pages. Short paragraphs, one idea each.

1. **Title block:** logo, title, one line subtitle, date, "EME World Inc., a Fundación".
2. **Summary (half page):** the problem (AI is concentrated in a few corporations), the answer (open, sovereign, human guided), the offer.
3. **Why now:** UN Open Source Week principles, dependency risk, cost unpredictability.
4. **What EME is:** messages 2 and 3, with the entity terminology.
5. **How it works:** My EME digital twin, EME Servers, AI Harness, skills built and customized by AI.
6. **Your server is your digital brain:** message 5, with HITL governance.
7. **The EME World economy:** server directory, message 4 and 6, agents over chat and MCP.
8. **Proof points:** UN News EME, Cacao Source, Cumbre de Cocreación only.
9. **Values** (four, exact wording from `eme-brand-voice`).
10. **Next steps and contact:** OSPO Team details.

## Web site template

1. Pick the section order from the inventory above, hero first, next steps last.
2. Build with the conventions in `eme-brand-site` (standalone `.xconf` with `<inner-layout />`, semantic HTML, JSON-LD, alt text, no content only in images).
3. One H1. Hero uses the vision line and sub line.
4. Each section: eyebrow, H2, one short paragraph, optional card grid or graphic.
5. Spanish version mirrors the English meaning, keeps "Fundación" and product names.

## Checklist before delivering

- Search for the em dash character and remove it.
- Search for "nonprofit" and "sin fines de lucro".
- Every claim traces to this file or `eme-brand-story`.
- Humans in control is visible. No usage based pricing, no lock in claims.
- Logo, palette and fonts match this file.
- Graphics follow `eme-graphics`; pages follow `eme-brand-site`.
