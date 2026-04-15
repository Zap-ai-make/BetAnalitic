import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { agentRegistry } from "~/lib/agents";

export const agentsRouter = createTRPCRouter({
  /**
   * Get all agents
   */
  getAll: protectedProcedure.query(() => {
    return agentRegistry.getAll();
  }),

  /**
   * Get agent by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      const agent = agentRegistry.getById(input.id);
      if (!agent) {
        throw new Error(`Agent ${input.id} not found`);
      }
      return agent;
    }),

  /**
   * Get agents by category
   */
  getByCategory: protectedProcedure
    .input(
      z.object({
        category: z.enum(["Data", "Analyse", "Marché", "Intel", "Live"]),
      })
    )
    .query(({ input }) => {
      return agentRegistry.getByCategory(input.category);
    }),

  /**
   * Get enabled agents only
   */
  getEnabled: protectedProcedure.query(() => {
    return agentRegistry.getEnabled();
  }),
});
