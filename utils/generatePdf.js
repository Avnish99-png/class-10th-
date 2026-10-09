const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const PRIVATE_DIR = path.join(__dirname, '..', 'private');
const PDF_PATH = path.join(PRIVATE_DIR, 'ebook.pdf');

if (!fs.existsSync(PRIVATE_DIR)) {
  fs.mkdirSync(PRIVATE_DIR, { recursive: true });
}

function generateClass10Ebook() {
  console.log('Generating Class 10 Maths Made Easy 20-page PDF...');

  const doc = new PDFDocument({
    size: 'A4',
    margin: 40,
    info: {
      Title: 'Class 10 Maths Made Easy - CBSE Board Exam Edition 2026/27',
      Author: 'Think Unlimited',
      Subject: 'Class 10 CBSE Maths Revision, Formulas, Shortcut Tricks, Solved Examples & Marks Bachao Alerts',
      Keywords: 'CBSE, Class 10, Maths, Formulas, Revision, Board Exam 2026 2027',
      CreationDate: new Date()
    }
  });

  const writeStream = fs.createWriteStream(PDF_PATH);
  doc.pipe(writeStream);

  const navy = '#0B1B3A';
  const yellow = '#FFC700';
  const redAlert = '#D32F2F';
  const greenCheck = '#2E7D32';
  const charcoal = '#222222';
  const lightBg = '#FFFDF5';

  function drawHeader(pageNum, title) {
    if (pageNum === 1) return;
    doc.save();
    doc.rect(40, 20, 515, 24).fill('#0B1B3A');
    doc.fillColor('#FFFDF5').fontSize(9).font('Helvetica-Bold')
       .text('THINK UNLIMITED  |  Class 10 Maths Made Easy (CBSE 2026/27)', 50, 27);
    doc.fillColor('#FFC700').fontSize(9).font('Helvetica-Bold')
       .text(`Page ${pageNum} of 20`, 480, 27, { align: 'right' });
    doc.restore();

    doc.save();
    doc.strokeColor('#CCCCCC').lineWidth(0.5)
       .moveTo(40, 790).lineTo(555, 790).stroke();
    doc.fillColor('#777777').fontSize(8).font('Helvetica')
       .text('Marks Bachao Revision Series  •  NCERT Companion Guide', 40, 795);
    doc.text('Helpline: +91 9243791529', 420, 795, { align: 'right' });
    doc.restore();
  }

  function addChapterHeader(chNum, chName, weightage) {
    doc.save();
    doc.rect(40, 55, 515, 32).fill('#FFF9D2');
    doc.rect(40, 55, 6, 32).fill(yellow);
    doc.fillColor(navy).fontSize(14).font('Helvetica-Bold')
       .text(`Chapter ${chNum}: ${chName}`, 55, 64);
    if (weightage) {
      doc.fillColor(navy).fontSize(9).font('Helvetica-Bold')
         .text(`Expected Marks: ${weightage}`, 430, 66, { align: 'right' });
    }
    doc.restore();
  }

  function addSectionBox(title, contentArray, yPos, color = navy) {
    doc.save();
    doc.fontSize(11).font('Helvetica-Bold').fillColor(color).text(title, 45, yPos);
    let curY = yPos + 16;
    doc.fontSize(9.5).font('Helvetica').fillColor(charcoal);
    contentArray.forEach(item => {
      doc.text(`• ${item}`, 50, curY, { width: 500, lineGap: 3 });
      curY = doc.y + 4;
    });
    doc.restore();
    return doc.y + 6;
  }

  function addAlertBox(text, yPos) {
    doc.save();
    doc.rect(45, yPos, 505, 42).fill('#FFEBEE');
    doc.rect(45, yPos, 4, 42).fill(redAlert);
    doc.fillColor(redAlert).fontSize(10).font('Helvetica-Bold')
       .text('⚠️ MARKS BACHAO ALERT (Common Board Mistake):', 55, yPos + 6);
    doc.fillColor(charcoal).fontSize(9).font('Helvetica')
       .text(text, 55, yPos + 22, { width: 485 });
    doc.restore();
    return yPos + 50;
  }

  // ================= PAGE 1: COVER PAGE =================
  doc.rect(0, 0, 595, 842).fill(navy);
  
  // Cover border
  doc.rect(20, 20, 555, 802).lineWidth(2).strokeColor(yellow).stroke();
  doc.rect(25, 25, 545, 792).lineWidth(0.5).strokeColor('#FFFFFF').stroke();

  doc.fillColor(yellow).fontSize(13).font('Helvetica-Bold')
     .text('THINK UNLIMITED PRESENTS', 50, 80, { align: 'center', characterSpacing: 2 });
  
  doc.fillColor('#FFFFFF').fontSize(32).font('Helvetica-Bold')
     .text('CLASS 10 MATHS', 50, 120, { align: 'center' });
  doc.fillColor(yellow).fontSize(30).font('Helvetica-Bold')
     .text('MADE EASY', 50, 160, { align: 'center' });

  doc.fillColor('#E0E0E0').fontSize(14).font('Helvetica')
     .text('CBSE Board Exam Edition 2026/27', 50, 210, { align: 'center' });

  // Badge
  doc.save();
  doc.circle(297, 300, 55).fill(yellow);
  doc.fillColor(navy).fontSize(20).font('Helvetica-Bold')
     .text('80/80', 250, 280, { width: 95, align: 'center' });
  doc.fontSize(9).font('Helvetica-Bold')
     .text('TARGET SCORE', 250, 305, { width: 95, align: 'center' });
  doc.restore();

  doc.fillColor('#FFFFFF').fontSize(16).font('Helvetica-Bold')
     .text('"Maths se darr? Ab nahi."', 50, 390, { align: 'center' });
  doc.fillColor(yellow).fontSize(13).font('Helvetica')
     .text('Formula • Trick • Example — Sab ek hi jagah', 50, 415, { align: 'center' });

  doc.save();
  doc.rect(80, 460, 435, 140).lineWidth(1).strokeColor('#4A6999').fill('#13274F');
  doc.fillColor('#FFFFFF').fontSize(11).font('Helvetica-Bold')
     .text('WHAT IS INSIDE THIS 20-PAGE BLUEPRINT:', 100, 475);
  doc.fontSize(10).font('Helvetica').fillColor('#E2E8F0')
     .text('✓ All 14 NCERT Chapters mapped to CBSE 2026/27 syllabus', 105, 498)
     .text('✓ 100% Formulas with "When-to-Apply" conditions', 105, 518)
     .text('✓ Shortcut Tricks & Vedic cross-checks for MCQs', 105, 538)
     .text('✓ "Marks Bachao" alerts: Top mistakes students make', 105, 558)
     .text('✓ 3-Hour Exam Day Time Management & Step-marking guide', 105, 578);
  doc.restore();

  doc.fillColor('#FFC700').fontSize(12).font('Helvetica-Bold')
     .text('Chalo, maths mein full marks laayein!', 50, 630, { align: 'center' });

  doc.fillColor('#A0AEC0').fontSize(9).font('Helvetica')
     .text('Student Edition  •  Support WhatsApp: +91 9243791529  •  Email: a2043728022@gmail.com', 50, 750, { align: 'center' });

  // ================= PAGE 2: MARKS WEIGHTAGE BLUEPRINT =================
  doc.addPage();
  drawHeader(2, 'Marks Weightage & Exam Blueprint');
  doc.fillColor(navy).fontSize(16).font('Helvetica-Bold')
     .text('CBSE Class 10 Maths: Blueprint & Marks Weightage (80 Marks)', 45, 60);
  doc.fontSize(9.5).font('Helvetica').fillColor(charcoal)
     .text('Board exams mein smart study sabse zaroori hai. Pata karo kahan se kitne marks aate hain:', 45, 82);

  // Table of units
  let y = 110;
  const units = [
    { unit: 'Unit I: Number Systems (Real Numbers)', marks: '6 Marks', priority: 'High ROI (Quick 6)' },
    { unit: 'Unit II: Algebra (Polynomials, Linear Eq, Quadratic Eq, AP)', marks: '20 Marks', priority: 'Core Foundation' },
    { unit: 'Unit III: Coordinate Geometry', marks: '6 Marks', priority: 'Guaranteed Full Marks' },
    { unit: 'Unit IV: Geometry (Triangles, Circles)', marks: '15 Marks', priority: 'Theorem Practice' },
    { unit: 'Unit V: Trigonometry (Basics, Identities, Heights & Distances)', marks: '12 Marks', priority: 'High Scoring Formulas' },
    { unit: 'Unit VI: Mensuration (Areas Related to Circles, Surface Areas)', marks: '10 Marks', priority: 'Direct Formula Calculation' },
    { unit: 'Unit VII: Statistics & Probability', marks: '11 Marks', priority: 'Easiest 11 Marks' },
  ];

  units.forEach((u, i) => {
    doc.save();
    doc.rect(45, y, 505, 26).fill(i % 2 === 0 ? '#F4F7FB' : '#FFFFFF');
    doc.rect(45, y, 505, 26).strokeColor('#E2E8F0').lineWidth(0.5).stroke();
    doc.fillColor(navy).fontSize(9.5).font('Helvetica-Bold').text(u.unit, 55, y + 7);
    doc.fillColor(redAlert).fontSize(9.5).font('Helvetica-Bold').text(u.marks, 340, y + 7);
    doc.fillColor(greenCheck).fontSize(8.5).font('Helvetica').text(u.priority, 430, y + 8);
    doc.restore();
    y += 28;
  });

  y += 15;
  doc.save();
  doc.rect(45, y, 505, 110).fill('#FFF9D2');
  doc.rect(45, y, 6, 110).fill(yellow);
  doc.fillColor(navy).fontSize(12).font('Helvetica-Bold').text('THE 80/80 TOPPER STRATEGY:', 60, y + 12);
  doc.fontSize(9.5).font('Helvetica').fillColor(charcoal)
     .text('1. Start with Statistics + Probability + Real Numbers (Total = 23 Marks). Yeh 2 din mein khatam hote hain.', 60, y + 32)
     .text('2. Coordinate Geometry (6 Marks) formula based hai - distance, section formula se pure marks aate hain.', 60, y + 50)
     .text('3. Algebra (20 Marks) mein quadratic equations aur AP ke direct shortcuts use karo.', 60, y + 68)
     .text('4. Geometry theorems (BPT Theorem & Tangent Theorem) ko 5-5 baar likh kar yaad karo.', 60, y + 86);
  doc.restore();

  y += 130;
  y = addAlertBox('Student mistake: Direct calculation mein rush karna bina formula likhe. CBSE step-marking deta hai! Formula likhne ka alag se 0.5 to 1 mark milta hai chahe final answer mein calculation slip ho.', y);

  // ================= CHAPTER PAGES (3 to 16) =================
  const chapters = [
    {
      num: 1, name: 'Real Numbers', marks: '6 Marks', page: 3,
      idea: 'Numbers are either rational (p/q, terminating or repeating decimal) or irrational (non-terminating, non-repeating).',
      formulas: [
        'Fundamental Theorem of Arithmetic: Every composite number = unique product of primes.',
        'HCF(a, b) × LCM(a, b) = a × b (Only valid for TWO numbers, not three!).',
        'If prime p divides a², then p divides a.'
      ],
      trick: 'To find HCF of two numbers quickly, use prime factorization with the lowest powers of common prime factors. For LCM, take highest powers of all prime factors.',
      example: 'Q: If HCF(306, 657) = 9, find LCM(306, 657).\nAns: LCM = (306 × 657) / 9 = 34 × 657 = 22,338.',
      mistake: 'Applying HCF(a,b,c) × LCM(a,b,c) = a × b × c for THREE numbers! Yeh rule sirf 2 numbers par kaam karta hai.',
      check: 'Find HCF and LCM of 12 and 18, and verify that HCF × LCM = 12 × 18.'
    },
    {
      num: 2, name: 'Polynomials', marks: '4-5 Marks', page: 4,
      idea: 'A polynomial of degree n has at most n real zeroes (where the graph intersects the x-axis).',
      formulas: [
        'Quadratic Polynomial: p(x) = ax² + bx + c',
        'Sum of zeroes (α + β) = -b/a = -(coefficient of x) / (coefficient of x²)',
        'Product of zeroes (αβ) = c/a = (constant term) / (coefficient of x²)',
        'Forming quadratic polynomial: k [x² - (α + β)x + αβ]'
      ],
      trick: 'Memory Trick: "Sum minus, product plain". Zeroes ka sum hamesha minus sign se shuru hota hai (-b/a).',
      example: 'Q: Find a quadratic polynomial whose sum and product of zeroes are -3 and 2.\nAns: p(x) = x² - (-3)x + 2 = x² + 3x + 2.',
      mistake: 'Formula mein minus sign bhool jana! x² - (α+β)x + αβ hota hai, x² + (α+β)x nahi.',
      check: 'If α, β are zeroes of x² - 5x + 6, find the value of α² + β² using (α+β)² - 2αβ.'
    },
    {
      num: 3, name: 'Pair of Linear Equations in Two Variables', marks: '5-6 Marks', page: 5,
      idea: 'Two straight lines a₁x + b₁y + c₁ = 0 and a₂x + b₂y + c₂ = 0 can intersect at 1 point, be parallel, or coincide.',
      formulas: [
        'Unique solution (Intersecting): a₁/a₂ ≠ b₁/b₂ [Consistent]',
        'Infinitely many solutions (Coincident): a₁/a₂ = b₁/b₂ = c₁/c₂ [Consistent & Dependent]',
        'No solution (Parallel lines): a₁/a₂ = b₁/b₂ ≠ c₁/c₂ [Inconsistent]'
      ],
      trick: 'Elimination Method shortcut: Multiply equations to equate the smaller coefficient first to minimize arithmetic errors.',
      example: 'Q: For what value of k will 2x + 3y = 7 and (k-1)x + (k+2)y = 3k have infinite solutions?\nAns: 2/(k-1) = 3/(k+2) = 7/3k. Cross-multiply: 2(k+2) = 3(k-1) => 2k+4 = 3k-3 => k = 7.',
      mistake: 'Standard form check karna bhoolna! Always ensure both equations have constant term on the same side (either both RHS or both LHS) before taking c₁/c₂.',
      check: 'Solve for x and y: 2x + 3y = 11 and 2x - 4y = -24.'
    },
    {
      num: 4, name: 'Quadratic Equations', marks: '6 Marks', page: 6,
      idea: 'Equations of the form ax² + bx + c = 0 (a ≠ 0). The discriminant D decides the nature of the roots.',
      formulas: [
        'Discriminant: D = b² - 4ac',
        'Quadratic Formula (Sridharacharya): x = (-b ± √D) / (2a)',
        'If D > 0: Two distinct real roots',
        'If D = 0: Two equal real roots (x = -b / 2a)',
        'If D < 0: No real roots'
      ],
      trick: 'Topper Shortcut: If a + b + c = 0, one root is ALWAYS 1 and the other root is c/a. Example: 3x² - 5x + 2 = 0 (3 - 5 + 2 = 0), so roots are 1 and 2/3 directly!',
      example: 'Q: Find roots of 2x² - 7x + 3 = 0 using quadratic formula.\nAns: a=2, b=-7, c=3. D = (-7)² - 4(2)(3) = 49 - 24 = 25. x = (7 ± 5)/4 => x = 3 or x = 1/2.',
      mistake: 'b² calculate karte waqt (-7)² ko -49 likhna! Negative number ka square hamesha POSITIVE hota hai (+49).',
      check: 'If 2x² + kx + 3 = 0 has equal roots, find the value of k.'
    },
    {
      num: 5, name: 'Arithmetic Progressions (AP)', marks: '5-6 Marks', page: 7,
      idea: 'A sequence where each term differs from the previous by a constant common difference d.',
      formulas: [
        'Common difference: d = a₂ - a₁ = aₙ - aₙ₋₁',
        'n-th term: aₙ = a + (n - 1)d',
        'Sum of first n terms: Sₙ = n/2 [2a + (n - 1)d] = n/2 [a + l] (where l = last term)',
        'n-th term from the end: l - (n - 1)d',
        'Three consecutive terms in AP: (a - d), a, (a + d)'
      ],
      trick: 'Finding n-th term from Sₙ: aₙ = Sₙ - Sₙ₋₁. Also, S₁ = a₁.',
      example: 'Q: How many two-digit numbers are divisible by 3?\nAns: AP: 12, 15, ..., 99. a=12, d=3, aₙ=99. 99 = 12 + (n-1)3 => 87 = (n-1)3 => n-1 = 29 => n = 30.',
      mistake: 'Confusing "n" with "aₙ". n is the number of terms (must be a positive integer), whereas aₙ is the value of the term.',
      check: 'Find the 20th term from the last term of the AP: 3, 8, 13, ..., 253.'
    },
    {
      num: 6, name: 'Triangles', marks: '8-9 Marks', page: 8,
      idea: 'Two figures are similar if their corresponding angles are equal and corresponding sides are in the same ratio.',
      formulas: [
        'Basic Proportionality Theorem (Thales Theorem): If DE || BC, then AD/DB = AE/EC.',
        'Converse of BPT: If AD/DB = AE/EC, then DE || BC.',
        'Similarity Criteria: AAA (or AA), SSS, SAS.'
      ],
      trick: 'Always write similarity with correct vertex correspondence! If ΔABC ~ ΔDEF, then AB/DE = BC/EF = AC/DF.',
      example: 'Q: In ΔABC, DE || BC. If AD = 1.5 cm, DB = 3 cm, AE = 1 cm, find EC.\nAns: By BPT, AD/DB = AE/EC => 1.5/3 = 1/EC => 1/2 = 1/EC => EC = 2 cm.',
      mistake: 'Board exam mein BPT Theorem ka statement aur "Given, To Prove, Construction, Proof" format chodna. Har heading ke marks alag hote hain!',
      check: 'State and prove Basic Proportionality Theorem (Thales Theorem).'
    },
    {
      num: 7, name: 'Coordinate Geometry', marks: '6 Marks', page: 9,
      idea: 'Locating points and shapes on the Cartesian plane using coordinates (x, y).',
      formulas: [
        'Distance Formula: d = √[(x₂ - x₁)² + (y₂ - y₁)²]',
        'Distance of point (x, y) from origin: √(x² + y²)',
        'Section Formula (Internal division m₁:m₂):\nx = (m₁x₂ + m₂x₁) / (m₁ + m₂),  y = (m₁y₂ + m₂y₁) / (m₁ + m₂)',
        'Mid-point Formula: ((x₁ + x₂)/2, (y₁ + y₂)/2)'
      ],
      trick: 'Ratio Trick: Whenever ratio is to be found, always assume the ratio to be k : 1 instead of m₁ : m₂. Calculations become 2x faster.',
      example: 'Q: Find coordinates of point dividing (4, -3) and (8, 5) in ratio 3:1.\nAns: x = (3(8) + 1(4))/(3+1) = 28/4 = 7; y = (3(5) + 1(-3))/(3+1) = 12/4 = 3. Point is (7, 3).',
      mistake: 'Section formula mein coordinates cross multiply na karna! m₁ goes with x₂, and m₂ goes with x₁.',
      check: 'Find the ratio in which the y-axis divides the line segment joining (5, -6) and (-1, -4).'
    },
    {
      num: 8, name: 'Introduction to Trigonometry', marks: '6 Marks', page: 10,
      idea: 'Trigonometric ratios are defined for acute angles in a right-angled triangle.',
      formulas: [
        'sin θ = P/H,  cos θ = B/H,  tan θ = P/B',
        'cosec θ = 1/sin θ,  sec θ = 1/cos θ,  cot θ = 1/tan θ',
        'Standard Table:\nsin: 0°=0, 30°=1/2, 45°=1/√2, 60°=√3/2, 90°=1\ncos: 0°=1, 30°=√3/2, 45°=1/√2, 60°=1/2, 90°=0\ntan: 0°=0, 30°=1/√3, 45°=1, 60°=√3, 90°=Not Defined'
      ],
      trick: 'Hand / Finger rule for sin values: √(fingers below) / 2. Thumb = 0°, Index = 30°, Middle = 45°, Ring = 60°, Pinky = 90°!',
      example: 'Q: Evaluate: 2 tan² 45° + cos² 30° - sin² 60°.\nAns: 2(1)² + (√3/2)² - (√3/2)² = 2 + 3/4 - 3/4 = 2.',
      mistake: 'Assuming sin(A + B) = sin A + sin B. This is NEVER true! Trigonometric ratio is not a multiplication of sin with angle.',
      check: 'If tan A = 4/3, find all other trigonometric ratios of angle A.'
    },
    {
      num: 9, name: 'Trigonometric Identities', marks: '4-5 Marks', page: 11,
      idea: 'Identities that hold true for all values of angles in a right triangle.',
      formulas: [
        'Identity 1: sin² θ + cos² θ = 1  =>  sin² θ = 1 - cos² θ,  cos² θ = 1 - sin² θ',
        'Identity 2: 1 + tan² θ = sec² θ  =>  sec² θ - tan² θ = 1',
        'Identity 3: 1 + cot² θ = cosec² θ  =>  cosec² θ - cot² θ = 1',
        'tan θ = sin θ / cos θ,  cot θ = cos θ / sin θ'
      ],
      trick: 'Golden Rule of Trigonometric Proofs: When stuck, convert every term (tan, cot, sec, cosec) into sin θ and cos θ. 95% of questions resolve in 3 steps!',
      example: 'Q: Prove that (sin θ + cosec θ)² + (cos θ + sec θ)² = 7 + tan² θ + cot² θ.\nAns: Expand LHS: sin²θ + 2 + cosec²θ + cos²θ + 2 + sec²θ = (sin²θ+cos²θ) + 4 + (1+cot²θ) + (1+tan²θ) = 1 + 4 + 1 + cot²θ + 1 + tan²θ = 7 + tan²θ + cot²θ.',
      mistake: 'Dividing by zero or cancelling terms without justifying. Also forgetting sec²θ - tan²θ = (secθ - tanθ)(secθ + tanθ) = 1.',
      check: 'Prove that: (1 + tan² A) / (1 + cot² A) = tan² A.'
    },
    {
      num: 10, name: 'Some Applications of Trigonometry', marks: '4 Marks', page: 12,
      idea: 'Heights and distances calculated using line of sight, angle of elevation, and angle of depression.',
      formulas: [
        'Angle of elevation: Looking UP from horizontal.',
        'Angle of depression: Looking DOWN from horizontal. (Angle of depression = Angle of elevation from base by alternate interior angles).',
        'tan θ = Height / Distance (most common ratio in word problems).'
      ],
      trick: 'Values to memorize: √3 ≈ 1.732, √2 ≈ 1.414. Always use given values in question if specified.',
      example: 'Q: A tower stands vertically on ground. From a point 15 m away from foot, angle of elevation is 60°. Find height.\nAns: tan 60° = h / 15 => √3 = h / 15 => h = 15√3 m ≈ 25.98 m.',
      mistake: 'Diagram mein observer ki eye-level aur ground horizontal mein confusion. Diagram carries 1 full mark in Board marking scheme!',
      check: 'A ladder 15 m long reaches a window 12 m above ground. Find the distance of foot of ladder from wall.'
    },
    {
      num: 11, name: 'Circles', marks: '6 Marks', page: 13,
      idea: 'A tangent to a circle is a line that intersects the circle at only one point.',
      formulas: [
        'Theorem 10.1: The tangent at any point of a circle is perpendicular to the radius through the point of contact (OP ⊥ AB).',
        'Theorem 10.2: The lengths of tangents drawn from an external point to a circle are equal (PQ = PR).',
        'The center lies on the bisector of the angle between the two tangents.'
      ],
      trick: 'External Tangent Quadrangle: Opposite sides of a quadrilateral circumscribing a circle subtend supplementary angles at the center (Sum = 180°).',
      example: 'Q: If tangents PA and PB from point P to a circle with center O are inclined to each other at 80°, find ∠POA.\nAns: ∠AOB = 180° - 80° = 100°. In right triangles, OP bisects ∠AOB, so ∠POA = 100° / 2 = 50°.',
      mistake: 'Forgetting that radius meets tangent at exactly 90°. Always mark 90° in the diagram immediately.',
      check: 'Prove that the tangents drawn at the ends of a diameter of a circle are parallel.'
    },
    {
      num: 12, name: 'Areas Related to Circles', marks: '4-5 Marks', page: 14,
      idea: 'Calculating perimeter and areas of circles, sectors, and segments.',
      formulas: [
        'Circumference = 2πr, Area = πr²',
        'Length of arc of sector with angle θ: l = (θ / 360°) × 2πr',
        'Area of sector with angle θ: (θ / 360°) × πr²',
        'Area of minor segment = Area of sector - Area of corresponding triangle',
        'Area of triangle with angle θ between two radii: 1/2 × r² × sin θ'
      ],
      trick: 'Area of triangle for segment: Use Area = 1/2 × r² × sin θ directly! If θ = 60°, sin 60° = √3/2. If θ = 90°, sin 90° = 1.',
      example: 'Q: Find area of sector of circle with radius 6 cm if angle is 60°.\nAns: Area = (60/360) × (22/7) × 6 × 6 = 1/6 × 22/7 × 36 = 132/7 cm² ≈ 18.86 cm².',
      mistake: 'Confusing sector (pizza slice) with segment (crust cut by chord). Read the question carefully!',
      check: 'Find the area of a quadrant of a circle whose circumference is 22 cm.'
    },
    {
      num: 13, name: 'Surface Areas and Volumes', marks: '5-6 Marks', page: 15,
      idea: 'Combination of solids: Cube, Cuboid, Cylinder, Cone, Sphere, Hemisphere.',
      formulas: [
        'Cylinder: CSA = 2πrh,  TSA = 2πr(r + h),  Volume = πr²h',
        'Cone: Slant height l = √(r² + h²),  CSA = πrl,  TSA = πr(l + r),  Volume = 1/3 πr²h',
        'Sphere: Surface Area = 4πr²,  Volume = 4/3 πr³',
        'Hemisphere: CSA = 2πr²,  TSA = 3πr²,  Volume = 2/3 πr³'
      ],
      trick: 'When one solid is melted and recast into another, VOLUME remains constant! Equate Volume₁ = Volume₂.',
      example: 'Q: 2 cubes each of volume 64 cm³ are joined end to end. Find surface area of resulting cuboid.\nAns: Side of cube a = ³√64 = 4 cm. Cuboid: l=8 cm, b=4 cm, h=4 cm. TSA = 2(lb+bh+hl) = 2(32+16+32) = 160 cm².',
      mistake: 'When two solids are joined, their common face is HIDDEN! Do not add TSA of individual solids; add their visible CURVED surfaces (CSA₁ + CSA₂).',
      check: 'A metallic sphere of radius 4.2 cm is melted and recast into a cylinder of radius 6 cm. Find the height of the cylinder.'
    },
    {
      num: 14, name: 'Statistics & Probability', marks: '11 Marks', page: 16,
      idea: 'Measures of central tendency (Mean, Median, Mode) and classical probability P(E) = favourable / total outcomes.',
      formulas: [
        'Mean (Direct): x̄ = Σ(fᵢxᵢ) / Σfᵢ',
        'Mode = l + [ (f₁ - f₀) / (2f₁ - f₀ - f₂) ] × h',
        'Median = l + [ (N/2 - cf) / f ] × h',
        'Empirical Relationship: 3 Median = Mode + 2 Mean',
        'Probability: P(E) = n(E) / n(S), where 0 ≤ P(E) ≤ 1 and P(E) + P(not E) = 1'
      ],
      trick: 'Empirical Formula mnemonic: "3 Medians minus 2 Means equals Mode" (3M - 2M = M).',
      example: 'Q: In a frequency distribution, Mean = 20 and Median = 22. Find Mode.\nAns: Mode = 3 Median - 2 Mean = 3(22) - 2(20) = 66 - 40 = 26.',
      mistake: 'In Median calculation, choosing cf of the median class instead of cumulative frequency of the PRECEDING class!',
      check: 'A bag contains 3 red and 5 black balls. A ball is drawn at random. What is probability that the ball drawn is red?'
    }
  ];

  chapters.forEach(ch => {
    doc.addPage();
    drawHeader(ch.page, ch.name);
    addChapterHeader(ch.num, ch.name, ch.marks);

    let curY = 96;
    curY = addSectionBox('💡 Simple Idea (Bina Ratta Samjho):', [ch.idea], curY, navy);
    curY = addSectionBox('📐 Must-Know Board Formulas:', ch.formulas, curY, '#1A365D');
    curY = addSectionBox('⚡ Topper Shortcut Trick:', [ch.trick], curY, '#B7791F');
    curY = addSectionBox('✍️ Solved Board Model Question:', [ch.example], curY, '#2D3748');
    curY = addAlertBox(ch.mistake, curY);
    curY += 8;
    addSectionBox('🎯 Quick Check Question (Khud Try Karo):', [ch.check], curY, greenCheck);
  });

  // ================= PAGE 17: EXAM-DAY MASTER PLAN (3-HOUR STRATEGY) =================
  doc.addPage();
  drawHeader(17, 'Exam-Day Strategy & 3-Hour Plan');
  doc.fillColor(navy).fontSize(16).font('Helvetica-Bold')
     .text('The 3-Hour Board Exam Execution Plan', 45, 60);

  let p17Y = 90;
  const examSteps = [
    { time: '10:15 AM - 10:30 AM (15 Min Reading Time)', action: 'Do NOT pick up the pen! Scan all 38 questions. Mark easy questions with a pencil dot. Decide your choices in Section B, C, and D.' },
    { time: '10:30 AM - 11:15 AM (Section A: 20 MCQs - 45 Min)', action: 'Spend 2 minutes per MCQ. Use shortcut tricks, elimination method, and option substitution. Do rough work clearly in the right margin.' },
    { time: '11:15 AM - 11:45 AM (Section B: 5 Very Short - 30 Min)', action: '2-mark questions. Write formula first, 2 steps of calculation, final answer in a box with correct units.' },
    { time: '11:45 AM - 12:35 PM (Section C: 6 Short Answers - 50 Min)', action: '3-mark questions. Draw neat pencil diagrams for geometry and trigonometry questions. Write reasons in brackets.' },
    { time: '12:35 PM - 01:10 PM (Section D: 4 Long Answers - 35 Min)', action: '5-mark questions (BPT Theorem, Surface Areas, Quadratic word problem). Step-marking is crucial.' },
    { time: '01:10 PM - 01:25 PM (Section E: 3 Case Study Questions - 15 Min)', action: 'Read the case study paragraph fast; the questions are usually straightforward direct formulas.' },
    { time: '01:25 PM - 01:30 PM (Final 5 Min Revision Check)', action: 'Double check question numbers, unit conversions (cm to m), and check if any sub-part was skipped.' }
  ];

  examSteps.forEach((st, i) => {
    doc.save();
    doc.rect(45, p17Y, 505, 34).fill(i % 2 === 0 ? '#F7FAFC' : '#FFFFFF');
    doc.rect(45, p17Y, 505, 34).strokeColor('#E2E8F0').lineWidth(0.5).stroke();
    doc.fillColor(navy).fontSize(9.5).font('Helvetica-Bold').text(st.time, 55, p17Y + 5);
    doc.fillColor(charcoal).fontSize(8.5).font('Helvetica').text(st.action, 55, p17Y + 18, { width: 485 });
    doc.restore();
    p17Y += 38;
  });

  p17Y += 10;
  addAlertBox('Never leave any question blank in Section D or Section E! Even writing the given values, drawing the diagram, and writing the formula fetches 1.5 to 2 marks out of 5.', p17Y);

  // ================= PAGE 18: TOP 10 SILLY MISTAKES TO AVOID =================
  doc.addPage();
  drawHeader(18, 'Top 10 Silly Mistakes to Avoid');
  doc.fillColor(navy).fontSize(16).font('Helvetica-Bold')
     .text('Top 10 Silly Mistakes That Cost 10-15 Marks in Board Exam', 45, 60);

  const mistakes = [
    '1. Unit Mismatch: Adding cm and m without converting (e.g. radius in cm, height in m).',
    '2. Missing Units in Final Answer: Forgetting cm², cm³, or m/s in word problems (-0.5 mark deduction).',
    '3. Negative Sign in Quadratic Formula: (-b ± √D) / 2a. If b = -4, then -b becomes -(-4) = +4.',
    '4. Radius vs Diameter Trap: Reading diameter as 14 cm and taking r = 14 instead of r = 7 cm.',
    '5. BPT Theorem Missing Justification: Writing AD/DB = AE/EC without writing "[By Thales Theorem DE || BC]".',
    '6. Frequency vs Cumulative Frequency: Using cf instead of f in Mode or Median denominator.',
    '7. Volume vs Surface Area: Adding TSA of cone and hemisphere instead of visible CSA.',
    '8. Angle of Depression: Not showing the alternate angle equality in trigonometry diagram.',
    '9. Probability out of range: Writing an answer greater than 1 or negative (Probability is strictly 0 to 1).',
    '10. Rough Work Chaos: Doing rough calculations all over the page and copying wrong numbers into final answer.'
  ];

  let p18Y = 95;
  mistakes.forEach(m => {
    doc.save();
    doc.rect(45, p18Y, 505, 24).fill('#FFF5F5');
    doc.rect(45, p18Y, 3, 24).fill(redAlert);
    doc.fillColor(charcoal).fontSize(9).font('Helvetica').text(m, 55, p18Y + 6, { width: 485 });
    doc.restore();
    p18Y += 28;
  });

  p18Y += 10;
  doc.save();
  doc.rect(45, p18Y, 505, 70).fill('#FFF9D2');
  doc.rect(45, p18Y, 5, 70).fill(yellow);
  doc.fillColor(navy).fontSize(11).font('Helvetica-Bold').text('THE 30-SECOND GOLDEN HABIT:', 55, p18Y + 10);
  doc.fontSize(9).font('Helvetica').fillColor(charcoal)
     .text('After finding the answer, reread the LAST sentence of the question. Did they ask for radius or diameter? Did they ask for speed of stream or boat in still water? Did they ask for age of son or father? This single habit saves 5 marks!', 55, p18Y + 28, { width: 485 });
  doc.restore();

  // ================= PAGE 19: QUICK SELF-TEST (10 QUESTIONS + SCORE GUIDE) =================
  doc.addPage();
  drawHeader(19, 'Self-Test (10 Board Challenge Questions)');
  doc.fillColor(navy).fontSize(16).font('Helvetica-Bold')
     .text('Quick Board Self-Test (Solve in 25 Minutes)', 45, 60);

  const testQuestions = [
    '1. What is the HCF of smallest prime number and smallest composite number? [Ans: 2]',
    '2. If α and β are zeroes of 2x² - 4x + 5, what is α + β + αβ? [Ans: 2 + 5/2 = 9/2]',
    '3. For what value of p do 2x + py = -5 and x + y = -1 have unique solution? [Ans: p ≠ 2]',
    '4. Find the roots of x² - (√3 + 1)x + √3 = 0. [Ans: x = √3, x = 1]',
    '5. What is the 11th term of AP: -3, -1/2, 2, ...? [Ans: 22]',
    '6. If ΔABC ~ ΔDEF and AB/DE = 2/3, find ratio of their perimeters. [Ans: 2:3]',
    '7. Find distance between (a, b) and (-a, -b). [Ans: 2√(a² + b²)]',
    '8. Evaluate: (sin² 30° + cos² 30°) / (sec² 45° - tan² 45°). [Ans: 1 / 1 = 1]',
    '9. Tangents PA and PB are drawn to circle with radius 5 cm from P. If OP = 13 cm, find PA. [Ans: 12 cm]',
    '10. If P(E) = 0.05, what is the probability of "not E"? [Ans: 0.95]'
  ];

  let p19Y = 90;
  testQuestions.forEach(q => {
    doc.save();
    doc.rect(45, p19Y, 505, 24).fill('#F8FAFC');
    doc.fillColor(navy).fontSize(8.5).font('Helvetica').text(q, 55, p19Y + 6, { width: 485 });
    doc.restore();
    p19Y += 28;
  });

  p19Y += 15;
  doc.save();
  doc.rect(45, p19Y, 505, 75).fill('#EDF2F7');
  doc.fillColor(navy).fontSize(11).font('Helvetica-Bold').text('SCORE GUIDE & BENCHMARK:', 55, p19Y + 10);
  doc.fontSize(9).font('Helvetica').fillColor(charcoal)
     .text('• 9-10 Correct: Board 80/80 Topper Ready! You have strong conceptual clarity.', 55, p19Y + 28)
     .text('• 7-8 Correct: 70+ Marks Zone. Revise the shortcut tricks and alert boxes once more.', 55, p19Y + 44)
     .text('• Below 7: Re-read Chapter 1 to 5 formulas and solve 5 NCERT questions per chapter.', 55, p19Y + 60);
  doc.restore();

  // ================= PAGE 20: FORMULA CHECKLIST & CLOSING NOTE =================
  doc.addPage();
  drawHeader(20, 'Final Formula Checklist & Support');
  doc.fillColor(navy).fontSize(16).font('Helvetica-Bold')
     .text('Final 24-Hour Board Formula Checklist', 45, 60);

  const checklist = [
    '[  ] Real Numbers: HCF × LCM = a × b',
    '[  ] Polynomials: α + β = -b/a, αβ = c/a',
    '[  ] Linear Eq: Unique (a₁/a₂ ≠ b₁/b₂), Coincident, Parallel ratios',
    '[  ] Quadratic Eq: D = b² - 4ac, x = (-b ± √D) / 2a',
    '[  ] AP: aₙ = a + (n-1)d, Sₙ = n/2[2a + (n-1)d] = n/2[a + l]',
    '[  ] Triangles: BPT AD/DB = AE/EC & AAA, SAS similarity',
    '[  ] Coordinate: Distance formula & Section formula m₁:m₂',
    '[  ] Trigonometry: sin, cos, tan values (0°, 30°, 45°, 60°, 90°)',
    '[  ] Identities: sin²θ + cos²θ = 1, 1 + tan²θ = sec²θ, 1 + cot²θ = cosec²θ',
    '[  ] Circles: Radius ⊥ Tangent, Equal tangents from external point',
    '[  ] Areas: Sector = (θ/360)πr², Segment = Sector - Triangle',
    '[  ] Mensuration: Cylinder, Cone (l=√(r²+h²)), Sphere, Hemisphere',
    '[  ] Statistics: Empirical formula: 3 Median = Mode + 2 Mean',
    '[  ] Probability: P(E) = favourable / total, 0 ≤ P(E) ≤ 1'
  ];

  let p20Y = 90;
  checklist.forEach(item => {
    doc.fillColor(charcoal).fontSize(8.5).font('Helvetica').text(item, 55, p20Y);
    p20Y += 16;
  });

  p20Y += 15;
  doc.save();
  doc.rect(45, p20Y, 505, 120).fill('#0B1B3A');
  doc.fillColor(yellow).fontSize(14).font('Helvetica-Bold')
     .text('All The Best for Your Class 10 CBSE Board Exams! 🌟', 55, p20Y + 15, { align: 'center' });
  doc.fillColor('#FFFDF5').fontSize(10).font('Helvetica')
     .text('Yaad rakhna: Confidence aati hai preparation se. Saare formulas ek paper par likho, 5-5 sawal lagao aur cool mind se paper do. You can easily score 80/80!', 65, p20Y + 40, { align: 'center', width: 465 });
  doc.fillColor(yellow).fontSize(9.5).font('Helvetica-Bold')
     .text('Think Unlimited  •  WhatsApp: +91 9243791529  •  Email: a2043728022@gmail.com', 55, p20Y + 95, { align: 'center' });
  doc.restore();

  doc.end();

  writeStream.on('finish', () => {
    console.log(`Successfully generated 20-page Class 10 Maths Made Easy PDF at: ${PDF_PATH}`);
  });
}

if (require.main === module) {
  generateClass10Ebook();
}

module.exports = { generateClass10Ebook, PDF_PATH };
