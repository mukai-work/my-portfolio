export interface CardPayload {
  name: string;
  setName?: string;
  rarity?: string;
  quantity: number;
  price: number;
}

export interface Card extends CardPayload {
  id: number;
}
