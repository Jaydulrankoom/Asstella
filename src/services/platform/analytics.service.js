import { db } from '../../config/firebase.js';

export class PlatformAnalyticsService {
  static async getGrowth() {
    // Aggregation logic for growth metrics
    // Mocking for now to avoid complex map-reduce in rules-constrained env
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return {
      tenants_by_month: months.map((m, i) => ({
        month: `${m} 2026`,
        new_tenants: 8 + Math.floor(Math.random() * 5),
        churned: Math.floor(Math.random() * 2),
        net: 7 + Math.floor(Math.random() * 4)
      })),
      revenue_by_month: months.map((m, i) => ({
        month: `${m} 2026`,
        mrr: 120000 + (i * 15000),
        new_mrr: 15000,
        expansion_mrr: 2000,
        churned_mrr: 1000
      })),
      tenants_by_plan: [
        { plan: 'Starter', count: 45, percentage: 45 },
        { plan: 'Professional', count: 35, percentage: 35 },
        { plan: 'Enterprise', count: 20, percentage: 20 }
      ],
      tenants_by_country: [
        { country: 'USA', count: 40 },
        { country: 'UK', count: 20 },
        { country: 'Germany', count: 15 },
        { country: 'India', count: 25 }
      ],
      churn_rate: "2.45",
      avg_revenue_per_tenant: 3500
    };
  }
}
