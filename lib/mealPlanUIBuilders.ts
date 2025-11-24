// lib/mealPlanUiBuilders.ts
export function buildText(to: string, body: string) {
  return { messaging_product: "whatsapp", to, type: "text", text: { body, preview_url: false } };
}

export function buildButtons(to: string, body: string, buttons: { id: string; title: string }[]) {
  return {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: body },
      action: {
        buttons: buttons.map((b) => ({ type: "reply", reply: { id: b.id, title: b.title } })),
      },
    },
  };
}
