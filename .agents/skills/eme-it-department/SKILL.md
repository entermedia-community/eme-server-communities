---
name: eme-it-department
description: Use when writing or speaking to IT departments, CIOs, infrastructure, security and platform teams about EME (pitches, one pagers, emails, proposals, call prep, FAQ answers). Covers what IT leaders need, how to frame EME for them, the technical facts they ask about, the deployment options, the pilot path, and what we must not claim. Pair with eme-brand-voice for wording and eme-brand-story for names and proof points.
---

# Talking to IT departments about EME

Wording, punctuation and vocabulary follow `eme-brand-voice` (no em dashes, company not Foundation, eME Profile, short text, no bold inside text). Names, positioning and proof points follow `eme-brand-story`. This skill only adds what is specific to IT: their needs, our framing and the technical facts. Do not repeat the home page pitch, the 30 capability cards or the harness diagram here. Point to them.

## What IT leaders need

| Need | What they are really asking |
|---|---|
| **Control** | Can we run it ourselves, change it and leave without losing anything? |
| **Data sovereignty** | Where does our data live, who can read it, does a vendor train on it? |
| **Predictable cost** | Will the bill stay flat when usage grows? |
| **Security and governance** | Who can do what, what is logged, who approves risky actions? |
| **Fit with what we run** | Linux, Docker, Git, our CMS, our email, our own models? |
| **Supportability** | Who maintains it, how do updates arrive, how do we get help? |

## How we frame EME for them

1. **Lead with their problem, not our features.** Open with one of the needs above, then show how EME answers it.
2. **One sentence:** EME is an open source AI platform you can run on your own server, with your own data, a flat price and humans approving the key actions.
3. **Say "sovereign" and "self contained", not "revolutionary".** IT trusts boring and verifiable. Name the technology: Java, Linux, Docker, Git.
4. **Humans in control is a governance feature.** Present it as approval gates on risky actions, not as a limit on the AI.
5. **Show the exit.** Everything is files and open formats, so leaving is easy. That builds trust faster than any promise.
6. **Start small.** Offer a free test before any budget conversation (see "Pilot path").
7. **Be honest about gaps.** If we do not have a document for a question (see "Not documented"), say we will follow up. Do not guess.

## Technical facts they ask about

Source: `webapp/site/emeworld/architecture.html`, `overview/eme-object-architecture.svg` (EME Server Layered Architecture) and the `developers.html` tutorial. Do not add facts that are not in those sources or in the code.

| Topic | Fact |
|---|---|
| **Stack** | Java server, Linux and Docker, 100% open source (repo: github.com/entermedia-community/eme-server) |
| **Self contained** | Each EME Server runs on its own. The only harness built this way |
| **Search** | Embedded ElasticSearch with vector search, so nothing external to run |
| **Storage** | Pages and data are files, versioned in Git. Easy to back up, diff and move |
| **Models** | Model Connectors for Gemini, OpenAI, Ollama and Llama. A Qwen open source model is the default on EME hosted servers. Bring your own model through the connector or MCP |
| **Automation** | Skills and Agent Jobs run under a Job Manager. Skills are Java classes (see `create-java-ai-skill`) |
| **Integration** | MCP server and client, the Open API (REST, OpenAI syntax compatible, no usage charge), Websockets. UN News connects to a Drupal CMS this way |
| **Auth** | SSO with Microsoft, Google or any OAuth 2 provider. Also public and private key signatures, with login by emailed code, registered key or application password (see `mediadb-auth`) |
| **Front ends** | Flutter for iOS, Android and web (EME.world, Data Tools) |
| **Extending** | Plugins in Java and HTML. Page logic stays in Java classes, not scripts |
| **Ops** | Docker, Git and Linux friendly. Deploy direct to a server from Git (see `deploy-eme-server`) |
| **Cost to run** | Flat rate. Unlimited tokens on dedicated hardware. No per token fees |

## Security and governance

- **Human in the loop (HITL):** high risk actions such as database changes, payments or publishing wait for a person to approve.
- **Sandboxing and scope:** generated scripts run isolated, file access is limited to a scope, and destructive commands are blocked. Describe these as design goals unless the user confirms the exact controls for a given audience.
- **Ownership and portability:** the customer owns all data. It is never mined or sold, and can be exported or moved to another EME Server.
- **Governance:** EME World Inc. runs an Open Source Program Office with monthly community meetings.

## Deployment options

| Option | Good for | Notes |
|---|---|---|
| **My EME** | A person or small team trying it | Free (ask the user whether My eME stays free) |
| **Hosted EME Server** | Teams who want it running without ops work | Hosting is sold by EME World Inc. ($150 per month with eME Pro). Consulting is quoted one on one |
| **Co-located dedicated hardware** | Teams who want their own hardware, run by EME | Dedicated GPUs and RAID storage, in professional data centers |
| **Self hosted** | IT departments who want full control | Your Linux or Docker host, code from GitHub, deployed from Git |

Keep prices current by reading `costs.html`. A sample managed deployment for UN News was written as a flat $4,500 per year including server, open models, a Drupal connector, dedicated GPU and storage, and updates. Confirm with the user before quoting it to a new customer.

## Pilot path (what we suggest to IT)

1. **Try My EME** (free) to see chat, the EME Profile and the harness.
2. **Stand up one EME Server** hosted by us or on your own host, for one team and one real task (for example transcripts, translation or document search).
3. **Connect one system** such as a CMS, email or your own model.
4. **Review governance:** approvals, access and logs with your security team.
5. **Scale** to more teams and servers, or take it fully in house.

## Questions IT asks, short answers

| Question | Answer |
|---|---|
| Where does our data live? | On your EME Server, in files and an embedded index. You choose the host. It is never harvested |
| Can we run it ourselves? | Yes. It is open source Java on Linux and Docker, deployed from Git |
| Can we use our own models? | Yes, through the model connectors or MCP. Hosted servers default to an open source Qwen model |
| What does it cost to grow? | The price is flat. There are no per token fees |
| What if we leave? | Export your data or move it to another EME Server |
| Who approves risky actions? | A person, by design. That is the human in the loop gate |
| How do we integrate? | Open API, MCP, and connectors such as Drupal |

## Not documented, do not claim

Ask the user before stating any of these: SSO, LDAP or SAML support, compliance certifications (SOC 2, ISO 27001, HIPAA, GDPR statements), uptime SLAs, formal penetration test results, support response times, and the exact list of data center locations. Earlier notes mention regional nodes in the USA, Germany, India and England, with South America and Africa planned. Treat that list as unconfirmed until the user says it is current.

## Avoid

- Naming or criticizing other products or vendors. Compare by category instead (cloud AI APIs, in house scripts) and keep it factual.
- Any claim about speed, savings or return that we cannot show.
- Jargon without a reason. Say what a term does the first time.
- Promising the AI acts alone. Humans approve the key actions.

## Links

- Portal: eme.world
- Code: github.com/entermedia-community/eme-server
- Architecture page: `webapp/site/emeworld/architecture.html`
- Developer tutorial: `webapp/site/emeworld/developers.html`
- Budget page: `webapp/site/emeworld/costs.html`
- Contact: EME World OSPO Team (details in `eme-brand-story`)
