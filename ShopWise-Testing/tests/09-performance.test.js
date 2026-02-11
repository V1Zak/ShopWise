import { describe, it } from 'chrometester';

describe('Performance Tests', () => {
  it.perf('should load dashboard with good performance', async ({ page, perf, expect }) => {
    await page.goto('http://localhost:5173/dashboard');
    const result = await perf.audit();

    // Basic performance checks
    expect(result.scores.performance).toBeGreaterThan(0.5);
  });

  it.perf('should load catalog with good performance', async ({ page, perf, expect }) => {
    await page.goto('http://localhost:5173/catalog');
    const result = await perf.audit();

    expect(result.scores.performance).toBeGreaterThan(0.5);
  });

  it.perf('should measure Core Web Vitals', async ({ page, perf }) => {
    await page.goto('http://localhost:5173/dashboard');
    const vitals = await perf.measureWebVitals();

    console.log('Web Vitals:', vitals);
  });
});
