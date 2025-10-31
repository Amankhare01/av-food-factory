export type WAMsg = {
  id: string;
  from: string;
  timestamp: string;
  type: "text" | "interactive" | "location" | string;
  text?: { body: string };
  interactive?: {
    type: "button_reply" | "list_reply";
    button_reply?: { id: string; title: string };
    list_reply?: { id: string; title: string };
  };
};

export type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
};
