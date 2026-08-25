const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const sourcePath = path.join(__dirname, "..", "src", "date-range-filter.js");
const source = fs.readFileSync(sourcePath, "utf8");
const instrumented = source.replace(
  /\n\}\)\(\);\s*$/,
  `
  globalThis.__dateRangeFilterTest = {
    DEGREE_OPTIONS,
    state,
    apiUrl,
    applicationInRange,
    searchParamValue,
    selectedDegreeLabel
  };
})();`
);

assert.notEqual(instrumented, source, "Не удалось подключить тестовые функции фильтра");

const context = {
  AbortController,
  Date,
  Intl,
  Map,
  Set,
  URL,
  URLSearchParams,
  clearTimeout() {},
  console,
  document: {
    addEventListener() {},
    getElementById() { return null; },
    querySelector() { return null; },
    visibilityState: "visible"
  },
  location: {
    origin: "https://my-du.astanait.edu.kz",
    pathname: "/admission/applicants",
    search: "?paymentTypeId=3&submissionYear=2026&statusId=5&academicDegreeId=%222%22"
  },
  setInterval() {},
  setTimeout() { return 1; },
  window: { addEventListener() {} },
  chrome: {
    storage: {
      local: {
        get(key, callback) { callback({}); },
        set() {}
      },
      onChanged: { addListener() {} }
    }
  }
};

vm.runInNewContext(instrumented, context, { filename: sourcePath });
const filter = context.__dateRangeFilterTest;

assert.deepEqual(
  Array.from(filter.DEGREE_OPTIONS, option => ({ value: option.value, label: option.label })),
  [
    { value: "1", label: "Бакалавриат" },
    { value: "2", label: "Магистратура (научно-педагогическое направление)" },
    { value: "6", label: "Докторантура PhD" }
  ]
);

const searchParams = new URLSearchParams(context.location.search);
assert.equal(filter.searchParamValue(searchParams, "academicDegreeId"), "2");
assert.equal(filter.searchParamValue(searchParams, "statusId"), "5");

filter.state.from = "2026-08-22";
filter.state.to = "2026-08-25";
filter.state.selectedDegreeId = "2";
filter.state.selectedStatusIds = new Set(["2", "5"]);
assert.equal(filter.selectedDegreeLabel(), "Магистратура (научно-педагогическое направление)");

for (const statusId of ["2", "5"]) {
  const url = new URL(filter.apiUrl(3, "2026-08-26", statusId));
  assert.equal(url.searchParams.get("createdDateBefore"), "2026-08-26");
  assert.equal(url.searchParams.get("academicDegreeId"), "2");
  assert.equal(url.searchParams.get("statusId"), statusId);
  assert.equal(url.searchParams.get("paymentTypeId"), "3");
  assert.equal(url.searchParams.get("submissionYear"), "2026");
  assert.equal(url.searchParams.get("page"), "3");
  assert.equal(url.searchParams.get("size"), "100");
}

assert.equal(filter.applicationInRange({ createdAt: "2026-08-24T12:00:00", statusId: 5, academicDegreeId: 2 }), true);
assert.equal(filter.applicationInRange({ createdAt: "2026-08-24T12:00:00", statusId: 5, academicDegreeId: 1 }), false);
assert.equal(filter.applicationInRange({ createdAt: "2026-08-24T12:00:00", statusId: 4, academicDegreeId: 2 }), false);
assert.equal(filter.applicationInRange({ createdAt: "2026-08-21T12:00:00", statusId: 5, academicDegreeId: 2 }), false);

console.log("Date range filter: degree, date and status combinations passed");
