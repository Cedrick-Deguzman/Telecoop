export type PlanType = {
  id: number;
  name: string;
  speed: string;
  price: number;
  color: "indigo" | "purple" | "pink" | "amber";
  features: string[];
  clients: any[];
  isActive?: number;
  subscribers: number;
  icon: string;
};
