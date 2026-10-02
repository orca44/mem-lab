// The only place references are listed. Links checked and content re-read on 2026-10-01.
export type Source = { label: string; url: string; type: "Research" | "Documentation"; supports: string };

export const sources = {
  coala: { type: "Research", label: "Sumers et al. · Cognitive Architectures for Language Agents (CoALA)", url: "https://arxiv.org/abs/2309.02427", supports: "The working, episodic, semantic, and procedural memory split. CoALA’s procedural memory also includes model weights and code; this app shows only written playbooks." },
  memgpt: { type: "Research", label: "Packer et al. · MemGPT", url: "https://arxiv.org/abs/2310.08560", supports: "Moving information between a limited context window and outside storage." },
  generative: { type: "Research", label: "Park et al. · Generative Agents", url: "https://arxiv.org/abs/2304.03442", supports: "Recording experiences, retrieving the relevant ones and reflecting on them." },
  lostmiddle: { type: "Research", label: "Liu et al. · Lost in the Middle", url: "https://arxiv.org/abs/2307.03172", supports: "Models use facts best at the start or end of a long input, so retrieve less." },
  longmem: { type: "Research", label: "Wu et al. · LongMemEval", url: "https://arxiv.org/abs/2410.10813v2", supports: "Testing memory on updates, time, and knowing when to abstain. Our six questions are a demonstration, not this benchmark." },
  rag: { type: "Research", label: "Lewis et al. · Retrieval-augmented generation", url: "https://arxiv.org/abs/2005.11401", supports: "Retrieving evidence and passing it to a generator. The lab shows only the retrieval step." },
  memory: { type: "Documentation", label: "LangChain · Memory concepts", url: "https://docs.langchain.com/oss/python/concepts/memory", supports: "Short-term (thread) and long-term memory, and saving memories during a reply or in the background." },
  context: { type: "Documentation", label: "Anthropic · Context engineering", url: "https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents", supports: "Choosing the smallest set of high-signal context, and summarizing long histories." },
  retrieval: { type: "Documentation", label: "Stanford IR · Precision and recall", url: "https://nlp.stanford.edu/IR-book/html/htmledition/evaluation-of-unranked-retrieval-sets-1.html", supports: "How precision and recall are calculated." },
  injection: { type: "Documentation", label: "OWASP · Prompt injection prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html", supports: "Attacks that persist in memory, and keeping instructions apart from untrusted data." },
  storage: { type: "Documentation", label: "MDN · Browser localStorage", url: "https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage", supports: "How this app saves memories in your browser, and why saving can fail." },
  tabs: { type: "Documentation", label: "MDN · Storage events", url: "https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event", supports: "Noticing when another tab changes saved memories." },
  locks: { type: "Documentation", label: "MDN · Web Locks", url: "https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API", supports: "Letting one tab save at a time." },
  outbox: { type: "Documentation", label: "AWS · Transactional outbox", url: "https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html", supports: "Saving a change and its update event together, with consumers that tolerate duplicates." },
  cache: { type: "Documentation", label: "AWS · Database caching patterns", url: "https://docs.aws.amazon.com/whitepapers/latest/database-caching-strategies-using-redis/caching-patterns.html", supports: "Checking a cache first and falling back to the database. Our hit rates are assumptions." },
  failover: { type: "Documentation", label: "PostgreSQL · Failover", url: "https://www.postgresql.org/docs/17/warm-standby-failover.html", supports: "Stopping the old primary before a replica takes over." },
  monitoring: { type: "Documentation", label: "Google SRE · Monitoring signals", url: "https://sre.google/sre-book/monitoring-distributed-systems/", supports: "Latency, traffic, errors, and saturation: the signals the queue simulation shows." },
  brick: { type: "Documentation", label: "Brick · Building relationships", url: "https://docs.brickschema.org/brick/relationships.html", supports: "Linking rooms, equipment, and sensor points. It does not validate our fictional buildings." },
  offline: { type: "Documentation", label: "Microsoft · Offline edge devices", url: "https://learn.microsoft.com/en-us/azure/iot-edge/offline-capabilities", supports: "A gateway that keeps working offline and stores messages within time and disk limits." },
  charts: { type: "Documentation", label: "W3C WAI · Accessible complex images", url: "https://www.w3.org/WAI/tutorials/images/complex/", supports: "Giving every chart a text summary and its exact data." },
} as const satisfies Record<string, Source>;

export type SourceId = keyof typeof sources;

// Where each reference is used. Every section links here instead of listing references itself.
export const sections = {
  explore: { name: "Explore memory", ids: ["coala", "memory", "memgpt", "generative", "storage", "tabs", "locks"] },
  compare: { name: "Compare types", ids: ["coala", "memory"] },
  write: { name: "Save lab", ids: ["memory", "longmem", "injection"] },
  retrieve: { name: "Find lab", ids: ["memory", "memgpt", "context", "lostmiddle", "retrieval", "rag"] },
  evaluate: { name: "Test lab", ids: ["longmem", "retrieval"] },
  govern: { name: "Forget lab", ids: ["injection", "outbox", "storage"] },
  scale: { name: "Design for scale", ids: ["brick", "offline", "outbox", "cache", "failover", "monitoring", "context", "lostmiddle", "charts"] },
} as const satisfies Record<string, { name: string; ids: readonly SourceId[] }>;

export type SectionId = keyof typeof sections;
export const checkedOn = "1 October 2026";
