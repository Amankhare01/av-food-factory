export type WAMsg = {
  id: string;
  from: string;
  timestamp: string;
  type: string;
  text?: { body: string };
  interactive?: {
    type: "button_reply" | "list_reply";
    button_reply?: { id: string; title: string };
    list_reply?: { id: string; title: string; description?: string };
  };
  button_reply?: { id: string; title: string };
  list_reply?: { id: string; title: string; description?: string };
};

export type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
};
