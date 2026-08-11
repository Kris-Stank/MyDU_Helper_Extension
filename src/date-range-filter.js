(() => {
  "use strict";

  const ROOT_ID = "mydu-date-range-helper-root";
  const THEME_KEY = "mydu-helper-theme";
  const API_PAGE_SIZE = 100;
  const FETCH_CONCURRENCY = 3;
  const RETURN_REFRESH_DELAY = 250;
  const DATE_FILTER_KEYS = ["createdDate", "createdDateBefore"];
  const PAGINATION_KEYS = ["page", "size", "sort", "desc"];
  const STATUS_COLORS = {
    0: "gray", 1: "blue", 2: "orange", 3: "orange", 4: "green", 5: "orange",
    6: "green", 7: "green", 8: "green", 9: "orange", 10: "blue", 11: "green",
    12: "red", 13: "red", 14: "red", 15: "gray", 16: "red", 17: "blue"
  };
  const FALLBACK_STATUS_OPTIONS = [
    { value: "1", label: "Сохранено" },
    { value: "2", label: "Подано" },
    { value: "3", label: "Отправлено на доработку (первичная проверка)" },
    { value: "4", label: "Доработано (первичная проверка)" },
    { value: "5", label: "Направлено техническому секретарю" },
    { value: "6", label: "Проверено" },
    { value: "7", label: "Принято без оригиналов" },
    { value: "8", label: "Заявление принято успешно" },
    { value: "9", label: "Отправлено на доработку" },
    { value: "10", label: "Доработано" },
    { value: "11", label: "Договор подписан" },
    { value: "12", label: "Отклонено" },
    { value: "13", label: "Отменено" },
    { value: "14", label: "Отменено заявителем" },
    { value: "15", label: "Аннулировано заявителем" },
    { value: "16", label: "Договор расторгнут" },
    { value: "17", label: "Восстановлено" }
  ];
  const DATE_FORMATTER = new Intl.DateTimeFormat("ru-RU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });

  let host = null;
  let shadow = null;
  let abortController = null;
  let loadGeneration = 0;
  let lastFilterSignature = "";
  let refreshAfterReturn = false;
  let returnRefreshTimer = null;
  let theme = "light";
  const hiddenElements = new Map();
  const state = {
    from: "",
    to: "",
    status: "idle",
    message: "Выберите начальную и конечную даты.",
    results: [],
    page: 0,
    pageSize: 25,
    scannedPages: 0,
    totalPages: 0,
    statusOptions: [...FALLBACK_STATUS_OPTIONS],
    selectedStatusIds: new Set(),
    statusMenuOpen: false,
    statusesLoading: false,
    statusesLoaded: false
  };

  const CSS = `
    :host{display:block;margin:0 0 18px;font-family:Inter,Segoe UI,Arial,sans-serif;color:#142033}
    *{box-sizing:border-box}
    .range-card{position:relative;overflow:visible;border:1px solid #dce5ef;border-radius:16px;background:#fff;box-shadow:0 5px 20px rgba(18,44,78,.06)}
    .range-head{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;padding:18px 20px 14px}
    .range-title{display:flex;align-items:center;gap:10px;margin:0 0 5px;font-size:17px;line-height:1.2}
    .range-icon{display:grid;place-items:center;width:31px;height:31px;border-radius:10px;background:#eaf4ff;color:#0877ef;font-size:16px}
    .range-head p{margin:0;color:#748398;font-size:12px;line-height:1.45}
    .range-tools{display:flex;align-items:center;gap:8px;flex:none}
    .range-badge{flex:none;padding:6px 9px;border-radius:999px;background:#edf6ff;color:#0877ef;font-size:10px;font-weight:800;letter-spacing:.3px}
    .theme-toggle{display:grid;place-items:center;width:34px;height:34px;padding:0;border:1px solid #d8e2ec;border-radius:11px;background:#fff;color:#52667e;font-size:16px;line-height:1;box-shadow:0 4px 12px rgba(18,44,78,.07)}
    .range-form{display:grid;grid-template-columns:minmax(145px,190px) minmax(145px,190px) minmax(210px,1fr) auto auto;align-items:end;gap:12px;padding:0 20px 18px}
    label span{display:block;margin:0 0 6px;color:#4d5f75;font-size:11px;font-weight:750}
    input,select,button{font:inherit}
    input[type=date],select{width:100%;height:42px;border:1px solid #cfd9e5;border-radius:10px;background:#fff;color:#142033;outline:none}
    input[type=date]{padding:0 11px}
    select{padding:0 30px 0 10px}
    input:focus,select:focus{border-color:#1681ef;box-shadow:0 0 0 3px rgba(22,129,239,.12)}
    input:disabled,select:disabled{background:#f5f7fa;color:#8b98a8}
    .status-field{position:relative;min-width:0}.status-field>span{display:block;margin:0 0 6px;color:#4d5f75;font-size:11px;font-weight:750}
    .status-select-button{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;height:42px;padding:0 11px;border:1px solid #cfd9e5;background:#fff;color:#142033;font-weight:500;text-align:left;box-shadow:none}
    .status-select-button:hover{border-color:#9fb8d2}.status-select-button b{overflow:hidden;font-size:11px;font-weight:500;white-space:nowrap;text-overflow:ellipsis}.status-select-button i{font-size:9px;font-style:normal;color:#728399}
    .status-menu{position:absolute;top:calc(100% + 6px);left:0;z-index:40;width:max(100%,290px);max-width:390px;overflow:hidden;border:1px solid #d6e0ea;border-radius:12px;background:#fff;box-shadow:0 16px 38px rgba(22,46,76,.18)}
    .status-menu-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;border-bottom:1px solid #edf1f5;color:#607187;font-size:10px}.status-menu-head button{height:auto;padding:2px;border:0;background:transparent;color:#0877ef;font-size:10px;box-shadow:none}
    .status-options{max-height:248px;overflow:auto;padding:6px}
    .status-option{display:flex;align-items:flex-start;gap:9px;padding:8px;border-radius:8px;color:#31445b;font-size:11px;line-height:1.35;cursor:pointer}.status-option:hover{background:#f2f7fc}.status-option input{flex:none;width:15px;height:15px;margin:0;accent-color:#0877ef}
    button{height:42px;padding:0 16px;border-radius:10px;font-size:12px;font-weight:750;cursor:pointer}
    button:disabled{opacity:.52;cursor:default}
    .primary{border:0;background:#0877ef;color:#fff;box-shadow:0 7px 16px rgba(8,119,239,.2)}
    .secondary{border:1px solid #d2dce7;background:#fff;color:#4d5f75}
    .status{display:flex;align-items:center;gap:9px;min-height:39px;padding:10px 20px;border-top:1px solid #edf1f5;background:#f8fafc;color:#63758b;font-size:11px}
    .status.loading,.status.refreshing{color:#1767ad}.status.error{background:#fff5f5;color:#b23838}.status.success{background:#f2fbf7;color:#197354}
    .spinner{width:15px;height:15px;border:2px solid #b9dbfa;border-top-color:#0877ef;border-radius:50%;animation:spin .75s linear infinite}
    @keyframes spin{to{transform:rotate(360deg)}}
    .results{border-top:1px solid #e8eef4}
    .results-head{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 20px}
    .results-head b{display:block;font-size:13px}.results-head small{display:block;margin-top:3px;color:#7c8a9b;font-size:10px}
    .page-size{display:flex;align-items:center;gap:8px;color:#66778b;font-size:10px}.page-size select{width:76px;height:34px}
    .table-wrap{overflow:auto;border-top:1px solid #edf1f5;border-bottom:1px solid #edf1f5}
    table{width:100%;min-width:900px;border-collapse:collapse;text-align:left}
    th{padding:11px 14px;background:#f8fafc;color:#53657a;font-size:10px;font-weight:800;white-space:nowrap}
    td{padding:12px 14px;border-top:1px solid #edf1f5;color:#25354a;font-size:11px;vertical-align:top}
    td a{color:#0877ef;font-weight:750;text-decoration:none}td a:hover{text-decoration:underline}
    .status-pill{display:inline-block;line-height:1.35}.status-orange{color:#fd7e14}.status-green{color:#12b886}.status-blue{color:#228be6}.status-red{color:#fa5252}.status-gray{color:#868e96}
    .empty{padding:28px 20px;text-align:center;color:#7a899b;font-size:12px}
    .pager{display:flex;align-items:center;justify-content:flex-end;gap:9px;padding:13px 20px}
    .pager span{min-width:112px;text-align:center;color:#63758b;font-size:10px}.pager button{height:34px;padding:0 12px}
    .range-card.theme-dark{border-color:#2c3b50;background:#131c2a;color:#edf4ff;box-shadow:0 16px 42px rgba(0,0,0,.28);color-scheme:dark}
    .theme-dark .range-icon{background:#18395e;color:#69b1ff}.theme-dark .range-head p{color:#91a2b8}.theme-dark .range-badge{background:#18395e;color:#70b7ff}.theme-dark .theme-toggle{border-color:#34455c;background:#1c2838;color:#ffd166;box-shadow:none}
    .theme-dark label span,.theme-dark .status-field>span{color:#b7c4d5}.theme-dark input[type=date],.theme-dark select,.theme-dark .status-select-button{border-color:#34455c;background:#1a2535;color:#edf4ff}.theme-dark input:focus,.theme-dark select:focus{border-color:#4a9df3;box-shadow:0 0 0 3px rgba(74,157,243,.18)}.theme-dark input:disabled,.theme-dark select:disabled{background:#172130;color:#718299}
    .theme-dark .status-select-button:hover{border-color:#58708d}.theme-dark .status-select-button i{color:#91a2b8}.theme-dark .status-menu{border-color:#34455c;background:#182333;box-shadow:0 18px 46px rgba(0,0,0,.45)}.theme-dark .status-menu-head{border-color:#2b394c;color:#9bacbf}.theme-dark .status-menu-head button{color:#69b1ff}.theme-dark .status-option{color:#dbe6f4}.theme-dark .status-option:hover{background:#223249}
    .theme-dark .secondary{border-color:#3a4b62;background:#1b2839;color:#c7d4e4}.theme-dark .primary{background:#2388ee;box-shadow:0 8px 18px rgba(35,136,238,.25)}
    .theme-dark .status{border-color:#2a384a;background:#172130;color:#9eafc3}.theme-dark .status.loading,.theme-dark .status.refreshing{color:#78baff}.theme-dark .status.error{background:#352128;color:#ff999f}.theme-dark .status.success{background:#183029;color:#6dd8ae}.theme-dark .spinner{border-color:#33577b;border-top-color:#69b1ff}
    .theme-dark .results,.theme-dark .table-wrap{border-color:#2a384a}.theme-dark .results-head small,.theme-dark .page-size,.theme-dark .pager span{color:#91a2b8}.theme-dark th{background:#192434;color:#aebdd0}.theme-dark td{border-color:#283648;color:#d9e4f2}.theme-dark td a{color:#67b2ff}.theme-dark .empty{color:#91a2b8}.theme-dark .pager{background:#131c2a}
    @media(max-width:1100px){.range-form{grid-template-columns:1fr 1fr 1.35fr}.range-form>button{width:100%}.range-head{padding-right:16px;padding-left:16px}.range-form,.status,.results-head,.pager{padding-right:16px;padding-left:16px}}
    @media(max-width:760px){.range-form{grid-template-columns:1fr 1fr}.status-field{grid-column:1/-1}}
    @media(max-width:560px){.range-form{grid-template-columns:1fr}.range-badge{display:none}.results-head{align-items:flex-start;flex-direction:column}}
  `;

  function isApplicantsListPage() {
    return /^\/admission\/applicants\/?$/.test(location.pathname);
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[character]));
  }

  function plural(value, one, few, many) {
    const mod100 = value % 100;
    const mod10 = value % 10;
    if (mod100 >= 11 && mod100 <= 19) return many;
    if (mod10 === 1) return one;
    if (mod10 >= 2 && mod10 <= 4) return few;
    return many;
  }

  function addOneDay(dateValue) {
    const [year, month, day] = dateValue.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    date.setUTCDate(date.getUTCDate() + 1);
    return date.toISOString().slice(0, 10);
  }

  function localDateKey(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value || "").slice(0, 10);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function formatDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "—" : DATE_FORMATTER.format(date);
  }

  function cleanName(value) {
    return String(value || "—").replace(/\bnull\b/gi, "").replace(/\s{2,}/g, " ").trim() || "—";
  }

  function statusColor(application) {
    const byId = STATUS_COLORS[Number(application?.statusId)];
    if (byId) return byId;
    const label = String(application?.status || "").toLocaleLowerCase("ru-RU");
    if (/доработано|принято успешно|проверено|подписан/.test(label)) return "green";
    if (/подано|отправлено.*доработ|направлено.*секретар|первичн.*провер/.test(label)) return "orange";
    if (/сохранено|восстановлено/.test(label)) return "blue";
    if (/отменено|отклонено|расторгнут/.test(label)) return "red";
    return "gray";
  }

  function selectedStatusesLabel() {
    const selected = state.statusOptions.filter(option => state.selectedStatusIds.has(option.value));
    if (!selected.length) return "Все статусы";
    if (selected.length === 1) return selected[0].label;
    return `Выбрано статусов: ${selected.length}`;
  }

  async function loadStatusOptions() {
    if (state.statusesLoading || state.statusesLoaded) return;
    state.statusesLoading = true;
    render();
    try {
      const response = await fetch(new URL("/api/dictionary/by-table/app-status?lang=ru", location.origin), {
        credentials: "include",
        cache: "no-store",
        headers: { Accept: "application/json" }
      });
      if (!response.ok) throw new Error(String(response.status));
      const payload = await response.json();
      const options = Array.isArray(payload)
        ? payload.map(item => ({ value: String(item?.id ?? ""), label: String(item?.name || "").trim() })).filter(item => item.value && item.label)
        : [];
      if (options.length) state.statusOptions = options.sort((left, right) => Number(left.value) - Number(right.value));
    } catch {
      state.statusOptions = [...FALLBACK_STATUS_OPTIONS];
    } finally {
      state.statusesLoading = false;
      state.statusesLoaded = true;
      render();
    }
  }

  function baseFilters() {
    const params = new URLSearchParams(location.search);
    [...DATE_FILTER_KEYS, ...PAGINATION_KEYS, "lang", "statusId"].forEach(key => params.delete(key));
    if (!params.has("appTypeId")) params.set("appTypeId", "1");
    if (!params.has("submissionYear")) params.set("submissionYear", String(new Date().getFullYear()));
    return params;
  }

  function currentFilterSignature() {
    return [...baseFilters().entries()].sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => `${key}=${value}`).join("&");
  }

  function apiUrl(page, endExclusive, statusId) {
    const url = new URL("/api/applicant/application", location.origin);
    const params = baseFilters();
    params.set("createdDateBefore", endExclusive);
    if (statusId != null) params.set("statusId", String(statusId));
    params.set("page", String(page));
    params.set("size", String(API_PAGE_SIZE));
    params.set("sort", "createdAt");
    params.set("desc", "true");
    params.set("lang", "ru");
    url.search = params.toString();
    return url.href;
  }

  async function fetchPage(page, endExclusive, statusId, signal) {
    const response = await fetch(apiUrl(page, endExclusive, statusId), {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal
    });
    if (response.status === 401) throw new Error("Сессия MyDU истекла. Обновите страницу и войдите снова.");
    if (!response.ok) throw new Error(`MyDU вернул ошибку ${response.status}. Попробуйте ещё раз.`);
    const payload = await response.json();
    return {
      content: Array.isArray(payload?.content) ? payload.content : [],
      totalPages: Number(payload?.page?.totalPages ?? payload?.totalPages ?? 1) || 1
    };
  }

  function applicationInRange(application) {
    const key = localDateKey(application?.createdAt);
    const statusMatches = !state.selectedStatusIds.size || state.selectedStatusIds.has(String(application?.statusId ?? ""));
    return statusMatches && key >= state.from && key <= state.to;
  }

  function uniqueApplications(applications) {
    const map = new Map();
    for (const application of applications) {
      const key = application?.id ?? `${application?.iin || ""}:${application?.createdAt || ""}`;
      if (!map.has(key)) map.set(key, application);
    }
    return [...map.values()].sort((left, right) => new Date(right?.createdAt || 0) - new Date(left?.createdAt || 0));
  }

  function rememberAndHide(element) {
    if (!element || element === host || element.contains(host)) return;
    if (!hiddenElements.has(element)) {
      hiddenElements.set(element, {
        value: element.style.getPropertyValue("display"),
        priority: element.style.getPropertyPriority("display")
      });
    }
    element.style.setProperty("display", "none", "important");
  }

  function hasVisibleHelperResults() {
    return state.status === "success" || state.status === "refreshing";
  }

  function hideNativeResults() {
    if (!hasVisibleHelperResults()) return;
    const main = document.querySelector("main");
    const table = main?.querySelector("table");
    rememberAndHide(table);
    const paragraphs = main ? [...main.querySelectorAll("p")] : [];
    rememberAndHide(paragraphs.find(node => /^Количество записей:\s*\d+/i.test(node.textContent.trim())));
    const shown = paragraphs.find(node => /^Показано\s+\d+\s+из\s+\d+/i.test(node.textContent.trim()));
    rememberAndHide(shown?.parentElement || shown);
  }

  function restoreNativeResults() {
    for (const [element, display] of hiddenElements) {
      if (!element.isConnected) continue;
      if (display.value) element.style.setProperty("display", display.value, display.priority);
      else element.style.removeProperty("display");
    }
    hiddenElements.clear();
  }

  function resultRows() {
    const start = state.page * state.pageSize;
    return state.results.slice(start, start + state.pageSize).map(application => {
      const id = application?.id;
      const name = cleanName(application?.applicantFullName);
      const nameCell = id == null
        ? escapeHtml(name)
        : `<a href="/admission/applicants/${encodeURIComponent(String(id))}" target="_blank" rel="noopener noreferrer">${escapeHtml(name)}</a>`;
      return `<tr>
        <td>${nameCell}</td>
        <td>${escapeHtml(application?.iin || "—")}</td>
        <td>${escapeHtml(application?.type || application?.appTypeName || "—")}</td>
        <td>${escapeHtml(formatDate(application?.createdAt))}</td>
        <td><span class="status-pill status-${statusColor(application)}">${escapeHtml(application?.status || "—")}</span></td>
        <td>${escapeHtml(formatDate(application?.updatedAt))}</td>
      </tr>`;
    }).join("");
  }

  function resultsHtml() {
    if (!hasVisibleHelperResults()) return "";
    const total = state.results.length;
    const pageCount = Math.max(1, Math.ceil(total / state.pageSize));
    const page = Math.min(state.page, pageCount - 1);
    const rows = resultRows();
    return `<section class="results">
      <div class="results-head">
        <div><b>Найдено ${total} ${plural(total, "заявление", "заявления", "заявлений")}</b><small>С ${escapeHtml(state.from)} по ${escapeHtml(state.to)} включительно · ${escapeHtml(selectedStatusesLabel())}</small></div>
        <label class="page-size"><span>Показывать</span><select id="range-page-size">
          ${[25, 50, 100].map(size => `<option value="${size}" ${state.pageSize === size ? "selected" : ""}>${size}</option>`).join("")}
        </select></label>
      </div>
      ${total ? `<div class="table-wrap"><table><thead><tr><th>ФИО заявителя</th><th>ИИН</th><th>Тип заявления</th><th>Дата подачи</th><th>Текущий статус</th><th>Дата присвоения</th></tr></thead><tbody>${rows}</tbody></table></div>` : `<div class="empty">За выбранный период заявлений не найдено.</div>`}
      <div class="pager">
        <button type="button" class="secondary" id="range-prev" ${page <= 0 ? "disabled" : ""}>← Назад</button>
        <span>Страница ${page + 1} из ${pageCount}</span>
        <button type="button" class="secondary" id="range-next" ${page >= pageCount - 1 ? "disabled" : ""}>Вперёд →</button>
      </div>
    </section>`;
  }

  function statusHtml() {
    const spinner = state.status === "loading" || state.status === "refreshing" ? `<span class="spinner" aria-hidden="true"></span>` : "";
    return `<div class="status ${state.status}" aria-live="polite">${spinner}<span>${escapeHtml(state.message)}</span></div>`;
  }

  function statusSelectHtml(loading) {
    const options = state.statusOptions.map(option => `<label class="status-option">
      <input type="checkbox" value="${escapeHtml(option.value)}" ${state.selectedStatusIds.has(option.value) ? "checked" : ""} ${loading ? "disabled" : ""}>
      <span>${escapeHtml(option.label)}</span>
    </label>`).join("");
    const menu = state.statusMenuOpen && !loading ? `<div class="status-menu">
      <div class="status-menu-head"><span>Можно выбрать несколько</span><button type="button" id="range-status-clear">Показать все</button></div>
      <div class="status-options">${options}</div>
    </div>` : "";
    return `<div class="status-field"><span>Статусы заявлений</span>
      <button type="button" class="status-select-button" id="range-status-button" ${loading || state.statusesLoading ? "disabled" : ""}><b>${escapeHtml(state.statusesLoading ? "Загружаю статусы…" : selectedStatusesLabel())}</b><i>${state.statusMenuOpen ? "▲" : "▼"}</i></button>
      ${menu}
    </div>`;
  }

  function render() {
    if (!shadow) return;
    const loading = state.status === "loading" || state.status === "refreshing";
    shadow.innerHTML = `<style>${CSS}</style><section class="range-card ${theme === "dark" ? "theme-dark" : ""}">
      <div class="range-head">
        <div><h2 class="range-title"><span class="range-icon">▣</span>Диапазон даты подачи</h2><p>Фильтр работает по всем страницам и учитывает остальные фильтры MyDU.</p></div>
        <div class="range-tools"><span class="range-badge">MyDU Helper</span><button type="button" class="theme-toggle" id="range-theme-toggle" title="${theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему"}" aria-label="${theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему"}">${theme === "dark" ? "☀" : "☾"}</button></div>
      </div>
      <form class="range-form" id="range-form">
        <label><span>Дата с</span><input id="range-from" type="date" value="${escapeHtml(state.from)}" max="${escapeHtml(state.to)}" ${loading ? "disabled" : ""}></label>
        <label><span>Дата по</span><input id="range-to" type="date" value="${escapeHtml(state.to)}" min="${escapeHtml(state.from)}" ${loading ? "disabled" : ""}></label>
        ${statusSelectHtml(loading)}
        ${loading ? `<button type="button" class="secondary" id="range-cancel">Отменить</button>` : `<button type="submit" class="primary">Применить</button>`}
        <button type="button" class="secondary" id="range-reset" ${loading ? "disabled" : ""}>Сбросить</button>
      </form>
      ${statusHtml()}${resultsHtml()}
    </section>`;
    bindEvents();
    hideNativeResults();
  }

  function bindEvents() {
    const from = shadow.querySelector("#range-from");
    const to = shadow.querySelector("#range-to");
    if (from) from.onchange = event => {
      state.from = event.currentTarget.value;
      if (to) to.min = state.from;
    };
    if (to) to.onchange = event => {
      state.to = event.currentTarget.value;
      if (from) from.max = state.to;
    };
    shadow.querySelector("#range-form").onsubmit = event => {
      event.preventDefault();
      state.from = from?.value || "";
      state.to = to?.value || "";
      applyRange();
    };
    shadow.querySelector("#range-reset").onclick = resetRange;
    shadow.querySelector("#range-theme-toggle").onclick = () => {
      theme = theme === "dark" ? "light" : "dark";
      chrome.storage.local.set({ [THEME_KEY]: theme });
      render();
    };
    const statusButton = shadow.querySelector("#range-status-button");
    if (statusButton) statusButton.onclick = () => { state.statusMenuOpen = !state.statusMenuOpen; render(); };
    const clearStatuses = shadow.querySelector("#range-status-clear");
    if (clearStatuses) clearStatuses.onclick = () => {
      state.selectedStatusIds.clear();
      invalidateResultsForStatusChange();
    };
    shadow.querySelectorAll(".status-option input").forEach(input => {
      input.onchange = event => {
        const value = event.currentTarget.value;
        if (event.currentTarget.checked) state.selectedStatusIds.add(value);
        else state.selectedStatusIds.delete(value);
        invalidateResultsForStatusChange();
      };
    });
    const cancel = shadow.querySelector("#range-cancel");
    if (cancel) cancel.onclick = () => abortController?.abort();
    const previous = shadow.querySelector("#range-prev");
    if (previous) previous.onclick = () => { state.page = Math.max(0, state.page - 1); render(); host.scrollIntoView({ block: "start", behavior: "smooth" }); };
    const next = shadow.querySelector("#range-next");
    if (next) next.onclick = () => {
      state.page = Math.min(Math.max(0, Math.ceil(state.results.length / state.pageSize) - 1), state.page + 1);
      render();
      host.scrollIntoView({ block: "start", behavior: "smooth" });
    };
    const pageSize = shadow.querySelector("#range-page-size");
    if (pageSize) pageSize.onchange = event => { state.pageSize = Number(event.currentTarget.value) || 25; state.page = 0; render(); };
  }

  function invalidateResultsForStatusChange() {
    if (state.status === "success") {
      restoreNativeResults();
      state.status = "idle";
      state.results = [];
      state.page = 0;
      state.message = "Выбор статусов изменён. Нажмите «Применить» для обновления списка.";
    }
    render();
  }

  async function applyRange(options = {}) {
    const preserveResults = options.preserveResults === true && state.status === "success";
    if (!state.from || !state.to) {
      state.status = "error";
      state.message = "Укажите обе даты: начало и конец периода.";
      render();
      return;
    }
    if (state.from > state.to) {
      state.status = "error";
      state.message = "Начальная дата не может быть позже конечной.";
      render();
      return;
    }

    abortController?.abort();
    abortController = new AbortController();
    const generation = ++loadGeneration;
    const endExclusive = addOneDay(state.to);
    const statusTargets = state.selectedStatusIds.size ? [...state.selectedStatusIds] : [null];
    state.status = preserveResults ? "refreshing" : "loading";
    state.statusMenuOpen = false;
    state.message = preserveResults ? "Обновляю список и счётчики…" : "Загружаю первую страницу заявлений…";
    if (!preserveResults) {
      state.results = [];
      state.page = 0;
    }
    state.scannedPages = 0;
    state.totalPages = 0;
    if (!preserveResults) restoreNativeResults();
    render();

    try {
      const firstPages = await Promise.all(statusTargets.map(async statusId => ({
        statusId,
        result: await fetchPage(0, endExclusive, statusId, abortController.signal)
      })));
      if (generation !== loadGeneration) return;
      const applications = firstPages.flatMap(item => item.result.content);
      const remainingPages = [];
      for (const item of firstPages) {
        for (let page = 1; page < item.result.totalPages; page += 1) remainingPages.push({ page, statusId: item.statusId });
      }
      state.scannedPages = firstPages.length;
      state.totalPages = firstPages.reduce((total, item) => total + item.result.totalPages, 0);
      render();

      for (let index = 0; index < remainingPages.length; index += FETCH_CONCURRENCY) {
        const jobs = remainingPages.slice(index, index + FETCH_CONCURRENCY);
        const batch = await Promise.all(jobs.map(job => fetchPage(job.page, endExclusive, job.statusId, abortController.signal)));
        if (generation !== loadGeneration) return;
        batch.forEach(result => applications.push(...result.content));
        state.scannedPages += jobs.length;
        state.message = `Загружено ${state.scannedPages} из ${state.totalPages} страниц…`;
        render();
      }

      state.results = uniqueApplications(applications.filter(applicationInRange));
      state.page = Math.min(state.page, Math.max(0, Math.ceil(state.results.length / state.pageSize) - 1));
      state.status = "success";
      state.message = `Готово: проверено ${applications.length} ${plural(applications.length, "заявление", "заявления", "заявлений")}.`;
      lastFilterSignature = currentFilterSignature();
      refreshAfterReturn = false;
      render();
    } catch (error) {
      if (error?.name === "AbortError") {
        state.status = preserveResults ? "success" : "idle";
        state.message = preserveResults ? "Автоматическое обновление отменено." : "Загрузка отменена. Обычная таблица MyDU восстановлена.";
      } else {
        state.status = preserveResults ? "success" : "error";
        state.message = preserveResults
          ? "Не удалось автоматически обновить список. Он обновится при следующем возврате на вкладку."
          : error?.message || "Не удалось загрузить заявления. Попробуйте ещё раз.";
        if (preserveResults) refreshAfterReturn = true;
      }
      if (!preserveResults) restoreNativeResults();
      render();
    } finally {
      if (generation === loadGeneration) abortController = null;
    }
  }

  function resetRange() {
    abortController?.abort();
    abortController = null;
    loadGeneration += 1;
    state.from = "";
    state.to = "";
    state.status = "idle";
    state.message = "Диапазон сброшен. Показана обычная таблица MyDU.";
    state.results = [];
    state.page = 0;
    state.scannedPages = 0;
    state.totalPages = 0;
    state.selectedStatusIds.clear();
    state.statusMenuOpen = false;
    refreshAfterReturn = false;
    lastFilterSignature = currentFilterSignature();
    restoreNativeResults();
    render();
  }

  function findTable() {
    return document.querySelector("main table");
  }

  function mount() {
    if (!isApplicantsListPage()) return;
    const table = findTable();
    if (!table) return;
    if (host?.isConnected) {
      hideNativeResults();
      return;
    }
    host = document.getElementById(ROOT_ID) || document.createElement("div");
    host.id = ROOT_ID;
    host.style.display = "block";
    host.style.margin = "0 0 18px";
    if (!host.shadowRoot) shadow = host.attachShadow({ mode: "open" });
    else shadow = host.shadowRoot;
    table.parentElement?.insertBefore(host, table);
    const selectedDate = new URLSearchParams(location.search).get("createdDate");
    if (selectedDate && !state.from && !state.to) state.from = state.to = selectedDate;
    const selectedStatus = new URLSearchParams(location.search).get("statusId");
    if (selectedStatus && !state.selectedStatusIds.size) state.selectedStatusIds.add(selectedStatus);
    lastFilterSignature = currentFilterSignature();
    render();
    loadStatusOptions();
  }

  function unmount() {
    if (hasVisibleHelperResults()) refreshAfterReturn = true;
    abortController?.abort();
    abortController = null;
    loadGeneration += 1;
    restoreNativeResults();
    host?.remove();
    host = shadow = null;
  }

  function sync() {
    if (!isApplicantsListPage()) {
      if (host) unmount();
      return;
    }
    mount();
    scheduleRefreshAfterReturn();
    if (state.status === "success") {
      const signature = currentFilterSignature();
      if (lastFilterSignature && signature !== lastFilterSignature) {
        restoreNativeResults();
        state.status = "idle";
        state.results = [];
        state.page = 0;
        state.message = "Фильтры MyDU изменились. Примените диапазон ещё раз.";
        lastFilterSignature = signature;
        render();
      } else {
        hideNativeResults();
      }
    }
  }

  function markForRefreshAfterReturn() {
    if (hasVisibleHelperResults()) refreshAfterReturn = true;
  }

  function scheduleRefreshAfterReturn() {
    if (!refreshAfterReturn || !isApplicantsListPage() || document.visibilityState === "hidden" || state.status !== "success" || abortController) return;
    clearTimeout(returnRefreshTimer);
    returnRefreshTimer = setTimeout(() => {
      returnRefreshTimer = null;
      if (!refreshAfterReturn || !isApplicantsListPage() || document.visibilityState === "hidden" || state.status !== "success" || abortController) return;
      refreshAfterReturn = false;
      applyRange({ preserveResults: true });
    }, RETURN_REFRESH_DELAY);
  }

  chrome.storage.local.get(THEME_KEY, values => {
    theme = values[THEME_KEY] === "dark" ? "dark" : "light";
    sync();
  });
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local" || !changes[THEME_KEY]) return;
    const nextTheme = changes[THEME_KEY].newValue === "dark" ? "dark" : "light";
    if (nextTheme === theme) return;
    theme = nextTheme;
    if (shadow) render();
  });
  window.addEventListener("blur", markForRefreshAfterReturn);
  window.addEventListener("focus", scheduleRefreshAfterReturn);
  window.addEventListener("pageshow", scheduleRefreshAfterReturn);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") markForRefreshAfterReturn();
    else scheduleRefreshAfterReturn();
  });
  setInterval(sync, 800);
})();
