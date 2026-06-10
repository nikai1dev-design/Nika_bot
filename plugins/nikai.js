// م࣬ــࢪحہּٰـبٚأ بٚـڪٰٖ فَــي أوٰأم࣬ـࢪ ۿأݪــڪٰٖي ؍ 🌸♡゙ ُ𓂁
// أوٰأم࣬ــࢪ م࣬ٺم࣬يــژۿ . ⊹
// حہּٰقَــــوٰقَ 𝒎𝒐𝒏𝒕𝒆 𝒅𝒆𝒗 🐦☕
// أݪــسٰࢪقَــۿ ݪأ ٺــفَـيډڪٰٖ يم࣬غٰــفَݪ
// أسٰـم࣬ أݪأم࣬ــࢪ مونتي.js
// ٺـأࢪيخَ صَـنٰأـ؏ٚـۿ أݪــبٚوٰٺ ؍ 🌸♡゙ ُ𓂁 2024_9_22
// ࢪأبٚــطَ قَنٰــأۿ أݪم࣬ــطَــوٰࢪ ..)✘🖤🧸.
// https://whatsapp.com/channel/0029Vb7AkG84inotOc8BXE1K

// قائمة الردود والملصقات
const monteMessages = [
  {
    text: "وش تـريد من نيكاي اخلص 🐦🔪 \n<(ꐦㅍ _ㅍ)>",
    sticker: "https://files.catbox.moe/5vk0qm.webp"
  },
  {
    text: "اخر مره تناديه 🐦🔪 اجاه صداع من كثره المنادات\n<(ꐦㅍ _ㅍ)>",
    sticker: "https://files.catbox.moe/gn2isv.webp"
  },
  {
    text: "*_بـانكـاي كـاتـن كـيو كٓتٓـسو_*\n*_ســــــــوف يــــتــــم تشــــࢪيــــدك مــــن الــــجࢪوب اذا نــــاديتــــه_*\n(ㅍ_╂)\nᷡ✪▬👊 ▬ᬎ═════════͜>",
    sticker: "https://files.catbox.moe/ljl4j0.webp"
  }
];

// سجل الردود التي تم إرسالها لكل مستخدم
const userLastResponse = new Map();

export async function before(m, { conn }) {
  // الرقم المسموح له (المطور)
  const developerNumber = "212701810216@s.whatsapp.net";
  const isDeveloper = m.sender === developerNumber;

  // إذا كان المطور يتحدث أو لا يوجد نص لا نرد
  if (isDeveloper || !m.text) return;

  // التحقق إذا كانت الرسالة تحتوي على كلمة "مونتي"
  if (m.text.includes("نيكاي")) {
    const userId = m.sender;
    const lastIndex = userLastResponse.get(userId) ?? -1;

    // اختيار رد مختلف عن الرد السابق للمستخدم نفسه
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * monteMessages.length);
    } while (randomIndex === lastIndex && monteMessages.length > 1);

    // تسجيل الرد الحالي للمستخدم
    userLastResponse.set(userId, randomIndex);

    const response = monteMessages[randomIndex];

    // إرسال الملصق أولاً
    await conn.sendMessage(m.chat, { sticker: { url: response.sticker } }, { quoted: m });
    // إرسال النص
    await conn.sendMessage(m.chat, { text: response.text }, { quoted: m });
  }
}