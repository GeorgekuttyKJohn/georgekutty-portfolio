export const GOOGLE_SHEET_CSV_URL =
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vSY_XhxKrQL9uQ2Tu97f75VDRoEC5a0yp9sJ7AwTW5kA24iqcrdw1F2qqmy2l5njsg1jAmXLrWgfRQX/pub?output=csv';

const VIDEO_EXTENSION_REGEX = /\.(mp4|webm|ogg|mov|m4v)(\?|#|$)/i;
const DRIVE_VIDEO_INDICATOR_REGEX = /(\/preview\b|[?&#](?:type=)?video\b|\.(mp4|webm|ogg|mov|m4v)\b)/i;

/**
 * Parses an RFC 4180 CSV string into a 2D array of trimmed cell strings.
 */
export function parseCSV(csvText) {
    const rows = [];
    let currentRow = [];
    let currentField = '';
    let inQuotes = false;

    for (let i = 0; i < csvText.length; i++) {
        const char = csvText[i];
        const nextChar = csvText[i + 1];

        if (inQuotes) {
            if (char === '"' && nextChar === '"') {
                currentField += '"';
                i++;
            } else if (char === '"') {
                inQuotes = false;
            } else {
                currentField += char;
            }
        } else {
            if (char === '"') {
                inQuotes = true;
            } else if (char === ',') {
                currentRow.push(currentField.trim());
                currentField = '';
            } else if (char === '\r' && nextChar === '\n') {
                currentRow.push(currentField.trim());
                rows.push(currentRow);
                currentRow = [];
                currentField = '';
                i++;
            } else if (char === '\n' || char === '\r') {
                currentRow.push(currentField.trim());
                rows.push(currentRow);
                currentRow = [];
                currentField = '';
            } else {
                currentField += char;
            }
        }
    }

    if (currentField.length > 0 || currentRow.length > 0) {
        currentRow.push(currentField.trim());
        rows.push(currentRow);
    }

    return rows.filter((row) => row.some((cell) => cell !== ''));
}

/**
 * Extracts a Google Drive file ID from common share/open/uc/preview URL formats.
 */
export function extractGoogleDriveFileId(url) {
    if (!url) return null;

    const filePathMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
    if (filePathMatch) return filePathMatch[1];

    const idParamMatch = url.match(/drive\.google\.com\/(?:open|uc|thumbnail)\?[^#]*\bid=([a-zA-Z0-9_-]+)/i);
    if (idParamMatch) return idParamMatch[1];

    return null;
}

/**
 * Extracts a YouTube video ID from standard watch, share, shorts, or embed URLs.
 */
export function extractYouTubeVideoId(url) {
    if (!url) return null;

    const match = url.match(
        /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i
    );
    return match ? match[1] : null;
}

/**
 * Automatically detects whether a Media Link is a video or image from the URL
 * and converts YouTube / Google Drive links into embeddable or direct URLs.
 */
export function normalizeMediaUrl(rawUrl) {
    const trimmedUrl = (rawUrl || '').trim();

    const youtubeId = extractYouTubeVideoId(trimmedUrl);
    if (youtubeId) {
        return {
            type: 'video',
            src: `https://www.youtube.com/embed/${youtubeId}`,
            thumbnail: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
            isEmbed: true
        };
    }

    const driveFileId = extractGoogleDriveFileId(trimmedUrl);
    if (driveFileId) {
        const thumbnailUrl = `https://drive.google.com/thumbnail?id=${driveFileId}&sz=w1600`;
        if (DRIVE_VIDEO_INDICATOR_REGEX.test(trimmedUrl)) {
            return {
                type: 'video',
                src: `https://drive.google.com/file/d/${driveFileId}/preview`,
                thumbnail: thumbnailUrl,
                isEmbed: true
            };
        }

        return {
            type: 'image',
            src: thumbnailUrl,
            thumbnail: thumbnailUrl,
            isEmbed: false
        };
    }

    const isVideo = VIDEO_EXTENSION_REGEX.test(trimmedUrl);
    return {
        type: isVideo ? 'video' : 'image',
        src: trimmedUrl,
        thumbnail: null,
        isEmbed: false
    };
}

/**
 * Fetches and converts Google Sheet CSV rows (Category, Title, Description, Software Used, Media Link)
 * into category-keyed gallery items.
 */
export async function fetchGoogleSheetProjects(csvUrl = GOOGLE_SHEET_CSV_URL, signal) {
    const requestUrl = new URL(csvUrl);
    requestUrl.searchParams.set('_t', Date.now().toString());

    const response = await fetch(requestUrl.toString(), { signal });
    if (!response.ok) {
        throw new Error(`Failed to fetch Google Sheet CSV (${response.status})`);
    }

    const csvText = await response.text();
    const rows = parseCSV(csvText);
    if (rows.length < 2) return [];

    const headers = rows[0].map((h) => h.toLowerCase());
    const colIndex = {
        category: headers.findIndex((h) => h === 'category'),
        title: headers.findIndex((h) => h === 'title'),
        description: headers.findIndex((h) => h === 'description'),
        software: headers.findIndex((h) => h === 'software used' || h === 'software'),
        mediaLink: headers.findIndex((h) => h === 'media link' || h === 'media' || h === 'url')
    };

    const items = [];

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const getCell = (idx, fallbackIdx) => {
            const targetIdx = idx >= 0 ? idx : fallbackIdx;
            return targetIdx >= 0 && targetIdx < row.length ? row[targetIdx].trim() : '';
        };

        const category = getCell(colIndex.category, 0);
        const title = getCell(colIndex.title, 1);
        const description = getCell(colIndex.description, 2);
        const softwareRaw = getCell(colIndex.software, 3);
        const mediaLink = getCell(colIndex.mediaLink, 4);

        if (!category || !mediaLink) continue;

        const software = softwareRaw
            ? softwareRaw
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean)
            : [];

        const normalizedMedia = normalizeMediaUrl(mediaLink);

        items.push({
            category,
            item: {
                type: normalizedMedia.type,
                src: normalizedMedia.src,
                thumbnail: normalizedMedia.thumbnail,
                isEmbed: normalizedMedia.isEmbed,
                title: title || 'Untitled Project',
                description,
                software,
                link: '#'
            }
        });
    }

    return items;
}
