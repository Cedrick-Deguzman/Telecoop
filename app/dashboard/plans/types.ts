export type PlanClient = {
  id: number;
  status: string;
};

export type PlanColorClasses = Record<
  "indigo" | "purple" | "pink" | "amber",
  {
    bg: string;
    border: string;
    button: string;
    iconBg?: string;
    icon?: string;
    text?: string;
  }
>;

export type PlanType = {
  id: number;
  name: string;
  speed: string;
  price: number;
  color: "indigo" | "purple" | "pink" | "amber";
  features: string[];
  clients: PlanClient[];
  isActive?: number;
  subscribers: number;
  icon: string;
};
