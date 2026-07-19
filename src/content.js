(() => {
  "use strict";

  const DRAFT_TTL = 3 * 60 * 1000;
  const POSITION_KEY = "mydu-helper-position";
  const ASSETS = {
    brand: chrome.runtime.getURL("src/assets/aitu-logo.png"),
    question: chrome.runtime.getURL("src/assets/mascot-question.png"),
    smile: chrome.runtime.getURL("src/assets/mascot-smile.png"),
    peek: chrome.runtime.getURL("src/assets/mascot-peek.png")
  };
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
    { id: "unt-invalid-certificate", group: "ЕНТ/Собеседование", title: "Сертификат ЕНТ недействителен", text: "Ваш сертификат ЕНТ является недействительным: не достигнут минимальный порог по обязательным предметам. По истории Казахстана необходимо набрать не менее 5 баллов, по грамотности чтения и математической грамотности — не менее 3 баллов. Предоставьте действительный сертификат ЕНТ с результатами не ниже установленных минимальных значений." },
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
    { id: "unt-invalid-certificate", group: "ЕНТ/Собеседование", title: "Сертификат ЕНТ недействителен", text: "Ваш сертификат ЕНТ является недействительным: не достигнут минимальный порог по обязательным предметам. По истории Казахстана необходимо набрать не менее 5 баллов, по грамотности чтения и математической грамотности — не менее 3 баллов. Предоставьте действительный сертификат ЕНТ с результатами не ниже установленных минимальных значений." },
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
  let renderedView = null;
  let lastMyduSection = null;
  let pageFieldCache = { personal: [], education: [], admission: [], social: [] };
  let ocrWorkerPromise = null;
  let ocrJob = null;
  let ocrGeneration = 0;
  const ocrCache = new Map();
  const ocrPageStability = new Map();
  const OCR_LANGUAGES = ["kaz", "rus", "eng"];
  const OCR_MAX_WIDTH = 2400;
  const OCR_MIN_WIDTH = 1400;

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
    return { selected: [], custom: "", query: "", activeSection: "personal", activeView: "checks", collapsed: false, warnings: [], checksRun: false, gradeCounts: { 5: "", 4: "", 3: "", 2: "" } };
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

  function fields(includeHidden = false) {
    return [...document.querySelectorAll("input, textarea, select, button[disabled]")]
      .filter(element => includeHidden || element.offsetParent !== null)
      .map(element => ({
        label: inputLabel(element),
        value: String(element.tagName === "SELECT" ? element.selectedOptions?.[0]?.textContent || element.value || "" : element.value || element.innerText || "").trim(),
        type: element.type,
        checked: element.checked
      }));
  }

  function documentFields() {
    const current = fields(true).filter(field => field.type !== "hidden" && field.label);
    const cached = Object.values(pageFieldCache).flat();
    return [...new Map([...current, ...cached].map(field => [`${field.label}\u0000${field.value}\u0000${field.type || ""}`, field])).values()];
  }

  function cacheCurrentSectionFields(sectionId = lastMyduSection || activeMyduSection()) {
    if (!sectionId || !Object.hasOwn(pageFieldCache, sectionId)) return;
    const active = activeMyduSection();
    if (active && active !== sectionId) return;
    const snapshot = fields().filter(field => field.type !== "hidden" && field.label);
    if (snapshot.length) pageFieldCache[sectionId] = snapshot;
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

  function inspectWorkplace(value) {
    const workplace = String(value || "").replace(/\s+/g, " ").trim();
    if (!workplace || workplace.toLocaleLowerCase("ru-RU") === "нет") return null;
    if (workplace.toLocaleLowerCase("ru-RU") === "нету") return { templateId: "parent-unemployed", level: "warning", text: "В поле «Место работы» укажите «Нет» вместо «Нету»" };
    if (workplace.replace(/[\s.]/g, "").length <= 3) return { templateId: "parent-work", level: "warning", text: "Место работы заполнено слишком коротко" };
    return null;
  }

  function nameCaseWarnings(allFields) {
    const nameFields = allFields.filter(field => field.value && /(?:^|\s)(?:фио|фамилия|имя|отчество)(?=\s|$)/i.test(field.label) && !["checkbox", "radio", "button", "submit", "hidden"].includes(field.type));
    const applicantFields = new Set(nameFields.filter(field => !/транслитом|латиниц/i.test(field.label)).slice(0, 3));
    const invalidApplicant = [];
    const invalidParents = [];
    for (const field of nameFields) {
      if (hasCorrectNameCase(field.value)) continue;
      const label = field.label.replace(/\s*\*\s*/g, "").trim();
      if (/родител|матер|мать|отец|опекун|законн.*представител/i.test(field.label)) invalidParents.push(label);
      else if (/транслитом|латиниц|абитуриент|заявител/i.test(field.label) || applicantFields.has(field)) invalidApplicant.push(label);
      else invalidParents.push(label);
    }
    const results = [];
    if (invalidApplicant.length) results.push({ templateId: "fio-case", key: "fio-case", level: "warning", text: `Неверный регистр ФИО абитуриента: ${[...new Set(invalidApplicant)].join(", ")}` });
    if (invalidParents.length) results.push({ templateId: "parent-fio-case", key: "parent-fio-case", level: "warning", text: `Неверный регистр ФИО родителя: ${[...new Set(invalidParents)].join(", ")}` });
    return results;
  }

  function schoolInterviewWarning(allFields) {
    const admissionType = findValueByLabel(allFields, /тип поступления/i);
    if (!/собеседован/i.test(admissionType)) return null;
    const citizenship = findValueByLabel(allFields, /гражданство/i);
    if (citizenship && !/казахстан|kazakhstan|қазақстан/i.test(citizenship)) return null;
    const school = allFields.some(field => {
      const relevantLabel = /категор|предыдущ.*образован|образовательн.*учрежден|учебн.*заведен|место окончания|тип.*образован|вид.*учрежден/i.test(field.label);
      return relevantLabel && /выпускник.*школ|общеобразовательн.*школ|(^|\s)школ[аы](\s|$)|общее среднее/i.test(field.value);
    });
    return school ? { templateId: "wrong-admission-type", key: "wrong-admission-type", level: "danger", text: "Для выпускника школы выбран тип поступления «Собеседование» вместо «ЕНТ»" } : null;
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
    const comprehensiveFields = documentFields();
    const activePageSection = activeMyduSection() || lastMyduSection || "personal";
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
      const issue = inspectWorkplace(field.value);
      if (issue) results.push(issue);
    }
    if (activePageSection === "personal") results.push(...nameCaseWarnings(comprehensiveFields));
    if (activePageSection === "admission") {
      const admissionIssue = schoolInterviewWarning(comprehensiveFields);
      if (admissionIssue) results.push(admissionIssue);
    }
    if (activePageSection === "education") {
      const calculatedAverage = gradeAverage();
      const applicationAverage = myduAverageData();
      if (calculatedAverage && applicationAverage.value !== null && Math.abs(calculatedAverage.value - applicationAverage.value) >= 0.005) {
        results.push({ templateId: "wrong-average", key: "wrong-average", level: "danger", text: `Средний балл не совпадает: по оценкам — ${calculatedAverage.value.toFixed(2)}, в заявлении — ${applicationAverage.raw}` });
      }
    }
    results.push(...missingAttachmentWarnings());
    const untIssue = documentReview?.typeId === "unt" ? documentReview.untThreshold : null;
    if (untIssue?.invalid) results.push(untThresholdWarning(untIssue));
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
    if (state.selected.some(item => item.templateId === id)) return true;
    state.selected.push({ id: `${id}-${Date.now()}-${Math.random()}`, templateId: id, title: template.title, text: template.text });
    return true;
  }

  function addTemplate(id) {
    if (!appendTemplate(id)) return;
    render(); scheduleSave();
  }

  function toggleTemplate(id) {
    if (state.selected.some(item => item.templateId === id)) {
      state.selected = state.selected.filter(item => item.templateId !== id);
    } else {
      appendTemplate(id);
    }
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
    requestAnimationFrame(() => shadow?.querySelector("#mdh-custom")?.focus());
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

  function valueNearLabel(pattern) {
    let best = null;
    for (const element of document.querySelectorAll("input, textarea, select")) {
      if (element.type === "hidden") continue;
      const value = String(element.tagName === "SELECT" ? element.selectedOptions?.[0]?.textContent || element.value || "" : element.value || "").trim();
      if (!value) continue;
      for (let current = element.parentElement, depth = 0; current && current !== document.body && depth < 6; current = current.parentElement, depth += 1) {
        const text = String(current.innerText || current.textContent || "").replace(/\s+/g, " ").trim();
        if (text.length > 700) break;
        if (!pattern.test(text)) continue;
        const score = text.length + depth * 100;
        if (!best || score < best.score) best = { score, value };
        break;
      }
    }
    return best?.value || "";
  }

  function myduAverageData() {
    const labelPattern = /средний\s+балл.*(?:аттестат|диплом)/i;
    const raw = findValueByLabel(documentFields(), labelPattern) || valueNearLabel(labelPattern);
    const parsed = Number.parseFloat(raw.replace(",", "."));
    return { raw, value: Number.isFinite(parsed) ? parsed : null };
  }

  function myduAverage() {
    return myduAverageData().value;
  }

  function gradeResultHtml() {
    const calculated = gradeAverage();
    if (!calculated) return `<p class="mdh-empty">Введите количество числовых оценок.</p>`;
    const displayed = calculated.value.toFixed(2);
    const current = myduAverageData();
    const values = `<div class="mdh-grade-values"><div><small>По оценкам</small><strong>${displayed}</strong></div><div><small>В заявлении</small><strong>${esc(current.raw || "—")}</strong></div></div>`;
    if (current.value === null) return `<div class="mdh-grade-result">${values}<span>Оценок: ${calculated.total}. Поле «Средний балл аттестата» в MyDU не найдено.</span></div>`;
    if (Math.abs(current.value - calculated.value) < 0.005) return `<div class="mdh-grade-result match">${values}<span>Значения совпадают.</span></div>`;
    return `<div class="mdh-grade-result mismatch">${values}<span>Значения не совпадают.</span><button type="button" id="mdh-add-average">Добавить замечание</button></div>`;
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
      if (!area) return toast("Не удалось скопировать комментарий. Откройте раздел «Комментарий» и попробуйте снова.");
      area.focus(); area.select(); document.execCommand("copy");
    }
    toast("Комментарий скопирован. Вставьте его в «Основание» вручную.");
  }

  function toast(message) {
    if (!shadow) return;
    const element = shadow.querySelector("#mdh-toast");
    if (!element) return;
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

  function ieltsNameValues(allFields) {
    return {
      family: findValueByLabel(allFields, /фамилия.*(транслитом|латиниц)|(?:транслитом|латиниц).*фамилия/i),
      first: findValueByLabel(allFields, /(?:^|\s)имя.*(транслитом|латиниц)|(?:транслитом|латиниц).*(?:^|\s)имя/i)
    };
  }

  function extractIeltsName(documentText, kind) {
    const pattern = kind === "family"
      ? /FAMILY\s+NAME[^A-Z]+([A-Z][A-Z'’\-]{1,})/i
      : /FIRST\s+NAME(?:\(S\))?[^A-Z]+([A-Z][A-Z'’\-]{1,})/i;
    return documentText.match(pattern)?.[1] || "";
  }

  function extractIeltsOverall(documentText) {
    const direct = documentText.match(/OVERALL\s*BAND\s*SCORE[^0-9]{0,40}([0-9](?:[.,][0-9])?)/i);
    if (direct) return Number.parseFloat(direct[1].replace(",", "."));
    const line = String(documentText || "").split(/\r?\n/).find(value => /OVERALL|BAND\s*SCORE/i.test(value));
    if (!line) return null;
    const afterLabel = line.replace(/^.*?(?:OVERALL\s*BAND\s*SCORE|BAND\s*SCORE)/i, "");
    const value = afterLabel.match(/([0-9](?:[.,][0-9])?)/);
    return value ? Number.parseFloat(value[1].replace(",", ".")) : null;
  }

  function ieltsComparison(label, documentValue, myduValue, matched) {
    const available = Boolean(String(myduValue || "").trim());
    return {
      ...comparison(label, matched, available),
      message: !available ? "Нет поля в MyDU" : documentValue ? `IELTS: ${documentValue} · MyDU: ${myduValue}` : matched ? "Совпадает" : "Не удалось прочитать значение в IELTS"
    };
  }

  function ieltsComparisons(documentText, allFields) {
    const names = ieltsNameValues(allFields);
    const certificateFields = languageCertificateFields(allFields);
    const number = findValueByLabel(certificateFields, /номер сертификата/i);
    const date = findValueByLabel(certificateFields, /дата (получения|выдачи).*сертификата|дата сертификата/i);
    const score = findValueByLabel(certificateFields, /(^|\s)балл(\s|$)|балл.*сертификат/i);
    const family = extractIeltsName(documentText, "family");
    const first = extractIeltsName(documentText, "first");
    const overall = extractIeltsOverall(documentText);
    const scoreNumber = Number.parseFloat(String(score).replace(",", "."));
    return [
      ieltsComparison("Фамилия", family, names.family, documentContainsValue(documentText, names.family)),
      ieltsComparison("Имя", first, names.first, documentContainsValue(documentText, names.first)),
      ieltsComparison("Test Report Form Number", documentContainsValue(documentText, number) ? number : "", number, documentContainsValue(documentText, number)),
      ieltsComparison("Date", documentContainsDate(documentText, date) ? date : "", date, documentContainsDate(documentText, date)),
      ieltsComparison("Overall Band Score", overall === null ? "" : overall.toFixed(1), score, overall !== null && Number.isFinite(scoreNumber) && overall === scoreNumber)
    ];
  }

  function languageCertificateFields(allFields) {
    const start = allFields.findIndex(field => /имеется международн.*сертификат|название международн.*сертификат|владени.*иностранн.*язык/i.test(field.label));
    if (start >= 0) {
      const relativeEnd = allFields.slice(start + 1).findIndex(field => /общий результат экзамена|балл за модуль|сведения о сдаче ает/i.test(field.label));
      const end = relativeEnd >= 0 ? start + 1 + relativeEnd : allFields.length;
      const sectionFields = allFields.slice(start, end);
      if (sectionFields.some(field => /номер сертификата/i.test(field.label))) return sectionFields;
    }
    return allFields.filter(field => /сертификат|балл|дата получения|дата выдачи/i.test(field.label) && !/(?:^|\s)ент(?:\s|$)|ұбт|икт/iu.test(field.label));
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

  function numericValue(value) {
    const parsed = Number.parseInt(String(value || "").replace(/[^\d-]/g, ""), 10);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function extractUntScore(documentText, subjectPattern, rowNumber = null, maximum = 140) {
    const text = String(documentText || "");
    const pattern = new RegExp(`(?:${subjectPattern})`, "iu");
    const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    const lineIndex = lines.findIndex(line => pattern.test(line));
    if (lineIndex < 0) return null;
    const numbers = source => [...String(source).matchAll(/(?<!\d)(\d{1,3})(?!\d)/g)]
      .map(match => numericValue(match[1]))
      .filter(value => value !== null && value >= 0 && value <= maximum);
    const matchingLine = lines[lineIndex];
    const subject = matchingLine.match(pattern);
    const sameLine = numbers(matchingLine.slice((subject?.index || 0) + (subject?.[0]?.length || 0)));
    if (sameLine.length) return sameLine[0];
    for (const offset of [1, -1, 2, -2]) {
      const nearby = lines[lineIndex + offset];
      if (!nearby || pattern.test(nearby)) continue;
      const candidates = numbers(nearby);
      if (candidates.length && !/[A-Za-zА-Яа-яЁёӘәҒғҚқҢңӨөҰұҮүҺһІі]/u.test(nearby)) return candidates[candidates.length - 1];
    }
    const flat = text.replace(/\s+/g, " ");
    const flatSubject = flat.match(pattern);
    if (!flatSubject) return null;
    const flatCandidates = numbers(flat.slice(flatSubject.index + flatSubject[0].length, flatSubject.index + flatSubject[0].length + 180));
    return flatCandidates.find(value => rowNumber === null || value !== rowNumber) ?? flatCandidates[0] ?? null;
  }

  const UNT_SUBJECTS = [
    { label: "История Казахстана", field: /история казахстана/i, pdf: "История\\s+Казахстана", pdfFallback: "Қазақстан\\s+тарихы", row: 1, maximum: 20, minimum: 5 },
    { label: "Грамотность чтения", field: /грамотность чтения/i, pdf: "Грамотность\\s+чтения", pdfFallback: "Оқу\\s+сауаттылығы", row: 2, maximum: 20, minimum: 3 },
    { label: "Математическая грамотность", field: /математическая грамотность/i, pdf: "Математическая\\s+грамотность", pdfFallback: "Математикалық\\s+сауаттылық", row: 3, maximum: 20, minimum: 3 }
  ];

  const UNT_PROFILE_SUBJECTS = [
    { label: "Информатика", field: /(^|\s)информатика(\s|$)/i, pdf: "Информатика", row: 5, maximum: 50 },
    { label: "Физика", field: /(^|\s)физика(\s|$)/i, pdf: "Физика", row: 5, maximum: 50 },
    { label: "Химия", field: /(^|\s)химия(\s|$)/i, pdf: "Химия", row: 5, maximum: 50 },
    { label: "Биология", field: /(^|\s)биология(\s|$)/i, pdf: "Биология", row: 4, maximum: 50 },
    { label: "География", field: /(^|\s)география(\s|$)/i, pdf: "География", row: 4, maximum: 50 },
    { label: "Всемирная история", field: /всемирная история/i, pdf: "Всемирная\\s+история", row: 5, maximum: 50 },
    { label: "Основы права", field: /основы права/i, pdf: "Основы\\s+права", row: 5, maximum: 50 },
    { label: "Иностранный язык", field: /иностранный язык/i, pdf: "Иностранный\\s+язык|Английский\\s+язык", row: 5, maximum: 50 },
    { label: "Русский язык", field: /русский язык(?!.*литератур)/i, pdf: "Русский\\s+язык", row: 4, maximum: 50 },
    { label: "Русская литература", field: /русская литература/i, pdf: "Русская\\s+литература", row: 5, maximum: 50 },
    { label: "Казахский язык", field: /казахский язык(?!.*литератур)/i, pdf: "Казахский\\s+язык", row: 4, maximum: 50 },
    { label: "Казахская литература", field: /казахская литература/i, pdf: "Казахская\\s+литература", row: 5, maximum: 50 },
    { label: "Математика", field: /(^|\s)математика(\s|$)/i, pdf: "Математика(?!ческая|лық)", row: 4, maximum: 50 }
  ];

  function untData(documentText, allFields) {
    const mandatory = UNT_SUBJECTS.map(subject => ({
      ...subject,
      mydu: numericValue(findValueByLabel(allFields, subject.field)),
      pdfScore: extractUntScore(documentText, subject.pdf, subject.row, subject.maximum) ?? extractUntScore(documentText, subject.pdfFallback, subject.row, subject.maximum)
    }));
    const total = {
      label: "Общий балл ЕНТ",
      mydu: numericValue(findValueByLabel(allFields, /сумма баллов ент|общий балл ент/i)),
      pdfScore: extractUntScore(documentText, "Итого", null, 140) ?? extractUntScore(documentText, "Барлығы", null, 140)
    };
    const thresholdFailures = mandatory.filter(subject => subject.pdfScore !== null && subject.pdfScore < subject.minimum);
    return { subjects: mandatory, total, thresholdFailures, invalid: thresholdFailures.length > 0 };
  }

  function untComparisons(documentText, allFields) {
    const data = untData(documentText, allFields);
    const thresholdComparisons = data.subjects.map(item => ({
      label: item.label,
      status: item.pdfScore === null ? "unknown" : item.pdfScore >= item.minimum ? "match" : "mismatch",
      message: item.pdfScore === null ? "Не удалось прочитать балл в сертификате" : `Сертификат: ${item.pdfScore} · минимум: ${item.minimum}`
    }));
    const totalAvailable = data.total.mydu !== null && data.total.pdfScore !== null;
    return {
      comparisons: [
        ...thresholdComparisons,
        { ...comparison(data.total.label, data.total.mydu === data.total.pdfScore, totalAvailable), message: totalAvailable ? `Сертификат: ${data.total.pdfScore} · MyDU: ${data.total.mydu}` : "Нет данных для сверки" }
      ],
      data
    };
  }

  function untThresholdWarning(issue) {
    const details = issue.thresholdFailures.map(item => `${item.label} — ${item.pdfScore} (минимум ${item.minimum})`).join(", ");
    return { templateId: "unt-invalid-certificate", key: "unt-invalid-certificate", level: "danger", text: `Сертификат ЕНТ недействителен: ${details}` };
  }

  function elementContext(element) {
    let current = element;
    let context = (element.innerText || element.textContent || "").replace(/\s+/g, " ").trim();
    const sectionMarker = /удостоверяющ|удостоверен.*личност|приложени[ея]|аттестат|диплом|родств|свидетельств[оа] о рождении|(?<![A-Za-zА-Яа-яЁёӘәҒғҚқҢңӨөҰұҮүҺһІі])(?:ент|ұбт)(?![A-Za-zА-Яа-яЁёӘәҒғҚқҢңӨөҰұҮүҺһІі])|иностранн.*язык|ielts|международн.*сертификат/iu;
    for (let depth = 0; current && current !== document.body && depth < 7; depth += 1, current = current.parentElement) {
      const text = (current.innerText || current.textContent || "").replace(/\s+/g, " ").trim();
      if (text.length > context.length && text.length < 2200) context = text;
      if (sectionMarker.test(text)) return text;
    }
    return context;
  }

  function attachmentNearField(fieldPattern) {
    const candidates = [...document.querySelectorAll("input, textarea, select")]
      .filter(element => element.offsetParent !== null && fieldPattern.test(inputLabel(element)));
    for (const field of candidates) {
      let current = field;
      for (let depth = 0; current && current !== document.body && depth < 8; depth += 1, current = current.parentElement) {
        const text = (current.innerText || current.textContent || "").replace(/\s+/g, " ").trim();
        if (/\.(?:pdf|jpe?g|png|webp)\b/i.test(text)) return true;
        if (text.length > 3200) break;
      }
    }
    return false;
  }

  function languageCertificateRequired() {
    return [...document.querySelectorAll("input[type='checkbox']")].some(input => {
      const label = inputLabel(input);
      return input.checked && /международн.*сертификат|владени.*иностранн.*язык/i.test(label);
    });
  }

  function missingAttachmentWarnings() {
    const results = [];
    const hasUntAttachment = attachmentNearField(/сумма баллов ент|общий балл ент/i);
    const hasLanguageAttachment = attachmentNearField(/номер сертификата|название международн.*сертификат/i);
    const needsLanguageCertificate = languageCertificateRequired();
    const buttons = [...document.querySelectorAll("button:disabled")].filter(button => button.offsetParent !== null);
    for (const button of buttons) {
      const ownText = (button.innerText || button.textContent || "").replace(/\s+/g, " ").trim();
      if (!/скан-коп|загруз|прикреп/i.test(ownText)) continue;
      const context = `${ownText} ${inputLabel(button)} ${elementContext(button)}`;
      let warning = null;
      if (/удостоверяющ|удостоверен.*личност/i.test(context)) warning = { templateId: "no-id", label: "Документы", text: "Не загружен документ, удостоверяющий личность" };
      else if (/приложени[ея].*(аттестат|диплом)|(аттестат|диплом).*приложени[ея]/i.test(context)) warning = { templateId: "no-appendix", label: "Документ об образовании", text: "Не загружено приложение к аттестату/диплому" };
      else if (/аттестат|диплом/i.test(context)) warning = { templateId: "no-certificate", label: "Документ об образовании", text: "Не загружен аттестат/диплом" };
      else if (/родств|свидетельств[оа] о рождении/i.test(context)) warning = { templateId: "relationship", label: "Документы родителя", text: "Не загружен документ, подтверждающий родство" };
      else if (/иностранн.*язык|ielts|международн.*сертификат/i.test(context)) {
        if (needsLanguageCertificate && !hasLanguageAttachment) warning = { templateId: "no-language-cert", label: "Сертификат", text: "Не загружен сертификат владения иностранным языком" };
      } else if (/(?<![A-Za-zА-Яа-яЁёӘәҒғҚқҢңӨөҰұҮүҺһІі])(?:ент|ұбт)(?![A-Za-zА-Яа-яЁёӘәҒғҚқҢңӨөҰұҮүҺһІі])/iu.test(context) && !hasUntAttachment) warning = { templateId: "no-unt", label: "ЕНТ", text: "Не загружен сертификат ЕНТ" };
      if (warning) results.push({ ...warning, key: `missing:${warning.templateId}`, level: "danger" });
    }
    return [...new Map(results.map(item => [item.key, item])).values()];
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
    if (/ҰБТ\s+НӘТИЖЕСІ|РЕЗУЛЬТАТ(?:Ы|А)\s+(?:ЕНТ|ЕДИНОГО НАЦИОНАЛЬНОГО ТЕСТИРОВАНИЯ)|СЕРТИФИКАТ\s+(?:ЕНТ|ҰБТ)|ДАТА\s+СДАЧИ\s+ЕНТ|ҰБТ\s+ТАПСЫРҒАН|CERTIFICATE\s+OF\s+UNT|UNT\s+CERTIFICATE/i.test(documentText)) return { id: "unt", label: "Сертификат ЕНТ" };
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
    if (type.id === "ielts") {
      const certificateFields = languageCertificateFields(allFields);
      const ieltsNames = ieltsNameValues(allFields);
      return [
        row("Фамилия (транслитом)", ieltsNames.family),
        row("Имя (транслитом)", ieltsNames.first),
        row("Test Report Form Number", findValueByLabel(certificateFields, /номер сертификата/i), true),
        row("Date", findValueByLabel(certificateFields, /дата (получения|выдачи).*сертификата|дата сертификата/i)),
        row("Overall Band Score", findValueByLabel(certificateFields, /(^|\s)балл(\s|$)|балл.*сертификат/i))
      ];
    }
    if (type.id === "unt") {
      const data = untData("", allFields);
      return [...data.subjects, data.total].map(item => row(item.label, item.mydu));
    }
    return [row("Тип файла", "Определите документ визуально", true)];
  }

  function findDocumentViewer() {
    const visible = element => {
      const rect = element.getBoundingClientRect();
      return rect.width > 220 && rect.height > 220 && rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth;
    };
    const dialogs = [...document.querySelectorAll("[role='dialog'], [aria-modal='true']")]
      .filter(element => visible(element) && /\.(?:pdf|png|jpe?g|webp)\b/i.test(element.textContent || ""))
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
        if (/\.(?:pdf|png|jpe?g|webp)\b/i.test(text) || candidate.getAttribute?.("role") === "dialog" || candidate.getAttribute?.("aria-modal") === "true") return candidate;
      }
    }
    return null;
  }

  function visualText(container, selector) {
    const items = [...container.querySelectorAll(selector)].map(node => {
      const text = (node.textContent || "").replace(/\s+/g, " ").trim();
      const rect = node.getBoundingClientRect();
      return { text, top: rect.top, left: rect.left, height: rect.height };
    }).filter(item => item.text && item.height > 0);
    if (items.length < 3) return "";
    items.sort((a, b) => Math.abs(a.top - b.top) > 3 ? a.top - b.top : a.left - b.left);
    const lines = [];
    for (const item of items) {
      const line = lines[lines.length - 1];
      const tolerance = Math.max(3, Math.min(7, item.height * 0.45));
      if (!line || Math.abs(line.top - item.top) > tolerance) {
        lines.push({ top: item.top, items: [item] });
      } else {
        line.items.push(item);
        line.top = (line.top * (line.items.length - 1) + item.top) / line.items.length;
      }
    }
    return lines.map(line => line.items.sort((a, b) => a.left - b.left).map(item => item.text).join(" ")).join("\n");
  }

  function viewerText(viewer) {
    const layerSelectors = [".textLayer", "[class*='textLayer']", "[class*='text-layer']", "[class*='text_layer']", "[class*='TextLayer']", "[class*='textContent']"];
    const pieces = [];
    const collect = scope => {
      const layers = new Set(layerSelectors.flatMap(selector => [...scope.querySelectorAll(selector)]));
      layers.forEach(layer => {
        const text = visualText(layer, "span") || (layer.innerText || layer.textContent || "").trim();
        if (text.length > 2 && !pieces.includes(text)) pieces.push(text);
      });
      scope.querySelectorAll("svg").forEach(svg => {
        const text = visualText(svg, "text");
        if (text.length > 2 && !pieces.includes(text)) pieces.push(text);
      });
    };
    collect(viewer);
    viewer.querySelectorAll("iframe").forEach(frame => {
      try {
        const frameDocument = frame.contentDocument;
        if (!frameDocument) return;
        collect(frameDocument);
        const bodyText = (frameDocument.body?.innerText || "").trim();
        if (/УДОСТОВЕРЕНИЕ ЛИЧНОСТИ|ЖЕКЕ КУӘЛІК|СВИДЕТЕЛЬСТВО О РОЖДЕНИИ|ТУУ ТУРАЛЫ|АТТЕСТАТ|ДИПЛОМ|ЖАЛПЫ ОРТА БІЛІМ|IELTS|TEST REPORT FORM|ҰБТ НӘТИЖЕСІ|РЕЗУЛЬТАТЫ ЕНТ/i.test(bodyText) && !pieces.length) pieces.push(bodyText);
      } catch (_) {
        // Cross-origin/isolated PDF frames cannot expose their text to the extension.
      }
    });
    if (pieces.join(" ").length > 30) return pieces.join("\n");
    const fallback = (viewer.innerText || "").trim();
    return /УДОСТОВЕРЕНИЕ ЛИЧНОСТИ|ЖЕКЕ КУӘЛІК|СВИДЕТЕЛЬСТВО О РОЖДЕНИИ|ТУУ ТУРАЛЫ|IELTS|TEST REPORT FORM|ҰБТ НӘТИЖЕСІ|РЕЗУЛЬТАТЫ ЕНТ/i.test(fallback) ? fallback : "";
  }

  function mediaDimensions(node) {
    const rect = node.getBoundingClientRect();
    const width = Number(node.width || node.naturalWidth || rect.width || 0);
    const height = Number(node.height || node.naturalHeight || rect.height || 0);
    return { width, height, area: width * height, top: rect.top, left: rect.left };
  }

  function viewerPages(viewer) {
    const candidates = [];
    const seen = new Set();
    const collect = scope => {
      scope.querySelectorAll("canvas, img").forEach(node => {
        if (seen.has(node)) return;
        seen.add(node);
        const dimensions = mediaDimensions(node);
        if (dimensions.width < 220 || dimensions.height < 220 || dimensions.area < 80000) return;
        try {
          const style = node.ownerDocument.defaultView.getComputedStyle(node);
          if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) return;
        } catch (_) {
          // A rendered page is still usable when computed styles are unavailable.
        }
        candidates.push({ node, ...dimensions });
      });
      scope.querySelectorAll("iframe").forEach(frame => {
        try {
          if (frame.contentDocument) collect(frame.contentDocument);
        } catch (_) {
          // Cross-origin PDF frames cannot expose their rendered pages.
        }
      });
    };
    collect(viewer);
    if (!candidates.length) return [];
    const largestArea = Math.max(...candidates.map(item => item.area));
    return candidates
      .filter(item => item.area >= largestArea * 0.45)
      .sort((a, b) => Math.abs(a.top - b.top) > 4 ? a.top - b.top : a.left - b.left);
  }

  function ocrPageFingerprint(pages) {
    return pages.map(page => `${Math.round(page.width)}x${Math.round(page.height)}`).join(",");
  }

  function ocrCacheKey(filename, pages) {
    return `${applicantId() || "unknown"}|${filename}|${lastAttachmentHint}|pages:${pages.length}`;
  }

  function rememberOcr(key, value) {
    ocrCache.set(key, value);
    while (ocrCache.size > 8) ocrCache.delete(ocrCache.keys().next().value);
  }

  function ocrStatusText(stateName, pageIndex = 0, pageCount = 0) {
    if (stateName === "recognizing") return `Распознаю страницу ${Math.min(pageIndex + 1, pageCount)}/${pageCount}…`;
    if (stateName === "queued") return "OCR ожидает завершения предыдущего документа…";
    if (stateName === "loading") return "Жду полной загрузки страниц документа…";
    if (stateName === "initializing") return "Подготавливаю локальный OCR…";
    if (stateName === "done") return "Локальное распознавание завершено";
    if (stateName === "error") return "Не удалось распознать документ";
    return "Подготавливаю документ к распознаванию…";
  }

  function updateOcrUi(key, stateName, progress, pageIndex = 0, pageCount = 0) {
    const normalizedProgress = Math.max(0, Math.min(100, Math.round(progress || 0)));
    if (ocrJob?.key === key) {
      ocrJob.state = stateName;
      ocrJob.progress = normalizedProgress;
      ocrJob.pageIndex = pageIndex;
      ocrJob.pageCount = pageCount;
    }
    if (!documentReview || documentReview.cacheKey !== key) return;
    documentReview.ocrState = stateName;
    documentReview.ocrProgress = normalizedProgress;
    documentReview.ocrPageIndex = pageIndex;
    documentReview.ocrPageCount = pageCount;
    const label = shadow?.querySelector("#mdh-ocr-label");
    const percent = shadow?.querySelector("#mdh-ocr-percent");
    const bar = shadow?.querySelector("#mdh-ocr-bar");
    if (label) label.textContent = ocrStatusText(stateName, pageIndex, pageCount);
    if (percent) percent.textContent = `${normalizedProgress}%`;
    if (bar) bar.style.width = `${normalizedProgress}%`;
  }

  function ensureOcrWorker() {
    if (ocrWorkerPromise) return ocrWorkerPromise;
    ocrWorkerPromise = (async () => {
      if (!globalThis.Tesseract?.createWorker) throw new Error("OCR-библиотека не загружена");
      return globalThis.Tesseract.createWorker(OCR_LANGUAGES, 1, {
        workerPath: chrome.runtime.getURL("ocr/worker.min.js"),
        corePath: chrome.runtime.getURL("ocr/core"),
        langPath: chrome.runtime.getURL("ocr/lang"),
        // Content scripts run with the MyDU page origin. The blob wrapper lets
        // that origin start a worker which then imports our packaged worker.
        workerBlobURL: true,
        gzip: true,
        cacheMethod: "none",
        errorHandler: () => {},
        logger: message => {
          const job = ocrJob;
          if (!job) return;
          if (message.status === "recognizing text") {
            const pageProgress = Number.isFinite(message.progress) ? message.progress : 0;
            const overall = ((job.pageIndex + pageProgress) / Math.max(job.pageCount, 1)) * 100;
            updateOcrUi(job.key, "recognizing", overall, job.pageIndex, job.pageCount);
          } else if (job.state !== "recognizing") {
            updateOcrUi(job.key, "initializing", job.progress || 0, job.pageIndex, job.pageCount);
          }
        }
      });
    })().catch(error => {
      ocrWorkerPromise = null;
      throw error;
    });
    return ocrWorkerPromise;
  }

  function canvasBlob(canvas) {
    return new Promise((resolve, reject) => {
      try {
        canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("Не удалось получить изображение страницы PDF")), "image/png");
      } catch (error) {
        reject(error);
      }
    });
  }

  async function preparedOcrImage(page) {
    const sourceWidth = Math.max(1, Math.round(page.width));
    const sourceHeight = Math.max(1, Math.round(page.height));
    const targetWidth = Math.min(OCR_MAX_WIDTH, Math.max(OCR_MIN_WIDTH, sourceWidth));
    const scale = targetWidth / sourceWidth;
    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = Math.max(1, Math.round(sourceHeight * scale));
    const context = canvas.getContext("2d", { alpha: false, willReadFrequently: false });
    if (!context) throw new Error("Браузер не создал изображение для OCR");
    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(page.node, 0, 0, canvas.width, canvas.height);
    return canvasBlob(canvas);
  }

  function safeOcrError(error) {
    const message = String(error?.message || error || "Неизвестная ошибка").replace(/chrome-extension:\/\/[^\s]+/g, "локальный файл OCR");
    if (/security|taint|cross-origin/i.test(message)) return "Браузер запретил получить изображение страницы PDF.";
    if (/fetch|network|load/i.test(message)) return "Не удалось загрузить локальные файлы OCR. Перезагрузите расширение.";
    return message.slice(0, 180);
  }

  async function runDocumentOcr(key, pages, token) {
    if (ocrJob) return;
    ocrJob = { key, token, state: "initializing", progress: 0, pageIndex: 0, pageCount: pages.length };
    updateOcrUi(key, "initializing", 0, 0, pages.length);
    try {
      const worker = await ensureOcrWorker();
      const texts = [];
      const confidences = [];
      for (let index = 0; index < pages.length; index += 1) {
        if (token !== ocrGeneration) return;
        updateOcrUi(key, "recognizing", (index / pages.length) * 100, index, pages.length);
        const image = await preparedOcrImage(pages[index]);
        if (token !== ocrGeneration) return;
        const result = await worker.recognize(image);
        texts.push(String(result?.data?.text || "").trim());
        if (Number.isFinite(result?.data?.confidence)) confidences.push(result.data.confidence);
      }
      if (token !== ocrGeneration) return;
      const text = texts.filter(Boolean).join("\n\n--- Страница ---\n\n");
      const confidence = confidences.length ? confidences.reduce((sum, value) => sum + value, 0) / confidences.length : null;
      rememberOcr(key, { text, confidence, pageCount: pages.length, completedAt: Date.now() });
      updateOcrUi(key, "done", 100, Math.max(0, pages.length - 1), pages.length);
    } catch (error) {
      if (token === ocrGeneration) rememberOcr(key, { text: "", error: safeOcrError(error), pageCount: pages.length, completedAt: Date.now() });
    } finally {
      if (ocrJob?.key === key) ocrJob = null;
      if (token === ocrGeneration) {
        lastDocumentSignature = "";
        scanDocumentViewer();
      }
    }
  }

  function softenLowConfidenceMismatches(comparisons, confidence) {
    if (!Number.isFinite(confidence) || confidence >= 55) return comparisons;
    return comparisons.map(item => item.status === "mismatch" ? { ...item, status: "manual", message: "OCR распознал документ неуверенно — проверьте вручную" } : item);
  }

  function comparisonsForDocument(type, text, allFields) {
    if (type.id === "identity") return identityComparisons(text, allFields);
    if (type.id === "birth") return birthCertificateComparisons(text, allFields);
    if (type.id === "ielts") return ieltsComparisons(text, allFields);
    if (type.id === "education") return educationComparisons(text, allFields);
    if (type.id === "unt") return untComparisons(text, allFields).comparisons;
    return [];
  }

  function scanDocumentViewer() {
    if (!shadow || !root) return;
    const viewer = findDocumentViewer();
    if (!viewer) {
      if (documentReview) {
        ocrGeneration += 1;
        ocrPageStability.clear();
        documentReview = null; lastDocumentSignature = ""; lastAttachmentHint = ""; referenceCollapsed = false; render();
      }
      return;
    }
    const layerText = viewerText(viewer);
    const filename = ((viewer.innerText || "").match(/[^\n]*\.(?:pdf|png|jpe?g|webp)\b/i) || ["Открытый документ"])[0].trim();
    const pages = viewerPages(viewer);
    const cacheKey = ocrCacheKey(filename, pages);
    const cached = ocrCache.get(cacheKey);
    const text = layerText || cached?.text || "";
    const source = layerText ? "text" : cached?.text ? "ocr" : "";
    const type = documentType(`${text} ${lastAttachmentHint} ${filename}`);
    const allFields = documentFields();
    const unt = text && type.id === "unt" ? untComparisons(text, allFields) : null;
    const rawComparisons = unt ? unt.comparisons : text ? comparisonsForDocument(type, text, allFields) : [];
    const comparisons = source === "ocr" ? softenLowConfidenceMismatches(rawComparisons, cached?.confidence) : rawComparisons;
    const grades = text && type.id === "appendix" ? extractNumericGrades(text) : null;
    const reference = referenceValues(type, allFields);
    let ocrState = "";
    let ocrProgress = 0;
    if (!layerText) {
      if (cached?.error) ocrState = "error";
      else if (cached) { ocrState = "done"; ocrProgress = 100; }
      else if (ocrJob?.key === cacheKey) { ocrState = ocrJob.state; ocrProgress = ocrJob.progress; }
      else if (ocrJob) ocrState = "queued";
      else if (!pages.length) ocrState = "loading";
      else {
        const fingerprint = ocrPageFingerprint(pages);
        const stable = ocrPageStability.get(cacheKey);
        if (!stable || stable.fingerprint !== fingerprint) {
          ocrPageStability.set(cacheKey, { fingerprint, since: Date.now() });
          ocrState = "loading";
        } else {
          ocrState = Date.now() - stable.since >= 350 ? "initializing" : "loading";
        }
      }
    }
    const signature = `${filename}|${lastAttachmentHint}|${type.id}|${source}|${text.length}|${ocrState}|${comparisons.map(item => item.status).join(",")}|${grades?.total || 0}|${reference.map(item => `${item.label}:${item.value}`).join("|")}`;
    if (signature === lastDocumentSignature) return;
    lastDocumentSignature = signature;
    documentReview = {
      filename,
      typeId: type.id,
      type: type.label,
      textAvailable: text.length > 30,
      source,
      comparisons,
      untThreshold: unt?.data || null,
      grades,
      reference,
      cacheKey,
      recognizedText: text,
      ocrState,
      ocrProgress,
      ocrPageIndex: ocrJob?.key === cacheKey ? ocrJob.pageIndex : 0,
      ocrPageCount: pages.length || cached?.pageCount || 0,
      ocrConfidence: cached?.confidence ?? null,
      ocrError: cached?.error || ""
    };
    if (unt && (source !== "ocr" || !Number.isFinite(cached?.confidence) || cached.confidence >= 55)) {
      const before = state.warnings.length;
      if (unt.data.invalid && !state.warnings.some(item => warningKey(item) === "unt-invalid-certificate")) state.warnings.push(untThresholdWarning(unt.data));
      if (!unt.data.invalid) state.warnings = state.warnings.filter(item => warningKey(item) !== "unt-invalid-certificate");
      if (state.warnings.length !== before) scheduleSave();
    }
    render();
    if (!layerText && !cached && pages.length && ocrState === "initializing" && !ocrJob) {
      const token = ocrGeneration;
      void runDocumentOcr(cacheKey, pages, token);
    }
  }

  function documentReviewHtml() {
    if (!documentReview) return "";
    const icons = { match: "✓", mismatch: "!", unknown: "?", manual: "○" };
    const rows = documentReview.comparisons.map(item => `<div class="mdh-doc-row ${item.status}"><span>${icons[item.status]}</span><b>${esc(item.label)}</b><small>${esc(item.message || (item.status === "match" ? "Совпадает" : item.status === "mismatch" ? "Не найдено совпадение" : item.status === "manual" ? "Проверить вручную" : "Нет поля в MyDU"))}</small></div>`).join("");
    const references = (documentReview.reference || []).map(item => `<div class="mdh-reference-value ${item.wide ? "wide" : ""} ${item.empty ? "empty" : ""}"><small>${esc(item.label)}</small><strong>${esc(item.value)}</strong></div>`).join("");
    let grades = "";
    if (documentReview.grades) {
      const current = myduAverage();
      const value = documentReview.grades.average;
      const comparisonText = current === null ? "Средний балл в MyDU сейчас не виден." : Math.abs(current - value) < 0.005 ? `Совпадает с MyDU (${current.toFixed(2)}).` : `В MyDU указано ${current.toFixed(2)} — проверьте расхождение.`;
      grades = `<div class="mdh-readable-grades"><b>Оценок в читаемом тексте: ${documentReview.grades.total}</b><span>5 — ${documentReview.grades.counts[5]}, 4 — ${documentReview.grades.counts[4]}, 3 — ${documentReview.grades.counts[3]}, 2 — ${documentReview.grades.counts[2]}</span><strong>Средний балл: ${value.toFixed(2)}</strong><small>${comparisonText} Проверьте количества по документу.</small></div>`;
    }
    let ocr = "";
    if (!documentReview.source || documentReview.source === "ocr") {
      if (["loading", "queued", "initializing", "recognizing"].includes(documentReview.ocrState)) {
        const progress = Math.max(0, Math.min(100, Math.round(documentReview.ocrProgress || 0)));
        ocr = `<div class="mdh-ocr-state"><div><b id="mdh-ocr-label">${esc(ocrStatusText(documentReview.ocrState, documentReview.ocrPageIndex, documentReview.ocrPageCount))}</b><span id="mdh-ocr-percent">${progress}%</span></div><div class="mdh-ocr-track"><i id="mdh-ocr-bar" style="width:${progress}%"></i></div><small>OCR работает локально в браузере. Обычно первая загрузка занимает дольше.</small></div>`;
      } else if (documentReview.ocrState === "error") {
        ocr = `<div class="mdh-ocr-error"><b>OCR не запустился</b><span>${esc(documentReview.ocrError)}</span><button type="button" id="mdh-ocr-retry">Повторить</button></div>`;
      } else if (documentReview.ocrState === "done") {
        const confidence = Number.isFinite(documentReview.ocrConfidence) ? ` · уверенность ${Math.round(documentReview.ocrConfidence)}%` : "";
        ocr = `<p class="mdh-ocr-done">Текст получен локальным OCR${confidence}. Возможны ошибки распознавания — окончательно сверьте документ глазами.</p>`;
      }
    }
    const sourceLabel = documentReview.source === "ocr" ? "OCR завершён — проверьте найденные совпадения" : "Текст PDF доступен для автосверки";
    const readable = documentReview.textAvailable
      ? (rows || grades ? `<div class="mdh-readable"><span>${sourceLabel}</span>${rows}${grades}</div>` : `<p class="mdh-reference-note">Документ прочитан, но для этого типа автоматические поля не настроены.</p>`)
      : documentReview.ocrState === "done" ? `<p class="mdh-reference-note">OCR завершён, но не смог получить достаточно текста. Сверьте документ вручную.</p>` : "";
    const textPreview = documentReview.recognizedText
      ? `<details class="mdh-ocr-text"><summary>Показать распознанный текст</summary><pre>${esc(documentReview.recognizedText.slice(0, 12000))}${documentReview.recognizedText.length > 12000 ? "\n…" : ""}</pre></details>`
      : "";
    return `<style>.mdh-reference-section{position:sticky;top:-12px;z-index:20;border-color:#9cc7ff;box-shadow:0 8px 24px #173d6626;background:#fff}.mdh-reference-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 11px;background:#eaf4ff}.mdh-reference-head div{min-width:0}.mdh-reference-head h3{padding:0;background:none;font-size:13px}.mdh-reference-head small{display:block;margin-top:2px;color:#476987;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:300px}.mdh-reference-toggle{border:0;border-radius:7px;background:#fff;color:#1557a0;padding:6px 8px;font-size:10px;font-weight:700;cursor:pointer}.mdh-reference-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}.mdh-reference-value{padding:8px;border:1px solid #d9e6f4;border-radius:8px;background:#f8fbff;min-width:0;user-select:text}.mdh-reference-value.wide{grid-column:1/-1}.mdh-reference-value small{display:block;color:#668099;font-size:9px;margin-bottom:3px}.mdh-reference-value strong{display:block;color:#102a43;font-size:12px;line-height:1.25;overflow-wrap:anywhere}.mdh-reference-value.empty strong{color:#a13b3b}.mdh-reference-note{margin:8px 0 0;padding:7px;border-radius:7px;background:#fff7df;color:#6c5309;font-size:10px;line-height:1.35}.mdh-readable{margin-top:8px;border-top:1px solid #dfe8f2;padding-top:8px}.mdh-readable>span{display:block;color:#167044;font-size:10px;font-weight:700;margin-bottom:5px}.mdh-doc-row{display:grid;grid-template-columns:20px 1fr auto;align-items:center;gap:5px;padding:6px;border-bottom:1px solid #e6ebf1}.mdh-doc-row>span{display:grid;place-items:center;width:18px;height:18px;border-radius:50%;font-weight:800}.mdh-doc-row b{font-size:11px}.mdh-doc-row small{font-size:9px}.mdh-doc-row.match>span{background:#dff5e7;color:#167044}.mdh-doc-row.match small{color:#167044}.mdh-doc-row.mismatch>span{background:#ffe4e4;color:#a22121}.mdh-doc-row.mismatch small{color:#a22121}.mdh-doc-row.unknown>span,.mdh-doc-row.manual>span{background:#edf3fa;color:#536b84}.mdh-readable-grades{display:grid;gap:4px;padding:8px;border-radius:8px;background:#f3f8ff;color:#173d66;font-size:10px}.mdh-readable-grades strong{font-size:16px}.mdh-readable-grades small{line-height:1.35;color:#536b84}.mdh-ocr-state,.mdh-ocr-error{margin-top:9px;padding:10px;border-radius:11px;background:#edf6ff;color:#174e83}.mdh-ocr-state>div:first-child{display:flex;justify-content:space-between;gap:8px;font-size:9px}.mdh-ocr-track{height:6px;margin:8px 0;border-radius:99px;background:#d7e8fa;overflow:hidden}.mdh-ocr-track i{display:block;height:100%;border-radius:99px;background:#1681ef;transition:width .2s}.mdh-ocr-state small{display:block;color:#65809d;font-size:8px;line-height:1.35}.mdh-ocr-error{display:grid;grid-template-columns:1fr auto;gap:4px 8px;background:#fff1f1;color:#9a292d}.mdh-ocr-error b,.mdh-ocr-error span{font-size:9px}.mdh-ocr-error span{grid-column:1/2}.mdh-ocr-error button{grid-column:2;grid-row:1/3;border:0;border-radius:9px;background:#fff;color:#9a292d;font-size:8px;font-weight:800;cursor:pointer}.mdh-ocr-done{margin:9px 0 0;padding:9px;border-radius:11px;background:#e8faf4;color:#127057;font-size:9px;line-height:1.4}.mdh-ocr-text{margin-top:9px;border:1px solid #dce7f2;border-radius:11px;background:#fbfdff}.mdh-ocr-text summary{padding:9px;color:#0868d4;font-size:9px;font-weight:800;cursor:pointer}.mdh-ocr-text pre{max-height:190px;margin:0;padding:9px;overflow:auto;border-top:1px solid #e5edf5;color:#40566f;font:9px/1.4 Consolas,monospace;white-space:pre-wrap;word-break:break-word;user-select:text}</style><section class="mdh-section mdh-reference-section"><div class="mdh-reference-head"><div><h3>Данные MyDU · ${esc(documentReview.type)}</h3><small title="${esc(documentReview.filename)}">${esc(documentReview.filename)}</small></div><button type="button" class="mdh-reference-toggle" id="mdh-reference-toggle">${referenceCollapsed ? "Развернуть" : "Свернуть"}</button></div>${referenceCollapsed ? "" : `<div class="mdh-inner"><div class="mdh-reference-grid">${references}</div>${ocr}${readable}${textPreview}</div>`}</section>`;
  }

  const PANEL_CSS = `
    :host{all:initial}
    *{box-sizing:border-box}
    button,input,textarea{font:inherit}
    .mdh-launch{position:fixed;right:20px;bottom:22px;z-index:2147483646;width:62px;height:62px;padding:0;border:4px solid #fff;border-radius:20px;background:#1681ef;box-shadow:0 15px 35px #064a9147;cursor:grab;touch-action:none;user-select:none;overflow:hidden}
    .mdh-launch img{position:absolute;width:78px;max-width:none;left:-8px;top:7px;pointer-events:none}
    .mdh-launch.dragging{cursor:grabbing}.mdh-launch.hidden{display:none}
    .mdh-panel{position:fixed;right:18px;bottom:18px;z-index:2147483647;width:min(468px,calc(100vw - 24px));height:min(900px,calc(100vh - 28px));background:#fff;color:#062653;border:1px solid #0626531f;border-radius:28px;box-shadow:0 28px 80px #0626533b,0 4px 16px #06265314;font:14px Inter,"Segoe UI",Arial,sans-serif;display:flex;flex-direction:column;overflow:hidden;pointer-events:auto}
    .mdh-panel.hidden{display:none}
    .mdh-drag-bar{position:absolute;top:9px;left:50%;z-index:3;width:40px;height:5px;margin-left:-20px;border-radius:99px;background:#cbd7e5;pointer-events:none}
    .mdh-header{height:96px;flex:none;padding:21px 18px 14px;display:flex;align-items:center;gap:12px;border-bottom:1px solid #edf1f5;cursor:grab;touch-action:none;user-select:none;background:#fff}
    .mdh-header.dragging{cursor:grabbing}
    .mdh-brand-symbol{display:grid;place-items:center;flex:none;width:56px;height:56px;background:transparent}
    .mdh-brand-symbol img{display:block;width:52px;height:52px;object-fit:contain;pointer-events:none}
    .mdh-head-copy{flex:1;min-width:0}
    .mdh-head-copy b{display:block;font-size:18px;line-height:1.1;letter-spacing:-.25px}
    .mdh-head-copy span{display:block;margin-top:5px;color:#7d8ba0;font-size:10px;font-weight:650;letter-spacing:.15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .mdh-local{display:flex;align-items:center;gap:6px;padding:8px 11px;border-radius:99px;background:#eafaf4;color:#3b846f;font-size:11px;font-weight:800}
    .mdh-local:before{content:"";width:7px;height:7px;border-radius:50%;background:#16bb91}
    .mdh-close{width:35px;height:35px;flex:none;border:0;border-radius:12px;background:#f1f5f9;color:#6e7e92;font-size:21px;line-height:1;cursor:pointer}
    .mdh-nav{margin:14px 18px 0;padding:5px;flex:none;display:grid;grid-template-columns:1fr 1fr 1.08fr;gap:4px;border-radius:17px;background:#f1f5f9}
    .mdh-nav button{height:48px;border:0;border-radius:13px;background:transparent;color:#748399;font-size:10px;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;white-space:nowrap}
    .mdh-nav button.active{background:#fff;color:#0868d4;box-shadow:0 3px 12px #194a7917}
    .mdh-nav-icon{font-size:15px;line-height:1}
    .mdh-count{display:grid;place-items:center;min-width:19px;height:19px;padding:0 5px;border-radius:99px;background:#ff9418;color:#fff;font-size:9px}
    .mdh-body{flex:1;min-height:0;padding:16px 18px 22px;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;touch-action:pan-y;scrollbar-gutter:stable;scrollbar-width:thin;scrollbar-color:#cbd7e5 transparent;background:#fff}
    .mdh-result-hero{position:relative;min-height:164px;padding:22px 145px 20px 22px;border-radius:24px;overflow:hidden;background:linear-gradient(132deg,#0876ec,#2695ff);color:#fff;box-shadow:0 13px 26px #0e76e92e}
    .mdh-result-hero:before,.mdh-result-hero:after{content:"";position:absolute;border:18px solid #ffffff1f;border-radius:50%}
    .mdh-result-hero:before{width:130px;height:130px;right:-38px;top:-65px}
    .mdh-result-hero:after{width:72px;height:72px;right:98px;bottom:-58px;border-width:13px}
    .mdh-result-hero.success{background:linear-gradient(132deg,#0b9f7b,#20c99e)}
    .mdh-eyebrow{font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:1.05px;opacity:.82}
    .mdh-result-hero h1{max-width:245px;margin:9px 0 16px;font-size:23px;line-height:1.08;letter-spacing:-.65px}
    .mdh-hero-action{height:35px;padding:0 13px;border:0;border-radius:11px;background:#fff;color:#0868d4;font-size:10px;font-weight:850;cursor:pointer;box-shadow:0 4px 10px #002d5e1a}
    .mdh-mascot-orbit{position:absolute;right:5px;bottom:-13px;z-index:2;width:158px;height:172px;overflow:visible;background:transparent;box-shadow:none;pointer-events:none}
    .mdh-mascot-orbit img{position:absolute;width:150px;max-width:none;height:auto;left:5px;top:8px;filter:drop-shadow(0 9px 12px #00356b33)}
    .mdh-spark{position:absolute;right:143px;top:20px;z-index:3;width:13px;height:13px;border-radius:3px;background:#ff9418;transform:rotate(45deg)}
    .mdh-section-title{display:flex;align-items:flex-end;justify-content:space-between;margin:24px 2px 11px}
    .mdh-section-title h2{margin:0;font-size:18px;letter-spacing:-.35px}
    .mdh-section-title span{color:#8593a5;font-size:10px;font-weight:650}
    .mdh-warning{position:relative;margin-bottom:11px;padding:16px 16px 14px 18px;border:1px solid transparent;border-radius:19px;overflow:hidden}
    .mdh-warning:before{content:"";position:absolute;left:0;top:14px;bottom:14px;width:4px;border-radius:0 9px 9px 0}
    .mdh-warning.danger{background:#fff1f1;border-color:#ffdcdc}.mdh-warning.danger:before{background:#ff5b61}
    .mdh-warning.warning,.mdh-warning.note{background:#fff8e7;border-color:#ffe8ad}.mdh-warning.warning:before,.mdh-warning.note:before{background:#ffb21c}
    .mdh-warning-head{display:flex;align-items:center;gap:7px;margin-bottom:6px}
    .mdh-warning-icon{display:grid;place-items:center;width:22px;height:22px;border-radius:8px;background:#ffb21c;color:#765300;font-size:12px;font-weight:900}
    .danger .mdh-warning-icon{background:#ff5b61;color:#fff}
    .mdh-warning-label{color:#7e8795;font-size:9px;font-weight:900;letter-spacing:.75px;text-transform:uppercase}
    .mdh-warning-text{display:block;margin-bottom:13px;padding-right:14px;color:#062653;font-size:15px;font-weight:750;line-height:1.25}
    .mdh-warning-actions{display:flex;gap:8px}
    .mdh-warning-actions button{height:34px;padding:0 13px;border-radius:11px;font-size:10px;font-weight:850;cursor:pointer}
    .mdh-warning-actions button:first-child{border:0;background:#062653;color:#fff}
    .mdh-warning-actions button:last-child{border:1px solid #06265324;background:#ffffffa6;color:#68788d}
    .mdh-view-head{margin:3px 2px 18px}
    .mdh-view-head span{display:block;color:#1681ef;font-size:9px;font-weight:900;letter-spacing:1px;text-transform:uppercase}
    .mdh-view-head h1{margin:7px 0 6px;font-size:24px;line-height:1.08;letter-spacing:-.65px}
    .mdh-view-head p{margin:0;color:#73849a;font-size:11px;line-height:1.45}
    .mdh-tabs{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin-bottom:12px;padding:5px;border-radius:17px;background:#f1f5f9}
    .mdh-tab{min-height:54px;padding:8px 7px;border:0;border-radius:13px;background:transparent;color:#65768c;font-size:11px;font-weight:800;line-height:1.18;cursor:pointer}
    .mdh-tab.active{background:#fff;color:#0868d4;box-shadow:0 3px 12px #194a7917}
    .mdh-search{width:100%;height:44px;margin-bottom:12px;padding:0 14px;border:1px solid #dce7f2;border-radius:14px;background:#fff;color:#062653;font-size:11px;outline:none}
    .mdh-search:focus{border-color:#1681ef;box-shadow:0 0 0 3px #1681ef17}
    .mdh-template{position:relative;width:100%;margin-bottom:9px;padding:14px 54px 14px 15px;text-align:left;border:1px solid #dce7f2;border-radius:17px;background:#fff;color:#062653;cursor:pointer;transition:border-color .15s,transform .15s,box-shadow .15s}
    .mdh-template:after{content:"+";position:absolute;right:14px;top:14px;display:grid;place-items:center;width:27px;height:27px;margin:0;border-radius:9px;background:#eaf5ff;color:#1681ef;font-size:17px;font-weight:800}
    .mdh-template:hover{border-color:#8bc5ff;box-shadow:0 8px 20px #123c6612;transform:translateY(-1px)}
    .mdh-template.selected{padding-left:52px;border-color:#1681ef;background:#f3f9ff;box-shadow:0 0 0 2px #1681ef12}
    .mdh-template.selected:after{content:"✓";left:15px;right:auto;top:14px;width:25px;height:25px;margin:0;border-radius:9px;background:#1681ef;color:#fff;font-size:13px}
    .mdh-template span{display:block;margin-bottom:4px;color:#1681ef;font-size:8px;font-weight:850;letter-spacing:.5px;text-transform:uppercase}
    .mdh-template strong{display:block;margin-bottom:5px;font-size:13px;line-height:1.25}
    .mdh-template small{display:-webkit-box;overflow:hidden;color:#6f7f93;font-size:10px;line-height:1.4;-webkit-line-clamp:2;-webkit-box-orient:vertical}
    .mdh-template em{display:none;margin-top:8px;color:#1681ef;font-size:9px;font-style:normal;font-weight:850}
    .mdh-template.selected em{display:block}
    .mdh-section{margin:0 0 13px;border:1px solid #dce7f2;border-radius:19px;overflow:hidden;background:#fff}
    .mdh-section>h3{margin:0;padding:13px 15px;background:#f5f9fd;font-size:13px}
    .mdh-inner{padding:14px}
    .mdh-grade-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-bottom:11px}
    .mdh-grade-grid label span{display:block;margin-bottom:5px;color:#73849a;font-size:8px;font-weight:750}
    .mdh-grade-grid input{width:100%;height:39px;padding:0 9px;border:1px solid #d4e0ec;border-radius:11px;color:#062653;font-size:12px;outline:none}
    .mdh-grade-grid input:focus{border-color:#1681ef}
    .mdh-grade-result{display:flex;align-items:center;gap:9px;padding:11px;border-radius:14px;background:#eaf5ff;color:#174e83}
    .mdh-grade-values{display:grid;grid-template-columns:repeat(2,minmax(74px,1fr));gap:7px}.mdh-grade-values>div{padding:8px 9px;border-radius:10px;background:#ffffffa8}.mdh-grade-values small{display:block;margin-bottom:3px;font-size:7px;font-weight:800;text-transform:uppercase;letter-spacing:.4px;opacity:.72}.mdh-grade-values strong{display:block;font-size:18px}.mdh-grade-result span{flex:1;font-size:9px;line-height:1.35}
    .mdh-grade-result.match{background:#e8faf4;color:#127057}.mdh-grade-result.mismatch{background:#fff1f1;color:#9a292d}
    .mdh-grade-result button{border:0;border-radius:9px;padding:7px;background:#fff;color:#9a292d;font-size:8px;font-weight:800;cursor:pointer}
    .mdh-picked{position:relative;margin-bottom:10px;padding:14px 44px 14px 14px;border:1px solid #dce7f2;border-radius:17px;background:#fff}
    .mdh-picked>div{min-width:0}.mdh-picked b{display:block;margin-bottom:7px;color:#062653;font-size:11px}
    .mdh-picked textarea,.mdh-custom,.mdh-result{width:100%;min-height:66px;padding:10px 11px;border:1px solid #d8e3ee;border-radius:12px;background:#fbfdff;color:#243b5a;font-size:10px;line-height:1.45;resize:vertical;outline:none}
    .mdh-picked textarea:focus,.mdh-custom:focus{border-color:#1681ef;box-shadow:0 0 0 3px #1681ef12}
    .mdh-picked>button{position:absolute;right:12px;top:12px;width:25px;height:25px;border:0;border-radius:9px;background:#fff1f1;color:#d3484e;font-size:16px;cursor:pointer}
    .mdh-composer{margin:16px 0;padding:14px;border-radius:18px;background:#eaf5ff}
    .mdh-composer-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
    .mdh-composer-head b{font-size:12px}.mdh-composer-head span{color:#64809f;font-size:8px}
    .mdh-custom{min-height:70px;background:#fff}
    .mdh-preview-label{display:block;margin:18px 2px 8px;font-size:12px}
    .mdh-result{min-height:135px;background:#f8fafc;color:#52667f}
    .mdh-empty-state{padding:26px 18px;text-align:center;border:1px dashed #cddcea;border-radius:20px;background:#f9fbfd}
    .mdh-empty-state img{width:112px;height:auto;object-fit:contain;filter:drop-shadow(0 8px 10px #06265324)}
    .mdh-empty-state b{display:block;margin-top:8px;font-size:15px}.mdh-empty-state p{margin:6px 0 0;color:#73849a;font-size:10px;line-height:1.4}
    .mdh-empty{margin:0;color:#73849a;font-size:11px;line-height:1.4}
    .mdh-reference-section{position:relative!important;top:auto!important;z-index:1!important;margin:14px 0 0!important;border:1px solid #b9dcff!important;border-radius:19px!important;box-shadow:none!important;background:#fff!important}
    .mdh-reference-head{padding:14px 15px!important;border-radius:18px 18px 0 0!important;background:#eaf5ff!important}
    .mdh-reference-head h3{color:#062653!important;font-size:12px!important}.mdh-reference-head small{color:#67809c!important;font-size:9px!important;max-width:270px!important}
    .mdh-reference-toggle{height:30px!important;padding:0 10px!important;border-radius:10px!important;background:#fff!important;color:#0868d4!important;font-size:8px!important}
    .mdh-reference-grid{gap:8px!important}.mdh-reference-value{padding:10px!important;border-color:#dce7f2!important;border-radius:12px!important;background:#f8fbff!important}
    .mdh-reference-value small{color:#73849a!important;font-size:8px!important}.mdh-reference-value strong{color:#062653!important;font-size:10px!important}
    .mdh-reference-note{padding:10px!important;border-radius:11px!important;background:#fff8e7!important;color:#765300!important;font-size:9px!important}
    .mdh-readable{margin-top:10px!important;padding-top:10px!important}.mdh-readable>span{color:#16a27e!important;font-size:9px!important}
    .mdh-doc-row{padding:8px 4px!important;grid-template-columns:24px 1fr auto!important}.mdh-doc-row>span{width:21px!important;height:21px!important}.mdh-doc-row b{font-size:10px!important}.mdh-doc-row small{font-size:8px!important}
    .mdh-readable-grades{padding:11px!important;border-radius:12px!important;background:#eaf5ff!important;color:#174e83!important}.mdh-readable-grades strong{font-size:18px!important}
    .mdh-foot{flex:none;display:flex;align-items:center;gap:11px;padding:13px 18px 16px;border-top:1px solid #e6edf4;background:#ffffffed;backdrop-filter:blur(12px)}
    .mdh-foot-check{display:grid;place-items:center;flex:none;width:39px;height:39px;border-radius:13px;background:#e8faf4;color:#16bb91;font-size:18px;font-weight:900}
    .mdh-foot-copy{flex:1;min-width:0}.mdh-foot-copy b{display:block;font-size:12px}.mdh-foot-copy span{display:block;margin-top:3px;color:#8190a3;font-size:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .mdh-foot-primary,.mdh-foot-secondary{height:41px;padding:0 14px;border-radius:14px;font-size:10px;font-weight:850;cursor:pointer}
    .mdh-foot-primary{border:0;background:#1681ef;color:#fff;box-shadow:0 8px 17px #1681ef33}.mdh-foot-secondary{border:1px solid #dce7f2;background:#fff;color:#67798f}
    .mdh-foot-primary:disabled{opacity:.45;cursor:default;box-shadow:none}
    .mdh-toast{position:absolute;left:18px;right:18px;bottom:82px;z-index:50;padding:11px 13px;border-radius:13px;background:#062653;color:#fff;font-size:10px;opacity:0;pointer-events:none;transform:translateY(8px);transition:.2s;box-shadow:0 12px 30px #06265333}
    .mdh-toast.show{opacity:1;transform:translateY(0)}
    @media(max-width:560px){.mdh-panel{right:8px;bottom:8px;width:calc(100vw - 16px);height:calc(100vh - 16px);border-radius:23px}.mdh-local{display:none}.mdh-result-hero{padding-right:125px}.mdh-mascot-orbit{right:0;width:130px;height:150px}.mdh-mascot-orbit img{width:128px}.mdh-nav{margin-left:12px;margin-right:12px}.mdh-body{padding-left:12px;padding-right:12px}.mdh-foot{padding-left:12px;padding-right:12px}}
  `;

  function currentSection() {
    return SECTIONS.find(section => section.id === state.activeSection) || SECTIONS[0];
  }

  function myduSectionId(value) {
    const label = String(value || "").replace(/\s+/g, " ").trim().toLocaleLowerCase("ru-RU");
    if (label === "персональные данные") return "personal";
    if (label === "сведения о предыдущем образовании") return "education";
    if (label === "сведения о поступлении") return "admission";
    if (label === "социальные сведения") return "social";
    return null;
  }

  function setTemplateSection(sectionId) {
    if (!state || !SECTIONS.some(section => section.id === sectionId) || state.activeSection === sectionId) return false;
    state.activeSection = sectionId;
    state.query = "";
    if (state.activeView === "templates") render();
    scheduleSave();
    return true;
  }

  function activeMyduSection() {
    const selectors = "[role='tab'], .ant-tabs-tab, .nav-tabs a, .nav-tabs button, .nav-link, [class*='tab-label'], [class*='tabLabel']";
    const tabs = [...document.querySelectorAll(selectors)].map(node => ({ node, sectionId: myduSectionId(node.innerText || node.textContent) })).filter(item => item.sectionId);
    const active = tabs.find(({ node }) => {
      const className = typeof node.className === "string" ? node.className : "";
      const parentClass = typeof node.parentElement?.className === "string" ? node.parentElement.className : "";
      return node.getAttribute("aria-selected") === "true" || node.getAttribute("aria-current") === "page" || /(?:^|\s)active(?:\s|$)|tab-active|tabs-tab-active/i.test(`${className} ${parentClass}`);
    });
    return active?.sectionId || null;
  }

  function resetChecksForSection(sectionId) {
    if (!state || !lastMyduSection || sectionId === lastMyduSection) return;
    state.warnings = [];
    state.checksRun = false;
    if (state.activeView === "checks") render();
    scheduleSave();
  }

  function syncMyduSection() {
    if (!state) return;
    const sectionId = activeMyduSection();
    if (!sectionId || sectionId === lastMyduSection) return;
    resetChecksForSection(sectionId);
    lastMyduSection = sectionId;
    setTemplateSection(sectionId);
    setTimeout(() => cacheCurrentSectionFields(sectionId), 120);
    setTimeout(() => cacheCurrentSectionFields(sectionId), 500);
  }

  function captureMyduSection(event) {
    if (!state || !(event.target instanceof Element)) return;
    const tab = event.target.closest("[role='tab'], button, a, .ant-tabs-tab, .nav-link, [class*='tab-label'], [class*='tabLabel']");
    const sectionId = myduSectionId(tab?.innerText || tab?.textContent);
    if (!sectionId) return;
    cacheCurrentSectionFields();
    resetChecksForSection(sectionId);
    lastMyduSection = sectionId;
    setTemplateSection(sectionId);
    setTimeout(() => cacheCurrentSectionFields(sectionId), 120);
    setTimeout(() => cacheCurrentSectionFields(sectionId), 500);
  }

  function templateHtml(template) {
    const query = state.query.trim().toLowerCase();
    if (!currentSection().groups.includes(template.group)) return "";
    if (query && !`${template.group} ${template.title} ${template.text}`.toLowerCase().includes(query)) return "";
    const isSelected = state.selected.some(item => item.templateId === template.id);
    return `<button type="button" class="mdh-template ${isSelected ? "selected" : ""}" data-template="${esc(template.id)}" aria-pressed="${isSelected}"><span>${esc(template.group)}</span><strong>${esc(template.title)}</strong><small>${esc(template.text)}</small><em>${isSelected ? "Выбрано · нажмите, чтобы убрать" : ""}</em></button>`;
  }

  function countWord(value, one, few, many) {
    const mod100 = value % 100;
    const mod10 = value % 10;
    if (mod100 >= 11 && mod100 <= 19) return many;
    if (mod10 === 1) return one;
    if (mod10 >= 2 && mod10 <= 4) return few;
    return many;
  }

  function render() {
    if (!shadow) return;
    const oldBody = shadow.querySelector(".mdh-body");
    const activeView = state.activeView || "checks";
    const viewChanged = renderedView !== activeView;
    const scrollTop = !viewChanged && oldBody ? oldBody.scrollTop : 0;
    const oldSearch = shadow.querySelector("#mdh-search");
    const restoreSearch = shadow.activeElement === oldSearch;
    const selectionStart = oldSearch?.selectionStart ?? 0;
    const selectionEnd = oldSearch?.selectionEnd ?? 0;
    renderedView = activeView;
    const warningLabels = { "address-incomplete": "Адрес проживания", "series-number": "Документ об образовании", "kato-not-city": "Населённый пункт", "fio-case": "ФИО абитуриента", "parent-fio-case": "ФИО родителя", "wrong-admission-type": "Тип поступления", "wrong-average": "Средний балл", "parent-work": "Данные родителя", "parent-unemployed": "Данные родителя", "unt-invalid-certificate": "Сертификат ЕНТ", "no-id": "Документы", "no-certificate": "Документ об образовании", "no-appendix": "Документ об образовании", "relationship": "Документы родителя", "no-unt": "ЕНТ", "no-language-cert": "Сертификат" };
    const warnings = state.warnings.map((item, index) => `<article class="mdh-warning ${item.level}"><div class="mdh-warning-head"><span class="mdh-warning-icon">${item.level === "danger" ? "!" : "?"}</span><span class="mdh-warning-label">${esc(item.label || warningLabels[item.templateId] || "Формальная проверка")}</span></div><span class="mdh-warning-text">${esc(item.text)}</span><div class="mdh-warning-actions"><button type="button" data-warning-add="${index}">Добавить</button><button type="button" data-warning-ignore="${index}">Игнорировать</button></div></article>`).join("");
    const selected = state.selected.length
      ? state.selected.map((item, index) => `<div class="mdh-picked"><div><b>${index + 1}. ${esc(item.title)}</b><textarea data-picked="${esc(item.id)}">${esc(item.text)}</textarea></div><button type="button" title="Удалить" data-remove="${esc(item.id)}">×</button></div>`).join("")
      : `<div class="mdh-empty-state"><img src="${ASSETS.smile}" alt=""><b>Комментарий пока пуст</b><p>Выберите готовый шаблон или добавьте собственный пункт.</p></div>`;
    const templates = TEMPLATES.map(templateHtml).join("") || `<p class="mdh-empty">В этом разделе шаблоны не найдены.</p>`;
    const tabs = SECTIONS.map(section => `<button type="button" class="mdh-tab ${section.id === currentSection().id ? "active" : ""}" data-section="${section.id}">${esc(section.label)}</button>`).join("");
    const warningCount = state.warnings.length;
    const selectedCount = state.selected.length;
    const hero = !state.checksRun
      ? `<section class="mdh-result-hero"><div class="mdh-eyebrow">Формальная проверка</div><h1>Проверим заявление?</h1><button type="button" class="mdh-hero-action" id="mdh-run">Проверить поля</button><span class="mdh-spark"></span><div class="mdh-mascot-orbit"><img src="${ASSETS.question}" alt=""></div></section>`
      : warningCount
        ? `<section class="mdh-result-hero"><div class="mdh-eyebrow">Проверка завершена</div><h1>Нужно проверить ${warningCount} ${countWord(warningCount, "пункт", "пункта", "пунктов")}</h1><button type="button" class="mdh-hero-action" id="mdh-run">Проверить снова</button><span class="mdh-spark"></span><div class="mdh-mascot-orbit"><img src="${ASSETS.question}" alt=""></div></section>`
        : `<section class="mdh-result-hero success"><div class="mdh-eyebrow">Проверка завершена</div><h1>Формальных ошибок не найдено</h1><button type="button" class="mdh-hero-action" id="mdh-run">Проверить снова</button><div class="mdh-mascot-orbit"><img src="${ASSETS.smile}" alt=""></div></section>`;
    const checkView = `${hero}${documentReview ? documentReviewHtml() : ""}${warningCount ? `<div class="mdh-section-title"><h2>Стоит перепроверить</h2><span>${warningCount} ${countWord(warningCount, "замечание", "замечания", "замечаний")}</span></div>${warnings}` : ""}`;
    const templateView = `<div class="mdh-view-head"><span>Библиотека</span><h1>Шаблоны замечаний</h1><p>Выберите раздел и добавьте подходящий комментарий одним нажатием.</p></div><div class="mdh-tabs">${tabs}</div><input class="mdh-search" id="mdh-search" value="${esc(state.query)}" placeholder="Поиск в разделе…">${currentSection().id === "education" ? gradeCalculatorHtml() : ""}<div>${templates}</div>`;
    const commentView = `<div class="mdh-view-head"><span>Финальный текст</span><h1>Готовый комментарий</h1><p>Пункты можно отредактировать перед копированием.</p></div><div>${selected}</div><div class="mdh-composer"><div class="mdh-composer-head"><b>Свой пункт</b><span>Enter — добавить · Shift+Enter — новая строка</span></div><textarea class="mdh-custom" id="mdh-custom" placeholder="Введите дополнительное замечание…">${esc(state.custom)}</textarea></div><b class="mdh-preview-label">Предпросмотр</b><textarea class="mdh-result" id="mdh-result" readonly placeholder="Здесь появится готовый текст">${esc(commentText())}</textarea>`;
    const viewContent = activeView === "templates" ? templateView : activeView === "comment" ? commentView : checkView;
    const footer = activeView === "comment"
      ? `<footer class="mdh-foot"><div class="mdh-foot-copy"><b>Черновик сохраняется локально</b><span>Автоматически удалится через 3 минуты</span></div><button type="button" class="mdh-foot-secondary" id="mdh-clear">Очистить</button><button type="button" class="mdh-foot-primary" id="mdh-copy">Скопировать</button></footer>`
      : `<footer class="mdh-foot"><div class="mdh-foot-check">✓</div><div class="mdh-foot-copy"><b>${selectedCount ? `${selectedCount} ${countWord(selectedCount, "замечание готово", "замечания готовы", "замечаний готовы")}` : "Комментарий пока пуст"}</b><span>${selectedCount ? "Можно отредактировать перед копированием" : "Добавьте шаблон или свой пункт"}</span></div><button type="button" class="mdh-foot-primary" id="mdh-open-comment">К комментарию →</button></footer>`;

    shadow.innerHTML = `<style>${PANEL_CSS}</style><button type="button" class="mdh-launch ${state.collapsed ? "" : "hidden"}" id="mdh-launch" style="${positionStyle("launch")}" title="Открыть или перетащить помощник"><img src="${ASSETS.peek}" alt="MyDU Helper"></button><aside class="mdh-panel ${state.collapsed ? "hidden" : ""}" style="${positionStyle("panel")}"><div class="mdh-drag-bar"></div><header class="mdh-header" title="Перетащите, чтобы переместить"><div class="mdh-brand-symbol"><img src="${ASSETS.brand}" alt="Astana IT University"></div><div class="mdh-head-copy"><b>MyDU Helper</b><span>Помощник приёмной комиссии</span></div><div class="mdh-local">локально</div><button type="button" class="mdh-close" id="mdh-close" title="Свернуть">×</button></header><nav class="mdh-nav"><button type="button" class="${activeView === "checks" ? "active" : ""}" data-view="checks"><span class="mdh-nav-icon">✓</span>Проверка${warningCount ? `<span class="mdh-count">${warningCount}</span>` : ""}</button><button type="button" class="${activeView === "templates" ? "active" : ""}" data-view="templates"><span class="mdh-nav-icon">▤</span>Шаблоны</button><button type="button" class="${activeView === "comment" ? "active" : ""}" data-view="comment"><span class="mdh-nav-icon">✎</span>Комментарий${selectedCount ? `<span class="mdh-count">${selectedCount}</span>` : ""}</button></nav><main class="mdh-body">${viewContent}</main>${footer}<div class="mdh-toast" id="mdh-toast"></div></aside>`;
    placeElement(shadow.querySelector(".mdh-panel"), "panel");
    placeElement(shadow.querySelector(".mdh-launch"), "launch");
    bindEvents();
    requestAnimationFrame(() => {
      if (!shadow) return;
      const body = shadow.querySelector(".mdh-body");
      if (body) body.scrollTop = scrollTop;
      if (restoreSearch) {
        const search = shadow.querySelector("#mdh-search");
        if (search) {
          search.focus();
          search.setSelectionRange(selectionStart, selectionEnd);
        }
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
    const ocrRetry = shadow.querySelector("#mdh-ocr-retry");
    if (ocrRetry) ocrRetry.onclick = () => {
      if (!documentReview?.cacheKey) return;
      ocrCache.delete(documentReview.cacheKey);
      ocrPageStability.delete(documentReview.cacheKey);
      ocrGeneration += 1;
      lastDocumentSignature = "";
      scanDocumentViewer();
    };
    launch.onclick = () => { state.collapsed = false; render(); scheduleSave(); };
    shadow.querySelector("#mdh-close").onclick = () => { state.collapsed = true; render(); scheduleSave(); };
    shadow.querySelectorAll("[data-view]").forEach(node => node.onclick = () => { state.activeView = node.dataset.view; render(); scheduleSave(); });
    const openComment = shadow.querySelector("#mdh-open-comment");
    if (openComment) openComment.onclick = () => { state.activeView = "comment"; render(); scheduleSave(); };
    const runButton = shadow.querySelector("#mdh-run");
    if (runButton) runButton.onclick = runChecks;
    const copyButton = shadow.querySelector("#mdh-copy");
    if (copyButton) copyButton.onclick = copyComment;
    const clearButton = shadow.querySelector("#mdh-clear");
    if (clearButton) clearButton.onclick = () => { state.selected = []; state.custom = ""; render(); scheduleSave(); };
    shadow.querySelectorAll("[data-section]").forEach(node => node.onclick = () => { state.activeSection = node.dataset.section; state.query = ""; render(); scheduleSave(); });
    shadow.querySelectorAll("[data-add]").forEach(node => node.onclick = () => addTemplate(node.dataset.add));
    shadow.querySelectorAll("[data-template]").forEach(node => node.onclick = () => toggleTemplate(node.dataset.template));
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
    shadow.querySelectorAll("[data-picked]").forEach(node => node.oninput = event => { const item = state.selected.find(value => value.id === event.currentTarget.dataset.picked); if (item) item.text = event.currentTarget.value; const result = shadow.querySelector("#mdh-result"); if (result) result.value = commentText(); scheduleSave(); });
    const custom = shadow.querySelector("#mdh-custom");
    if (custom) {
      custom.oninput = event => { state.custom = event.currentTarget.value; const result = shadow.querySelector("#mdh-result"); if (result) result.value = commentText(); scheduleSave(); };
      custom.onkeydown = event => {
        if (event.key !== "Enter" || event.shiftKey || !event.currentTarget.value.trim()) return;
        event.preventDefault();
        state.custom = event.currentTarget.value;
        addCustomPoint();
      };
    }
    const search = shadow.querySelector("#mdh-search");
    if (search) search.oninput = event => { state.query = event.currentTarget.value; render(); scheduleSave(); };
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
    pageFieldCache = { personal: [], education: [], admission: [], social: [] };
    lastMyduSection = activeMyduSection();
    if (lastMyduSection) state.activeSection = lastMyduSection;
    if (saved && saved.expiresAt <= Date.now()) chrome.storage.local.remove(draftKey);
    root = document.createElement("div"); root.id = "mydu-manager-helper-root"; root.style.all = "initial";
    shadow = root.attachShadow({ mode: "open" }); document.documentElement.appendChild(root);
    render();
    setTimeout(() => cacheCurrentSectionFields(lastMyduSection), 120);
  }

  function attachmentDocumentHint(target) {
    let current = target;
    for (let depth = 0; current && current !== document.body && depth < 9; depth += 1, current = current.parentElement) {
      const text = (current.innerText || current.textContent || "").replace(/\s+/g, " ").trim();
      if (/сумма баллов ент|общий балл ент|обязательные предметы/i.test(text)) return "Сертификат ЕНТ";
      if (/test report form|номер сертификата|название международн.*сертификат|владени.*иностранн.*язык|ielts/i.test(text)) return "IELTS Test Report Form";
      if (/номер документа|документ,? удостоверяющ.*личност/i.test(text)) return "Удостоверение личности";
      if (/приложени[ея].*(аттестат|диплом)|(аттестат|диплом).*приложени[ея]/i.test(text)) return "Приложение к аттестату/диплому";
      if (/серия (аттестата|диплома)|номер (аттестата|диплома)/i.test(text)) return "Аттестат/диплом";
      if (/подтверждающ.*родств|свидетельств[оа] о рождении/i.test(text)) return "Свидетельство о рождении";
      if (text.length > 4200) break;
    }
    return "";
  }

  function captureAttachmentHint(event) {
    const target = event.target instanceof Element ? event.target.closest("button, a, [role='button']") : null;
    if (!target) return;
    const text = (target.innerText || target.textContent || "").trim();
    if (!/\.(?:pdf|png|jpe?g|webp)\b|скан-копия|документ,?\s+подтверждающ|сертификат/i.test(text)) return;
    ocrGeneration += 1;
    ocrPageStability.clear();
    lastAttachmentHint = `${text} ${attachmentDocumentHint(target)}`.trim();
    lastDocumentSignature = "";
    referenceCollapsed = false;
    state.activeView = "checks";
    state.collapsed = false;
    setTimeout(scanDocumentViewer, 150);
    setTimeout(scanDocumentViewer, 700);
  }

  document.addEventListener("click", captureAttachmentHint, true);
  document.addEventListener("click", captureMyduSection, true);

  setInterval(async () => {
    const id = applicantId();
    if (id === lastApplicantId) {
      syncMyduSection();
      cacheCurrentSectionFields();
      scanDocumentViewer();
      return;
    }
    clearTimeout(saveTimer);
    if (lastApplicantId && draftKey) await storageSet({ [draftKey]: draftPayload() });
    root?.remove(); root = shadow = null; lastApplicantId = null;
    ocrGeneration += 1; ocrCache.clear(); ocrPageStability.clear();
    documentReview = null; lastDocumentSignature = ""; lastAttachmentHint = ""; referenceCollapsed = false; lastMyduSection = null; pageFieldCache = { personal: [], education: [], admission: [], social: [] };
    if (id) await mount();
  }, 1000);
  mount();
})();
