/**
 * WhatsApp incoming message structure
 */
export type WAMsg = {
  id: string;
  from: string; // WhatsApp number in E.164 without '+'
  timestamp: string;
  type: "text" | "interactive" | "location" | string;
  text?: {
    body: string;
  };
  interactive?: {
    type: "button_reply" | "list_reply";
    button_reply?: {
      id: string;
      title: string;
    };
    list_reply?: {
      id: string;
      title: string;
      description?: string;
    };
  };
  location?: {
    latitude: string;
    longitude: string;
    name?: string;
    address?: string;
  };
};

/**
 * Cart item used in Session and Order models
 */
export type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

/**
 * FSM (Finite State Machine) for user flow
 */
export type SessionState =
  | "IDLE"
  | "BROWSING_MENU"
  | "ADDING_ITEM_QTY"
  | "ASK_ADDRESS"
  | "CONFIRMING_ORDER"
  | "DONE";

/**
 * Outgoing message type for WhatsApp Cloud API
 */
export type OutgoingMessage =
  | {
      messaging_product: "whatsapp";
      to: string;
      type: "text";
      text: { body: string };
    }
  | {
      messaging_product: "whatsapp";
      to: string;
      type: "interactive";
      interactive:
        | {
            type: "button";
            body: { text: string };
            action: { buttons: { type: "reply"; reply: { id: string; title: string } }[] };
          }
        | {
            type: "list";
            header: { type: "text"; text: string };
            body: { text: string };
            action: {
              sections: {
                title: string;
                rows: { id: string; title: string; description?: string }[];
              }[];
            };
          };
    };
