(() => {
  "use strict";

  const GROUPS = {
    B057: { name: "Информационные технологии", regular: ["math", "informatics"], tipo: ["algorithmization", "math"], thresholds: { regular: { paid: 70, grant: 100 }, tipo: { paid: 45, grant: 45 } } },
    B058: { name: "Информационная безопасность", regular: ["math", "informatics"], tipo: ["informatics", "math"], thresholds: { regular: { paid: 70, grant: 93 }, tipo: { paid: 45, grant: 45 } } },
    B059: { name: "Коммуникации и коммуникационные технологии", regular: ["math", "physics"], tipo: ["physics", "circuitry"], thresholds: { regular: { paid: 70, grant: 85 }, tipo: { paid: 40, grant: 40 } } },
    B063: { name: "Электротехника и автоматизация", regular: ["math", "physics"], tipo: ["automation", "math"], thresholds: { regular: { paid: 70, grant: 75 }, tipo: { paid: 35, grant: 35 } } },
    B042: { name: "Журналистика и репортёрское дело", regular: ["creative"], tipo: ["creative"], thresholds: { regular: { paid: 70, grant: 75 }, tipo: { paid: 35, grant: 35 } } },
    B044: { name: "Менеджмент и управление", regular: ["math", "geography"], tipo: ["economics", "management"], thresholds: { regular: { paid: 70, grant: 75 }, tipo: { paid: 35, grant: 35 } } },
    B062: { name: "Электротехника и электроэнергетика", regular: ["math", "physics"], tipo: ["electrical_theory", "safety"], thresholds: { regular: { paid: 70, grant: 75 }, tipo: { paid: 35, grant: 35 } } },
    B049: { name: "Право", regular: ["world_history", "law"], tipo: ["world_history", "law"], thresholds: { regular: { paid: 75, grant: null }, tipo: { paid: 35, grant: 35 } } }
  };

  const SUBJECT_NAMES = {
    algorithmization: "Основы алгоритмизации и программирования",
    automation: "Автоматизация технологических процессов отрасли",
    circuitry: "Электротехника и основы схемотехники",
    creative: "Творческие экзамены",
    economics: "Основы экономики",
    electrical_theory: "Теоретические основы электротехники",
    geography: "География",
    informatics: "Информатика",
    law: "Основы права",
    management: "Менеджмент",
    math: "Математика",
    physics: "Физика",
    safety: "Охрана труда (основы электробезопасности)",
    world_history: "Всемирная история"
  };

  function normalize(value) {
    return String(value || "")
      .toLocaleLowerCase("ru-RU")
      .replace(/ё/g, "е")
      .replace(/[–—]/g, "-")
      .replace(/\s+/g, " ")
      .trim();
  }

  function subjectId(label) {
    const value = normalize(label).replace(/\s*\*+\s*$/, "");
    if (!value || /математическ.*грамотност|истори.*казахстан|грамотност.*чтени/.test(value)) return null;
    if (/основ.*алгоритмизац.*программирован/.test(value)) return "algorithmization";
    if (/автоматизац.*технологическ.*процесс.*отрасл/.test(value)) return "automation";
    if (/электротехник.*основ.*схемотехник/.test(value)) return "circuitry";
    if (/теоретическ.*основ.*электротехник/.test(value)) return "electrical_theory";
    if (/охран.*труд|электробезопасност/.test(value)) return "safety";
    if (/творческ.*экзамен/.test(value)) return "creative";
    if (/основ.*экономик/.test(value)) return "economics";
    if (/всемирн.*истори/.test(value)) return "world_history";
    if (/основ.*прав/.test(value)) return "law";
    if (/информатик/.test(value)) return "informatics";
    if (/географ/.test(value)) return "geography";
    if (/физик/.test(value)) return "physics";
    if (/математик/.test(value)) return "math";
    if (/менеджмент/.test(value)) return "management";
    return null;
  }

  function examType(pageText, fields) {
    const text = normalize(`${pageText || ""} ${(fields || []).map(field => field.label).join(" ")}`);
    if (/общепрофессиональн.*дисциплин|специальн.*дисциплин/.test(text)) return "tipo";
    if (/профильн.*предмет|обязательн.*предмет/.test(text)) return "regular";
    return null;
  }

  function groupCode(fields) {
    const groupField = (fields || []).find(field => /групп.*образовательн.*программ|групп.*оп\b/i.test(field.label));
    const raw = groupField?.value || "";
    const codeMatch = raw.match(/[BВ]\s*0?(42|44|49|57|58|59|62|63)\b/i);
    if (codeMatch) return `B${codeMatch[1].padStart(3, "0")}`;
    const groupName = normalize(raw);
    return Object.keys(GROUPS).find(code => groupName.includes(normalize(GROUPS[code].name))) || null;
  }

  function fundingType(fields) {
    const payment = (fields || []).find(field => /форма оплаты/i.test(field.label))?.value || "";
    const value = normalize(payment);
    if (/бесплат|грант/.test(value)) return "grant";
    if (/платн/.test(value)) return "paid";
    return null;
  }

  function totalScore(fields) {
    const field = (fields || []).find(item => /сумма баллов ент|общий балл ент/i.test(item.label));
    const value = String(field?.value || "").trim().replace(",", ".");
    if (!value) return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function fieldValue(fields, labelPattern) {
    return (fields || []).find(field => labelPattern.test(field.label))?.value || "";
  }

  function numericFieldValue(fields, labelPattern) {
    const value = String(fieldValue(fields, labelPattern)).trim().replace(",", ".");
    if (!value) return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function degreeWarnings(fields) {
    const degree = normalize(fieldValue(fields, /академическ.*степен/i));
    if (/магистратур/.test(degree) && /профильн.*направлен/.test(degree)) {
      return [{
        templateId: "master-profile-direction",
        key: "master-profile-direction",
        level: "danger",
        label: "Академическая степень",
        text: "Выбрана профильная магистратура, которая не реализуется в AITU",
        commentTexts: {
          ru: "В AITU реализуется только магистратура по научно-педагогическому направлению. Пожалуйста, измените академическую степень на «Магистратура (научно-педагогическое направление)».",
          kz: "AITU-да тек ғылыми-педагогикалық бағыттағы магистратура жүзеге асырылады. Академиялық дәреже ретінде «Магистратура (научно-педагогическое направление)» таңдаңыз.",
          en: "AITU offers only the scientific and pedagogical master's track. Please change the academic degree to “Магистратура (научно-педагогическое направление)”."
        }
      }];
    }
    if (/докторантур.*по направлен/.test(degree)) {
      return [{
        templateId: "doctorate-directions",
        key: "doctorate-directions",
        level: "danger",
        label: "Академическая степень",
        text: "Выбрана докторантура по направлениям, которая не реализуется в AITU",
        commentTexts: {
          ru: "В AITU реализуется только докторантура PhD. Пожалуйста, измените академическую степень на «Докторантура PhD».",
          kz: "AITU-да тек PhD докторантурасы жүзеге асырылады. Академиялық дәреже ретінде «Докторантура PhD» таңдаңыз.",
          en: "AITU offers only PhD doctoral studies. Please change the academic degree to “Докторантура PhD”."
        }
      }];
    }
    return [];
  }

  function mastersScoreWarnings(fields) {
    const degree = normalize(fieldValue(fields, /академическ.*степен/i));
    if (!/магистратур/.test(degree)) return [];
    const englishScore = numericFieldValue(fields, /английск.*язык/i);
    const total = numericFieldValue(fields, /(?:сумма|общий).*балл.*кт|балл.*кт.*(?:сумма|общий)/i);
    const warnings = [];
    if (englishScore !== null && englishScore < 25) {
      warnings.push({
        templateId: "master-english-score",
        key: "master-english-score:25",
        level: "danger",
        label: "Английский язык",
        text: `Балл по английскому языку — ${englishScore}; минимальный порог — 25`,
        commentTexts: {
          ru: "По английскому языку необходимо набрать не менее 25 баллов. Если баллы по английскому языку были конвертированы на основании результата IELTS, пожалуйста, прикрепите сертификат IELTS.",
          kz: "Ағылшын тілі бойынша кемінде 25 балл жинау қажет. Егер ағылшын тілі бойынша балл IELTS нәтижесі негізінде конвертацияланған болса, IELTS сертификатын тіркеңіз.",
          en: "A minimum of 25 points in English is required. If your English score was converted from an IELTS result, please attach your IELTS certificate."
        }
      });
    }
    if (total !== null && total < 75) {
      warnings.push({
        templateId: "master-total-score",
        key: "master-total-score:75",
        level: "danger",
        label: "Общий балл КТ",
        text: `Общий балл КТ — ${total}; минимальный порог — 75`,
        commentTexts: {
          ru: "Для поступления в магистратуру необходимо набрать по КТ не менее 75 баллов.",
          kz: "Магистратураға түсу үшін КТ бойынша кемінде 75 балл жинау қажет.",
          en: "A total score of at least 75 points on the Comprehensive Test is required for master's admission."
        }
      });
    }
    return warnings;
  }

  function subjectSet(fields) {
    const ids = [];
    for (const field of fields || []) {
      const score = String(field.value || "").trim().replace(",", ".");
      if (score === "" || !Number.isFinite(Number(score))) continue;
      const id = subjectId(field.label);
      if (id && !ids.includes(id)) ids.push(id);
    }
    return ids.sort();
  }

  function sameSubjects(first, second) {
    return [...first].sort().join("|") === [...second].sort().join("|");
  }

  function joinCodes(codes) {
    if (codes.length <= 1) return codes[0] || "";
    if (codes.length === 2) return `${codes[0]} или ${codes[1]}`;
    return `${codes.slice(0, -1).join(", ")} или ${codes.at(-1)}`;
  }

  function subjectText(ids) {
    return ids.map(id => SUBJECT_NAMES[id]).filter(Boolean).join(" и ");
  }

  function matchingGroups(type, actualSubjects) {
    if ((!actualSubjects.includes("creative") && actualSubjects.length < 2)) return [];
    return Object.keys(GROUPS).filter(code => sameSubjects(GROUPS[code][type], actualSubjects)).sort();
  }

  function subjectWarning(type, selectedCode, actualSubjects) {
    if ((!actualSubjects.includes("creative") && actualSubjects.length < 2) || !selectedCode) return null;
    const matchingCodes = matchingGroups(type, actualSubjects);
    const examLabel = type === "tipo" ? "ЕНТ ТиПО" : "ЕНТ";
    if (!matchingCodes.length) {
      return {
        templateId: "unt-gop-subjects",
        key: `unt-gop-subjects:${type}:unsupported:${actualSubjects.join("-")}`,
        level: "danger",
        label: "Предметы и ГОП",
        text: `Комбинация предметов ${examLabel} «${subjectText(actualSubjects)}» не соответствует выбранной ГОП ${selectedCode}`,
        commentTexts: {
          ru: `Пожалуйста, проверьте предметы ${examLabel} и выберите соответствующую им ГОП.`,
          kz: `${examLabel} пәндерін тексеріп, оларға сәйкес білім беру бағдарламаларының тобын таңдаңыз.`,
          en: `Please check the ${examLabel} subjects and select a matching group of educational programs.`
        }
      };
    }
    if (matchingCodes.includes(selectedCode)) return null;
    const codes = joinCodes(matchingCodes);
    const uniqueGroup = matchingCodes.length === 1 ? ` — «${GROUPS[matchingCodes[0]].name}»` : "";
    const ruComment = matchingCodes.length === 1
      ? `Пожалуйста, выберите ГОП ${codes}${uniqueGroup}: она соответствует предметам Вашего ${examLabel}.`
      : `Пожалуйста, выберите одну из подходящих ГОП: ${codes}.`;
    const kzComment = matchingCodes.length === 1
      ? `${examLabel} пәндеріне сәйкес келетін ${codes}${uniqueGroup} білім беру бағдарламаларының тобын таңдаңыз.`
      : `Сәйкес білім беру бағдарламалары топтарының бірін таңдаңыз: ${codes}.`;
    const enComment = matchingCodes.length === 1
      ? `Please select ${codes}${uniqueGroup}, which matches your ${examLabel} subjects.`
      : `Please select one of the matching groups: ${codes}.`;
    return {
      templateId: "unt-gop-subjects",
      key: `unt-gop-subjects:${type}:${selectedCode}:${matchingCodes.join("-")}`,
      level: "danger",
      label: "Предметы и ГОП",
      text: `Предметы ${examLabel} «${subjectText(actualSubjects)}» соответствуют ${codes}, но выбрана ${selectedCode}`,
      commentTexts: {
        ru: ruComment,
        kz: kzComment,
        en: enComment
      }
    };
  }

  function scoreWarning(type, selectedCode, funding, score) {
    if (!selectedCode || !funding || score === null) return null;
    const threshold = GROUPS[selectedCode]?.thresholds?.[type]?.[funding];
    if (threshold === null && funding === "grant") {
      return {
        templateId: "unt-funding-unavailable",
        key: `unt-funding-unavailable:${type}:${selectedCode}:${funding}`,
        level: "danger",
        label: "Форма оплаты",
        text: `Для ${selectedCode} пороговый балл на грант не установлен`,
        commentTexts: {
          ru: `Пожалуйста, выберите форму оплаты «Платно»: для ГОП ${selectedCode} поступление на грант не предусмотрено.`,
          kz: `«Ақылы» төлем түрін таңдаңыз: ${selectedCode} тобы үшін грантқа түсу қарастырылмаған.`,
          en: `Please select tuition-based admission: grant admission is not available for ${selectedCode}.`
        }
      };
    }
    if (!Number.isFinite(threshold) || score >= threshold) return null;
    const basis = funding === "grant" ? "для участия в конкурсе на грант" : "для поступления на платной основе";
    const basisKz = funding === "grant" ? "грант конкурсына қатысу үшін" : "ақылы негізде оқуға түсу үшін";
    const basisEn = funding === "grant" ? "for the grant competition" : "for tuition-based admission";
    return {
      templateId: "unt-total-score",
      key: `unt-total-score:${type}:${selectedCode}:${funding}:${threshold}`,
      level: "danger",
      label: "Общий балл ЕНТ",
      text: `Общий балл ЕНТ — ${score}; порог для ${selectedCode} (${funding === "grant" ? "грант" : "платно"}) — ${threshold}`,
      commentTexts: {
        ru: `Пожалуйста, предоставьте сертификат ЕНТ с общим баллом не ниже ${threshold} ${basis} по ГОП ${selectedCode}.`,
        kz: `${selectedCode} тобы бойынша ${basisKz} жалпы балы кемінде ${threshold} болатын ҰБТ сертификатын ұсыныңыз.`,
        en: `Please provide a UNT certificate with a total score of at least ${threshold} ${basisEn} in ${selectedCode}.`
      }
    };
  }

  function check(fields, pageText = "") {
    const warnings = [
      ...degreeWarnings(fields),
      ...mastersScoreWarnings(fields)
    ];
    const type = examType(pageText, fields);
    if (!type) return warnings;
    const selectedCode = groupCode(fields);
    const subjects = subjectSet(fields);
    const matchingCodes = matchingGroups(type, subjects);
    const thresholdCode = matchingCodes.includes(selectedCode) || matchingCodes.length !== 1 ? selectedCode : matchingCodes[0];
    warnings.push(
      subjectWarning(type, selectedCode, subjects),
      scoreWarning(type, thresholdCode, fundingType(fields), totalScore(fields))
    );
    return warnings.filter(Boolean);
  }

  globalThis.MyDUAdmissionRules = Object.freeze({ GROUPS, check });
})();
