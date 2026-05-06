export const CATEGORIES = {
  NUMBER_SEQUENCE: 'number_sequence',
  PATTERN_MATRIX:  'pattern_matrix',
  VERBAL_ANALOGY:  'verbal_analogy',
  LOGICAL:         'logical',
  SPATIAL:         'spatial',
};

export const CATEGORY_LABELS = {
  number_sequence: 'Number Sequences',
  pattern_matrix:  'Pattern Matrices',
  verbal_analogy:  'Verbal Analogies',
  logical:         'Logical Reasoning',
  spatial:         'Spatial Reasoning',
};

export const CATEGORY_ICONS = {
  number_sequence: '🔢',
  pattern_matrix:  '🔲',
  verbal_analogy:  '🔤',
  logical:         '🧩',
  spatial:         '🔷',
};

/* ─────────────────────────────────────────────────────────────
   Visual helpers for matrix questions
   ───────────────────────────────────────────────────────────── */
function matrix(rows) {
  const trs = rows.map(cells => {
    const tds = cells.map(c =>
      `<td${c.q ? ' class="matrix-q"' : ''}>${c.v}</td>`
    ).join('');
    return `<tr>${tds}</tr>`;
  });
  return `<table class="matrix-table">${trs.join('')}</table>`;
}

const q = { v: '?', q: true };
const c = v => ({ v });

/* ─────────────────────────────────────────────────────────────
   Question bank — 30 questions, 6 per category, diff 1-3
   ───────────────────────────────────────────────────────────── */
export const QUESTIONS = [

  /* ══════════════════ NUMBER SEQUENCES ══════════════════════ */
  {
    id: 1,
    category: CATEGORIES.NUMBER_SEQUENCE,
    difficulty: 1,
    question: 'What number comes next?\n\n2,  4,  8,  16,  ___',
    visual: null,
    options: ['20', '24', '28', '32'],
    correct: 3,
  },
  {
    id: 2,
    category: CATEGORIES.NUMBER_SEQUENCE,
    difficulty: 1,
    question: 'What number comes next?\n\n1,  1,  2,  3,  5,  8,  ___',
    visual: null,
    options: ['10', '11', '12', '13'],
    correct: 3,
  },
  {
    id: 3,
    category: CATEGORIES.NUMBER_SEQUENCE,
    difficulty: 2,
    question: 'What number comes next?\n\n81,  27,  9,  3,  ___',
    visual: null,
    options: ['0', '1', '2', '3'],
    correct: 1,
  },
  {
    id: 4,
    category: CATEGORIES.NUMBER_SEQUENCE,
    difficulty: 2,
    question: 'What number comes next?\n\n1,  4,  9,  16,  25,  ___',
    visual: null,
    options: ['30', '32', '35', '36'],
    correct: 3,
  },
  {
    id: 5,
    category: CATEGORIES.NUMBER_SEQUENCE,
    difficulty: 3,
    question: 'What number comes next?\n\n2,  6,  12,  20,  30,  ___',
    visual: null,
    options: ['38', '40', '42', '44'],
    correct: 2,
  },
  {
    id: 6,
    category: CATEGORIES.NUMBER_SEQUENCE,
    difficulty: 3,
    question: 'What number comes next?\n\n3,  5,  9,  15,  23,  ___',
    visual: null,
    options: ['29', '31', '33', '35'],
    correct: 2,
  },

  /* ══════════════════ PATTERN MATRICES ══════════════════════ */
  {
    id: 7,
    category: CATEGORIES.PATTERN_MATRIX,
    difficulty: 1,
    question: 'Which symbol completes the pattern?',
    visual: matrix([
      [c('●'), c('■'), c('▲')],
      [c('■'), c('▲'), c('●')],
      [c('▲'), c('●'), q],
    ]),
    options: ['●', '▲', '■', '◆'],
    correct: 2,
  },
  {
    id: 8,
    category: CATEGORIES.PATTERN_MATRIX,
    difficulty: 1,
    question: 'Which option completes the pattern?',
    visual: matrix([
      [c('●'), c('● ●'), c('● ● ●')],
      [c('■'), c('■ ■'), c('■ ■ ■')],
      [c('▲'), c('▲ ▲'), q],
    ]),
    options: ['▲', '▲ ▲', '▲ ▲ ▲', '▲ ▲ ▲ ▲'],
    correct: 2,
  },
  {
    id: 9,
    category: CATEGORIES.PATTERN_MATRIX,
    difficulty: 2,
    question: 'What value replaces the question mark?',
    visual: matrix([
      [c('2'),  c('4'),  c('8')],
      [c('3'),  c('9'),  c('27')],
      [c('4'),  c('16'), q],
    ]),
    options: ['48', '56', '64', '72'],
    correct: 2,
  },
  {
    id: 10,
    category: CATEGORIES.PATTERN_MATRIX,
    difficulty: 2,
    question: 'What value replaces the question mark?',
    visual: matrix([
      [c('5'),  c('10'), c('20')],
      [c('7'),  c('14'), c('28')],
      [c('9'),  c('18'), q],
    ]),
    options: ['34', '36', '38', '40'],
    correct: 1,
  },
  {
    id: 11,
    category: CATEGORIES.PATTERN_MATRIX,
    difficulty: 3,
    question: 'What value replaces the question mark?\n(Hint: look at the numbers carefully)',
    visual: matrix([
      [c('2'),  c('3'),  c('5')],
      [c('7'),  c('11'), c('13')],
      [c('17'), c('19'), q],
    ]),
    options: ['21', '22', '23', '24'],
    correct: 2,
  },
  {
    id: 12,
    category: CATEGORIES.PATTERN_MATRIX,
    difficulty: 3,
    question: 'What value replaces the question mark?',
    visual: matrix([
      [c('1'),  c('2'),  c('4')],
      [c('3'),  c('6'),  c('12')],
      [c('5'),  c('10'), q],
    ]),
    options: ['15', '18', '20', '25'],
    correct: 2,
  },

  /* ══════════════════ VERBAL ANALOGIES ═══════════════════════ */
  {
    id: 13,
    category: CATEGORIES.VERBAL_ANALOGY,
    difficulty: 1,
    question: 'Hot is to Cold\nas\nDay is to ___',
    visual: null,
    options: ['Dawn', 'Night', 'Sun', 'Dusk'],
    correct: 1,
  },
  {
    id: 14,
    category: CATEGORIES.VERBAL_ANALOGY,
    difficulty: 1,
    question: 'Book is to Library\nas\nPainting is to ___',
    visual: null,
    options: ['Canvas', 'Artist', 'Museum', 'Gallery'],
    correct: 2,
  },
  {
    id: 15,
    category: CATEGORIES.VERBAL_ANALOGY,
    difficulty: 2,
    question: 'Physician is to Patient\nas\nLawyer is to ___',
    visual: null,
    options: ['Judge', 'Client', 'Jury', 'Defendant'],
    correct: 1,
  },
  {
    id: 16,
    category: CATEGORIES.VERBAL_ANALOGY,
    difficulty: 2,
    question: 'Ignorance is to Education\nas\nDisease is to ___',
    visual: null,
    options: ['Hospital', 'Illness', 'Medicine', 'Doctor'],
    correct: 2,
  },
  {
    id: 17,
    category: CATEGORIES.VERBAL_ANALOGY,
    difficulty: 3,
    question: 'Archipelago is to Island\nas\nConstellation is to ___',
    visual: null,
    options: ['Galaxy', 'Planet', 'Star', 'Universe'],
    correct: 2,
  },
  {
    id: 18,
    category: CATEGORIES.VERBAL_ANALOGY,
    difficulty: 3,
    question: 'Sycophant is to Flatter\nas\nIconoclast is to ___',
    visual: null,
    options: ['Worship', 'Protest', 'Challenge traditions', 'Create art'],
    correct: 2,
  },

  /* ══════════════════ LOGICAL REASONING ═════════════════════ */
  {
    id: 19,
    category: CATEGORIES.LOGICAL,
    difficulty: 1,
    question: 'Which one does NOT belong?\n\nApple  ·  Orange  ·  Banana  ·  Carrot  ·  Grape',
    visual: null,
    options: ['Apple', 'Orange', 'Carrot', 'Grape'],
    correct: 2,
  },
  {
    id: 20,
    category: CATEGORIES.LOGICAL,
    difficulty: 1,
    question: 'Which number does NOT belong?\n\n36  ·  49  ·  64  ·  80  ·  100',
    visual: null,
    options: ['36', '49', '80', '100'],
    correct: 2,
  },
  {
    id: 21,
    category: CATEGORIES.LOGICAL,
    difficulty: 2,
    question: 'All mammals are warm-blooded.\nAll whales are mammals.\n\nWhich conclusion is DEFINITELY true?',
    visual: null,
    options: [
      'All warm-blooded animals are mammals',
      'All whales are warm-blooded',
      'All warm-blooded animals are whales',
      'Some whales are not warm-blooded',
    ],
    correct: 1,
  },
  {
    id: 22,
    category: CATEGORIES.LOGICAL,
    difficulty: 2,
    question: 'Which instrument does NOT belong?\n\nSitar  ·  Violin  ·  Tabla  ·  Cello  ·  Guitar',
    visual: null,
    options: ['Sitar', 'Violin', 'Tabla', 'Cello'],
    correct: 2,
  },
  {
    id: 23,
    category: CATEGORIES.LOGICAL,
    difficulty: 3,
    question: 'Five friends sit in a row of 5 numbered seats.\n\nBen is in seat 5. Amy is directly left of Ben (seat 4). Cal sits between Dan and Eve. Dan is NOT in seat 1 or 5.\n\nWhich seat is Eve in?',
    visual: null,
    options: ['Seat 1', 'Seat 2', 'Seat 3', 'Seat 4'],
    correct: 0,
  },
  {
    id: 24,
    category: CATEGORIES.LOGICAL,
    difficulty: 3,
    question: 'Three suspects are questioned. Exactly one person is lying.\n\nAdam says: "Ben is guilty."\nBen says: "Carol is guilty."\nCarol says: "Ben is lying."\n\nWho committed the crime?',
    visual: null,
    options: ['Adam', 'Ben', 'Carol', 'Cannot be determined'],
    correct: 1,
  },

  /* ══════════════════ SPATIAL REASONING ═════════════════════ */
  {
    id: 25,
    category: CATEGORIES.SPATIAL,
    difficulty: 1,
    question: 'A square piece of paper is folded in half (one fold). A hole is punched through both layers. When the paper is unfolded, how many holes are there?',
    visual: null,
    options: ['1', '2', '3', '4'],
    correct: 1,
  },
  {
    id: 26,
    category: CATEGORIES.SPATIAL,
    difficulty: 1,
    question: 'A clock shows 3:00. What does its mirror image show?\n(The mirror is placed to the right of the clock)',
    visual: null,
    options: ['3:00', '9:00', '6:00', '12:00'],
    correct: 1,
  },
  {
    id: 27,
    category: CATEGORIES.SPATIAL,
    difficulty: 2,
    question: 'If you look at the letter "d" in a mirror, what letter does it most resemble?',
    visual: null,
    options: ['b', 'p', 'q', 'g'],
    correct: 0,
  },
  {
    id: 28,
    category: CATEGORIES.SPATIAL,
    difficulty: 2,
    question: 'A large cube is painted red on all faces, then cut into 27 equal smaller cubes (3×3×3 grid). How many small cubes have paint on exactly 2 faces?',
    visual: null,
    options: ['8', '12', '16', '24'],
    correct: 1,
  },
  {
    id: 29,
    category: CATEGORIES.SPATIAL,
    difficulty: 3,
    question: 'A 3D solid has exactly 6 faces, 12 edges, and 8 vertices.\n\nWhich shape is it?\n(Euler\'s formula: Vertices − Edges + Faces = 2)',
    visual: null,
    options: ['Sphere', 'Cube', 'Tetrahedron', 'Cylinder'],
    correct: 1,
  },
  {
    id: 30,
    category: CATEGORIES.SPATIAL,
    difficulty: 3,
    question: 'A rectangular box has dimensions 3 × 4 × 5 units.\n\nWhat is the length of its space diagonal — the line connecting two opposite corners through the interior?',
    visual: null,
    options: ['√41  ≈ 6.4', '√50  ≈ 7.1', '√52  ≈ 7.2', '√60  ≈ 7.7'],
    correct: 1,
  },
];
