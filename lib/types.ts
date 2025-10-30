export type WAMsg = {
  from: string; // user phone (E.164 without +) from WhatsApp
  id: string;   // WA message id
  timestamp: string;
  type: "text" | "interactive" | "image" | "audio" | "location" | string;
  text?: { body: string };
  interactive?: {
    type: "button_reply" | "list_reply";
    button_reply?: { id: string; title: string };
    list_reply?: { id: string; title: string; description?: string };
  };
  location?: { latitude: string; longitude: string; name?: string; address?: string };
};

export type CartItem = { id: string; name: string; price: number; qty: number };

export type SessionState =
  | "IDLE"
  | "BROWSING_MENU"
  | "ADDING_ITEM_QTY"
  | "ASK_ADDRESS"
  | "CONFIRMING_ORDER"
  | "DONE";
