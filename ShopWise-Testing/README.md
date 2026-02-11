# ShopWise UI Testing

Comprehensive UI testing suite for ShopWise application.

## Location

`/Users/vizak/Projects/ShopWise/ShopWise-Testing/`

## Quick Start

```bash
cd /Users/vizak/Projects/ShopWise/ShopWise-Testing
node test-shopwise.js
```

## What's Included

### Test Scripts
- `test-shopwise.js` - Main Puppeteer test script
- `tests/` - 63 comprehensive test cases for Chrome Tester

### Reports
- `FINAL_SUMMARY.md` - Complete testing summary
- `TEST_REPORT.md` - Detailed test results
- `bug-report.json` - Structured bug data
- `test-execution.log` - Full test execution log

### Evidence
- `screenshots/` - 9 full-page screenshots
- `recordings/` - (placeholder for video recordings)

### Documentation
- `CHROME_TESTER_STATUS.md` - Chrome Tester evaluation
- `TESTING_SUMMARY.md` - Testing approach overview

## Test Results

- ✅ **12 tests executed**
- ✅ **7 passed** (58%)
- ❌ **5 failed** (42%)
- 🐛 **4 bugs found**

## GitHub Issues Created

All bugs reported to: https://github.com/V1Zak/ShopWise/issues

1. [#61 - Login redirect bug](https://github.com/V1Zak/ShopWise/issues/61) - **MAJOR**
2. [#62 - Missing navigation](https://github.com/V1Zak/ShopWise/issues/62) - **MAJOR**
3. [#63 - Missing search](https://github.com/V1Zak/ShopWise/issues/63) - **MINOR**
4. [#64 - Missing charts](https://github.com/V1Zak/ShopWise/issues/64) - **MINOR**

## Test Credentials

- Email: slav25.ai@gmail.com
- Password: Slav!1

## Technologies

- **Puppeteer 24.37.2** - Browser automation
- **Chrome** - Test browser
- **Node.js** - Test execution
- **Chrome Tester** - Evaluation (cloned from V1Zak/Chrome_tester)

## Folder Structure

```
ShopWise-Testing/
├── test-shopwise.js          # Main test script
├── tests/                    # Chrome Tester test suite (63 tests)
│   ├── 01-auth.test.js
│   ├── 02-dashboard.test.js
│   ├── 03-shopping-list.test.js
│   ├── 04-catalog.test.js
│   ├── 05-history.test.js
│   ├── 06-analytics.test.js
│   ├── 07-briefing.test.js
│   ├── 08-sharing.test.js
│   ├── 09-performance.test.js
│   └── 10-accessibility.test.js
├── chrome-tester-fresh/      # Fresh clone from GitHub
├── screenshots/              # Page captures
├── bug-report.json          # Structured bug data
├── TEST_REPORT.md           # Detailed results
├── FINAL_SUMMARY.md         # Complete summary
└── package.json             # Dependencies

```

## Re-running Tests

```bash
# Run main test suite
node test-shopwise.js

# View reports
cat TEST_REPORT.md
cat FINAL_SUMMARY.md

# View screenshots
open screenshots/
```

## Notes

- Tests run against `http://localhost:5173`
- Screenshots automatically saved to `screenshots/`
- Bug reports automatically generated
- GitHub issues automatically created (when run with gh CLI)

---

**Testing completed**: February 10, 2026
**Test duration**: ~21 seconds
**Total coverage**: Authentication, Dashboard, Catalog, Shopping Lists, History, Analytics
