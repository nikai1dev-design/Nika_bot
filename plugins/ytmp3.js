import axios from 'axios';
import { delay } from 'baileys';
import { toAudio } from '../lib/converter.js';

let handler = async (m, { conn, usedPrefix, command, text }) => {
	if (!text) {
		throw `Usage: ${usedPrefix + command} <YouTube Audio URL>`;
	}

	await m.react('🔁');

	try {
		const dl = await ytdown(text, 'audio');
		const info = dl.info;

		const sthumb = await conn.adReply(
			m.chat,
			`– 乂 *YouTube - Audio*\n` +
			`> *- Title :* ${info.title}\n` +
			`> *- Channel :* ${info.uploader}\n` +
			`> *- Duration :* ${info.duration}\n` +
			`> *- Views :* ${info.views}\n` +
			`> *- Size :* ${info.size}`,
			info.thumbnail,
			m,
			{
				title: info.title,
				source: text,
			}
		);

		const { data, ext } = await conn.getFile(dl.download);
		const audios = await toAudio(data, ext);

		await conn.sendMessage(
			m.chat,
			{
				audio: audios.data,
				mimetype: 'audio/mpeg',
				fileName: `${info.title}.mp3`,
			},
			{ quoted: sthumb }
		);

		await m.react('✅');
	} catch (e) {
		console.error(e);
		await m.react('❌');
		return m.reply(e.message || 'Failed to download audio');
	}
};

handler.help = ['ytmp3'];
handler.tags = ['downloader'];
handler.command = /^(ytmp3)$/i;
handler.limit = false;

export default handler;

export async function ytdown(url, type = 'video') {
	const { data } = await axios.post(
		'https://app.ytdown.to/proxy.php',
		new URLSearchParams({ url }),
		{
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
		}
	);

	const api = data.api;

	if (api?.status === 'ERROR') {
		throw new Error(api.message);
	}

	const media = api?.mediaItems?.find(
		(m) => m.type.toLowerCase() === type.toLowerCase()
	);

	if (!media) {
		throw new Error('Media type not found');
	}

	while (true) {
		const { data: res } = await axios.get(media.mediaUrl);

		if (res?.error === 'METADATA_NOT_FOUND') {
			throw new Error('Metadata not found');
		}

		if (
			res?.percent === 'Completed' &&
			res?.fileUrl !== 'In Processing...'
		) {
			return {
				info: {
					title: api.title,
					desc: api.description,
					thumbnail: api.imagePreviewUrl,
					views: api.mediaStats?.viewsCount,
					uploader: api.userInfo?.name,
					quality: media.mediaQuality,
					duration: media.mediaDuration,
					extension: media.mediaExtension,
					size: media.mediaFileSize,
				},
				download: res.fileUrl,
			};
		}

		await delay(5000);
	}
}