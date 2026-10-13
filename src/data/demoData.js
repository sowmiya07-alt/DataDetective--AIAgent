import { profileDataset } from '../utils/fileParser';

// Generator for realistic SaaS dataset
function generateSaaSData() {
  const tiers = ['Starter', 'Professional', 'Enterprise', 'Scale'];
  const churnStatuses = ['Retained', 'Retained', 'Retained', 'Churned', 'At-Risk'];
  const renewalMonths = ['Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026', 'May 2026', 'Jun 2026', 'Jul 2026', 'Aug 2026'];
  const industries = ['Fintech', 'HealthTech', 'E-Commerce', 'Cybersecurity', 'EdTech', 'MarTech'];

  const rows = [];
  for (let i = 1; i <= 150; i++) {
    const tier = tiers[i % tiers.length];
    const baseMRR = tier === 'Starter' ? 240 : tier === 'Professional' ? 790 : tier === 'Scale' ? 1850 : 4900;
    const mrr = Math.round(baseMRR + (Math.sin(i * 13) * 0.25 * baseMRR));
    const activeUsers = tier === 'Starter' ? Math.floor(5 + (i % 15)) : tier === 'Professional' ? Math.floor(25 + (i % 60)) : Math.floor(120 + (i % 350));
    const nps = Math.min(10, Math.max(1, Math.round(7.2 + Math.cos(i) * 2.8)));
    const churn = churnStatuses[i % churnStatuses.length];
    const tickets = Math.floor(1 + ((i * 7) % 12));
    const usageScore = Math.min(99, Math.max(25, Math.round(65 + Math.sin(i * 3) * 30)));
    const cac = Math.round(mrr * (tier === 'Enterprise' ? 2.8 : 1.4));

    rows.push({
      AccountID: `ACC-${1000 + i}`,
      Company: `Acme ${industries[i % industries.length]} #${i}`,
      Tier: tier,
      Industry: industries[i % industries.length],
      MonthlyRevenue: mrr,
      ActiveUsers: activeUsers,
      NPS: nps,
      Status: churn,
      SupportTickets: tickets,
      HealthScore: usageScore,
      CAC: cac,
      RenewalDate: renewalMonths[i % renewalMonths.length]
    });
  }
  return rows;
}

// Generator for realistic E-Commerce transactions
function generateEcommerceData() {
  const categories = ['Electronics', 'Home & Garden', 'Fashion & Apparel', 'Health & Beauty', 'Sports & Outdoors'];
  const genders = ['Female', 'Male', 'Non-Binary'];
  const devices = ['Mobile App', 'Desktop Web', 'Mobile Web', 'Tablet'];
  const paymentMethods = ['Credit Card', 'PayPal', 'Apple Pay', 'Klarna', 'Google Pay'];

  const rows = [];
  for (let i = 1; i <= 180; i++) {
    const category = categories[i % categories.length];
    const baseSpend = category === 'Electronics' ? 420 : category === 'Fashion & Apparel' ? 135 : category === 'Home & Garden' ? 210 : 95;
    const orderTotal = Math.round(baseSpend + Math.abs(Math.sin(i * 7)) * baseSpend * 0.8);
    const items = Math.floor(1 + ((i * 3) % 8));
    const age = 21 + ((i * 5) % 45);
    const isReturned = i % 11 === 0 ? 'Yes' : 'No';
    const rating = Math.min(5, Math.max(1, Math.round(4.1 + Math.sin(i) * 1.2)));

    rows.push({
      OrderID: `ORD-${5000 + i}`,
      CustomerAge: age,
      Gender: genders[i % genders.length],
      Category: category,
      OrderTotal: orderTotal,
      ItemsPurchased: items,
      Device: devices[i % devices.length],
      PaymentMethod: paymentMethods[i % paymentMethods.length],
      CustomerRating: rating,
      Returned: isReturned
    });
  }
  return rows;
}

// Generator for Supply Chain & Logistics
function generateLogisticsData() {
  const origins = ['Los Angeles, USA', 'Shenzhen, CN', 'Rotterdam, NL', 'Singapore, SG', 'Frankfurt, DE'];
  const destinations = ['Chicago, USA', 'London, UK', 'Tokyo, JP', 'Toronto, CA', 'Sydney, AU'];
  const carriers = ['DHL Express', 'FedEx Global', 'Maersk Line', 'UPS Supply', 'Kuehne+Nagel'];
  const statuses = ['On-Time', 'On-Time', 'Delayed', 'On-Time', 'On-Time', 'Severely Delayed'];

  const rows = [];
  for (let i = 1; i <= 120; i++) {
    const carrier = carriers[i % carriers.length];
    const days = Math.round(3 + (i % 14) + (Math.cos(i) * 2));
    const weightKg = Math.round(15 + (i * 23) % 850);
    const cost = Math.round(weightKg * 3.4 + days * 45);
    const status = statuses[i % statuses.length];
    const damage = i % 29 === 0 ? 'Damaged' : 'Intact';

    rows.push({
      ShipmentID: `SHP-${8000 + i}`,
      Origin: origins[i % origins.length],
      Destination: destinations[i % destinations.length],
      Carrier: carrier,
      TransitDays: Math.max(1, days),
      WeightKg: weightKg,
      ShippingCost: cost,
      DeliveryStatus: status,
      Condition: damage
    });
  }
  return rows;
}

// Profile raw data into standardized dataset structures
export const DEMO_DATASETS = [
  {
    ...profileDataset(generateSaaSData(), 'SaaS_Revenue_&_Customer_Retention_2026.csv', 48200),
    id: 'demo-saas',
    name: 'SaaS_Revenue_&_Customer_Retention_2026.csv',
    description: 'B2B subscription metrics tracking monthly recurring revenue, customer health score, churn risks, and customer acquisition costs.',
    isDemo: true,
    category: 'Finance & B2B'
  },
  {
    ...profileDataset(generateEcommerceData(), 'Ecommerce_Omnichannel_Transactions.xlsx', 64100),
    id: 'demo-ecommerce',
    name: 'Ecommerce_Omnichannel_Transactions.xlsx',
    description: 'Retail transactions across categories, devices, average basket sizes, order returns, and customer satisfaction ratings.',
    isDemo: true,
    category: 'Retail & Consumer'
  },
  {
    ...profileDataset(generateLogisticsData(), 'Global_Supply_Chain_Freight_Metrics.csv', 39500),
    id: 'demo-logistics',
    name: 'Global_Supply_Chain_Freight_Metrics.csv',
    description: 'International freight routes, transit durations, carrier cost comparisons, delivery SLAs, and cargo damage rates.',
    isDemo: true,
    category: 'Operations & Logistics'
  }
];

export const INITIAL_DATASET = DEMO_DATASETS[0];
