import fetch from 'node-fetch'

const defaultImage = 'https://files.catbox.moe/znnj12.jpg'

// تفعيل وتعطيل الترحيب
let handler = async (m, { conn, command, args, isAdmin, isOwner }) => {
  if (!m.isGroup) return m.reply('🔒 هذا الأمر مخصص للجروبات فقط.')

  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
  const chat = global.db.data.chats[m.chat]

  const type = (args[0] || '').toLowerCase()
  const enable = command === 'on'

  if (type !== 'welcome') return m.reply('🌿 استخدم:\n*.on welcome* / *.off welcome*')

  if (!(isAdmin || isOwner)) return m.reply('❌ هذا الأمر للمشرفين فقط.')

  chat.welcome = enable
  return m.reply(`✅ تم ${enable ? 'تفعيل' : 'إيقاف'} الترحيب والمغادرة بنجاح.`)
}

handler.command = ['on', 'off']
handler.group = true
handler.tags = ['group']
handler.help = ['on welcome', 'off welcome']

// نظام الترحيب والمغادرة
handler.before = async (m, { conn }) => {
  if (!m.isGroup) return
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
  const chat = global.db.data.chats[m.chat]
  if (!chat.welcome) return

  if ([27, 28, 32].includes(m.messageStubType)) {
    const groupMetadata = await conn.groupMetadata(m.chat)
    const groupName = groupMetadata.subject
    const groupDesc = groupMetadata.desc || "لا يوجد وصف للمجموعة"
    const groupSize = groupMetadata.participants.length
    const userId = m.messageStubParameters?.[0] || m.sender
    const userMention = `@${userId.split('@')[0]}`
    let profilePic = defaultImage

    try {
      profilePic = await conn.profilePictureUrl(userId, 'image')
        .catch(async () => await conn.profilePictureUrl(userId, 'preview'))
        .catch(() => defaultImage)
      if (!profilePic) profilePic = defaultImage
    } catch {
      profilePic = defaultImage
    }

    // 🟢 رسالة الترحيب الجميلة
    if (m.messageStubType === 27) {
      const welcomeText = `
╔═══════════════╗
║ 🤖 𝐀𝐊𝐈𝐑 𝐁𝐎𝐓
║ 👤 المطور: 𝑁𝐼𝐾𝐴 𝐷𝐸𝑉🌥️⃝⃕𝆺𝅥𝆹𝅥
╠═══════════════╣
🌸 مرحباً بك ${userMention}
🏷️ اسم المجموعة: ${groupName}
👥 عدد الأعضاء الآن: ${groupSize}
📋 وصف المجموعة: ${groupDesc}
╚═══════════════╝
      `.trim()

      await conn.sendMessage(m.chat, {
        image: { url: profilePic },
        caption: welcomeText,
        mentions: [userId]
      })
    }

    // 🔴 رسالة المغادرة الجميلة
    if (m.messageStubType === 28 || m.messageStubType === 32) {
      const byeText = `
╔═══════════════╗
║ 🤖 𝐀𝐊𝐈𝐑 𝐁𝐎𝐓
║ 👤 المطور: 𝑁𝐼𝐾𝐴 𝐷𝐸𝑉🌥️⃝⃕𝆺𝅥𝆹𝅥
╠═══════════════╣
🌿 لقد غادر عضو المجموعة
👤 منشن الشخص: ${userMention}
🏷️ اسم المجموعة: ${groupName}
👥 عدد الأعضاء الآن: ${groupSize}
╚═══════════════╝
      `.trim()

      await conn.sendMessage(m.chat, {
        image: { url: profilePic },
        caption: byeText,
        mentions: [userId]
      })
    }
  }
}

export default handler