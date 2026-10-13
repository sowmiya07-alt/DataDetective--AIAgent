/**
 * Seed historical analyses for the Analysis History view
 */

export const SEED_HISTORY = [
  {
    id: 'hist-1',
    datasetId: 'demo-saas',
    datasetName: 'SaaS_Revenue_&_Customer_Retention_2026.csv',
    question: 'Which customer subscription tier has the highest average Monthly Revenue and lowest churn?',
    queryType: 'Comparative Analysis',
    status: 'Completed',
    executionTimeMs: 412,
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    summaryResult: 'Enterprise tier generates the highest average Monthly Revenue ($4,890) with an 8.2% churn risk, compared to Starter ($245) with 24.1% churn.',
    chartType: 'bar',
    isDemo: true
  },
  {
    id: 'hist-2',
    datasetId: 'demo-ecommerce',
    datasetName: 'Ecommerce_Omnichannel_Transactions.xlsx',
    question: 'What are the return rates across major product categories and devices?',
    queryType: 'Categorical Breakdown',
    status: 'Completed',
    executionTimeMs: 380,
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    summaryResult: 'Fashion & Apparel has the highest return rate at 18.5%, predominantly ordered via Mobile Web. Electronics had the lowest return rate (3.4%).',
    chartType: 'pie',
    isDemo: true
  },
  {
    id: 'hist-3',
    datasetId: 'demo-logistics',
    datasetName: 'Global_Supply_Chain_Freight_Metrics.csv',
    question: 'Are there significant transit day delays correlating with specific carriers or origin ports?',
    queryType: 'Correlation & SLA',
    status: 'Completed',
    executionTimeMs: 520,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    summaryResult: 'Shipments originating from Rotterdam exhibited a 4.2-day average delay during stormy weather periods. DHL Express maintained 94.2% on-time performance.',
    chartType: 'line',
    isDemo: true
  },
  {
    id: 'hist-4',
    datasetId: 'demo-saas',
    datasetName: 'SaaS_Revenue_&_Customer_Retention_2026.csv',
    question: 'Detect missing values, statistical anomalies, and outliers in Customer Health Scores',
    queryType: 'Data Profiling & Anomaly',
    status: 'Completed',
    executionTimeMs: 295,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    summaryResult: 'Zero missing values identified. 3 accounts were flagged as outliers with high revenue ($5,200+) but critically low usage health score (<30).',
    chartType: 'bar',
    isDemo: true
  }
];
