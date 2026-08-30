const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const logs = [];
  page.on('console', msg => logs.push(msg.type() + ': ' + msg.text()));
  page.on('pageerror', err => logs.push('PAGE ERROR: ' + err.message));
  
  // Set token directly
  await page.goto('http://localhost:5173/login');
  await page.evaluate(() => {
    localStorage.setItem('token', 'test');
    localStorage.setItem('user', JSON.stringify({ email: 'admin@interviewer.com', role: 'ADMIN' }));
  });
  
  // Navigate to interview
  await page.goto('http://localhost:5173/interview/20');
  await page.waitForTimeout(3000);
  
  // Check page content
  const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 300));
  console.log('=== PAGE CONTENT ===');
  console.log(bodyText);
  
  // Check for errors
  console.log('\n=== ERRORS ===');
  const errors = logs.filter(l => l.includes('error') || l.includes('PAGE ERROR'));
  console.log(errors.join('\n') || 'No errors');
  
  // Try to find and click play button
  const playBtn = await page.locator('button').filter({ has: page.locator('svg.lucide-play') }).first();
  const playBtnCount = await page.locator('button').count();
  console.log('\n=== PLAY BUTTON ===');
  console.log('Total buttons:', playBtnCount);
  
  if (playBtnCount > 0) {
    // Click the first button with play icon
    try {
      await playBtn.click({ timeout: 3000 });
      console.log('Clicked play button');
      await page.waitForTimeout(2000);
      
      // Check speech state
      const speechState = await page.evaluate(() => ({
        speaking: window.speechSynthesis?.speaking,
        paused: window.speechSynthesis?.paused,
        pending: window.speechSynthesis?.pending,
        voices: window.speechSynthesis?.getVoices()?.length || 0
      }));
      console.log('Speech state:', JSON.stringify(speechState));
    } catch (e) {
      console.log('Click failed:', e.message);
    }
  }
  
  await browser.close();
})();
