// OktagonBet deck: 52 cards + 2 jokers + back, as standalone SVG.
// Zero dependencies, deterministic (re-running gives byte-identical files).
//   node cards/build.mjs
// Output, one deck per variant (same file names in each):
//   cards/svg/        themed: colours are the site's CSS tokens, for inline <svg>
//   cards/svg/light/  cards/svg/dark/   the same resolved to fixed colours, for <img>/PNG

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), 'svg');

// Poker ratio 63:88, one unit = 0.1 mm.
const W = 630, H = 880, CX = W / 2, CY = H / 2, RADIUS = 32;

// Every colour is a role bound to a token of oktagonbet.partners (theme.css), with that
// token's value in the site's light and dark themes: [token, light, dark].
const ROLES = {
	paper: ['--bg', '#ffffff', '#232a31'], // card face
	panel: ['--bg-soft', '#eceded', '#11171c'], // court panel, jokers, back
	raised: ['--bg-elevated', '#f3f5f6', '#1f262c'], // faces and hands of the figures
	ink: ['--text-main', '#11171c', '#e6e6e6'], // black suits, outlines
	edge: ['--border-strong', '#11171c29', '#ffffff24'], // card outline
	blue: ['--primary', '#0066ff', '#0066ff'],
	deep: ['--primary-hover', '#003d99', '#0052cc'],
	gold: ['--accent-border', '#9c7c00', '#fde74c'], // the site's yellow, darkened on light
	red: ['--danger', '#a33330', '#e66a67'], // red suits
	green: ['--success', '#47730e', '#9bc53d'],
};
const ROLE_NAMES = Object.keys(ROLES);

// The active palette: role → colour string. Reassigned per variant before generating.
let C = {};
const resolved = (i) => Object.fromEntries(ROLE_NAMES.map((k) => [k, ROLES[k][i]]));
const themed = () => Object.fromEntries(ROLE_NAMES.map((k) => [k, `var(--okt-${k})`]));

// Themed files map each role to the page's token, falling back to the token's own value
// when the page has none (a file opened alone follows the system colour scheme). On the
// site, the page's [data-theme] wins over the system scheme, since the token is defined.
const THEME_CSS =
	'.okt-card{' + ROLE_NAMES.map((k) => `--okt-${k}:var(${ROLES[k][0]},${ROLES[k][1]})`).join(';') + '}' +
	'@media (prefers-color-scheme:dark){.okt-card{' + ROLE_NAMES.map((k) => `--okt-${k}:var(${ROLES[k][0]},${ROLES[k][2]})`).join(';') + '}}';

const n = (v) => +v.toFixed(2);

// ---------- geometry ----------

// Regular octagon, circumradius r. rot = 22.5 gives flat sides on the axes.
function octPoints(cx, cy, r, rot = 22.5) {
	const p = [];
	for (let k = 0; k < 8; k++) {
		const a = ((rot + k * 45) * Math.PI) / 180;
		p.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
	}
	return p;
}
const polyD = (pts, close = true) =>
	pts.map((p, i) => (i ? 'L' : 'M') + n(p[0]) + ' ' + n(p[1])).join('') + (close ? 'Z' : '');
const octD = (cx, cy, r, rot) => polyD(octPoints(cx, cy, r, rot));

// Rectangle with 45° chamfered corners (the card frame).
function chamferD(x0, y0, x1, y1, c) {
	return polyD([[x0 + c, y0], [x1 - c, y0], [x1, y0 + c], [x1, y1 - c], [x1 - c, y1], [x0 + c, y1], [x0, y1 - c], [x0, y0 + c]]);
}

// 4.8.8 truncated-square tiling: regular octagons on a square grid whose pitch equals
// the octagon's width across flats; the square gaps are the tiling's squares. One
// octagon is centred on (CX, CY), so the pattern is 180°-symmetric about the card centre.
function latticeD(pitch, x0, y0, x1, y1) {
	const r = pitch / 2 / Math.cos(Math.PI / 8);
	let d = '';
	const kx = Math.ceil((CX - x0) / pitch) + 1, ky = Math.ceil((CY - y0) / pitch) + 1;
	for (let i = -kx; i <= kx; i++)
		for (let j = -ky; j <= ky; j++) {
			const x = CX + i * pitch, y = CY + j * pitch;
			if (x + pitch < x0 || x - pitch > x1 || y + pitch < y0 || y - pitch > y1) continue;
			d += octD(x, y, r);
		}
	return d;
}

// ---------- suits (unit box ±50, filled) ----------

const SUIT_D = {
	S: 'M0 -48C-10 -32 -48 -12 -48 12C-48 30 -32 38 -20 38C-10 38 -4 32 -2 28C-4 38 -10 46 -18 50L18 50C10 46 4 38 2 28C4 32 10 38 20 38C32 38 48 30 48 12C48 -12 10 -32 0 -48Z',
	H: 'M0 46C-10 32 -48 10 -48 -16C-48 -36 -33 -46 -21 -46C-9 -46 -2 -37 0 -28C2 -37 9 -46 21 -46C33 -46 48 -36 48 -16C48 10 10 32 0 46Z',
	D: 'M0 -50L38 0L0 50L-38 0Z',
	C: 'M-4 18A21 21 0 1 1 -14 -10A21 21 0 1 1 14 -10A21 21 0 1 1 4 18C4 32 10 44 18 50L-18 50C-10 44 -4 32 -4 18Z',
};
const SUITS = ['S', 'H', 'D', 'C'];
const isRed = (s) => s === 'H' || s === 'D';

function pip(suit, x, y, size, color, flip = false) {
	const t = `translate(${n(x)} ${n(y)})${flip ? ' rotate(180)' : ''} scale(${n(size / 100)})`;
	return `<path d="${SUIT_D[suit]}" transform="${t}" fill="${color}"/>`;
}

// ---------- lettering: octagonal stroke glyphs, 40×60 box, 45° chamfers ----------
// Drawn as paths so every file renders the same with no font installed.

const OCT_O = [[10, 0], [30, 0], [40, 10], [40, 50], [30, 60], [10, 60], [0, 50], [0, 10], [10, 0]];
const GLYPHS = {
	A: [[[0, 60], [0, 15], [15, 0], [25, 0], [40, 15], [40, 60]], [[0, 36], [40, 36]]],
	2: [[[0, 10], [10, 0], [30, 0], [40, 10], [40, 24], [0, 52], [0, 60], [40, 60]]],
	3: [[[0, 10], [10, 0], [30, 0], [40, 10], [40, 22], [32, 30], [40, 38], [40, 50], [30, 60], [10, 60], [0, 50]], [[14, 30], [32, 30]]],
	4: [[[30, 60], [30, 0], [0, 40], [40, 40]]],
	5: [[[40, 0], [0, 0], [0, 26], [30, 26], [40, 36], [40, 50], [30, 60], [10, 60], [0, 50]]],
	6: [[[40, 8], [32, 0], [10, 0], [0, 10], [0, 50], [10, 60], [30, 60], [40, 50], [40, 36], [30, 26], [0, 26]]],
	7: [[[0, 0], [40, 0], [40, 10], [14, 60]]],
	8: [[[10, 30], [0, 20], [0, 10], [10, 0], [30, 0], [40, 10], [40, 20], [30, 30], [10, 30], [0, 40], [0, 50], [10, 60], [30, 60], [40, 50], [40, 40], [30, 30]]],
	9: [[[0, 52], [8, 60], [30, 60], [40, 50], [40, 10], [30, 0], [10, 0], [0, 10], [0, 24], [10, 34], [40, 34]]],
	1: [[[0, 10], [10, 0], [10, 60]]],
	0: [OCT_O],
	O: [OCT_O],
	J: [[[12, 0], [40, 0], [40, 50], [30, 60], [10, 60], [0, 50], [0, 40]]],
	Q: [OCT_O, [[24, 44], [42, 62]]],
	K: [[[0, 0], [0, 60]], [[40, 0], [10, 30], [40, 60]], [[0, 30], [10, 30]]],
	E: [[[40, 0], [0, 0], [0, 60], [40, 60]], [[0, 30], [30, 30]]],
	R: [[[0, 60], [0, 0], [30, 0], [40, 10], [40, 22], [30, 32], [0, 32]], [[18, 32], [40, 60]]],
};
const glyphWidth = (ch) => (ch === '1' ? 10 : 40);

// Text as one stroked path, centred on cx, top at y, `h` tall.
function lettering(text, cx, y, h, color, weight = 9) {
	const s = h / 60, gap = 10;
	const width = [...text].reduce((w, ch, i) => w + glyphWidth(ch) + (i ? gap : 0), 0);
	let x = 0, d = '';
	for (const ch of text) {
		for (const line of GLYPHS[ch]) d += polyD(line.map(([px, py]) => [x + px, py]), false);
		x += glyphWidth(ch) + gap;
	}
	const t = `translate(${n(cx - (width * s) / 2)} ${n(y)}) scale(${n(s)})`;
	return `<path d="${d}" transform="${t}" fill="none" stroke="${color}" stroke-width="${weight}" stroke-linejoin="miter" stroke-linecap="square"/>`;
}

// ---------- card scaffolding ----------

const svg = (defs, body) =>
	`<svg xmlns="http://www.w3.org/2000/svg" class="okt-card" viewBox="0 0 ${W} ${H}" width="${W / 10}mm" height="${H / 10}mm">` +
	`<defs>${C.blue.startsWith('var(') ? `<style>${THEME_CSS}</style>` : ''}${defs}</defs>${body}</svg>\n`;

const cardShape = (fill, stroke) =>
	`<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="${RADIUS}" fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width="2"` : ''}/>`;

// Wide dim stroke under a thin bright one: the library's glow, no blur filters.
const glow = (d, paint, w = 2, extra = '') =>
	`<path d="${d}" fill="none" stroke="${paint}" stroke-width="${w * 4}" stroke-opacity=".16" stroke-linejoin="round"${extra}/>` +
	`<path d="${d}" fill="none" stroke="${paint}" stroke-width="${w}" stroke-linejoin="round"${extra}/>`;

// Frame sits between the index columns; the corners stay clear for the indices.
const FRAME = [100, 36, 530, 844];
const frame = () =>
	`<path d="${chamferD(...FRAME, 56)}" fill="none" stroke="${C.blue}" stroke-opacity=".45" stroke-width="2"/>` +
	`<path d="${chamferD(FRAME[0] + 9, FRAME[1] + 9, FRAME[2] - 9, FRAME[3] - 9, 52)}" fill="none" stroke="${C.blue}" stroke-opacity=".18" stroke-width="1.5"/>`;

// Top-left index, and the same rotated 180° into the bottom-right corner.
function indices(rank, suit, color) {
	const one = lettering(rank, 56, 40, 58, color) + pip(suit, 56, 146, 44, color);
	return one + `<g transform="rotate(180 ${CX} ${CY})">${one}</g>`;
}

// ---------- number cards ----------

const COL = { L: 205, M: 315, R: 425 };
const ROW0 = 176, ROW1 = 704;
const LAYOUT = {
	2: [['M', 0], ['M', 1]],
	3: [['M', 0], ['M', 0.5], ['M', 1]],
	4: [['L', 0], ['R', 0], ['L', 1], ['R', 1]],
	5: [['L', 0], ['R', 0], ['M', 0.5], ['L', 1], ['R', 1]],
	6: [['L', 0], ['R', 0], ['L', 0.5], ['R', 0.5], ['L', 1], ['R', 1]],
	7: [['L', 0], ['R', 0], ['M', 0.25], ['L', 0.5], ['R', 0.5], ['L', 1], ['R', 1]],
	8: [['L', 0], ['R', 0], ['M', 0.25], ['L', 0.5], ['R', 0.5], ['M', 0.75], ['L', 1], ['R', 1]],
	9: [['L', 0], ['R', 0], ['L', 1 / 3], ['R', 1 / 3], ['M', 0.5], ['L', 2 / 3], ['R', 2 / 3], ['L', 1], ['R', 1]],
	10: [['L', 0], ['R', 0], ['M', 1 / 6], ['L', 1 / 3], ['R', 1 / 3], ['L', 2 / 3], ['R', 2 / 3], ['M', 5 / 6], ['L', 1], ['R', 1]],
};

function numberCard(rank, suit) {
	const color = isRed(suit) ? C.red : C.ink;
	const clip = `<clipPath id="in"><path d="${chamferD(...FRAME, 56)}"/></clipPath>`;
	const watermark = `<path d="${latticeD(70, ...FRAME)}" clip-path="url(#in)" fill="none" stroke="${C.blue}" stroke-opacity=".07" stroke-width="1.5"/>`;
	const pips = LAYOUT[rank].map(([c, t]) => pip(suit, COL[c], ROW0 + t * (ROW1 - ROW0), 92, color, t > 0.5)).join('');
	return svg(clip, cardShape(C.paper, C.edge) + watermark + frame() + pips + indices(String(rank), suit, color));
}

// ---------- aces ----------

// Brand mark: a regular octagon ring (from oktagonbet.partners/brand/icon.svg). Its
// geometric centre is (57.714, 57.714), not the 116-box centre, and the scale is left
// unrounded: either error shifts the mark off-centre and breaks the back's 180° symmetry
// (measured: pixel diff of the back against itself rotated).
const LOGO_C = 57.714;
const LOGO_D ='m57.714 0 40.905 16.81 16.809 40.904L98.619 98.62l-40.905 16.808L16.808 98.62 0 57.714 16.808 16.81zm0 20.552-26.183 10.98-10.98 26.182 10.98 26.184 26.183 10.98 26.183-10.98 10.98-26.184-10.98-26.183z';
const logo = (cx, cy, size, fill) =>
	`<path d="${LOGO_D}" fill-rule="evenodd" fill="${fill}" transform="translate(${cx} ${cy}) scale(${size / 116}) translate(${-LOGO_C} ${-LOGO_C})"/>`;

function aceCard(suit) {
	const color = isRed(suit) ? C.red : C.ink;
	const grad = `<linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.blue}"/><stop offset="1" stop-color="${C.ink}"/></linearGradient>`;
	let art;
	if (suit === 'S') {
		// Ace of spades carries the brand mark.
		art = logo(CX, CY, 380, C.blue) + pip('S', CX, CY, 150, C.ink);
	} else {
		art = [200, 178, 156].map((r, i) => `<path d="${octD(CX, CY, r)}" fill="none" stroke="url(#g)" stroke-width="${i ? 1.5 : 3}"/>`).join('') +
			pip(suit, CX, CY, 190, color);
	}
	return svg(grad, cardShape(C.paper, C.edge) + frame() + art + indices('A', suit, color));
}

// ---------- court cards ----------

// Double-headed figures, everything built on the number 8: an octagon head, an eight-point
// star (octagram) for a halo, and one attribute each — the king's sceptre ends in an
// octagram, the queen holds an eight-petal flower, the jack a spear with an octagon guard.
// The half-figure is drawn above the centre line and repeated rotated 180°.


// {8/2} star: 16 points alternating between outer radius R and inner radius r.
function starD(cx, cy, R, r, rot = -90) {
	const p = [];
	for (let k = 0; k < 16; k++) {
		const a = ((rot + k * 22.5) * Math.PI) / 180, rr = k % 2 ? r : R;
		p.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]);
	}
	return polyD(p);
}
const shape = (d, fill, stroke = C.ink, w = 2, fillOpacity) =>
	`<path d="${d}" fill="${fill}"${fillOpacity ? ` fill-opacity="${fillOpacity}"` : ''} stroke="${stroke}" stroke-width="${w}" stroke-linejoin="round"/>`;
const line = (pts, stroke = C.ink, w = 2) =>
	`<path d="${polyD(pts, false)}" fill="none" stroke="${stroke}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;

// Eight petals round a centre: each a chamfered diamond turned by 45°.
function flower(cx, cy, len, fill) {
	let s = '';
	for (let k = 0; k < 8; k++) {
		const t = `rotate(${k * 45} ${cx} ${cy})`;
		s += `<path d="${polyD([[cx, cy], [cx + len * 0.32, cy - len * 0.45], [cx, cy - len], [cx - len * 0.32, cy - len * 0.45]])}" transform="${t}" fill="${fill}" stroke="${C.gold}" stroke-width="1.6" stroke-linejoin="round"/>`;
	}
	return s + shape(octD(cx, cy, len * 0.26), C.gold, C.gold, 1);
}

const HEAD = [315, 236], HEAD_R = 44;

function figure(rank, suit) {
	const garment = isRed(suit) ? C.red : C.deep;
	const [hx, hy] = HEAD;
	let s = '';

	// Halo: an octagram behind the head.
	s += `<g opacity=".55">${glow(starD(hx, hy - 6, 92, 62), C.gold, 1.4)}</g>`;

	// Attribute, held on the free side.
	// Sleeve from the shoulder to an octagon hand on the attribute.
	const hand = (x) => {
		const e = x < CX ? 222 : 408;
		return shape(polyD([[e, 336], [x, 340], [x, 358], [e, 368]]), garment, C.ink, 1.8) + shape(octD(x, 349, 11), C.raised, C.ink, 1.8);
	};
	if (rank === 'K') {
		s += line([[438, 440], [438, 176]], C.gold, 4);
		s += glow(starD(438, 156, 26, 13), C.gold, 2) + shape(octD(438, 156, 7), C.gold, C.gold, 1);
		s += hand(438);
	} else if (rank === 'Q') {
		s += line([[192, 440], [192, 250]], C.green, 3);
		s += `<path d="M192 330C172 318 166 300 170 288C184 296 192 310 192 330Z" fill="${C.green}" fill-opacity=".35" stroke="${C.green}" stroke-width="1.6"/>`;
		s += flower(192, 232, 30, garment);
		s += hand(192);
	} else {
		s += line([[192, 440], [192, 156]], C.ink, 3.5);
		s += shape(polyD([[192, 118], [202, 148], [192, 158], [182, 148]]), C.gold, C.gold, 1.5);
		s += glow(octD(192, 170, 15), C.gold, 2.2);
		s += hand(192);
	}

	// Shoulders and robe, with an inner trim line and a suit medallion on the chest.
	s += shape(chamferD(222, 312, 408, 470, 40), garment, C.ink, 2.4);
	s += `<path d="${polyD([[236, 440], [236, 358], [268, 326], [362, 326], [394, 358], [394, 440]], false)}" fill="none" stroke="${C.gold}" stroke-width="1.4" stroke-opacity=".6"/>`;
	s += shape(octD(315, 392, 30), C.panel, C.gold, 2) + pip(suit, 315, 392, 34, isRed(suit) ? C.red : C.ink);

	// Collar.
	if (rank === 'K') {
		// Ermine: a row of small octagons along the shoulder line.
		for (let x = 250; x <= 380; x += 26) s += shape(octD(x, 326, 7), C.paper, C.ink, 1) + shape(octD(x, 326, 2), C.panel, C.panel, 0);
	} else if (rank === 'Q') {
		for (let i = 0; i <= 6; i++) {
			const t = i / 6, x = 272 + t * 86, y = 318 + 26 * (1 - Math.pow(2 * t - 1, 2));
			s += shape(octD(x, y, i === 3 ? 7 : 4.5), C.gold, C.gold, 1);
		}
	} else {
		s += shape(polyD([[266, 312], [315, 356], [364, 312]]), C.panel, C.gold, 2);
	}

	// Hair (queen), neck, face.
	if (rank === 'Q')
		s += shape(polyD([[272, 198], [358, 198], [378, 218], [380, 322], [360, 322], [354, 272], [276, 272], [270, 322], [250, 322], [252, 218]]), C.gold, C.gold, 1.6, 0.45);
	s += shape(polyD([[301, 270], [329, 270], [329, 314], [301, 314]]), C.raised, C.ink, 1.8);
	s += shape(octD(hx, hy, HEAD_R), C.raised, C.ink, 2.4);

	// Features: octagon eyes, a nose, a mouth.
	s += shape(octD(hx - 15, hy - 6, 4.5), C.ink, C.ink, 1) + shape(octD(hx + 15, hy - 6, 4.5), C.ink, C.ink, 1);
	s += line([[hx, hy - 2], [hx - 5, hy + 14], [hx + 2, hy + 14]], C.ink, 1.6);
	if (rank === 'K') {
		s += shape(polyD([[276, 246], [276, 270], [298, 294], [332, 294], [354, 270], [354, 246], [338, 262], [292, 262]]), C.ink, C.ink, 1.6);
		s += line([[298, 258], [315, 252], [332, 258]], C.panel, 2.4);
		s += line([[304, 272], [304, 286]], C.ink, 1.2) + line([[315, 274], [315, 290]], C.ink, 1.2) + line([[326, 272], [326, 286]], C.ink, 1.2);
	} else {
		s += line([[hx - 9, hy + 24], [hx, hy + 28], [hx + 9, hy + 24]], rank === 'Q' ? C.red : C.ink, 2);
	}

	// Headwear.
	if (rank === 'K') {
		s += shape(polyD([[275, 202], [275, 156], [295, 178], [315, 138], [335, 178], [355, 156], [355, 202]]), C.panel, C.gold, 2.4);
		s += line([[275, 190], [355, 190]], C.gold, 1.6);
		for (const [x, y] of [[275, 148], [315, 130], [355, 148]]) s += shape(octD(x, y, 7.5), C.gold, C.gold, 1);
		s += shape(octD(315, 180, 6), C.red, C.gold, 1);
	} else if (rank === 'Q') {
		s += shape(polyD([[282, 200], [290, 178], [302, 190], [315, 168], [328, 190], [340, 178], [348, 200]]), C.panel, C.gold, 2);
		s += shape(octD(315, 160, 7), C.gold, C.gold, 1);
	} else {
		// Beret with a feather and an octagon pin.
		s += shape(polyD([[262, 212], [270, 190], [292, 176], [352, 176], [376, 196], [372, 212]]), garment, C.ink, 2);
		s += `<path d="M350 186C360 156 388 134 420 124C412 148 390 174 350 186Z" fill="${C.gold}" fill-opacity=".35" stroke="${C.gold}" stroke-width="2" stroke-linejoin="round"/>`;
		s += `<path d="M352 184C372 164 394 142 418 126" fill="none" stroke="${C.gold}" stroke-width="1.4"/>`;
		s += shape(octD(334, 192, 7), C.gold, C.gold, 1);
	}
	return s;
}

function courtCard(rank, suit) {
	const color = isRed(suit) ? C.red : C.ink;
	const panel = chamferD(118, 56, 512, 824, 48);
	const defs =
		`<clipPath id="in"><path d="${panel}"/></clipPath>` +
		`<clipPath id="top"><rect x="118" y="56" width="394" height="${CY - 56}"/></clipPath>` +
		`<radialGradient id="g" cx="${CX}" cy="${CY}" r="420" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${C.gold}"/><stop offset="1" stop-color="${C.blue}"/></radialGradient>`;
	const half = `<g clip-path="url(#top)"><g transform="translate(${CX} ${CY}) scale(1.18) translate(${-CX} ${-CY})">${figure(rank, suit)}</g></g>`;
	const body =
		cardShape(C.paper, C.edge) +
		`<path d="${panel}" fill="${C.panel}"/>` +
		`<path d="${latticeD(56, 118, 56, 512, 824)}" clip-path="url(#in)" fill="none" stroke="url(#g)" stroke-opacity=".22" stroke-width="1.2"/>` +
		`<g clip-path="url(#in)">${half}<g transform="rotate(180 ${CX} ${CY})">${half}</g></g>` +
		line([[118, CY], [512, CY]], C.gold, 2) +
		`<path d="${panel}" fill="none" stroke="${C.blue}" stroke-width="3"/>` +
		indices(rank, suit, color);
	return svg(defs, body);
}

// ---------- jokers ----------

// An octagon tunnel: the library's field mode, frozen. Each ring smaller and turned a
// little further, so the rings spiral in toward the vanishing point.
function jokerCard(tone) {
	const warm = tone === 'red';
	const from = warm ? C.gold : C.ink, to = warm ? C.red : C.blue;
	const ink = warm ? C.gold : C.ink;
	const defs = `<radialGradient id="g" cx="${CX}" cy="${CY}" r="300" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></radialGradient>`;
	let tunnel = '';
	for (let i = 0; i < 16; i++) tunnel += glow(octD(CX, CY, 270 * Math.pow(0.84, i), 22.5 + i * 7.5), 'url(#g)', i < 4 ? 2.2 : 1.5);
	const word = (color) => [...'JOKER'].map((ch, i) => lettering(ch, 56, 40 + i * 58, 42, color, 8)).join('');
	const one = word(ink);
	const core = warm ? logo(CX, CY, 64, C.blue) : `<path d="${octD(CX, CY, 20)}" fill="${C.blue}"/>`;
	const body =
		cardShape(C.panel) +
		`<rect x="18" y="18" width="${W - 36}" height="${H - 36}" rx="${RADIUS - 12}" fill="none" stroke="${to}" stroke-opacity=".5" stroke-width="2"/>` +
		tunnel + core + one + `<g transform="rotate(180 ${CX} ${CY})">${one}</g>`;
	return svg(defs, body);
}

// ---------- back ----------

// Full-bleed 4.8.8 lattice, radial yellow→blue, brand mark on a cleared octagon.
// Everything is centred on (CX, CY) and radially coloured, so it is 180°-symmetric:
// the back does not reveal which way up a card is.
function backCard() {
	const inner = [30, 30, W - 30, H - 30];
	const defs =
		`<clipPath id="in"><rect x="${inner[0]}" y="${inner[1]}" width="${inner[2] - inner[0]}" height="${inner[3] - inner[1]}" rx="${RADIUS - 14}"/></clipPath>` +
		`<radialGradient id="g" cx="${CX}" cy="${CY}" r="520" gradientUnits="userSpaceOnUse"><stop offset=".22" stop-color="${C.gold}"/><stop offset=".6" stop-color="${C.blue}"/><stop offset="1" stop-color="${C.deep}"/></radialGradient>`;
	const body =
		cardShape(C.panel) +
		`<g clip-path="url(#in)">${glow(latticeD(64, ...inner), 'url(#g)', 1.6)}</g>` +
		`<rect x="18" y="18" width="${W - 36}" height="${H - 36}" rx="${RADIUS - 10}" fill="none" stroke="${C.blue}" stroke-width="3"/>` +
		`<path d="${octD(CX, CY, 124)}" fill="${C.panel}"/>` +
		glow(octD(CX, CY, 124), C.gold, 2.4) +
		glow(octD(CX, CY, 108), C.gold, 1.2) +
		logo(CX, CY, 150, C.blue);
	return svg(defs, body);
}

// ---------- write ----------

// Several cards inlined into one page share a single id namespace: prefix every id with
// the card code. And CSS var() is not valid in presentation attributes, only in CSS, so
// themed colours move from fill="…" into style="fill:…".
function finish(code, content) {
	return content
		.replace(/id="([^"]+)"/g, `id="okt-${code}-$1"`)
		.replace(/url\(#([^)]+)\)/g, `url(#okt-${code}-$1)`)
		.replace(/<([a-zA-Z]+)([^>]*?)(\/?)>/g, (m, tag, attrs, close) => {
			const moved = [];
			attrs = attrs.replace(/\s(fill|stroke|stop-color)="(var\([^"]*\))"/g, (_, k, v) => (moved.push(`${k}:${v}`), ''));
			return moved.length ? `<${tag}${attrs} style="${moved.join(';')}"${close}>` : m;
		});
}

const CODES = [];
for (const s of SUITS) CODES.push('A' + s, ...[2, 3, 4, 5, 6, 7, 8, 9, 10].map((r) => r + s), 'J' + s, 'Q' + s, 'K' + s);
CODES.push('joker-red', 'joker-black', 'back');

function card(code) {
	if (code === 'back') return backCard();
	if (code.startsWith('joker-')) return jokerCard(code.slice(6));
	const rank = code.slice(0, -1), suit = code.slice(-1);
	if (rank === 'A') return aceCard(suit);
	if ('JQK'.includes(rank)) return courtCard(rank, suit);
	return numberCard(+rank, suit);
}

const VARIANTS = { '': themed(), light: resolved(1), dark: resolved(2) };
for (const [dir, palette] of Object.entries(VARIANTS)) {
	C = palette;
	mkdirSync(join(OUT, dir), { recursive: true });
	for (const code of CODES) writeFileSync(join(OUT, dir, code + '.svg'), finish(code, card(code)));
}
const manifest = { variants: { themed: '', light: 'light/', dark: 'dark/' }, cards: Object.fromEntries(CODES.map((c) => [c, c + '.svg'])) };
writeFileSync(join(OUT, 'manifest.json'), JSON.stringify(manifest, null, '\t') + '\n');

// Self-check: every number card carries its rank in pips (plus 2 index pips).
for (const s of SUITS)
	for (let r = 2; r <= 10; r++) {
		const count = numberCard(r, s).split(SUIT_D[s]).length - 1;
		if (count !== r + 2) throw new Error(`${r}${s}: ${count - 2} pips, expected ${r}`);
	}
console.log(`${CODES.length} cards × ${Object.keys(VARIANTS).length} variants → ${OUT}`);
