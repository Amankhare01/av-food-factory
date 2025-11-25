import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY});
export async function generateMealPlanAI({
  goal,
  diet,
  mealsPerDay,
  allergies,
  cuisine,
}: {
  goal: string;
  diet: string;
  mealsPerDay: number;
  allergies: string;
  cuisine: string;
}) {
  const prompt = `
You are a professional nutritionist. 
Create a ${mealsPerDay}-meal per day plan for someone with goal: ${goal}, diet: ${diet}.
Allergies/restrictions: ${allergies}.
Preferred/disliked cuisines: ${cuisine}.
Format as:
Breakfast: ...
Snack: ...
Lunch: ...
Snack: ...
Dinner: ...
Provide approximate calories per meal and a total daily calorie estimate.
Keep it concise (less than 500 words).
  `;
  
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  return res.choices[0]?.message?.content?.trim() || "Unable to generate plan.";
}
