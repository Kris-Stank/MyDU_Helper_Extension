(() => {
  "use strict";

  const DRAFT_TTL = 3 * 60 * 1000;
  const POSITION_KEY = "mydu-helper-position";
  const LEGACY_TEMPLATES = [
    { id: "photo-invalid", group: "Персональные сведения", title: "Фото недействительное", text: "Фото недействительное. Пожалуйста, загрузите фото 3×4 в корректном формате: лицо должно быть хорошо видно, фон нейтральный, фото без посторонних предметов и без сильной обработки." },
    { id: "kato-not-city", group: "Персональные сведения", title: "Населённый пункт указан не городом", text: "В поле населённого пункта укажите город в корректном формате. Пожалуйста, выберите населённый пункт, соответствующий адресу прописки/проживания." },
    { id: "kato-address", group: "Персональные сведения", title: "КАТО не совпадает с адресом", text: "Проверьте соответствие населённого пункта (КАТО) и указанного адреса прописки/проживания. Они должны относиться к одному населённому пункту." },
    { id: "address-incomplete", group: "Персональные сведения", title: "Адрес прописки/проживания неполный", text: "Укажите полный адрес прописки и проживания: город/населённый пункт, улицу или район, номер дома и номер квартиры (если это не частный дом)." },
    { id: "id-date", group: "Документы", title: "Дата выдачи удостоверения", text: "Проверьте дату выдачи удостоверения личности и укажите её корректно согласно документу." },
    { id: "fio-document", group: "Персональные сведения", title: "ФИО не совпадает с документом", text: "Проверьте ФИО. Данные в заявлении должны полностью совпадать с удостоверением личности." },
    { id: "fio-case", group: "Персональные сведения", title: "ФИО написано не тем регистром", text: "Исправьте регистр ФИО: первая буква должна быть заглавной, остальные — строчными." },
    { id: "no-id", group: "Документы", title: "Нет удостоверения личности", text: "Прикрепите скан-копию удостоверения личности абитуриента в хорошем качестве." },
    { id: "id-quality", group: "Документы", title: "Удостоверение плохого качества", text: "Загрузите чёткую скан-копию удостоверения личности. Все данные и фотография на документе должны быть читаемыми." },
    { id: "wrong-id", group: "Документы", title: "Не тот документ", text: "В разделе документов должно быть прикреплено удостоверение личности самого абитуриента. Пожалуйста, замените файл на корректный." },
    { id: "no-parent", group: "Родители/Лица, заменяющие родителей", title: "Нет данных родителя", text: "Заполните полностью данные хотя бы одного родителя или законного представителя." },
    { id: "parent-work", group: "Родители/Лица, заменяющие родителей", title: "Место работы родителя", text: "Укажите место работы родителя полностью. Не используйте сокращение из одной-двух букв." },
    { id: "parent-unemployed", group: "Родители/Лица, заменяющие родителей", title: "Родитель не работает", text: "Если родитель не работает, укажите это полностью в поле «Место работы»." },
    { id: "relationship", group: "Родители/Лица, заменяющие родителей", title: "Документ о родстве", text: "Прикрепите свидетельство о рождении абитуриента как документ, подтверждающий родство." },
    { id: "school-name", group: "Сведения о предыдущем образовании", title: "Название образовательного учреждения", text: "Проверьте и укажите корректное наименование образовательного учреждения согласно аттестату/диплому." },
    { id: "series-number", group: "Сведения о дипломе", title: "Серия и номер перепутаны", text: "Проверьте серию и номер аттестата/диплома. Вероятно, значения указаны в обратном порядке." },
    { id: "education-date", group: "Сведения о дипломе", title: "Дата выдачи аттестата/диплома", text: "Проверьте дату выдачи аттестата/диплома и укажите её согласно документу." },
    { id: "no-certificate", group: "Сведения о дипломе", title: "Нет скан-копии аттестата/диплома", text: "Прикрепите скан-копию аттестата/диплома в соответствующем поле." },
    { id: "no-appendix", group: "Сведения о дипломе", title: "Нет приложения", text: "Прикрепите скан-копию приложения к аттестату/диплому в соответствующем поле." },
    { id: "separate-files", group: "Сведения о дипломе", title: "Аттестат и приложение нужно разделить", text: "Загрузите аттестат и приложение отдельными файлами: в первой плашке — только аттестат, во второй — только приложение." },
    { id: "average-grade", group: "Сведения о дипломе", title: "Средний балл", text: "Проверьте средний балл аттестата/диплома и укажите корректное значение согласно приложению." },
    { id: "certificate-quality", group: "Сведения о дипломе", title: "Плохое качество документа", text: "Загрузите документ в хорошем качестве. Все данные, оценки, серия, номер и даты должны быть читаемыми." },
    { id: "no-unt", group: "ЕНТ/Собеседование", title: "Нет сертификата ЕНТ", text: "Прикрепите скан-копию сертификата ЕНТ в соответствующем разделе." },
    { id: "wrong-unt", group: "ЕНТ/Собеседование", title: "Не тот файл в ЕНТ", text: "В разделе «ЕНТ» необходимо прикрепить именно скан-копию сертификата ЕНТ. Проверьте загруженный файл и замените его на корректный." },
    { id: "unt-threshold", group: "ЕНТ/Собеседование", title: "Не проходит предметный порог", text: "Ваш результат ЕНТ не проходит по предметному порогу. Необходимо пересдать ЕНТ и набрать минимальный проходной балл по каждому обязательному и профильному предмету." },
    { id: "wrong-admission-type", group: "ЕНТ/Собеседование", title: "Неверно выбран тип поступления — собеседование", text: "Тип поступления «Собеседование» доступен для выпускников колледжа по родственной специальности и для иностранных граждан. Если Вы окончили школу, выберите поступление по ЕНТ." },
    { id: "language-date", group: "Сертификат владения иностранным языком", title: "Дата выдачи сертификата", text: "Укажите дату выдачи международного сертификата, подтверждающего владение иностранным языком." },
    { id: "language-number", group: "Сертификат владения иностранным языком", title: "Неверный номер сертификата", text: "Укажите корректный номер международного сертификата, подтверждающего владение иностранным языком (Test Report Form Number, находится снизу)." },
    { id: "no-language-cert", group: "Сертификат владения иностранным языком", title: "Нет сертификата", text: "Прикрепите скан-копию международного сертификата, подтверждающего владение иностранным языком, в соответствующем разделе." },
    { id: "language-quality", group: "Сертификат владения иностранным языком", title: "Сертификат плохого качества", text: "Загрузите скан-копию сертификата владения иностранным языком в хорошем качестве. Все данные должны быть читаемыми." }
  ];

  const TEMPLATES = [
    { id: "photo-invalid", group: "Персональные сведения", title: "Фото недействительное", text: "Фото недействительное. Пожалуйста, загрузите фото 3×4 в корректном формате: лицо должно быть хорошо видно, фон нейтральный, фото без посторонних предметов и без сильной обработки." },
    { id: "kato-not-city", group: "Персональные сведения", title: "Населённый пункт указан не городом", text: "Укажите населённый пункт в корректном формате: именно город/населённый пункт, например: «г. Актобе». Не выбирайте значение формата «Г.А.»" },
    { id: "kato-address", group: "Персональные сведения", title: "КАТО не совпадает с адресом", text: "Проверьте населённый пункт прописки/проживания. Он должен совпадать с адресом, который указан в поле «Адрес прописки» / «Адрес проживания»." },
    { id: "address-incomplete", group: "Персональные сведения", title: "Адрес прописки/проживания неполный", text: "Пропишите полностью «Адрес проживания» и «Адрес прописки»: улица, дом, квартира." },
    { id: "id-date", group: "Персональные сведения", title: "Дата выдачи удостоверения", text: "Введите корректную дату выдачи документа, удостоверяющего личность. Дата должна совпадать с данными в удостоверении личности." },
    { id: "fio-document", group: "Персональные сведения", title: "ФИО не совпадает с документом", text: "Проверьте ФИО в заявлении. Данные должны быть указаны точно так же, как в документе, удостоверяющем личность." },
    { id: "fio-case", group: "Персональные сведения", title: "ФИО написано не тем регистром", text: "Пожалуйста, пишите ФИО с заглавной буквы: первая буква большая, остальные маленькие." },
    { id: "birth-date", group: "Персональные сведения", title: "Дата рождения", text: "Проверьте дату рождения. Она должна совпадать с данными в документе, удостоверяющем личность." },
    { id: "no-id", group: "Документы", title: "Нет удостоверения личности", text: "Загрузите скан-копию документа, удостоверяющего личность, в разделе «Документы»." },
    { id: "id-quality", group: "Документы", title: "Удостоверение плохого качества", text: "Загрузите скан-копию документа, удостоверяющего личность, в хорошем качестве. Все данные на документе должны быть полностью читаемыми." },
    { id: "wrong-id", group: "Документы", title: "Не тот документ", text: "В разделе «Документы» необходимо загрузить именно документ, удостоверяющий личность. Проверьте прикреплённый файл и замените его на корректный." },
    { id: "file-wont-open", group: "Документы", title: "Файл не открывается", text: "Прикреплённый файл не открывается или отображается некорректно. Пожалуйста, загрузите документ повторно в правильном формате." },
    { id: "doc-cropped", group: "Документы", title: "Документ обрезан", text: "Загрузите документ повторно. Файл должен быть полным: без обрезанных краёв, закрытых данных и размытых участков." },
    { id: "no-parent", group: "Родители/Лица, заменяющие родителей", title: "Нет данных родителя", text: "Необходимо заполнить раздел «Родители / Лица, заменяющие родителей» и указать как минимум одного родителя или законного представителя." },
    { id: "mother-surname", group: "Родители/Лица, заменяющие родителей", title: "Фамилия матери", text: "Укажите корректную фамилию матери. Данные должны совпадать с документами." },
    { id: "mother-name-change", group: "Родители/Лица, заменяющие родителей", title: "Смена фамилии матери", text: "Если у матери была смена фамилии, прикрепите свидетельство о заключении брака вместе с вашим свидетельством о рождении одним файлом." },
    { id: "parent-fio-case", group: "Родители/Лица, заменяющие родителей", title: "ФИО родителя написано не тем регистром", text: "Пожалуйста, пишите ФИО родителя/законного представителя с заглавной буквы: первая буква большая, остальные маленькие." },
    { id: "parent-address", group: "Родители/Лица, заменяющие родителей", title: "Адрес родителя", text: "Укажите полный адрес проживания родителя/законного представителя: улица, дом, квартира." },
    { id: "parent-work", group: "Родители/Лица, заменяющие родителей", title: "Место работы родителя", text: "Укажите место работы родителя/законного представителя." },
    { id: "parent-unemployed", group: "Родители/Лица, заменяющие родителей", title: "Родитель не работает", text: "Если родитель/законный представитель не работает, в поле «Место работы» необходимо написать «Нет»." },
    { id: "relationship", group: "Родители/Лица, заменяющие родителей", title: "Документ о родстве", text: "Загрузите скан-копию документа, подтверждающего родство или законное представительство, в правильном формате. В этом поле необходимо загрузить именно ваше свидетельство о рождении." },
    { id: "school-name", group: "Сведения о предыдущем образовании", title: "Название образовательного учреждения", text: "Укажите наименование образовательного учреждения в точности так, как оно указано в аттестате/дипломе." },
    { id: "school-city", group: "Сведения о предыдущем образовании", title: "Населённый пункт образовательного учреждения", text: "Замените населённый пункт образовательного учреждения на корректный город/населённый пункт, например: «г. Актобе». Не выбирайте значение формата «Г.А.»" },
    { id: "school-country", group: "Сведения о предыдущем образовании", title: "Страна образовательного учреждения", text: "Проверьте страну образовательного учреждения и укажите её корректно согласно документу об образовании." },
    { id: "education-data-mismatch", group: "Сведения о предыдущем образовании", title: "Данные не совпадают с документом", text: "Проверьте сведения о предыдущем образовании. Все данные должны совпадать с аттестатом/дипломом и приложением к нему." },
    { id: "series-number", group: "Сведения о дипломе", title: "Серия и номер перепутаны", text: "Укажите верно данные по аттестату/диплому: серия — это буквы, например «ЖОБ» или «BT», номер — это цифры рядом с этими буквами." },
    { id: "education-number", group: "Сведения о дипломе", title: "Номер аттестата/диплома", text: "Введите корректный номер аттестата/диплома. Номер должен состоять из цифр, указанных рядом с серией документа." },
    { id: "education-date", group: "Сведения о дипломе", title: "Дата выдачи аттестата/диплома", text: "Введите корректную дату выдачи аттестата/диплома. Дата должна совпадать с датой, указанной в документе." },
    { id: "no-certificate", group: "Сведения о дипломе", title: "Нет скан-копии аттестата/диплома", text: "Загрузите скан-копию аттестата/диплома в соответствующем разделе." },
    { id: "no-appendix", group: "Сведения о дипломе", title: "Нет приложения", text: "Загрузите отдельно скан-копию приложения к аттестату/диплому." },
    { id: "separate-files", group: "Сведения о дипломе", title: "Аттестат и приложение нужно разделить", text: "Загрузите скан-копию аттестата/диплома и скан-копию приложения отдельно: аттестат/диплом — в своё поле, приложение — в своё поле." },
    { id: "average-grade", group: "Сведения о дипломе", title: "Средний балл", text: "Введите средний балл аттестата/диплома. Для расчёта среднего балла внесите количество оценок и нажмите «Рассчитать»." },
    { id: "grade-count", group: "Сведения о дипломе", title: "Количество оценок", text: "Введите корректное количество оценок из приложения к аттестату/диплому." },
    { id: "wrong-average", group: "Сведения о дипломе", title: "Неверный средний балл", text: "Укажите корректный средний балл согласно оценкам в приложении. Проверьте количество оценок и нажмите «Рассчитать»." },
    { id: "certificate-quality", group: "Сведения о дипломе", title: "Плохое качество документа", text: "Загрузите скан-копию аттестата/диплома и приложения в хорошем качестве. Все данные должны быть полностью читаемыми." },
    { id: "payment-form", group: "Сведения о поступлении", title: "Форма оплаты", text: "Проверьте форму оплаты и укажите корректный вариант: «Платно» или «Бесплатно (грант)»." },
    { id: "gop-op", group: "Сведения о поступлении", title: "ГОП/ОП", text: "Проверьте выбранную группу образовательных программ и образовательную программу. Они должны соответствовать выбранному направлению поступления." },
    { id: "dormitory", group: "Сведения о поступлении", title: "Общежитие", text: "Проверьте поле «Потребность в общежитии» и выберите корректный вариант." },
    { id: "no-unt", group: "ЕНТ/Собеседование", title: "Нет сертификата ЕНТ", text: "Прикрепите скан-копию сертификата ЕНТ в разделе «ЕНТ» / «Сведения о поступлении»." },
    { id: "unt-not-requested", group: "ЕНТ/Собеседование", title: "ЕНТ не запрошен", text: "Нажмите кнопку «Запросить результаты ЕНТ», дождитесь загрузки данных из системы, затем прикрепите скан-копию сертификата ЕНТ." },
    { id: "wrong-unt", group: "ЕНТ/Собеседование", title: "Не тот файл в ЕНТ", text: "В разделе «ЕНТ» необходимо прикрепить именно скан-копию сертификата ЕНТ. Проверьте загруженный файл и замените его на корректный." },
    { id: "unt-threshold", group: "ЕНТ/Собеседование", title: "Не проходит предметный порог", text: "Ваш результат ЕНТ не проходит по предметному порогу. Необходимо пересдать ЕНТ и набрать минимальный проходной балл по каждому обязательному и профильному предмету." },
    { id: "math-literacy-2", group: "ЕНТ/Собеседование", title: "Математическая грамотность — 2 балла", text: "У Вас общий балл выше минимального, но по математической грамотности набрано 2 балла. Минимальный порог по математической грамотности — 3 балла, поэтому данный результат ЕНТ не проходит для поступления. Необходимо пересдать ЕНТ." },
    { id: "wrong-admission-type", group: "ЕНТ/Собеседование", title: "Неверно выбран тип поступления — собеседование", text: "Тип поступления «Собеседование» доступен для выпускников колледжа по родственной специальности и для иностранных граждан. Если Вы окончили школу, выберите поступление по ЕНТ." },
    { id: "language-date", group: "Сертификат владения иностранным языком", title: "Дата выдачи сертификата", text: "Укажите дату выдачи международного сертификата, подтверждающего владение иностранным языком." },
    { id: "language-number", group: "Сертификат владения иностранным языком", title: "Неверный номер сертификата", text: "Укажите корректный номер международного сертификата, подтверждающего владение иностранным языком (Test Report Form Number, находится снизу)." },
    { id: "no-language-cert", group: "Сертификат владения иностранным языком", title: "Нет сертификата", text: "Прикрепите скан-копию международного сертификата, подтверждающего владение иностранным языком, в соответствующем разделе." },
    { id: "language-quality", group: "Сертификат владения иностранным языком", title: "Сертификат плохого качества", text: "Загрузите скан-копию сертификата владения иностранным языком в хорошем качестве. Все данные должны быть читаемыми." },
    { id: "language-accidental", group: "Сертификат владения иностранным языком", title: "Сертификат выбран случайно", text: "Проверьте раздел сертификата владения иностранным языком. Если у Вас нет международного сертификата, не выбирайте данный пункт и не прикрепляйте посторонние файлы." },
    { id: "grant-august", group: "Сообщения: грант/иностранцы", title: "Грант — заявку подавать в августе", text: "Если Вы планируете участвовать в конкурсе на государственный образовательный грант, заявление необходимо подать не сейчас, а после публикации результатов конкурса грантов — в августе. НЕ УДАЛЯЙТЕ И НЕ ОТМЕНЯЙТЕ ЗАЯВЛЕНИЕ, А ПРОСТО СОХРАНИТЕ ЕГО В ТЕКУЩЕМ СТАТУСЕ «ОТПРАВЛЕНО НА ДОРАБОТКУ», чтобы после результатов конкурса Вы смогли снова подать заявление." },
    { id: "foreign-interview", group: "Сообщения: грант/иностранцы", title: "Иностранцы — собеседование для платного поступления", text: "Для поступления на платной основе иностранным абитуриентам необходимо сначала подать заявку на собеседование через следующую форму:\n\nhttps://docs.google.com/forms/d/e/1FAIpQLSfJcrouK6xXkGc53kseteWyV3rKrq-nDa-8VQWIQOJF3wDC9Q/viewform\n\nПожалуйста, заполните форму и загрузите необходимые документы в виде чётких цветных скан-копий высокого качества.\n\nВы сможете подать заявление в MyDU только после успешного прохождения собеседования. Пока, пожалуйста, не удаляйте и не отменяйте текущую заявку. Просто оставьте её сохранённой как есть.\n\nЕсли Вы подали заявку на грантовую программу Bolashak для иностранных граждан, пожалуйста, сначала дождитесь результатов и подавайте заявление только после получения окончательного решения.\n\nЕсли у Вас гражданство не Республики Казахстан, но по национальности Вы казах/казашка и у Вас есть статус «Кандас», Вы можете участвовать в конкурсе государственных грантов на основе ЕНТ. После участия в конкурсе Вы сможете подать заявление в MyDU." }
  ];

  const SECTIONS = [
    { id: "personal", label: "Персональные данные", groups: ["Персональные сведения", "Документы", "Родители/Лица, заменяющие родителей"] },
    { id: "education", label: "Предыдущее образование", groups: ["Сведения о предыдущем образовании", "Сведения о дипломе"] },
    { id: "admission", label: "Поступление", groups: ["Сведения о поступлении", "ЕНТ/Собеседование", "Сертификат владения иностранным языком", "Сообщения: грант/иностранцы"] }
  ];

  let root, shadow, state, draftKey, lastApplicantId;
  let saveTimer;
  let documentReview = null;
  let lastDocumentSignature = "";
  let lastAttachmentHint = "";
  let referenceCollapsed = false;
  let uiPosition = { panel: null, launch: null };

  function applicantId() {
    const match = location.pathname.match(/\/admission\/applicants\/(\d+)/);
    return match ? match[1] : null;
  }

  function storageGet(key) {
    return new Promise(resolve => chrome.storage.local.get(key, value => resolve(value[key])));
  }

  function storageSet(value) {
    return new Promise(resolve => chrome.storage.local.set(value, resolve));
  }

  function freshState() {
    return { selected: [], custom: "", query: "", activeSection: "personal", collapsed: false, warnings: [], checksRun: false, gradeCounts: { 5: "", 4: "", 3: "", 2: "" } };
  }

  function validPosition(value) {
    return value && Number.isFinite(value.x) && Number.isFinite(value.y) ? { x: value.x, y: value.y } : null;
  }

  function positionStyle(kind) {
    const position = validPosition(uiPosition[kind]);
    return position ? `left:${position.x}px;top:${position.y}px;right:auto;bottom:auto` : "";
  }

  function clampPosition(x, y, width, height) {
    const margin = 8;
    return {
      x: Math.min(Math.max(margin, x), Math.max(margin, window.innerWidth - width - margin)),
      y: Math.min(Math.max(margin, y), Math.max(margin, window.innerHeight - height - margin))
    };
  }

  function placeElement(element, kind) {
    const position = validPosition(uiPosition[kind]);
    if (!element || !position) return;
    const rect = element.getBoundingClientRect();
    const clamped = clampPosition(position.x, position.y, rect.width, rect.height);
    element.style.left = `${clamped.x}px`;
    element.style.top = `${clamped.y}px`;
    element.style.right = "auto";
    element.style.bottom = "auto";
    uiPosition[kind] = clamped;
  }

  function savePosition() {
    storageSet({ [POSITION_KEY]: uiPosition });
  }

  function makeDraggable(element, handle, kind, blockClick = false) {
    if (!element || !handle) return;
    let drag = null;
    let ignoreClick = false;

    handle.addEventListener("pointerdown", event => {
      if (event.button !== 0 || (!blockClick && event.target.closest("button, input, textarea, select, a"))) return;
      const rect = element.getBoundingClientRect();
      drag = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, left: rect.left, top: rect.top, width: rect.width, height: rect.height, moved: false };
      element.style.left = `${rect.left}px`;
      element.style.top = `${rect.top}px`;
      element.style.right = "auto";
      element.style.bottom = "auto";
      handle.setPointerCapture(event.pointerId);
      handle.classList.add("dragging");
      event.preventDefault();
    });

    handle.addEventListener("pointermove", event => {
      if (!drag || drag.pointerId !== event.pointerId) return;
      const dx = event.clientX - drag.startX;
      const dy = event.clientY - drag.startY;
      if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
      const next = clampPosition(drag.left + dx, drag.top + dy, drag.width, drag.height);
      element.style.left = `${next.x}px`;
      element.style.top = `${next.y}px`;
    });

    const finishDrag = event => {
      if (!drag || drag.pointerId !== event.pointerId) return;
      const rect = element.getBoundingClientRect();
      uiPosition[kind] = { x: rect.left, y: rect.top };
      ignoreClick = blockClick && drag.moved;
      drag = null;
      handle.classList.remove("dragging");
      if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
      savePosition();
    };

    handle.addEventListener("pointerup", finishDrag);
    handle.addEventListener("pointercancel", finishDrag);
    if (blockClick) handle.addEventListener("click", event => {
      if (!ignoreClick) return;
      ignoreClick = false;
      event.preventDefault();
      event.stopImmediatePropagation();
    }, true);
  }

  function draftPayload() {
    return { expiresAt: Date.now() + DRAFT_TTL, state };
  }

  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => storageSet({ [draftKey]: draftPayload() }), 250);
  }

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
  }

  function inputLabel(input) {
    const labels = input.labels ? [...input.labels].map(label => label.textContent).join(" ") : "";
    const aria = input.getAttribute("aria-label") || "";
    const name = input.getAttribute("name") || "";
    const nearby = input.parentElement ? input.parentElement.innerText.slice(0, 140) : "";
    const accessible = `${labels} ${aria}`.replace(/\s+/g, " ").trim();
    return (accessible || `${name} ${nearby}`).replace(/\s+/g, " ").trim();
  }

  function fields() {
    return [...document.querySelectorAll("input, textarea, button[disabled]")]
      .filter(element => element.offsetParent !== null)
      .map(element => ({ label: inputLabel(element), value: String(element.value || element.innerText || "").trim(), type: element.type, checked: element.checked }));
  }

  function findValue(allFields, phrase) {
    const found = allFields.find(field => field.label.toLowerCase().includes(phrase.toLowerCase()));
    return found ? found.value : "";
  }

  function findValueByLabel(allFields, pattern) {
    const found = allFields.find(field => pattern.test(field.label));
    return found ? found.value : "";
  }

  function inspectAddress(value) {
    const normalized = value.replace(/\s+/g, " ").trim();
    const hasLetters = /[A-Za-zА-Яа-яЁёӘәҒғҚқҢңӨөҰұҮүҺһІі]/u.test(normalized);
    const hasHouseNumber = /(?:^|[\s,])\d+[A-Za-zА-Яа-я]?(?:[\/-]\d+)?(?=\s|,|\.|$)/u.test(normalized);
    const apartmentMarker = /(?:кв(?:артира)?\.?|пәтер)\s*№?\s*\d+/iu;
    const hasApartmentWord = /(?:кв(?:артира)?\.?|пәтер)/iu.test(normalized);
    if (!hasLetters || !hasHouseNumber) return { level: "danger", text: "Адрес заполнен не полностью" };
    if (hasApartmentWord && !apartmentMarker.test(normalized)) return { level: "danger", text: "Не указан номер квартиры" };
    if (!apartmentMarker.test(normalized)) return { level: "note", text: "Не указан номер квартиры" };
    return null;
  }

  function stableHash(value) {
    let hash = 2166136261;
    for (const char of value) {
      hash ^= char.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
  }

  function warningKey(warning) {
    return warning.key || `${warning.templateId}:${warning.addressKey || warning.text}`;
  }

  function runChecks() {
    const allFields = fields();
    const results = [];
    state.checksRun = true;
    const series = findValueByLabel(allFields, /серия (аттестата|диплома)/i);
    const number = findValueByLabel(allFields, /номер (аттестата|диплома)/i);
    if (series && !/^[A-Za-zА-Яа-яЁёӘәҒғҚқҢңӨөҰұҮүҺһІі]+$/u.test(series)) {
      results.push({ templateId: "series-number", level: "warning", text: "В серии аттестата/диплома указаны не только буквы" });
    }
    if (number && !/^\d+$/.test(number)) {
      results.push({ templateId: "series-number", level: "warning", text: "В номере аттестата/диплома указаны не только цифры" });
    }
    for (const field of allFields.filter(item => /насел[её]нн.*(кaто|като)|кaто|като/i.test(item.label))) {
      if (/\bг\.а\./i.test(field.value)) results.push({ templateId: "kato-not-city", level: "warning", text: "В КАТО найдено «Г.А.»" });
    }
    let addressWarning = null;
    const addressSeverity = { danger: 3, warning: 2, note: 1 };
    for (const field of allFields.filter(item => /адрес (прописки|проживания)/i.test(item.label) && !["checkbox", "radio", "button", "submit", "hidden"].includes(item.type))) {
      if (!field.value) continue;
      const issue = inspectAddress(field.value);
      if (!issue) continue;
      const candidate = { templateId: "address-incomplete", addressKey: stableHash(field.value.replace(/\s+/g, " ").trim()), ...issue };
      if (!addressWarning || addressSeverity[candidate.level] > addressSeverity[addressWarning.level]) addressWarning = candidate;
    }
    if (addressWarning) results.push(addressWarning);
    for (const field of allFields.filter(item => /место работы/i.test(item.label))) {
      if (field.value && field.value.replace(/[\s.]/g, "").length <= 3) results.push({ templateId: "parent-work", level: "warning", text: "Место работы заполнено слишком коротко" });
    }
    state.warnings = [...new Map(results.map(item => [warningKey(item), item])).values()];
    render();
    scheduleSave();
  }

  function selectedTemplate(id) {
    return TEMPLATES.find(template => template.id === id);
  }

  function appendTemplate(id) {
    const template = selectedTemplate(id);
    if (!template) return false;
    state.selected.push({ id: `${id}-${Date.now()}-${Math.random()}`, templateId: id, title: template.title, text: template.text });
    return true;
  }

  function addTemplate(id) {
    if (!appendTemplate(id)) return;
    render(); scheduleSave();
  }

  function resolveWarning(index, shouldAdd) {
    const warning = state.warnings[index];
    if (!warning) return;
    if (shouldAdd) appendTemplate(warning.templateId);
    state.warnings.splice(index, 1);
    render(); scheduleSave();
  }

  function addCustomPoint() {
    const text = state.custom.trim();
    if (!text) return;
    state.selected.push({ id: `custom-${Date.now()}-${Math.random()}`, templateId: null, title: "Свой пункт", text });
    state.custom = "";
    render();
    requestAnimationFrame(() => shadow.querySelector("#mdh-custom")?.focus());
    scheduleSave();
  }

  function commentText() {
    const parts = state.selected.map(item => item.text.trim()).filter(Boolean);
    if (state.custom.trim()) parts.push(state.custom.trim());
    return parts.map(part => `• ${part}`).join("\n\n");
  }

  function gradeAverage() {
    const counts = [5, 4, 3, 2].map(grade => Math.max(0, Number.parseInt(state.gradeCounts[grade], 10) || 0));
    const total = counts.reduce((sum, count) => sum + count, 0);
    if (!total) return null;
    const weighted = counts.reduce((sum, count, index) => sum + count * [5, 4, 3, 2][index], 0);
    return { total, value: weighted / total };
  }

  function myduAverage() {
    const value = findValueByLabel(fields(), /средний балл (аттестата|диплома)/i);
    const parsed = Number.parseFloat(value.replace(",", "."));
    return Number.isFinite(parsed) ? parsed : null;
  }

  function gradeResultHtml() {
    const calculated = gradeAverage();
    if (!calculated) return `<p class="mdh-empty">Введите количество числовых оценок.</p>`;
    const displayed = calculated.value.toFixed(2);
    const current = myduAverage();
    if (current === null) return `<div class="mdh-grade-result"><strong>${displayed}</strong><span>Оценок: ${calculated.total}. Для сравнения откройте раздел образования в MyDU.</span></div>`;
    if (Math.abs(current - calculated.value) < 0.005) return `<div class="mdh-grade-result match"><strong>${displayed}</strong><span>Совпадает со средним баллом в MyDU (${current.toFixed(2)}).</span></div>`;
    return `<div class="mdh-grade-result mismatch"><strong>${displayed}</strong><span>В MyDU указано ${current.toFixed(2)} — значения не совпадают.</span><button type="button" id="mdh-add-average">Добавить замечание</button></div>`;
  }

  function gradeCalculatorHtml() {
    if (currentSection().id !== "education") return "";
    const inputs = [5, 4, 3, 2].map(grade => `<label><span>Оценок ${grade}</span><input type="number" min="0" step="1" inputmode="numeric" data-grade="${grade}" value="${esc(state.gradeCounts[grade])}"></label>`).join("");
    return `<section class="mdh-section"><h3>Средний балл</h3><div class="mdh-inner"><div class="mdh-grade-grid">${inputs}</div><div id="mdh-grade-result">${gradeResultHtml()}</div></div></section>`;
  }

  function bindGradeResult() {
    const add = shadow.querySelector("#mdh-add-average");
    if (add) add.onclick = () => addTemplate("average-grade");
  }

  function refreshGradeResult() {
    const result = shadow.querySelector("#mdh-grade-result");
    if (result) result.innerHTML = gradeResultHtml();
    bindGradeResult();
  }

  async function copyComment() {
    const text = commentText();
    if (!text) return toast("Сначала выберите хотя бы одно замечание.");
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const area = shadow.querySelector("#mdh-result");
      area.focus(); area.select(); document.execCommand("copy");
    }
    toast("Комментарий скопирован. Вставьте его в «Основание» вручную.");
  }

  function toast(message) {
    const element = shadow.querySelector("#mdh-toast");
    element.textContent = message;
    element.classList.add("show");
    setTimeout(() => element.classList.remove("show"), 2200);
  }

  function normalizeComparable(value) {
    return String(value || "").toUpperCase().replace(/Ё/g, "Е").replace(/[^0-9A-ZА-ЯӘҒҚҢӨҰҮҺІ]+/gu, "");
  }

  function documentContainsValue(documentText, value) {
    const expected = normalizeComparable(value);
    return expected.length > 1 && normalizeComparable(documentText).includes(expected);
  }

  function dateVariants(value) {
    const parts = String(value || "").match(/(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})/);
    if (!parts) return [value];
    const [, day, month, year] = parts;
    const monthName = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"][Number(month) - 1];
    return [`${day.padStart(2, "0")}.${month.padStart(2, "0")}.${year}`, `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`, `${day.padStart(2, "0")}-${month.padStart(2, "0")}-${year}`, monthName ? `${day.padStart(2, "0")}/${monthName}/${year}` : ""];
  }

  function documentContainsDate(documentText, value) {
    return dateVariants(value).some(variant => documentContainsValue(documentText, variant));
  }

  function applicantNameFields(allFields) {
    const nameFields = allFields.filter(field => /(фамилия|(^|\s)имя(\s|$)|отчество)/i.test(field.label) && !/транслитом/i.test(field.label));
    return nameFields.slice(0, 3).filter(field => field.value);
  }

  function comparison(label, matched, available = true) {
    return { label, status: !available ? "unknown" : matched ? "match" : "mismatch" };
  }

  function hasCorrectNameCase(value) {
    return String(value || "").split(/[\s-]+/).filter(Boolean).every(part => part[0] === part[0].toUpperCase() && part.slice(1) === part.slice(1).toLowerCase());
  }

  function authorityMatches(documentText, value) {
    if (documentContainsValue(documentText, value)) return true;
    const normalized = normalizeComparable(value);
    if (normalized.includes("МВДРК")) return /ҚР\s*ІІМ|МИНИСТЕРСТВО\s+ВНУТРЕННИХ\s+ДЕЛ\s+РК/i.test(documentText);
    return false;
  }

  function identityComparisons(documentText, allFields) {
    const nameFields = applicantNameFields(allFields);
    const values = {
      iin: findValueByLabel(allFields, /(^|\s)иин(\s|$)/i),
      birth: findValueByLabel(allFields, /дата рождения/i),
      number: findValueByLabel(allFields, /номер документа/i),
      issued: findValueByLabel(allFields, /дата выдачи документа/i),
      expires: findValueByLabel(allFields, /срок действия документа/i),
      authority: findValueByLabel(allFields, /орган,? выдавший документ/i)
    };
    return [
      comparison("ФИО", nameFields.length > 1 && nameFields.every(field => documentContainsValue(documentText, field.value)), nameFields.length > 1),
      comparison("Регистр ФИО в MyDU", nameFields.length > 1 && nameFields.every(field => hasCorrectNameCase(field.value)), nameFields.length > 1),
      comparison("ИИН", documentContainsValue(documentText, values.iin), Boolean(values.iin)),
      comparison("Дата рождения", documentContainsDate(documentText, values.birth), Boolean(values.birth)),
      comparison("Номер удостоверения", documentContainsValue(documentText, values.number), Boolean(values.number)),
      comparison("Дата выдачи", documentContainsDate(documentText, values.issued), Boolean(values.issued)),
      comparison("Срок действия", documentContainsDate(documentText, values.expires), Boolean(values.expires)),
      comparison("Кем выдан", authorityMatches(documentText, values.authority), Boolean(values.authority)),
      { label: "Фотография", status: "manual" }
    ];
  }

  function birthCertificateComparisons(documentText, allFields) {
    const allNameFields = allFields.filter(field => /(фамилия|(^|\s)имя(\s|$)|отчество)/i.test(field.label) && !/транслитом/i.test(field.label) && field.value);
    const applicant = allNameFields.slice(0, 3);
    const parentFields = allNameFields.slice(3);
    const parentGroups = [];
    for (let index = 0; index < parentFields.length; index += 3) {
      const group = parentFields.slice(index, index + 3).filter(field => field.value);
      if (group.length >= 2) parentGroups.push(group);
    }
    const applicantMatched = applicant.length > 1 && applicant.every(field => documentContainsValue(documentText, field.value));
    const parentMatched = parentGroups.some(group => group.every(field => documentContainsValue(documentText, field.value)));
    return [
      comparison("ФИО абитуриента", applicantMatched, applicant.length > 1),
      comparison("ФИО минимум одного родителя", parentMatched, parentGroups.length > 0)
    ];
  }

  function ieltsComparisons(documentText, allFields) {
    const nameFields = applicantNameFields(allFields);
    const certificateFields = allFields.filter(field => /сертификат|балл|дата получения/i.test(field.label));
    const number = findValueByLabel(certificateFields, /номер сертификата/i);
    const date = findValueByLabel(certificateFields, /дата (получения|выдачи).*сертификата/i);
    const score = findValueByLabel(certificateFields, /(^|\s)балл(\s|$)/i);
    const overall = documentText.match(/OVERALL\s*BAND\s*SCORE\s*([0-9]+(?:[.,][0-9]+)?)/i);
    const scoreMatched = overall && Number.parseFloat(overall[1].replace(",", ".")) === Number.parseFloat(score.replace(",", "."));
    return [
      comparison("ФИО", nameFields.length > 1 && nameFields.every(field => documentContainsValue(documentText, field.value)), nameFields.length > 1),
      comparison("Test Report Form Number", documentContainsValue(documentText, number), Boolean(number)),
      comparison("Дата сертификата", documentContainsDate(documentText, date), Boolean(date)),
      comparison("Overall Band Score", Boolean(scoreMatched), Boolean(score) && Boolean(overall))
    ];
  }

  function educationComparisons(documentText, allFields) {
    const series = findValueByLabel(allFields, /серия (аттестата|диплома)/i);
    const number = findValueByLabel(allFields, /номер (аттестата|диплома)/i);
    const result = [];
    if (series) result.push(comparison("Серия аттестата/диплома", documentContainsValue(documentText, series)));
    if (number) result.push(comparison("Номер аттестата/диплома", documentContainsValue(documentText, number)));
    if (!series && !number) result.push(comparison("Серия и номер", false, false));
    return result;
  }

  function extractNumericGrades(documentText) {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0 };
    const lines = String(documentText || "").split(/\r?\n/).map(line => line.replace(/\s+/g, " ").trim()).filter(Boolean);
    for (const line of lines) {
      if (!/[A-ZА-ЯӘҒҚҢӨҰҮҺІ]{3}/iu.test(line) || /(?:№|20\d{2}|\d{1,2}[.\/-]\d{1,2})/u.test(line)) continue;
      const matches = [...line.matchAll(/(?:^|[^\d])([2-5])(?=[^\d]|$)/gu)];
      matches.forEach(match => { counts[match[1]] += 1; });
    }
    const total = Object.values(counts).reduce((sum, value) => sum + value, 0);
    const weighted = Object.entries(counts).reduce((sum, [grade, count]) => sum + Number(grade) * count, 0);
    return total ? { counts, total, average: weighted / total } : null;
  }

  function documentType(documentText) {
    if (/приложени(?:е|я) к (?:аттестату|диплому)|скан-копия приложения/i.test(documentText)) return { id: "appendix", label: "Приложение с оценками" };
    if (/АТТЕСТАТ|ДИПЛОМ|ЖАЛПЫ ОРТА БІЛІМ ТУРАЛЫ|скан-копия аттестата|скан-копия диплома/i.test(documentText)) return { id: "education", label: "Аттестат/диплом" };
    if (/СВИДЕТЕЛЬСТВО О РОЖДЕНИИ|ТУУ ТУРАЛЫ|подтверждающ(?:ий|его) родств/i.test(documentText)) return { id: "birth", label: "Свидетельство о рождении" };
    if (/УДОСТОВЕРЕНИЕ ЛИЧНОСТИ|ЖЕКЕ КУӘЛІК|удостоверяющ(?:ий|его) личност/i.test(documentText)) return { id: "identity", label: "Удостоверение личности" };
    if (/IELTS|TEST REPORT FORM|международн(?:ый|ого) сертификат/i.test(documentText)) return { id: "ielts", label: "IELTS" };
    return { id: "unknown", label: "Документ" };
  }

  function matchingFields(allFields, pattern) {
    return allFields.filter(field => pattern.test(field.label));
  }

  function nameGroups(allFields) {
    const nameFields = matchingFields(allFields, /(фамилия|(^|\s)имя(\s|$)|отчество)/i)
      .filter(field => !/транслитом/i.test(field.label));
    const makeName = group => group.map(field => field.value).filter(Boolean).join(" ");
    const applicant = makeName(nameFields.slice(0, 3));
    const parents = [];
    for (let index = 3; index < nameFields.length; index += 3) {
      const value = makeName(nameFields.slice(index, index + 3));
      if (value) parents.push(value);
    }
    return { applicant, parents };
  }

  function referenceValues(type, allFields) {
    const row = (label, value, wide = false) => ({ label, value: String(value || "").trim() || "Не заполнено", wide, empty: !String(value || "").trim() });
    const names = nameGroups(allFields);
    if (type.id === "identity") return [
      row("ФИО абитуриента", names.applicant, true),
      row("ИИН", findValueByLabel(allFields, /(^|\s)иин(\s|$)/i)),
      row("Дата рождения", findValueByLabel(allFields, /дата рождения/i)),
      row("Номер документа", findValueByLabel(allFields, /номер документа/i)),
      row("Дата выдачи", findValueByLabel(allFields, /дата выдачи документа/i)),
      row("Срок действия", findValueByLabel(allFields, /срок действия документа/i)),
      row("Кем выдан", findValueByLabel(allFields, /орган,? выдавший документ/i), true)
    ];
    if (type.id === "birth") {
      const rows = [row("ФИО абитуриента", names.applicant, true)];
      names.parents.forEach((parent, index) => rows.push(row(`ФИО родителя ${index + 1}`, parent, true)));
      if (!names.parents.length) rows.push(row("ФИО родителя", "", true));
      return rows;
    }
    if (type.id === "education") return [
      row("Серия аттестата/диплома", findValueByLabel(allFields, /серия (аттестата|диплома)/i)),
      row("Номер аттестата/диплома", findValueByLabel(allFields, /номер (аттестата|диплома)/i))
    ];
    if (type.id === "appendix") return [
      row("Средний балл в MyDU", findValueByLabel(allFields, /средний балл (аттестата|диплома)/i), true)
    ];
    if (type.id === "ielts") return [
      row("ФИО абитуриента", names.applicant, true),
      row("Номер сертификата", findValueByLabel(allFields, /номер сертификата/i), true),
      row("Дата сертификата", findValueByLabel(allFields, /дата (получения|выдачи).*сертификата/i)),
      row("Балл", findValueByLabel(allFields, /(^|\s)балл(\s|$)/i))
    ];
    return [row("Тип файла", "Определите документ визуально", true)];
  }

  function findDocumentViewer() {
    const visible = element => {
      const rect = element.getBoundingClientRect();
      return rect.width > 220 && rect.height > 220 && rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth;
    };
    const dialogs = [...document.querySelectorAll("[role='dialog'], [aria-modal='true']")]
      .filter(element => visible(element) && /\.pdf\b/i.test(element.textContent || ""))
      .sort((a, b) => {
        const ar = a.getBoundingClientRect(); const br = b.getBoundingClientRect();
        return ar.width * ar.height - br.width * br.height;
      });
    if (dialogs.length) return dialogs[0];
    const media = [...document.querySelectorAll("canvas, img, iframe, embed, object")].filter(visible);
    for (const element of media) {
      let candidate = element;
      for (let depth = 0; candidate && candidate !== document.body && depth < 14; depth += 1, candidate = candidate.parentElement) {
        const text = (candidate.textContent || "").slice(0, 1200);
        if (/\.pdf\b/i.test(text) || candidate.getAttribute?.("role") === "dialog" || candidate.getAttribute?.("aria-modal") === "true") return candidate;
      }
    }
    return null;
  }

  function viewerText(viewer) {
    const selectors = [".textLayer", "[class*='textLayer']", "[class*='text-layer']", "[class*='text_layer']", "[class*='TextLayer']", "[class*='textContent']", "svg text"];
    const pieces = [];
    for (const selector of selectors) {
      viewer.querySelectorAll(selector).forEach(node => {
        const text = (node.innerText || node.textContent || "").trim();
        if (text.length > 2 && !pieces.includes(text)) pieces.push(text);
      });
    }
    viewer.querySelectorAll("iframe").forEach(frame => {
      try {
        const frameDocument = frame.contentDocument;
        if (!frameDocument) return;
        for (const selector of selectors) {
          frameDocument.querySelectorAll(selector).forEach(node => {
            const text = (node.innerText || node.textContent || "").trim();
            if (text.length > 2 && !pieces.includes(text)) pieces.push(text);
          });
        }
        const bodyText = (frameDocument.body?.innerText || "").trim();
        if (/УДОСТОВЕРЕНИЕ ЛИЧНОСТИ|ЖЕКЕ КУӘЛІК|СВИДЕТЕЛЬСТВО О РОЖДЕНИИ|ТУУ ТУРАЛЫ|АТТЕСТАТ|ДИПЛОМ|ЖАЛПЫ ОРТА БІЛІМ|IELTS|TEST REPORT FORM/i.test(bodyText)) pieces.push(bodyText);
      } catch (_) {
        // Cross-origin/isolated PDF frames cannot expose their text to the extension.
      }
    });
    if (pieces.join(" ").length > 30) return pieces.join(" ");
    const fallback = (viewer.innerText || "").trim();
    return /УДОСТОВЕРЕНИЕ ЛИЧНОСТИ|ЖЕКЕ КУӘЛІК|СВИДЕТЕЛЬСТВО О РОЖДЕНИИ|ТУУ ТУРАЛЫ|IELTS|TEST REPORT FORM/i.test(fallback) ? fallback : "";
  }

  function comparisonsForDocument(type, text, allFields) {
    if (type.id === "identity") return identityComparisons(text, allFields);
    if (type.id === "birth") return birthCertificateComparisons(text, allFields);
    if (type.id === "ielts") return ieltsComparisons(text, allFields);
    if (type.id === "education") return educationComparisons(text, allFields);
    return [];
  }

  function scanDocumentViewer() {
    if (!shadow || !root) return;
    const viewer = findDocumentViewer();
    if (!viewer) {
      if (documentReview) {
        documentReview = null; lastDocumentSignature = ""; lastAttachmentHint = ""; referenceCollapsed = false; render();
      }
      return;
    }
    const layerText = viewerText(viewer);
    const filename = ((viewer.innerText || "").match(/[^\n]*\.pdf\b/i) || ["Открытый PDF"])[0].trim();
    const text = layerText || "";
    const type = documentType(`${layerText} ${lastAttachmentHint}`);
    const allFields = fields();
    const comparisons = text ? comparisonsForDocument(type, text, allFields) : [];
    const grades = text && type.id === "appendix" ? extractNumericGrades(text) : null;
    const reference = referenceValues(type, allFields);
    const signature = `${filename}|${lastAttachmentHint}|${type.id}|${text.length}|${comparisons.map(item => item.status).join(",")}|${grades?.total || 0}|${reference.map(item => `${item.label}:${item.value}`).join("|")}`;
    if (signature === lastDocumentSignature) return;
    lastDocumentSignature = signature;
    documentReview = {
      filename,
      typeId: type.id,
      type: type.label,
      textAvailable: text.length > 30,
      source: layerText ? "text" : "",
      comparisons,
      grades,
      reference
    };
    render();
  }

  function documentReviewHtml() {
    if (!documentReview) return "";
    const icons = { match: "✓", mismatch: "!", unknown: "?", manual: "○" };
    const rows = documentReview.comparisons.map(item => `<div class="mdh-doc-row ${item.status}"><span>${icons[item.status]}</span><b>${esc(item.label)}</b><small>${item.status === "match" ? "Совпадает" : item.status === "mismatch" ? "Не найдено совпадение" : item.status === "manual" ? "Проверить вручную" : "Нет поля в MyDU"}</small></div>`).join("");
    const references = (documentReview.reference || []).map(item => `<div class="mdh-reference-value ${item.wide ? "wide" : ""} ${item.empty ? "empty" : ""}"><small>${esc(item.label)}</small><strong>${esc(item.value)}</strong></div>`).join("");
    let grades = "";
    if (documentReview.grades) {
      const current = myduAverage();
      const value = documentReview.grades.average;
      const comparisonText = current === null ? "Средний балл в MyDU сейчас не виден." : Math.abs(current - value) < 0.005 ? `Совпадает с MyDU (${current.toFixed(2)}).` : `В MyDU указано ${current.toFixed(2)} — проверьте расхождение.`;
      grades = `<div class="mdh-readable-grades"><b>Оценок в читаемом тексте: ${documentReview.grades.total}</b><span>5 — ${documentReview.grades.counts[5]}, 4 — ${documentReview.grades.counts[4]}, 3 — ${documentReview.grades.counts[3]}, 2 — ${documentReview.grades.counts[2]}</span><strong>Средний балл: ${value.toFixed(2)}</strong><small>${comparisonText} Проверьте количества по документу.</small></div>`;
    }
    const readable = documentReview.textAvailable
      ? (rows || grades ? `<div class="mdh-readable"><span>Текст PDF доступен для автосверки</span>${rows}${grades}</div>` : `<p class="mdh-reference-note">Текст PDF читается, но для этого типа документа автоматические поля не настроены.</p>`)
      : `<p class="mdh-reference-note">У PDF нет доступного текстового слоя. Сверяйте документ вручную со значениями MyDU выше.</p>`;
    return `<style>.mdh-reference-section{position:sticky;top:-12px;z-index:20;border-color:#9cc7ff;box-shadow:0 8px 24px #173d6626;background:#fff}.mdh-reference-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 11px;background:#eaf4ff}.mdh-reference-head div{min-width:0}.mdh-reference-head h3{padding:0;background:none;font-size:13px}.mdh-reference-head small{display:block;margin-top:2px;color:#476987;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:300px}.mdh-reference-toggle{border:0;border-radius:7px;background:#fff;color:#1557a0;padding:6px 8px;font-size:10px;font-weight:700;cursor:pointer}.mdh-reference-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}.mdh-reference-value{padding:8px;border:1px solid #d9e6f4;border-radius:8px;background:#f8fbff;min-width:0;user-select:text}.mdh-reference-value.wide{grid-column:1/-1}.mdh-reference-value small{display:block;color:#668099;font-size:9px;margin-bottom:3px}.mdh-reference-value strong{display:block;color:#102a43;font-size:12px;line-height:1.25;overflow-wrap:anywhere}.mdh-reference-value.empty strong{color:#a13b3b}.mdh-reference-note{margin:8px 0 0;padding:7px;border-radius:7px;background:#fff7df;color:#6c5309;font-size:10px;line-height:1.35}.mdh-readable{margin-top:8px;border-top:1px solid #dfe8f2;padding-top:8px}.mdh-readable>span{display:block;color:#167044;font-size:10px;font-weight:700;margin-bottom:5px}.mdh-doc-row{display:grid;grid-template-columns:20px 1fr auto;align-items:center;gap:5px;padding:6px;border-bottom:1px solid #e6ebf1}.mdh-doc-row>span{display:grid;place-items:center;width:18px;height:18px;border-radius:50%;font-weight:800}.mdh-doc-row b{font-size:11px}.mdh-doc-row small{font-size:9px}.mdh-doc-row.match>span{background:#dff5e7;color:#167044}.mdh-doc-row.match small{color:#167044}.mdh-doc-row.mismatch>span{background:#ffe4e4;color:#a22121}.mdh-doc-row.mismatch small{color:#a22121}.mdh-doc-row.unknown>span,.mdh-doc-row.manual>span{background:#edf3fa;color:#536b84}.mdh-readable-grades{display:grid;gap:4px;padding:8px;border-radius:8px;background:#f3f8ff;color:#173d66;font-size:10px}.mdh-readable-grades strong{font-size:16px}.mdh-readable-grades small{line-height:1.35;color:#536b84}</style><section class="mdh-section mdh-reference-section"><div class="mdh-reference-head"><div><h3>Данные MyDU · ${esc(documentReview.type)}</h3><small title="${esc(documentReview.filename)}">${esc(documentReview.filename)}</small></div><button type="button" class="mdh-reference-toggle" id="mdh-reference-toggle">${referenceCollapsed ? "Развернуть" : "Свернуть"}</button></div>${referenceCollapsed ? "" : `<div class="mdh-inner"><div class="mdh-reference-grid">${references}</div>${readable}</div>`}</section>`;
  }

  function currentSection() {
    return SECTIONS.find(section => section.id === state.activeSection) || SECTIONS[0];
  }

  function templateHtml(template) {
    const query = state.query.trim().toLowerCase();
    if (!currentSection().groups.includes(template.group)) return "";
    if (query && !`${template.group} ${template.title} ${template.text}`.toLowerCase().includes(query)) return "";
    return `<button type="button" class="mdh-template" data-add="${esc(template.id)}"><span>${esc(template.group)}</span><strong>${esc(template.title)}</strong><small>${esc(template.text)}</small></button>`;
  }

  function render() {
    if (!shadow) return;
    const oldBody = shadow.querySelector(".mdh-body");
    const scrollTop = oldBody ? oldBody.scrollTop : 0;
    const oldSearch = shadow.querySelector("#mdh-search");
    const restoreSearch = shadow.activeElement === oldSearch;
    const selectionStart = oldSearch?.selectionStart ?? 0;
    const selectionEnd = oldSearch?.selectionEnd ?? 0;
    const warnings = state.warnings.length
      ? state.warnings.map((item, index) => `<div class="mdh-warning ${item.level}"><span>${esc(item.text)}</span><div class="mdh-warning-actions"><button type="button" data-warning-add="${index}">Добавить</button><button type="button" data-warning-ignore="${index}">Игнорировать</button></div></div>`).join("")
      : `<p class="mdh-empty">${state.checksRun ? "Предупреждений нет." : "Нажмите «Проверить поля», чтобы найти формальные несоответствия."}</p>`;
    const selected = state.selected.length
      ? state.selected.map((item, index) => `<div class="mdh-picked"><div><b>${index + 1}. ${esc(item.title)}</b><textarea data-picked="${esc(item.id)}">${esc(item.text)}</textarea></div><button type="button" title="Удалить" data-remove="${esc(item.id)}">×</button></div>`).join("")
      : `<p class="mdh-empty">Замечания ещё не выбраны.</p>`;
    const templates = TEMPLATES.map(templateHtml).join("") || `<p class="mdh-empty">В этом разделе шаблоны не найдены.</p>`;
    const tabs = SECTIONS.map(section => `<button type="button" class="mdh-tab ${section.id === currentSection().id ? "active" : ""}" data-section="${section.id}">${esc(section.label)}</button>`).join("");

    shadow.innerHTML = `<style>
      :host{all:initial}.mdh-launch{position:fixed;left:20px;bottom:22px;z-index:2147483646;width:52px;height:52px;border:0;border-radius:50%;background:#006fff;color:#fff;font:800 14px Arial;box-shadow:0 8px 24px #002b664d;cursor:grab;touch-action:none;user-select:none}.mdh-launch.dragging{cursor:grabbing}.mdh-panel{position:fixed;left:18px;bottom:18px;z-index:2147483647;width:min(430px,calc(100vw - 30px));height:min(760px,calc(100vh - 36px));background:#fff;color:#172033;border:1px solid #d9e2ef;border-radius:18px;box-shadow:0 18px 55px #13233e40;font:14px Arial,sans-serif;display:flex;flex-direction:column;overflow:hidden;pointer-events:auto}.mdh-panel.hidden{display:none}.mdh-header{padding:14px 16px;background:#f7fbff;border-bottom:1px solid #dce7f4;display:flex;align-items:center;justify-content:space-between;gap:12px;cursor:grab;touch-action:none;user-select:none}.mdh-header.dragging{cursor:grabbing}.mdh-header h2{font-size:16px;margin:0}.mdh-drag-hint{color:#7b8da3;font-size:17px;letter-spacing:-3px;margin-right:8px}.mdh-close{border:0;background:#e9f1fa;border-radius:9px;width:30px;height:30px;font-size:21px;color:#34465d;cursor:pointer}.mdh-body{padding:12px;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;touch-action:pan-y;scrollbar-gutter:stable;min-height:0}.mdh-section{border:1px solid #dce5f0;border-radius:12px;margin-bottom:10px;overflow:hidden}.mdh-section h3{font-size:13px;margin:0;padding:10px 11px;background:#f8fafc}.mdh-inner{padding:10px}.mdh-tabs{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin-bottom:9px}.mdh-tab{min-height:42px;padding:6px 5px;border:1px solid #dbe4ee;border-radius:8px;background:#fff;color:#526273;font:700 11px Arial;cursor:pointer}.mdh-tab.active{color:#fff;background:#006fff;border-color:#006fff}.mdh-actions{display:flex;gap:8px}.mdh-primary,.mdh-secondary{border:0;border-radius:9px;padding:9px 10px;cursor:pointer;font-weight:700;font-size:12px}.mdh-primary{background:#006fff;color:#fff}.mdh-secondary{background:#edf3fa;color:#25415d}.mdh-warning{display:flex;gap:8px;align-items:start;border-radius:9px;padding:8px;margin-bottom:7px;font-size:12px;line-height:1.35}.mdh-warning span{flex:1}.mdh-warning-actions{display:flex;flex-direction:column;gap:4px}.mdh-warning button{border:0;border-radius:7px;padding:5px 7px;background:#fff;color:#20529a;font-size:11px;font-weight:700;cursor:pointer}.mdh-warning.warning{background:#fff7df;color:#674d00}.mdh-warning.danger{background:#fff0f0;color:#8a2020}.mdh-warning.note{background:#edf6ff;color:#174e83}.mdh-grade-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:9px}.mdh-grade-grid label span{display:block;font-size:10px;color:#657184;margin-bottom:4px}.mdh-grade-grid input{width:100%;box-sizing:border-box;border:1px solid #cbd8e6;border-radius:8px;padding:8px;font:13px Arial}.mdh-grade-result{display:flex;align-items:center;gap:8px;padding:8px;border-radius:9px;background:#edf6ff;color:#174e83}.mdh-grade-result strong{font-size:22px}.mdh-grade-result span{flex:1;font-size:11px;line-height:1.35}.mdh-grade-result.match{background:#eaf8ef;color:#176b3a}.mdh-grade-result.mismatch{background:#fff0f0;color:#8a2020}.mdh-grade-result button{border:0;border-radius:7px;padding:6px;background:#fff;color:#8a2020;font-size:10px;font-weight:700;cursor:pointer}.mdh-empty{font-size:12px;color:#6b7787;line-height:1.35;margin:0}.mdh-search{width:100%;border:1px solid #cbd8e6;border-radius:9px;padding:9px;box-sizing:border-box;margin-bottom:8px;font:13px Arial}.mdh-template{width:100%;text-align:left;border:1px solid #dbe4ee;background:#fff;border-radius:10px;padding:9px;margin-bottom:7px;cursor:pointer;color:#172033}.mdh-template:hover{border-color:#6daaf7;background:#f8fbff}.mdh-template span{display:block;color:#5b78a0;font-size:10px;margin-bottom:3px}.mdh-template strong{display:block;font-size:12px;margin-bottom:4px}.mdh-template small{display:block;font-size:11px;line-height:1.35;color:#526273}.mdh-picked{display:flex;gap:7px;padding:8px;border-bottom:1px solid #e5eaf0}.mdh-picked:last-child{border-bottom:0}.mdh-picked>div{flex:1}.mdh-picked b{font-size:11px;display:block;margin-bottom:5px}.mdh-picked textarea,.mdh-result,.mdh-custom{width:100%;box-sizing:border-box;border:1px solid #cbd8e6;border-radius:8px;padding:7px;font:12px Arial;line-height:1.35;resize:vertical;min-height:58px}.mdh-picked button{height:25px;width:25px;border:0;background:#fff0f0;color:#b42318;border-radius:7px;cursor:pointer;font-size:18px}.mdh-custom{min-height:52px;margin-bottom:7px}.mdh-result{min-height:112px;background:#fbfdff}.mdh-footer{font-size:11px;color:#657184;padding:0 2px 2px}.mdh-toast{position:absolute;left:12px;right:12px;bottom:12px;background:#122033;color:white;padding:10px;border-radius:10px;font-size:12px;opacity:0;pointer-events:none;transform:translateY(10px);transition:.2s}.mdh-toast.show{opacity:1;transform:translateY(0)}
    </style><button type="button" class="mdh-launch" id="mdh-launch" style="${positionStyle("launch")}" title="Открыть или перетащить помощник">MD</button><aside class="mdh-panel ${state.collapsed ? "hidden" : ""}" style="${positionStyle("panel")}"><header class="mdh-header" title="Перетащите, чтобы переместить"><h2><span class="mdh-drag-hint" aria-hidden="true">⠿</span>MyDU Helper</h2><button type="button" class="mdh-close" id="mdh-close" title="Свернуть">×</button></header><main class="mdh-body"><section class="mdh-section"><h3>Формальные проверки</h3><div class="mdh-inner"><div class="mdh-actions"><button type="button" class="mdh-primary" id="mdh-run">Проверить поля</button></div><div id="mdh-warnings" style="margin-top:8px">${warnings}</div></div></section><section class="mdh-section"><h3>Шаблоны замечаний</h3><div class="mdh-inner"><div class="mdh-tabs">${tabs}</div><input class="mdh-search" id="mdh-search" value="${esc(state.query)}" placeholder="Поиск в разделе…"><div>${templates}</div></div></section><section class="mdh-section"><h3>Готовый комментарий</h3><div class="mdh-inner"><div>${selected}</div><textarea class="mdh-custom" id="mdh-custom" placeholder="Дополнительный пункт… (Enter — добавить)">${esc(state.custom)}</textarea><textarea class="mdh-result" id="mdh-result" readonly placeholder="Здесь появится готовый текст">${esc(commentText())}</textarea><div class="mdh-actions" style="margin-top:7px"><button type="button" class="mdh-primary" id="mdh-copy">Скопировать</button><button type="button" class="mdh-secondary" id="mdh-clear">Очистить</button></div></div></section><p class="mdh-footer">Черновик хранится локально и удаляется через 3 минуты.</p></main><div class="mdh-toast" id="mdh-toast"></div></aside>`;
    if (currentSection().id === "education") shadow.querySelector(".mdh-section").insertAdjacentHTML("afterend", gradeCalculatorHtml());
    if (documentReview) shadow.querySelector(".mdh-body").insertAdjacentHTML("afterbegin", documentReviewHtml());
    placeElement(shadow.querySelector(".mdh-panel"), "panel");
    placeElement(shadow.querySelector(".mdh-launch"), "launch");
    bindEvents();
    requestAnimationFrame(() => {
      const body = shadow.querySelector(".mdh-body");
      if (body) body.scrollTop = scrollTop;
      if (restoreSearch) {
        const search = shadow.querySelector("#mdh-search");
        search.focus(); search.setSelectionRange(selectionStart, selectionEnd);
      }
    });
  }

  function bindEvents() {
    const panel = shadow.querySelector(".mdh-panel");
    const launch = shadow.querySelector("#mdh-launch");
    makeDraggable(panel, shadow.querySelector(".mdh-header"), "panel");
    makeDraggable(launch, launch, "launch", true);
    const panelBody = shadow.querySelector(".mdh-body");
    panelBody.addEventListener("wheel", event => event.stopPropagation(), { passive: true });
    panelBody.addEventListener("touchmove", event => event.stopPropagation(), { passive: true });
    const referenceToggle = shadow.querySelector("#mdh-reference-toggle");
    if (referenceToggle) referenceToggle.onclick = () => { referenceCollapsed = !referenceCollapsed; render(); };
    launch.onclick = () => { state.collapsed = false; render(); scheduleSave(); };
    shadow.querySelector("#mdh-close").onclick = () => { state.collapsed = true; render(); scheduleSave(); };
    shadow.querySelector("#mdh-run").onclick = runChecks;
    shadow.querySelector("#mdh-copy").onclick = copyComment;
    shadow.querySelector("#mdh-clear").onclick = () => { state.selected = []; state.custom = ""; render(); scheduleSave(); };
    shadow.querySelectorAll("[data-section]").forEach(node => node.onclick = () => { state.activeSection = node.dataset.section; state.query = ""; render(); scheduleSave(); });
    shadow.querySelectorAll("[data-add]").forEach(node => node.onclick = () => addTemplate(node.dataset.add));
    shadow.querySelectorAll("[data-warning-add]").forEach(node => node.onclick = () => resolveWarning(Number(node.dataset.warningAdd), true));
    shadow.querySelectorAll("[data-warning-ignore]").forEach(node => node.onclick = () => resolveWarning(Number(node.dataset.warningIgnore), false));
    shadow.querySelectorAll("[data-grade]").forEach(node => node.oninput = event => {
      const grade = event.currentTarget.dataset.grade;
      const value = event.currentTarget.value.replace(/\D/g, "");
      state.gradeCounts[grade] = value;
      event.currentTarget.value = value;
      refreshGradeResult(); scheduleSave();
    });
    bindGradeResult();
    shadow.querySelectorAll("[data-remove]").forEach(node => node.onclick = () => { state.selected = state.selected.filter(item => item.id !== node.dataset.remove); render(); scheduleSave(); });
    shadow.querySelectorAll("[data-picked]").forEach(node => node.oninput = event => { const item = state.selected.find(value => value.id === event.currentTarget.dataset.picked); if (item) item.text = event.currentTarget.value; scheduleSave(); });
    const custom = shadow.querySelector("#mdh-custom");
    custom.oninput = event => { state.custom = event.currentTarget.value; shadow.querySelector("#mdh-result").value = commentText(); scheduleSave(); };
    custom.onkeydown = event => {
      if (event.key !== "Enter" || event.shiftKey || !event.currentTarget.value.trim()) return;
      event.preventDefault();
      state.custom = event.currentTarget.value;
      addCustomPoint();
    };
    shadow.querySelector("#mdh-search").oninput = event => { state.query = event.currentTarget.value; render(); scheduleSave(); };
  }

  async function mount() {
    const id = applicantId();
    if (!id || root) return;
    lastApplicantId = id; draftKey = `mydu-helper-draft-${id}`;
    const [saved, savedPosition] = await Promise.all([storageGet(draftKey), storageGet(POSITION_KEY)]);
    uiPosition = {
      panel: validPosition(savedPosition?.panel),
      launch: validPosition(savedPosition?.launch)
    };
    state = saved && saved.expiresAt > Date.now() ? { ...freshState(), ...saved.state } : freshState();
    if (saved && saved.expiresAt <= Date.now()) chrome.storage.local.remove(draftKey);
    root = document.createElement("div"); root.id = "mydu-manager-helper-root"; root.style.all = "initial";
    shadow = root.attachShadow({ mode: "open" }); document.documentElement.appendChild(root);
    render();
  }

  function captureAttachmentHint(event) {
    const target = event.target instanceof Element ? event.target.closest("button, a, [role='button']") : null;
    if (!target) return;
    const text = (target.innerText || target.textContent || "").trim();
    if (!/\.pdf\b|скан-копия|документ,?\s+подтверждающ|сертификат/i.test(text)) return;
    lastAttachmentHint = text;
    lastDocumentSignature = "";
    referenceCollapsed = false;
    state.collapsed = false;
    setTimeout(scanDocumentViewer, 150);
    setTimeout(scanDocumentViewer, 700);
  }

  document.addEventListener("click", captureAttachmentHint, true);

  setInterval(async () => {
    const id = applicantId();
    if (id === lastApplicantId) {
      scanDocumentViewer();
      return;
    }
    clearTimeout(saveTimer);
    if (lastApplicantId && draftKey) await storageSet({ [draftKey]: draftPayload() });
    root?.remove(); root = shadow = null; lastApplicantId = null;
    documentReview = null; lastDocumentSignature = ""; lastAttachmentHint = ""; referenceCollapsed = false;
    if (id) await mount();
  }, 1000);
  mount();
})();
