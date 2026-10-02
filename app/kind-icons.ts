import { Database, History, MessageSquare, Workflow, Zap } from "lucide-react";
import type { MemoryId } from "@/lib/memory";

// One icon per memory type, shared by Explore, Compare and the labs.
export const kindIcons: Record<MemoryId, typeof Database> = { working: Zap, short: MessageSquare, semantic: Database, episodic: History, procedural: Workflow };
