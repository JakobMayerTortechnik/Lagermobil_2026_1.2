'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting reorder quantities based on historical data.
 *
 * - suggestReorderQuantities - A function that takes historical sales data and current stock levels
 *   and suggests optimal reorder quantities for each item.
 * - SuggestReorderQuantitiesInput - The input type for the suggestReorderQuantities function.
 * - SuggestReorderQuantitiesOutput - The return type for the suggestReorderQuantities function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestReorderQuantitiesInputSchema = z.object({
  historicalSalesData: z
    .array(
      z.object({
        itemId: z.string(),
        quantitySold: z.number(),
        date: z.string(),
      })
    )
    .describe('Historical consumption data from past assemblies.'),
  currentStockLevels: z
    .array(
      z.object({
        itemId: z.string(),
        quantity: z.number(),
        targetLevel: z.number(),
      })
    )
    .describe('Current stock levels for each item.'),
});
export type SuggestReorderQuantitiesInput = z.infer<
  typeof SuggestReorderQuantitiesInputSchema
>;

const SuggestReorderQuantitiesOutputSchema = z.array(z.object({
  itemId: z.string().describe('The ID of the item.'),
  reorderQuantity: z.number().describe('The suggested reorder quantity. Should be 0 if current stock is at or above target.'),
}));
export type SuggestReorderQuantitiesOutput = z.infer<
  typeof SuggestReorderQuantitiesOutputSchema
>;

export async function suggestReorderQuantities(
  input: SuggestReorderQuantitiesInput
): Promise<SuggestReorderQuantitiesOutput> {
  return suggestReorderQuantitiesFlow(input);
}

const suggestReorderQuantitiesPrompt = ai.definePrompt({
  name: 'suggestReorderQuantitiesPrompt',
  input: {schema: SuggestReorderQuantitiesInputSchema},
  output: {schema: SuggestReorderQuantitiesOutputSchema},
  prompt: `You are an inventory management assistant for a mobile technician.
  Your task is to analyze historical consumption data and current stock levels to suggest optimal reorder quantities for each item.

  The goal is to replenish stock to meet the target level.
  The reorder quantity should be the difference between the target stock and the current stock.
  If the current stock is already at or above the target stock, the reorder quantity must be 0.
  Do not suggest reordering items that are sufficiently stocked.
  Base your primary calculation on the simple formula: reorderQuantity = max(0, targetLevel - currentStock).
  The historical data provides context on consumption velocity but the main rule is to replenish to the target level.
  
  Output a JSON array of objects, where each object contains the 'itemId' and the calculated 'reorderQuantity'.

  Historical Consumption Data:
  {{#if historicalSalesData.length}}
  {{#each historicalSalesData}}
  - Item ID: {{this.itemId}}, Quantity Consumed: {{this.quantitySold}}, Date: {{this.date}}
  {{/each}}
  {{else}}
  No historical data available.
  {{/if}}

  Current Stock Levels:
  {{#each currentStockLevels}}
  - Item ID: {{this.itemId}}, Current Quantity: {{this.quantity}}, Target Level: {{this.targetLevel}}
  {{/each}}`,
});

const suggestReorderQuantitiesFlow = ai.defineFlow(
  {
    name: 'suggestReorderQuantitiesFlow',
    inputSchema: SuggestReorderQuantitiesInputSchema,
    outputSchema: SuggestReorderQuantitiesOutputSchema,
  },
  async input => {
    const {output} = await suggestReorderQuantitiesPrompt(input);
    return output!;
  }
);
