export interface DashboardData {
  kpis: {
    activeMembers: number;
    totalOrders: number;
    paidOrders: number;
    pendingPayments: number;
    expiredPayments: number;
    distributedOrders: number;
    participationPercentage: number;
    receivedAmount: number;
    totalSubsidy: number;
    totalGoodieBag: number;
    totalApplicationFee: number;
  };
  byArea: GroupedSummary[];
  byBatch: GroupedSummary[];
  byProduct: ProductSummary[];
}

export interface GroupedSummary {
  label: string;
  total: number;
  paid: number;
}

export interface ProductSummary {
  productName: string;
  quantity: number;
}
