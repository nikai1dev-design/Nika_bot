import { WAMessageStubType } from '@whiskeysockets/baileys'

async function generarBienvenida({ conn, userId, groupMetadata, chat }) {
    const username = `@${userId.split('@')[0]}`
    const pp = await conn.profilePictureUrl(userId, 'image').catch(() => 'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745522645448.jpeg')
    const groupSize = groupMetadata.participants.length
    
    console.log('[DEBUG] chat.sWelcome:', chat.sWelcome)
    console.log('[DEBUG] userId:', userId)
    console.log('[DEBUG] groupMetadata.subject:', groupMetadata.subject)
    
    let mensajeFinal = ''
    
    if (chat.sWelcome && chat.sWelcome.trim() !== '') {
        console.log('[DEBUG] استخدام رسالة مخصصة للترحيب')
        mensajeFinal = chat.sWelcome
            .replace(/{usuario}/g, username)
            .replace(/{grupo}/g, groupMetadata.subject)
            .replace(/{desc}/g, groupMetadata.desc || 'بدون وصف')
            .replace(/{cantidad}/g, groupSize)
    } else {
        console.log('[DEBUG] استخدام رسالة الترحيب الافتراضية')
        mensajeFinal = `╭━〔👑 *ASTA-BOT 👑 〕* 
 ┋ 
 ┋「 🎉 *أهلاً وسهلاً! 👋 」* 
 ┋ 
 ┋ 「 *${groupMetadata.subject}* 」 
 ┋ 
 ╰━★ 「 ${username} 」 
 *╭━━━━━━ * 
 ┋❖ اطلع على الوصف لمزيد من المعلومات
 ┋❀ نتمنى لك وقت ممتع *
 ┋❖ عدد الأعضاء الآن ${groupSize} عضو/أعضاء
 ┗━━━━━━━━━━━━━━━┅ ⳹`
    }
    
    console.log('[DEBUG] الرسالة النهائية:', mensajeFinal)
    return { pp, caption: mensajeFinal, mentions: [userId] }
}

async function generarDespedida({ conn, userId, groupMetadata, chat }) {
    const username = `@${userId.split('@')[0]}`
    const pp = await conn.profilePictureUrl(userId, 'image').catch(() => 'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745522645448.jpeg')
    const groupSize = groupMetadata.participants.length
    
    console.log('[DEBUG] chat.sBye:', chat.sBye)
    
    let mensajeFinal = ''
    
    if (chat.sBye && chat.sBye.trim() !== '') {
        console.log('[DEBUG] استخدام رسالة مخصصة للوداع')
        mensajeFinal = chat.sBye
            .replace(/{usuario}/g, username)
            .replace(/{grupo}/g, groupMetadata.subject)
            .replace(/{desc}/g, groupMetadata.desc || 'بدون وصف')
            .replace(/{cantidad}/g, groupSize)
    } else {
        console.log('[DEBUG] استخدام رسالة الوداع الافتراضية')
        mensajeFinal = `╭━〔👑 *NIKAI-BOT 👑 〕* 
 ┋ 
 ┋「 😢 *وداعاً! 👋 」* 
 ┋ 
 ┋ 「 *${groupMetadata.subject}* 」 
 ┋ 
 ╰━★ 「 ${username} 」 
 *╭━━━━━━ * 
 ┋❖ عضو أقل 😢
 ┋❀ سنفتقدك في المجموعة *
 ┋❖ عدد الأعضاء الآن ${groupSize} عضو/أعضاء
 ┗━━━━━━━━━━━━━━━┅ ⳹`
    }
    
    return { pp, caption: mensajeFinal, mentions: [userId] }
}

let handler = m => m
handler.before = async function (m, { conn }) {
    try {
        if (!m.messageStubType || !m.isGroup) return
        
        const chatId = m.chat
        const chat = global.db.data.chats[chatId]
        if (!chat || !chat.welcome) return
        
        const userId = m.messageStubParameters?.[0]
        if (!userId) return
        
        const groupMetadata = await conn.groupMetadata(chatId).catch(() => null)
        if (!groupMetadata) return

        if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
            console.log(`[WELCOME] المستخدم ${userId} دخل المجموعة ${chatId}`)
            const { pp, caption, mentions } = await generarBienvenida({ 
                conn, 
                userId, 
                groupMetadata, 
                chat 
            })
            
            await conn.sendMessage(chatId, { 
                image: { url: pp }, 
                caption, 
                mentions 
            }).catch(e => console.error('خطأ عند إرسال رسالة الترحيب:', e))
        }

        if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE || 
            m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE) {
            
            console.log(`[BYE] المستخدم ${userId} غادر المجموعة ${chatId}`)
            const { pp, caption, mentions } = await generarDespedida({ 
                conn, 
                userId, 
                groupMetadata, 
                chat 
            })
            
            await conn.sendMessage(chatId, { 
                image: { url: pp }, 
                caption, 
                mentions 
            }).catch(e => console.error('خطأ عند إرسال رسالة الوداع:', e))
        }
    } catch (error) {
        console.error('خطأ في معالج الترحيب:', error)
    }
}

export { generarBienvenida, generarDespedida }
export default handler