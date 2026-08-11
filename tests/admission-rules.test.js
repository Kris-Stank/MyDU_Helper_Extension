"use strict";

const assert = require("node:assert/strict");
require("../src/admission-rules.js");

const { check } = globalThis.MyDUAdmissionRules;
const field = (label, value) => ({ label, value, type: "text" });

function application({ group, payment, total, subjects }) {
  return [
    field("Группа образовательных программ", group),
    field("Форма оплаты", payment),
    field("Сумма баллов ЕНТ", String(total)),
    ...subjects.map(([label, score]) => field(label, String(score)))
  ];
}

const tipoExample = check(application({
  group: "B044 - Менеджмент и управление",
  payment: "Платно",
  total: 38,
  subjects: [["Математика", 9], ["Основы алгоритмизации и программирования", 29]]
}), "Общепрофессиональная дисциплина Специальная дисциплина");
assert.deepEqual(tipoExample.map(item => item.templateId), ["unt-gop-subjects", "unt-total-score"]);
assert.match(tipoExample[0].commentTexts.ru, /B057/);
assert.match(tipoExample[1].commentTexts.ru, /45/);

assert.equal(check(application({
  group: "B057 - Информационные технологии",
  payment: "Платно",
  total: 45,
  subjects: [["Математика", 10], ["Основы алгоритмизации и программирования", 35]]
}), "Общепрофессиональная дисциплина Специальная дисциплина").length, 0);

const ordinaryThreshold = check(application({
  group: "B063 - Электротехника и автоматизация",
  payment: "Бесплатно",
  total: 74,
  subjects: [["Математика", 30], ["Физика", 30], ["История Казахстана", 8], ["Грамотность чтения", 3], ["Математическая грамотность", 3]]
}), "Профильные предметы Обязательные предметы");
assert.deepEqual(ordinaryThreshold.map(item => item.templateId), ["unt-total-score"]);
assert.match(ordinaryThreshold[0].commentTexts.ru, /75/);

const severalMatchingGroups = check(application({
  group: "B044 - Менеджмент и управление",
  payment: "Бесплатно",
  total: 80,
  subjects: [["Математика", 35], ["Физика", 35], ["История Казахстана", 5], ["Грамотность чтения", 3], ["Математическая грамотность", 2]]
}), "Профильные предметы Обязательные предметы");
assert.deepEqual(severalMatchingGroups.map(item => item.templateId), ["unt-gop-subjects"]);
assert.match(severalMatchingGroups[0].commentTexts.ru, /B059, B062 или B063/);

const lawGrant = check(application({
  group: "B049 - Право",
  payment: "Бесплатно (грант)",
  total: 110,
  subjects: [["Всемирная история", 45], ["Основы права", 45]]
}), "Профильные предметы Обязательные предметы");
assert.deepEqual(lawGrant.map(item => item.templateId), ["unt-funding-unavailable"]);

assert.equal(check(application({
  group: "B058 - Информационная безопасность",
  payment: "Платно",
  total: 70,
  subjects: [["Математика", 30], ["Информатика", 30], ["История Казахстана", 5], ["Грамотность чтения", 3], ["Математическая грамотность", 2]]
}), "Профильные предметы Обязательные предметы").length, 0);

console.log("Admission rules: 6 scenarios passed");
