export interface StockData {
  symbol: string;
  name: string;
  sector: string;
  price: number;       // Base price for reference
  fair_value: number;
  current_price: number; // Simulates live price
  margin_of_safety: number;
}

export interface MasterWisdom {
  sentiment: string;
  quote: string;
  analysis: string;
  strategy: string;
  strategyColor: string;
  checklist: {
    earnings: boolean;
    debt: boolean;
    dividend: boolean;
    cheap: boolean;
  };
}

export enum StockListType {
  OPPORTUNITY = 'opportunity',
  RISK = 'risk',
}