// 参考: https://qiita.com/qiita_mona/items/e58943cf74c40678050a
// getUserMedia が使えないとき
if (typeof navigator.mediaDevices.getUserMedia !== 'function') {
  const err = new Error('getUserMedia()が使用できません');
  alert(`${err.name} ${err.message}`);
  throw err;
}

// select要素のoptionをクリアする
function clearSelect(select) {
  while (select.firstChild) {
    select.removeChild(select.firstChild);
  }
}

// select要素のoptionに、option.valueがvalueな項目があれば選択する
// 戻り値は、option中に該当項目があればtrue
function selectValueIfExists(select, value) {
  if (value === null || value === undefined) return;
  var result = false;
  select.childNodes.forEach((n) => {
    if (n.value === value) {
      select.value = value;
      result = true;
    }
  });
  return result;
}

/** 
 * アイドル情報
 * @type {{
      type: string;
      fullname: string;
      lastName: string;
      lastNameKana: string,
      firstName: string;
      firstNameKana: string,
      fullnameKana: string;
      ageStr: string;
      birthday: string;
      constellation: string;
      blood: string;
      heightStr: string;
      weightStr: string;
      bustStr: string;
      waistStr: string;
      hipStr: string;
      hand: string;
      birthplace: string;
      hobby: string;
      voiceActor: string;
      implementationDate: string;
      voiceImplementationDate: string;
      voiceImplementationReason: string;
      //voiceImplementationDate: string;
      voiceActorRelease: string;
      twitter: string;
      nickname: string;
      }[]}
 */
let idolList = [];
fetch('./cgssIdolList.json').then((res) => {
  res.json().then((data) => {
    idolList = data;
  });
});

// 音声認識
// 参考: https://jellyware.jp/kurage/iot/webspeechapi.html
var flag_speech = 0;
var recognition;
var lang = 'ja-JP';
var textUpdateTimeoutID = 0;
var textUpdateTimeoutSecond = 30; // 音声認識結果が更新されない場合にクリアするまでの秒数（0以下の場合は自動クリアしない）

function vr_function() {
  window.SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition;
  recognition = new webkitSpeechRecognition();
  recognition.lang = lang;
  recognition.interimResults = true;
  recognition.continuous = true;

  recognition.onsoundstart = function () {
    document.getElementById('status').innerHTML = '認識中...';
    document.getElementById('status').className = 'processing';
  };
  recognition.onnomatch = function () {
    document.getElementById('status').innerHTML = '音声を認識できませんでした';
    document.getElementById('status').className = 'error';
  };
  recognition.onerror = function () {
    document.getElementById('status').innerHTML = 'エラー';
    document.getElementById('status').className = 'error';
    if (flag_speech == 0) vr_function();
  };
  recognition.onsoundend = function () {
    document.getElementById('status').innerHTML = '停止中';
    document.getElementById('status').className = 'error';
    vr_function();
  };

  // 認識結果
  recognition.onresult = function (event) {
    var results = event.results;
    for (var i = event.resultIndex; i < results.length; i++) {
      if (results[i].isFinal) {
        var result_transcript = results[i][0].transcript;
        const kana = resultToHiragana(result_transcript);
        document.getElementById('result_text').innerHTML = `${result_transcript}<br/>${kana}`;

        // アイドル情報生成
        const result = createIdolList(result_transcript, kana);
        document.getElementById('idolList').innerHTML = result;

        // 認識再開
        vr_function();
        flag_speech = 0;
      } else {
        var result_transcript = results[i][0].transcript;
        const kana = resultToHiragana(result_transcript);
        document.getElementById('result_text').innerHTML = `${result_transcript}<br/>${kana}`;

        // アイドル情報生成
        const result = createIdolList(result_transcript, kana);
        document.getElementById('idolList').innerHTML = result;

        flag_speech = 1;
      }
    }
  };

  flag_speech = 0;
  document.getElementById('status').innerHTML = '待機中';
  document.getElementById('status').className = 'ready';
  recognition.start();
}

/**
 * @param {string} word
 * @returns {string}
 */
function createIdolList(word, kana) {
  let htmlStr = '<div style="color: initial;">';

  const list = idolList.filter((item) => {
    if (item.fullnameKana.includes(word)) return true;
    if (item.fullname.includes(word)) return true;
    if (item.nickname.includes(word)) return true;
    if (item.birthplace.includes(word)) return true;
    if (item.voiceActor.includes(word)) return true;
    if (item.hobby.includes(word)) return true;

    if (item.fullnameKana.includes(kana)) return true;
    if (item.fullname.includes(kana)) return true;
    if (item.nickname.includes(kana)) return true;
    if (item.birthplace.includes(kana)) return true;
    if (item.voiceActor.includes(kana)) return true;
    if (item.hobby.includes(kana)) return true;

    return false;
  });
  console.log('-------');
  console.log(word);
  console.log(list);

  let item = '<div style="display: flex; border: solid 1px;">';
  item += `<div class="profileCel" style="width: 200px">名前</div>`;
  item += `<div class="profileCel" style="width: 200px">かな</div>`;
  item += `<div class="profileCel" style="width: 100px">年齢</div>`;
  item += `<div class="profileCel" style="width: 100px">誕生日</div>`;
  item += `<div class="profileCel" style="width: 80px">血液型</div>`;
  item += `<div class="profileCel" style="width: 120px">身長</div>`;
  item += `<div class="profileCel" style="width: 80px">利き手</div>`;
  item += `<div class="profileCel" style="width: 120px">出身</div>`;
  item += `<div class="profileCel" style="width: 200px">趣味</div>`;
  item += `<div class="profileCel" style="width: 200px">声優</div>`;
  item += '</div>';
  htmlStr += item;

  htmlStr += list
    .map((idol) => {
      let item = '<div style="display: flex; border: solid 1px;">';

      item += `<div class="profileCel" style="width: 200px">${idol.fullname}</div>`;
      item += `<div class="profileCel" style="width: 200px">${idol.fullnameKana}</div>`;
      item += `<div class="profileCel" style="width: 100px">${idol.ageStr}</div>`;
      item += `<div class="profileCel" style="width: 100px">${idol.birthday}</div>`;
      item += `<div class="profileCel" style="width: 80px">${idol.blood}</div>`;
      item += `<div class="profileCel" style="width: 120px">${idol.heightStr}cm</div>`;
      item += `<div class="profileCel" style="width: 80px">${idol.hand}</div>`;
      item += `<div class="profileCel" style="width: 120px">${idol.birthplace}</div>`;
      item += `<div class="profileCel" style="width: 200px">${idol.hobby}</div>`;
      item += `<div class="profileCel" style="width: 200px">${idol.voiceActor}</div>`;

      item += '</div>';
      return item;
    })
    .join('');

  return htmlStr + '</div>';
}

function updateTextClearSecond() {
  const sec = Number(document.getElementById('select_autoclear_text').value);
  if (!isNaN(sec) && isFinite(sec) && sec >= 0) {
    textUpdateTimeoutSecond = sec;
  }
}

function clearTimeoutForClearText() {
  if (textUpdateTimeoutID !== 0) {
    clearTimeout(textUpdateTimeoutID);
    textUpdateTimeoutID = 0;
  }
}

// 変数 textUpdateTimeoutSecond に基づいてタイマーを設定する。
// タイマーの時間切れで、字幕を自動的に消去する。
// 変数の値がゼロ以下の場合はタイマーは設定されない。
// タイマーが既に動いている場合、処理タイミングは後からのもので上書きする。
function setTimeoutForClearText() {
  if (textUpdateTimeoutSecond <= 0) return;

  clearTimeoutForClearText();
  textUpdateTimeoutID = setTimeout(() => {
    document.getElementById('result_text').innerHTML = '';
    textUpdateTimeoutID = 0;
  }, textUpdateTimeoutSecond * 1000);
}

// 認識を手動で止める（文を区切る）
document.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    if (flag_speech == 1) {
      recognition.stop();
    }
  }
});

const objResultText = document.querySelector('#result_text');
var font_size_windowed = parseFloat(getComputedStyle(objResultText).getPropertyValue('font-size'));
var flag_font_size_styled = 0;

window.onload = () => {
  vr_function();

  initConfig();
};

// 言語切替
// 参考: https://www.google.com/intl/ja/chrome/demos/speech.html
var langs = [
  ['Japanese', ['ja-JP']],
  [
    'English',
    ['en-US', 'United States'],
    ['en-AU', 'Australia'],
    ['en-CA', 'Canada'],
    ['en-IN', 'India'],
    ['en-KE', 'Kenya'],
    ['en-TZ', 'Tanzania'],
    ['en-GH', 'Ghana'],
    ['en-NZ', 'New Zealand'],
    ['en-NG', 'Nigeria'],
    ['en-ZA', 'South Africa'],
    ['en-PH', 'Philippines'],
    ['en-GB', 'United Kingdom'],
  ],
  ['Afrikaans', ['af-ZA']],
  ['አማርኛ', ['am-ET']],
  ['Azərbaycanca', ['az-AZ']],
  ['বাংলা', ['bn-BD', 'বাংলাদেশ'], ['bn-IN', 'ভারত']],
  ['Bahasa Indonesia', ['id-ID']],
  ['Bahasa Melayu', ['ms-MY']],
  ['Català', ['ca-ES']],
  ['Čeština', ['cs-CZ']],
  ['Dansk', ['da-DK']],
  ['Deutsch', ['de-DE']],
  [
    'Español',
    ['es-AR', 'Argentina'],
    ['es-BO', 'Bolivia'],
    ['es-CL', 'Chile'],
    ['es-CO', 'Colombia'],
    ['es-CR', 'Costa Rica'],
    ['es-EC', 'Ecuador'],
    ['es-SV', 'El Salvador'],
    ['es-ES', 'España'],
    ['es-US', 'Estados Unidos'],
    ['es-GT', 'Guatemala'],
    ['es-HN', 'Honduras'],
    ['es-MX', 'México'],
    ['es-NI', 'Nicaragua'],
    ['es-PA', 'Panamá'],
    ['es-PY', 'Paraguay'],
    ['es-PE', 'Perú'],
    ['es-PR', 'Puerto Rico'],
    ['es-DO', 'República Dominicana'],
    ['es-UY', 'Uruguay'],
    ['es-VE', 'Venezuela'],
  ],
  ['Euskara', ['eu-ES']],
  ['Filipino', ['fil-PH']],
  ['Français', ['fr-FR']],
  ['Basa Jawa', ['jv-ID']],
  ['Galego', ['gl-ES']],
  ['ગુજરાતી', ['gu-IN']],
  ['Hrvatski', ['hr-HR']],
  ['IsiZulu', ['zu-ZA']],
  ['Íslenska', ['is-IS']],
  ['Italiano', ['it-IT', 'Italia'], ['it-CH', 'Svizzera']],
  ['ಕನ್ನಡ', ['kn-IN']],
  ['ភាសាខ្មែរ', ['km-KH']],
  ['Latviešu', ['lv-LV']],
  ['Lietuvių', ['lt-LT']],
  ['മലയാളം', ['ml-IN']],
  ['मराठी', ['mr-IN']],
  ['Magyar', ['hu-HU']],
  ['ລາວ', ['lo-LA']],
  ['Nederlands', ['nl-NL']],
  ['नेपाली भाषा', ['ne-NP']],
  ['Norsk bokmål', ['nb-NO']],
  ['Polski', ['pl-PL']],
  ['Português', ['pt-BR', 'Brasil'], ['pt-PT', 'Portugal']],
  ['Română', ['ro-RO']],
  ['සිංහල', ['si-LK']],
  ['Slovenščina', ['sl-SI']],
  ['Basa Sunda', ['su-ID']],
  ['Slovenčina', ['sk-SK']],
  ['Suomi', ['fi-FI']],
  ['Svenska', ['sv-SE']],
  ['Kiswahili', ['sw-TZ', 'Tanzania'], ['sw-KE', 'Kenya']],
  ['ქართული', ['ka-GE']],
  ['Հայերեն', ['hy-AM']],
  ['தமிழ்', ['ta-IN', 'இந்தியா'], ['ta-SG', 'சிங்கப்பூர்'], ['ta-LK', 'இலங்கை'], ['ta-MY', 'மலேசியா']],
  ['తెలుగు', ['te-IN']],
  ['Tiếng Việt', ['vi-VN']],
  ['Türkçe', ['tr-TR']],
  ['اُردُو', ['ur-PK', 'پاکستان'], ['ur-IN', 'بھارت']],
  ['Ελληνικά', ['el-GR']],
  ['български', ['bg-BG']],
  ['Pусский', ['ru-RU']],
  ['Српски', ['sr-RS']],
  ['Українська', ['uk-UA']],
  ['한국어', ['ko-KR']],
  ['中文', ['cmn-Hans-CN', '普通话 (中国大陆)'], ['cmn-Hans-HK', '普通话 (香港)'], ['cmn-Hant-TW', '中文 (台灣)'], ['yue-Hant-HK', '粵語 (香港)']],
  ['हिन्दी', ['hi-IN']],
  ['ภาษาไทย', ['th-TH']],
];

for (var i = 0; i < langs.length; i++) {
  select_language.options[i] = new Option(langs[i][0], i);
}

// デフォルトの言語を設定
select_language.selectedIndex = 0;
updateCountry();
select_dialect.selectedIndex = 0;

function updateCountry() {
  for (var i = select_dialect.options.length - 1; i >= 0; i--) {
    select_dialect.remove(i);
  }
  var list = langs[select_language.selectedIndex];
  for (var i = 1; i < list.length; i++) {
    select_dialect.options.add(new Option(list[i][1], list[i][0]));
  }
  select_dialect.style.display = list[1].length == 1 ? 'none' : 'inline';
  updateLanguage();
}

function updateLanguage() {
  var flag_recognition_stopped = 0;
  if (recognition) {
    recognition.stop();
    flag_recognition_stopped = 1;
  }
  lang = select_dialect.value;
  if (flag_recognition_stopped) {
    vr_function();
  }
}

// フォント切替
// 参考: https://www.google.com/intl/ja/chrome/demos/speech.html
var fonts_custom = [
  ['Noto Sans JP', "'Noto Sans JP', sans-serif"],
  ['BIZ UD ゴシック（Windows 10）', "'BIZ UDゴシック', 'BIZ UDGothic', 'Noto Sans JP', sans-serif"],
  ['BIZ UD 明朝（Windows 10）', "'BIZ UD明朝', 'BIZ UDMincho', 'Noto Sans JP', sans-serif"],
  ['游ゴシック', "游ゴシック体, 'Yu Gothic', YuGothic, sans-serif"],
  ['メイリオ', "'メイリオ', 'Meiryo', 'Noto Sans JP', sans-serif"],
  ['ポップ体（Windows）', "'HGS創英角ﾎﾟｯﾌﾟ体', 'Noto Sans JP', sans-serif"],
  ['ゴシック体（ブラウザ標準）', 'sans-serif'],
  ['明朝体（ブラウザ標準）', 'serif'],
];

for (var i = 0; i < fonts_custom.length; i++) {
  select_font.options[i] = new Option(fonts_custom[i][0], i);
}

// デフォルトの言語を設定
select_font.selectedIndex = 0;

// 初期設定
const config = JSON.parse(localStorage.speech_to_text_config || '{}');

function initConfig() {
  function triggerEvent(type, elem) {
    const ev = document.createEvent('HTMLEvents');
    ev.initEvent(type, true, true);
    elem.dispatchEvent(ev);
  }
  [
    'slider_font_size',
    'slider_opacity',
    'slider_text_shadow_stroke',
    'slider_text_stroke',
    'slider_line_height',
    'slider_letter_spacing',
    'selector_text_color',
    'selector_text_shadow_color',
    'selector_text_stroke_color',
    'slider_text_bg_opacity',
    'selector_text_bg_color',
    'selector_video_bg',
  ].forEach((id) => {
    if (typeof config[id] !== 'undefined') {
      const el = document.getElementById(id);
      el.value = config[id];
      triggerEvent('input', el);
    }
  });
  ['video_bg', 'text_overlay_wrapper'].forEach((id) => {
    if (typeof config[id] !== 'undefined') {
      const el = document.getElementById(id);
      if (config[id]) {
        Object.keys(config[id]).forEach((key) => {
          if (config[id][key]) {
            el.classList.add(key);
          } else {
            el.classList.remove(key);
          }
        });
      }
    }
  });
  if (typeof config.position !== 'undefined') {
    const el = document.getElementById(config.position);
    el.checked = 'checked';
    triggerEvent('input', el);
  }
  if (typeof config.select_font !== 'undefined') {
    select_font.selectedIndex = config.select_font;
    triggerEvent('change', select_font);
  }
  if (typeof config.select_autoclear_text !== 'undefined') {
    const el = document.getElementById('select_autoclear_text');
    selectValueIfExists(el, config.select_autoclear_text);
    triggerEvent('change', el);
  }

  document.querySelectorAll('input.control_input').forEach((el) => el.addEventListener('input', updateConfigValue));
  document.querySelector('#select_font').addEventListener('change', updateConfigValue);

  document.querySelector('#select_autoclear_text').addEventListener('change', updateConfigValue);
}

function updateConfig(key, value) {
  config[key] = value;
  localStorage.speech_to_text_config = JSON.stringify(config);
}

function updateConfigClass(key, value_key, value) {
  if (config[key] == undefined) {
    config[key] = {};
  }
  config[key][value_key] = value;
  localStorage.speech_to_text_config = JSON.stringify(config);
}

function toggleClass(id, className) {
  const el = document.getElementById(id);
  const value = el.classList.toggle(className);
  updateConfigClass(id, className, value);
}

function updateConfigValue() {
  updateConfig(this.id, this.value);
}

function deleteConfig() {
  localStorage.removeItem('speech_to_text_config');
  location.reload();
}

// 形態素解析
let kuromojiObj;
function initKuromoji() {
  if (kuromojiObj == undefined) {
    // document.getElementById('status_kuromoji_loading').innerHTML = 'ひらがなデータ読み込み中...';
    // document.getElementById('status_kuromoji_loading').className = 'processing';
    kuromoji.builder({ dicPath: 'kuromoji/dict/' }).build(function (err, tokenizer) {
      kuromojiObj = tokenizer;
      // document.getElementById('status_kuromoji_loading').innerHTML = 'ひらがなデータ読み込み完了';
      // document.getElementById('status_kuromoji_loading').className = 'ready';
    });
  }
}
initKuromoji();

/** 結果をひらがなにする */
function resultToHiragana(text) {
  if (kuromojiObj == undefined) {
    console.log('kuromojiObj is undefined');
    return text;
  }
  var kuromoji_result = kuromojiObj.tokenize(text);
  var result_hiragana = '';
  for (var i = 0; i < kuromoji_result.length; i++) {
    if (kuromoji_result[i].word_type == 'KNOWN') {
      result_hiragana += kuromoji_result[i].reading;
    } else {
      result_hiragana += kuromoji_result[i].surface_form;
    }
  }
  return katakanaToHiragana(result_hiragana);
}

/**
 * カタカナをひらがなにする
 * @see https://gist.github.com/kawanet/5553478
 */
function katakanaToHiragana(src) {
  return src.replace(/[\u30a1-\u30f6]/g, function (match) {
    var chr = match.charCodeAt(0) - 0x60;
    return String.fromCharCode(chr);
  });
}
