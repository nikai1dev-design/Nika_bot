// م࣬ــࢪحہּٰـبٚأ بٚـڪٰٖ فَــي أوٰأم࣬ـࢪ ۿأݪــڪٰٖي ؍ 🌸♡゙ ُ𓂁
// أوٰأم࣬ــࢪ م࣬ٺم࣬يــژۿ . ⊹
// حہּٰقَــــوٰقَ 𝒎𝒐𝒏𝒕𝒆 𝒅𝒆𝒗 🐦☕
// أݪــسٰࢪقَــۿ ݪأ ٺــفَـيډڪٰٖ يم࣬غٰــفَݪ
// أسٰـم࣬ أݪأم࣬ــࢪ المطور-سكربتي.js
// ٺـأࢪيخَ صَـنٰأـ؏ٚـۿ أݪــبٚوٰٺ ؍ 🌸♡゙ ُ𓂁 2024_9_22
// ࢪأبٚــطَ قَنٰــأۿ أݪم࣬ــطَــوٰࢪ ..)✘🖤🧸.
// https://whatsapp.com/channel/0029Vb7AkG84inotOc8BXE1K

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url'; 
import { dirname } from 'path';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const allowedNumbers = ['212701810216@s.whatsapp.net', '212701810216@s.whatsapp.net'];

const handler = async (m, { conn }) => {
    if (!allowedNumbers.includes(m.sender)) {
        await conn.sendMessage(m.chat, { text: `😈 يا عبد، هذا الأمر للمطور فقط` }, { quoted: m });
        return;
    }

    try {
        const botFolderPath = path.join(__dirname, '../');
        const zipFilePath = path.join(__dirname, '../bot_files.zip');

        let initialMessage = await conn.sendMessage(m.chat, { text: `📂 جاري قراءة ملفات البوت...` }, { quoted: m });
        console.log(`Reading files from: ${botFolderPath}`);
        
        const files = fs.readdirSync(botFolderPath);
        
        if (files.length === 0) {
            await conn.sendMessage(m.chat, { text: `⚠️ لا توجد ملفات لضغطها.`, edit: initialMessage.key }, { quoted: m });
            return;
        }

        let zippingMessage = await conn.sendMessage(m.chat, { text: `🔄 تم العثور على ${files.length} ملفات/مجلدات. جاري إنشاء ملف ZIP...`, edit: initialMessage.key }, { quoted: m });

        let processingMessage = await conn.sendMessage(m.chat, { text: `⏳ يتم الآن ضغط الملفات...`, edit: zippingMessage.key }, { quoted: m });

        // ✅ تم تعديل الأمر لتجنب stdout maxBuffer
        const zipCommand = `zip -rq "${zipFilePath}" . -x ".npm/*" "node_modules/*" "JadiBots/*"`;
        exec(zipCommand, { cwd: botFolderPath, maxBuffer: 1024 * 1024 * 50 }, async (error, stdout, stderr) => {
            if (error) {
                await conn.sendMessage(m.chat, { text: `❌ حدث خطأ أثناء إنشاء ملف ZIP: ${error.message}`, edit: processingMessage.key }, { quoted: m });
                return;
            }

            if (!fs.existsSync(zipFilePath)) {
                await conn.sendMessage(m.chat, { text: `❌ لم يتم إنشاء ملف ZIP.`, edit: processingMessage.key }, { quoted: m });
                return;
            }

            let sendingMessage = await conn.sendMessage(m.chat, { text: `✅ تم إنشاء ملف ZIP بنجاح. يتم الآن إرساله...`, edit: processingMessage.key }, { quoted: m });
            await conn.sendMessage(m.chat, {
                document: fs.readFileSync(zipFilePath),
                mimetype: 'application/zip',
                fileName: 'bot_files.zip'
            }, { quoted: m });

            fs.unlink(zipFilePath, async (err) => {
                if (!err) {
                    await conn.sendMessage(m.chat, { text: `🗑️ تم حذف ملف ZIP بعد الإرسال.`, edit: sendingMessage.key }, { quoted: m });
                }
            });
        });
    } catch (err) {
        await conn.sendMessage(m.chat, { text: `❌ فشل في معالجة ملفات البوت: ${err.message}` }, { quoted: m });
    }
};

handler.help = ['getplugin'].map((v) => v + ' *<nombre>*');
handler.tags = ['owner'];
handler.command = /^(سكربتي)$/i;

export default handler;