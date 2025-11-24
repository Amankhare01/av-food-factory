// lib/mealPlannerAI.ts
export async function generateMealPlanAI(goal: string, diet: string, mealsPerDay: number): Promise<string> {
  const OPENAI_KEY = process.env.OPENAI_API_KEY;
  const prompt = `Create a concise ${mealsPerDay}-meal daily plan for a user with goal "${goal}" and diet "${diet}". 
Return short lines for each meal (Breakfast / Mid / Lunch / Snack / Dinner etc depending on mealsPerDay) and 2 tips.`;

  if (!OPENAI_KEY) {
    // Deterministic fallback sample
    const meals = [];
    for (let i = 1; i <= mealsPerDay; i++) {
      meals.push(`Meal ${i}: Balanced portion — protein + veg + complex carb (sample).`);
    }
    return `${meals.join("\n")}\n\nTips:\n1. Keep portions moderate.\n2. Hydrate well.`;
  }

  // Minimal OpenAI fetch (Chat Completions). Use your preferred client or the official SDK if available.
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // change to your model of choice
        messages: [{ role: "system", content: "You are a helpful meal planner." }, { role: "user", content: prompt }],
        max_tokens: 400,
        temperature: 0.6,
      }),
    });

    const json = await res.json();
    const text = json?.choices?.[0]?.message?.content;
    if (text && typeof text === "string") return text.trim();
    // fallback
    return "Simple plan: Breakfast - light + protein; Lunch - balanced; Dinner - light. Tips: hydrate, avoid late-night snacking.";
  } catch (err) {
    console.error("AI call failed:", err);
    return "Sample plan: Breakfast - oats + fruit; Lunch - dal + rice + veggie; Dinner - soup + salad.\nTips: hydrate and sleep well.";
  }
}
