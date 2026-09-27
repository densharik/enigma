// All page text in two languages. Chapter bodies are HTML; <sup data-fn="id"></sup> marks a footnote,
// <div data-widget="name"></div> is replaced by an interactive widget, <figure data-img="slug"> by a photo with credit.
// Stage directives (camera, x-ray, rotors out) live in main.js next to the chapter ids.

export const UI = {
  ru: {
    title: 'Энигма: как устроена шифровальная машина',
    brand: 'Энигма I',
    brandSub: 'интерактивный разбор',
    chapters: 'Главы',
    tapeIn: 'Текст',
    tapeOut: 'Шифр',
    clear: 'Стереть',
    windows: 'Окна роторов',
    hintType: 'Печатайте на клавиатуре или нажимайте клавиши машины',
    hintTouch: 'Нажимайте клавиши машины или откройте клавиатуру',
    oneKey: 'По одной клавише: следующая ждёт, пока отпустят предыдущую',
    hintDrag: 'Тащите, чтобы повернуть',
    loading: 'Загружаю модель',
    fwd: 'ток к отражателю',
    back: 'ток обратно к лампе',
    resetView: 'Вернуть вид',
    keyboard: 'Клавиатура',
    reset: 'Сбросить',
    random: 'Случайные 10 пар',
    pairs: 'пар',
    press: 'Нажать клавишу',
    doubleStep: 'Показать двойной шаг',
    stepsLog: 'Журнал шагов',
    rotor: 'Ротор',
    position: 'Позиция',
    ring: 'Кольцо',
    reflector: 'Отражатель',
    rotors: 'Роторы',
    positions: 'Стартовые позиции',
    rings: 'Кольца',
    plugboard: 'Коммутационная панель',
    input: 'Открытый текст или шифровка',
    output: 'Результат',
    copy: 'Копировать',
    copied: 'Скопировано',
    swap: 'Расшифровать результат',
    presetDemo: 'Пример: HELLO',
    presetBarbarossa: 'Радиограмма 7 июля 1941',
    share: 'Ссылка на эти установки',
    testSelf: 'Напечатать 10 000 случайных букв',
    selfResult: (n, same, rnd) => `${n.toLocaleString('ru')} букв. Энигма ни разу не превратила букву в саму себя (${same}). Обычный случайный шифр делает это примерно в каждом 26-м случае, здесь совпадений ${rnd}.`,
    conOk: 'другая',
    conSame: 'СОВПАЛА',
    conTyped: 'напечатано',
    conEnigma: 'Энигма: буква = сама себе',
    conRandom: 'случайный шифр: совпадений',
    cribPos: 'Сдвиг шпаргалки',
    cribBad: 'невозможно: буква совпала сама с собой',
    cribOk: 'возможно, проверять на бомбе',
    cribSummary: (ok, all) => `Из ${all} положений осталось ${ok}.`,
    keyspaceTotal: 'Всего вариантов',
    bits: 'бит',
    sources: 'Источники и изображения',
    footnote: 'Сноска',
    source: 'Источник',
    photo: 'Фото',
    close: 'Закрыть',
    lang: 'EN',
    langLabel: 'Switch to English',
    diagramCols: ['Клавиша', 'Панель', 'Вход', 'Правый', 'Средний', 'Левый', 'Отраж.'],
    chainLabels: ['клав.', 'панель', 'прав.', 'средн.', 'лев.', 'отраж.', 'лев.', 'средн.', 'прав.', 'панель', 'лампа'],
    ringNote: (w, r, s) => s ? `В окне по-прежнему ${w}, но проводка под кольцом повёрнута на ${s} ${s % 10 === 1 && s !== 11 ? 'позицию' : (s % 10 >= 2 && s % 10 <= 4 && (s < 12 || s > 14)) ? 'позиции' : 'позиций'}. Противник видит ту же букву в окне, а шифр уже другой.` : `Кольцо на 01: буквы стоят ровно над своими проводами. Сдвиньте ползунок.`,
    ringLead: w => `Буква в окне не меняется (${w}). Меняется только, какие провода под ней.`,
    ringLetters: 'буквы кольца',
    ringWires: 'контакты проводки',
    ringRotor: 'правый ротор отдельно',
    ringMachine: 'вся машина сейчас',
    stepNote: 'Нажимайте и смотрите, какие роторы шагают.',
    willStep: 'Следующее нажатие сдвинет',
    rotorNames: ['левый', 'средний', 'правый'],
    and: 'и',
    wiringHint: 'Наведите на букву, чтобы увидеть её провод',
    rotorIn: 'вход справа',
    rotorOut: 'выход влево',
    turnover: 'перенос',
    yearsBombes: 'бомб в Британии',
    pairsCount: n => `${n} ${n % 10 === 1 && n !== 11 ? 'пара' : (n % 10 >= 2 && n % 10 <= 4 && (n < 12 || n > 14)) ? 'пары' : 'пар'}`,
    kPlugPairs: 'Пар на панели',
    kRotorsAvail: 'Роторов в ящике',
    kRings: 'Считать кольца',
    kSpeed: 'Перебор со скоростью миллиард ключей в секунду займёт',
    years: 'лет',
    ageUniverse: 'Но бомбы ключи не перебирали: они проверяли шпаргалку и отсекали целые группы вариантов, которые давали противоречие',
    factorOrders: 'порядок роторов',
    factorStarts: 'стартовые позиции',
    factorRings: 'кольца (значимые)',
    factorPlugs: 'коммутационная панель',
  },
  en: {
    title: 'Enigma: how the cipher machine works',
    brand: 'Enigma I',
    brandSub: 'an interactive teardown',
    chapters: 'Chapters',
    tapeIn: 'Text',
    tapeOut: 'Cipher',
    clear: 'Clear',
    windows: 'Rotor windows',
    hintType: 'Type on your keyboard or press the machine keys',
    hintTouch: 'Tap the machine keys or open the keyboard',
    oneKey: 'One key at a time: the next waits until the last is released',
    hintDrag: 'Drag to turn',
    loading: 'Loading the model',
    fwd: 'current to the reflector',
    back: 'current back to the lamp',
    resetView: 'Reset view',
    keyboard: 'Keyboard',
    reset: 'Reset',
    random: 'Random 10 pairs',
    pairs: 'pairs',
    press: 'Press a key',
    doubleStep: 'Show the double step',
    stepsLog: 'Step log',
    rotor: 'Rotor',
    position: 'Position',
    ring: 'Ring',
    reflector: 'Reflector',
    rotors: 'Rotors',
    positions: 'Start positions',
    rings: 'Rings',
    plugboard: 'Plugboard',
    input: 'Plain text or cipher text',
    output: 'Result',
    copy: 'Copy',
    copied: 'Copied',
    swap: 'Decrypt the result',
    presetDemo: 'Example: HELLO',
    presetBarbarossa: 'Radio message of 7 July 1941',
    share: 'Link to these settings',
    testSelf: 'Type 10,000 random letters',
    selfResult: (n, same, rnd) => `${n.toLocaleString('en')} letters. Enigma never turned a letter into itself (${same}). A plain random cipher does it about once in 26: here ${rnd} matches.`,
    conOk: 'differs',
    conSame: 'MATCH',
    conTyped: 'typed',
    conEnigma: 'Enigma: letter = itself',
    conRandom: 'random cipher: matches',
    cribPos: 'Crib offset',
    cribBad: 'impossible: a letter matched itself',
    cribOk: 'possible, test it on the bombe',
    cribSummary: (ok, all) => `${ok} of ${all} positions remain.`,
    keyspaceTotal: 'Total settings',
    bits: 'bits',
    sources: 'Sources and images',
    footnote: 'Note',
    source: 'Source',
    photo: 'Photo',
    close: 'Close',
    lang: 'RU',
    langLabel: 'Переключить на русский',
    diagramCols: ['Key', 'Plugs', 'Entry', 'Right', 'Middle', 'Left', 'Refl.'],
    chainLabels: ['key', 'plugs', 'right', 'mid', 'left', 'refl.', 'left', 'mid', 'right', 'plugs', 'lamp'],
    ringNote: (w, r, s) => s ? `The window still shows ${w}, but the wiring under the ring is turned ${s} ${s === 1 ? 'step' : 'steps'}. An enemy sees the same letter in the window, yet the cipher is different.` : `Ring at 01: every letter sits right above its own wire. Move the slider.`,
    ringLead: w => `The letter in the window stays the same (${w}). Only the wires under it change.`,
    ringLetters: 'ring letters',
    ringWires: 'wiring contacts',
    ringRotor: 'right rotor alone',
    ringMachine: 'whole machine now',
    stepNote: 'Press and watch which rotors move.',
    willStep: 'The next press moves',
    rotorNames: ['left', 'middle', 'right'],
    and: 'and',
    wiringHint: 'Hover a letter to see its wire',
    rotorIn: 'in, right',
    rotorOut: 'out, left',
    turnover: 'turnover',
    yearsBombes: 'bombes in Britain',
    pairsCount: n => `${n} ${n === 1 ? 'pair' : 'pairs'}`,
    kPlugPairs: 'Plugboard pairs',
    kRotorsAvail: 'Rotors in the box',
    kRings: 'Count ring settings',
    kSpeed: 'Trying a billion keys per second would take',
    years: 'years',
    ageUniverse: 'But the bombes did not try keys one by one: they tested a crib and threw out whole groups of settings that led to a contradiction',
    factorOrders: 'rotor order',
    factorStarts: 'start positions',
    factorRings: 'rings (effective)',
    factorPlugs: 'plugboard',
  },
}

export const CHAPTERS = {
  ru: [
    {
      id: 'intro', num: '', title: 'Энигма',
      kicker: 'Шифровальная машина вермахта, 1930-1945',
      body: `<p class="lead">Двадцать шесть клавиш, двадцать шесть лампочек и батарейка на 4,5 вольта. Машина размером с пишущую машинку превращала приказы в буквенную кашу, и немецкое командование было уверено, что прочитать её невозможно.</p>
<p>Здесь Энигма разобрана по частям: настоящая проводка, настоящий шаг роторов и настоящие установки. Машина справа работает. Напечатайте что-нибудь и посмотрите на лампы.</p>
<p class="aside">Заметьте: если нажать одну и ту же букву несколько раз, загораются разные лампы. Почему так происходит, разберём ниже.</p>
<figure data-img="guderian-enigma"></figure>`,
    },
    {
      id: 'parts', num: '01', title: 'Что лежит в ящике',
      body: `<p>Энигма I ставилась в деревянный ящик с откидной передней стенкой. Внутри нет ни одной лампы-усилителя и ни одной микросхемы: только провода, пружинные контакты и механика.<sup data-fn="battery"></sup></p>
<ul class="parts">
<li data-part="keyboard"><b>Клавиатура.</b> 26 клавиш в немецкой раскладке QWERTZ. Цифр и знаков препинания нет: точку заменяла буква X, числа писали словами.<sup data-fn="format"></sup></li>
<li data-part="lamps"><b>Ламповая панель.</b> 26 окошек с буквами. При каждом нажатии загорается одно: это буква шифра. Записывать приходилось вручную, поэтому часто работали вдвоём.<sup data-fn="assistant"></sup></li>
<li data-part="rotors"><b>Роторы.</b> Три колеса под крышкой. В окошках видно, в каком положении стоит каждое.</li>
<li data-part="plugboard"><b>Коммутационная панель.</b> 26 гнёзд на передней стенке и кабели, которые меняют буквы парами. У коммерческих моделей её не было, только у военных: армии, авиации и флота.<sup data-fn="stecker"></sup></li>
<li data-part="battery"><b>Батарея 4,5 В.</b> Стоит за роторами и питает лампы.</li>
</ul>
<p>Наведите на пункт списка, чтобы найти деталь на машине. Машину можно вращать мышью или пальцем.</p>`,
    },
    {
      id: 'circuit', num: '02', title: 'Одна буква - одна цепь',
      body: `<p>Нажатая клавиша делает две вещи. Сначала механически поворачивает правый ротор на одну позицию. Потом замыкает контакт, и ток от батареи проходит длинный путь: коммутационная панель, три ротора, отражатель, снова три ротора, но уже другими проводами, снова панель и лампа.</p>
<div class="legend"><span class="sw fwd"></span><span data-t="fwd"></span><span class="sw back"></span><span data-t="back"></span></div>
<p>Корпус стал прозрачным. Нажмите любую букву и проследите ток: сначала оранжевый к отражателю, потом синий обратно к лампе.</p>
<p>Под каждой клавишей стоит переключатель. Отпущенная клавиша соединяет свой провод с лампой, нажатая - с батареей. Ток, который вернулся к нажатой клавише, до её лампы дойти не может. Поэтому лампа всегда загорается у другой буквы.<sup data-fn="circuit"></sup></p>`,
    },
    {
      id: 'plugboard', num: '03', title: 'Коммутационная панель',
      body: `<p>Кабель с двумя штекерами соединяет два гнезда и меняет эти буквы местами. Если соединены A и V, нажатие A уходит в роторы как V, а ток, вернувшийся из роторов на V, зажигает лампу A. Буквы без кабеля проходят как есть.</p>
<div data-widget="plugboard"></div>
<p>По инструкции ставили 10 кабелей, хотя в комплекте было 12.<sup data-fn="cables"></sup> Выбрать 10 пар из 26 букв можно 150 738 274 937 250 способами. Это больше, чем дают все роторы вместе взятые.</p>
<figure data-img="plugboard"></figure>`,
    },
    {
      id: 'rotors', num: '04', title: 'Ротор: перепутанный алфавит',
      body: `<p>Ротор - это диск из бакелита. На одной стороне 26 плоских латунных контактов, на другой 26 подпружиненных штырьков. Внутри каждый контакт соединён проводом с каким-то другим. Ротор I соединяет A с E, B с K, C с M и так далее.<sup data-fn="wiring"></sup></p>
<div data-widget="rotor"></div>
<p>Один ротор сам по себе - простая замена букв, такую разгадывают за вечер по частоте букв. Сила Энигмы в другом: роторов три, они стоят подряд, и после каждой буквы поворачиваются. Каждая следующая буква шифруется уже другим алфавитом.</p>
<p>Роторов в ящике было пять, в машину ставили три. Порядок менялся каждый день.<sup data-fn="iv_v"></sup></p>
<figure data-img="rotor-exploded"></figure>`,
    },
    {
      id: 'stepping', num: '05', title: 'Шаг: одометр с подвохом',
      body: `<p>Под роторами лежит вал с тремя собачками. Нажатая клавиша толкает рычаг, вал поворачивается, и собачки упираются в храповики роторов. Правая собачка поворачивает правый ротор на одну букву при каждом нажатии.</p>
<p>Средний ротор шагает, когда правый проходит свою выемку на кольце. У ротора III выемка стоит так, что это переход V на W. Похоже на одометр: единицы прокрутились, десятки сдвинулись. Левый шагает, когда средний проходит свою выемку.</p>
<div data-widget="stepping"></div>
<p>А теперь подвох. Средняя собачка, толкая левый ротор, цепляет выемку среднего и тащит его тоже. Средний ротор делает два шага подряд. Это называют двойным шагом. Из-за него период машины 26 × 25 × 26 = 16 900 нажатий, а не 26³ = 17 576.<sup data-fn="period"></sup></p>
<figure data-img="rotors-spindle-ratchet"></figure>`,
    },
    {
      id: 'rings', num: '06', title: 'Кольцо с буквами',
      body: `<p>Буквы на ободе ротора нанесены на отдельное кольцо. Его можно повернуть относительно проводки и закрепить штифтом. Это кольцевая установка, Ringstellung.</p>
<div data-widget="rings"></div>
<p>Кольцо сдвигает проводку относительно буквы в окне: при той же букве в окне ток идёт другими проводами. Выемка переноса закреплена на кольце, поэтому соседний ротор шагает при той же букве в окне, но проводка в этот момент стоит уже в другом положении. Оператор выставлял кольца утром, когда ставил роторы по листу ключей.<sup data-fn="rings"></sup></p>
<figure data-img="rotors-alphabet-rings"></figure>`,
    },
    {
      id: 'reflector', num: '07', title: 'Отражатель: удобство и роковая ошибка',
      body: `<p>Слева от роторов стоит неподвижный отражатель, Umkehrwalze. Он соединяет буквы попарно, 13 пар, и отправляет ток обратно через роторы другим путём.</p>
<div data-widget="reflector"></div>
<p><b>Удобство.</b> Машина симметрична: если при одних установках H превращается в J, то и J превращается в H. Отдельного режима расшифровки нет. Получатель ставит те же установки и печатает шифровку, а на лампах загорается открытый текст.</p>
<p><b>Ошибка.</b> Ток не может вернуться тем же проводом, которым пришёл, поэтому буква никогда не шифруется сама в себя. Кажется мелочью, но именно это позволяло взломщикам отбрасывать огромное число вариантов.<sup data-fn="self"></sup></p>
<figure data-img="reflector-rotor-stack"></figure>`,
    },
    {
      id: 'path', num: '08', title: 'Весь путь на одной схеме',
      body: `<p>Развернём машину в плоскую схему. Каждая колонка - одна деталь, каждая строка - один контакт. Нажмите букву и проследите, как она меняется на каждом шаге.</p>
<div data-widget="diagram"></div>
<p>После каждого нажатия правый ротор сдвигается, и его провода на схеме уезжают на строку. Поэтому та же буква в следующий раз идёт другим путём.</p>`,
    },
    {
      id: 'key', num: '09', title: 'Секрет - в установках',
      body: `<p>Устройство машины противник знал: чертежи, трофеи, реконструкции. Секретом были установки на день. Их печатали в листе суточных ключей на месяц вперёд.<sup data-fn="keysheet"></sup></p>
<ul class="plain">
<li><b>Walzenlage</b>: какие три ротора из пяти и в каком порядке;</li>
<li><b>Ringstellung</b>: положение колец;</li>
<li><b>Steckerverbindungen</b>: пары на коммутационной панели;</li>
<li><b>Kenngruppen</b>: группы, по которым получатель узнавал ключ.</li>
</ul>
<p>Кроме этого, для каждого сообщения оператор выбирал свою стартовую позицию роторов, ключ сообщения, и передавал её в начале радиограммы в зашифрованном виде.<sup data-fn="procedure"></sup></p>
<div data-widget="keyspace"></div>
<figure data-img="keylist-luftwaffe"></figure>`,
    },
    {
      id: 'break', num: '10', title: 'Как её взломали',
      body: `<ol class="timeline">
<li><span class="yr">1932</span><p>Мариан Реевский, математик польского Шифровального бюро, восстанавливает проводку роторов армейской Энигмы. Помогли теория перестановок и документы, которые французская разведка получила от агента Ганса-Тило Шмидта. С января 1933 года поляки читают немецкие радиограммы.<sup data-fn="rejewski"></sup></p></li>
<li><span class="yr">1938</span><p>Немцы меняют процедуру. Поляки отвечают перфорированными листами Зыгальского и «бомбой» Реевского: шесть соединённых копий Энигмы находили ключ дня примерно за два часа.<sup data-fn="bomba"></sup></p></li>
<li><span class="yr">дек. 1938</span><p>Появляются роторы IV и V. Вариантов порядка роторов становится 60 вместо 6, работы в десять раз больше, чем Польша может потянуть.</p></li>
<li><span class="yr">июль 1939</span><p>В Пырах под Варшавой поляки передают британцам и французам всё: методы, листы, реконструкции машины.<sup data-fn="pyry"></sup></p></li>
<li><span class="yr">1940</span><p>В Блетчли-парке Алан Тьюринг и Гордон Уэлчман строят электромеханическую бомбу. Она не перебирала всё подряд, а проверяла шпаргалку, угаданный кусок открытого текста. Метеосводки начинались с WETTER, донесения содержали KEINE BESONDEREN EREIGNISSE, «без происшествий». К концу войны в Британии работало около 210 бомб.<sup data-fn="bombe"></sup></p></li>
</ol>
<p>Куда приложить шпаргалку? Энигма никогда не превращает букву в саму себя. Если в каком-то положении буква шпаргалки совпала с буквой шифровки, это положение невозможно. Подвигайте шпаргалку:</p>
<div data-widget="crib"></div>
<p>Сведения из расшифровок шли под грифом Ultra. Официальный историк британской разведки Гарри Хинсли считал, что они сократили войну на два года и больше. Другие историки оценивают эффект скромнее, а на Восточном фронте он был невелик.<sup data-fn="ultra"></sup></p>
<figure data-img="bombe-rebuild"></figure>`,
    },
    {
      id: 'sim', num: '11', title: 'Попробуйте сами',
      body: `<p>Полный симулятор Энигмы I. Выставьте ключ, напечатайте текст, отправьте шифровку и расшифруйте её с теми же установками. Машина справа повторяет каждое нажатие.</p>
<div data-widget="sim"></div>
<p class="aside">Во втором примере настоящая радиограмма с Восточного фронта от 7 июля 1941 года, расшифрованная в 2000-х по методике Салливана и Вейеруда.<sup data-fn="barbarossa"></sup></p>`,
    },
  ],
  en: [
    {
      id: 'intro', num: '', title: 'Enigma',
      kicker: 'The Wehrmacht cipher machine, 1930-1945',
      body: `<p class="lead">Twenty-six keys, twenty-six lamps and a 4.5 volt battery. A machine the size of a typewriter turned orders into letter soup, and the German command was sure no one could read it.</p>
<p>This page takes Enigma apart piece by piece: the real wiring, the real rotor stepping, the real settings. The machine on the right works. Type something and watch the lamps.</p>
<p class="aside">Notice: press the same letter several times and a different lamp lights each time. Below is why.</p>
<figure data-img="guderian-enigma"></figure>`,
    },
    {
      id: 'parts', num: '01', title: 'What is in the box',
      body: `<p>Enigma I came in a wooden box with a fold-down front. Inside there is no valve and no chip: just wires, spring contacts and mechanics.<sup data-fn="battery"></sup></p>
<ul class="parts">
<li data-part="keyboard"><b>Keyboard.</b> 26 keys in the German QWERTZ layout. No digits, no punctuation: X stood for a full stop, numbers were spelled out.<sup data-fn="format"></sup></li>
<li data-part="lamps"><b>Lamp board.</b> 26 windows with letters. Each key press lights one: the cipher letter. It had to be written down by hand, so operators often worked in pairs.<sup data-fn="assistant"></sup></li>
<li data-part="rotors"><b>Rotors.</b> Three wheels under the lid. The windows show the position of each.</li>
<li data-part="plugboard"><b>Plugboard.</b> 26 sockets on the front and cables that swap letters in pairs. Commercial models had none; only the military did: army, air force and navy.<sup data-fn="stecker"></sup></li>
<li data-part="battery"><b>4.5 V battery.</b> Sits behind the rotors and powers the lamps.</li>
</ul>
<p>Hover an item to find the part on the machine. You can turn the machine with the mouse or a finger.</p>`,
    },
    {
      id: 'circuit', num: '02', title: 'One letter, one circuit',
      body: `<p>A key press does two things. First it mechanically turns the right rotor one position. Then it closes a contact, and current from the battery takes a long route: plugboard, three rotors, reflector, the three rotors again along other wires, the plugboard again, and a lamp.</p>
<div class="legend"><span class="sw fwd"></span><span data-t="fwd"></span><span class="sw back"></span><span data-t="back"></span></div>
<p>The case is now transparent. Press any letter and follow the current: orange to the reflector, blue back to the lamp.</p>
<p>Under every key is a changeover switch. A released key connects its wire to its lamp; a pressed key connects it to the battery. Current that comes back to the pressed key cannot reach that key's lamp, so a lamp always lights for some other letter.<sup data-fn="circuit"></sup></p>`,
    },
    {
      id: 'plugboard', num: '03', title: 'The plugboard',
      body: `<p>A cable with two plugs joins two sockets and swaps those letters. With A and V connected, pressing A sends V into the rotors, and current returning from the rotors on V lights lamp A. Letters without a cable pass straight through.</p>
<div data-widget="plugboard"></div>
<p>Procedure called for 10 cables, though 12 came with the machine.<sup data-fn="cables"></sup> There are 150,738,274,937,250 ways to choose 10 pairs from 26 letters. That is more than all the rotors together give.</p>
<figure data-img="plugboard"></figure>`,
    },
    {
      id: 'rotors', num: '04', title: 'A rotor is a scrambled alphabet',
      body: `<p>A rotor is a bakelite disc. One face has 26 flat brass contacts, the other 26 spring-loaded pins. Inside, each contact is wired to some other one. Rotor I joins A to E, B to K, C to M and so on.<sup data-fn="wiring"></sup></p>
<div data-widget="rotor"></div>
<p>On its own a rotor is a simple substitution, the kind you break in an evening by letter frequency. Enigma's strength is elsewhere: there are three rotors in a row and they turn after every letter, so every next letter is enciphered with a different alphabet.</p>
<p>The box held five rotors and three went into the machine. The order changed daily.<sup data-fn="iv_v"></sup></p>
<figure data-img="rotor-exploded"></figure>`,
    },
    {
      id: 'stepping', num: '05', title: 'Stepping: an odometer with a catch',
      body: `<p>Under the rotors lies a shaft with three pawls. A key press pushes a lever, the shaft turns, and the pawls push against the rotors' ratchets. The right pawl turns the right rotor one letter on every press.</p>
<p>The middle rotor steps when the right one passes the notch on its ring. On rotor III the notch sits so that this happens going from V to W. Like an odometer: the units roll over, the tens move. The left rotor steps when the middle one passes its notch.</p>
<div data-widget="stepping"></div>
<p>Now the catch. When the middle pawl pushes the left rotor, it also catches the middle rotor's notch and drags it along. The middle rotor steps twice in a row. This is the double step. Because of it the machine's period is 26 × 25 × 26 = 16,900 presses, not 26³ = 17,576.<sup data-fn="period"></sup></p>
<figure data-img="rotors-spindle-ratchet"></figure>`,
    },
    {
      id: 'rings', num: '06', title: 'The letter ring',
      body: `<p>The letters on a rotor's rim sit on a separate ring. It can be turned against the wiring and fixed with a pin. This is the ring setting, the Ringstellung.</p>
<div data-widget="rings"></div>
<p>The ring shifts the wiring against the letter in the window: with the same letter showing, current runs through different wires. The turnover notch is fixed to the ring, so the next rotor steps at the same window letter, but the wiring is in a different position when it does. Operators set the rings each morning as they loaded the rotors from the key sheet.<sup data-fn="rings"></sup></p>
<figure data-img="rotors-alphabet-rings"></figure>`,
    },
    {
      id: 'reflector', num: '07', title: 'The reflector: a convenience and a fatal flaw',
      body: `<p>Left of the rotors sits the fixed reflector, the Umkehrwalze. It joins letters in 13 pairs and sends the current back through the rotors by another route.</p>
<div data-widget="reflector"></div>
<p><b>The convenience.</b> The machine is symmetric: if H becomes J with some settings, J becomes H. There is no decrypt mode. The receiver sets the same key and types the cipher text, and the lamps spell the plain text.</p>
<p><b>The flaw.</b> Current cannot come back along the wire it came in on, so a letter never encrypts to itself. It sounds minor, but it let codebreakers throw away huge numbers of possibilities.<sup data-fn="self"></sup></p>
<figure data-img="reflector-rotor-stack"></figure>`,
    },
    {
      id: 'path', num: '08', title: 'The whole route on one diagram',
      body: `<p>Let us unroll the machine into a flat diagram. Each column is one part, each row one contact. Press a letter and follow how it changes at every step.</p>
<div data-widget="diagram"></div>
<p>After each press the right rotor moves and its wires on the diagram shift by one row. That is why the same letter takes a different route next time.</p>`,
    },
    {
      id: 'key', num: '09', title: 'The secret is the settings',
      body: `<p>The enemy knew how the machine was built: drawings, captures, reconstructions. The secret was the settings of the day, printed on a monthly key sheet.<sup data-fn="keysheet"></sup></p>
<ul class="plain">
<li><b>Walzenlage</b>: which three of the five rotors and in what order;</li>
<li><b>Ringstellung</b>: the ring settings;</li>
<li><b>Steckerverbindungen</b>: the plugboard pairs;</li>
<li><b>Kenngruppen</b>: groups that told the receiver which key was used.</li>
</ul>
<p>On top of that, for each message the operator chose his own rotor start position, the message key, and sent it enciphered at the head of the message.<sup data-fn="procedure"></sup></p>
<div data-widget="keyspace"></div>
<figure data-img="keylist-luftwaffe"></figure>`,
    },
    {
      id: 'break', num: '10', title: 'How it was broken',
      body: `<ol class="timeline">
<li><span class="yr">1932</span><p>Marian Rejewski, a mathematician at the Polish Cipher Bureau, reconstructs the wiring of the army Enigma rotors, using permutation theory and documents that French intelligence got from the agent Hans-Thilo Schmidt. From January 1933 the Poles read German traffic.<sup data-fn="rejewski"></sup></p></li>
<li><span class="yr">1938</span><p>The Germans change their procedure. The Poles answer with Zygalski's perforated sheets and Rejewski's "bomba": six linked copies of Enigma that found the daily key in about two hours.<sup data-fn="bomba"></sup></p></li>
<li><span class="yr">Dec 1938</span><p>Rotors IV and V arrive. Rotor orders go from 6 to 60, ten times the work, more than Poland can manage.</p></li>
<li><span class="yr">July 1939</span><p>At Pyry near Warsaw the Poles hand everything to the British and French: methods, sheets, reconstructed machines.<sup data-fn="pyry"></sup></p></li>
<li><span class="yr">1940</span><p>At Bletchley Park Alan Turing and Gordon Welchman build the electromechanical bombe. It did not try everything; it tested a crib, a guessed piece of plain text. Weather reports began with WETTER, reports carried KEINE BESONDEREN EREIGNISSE, "nothing to report". By the end of the war about 210 bombes ran in Britain.<sup data-fn="bombe"></sup></p></li>
</ol>
<p>Where does the crib go? Enigma never turns a letter into itself. If at some offset a crib letter matches the cipher letter under it, that offset is impossible. Slide the crib:</p>
<div data-widget="crib"></div>
<p>Intelligence from the decrypts was classified Ultra. Harry Hinsley, the official historian of British intelligence, thought it shortened the war by two years or more. Other historians rate the effect lower, and on the Eastern Front it was small.<sup data-fn="ultra"></sup></p>
<figure data-img="bombe-rebuild"></figure>`,
    },
    {
      id: 'sim', num: '11', title: 'Try it yourself',
      body: `<p>A complete Enigma I simulator. Set a key, type a text, send the cipher text and decrypt it with the same settings. The machine on the right repeats every key press.</p>
<div data-widget="sim"></div>
<p class="aside">The second example is a real radio message from the Eastern Front, 7 July 1941, recovered in the 2000s by Sullivan and Weierud.<sup data-fn="barbarossa"></sup></p>`,
    },
  ],
}

const WP = 'https://en.wikipedia.org/wiki/'
const RUWP = 'https://ru.wikipedia.org/wiki/'
const CM = 'https://www.cryptomuseum.com/crypto/enigma/'
export const FOOTNOTES = {
  battery: {
    ru: 'Питание - стандартная армейская батарея 4,5 В в отсеке справа сзади. Энигма I выпускалась с 1930 года, всего их сделали более 20 000.',
    en: 'Power came from a standard 4.5 V army battery in a compartment at the rear right. Enigma I was made from 1930; more than 20,000 were built.',
    src: [['Crypto Museum: Enigma I', CM + 'i/index.htm']], img: 'enigma-i-open',
  },
  format: {
    ru: 'Правила Вермахта: знаки препинания заменяются на X, имена собственные удваиваются и берутся в X, числа пишутся по цифрам словами (EINS, NULL), CH и CK заменяются на Q. Текст разбивают на группы по пять букв. В радиограмме 1941 года в симуляторе всё это видно.',
    en: 'Wehrmacht rules: punctuation becomes X, proper names are doubled and wrapped in X, numbers are spelled digit by digit (EINS, NULL), CH and CK become Q. The text is split into groups of five. The 1941 message in the simulator shows all of it.',
    src: [['Wikipedia (de): Enigma (Maschine), Funkspruch', 'https://de.wikipedia.org/wiki/Enigma_(Maschine)#Funkspruch']],
  },
  assistant: {
    ru: 'Буквы с ламп записывали вручную, поэтому обычно работали вдвоём: один печатал, второй диктовал или записывал.',
    en: 'Letters had to be copied from the lamps by hand, so usually two people worked the machine: one typed, the other read out or wrote.',
    src: [['Wikipedia: Enigma machine', WP + 'Enigma_machine']], img: 'enigma-lamp-lit',
  },
  stecker: {
    ru: 'Коммутационная панель (Steckerbrett) - главное отличие военной Энигмы от коммерческой. Её ставили только на машины вооружённых сил.',
    en: 'The plugboard (Steckerbrett) is the key difference between military and commercial Enigma. It was fitted only to armed forces machines.',
    src: [['Crypto Museum: Steckerbrett', CM + 'i/sb.htm'], ['Wikipedia: Enigma machine', WP + 'Enigma_machine#Plugboard']],
  },
  circuit: {
    ru: 'Путь тока: батарея, контакт клавиши, панель, входное колесо, роторы справа налево, отражатель, роторы слева направо, входное колесо, панель, контакты отпущенных клавиш, лампа. Проводка на модели повторяет эту схему.',
    en: 'Current path: battery, key contact, plugboard, entry wheel, rotors right to left, reflector, rotors left to right, entry wheel, plugboard, contacts of the released keys, lamp. The wiring on the model follows this circuit.',
    src: [['Wikipedia: Enigma machine, Electrical pathway', WP + 'Enigma_machine#Electrical_pathway']],
  },
  cables: {
    ru: 'С машиной шло 12 кабелей: 10 рабочих и 2 запасных. С 1936 года ставили от 5 до 8 пар, с 1 января 1939 года от 7 до 10, позже обычно 10.',
    en: 'Each machine came with 12 cables: 10 in use and 2 spares. From 1936 five to eight pairs were used, from 1 January 1939 seven to ten, later usually ten.',
    src: [['Crypto Museum: Enigma I', CM + 'i/index.htm'], ['Wikipedia: Cryptanalysis of the Enigma', WP + 'Cryptanalysis_of_the_Enigma']],
  },
  wiring: {
    ru: 'Проводка роторов I-V и отражателей A, B, C взята из таблиц, где Википедия и Crypto Museum совпадают буква в букву. Входное колесо Энигмы I соединено по алфавиту: A с A, B с B.',
    en: 'Wiring of rotors I-V and reflectors A, B, C is from tables where Wikipedia and Crypto Museum agree letter for letter. The Enigma I entry wheel is wired in alphabetical order: A to A, B to B.',
    src: [['Wikipedia: Enigma rotor details', WP + 'Enigma_rotor_details'], ['Crypto Museum: wiring', CM + 'wiring.htm']], img: 'rotor-exploded',
  },
  iv_v: {
    ru: 'Роторы I-III были с 1930 года. Роторы IV и V ввели 15 декабря 1938 года, и число возможных порядков выросло с 6 до 60.',
    en: 'Rotors I-III date from 1930. Rotors IV and V came on 15 December 1938, raising the possible orders from 6 to 60.',
    src: [['Wikipedia: Enigma rotor details', WP + 'Enigma_rotor_details']],
  },
  period: {
    ru: 'Пример с роторами I-II-III: ADU, ADV, AEW, BFX. На третьем нажатии средний ротор шагает второй раз подряд.',
    en: 'Example with rotors I-II-III: ADU, ADV, AEW, BFX. On the third press the middle rotor steps for the second time in a row.',
    src: [['Wikipedia: Enigma rotor details, Turnover', WP + 'Enigma_rotor_details#Turnover'], ['Wikipedia: Enigma machine', WP + 'Enigma_machine']],
    img: 'stepping-ratchet-diagram',
  },
  rings: {
    ru: 'Кольцо левого ротора влияет только на то, какая буква видна в окне: за левым ротором никто не шагает. Поэтому значимых комбинаций колец 26 × 26 = 676.',
    en: 'The left ring only changes the letter shown in the window: nothing steps after the left rotor. So there are 26 × 26 = 676 effective ring combinations.',
    src: [['Wikipedia: Enigma rotor details', WP + 'Enigma_rotor_details'], ['Wikipedia: Enigma machine', WP + 'Enigma_machine']],
  },
  self: {
    ru: 'Это свойство позволяло сразу вычеркнуть положения шпаргалки, где хотя бы одна буква совпадала с шифровкой. На нём же держались методы Блетчли-парка.',
    en: 'This property let codebreakers strike out crib positions where any letter matched the cipher text. Bletchley Park methods relied on it.',
    src: [['Wikipedia: Cryptanalysis of the Enigma', WP + 'Cryptanalysis_of_the_Enigma']],
  },
  keysheet: {
    ru: 'Лист ключей (Schlüsseltafel) на месяц: дата, порядок роторов, кольца, пары панели, опознавательные группы. До 1938 года в нём была ещё общая стартовая позиция.',
    en: 'A monthly key sheet (Schlüsseltafel): date, rotor order, rings, plug pairs, identification groups. Before 1938 it also listed a common start position.',
    src: [['Wikipedia: Enigma machine', WP + 'Enigma_machine'], ['Wikipedia: Cryptanalysis of the Enigma', WP + 'Cryptanalysis_of_the_Enigma']], img: 'keylist-luftwaffe',
  },
  procedure: {
    ru: 'До мая 1940 года ключ сообщения печатали дважды подряд, чтобы защититься от ошибок приёма. Именно это повторение дало Реевскому зацепку. Сообщения ограничивали 250 буквами, длинные делили на части.',
    en: 'Until May 1940 the message key was typed twice in a row to guard against reception errors. That repetition gave Rejewski his foothold. Messages were limited to 250 letters; longer ones were split.',
    src: [['Wikipedia: Cryptanalysis of the Enigma', WP + 'Cryptanalysis_of_the_Enigma']],
  },
  rejewski: {
    ru: 'Реевский, Ружицкий и Зыгальский пришли в Шифровальное бюро 1 сентября 1932 года. Реевский описал машину как систему уравнений в перестановках и решил её, используя удвоенный ключ сообщения.',
    en: 'Rejewski, Różycki and Zygalski joined the Cipher Bureau on 1 September 1932. Rejewski described the machine as a system of permutation equations and solved it using the doubled message key.',
    src: [['Wikipedia: Marian Rejewski', WP + 'Marian_Rejewski'], ['Википедия: Реевский, Мариан', RUWP + 'Реевский,_Мариан']], img: 'polish-codebreakers',
  },
  bomba: {
    ru: 'Шесть бомб построили в Варшаве к середине ноября 1938 года. Листы Зыгальского ловили повторы букв в удвоенном ключе сообщения.',
    en: 'Six bombas were built in Warsaw by mid-November 1938. Zygalski sheets caught repeated letters in the doubled message key.',
    src: [['Wikipedia: Bomba (cryptography)', WP + 'Bomba_(cryptography)'], ['Wikipedia: Zygalski sheets', WP + 'Zygalski_sheets']], img: 'bomba-reconstruction',
  },
  pyry: {
    ru: 'Встреча 26-27 июля 1939 года, за пять недель до войны. Каждая сторона получила по польской реконструкции Энигмы.',
    en: 'The meeting was on 26-27 July 1939, five weeks before the war. Each side got a Polish-built reconstruction of Enigma.',
    src: [['Wikipedia: Cryptanalysis of the Enigma', WP + 'Cryptanalysis_of_the_Enigma']], img: 'zygalski-sheets',
  },
  bombe: {
    ru: 'Первая бомба «Victory» заработала 18 марта 1940 года, в августе появилась версия с диагональной платой Уэлчмана. Бомб было 15 в конце 1941 года и около 210 к концу войны, обслуживали их около 2000 женщин из флотской службы WRNS.',
    en: 'The first bombe, "Victory", started on 18 March 1940; in August came the version with Welchman\'s diagonal board. There were 15 bombes at the end of 1941 and about 210 by the end of the war, run by some 2,000 Wrens.',
    src: [['Wikipedia: Bombe', WP + 'Bombe'], ['Crypto Museum: Bombe', 'https://www.cryptomuseum.com/crypto/bombe/index.htm']], img: 'turing',
  },
  ultra: {
    ru: 'Оценка Хинсли: война была бы «на два, может быть на три или четыре года длиннее». Джон Киган и другие считают, что выигрыш мог быть и в несколько месяцев. Точной цифры нет.',
    en: 'Hinsley\'s estimate: the war would have been "something like two years longer, perhaps three years longer, possibly four years longer". John Keegan and others think the gain may have been a few months. There is no exact figure.',
    src: [['Wikipedia: Ultra (cryptography)', WP + 'Ultra_(cryptography)']], img: 'bletchley-mansion',
  },
  barbarossa: {
    ru: 'Роторы II IV V, отражатель B, кольца 02 21 12, ключ сообщения BLA, панель AV BS CG DL FU HZ IN KM OW RX. Текст: разведотряд из Куртинова северо-западнее Себежа в 18:30 выступил по авиадороге в направлении Дубровки, Опочки. Дальше про атаку пехотного полка.',
    en: 'Rotors II IV V, reflector B, rings 02 21 12, message key BLA, plugs AV BS CG DL FU HZ IN KM OW RX. Text: a reconnaissance unit from Kurtinowa north-west of Sebezh set off at 18:30 along the air-force road towards Dubrowki, Opochka. It goes on about an infantry regiment\'s attack.',
    src: [['Sullivan, Weierud: Breaking German Army Ciphers (Cryptologia, 2005)', 'https://cryptocellar.org/pubs/bgac.pdf'], ['Franklin Heath: Enigma sample messages', 'http://wiki.franklinheath.co.uk/index.php/Enigma/Sample_Messages']],
  },
}

export const FIG_CAPTIONS = {
  'guderian-enigma': { ru: 'Штабная машина генерала Гудериана во Франции, 1940. Внизу слева Энигма: один печатает, другие записывают.', en: 'General Guderian\'s command vehicle in France, 1940. The Enigma is at the bottom left: one man types, others write down.' },
  plugboard: { ru: 'Настоящая коммутационная панель с кабелями.', en: 'A real plugboard with cables.' },
  'rotor-exploded': { ru: 'Ротор в разборе: кольцо с буквами, корпус с проводкой, храповик.', en: 'A rotor taken apart: letter ring, wired core, ratchet.' },
  'rotors-spindle-ratchet': { ru: 'Роторы на оси: штырьки, храповик и выемка переноса.', en: 'Rotors on the spindle: pins, ratchet and turnover notch.' },
  'rotors-alphabet-rings': { ru: 'Роторы с буквенными кольцами, установленные в машину.', en: 'Rotors with letter rings, fitted in the machine.' },
  'reflector-rotor-stack': { ru: 'Слева отражатель B с красной буквой, правее три ротора. Отражатель не вращается при работе: у него нет ни храповика, ни окна. На многих армейских машинах, как здесь, на кольцах стояли числа 01-26 вместо букв.', en: 'On the left, reflector B with its red letter; to the right, three rotors. The reflector does not turn in use: it has no ratchet and no window. Many army machines, like this one, had rings numbered 01-26 instead of letters.' },
  'keylist-luftwaffe': { ru: 'Лист суточных ключей люфтваффе.', en: 'A Luftwaffe daily key sheet.' },
  'bombe-rebuild': { ru: 'Работающая реконструкция бомбы Тьюринга-Уэлчмана, Блетчли-парк.', en: 'A working rebuild of the Turing-Welchman bombe, Bletchley Park.' },
}
