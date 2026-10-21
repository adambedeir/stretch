/* Stretch library.
 *
 * areas   body-map areas this stretch counts toward. Extra tags (frontdelt,
 *         reardelt, biceps, triceps) let the split routines aim more precisely.
 * pos     stand | chair | kneel | sit | lie   (routines flow in that order)
 * hold    recommended seconds (per side when sides = true)
 * calm    gentle enough for the wind-down routine
 * pose    the full stretch; `from` is the eased-off position it animates from
 */
(function () {
  'use strict';

  const STAND = { x: 100, y: 84, t: 180, a1: [8, 4], a2: [-6, -2], l1: [0, 0], l2: [0, 0] };
  const FSTAND = { view: 'front', x: 100, y: 84, t: 180, a1: [-10, -5], a2: [10, 5], l1: [-3, -1], l2: [3, 1] };
  const CHAIR_PROP = { k: 'chair', x: 60, y: 120, w: 36 };
  const CHAIR = { x: 82, y: 115, t: 180, l1: [90, 0], l2: [88, 2], a1: [20, 60], a2: [16, 58], props: [CHAIR_PROP] };
  const FCHAIR = { view: 'front', x: 100, y: 108, t: 180, l1: [-6, -2], l2: [6, 2], sl1: [0.3, 1], sl2: [0.3, 1],
    a1: [-8, -4], a2: [8, 4], props: [{ k: 'seat', x: 76, y: 114, w: 48 }] };
  const SIT = { x: 62, y: 145, t: 180, l1: [90, 90], l2: [90, 90], a1: [15, 40], a2: [10, 35] };
  const FSIT = { view: 'front', x: 100, y: 143, t: 180, a1: [-14, -6], a2: [14, 6] };
  const QUAD = { x: 72, y: 114, t: 114, l1: [0, -90, -90], l2: [0, -90, -90], a1: [0, 0, 90], a2: [0, 0, 90] };
  const LIE = { x: 112, y: 141, t: -90, l1: [90, 90], l2: [90, 90], a1: [88, 90], a2: [90, 90] };
  const PRONE = { x: 96, y: 142, t: 90, l1: [-90, -90, -90], l2: [-90, -90, -90], a1: [-60, -90], a2: [-60, -90] };
  const TOP = { view: 'top', x: 100, y: 98, t: 180, a1: [-40, -20], a2: [40, 20], l1: [-4, -2], l2: [4, 2] };
  const LUNGE = { x: 95, y: 120, t: 182, l1: [-36, -90, -90], l2: [98, 0] };

  const P = (...parts) => Object.assign({}, ...parts);

  const S = [
    // ─────────────── Neck ───────────────
    { id: 'neck-tilt', name: 'Side neck tilt', areas: ['neck'], focus: ['Upper traps', 'Side of neck'],
      pos: 'stand', hold: 30, sides: true, calm: true,
      steps: ['Stand or sit tall with your shoulders down.', 'Tip one ear toward the same shoulder.', 'Rest that hand on your head and let its weight add a gentle pull.'],
      feel: 'Along the side of your neck into the top of the opposite shoulder.',
      avoid: 'Letting the far shoulder creep up. Reach that hand toward the floor.',
      pose: P(FSTAND, { h: 152, a1: [-12, -8], a2: [150, -93], hl: ['neck'] }), from: { h: 176 } },

    { id: 'trap-seated', name: 'Seated upper-trap stretch', areas: ['neck', 'shoulders'], focus: ['Upper traps'],
      pos: 'chair', hold: 30, sides: true, calm: true,
      steps: ['Sit tall and hold the edge of your seat with one hand.', 'Lean your head away from that hand.', 'Use the other hand on your head for a light extra pull.'],
      feel: 'A long stretch from behind the ear down into the shoulder you are anchoring.',
      avoid: 'Leaning your whole body. Only the head moves; the anchored arm stays long.',
      pose: P(FCHAIR, { h: 152, a1: [-6, -2], a2: [150, -93], hl: ['neck'] }), from: { h: 178 } },

    { id: 'levator', name: 'Levator scapulae stretch', areas: ['neck', 'upperback'], focus: ['Levator scapulae', 'Back of neck'],
      pos: 'chair', hold: 30, sides: true, calm: true,
      steps: ['Sit tall and turn your nose 45° toward one armpit.', 'Place that hand on the back of your head.', 'Gently nod down toward the armpit.'],
      feel: 'Behind the neck on the opposite side, down toward the shoulder blade.',
      avoid: 'Yanking with the hand. Let its weight do the work.',
      pose: P(CHAIR, { h: 140, a2: [143, -90], sa2: [1, 0.57], a1: [-4, -4], hl: ['neck'] }),
      from: { h: 168, a2: [150, -80] } },

    { id: 'neck-flex', name: 'Hands-behind-head neck stretch', areas: ['neck', 'upperback'], focus: ['Back of neck', 'Upper back'],
      pos: 'stand', hold: 30, sides: false, calm: true,
      steps: ['Interlace your fingers behind your head.', 'Let your chin drop toward your chest.', 'Let your elbows drop forward and relax.'],
      feel: 'Down the back of the neck and between the shoulder blades.',
      avoid: 'Pulling hard on your head. The arms are just heavy, not pulling.',
      pose: P(STAND, { h: 135, a1: [143, -82], sa1: [1, 0.61], a2: [141, -84], sa2: [1, 0.6], hl: ['neck', 'upperback'] }),
      from: { h: 172, a1: [152, -70], a2: [150, -72] } },

    // ─────────────── Shoulders, chest, arms ───────────────
    { id: 'cross-body', name: 'Cross-body shoulder stretch', areas: ['shoulders', 'upperback', 'reardelt'], focus: ['Rear delts', 'Upper back'],
      pos: 'stand', hold: 30, sides: true,
      steps: ['Bring one arm straight across your chest.', 'Hook the other forearm just above that elbow.', 'Draw the arm closer to your chest.'],
      feel: 'The back of the shoulder and around the shoulder blade.',
      avoid: 'Turning your torso to follow the arm. Keep the chest facing forward.',
      pose: P(FSTAND, { a1: [96, 92], a2: [15, -166], hl: ['a1u'] }), from: { a1: [112, 104], a2: [25, -150] } },

    { id: 'doorway-pec', name: 'Doorway chest stretch', areas: ['chest', 'shoulders', 'frontdelt'], focus: ['Pecs', 'Front delts'],
      pos: 'stand', hold: 30, sides: true,
      steps: ['Put your forearm on a door frame, elbow at shoulder height.', 'Step the same-side foot forward.', 'Turn your chest gently away from the arm.'],
      feel: 'Across the front of the chest and the front of the shoulder.',
      avoid: 'Shrugging. Keep the shoulder blade drawn down and back.',
      pose: P(STAND, { t: 172, a1: [-90, 180], a2: [10, 20], l1: [-10, -8], l2: [12, -2], hl: ['chest', 'a1u'], props: [{ k: 'wall', x: 72 }] }),
      from: { t: 180, a1: [-80, 172] } },

    { id: 'wall-pec', name: 'Straight-arm wall chest stretch', areas: ['chest', 'arms', 'biceps', 'frontdelt'], focus: ['Pecs', 'Biceps'],
      pos: 'stand', hold: 30, sides: true,
      steps: ['Stand side-on to a wall, arm straight back at shoulder height, palm on the wall.', 'Slowly turn your feet and chest away from the wall.', 'Stop when you feel a strong, easy pull.'],
      feel: 'Chest, front shoulder and down the biceps.',
      avoid: 'Letting the hand slide up. Keep it at shoulder height.',
      pose: P(STAND, { t: 176, a1: [-92, -92, 180], a2: [12, 18], hl: ['chest', 'a1u'], props: [{ k: 'wall', x: 48 }] }),
      from: { t: 182 } },

    { id: 'clasp-behind', name: 'Hands-clasped chest opener', areas: ['chest', 'shoulders', 'frontdelt'], focus: ['Pecs', 'Front delts'],
      pos: 'stand', hold: 30, sides: false,
      steps: ['Interlace your fingers behind your back.', 'Straighten your arms and lift them away from your body.', 'Lift your chest and let your shoulders roll back.'],
      feel: 'Across the chest and the front of both shoulders.',
      avoid: 'Arching your lower back to fake height. Ribs stay down.',
      pose: P(STAND, { t: 184, h: 188, a1: [-38, -38], a2: [-36, -36], hl: ['chest', 'a1u'] }),
      from: { t: 180, h: 180, a1: [-12, -12], a2: [-10, -10] } },

    { id: 'chair-chest', name: 'Seated chest opener', areas: ['chest', 'frontdelt'], focus: ['Pecs', 'Front delts'],
      pos: 'chair', hold: 30, sides: false,
      steps: ['Sit near the front of your chair.', 'Reach back and hold the sides of the seat or the backrest.', 'Lift your chest toward the ceiling and squeeze your shoulder blades together.'],
      feel: 'Across the front of the chest and shoulders.',
      avoid: 'Jutting your chin forward. Keep the back of the neck long.',
      pose: P(CHAIR, { x: 88, t: 188, h: 192, a1: [-30, -12], a2: [-28, -10], hl: ['chest'], props: [{ k: 'chair', x: 60, y: 120, w: 40, bh: 26 }] }),
      from: { t: 180, h: 180 } },

    { id: 'thoracic-chair', name: 'Chair-back extension', areas: ['upperback', 'chest'], focus: ['Mid back', 'Chest'],
      pos: 'chair', hold: 30, sides: false,
      steps: ['Sit back so the top of the backrest meets your mid-back.', 'Hands behind your head, elbows wide.', 'Lean back over the chair and let your upper back arch.'],
      feel: 'Opening through the mid back and across the chest.',
      avoid: 'Bending from the lower back. The bend happens above the backrest.',
      pose: P(CHAIR, { x: 76, t: 200, c: -0.5, h: 210, a1: [-150, -150], a2: [-148, -148], hl: ['upper'], props: [{ k: 'chair', x: 60, y: 120, w: 36, bh: 22 }] }),
      from: { t: 182, c: 0, h: 182, a1: [170, 170], a2: [172, 172] } },

    { id: 'overhead-triceps', name: 'Overhead triceps stretch', areas: ['arms', 'triceps', 'upperback'], focus: ['Triceps', 'Lats'],
      pos: 'stand', hold: 30, sides: true,
      steps: ['Raise one arm and drop that hand behind your head.', 'Hold that elbow with the other hand.', 'Gently guide the elbow back and toward your head.'],
      feel: 'The back of the upper arm and down the side of the torso.',
      avoid: 'Pushing your head forward. Keep your head back against the arm.',
      pose: P(STAND, { a1: [174, -35], a2: [140, -100], sa2: [1, 0.6], hl: ['a1u'] }), from: { a1: [165, -8] } },

    { id: 'wall-biceps', name: 'Wall biceps stretch', areas: ['arms', 'biceps', 'frontdelt', 'wrists'], focus: ['Biceps', 'Forearms'],
      pos: 'stand', hold: 30, sides: true,
      steps: ['Stand side-on to a wall, arm straight back just below shoulder height.', 'Turn your thumb down, palm flat on the wall.', 'Rotate your body away until you feel the arm stretch.'],
      feel: 'Down the front of the arm, from shoulder to forearm.',
      avoid: 'Bending the elbow. Keep the arm long.',
      pose: P(STAND, { t: 178, a1: [-68, -68, -40], a2: [12, 18], hl: ['a1u', 'a1l'], props: [{ k: 'wall', x: 53 }] }),
      from: { t: 184 } },

    { id: 'eagle-arms', name: 'Eagle arms', areas: ['upperback', 'shoulders', 'reardelt'], focus: ['Between shoulder blades', 'Rear delts'],
      pos: 'stand', hold: 30, sides: true, calm: true,
      steps: ['Cross one elbow over the other in front of you.', 'Wrap your forearms and press the palms together if you can.', 'Lift the elbows to shoulder height and push them forward.'],
      feel: 'Between and across the shoulder blades.',
      avoid: 'Hunching. Keep the shoulders away from your ears.',
      pose: P(STAND, { a1: [95, 180], sa1: [1, 0.9], a2: [92, 178], hl: ['upperback', 'a1u'] }),
      from: { a1: [70, 150], a2: [68, 150] } },

    // ─────────────── Upper back & lats ───────────────
    { id: 'thread-needle', name: 'Thread the needle', areas: ['upperback', 'shoulders', 'reardelt'], focus: ['Upper back', 'Rear delts'],
      pos: 'kneel', hold: 30, sides: true, calm: true,
      steps: ['Start on hands and knees.', 'Slide one arm under your body, palm up.', 'Lower that shoulder and the side of your head to the floor.'],
      feel: 'Across the back of the shoulder and through the upper back.',
      avoid: 'Shifting your hips sideways. Keep them stacked over your knees.',
      pose: P(QUAD, { t: 65, h: 80, a1: [-72, -88, -90], a2: [55, 90, 90], hl: ['upperback', 'a1u'] }),
      from: { t: 112, h: 112, a1: [0, 0, 90], a2: [0, 0, 90] } },

    { id: 'childs-pose', name: "Child's pose", areas: ['lowerback', 'upperback', 'glutes'], focus: ['Lower back', 'Lats'],
      pos: 'kneel', hold: 60, sides: false, calm: true,
      steps: ['Kneel and sit your hips back toward your heels.', 'Walk your hands forward and rest your forehead down.', 'Let your belly sink and breathe into your back.'],
      feel: 'A broad, easy lengthening through the lower and mid back.',
      avoid: 'Forcing your hips down. Widen your knees if it pinches.',
      pose: { x: 75, y: 128, t: 78, h: 95, l1: [56, -90, -90], l2: [56, -90, -90], a1: [83, 90, 90], a2: [83, 90, 90], hl: ['lowerback', 'upperback'] },
      from: { t: 84, h: 100 } },

    { id: 'side-child', name: "Side-reach child's pose", areas: ['upperback', 'lowerback'], focus: ['Lats', 'Side body'],
      pos: 'kneel', hold: 30, sides: true, calm: true,
      steps: ["Settle into child's pose.", 'Walk both hands over to one side.', 'Sink the opposite hip back and breathe into that side.'],
      feel: 'Long through the side of the torso, armpit to hip.',
      avoid: 'Lifting your hips. Keep them heavy toward your heels.',
      pose: { x: 75, y: 128, t: 80, h: 95, l1: [56, -90, -90], l2: [56, -90, -90], a1: [88, 94, 90], a2: [80, 86, 90], hl: ['a1u', 'upper'] },
      from: { t: 86 } },

    { id: 'puppy', name: 'Puppy pose', areas: ['upperback', 'shoulders', 'chest'], focus: ['Lats', 'Shoulders', 'Chest'],
      pos: 'kneel', hold: 45, sides: false, calm: true,
      steps: ['From hands and knees, keep your hips over your knees.', 'Walk your hands forward and melt your chest toward the floor.', 'Rest your forehead or chin down.'],
      feel: 'Through the armpits, shoulders and upper back.',
      avoid: "Sitting back into child's pose. Hips stay high over the knees.",
      pose: P(QUAD, { t: 58, h: 75, a1: [80, 90, 90], a2: [80, 90, 90], hl: ['upperback', 'a1u'] }),
      from: { t: 100, h: 104, a1: [30, 70, 90], a2: [30, 70, 90] } },

    { id: 'desk-lat', name: 'Desk lat stretch', areas: ['upperback', 'shoulders', 'hamstrings'], focus: ['Lats', 'Shoulders'],
      pos: 'stand', hold: 30, sides: false,
      steps: ['Put your hands on a desk or chair back, arms straight.', 'Walk your feet back and hinge at the hips.', 'Let your chest drop between your arms.'],
      feel: 'Under the armpits and along the sides of your back.',
      avoid: 'Rounding your back. Push your hips back and let the chest sink.',
      pose: { x: 78, y: 84, t: 96, h: 98, l1: [0, 0], l2: [0, 0], a1: [92, 92, 90], a2: [92, 92, 90], hl: ['upperback', 'a1u'], props: [{ k: 'desk', x: 138, y: 92, w: 54 }] },
      from: { t: 102, a1: [97, 97, 90], a2: [97, 97, 90] } },

    { id: 'side-bend', name: 'Standing side bend', areas: ['upperback', 'lowerback'], focus: ['Lats', 'Obliques', 'QL'],
      pos: 'stand', hold: 30, sides: true,
      steps: ['Stand tall with feet hip-width.', 'Reach one arm overhead.', 'Lean away from that arm, reaching up and over.'],
      feel: 'The whole side of the body, armpit to hip.',
      avoid: 'Twisting forward. Imagine sliding between two panes of glass.',
      pose: P(FSTAND, { t: 165, a1: [150, 120], a2: [12, 30], hl: ['a1u', 'side1'] }), from: { t: 180, a1: [175, 178] } },

    { id: 'chair-round', name: 'Seated upper-back round', areas: ['upperback', 'shoulders', 'neck'], focus: ['Between shoulder blades'],
      pos: 'chair', hold: 30, sides: false, calm: true,
      steps: ['Sit tall and clasp your hands in front of you.', 'Push your hands away while rounding your upper back.', 'Drop your chin and spread your shoulder blades apart.'],
      feel: 'Between the shoulder blades.',
      avoid: 'Slumping from the lower back. Round the upper back only.',
      pose: P(CHAIR, { t: 168, c: 0.9, h: 130, a1: [84, 88], a2: [82, 86], hl: ['upperback'] }),
      from: { t: 180, c: 0, h: 178, a1: [70, 80], a2: [68, 78] } },

    { id: 'cat-cow', name: 'Cat–cow', areas: ['lowerback', 'upperback'], focus: ['Whole spine'],
      pos: 'kneel', hold: 45, sides: false, calm: true, dur: 7000,
      steps: ['On hands and knees, breathe in and let your belly drop as you look up (cow).', 'Breathe out, round your back and tuck your chin (cat).', 'Move slowly with your breath.'],
      feel: 'Gentle movement through every part of the spine.',
      avoid: 'Rushing. One full breath for each direction.',
      pose: P(QUAD, { c: 0.9, h: 60, hl: ['torso'] }), from: { c: -0.75, h: 140 } },

    // ─────────────── Wrists & forearms ───────────────
    { id: 'wrist-flexor', name: 'Wrist flexor stretch', areas: ['wrists'], focus: ['Forearm flexors'],
      pos: 'stand', hold: 30, sides: true,
      steps: ['Straighten one arm in front of you, palm facing away.', 'Point your fingers up.', 'Use the other hand to gently pull the fingers back toward you.'],
      feel: 'Along the palm side of the forearm.',
      avoid: 'Bending the elbow. Keep the arm long to stretch the whole forearm.',
      pose: P(STAND, { a1: [88, 88, 175], a2: [70, 100], hl: ['a1l', 'a1h'] }), from: { a1: [88, 88, 125], a2: [74, 112] } },

    { id: 'wrist-extensor', name: 'Wrist extensor stretch', areas: ['wrists'], focus: ['Forearm extensors'],
      pos: 'stand', hold: 30, sides: true,
      steps: ['Straighten one arm in front of you, palm facing down.', 'Let the hand drop so your fingers point at the floor.', 'Press gently on the back of the hand with the other hand.'],
      feel: 'Along the top of the forearm toward the elbow.',
      avoid: 'Squeezing a fist hard. Keep the fingers relaxed.',
      pose: P(STAND, { a1: [88, 88, 5], a2: [95, 80], hl: ['a1l', 'a1h'] }), from: { a1: [88, 88, 55], a2: [92, 70] } },

    { id: 'prayer', name: 'Prayer stretch', areas: ['wrists'], focus: ['Forearm flexors', 'Wrists'],
      pos: 'stand', hold: 30, sides: false,
      steps: ['Press your palms together in front of your chest.', 'Keeping the palms together, slowly lower your hands.', 'Stop when the wrists feel a good stretch.'],
      feel: 'The undersides of both wrists and forearms.',
      avoid: 'Letting the heels of the hands come apart.',
      pose: P(FSTAND, { a1: [-25, 110, 180], a2: [25, -110, 180], hl: ['a1l', 'a2l'] }), from: { a1: [-15, 140, 180], a2: [15, -140, 180] } },

    { id: 'desk-forearm', name: 'Palms-on-desk forearm stretch', areas: ['wrists'], focus: ['Forearm flexors'],
      pos: 'stand', hold: 30, sides: false,
      steps: ['Stand at a desk and place both palms flat on it.', 'Turn your hands so your fingers point back toward you.', 'Keep your arms straight and lean back slightly.'],
      feel: 'Through the palms, wrists and inner forearms.',
      avoid: 'Locking your elbows hard. Keep a soft bend.',
      pose: P(STAND, { x: 96, a1: [27, 27, -90], a2: [25, 25, -90], hl: ['a1l', 'a1h'], props: [{ k: 'desk', x: 112, y: 90, w: 78 }] }),
      from: { t: 184 } },

    { id: 'kneel-wrist-flex', name: 'Kneeling wrist stretch', areas: ['wrists'], focus: ['Forearm flexors'],
      pos: 'kneel', hold: 30, sides: false,
      steps: ['On hands and knees, turn your hands so the fingers point back toward your knees.', 'Keep your palms flat.', 'Slowly rock your hips back until you feel a stretch.'],
      feel: 'Through the palms and the inner forearms.',
      avoid: 'Letting your palms lift. Ease off if they do.',
      pose: P(QUAD, { a1: [0, 0, -90], a2: [0, 0, -90], hl: ['a1l', 'a1h'] }) },

    { id: 'kneel-wrist-ext', name: 'Back-of-hand wrist stretch', areas: ['wrists'], focus: ['Forearm extensors'],
      pos: 'kneel', hold: 30, sides: false,
      steps: ['On hands and knees, place the backs of your hands on the floor, fingers toward your knees.', 'Keep your elbows straight.', 'Gently shift your weight back.'],
      feel: 'Across the backs of the wrists and the top of the forearms.',
      avoid: 'Putting full body weight through it. Keep most weight in your knees.',
      pose: P(QUAD, { t: 116, a1: [-4, -4, -90], a2: [-4, -4, -90], hl: ['a1l'] }) },

    // ─────────────── Lower back ───────────────
    { id: 'knees-chest', name: 'Knees to chest', areas: ['lowerback', 'glutes'], focus: ['Lower back', 'Glutes'],
      pos: 'lie', hold: 45, sides: false, calm: true,
      steps: ['Lie on your back.', 'Hug both knees in toward your chest.', 'Let your lower back flatten and relax into the floor.'],
      feel: 'A gentle release across the lower back and seat.',
      avoid: 'Lifting your head. Keep it resting on the floor.',
      pose: P(LIE, { l1: [-140, 95], l2: [-140, 95], a1: [150, 95], a2: [150, 95], hl: ['lowerback', 'glute'] }),
      from: { l1: [-160, 115], l2: [-160, 115], a1: [165, 115], a2: [165, 115] } },

    { id: 'single-knee', name: 'Single knee to chest', areas: ['lowerback', 'glutes', 'hipflexors'], focus: ['Lower back', 'Glutes', 'Hip flexors'],
      pos: 'lie', hold: 30, sides: true, calm: true,
      steps: ['Lie on your back with both legs long.', 'Hug one knee into your chest.', 'Press the other leg gently into the floor.'],
      feel: 'Glute and lower back of the bent leg, front of the hip of the straight leg.',
      avoid: 'Letting the straight leg lift. Keep it heavy.',
      pose: P(LIE, { l1: [-140, 95], a1: [150, 95], a2: [92, 90], hl: ['glute', 'lowerback'] }),
      from: { l1: [-160, 115], a1: [165, 115] } },

    { id: 'supine-twist', name: 'Lying spinal twist', areas: ['lowerback', 'glutes', 'chest'], focus: ['Lower back', 'Obliques'],
      pos: 'lie', hold: 45, sides: true, calm: true,
      steps: ['Lie on your back with arms out in a T.', 'Bend your knees and let them fall to one side.', 'Keep both shoulders heavy on the floor.'],
      feel: 'A gentle twist through the lower back and across the chest.',
      avoid: 'Forcing the knees to the floor. Let gravity do it.',
      pose: P(TOP, { a1: [-90, -90], a2: [90, 90], l1: [60, -30], l2: [70, -20], hl: ['lowerback'] }),
      from: { l1: [14, -10], l2: [24, -4] } },

    { id: 'sphinx', name: 'Sphinx', areas: ['lowerback', 'hipflexors'], focus: ['Lower back', 'Abs'],
      pos: 'lie', hold: 45, sides: false, calm: true,
      steps: ['Lie on your stomach.', 'Prop up on your forearms, elbows under your shoulders.', 'Let your hips sink and breathe.'],
      feel: 'A gentle arch in the lower back and a stretch across the belly.',
      avoid: 'Squeezing your glutes hard. Let your legs relax.',
      pose: P(PRONE, { t: 125, h: 155, a1: [5, 90, 90], a2: [3, 90, 90], hl: ['lowerback'] }),
      from: { t: 119, h: 150 } },

    { id: 'cobra', name: 'Cobra', areas: ['lowerback', 'hipflexors', 'chest'], focus: ['Abs', 'Hip flexors', 'Chest'],
      pos: 'lie', hold: 30, sides: false,
      steps: ['Lie on your stomach with your hands under your shoulders.', 'Press up, lifting your chest; keep your hips down.', 'Only go as high as feels easy on your lower back.'],
      feel: 'Along the front of the body and a gentle arch in the back.',
      avoid: 'Shrugging into your neck. Slide the shoulders down away from your ears.',
      pose: P(PRONE, { t: 145, h: 165, a1: [-35, 40, 90], a2: [-33, 42, 90], hl: ['lowerback', 'hipfront'] }),
      from: { t: 130, h: 150, a1: [-30, 55, 90], a2: [-28, 55, 90] } },

    { id: 'chair-twist', name: 'Seated chair twist', areas: ['lowerback', 'upperback'], focus: ['Spine', 'Obliques'],
      pos: 'chair', hold: 30, sides: true,
      steps: ['Sit tall with your feet flat.', 'Turn toward the backrest and hold it with both hands.', 'Lift through your head, then twist a little further each breath out.'],
      feel: 'Rotation through the mid and lower back.',
      avoid: 'Twisting from your neck. Turn from your ribs.',
      pose: P(CHAIR, { a1: [-45, 10], a2: [35, 45], hl: ['torso'] }), from: { a1: [-20, 30] } },

    { id: 'forward-fold', name: 'Ragdoll forward fold', areas: ['hamstrings', 'lowerback'], focus: ['Hamstrings', 'Lower back'],
      pos: 'stand', hold: 45, sides: false, calm: true,
      steps: ['Stand with feet hip-width, knees soft.', 'Fold forward and hold opposite elbows.', 'Let your head and arms hang heavy.'],
      feel: 'The backs of the legs and a lengthening down the back.',
      avoid: 'Locking your knees. A slight bend is fine.',
      pose: { x: 92, y: 84, t: 42, h: 25, l1: [6, 6], l2: [6, 6], a1: [0, 95], a2: [2, 95], hl: ['l1u', 'lowerback'] },
      from: { t: 62, h: 45 } },

    // ─────────────── Hip flexors & quads ───────────────
    { id: 'low-lunge', name: 'Kneeling lunge with reach', areas: ['hipflexors', 'quads'], focus: ['Hip flexors', 'Quads'],
      pos: 'kneel', hold: 45, sides: true,
      steps: ['Kneel on one knee with the other foot forward.', 'Tuck your tailbone and shift your hips forward.', 'Reach the same-side arm as the back knee up overhead.'],
      feel: 'The front of the hip on the kneeling side.',
      avoid: 'Arching your lower back. Squeeze the back glute instead.',
      pose: P(LUNGE, { a1: [160, 165], a2: [25, 40], hl: ['l1u', 'hipfront'] }), from: { a1: [20, 40], t: 180 } },

    { id: 'standing-hip-flexor', name: 'Split-stance hip flexor stretch', areas: ['hipflexors', 'quads'], focus: ['Hip flexors'],
      pos: 'stand', hold: 30, sides: true,
      steps: ['Take a long step back with one foot, heel lifted.', 'Bend the front knee slightly.', 'Tuck your tailbone under and squeeze the back glute.'],
      feel: 'The top of the thigh and front of the hip on the back leg.',
      avoid: 'Leaning forward. Keep your torso upright.',
      pose: P(STAND, { t: 182, l1: [-22, -22, 60], l2: [15, -5], a1: [-30, 60], a2: [-28, 62], hl: ['l1u', 'hipfront'] }),
      from: { t: 178 } },

    { id: 'couch', name: 'Couch stretch', areas: ['quads', 'hipflexors'], focus: ['Quads', 'Hip flexors'],
      pos: 'kneel', hold: 45, sides: true,
      steps: ['Kneel with your back to a wall or couch.', 'Slide one knee back so that shin runs up the wall.', 'Step the other foot forward and lift your torso upright.'],
      feel: 'A strong stretch down the front of the back thigh.',
      avoid: 'Going straight to upright. Start with your hands on the front knee.',
      pose: P(LUNGE, { l1: [-36, 180, 180], a1: [25, 40], a2: [25, 40], hl: ['l1u', 'hipfront'], props: [{ k: 'wall', x: 70 }] }),
      from: { t: 160 } },

    { id: 'half-kneel-quad', name: 'Half-kneeling quad stretch', areas: ['quads', 'hipflexors'], focus: ['Quads', 'Hip flexors'],
      pos: 'kneel', hold: 30, sides: true,
      steps: ['Kneel in a lunge.', 'Reach back with the same-side hand and hold your back foot.', 'Draw the heel toward your glute.'],
      feel: 'The front of the back thigh from knee to hip.',
      avoid: 'Twisting your hips open. Keep them square.',
      pose: P(LUNGE, { l1: [-36, 165, -110], a1: [-30, -10], a2: [25, 40], hl: ['l1u'] }),
      from: { l1: [-36, 205, -110], a1: [-45, -40] } },

    { id: 'standing-quad', name: 'Standing quad stretch', areas: ['quads', 'hipflexors'], focus: ['Quads'],
      pos: 'stand', hold: 30, sides: true,
      steps: ['Stand on one leg; hold a wall or desk if needed.', 'Pull the other heel toward your glute.', 'Keep your knees together and stand tall.'],
      feel: 'The front of the thigh of the bent leg.',
      avoid: 'Letting the knee drift forward or out. Point it at the floor.',
      pose: P(STAND, { l1: [-8, -172, -90], a1: [-15, -5], a2: [95, 95], hl: ['l1u'] }),
      from: { l1: [0, -150, -90], a1: [-5, 5] } },

    { id: 'side-lying-quad', name: 'Side-lying quad stretch', areas: ['quads', 'hipflexors'], focus: ['Quads'],
      pos: 'lie', hold: 30, sides: true, calm: true,
      steps: ['Lie on your side, head resting on your lower arm.', 'Bend your top knee and hold that foot.', 'Draw the heel back toward your glute.'],
      feel: 'The front of the top thigh.',
      avoid: 'Arching your back. Tuck the pelvis slightly.',
      pose: { x: 112, y: 140, t: -90, h: -96, l1: [92, -108, -150], l2: [90, 90, 180], a1: [100, 100], a2: [-150, 120], hl: ['l1u'] },
      from: { l1: [92, -80, -150], a1: [95, 85] } },

    { id: 'worlds-greatest', name: "World's greatest stretch", areas: ['hipflexors', 'hamstrings', 'upperback'], focus: ['Hip flexors', 'Groin', 'Upper back'],
      pos: 'stand', hold: 30, sides: true,
      steps: ['Step into a long lunge, back leg straight.', 'Put your hand down inside the front foot.', 'Rotate and reach the other arm up toward the ceiling.'],
      feel: 'The back hip, inner front thigh and through the upper back.',
      avoid: 'Collapsing on the planted arm. Push the floor away.',
      pose: { x: 98, y: 112, t: 120, h: 140, l1: [-58, -58, 30], l2: [84, 0], a1: [5, 5, 90], a2: [175, 175], hl: ['l1u', 'hipfront', 'upperback'] },
      from: { a2: [10, 10, 90], h: 115 } },

    // ─────────────── Glutes ───────────────
    { id: 'figure4-lying', name: 'Lying figure-4', areas: ['glutes', 'lowerback'], focus: ['Glutes', 'Piriformis'],
      pos: 'lie', hold: 45, sides: true, calm: true,
      steps: ['Lie on your back, knees bent.', 'Cross one ankle over the opposite knee.', 'Pull the bottom thigh toward your chest.'],
      feel: 'Deep in the seat of the crossed leg.',
      avoid: 'Lifting your head and shoulders. Use a towel around the thigh if you cannot reach.',
      pose: P(LIE, { l1: [-170, -90], sl1: [1, 0.5], l2: [-155, 120], a1: [150, 95], a2: [150, 95], hl: ['glute', 'l1u'] }),
      from: { l1: [175, -90], l2: [178, 120], a1: [160, 115], a2: [160, 115] } },

    { id: 'figure4-chair', name: 'Seated figure-4', areas: ['glutes'], focus: ['Glutes', 'Piriformis'],
      pos: 'chair', hold: 30, sides: true,
      steps: ['Sit tall and cross one ankle over the opposite knee.', 'Let the crossed knee drop open.', 'Hinge forward with a long back.'],
      feel: 'Deep in the seat of the crossed leg.',
      avoid: 'Rounding forward. Lead with your chest.',
      pose: P(CHAIR, { t: 155, l1: [90, 90], sl1: [0.6, 0.4], a1: [10, 40], a2: [12, 42], hl: ['glute'] }),
      from: { t: 178, a1: [18, 58], a2: [18, 58] } },

    { id: 'pigeon', name: 'Pigeon', areas: ['glutes', 'hipflexors'], focus: ['Glutes', 'Hip rotators'],
      pos: 'kneel', hold: 60, sides: true, calm: true,
      steps: ['From a plank or all fours, bring one shin forward across your body.', 'Slide the other leg straight back.', 'Square your hips, then fold forward over the front leg.'],
      feel: 'Deep in the seat of the front leg; front of the hip of the back leg.',
      avoid: 'Sitting on one cheek. Put a pillow under the front hip if needed.',
      pose: { x: 95, y: 126, t: 75, h: 85, l1: [50, -90, -90], sl1: [1, 0.35, 0.4], l2: [-58, -90, -90], a1: [80, 90, 90], a2: [80, 90, 90], hl: ['glute'] },
      from: { t: 172, h: 178, a1: [5, 15, 90], a2: [5, 15, 90] } },

    { id: 'happy-baby', name: 'Happy baby', areas: ['glutes', 'adductors', 'lowerback'], focus: ['Inner thighs', 'Glutes', 'Lower back'],
      pos: 'lie', hold: 45, sides: false, calm: true,
      steps: ['Lie on your back and draw your knees toward your armpits.', 'Hold the outsides of your feet or ankles.', 'Gently pull the knees down; rock side to side if it feels good.'],
      feel: 'Inner thighs, groin and the lower back.',
      avoid: 'Lifting your tailbone off the floor.',
      pose: P(LIE, { l1: [-125, 178, 90], l2: [-125, 178, 90], a1: [160, 165], a2: [160, 165], hl: ['l1u', 'glute'] }),
      from: { l1: [-140, 178, 90], l2: [-140, 178, 90] } },

    { id: 'standing-figure4', name: 'Standing figure-4', areas: ['glutes'], focus: ['Glutes'],
      pos: 'stand', hold: 30, sides: true,
      steps: ['Hold a desk for balance.', 'Cross one ankle over the opposite knee.', 'Sit your hips back as if into a chair.'],
      feel: 'The seat of the crossed leg.',
      avoid: 'Letting the standing knee cave inward.',
      pose: { x: 88, y: 95, t: 140, h: 120, l1: [75, 90], sl1: [0.6, 0.4], l2: [40, -15], a1: [65, 75], a2: [65, 75], hl: ['glute'], props: [{ k: 'desk', x: 146, y: 84, w: 46 }] },
      from: { t: 158, h: 150, a1: [80, 90], a2: [80, 90] } },

    { id: 'seated-twist-floor', name: 'Seated floor twist', areas: ['glutes', 'lowerback'], focus: ['Outer hip', 'Lower back'],
      pos: 'sit', hold: 30, sides: true, calm: true,
      steps: ['Sit with both legs long.', 'Cross one foot over the other leg, knee up.', 'Hug the knee and twist toward it, other hand behind you.'],
      feel: 'The outside of the hip and through the lower back.',
      avoid: 'Slumping. Sit up on your sit bones first.',
      pose: P(SIT, { l1: [155, 15], a1: [75, -105], a2: [-30, -15, -90], hl: ['glute', 'lowerback'] }), from: { a1: [70, -80] } },

    // ─────────────── Inner thighs ───────────────
    { id: 'butterfly', name: 'Butterfly', areas: ['adductors', 'hipflexors'], focus: ['Inner thighs', 'Groin'],
      pos: 'sit', hold: 45, sides: false, calm: true,
      steps: ['Sit tall and press the soles of your feet together.', 'Hold your feet and let your knees fall open.', 'Lean forward with a long spine for more.'],
      feel: 'Along the inner thighs into the groin.',
      avoid: 'Pressing your knees down with your elbows. Let them fall naturally.',
      pose: P(FSIT, { l1: [-100, 95], l2: [100, -95], sl1: [1, 1, 0], sl2: [1, 1, 0], a1: [-20, 45], a2: [20, -45], hl: ['l1u', 'l2u'] }),
      from: { l1: [-125, 70], l2: [125, -70] } },

    { id: 'reclined-butterfly', name: 'Reclined butterfly', areas: ['adductors', 'hipflexors'], focus: ['Inner thighs', 'Hips'],
      pos: 'lie', hold: 60, sides: false, calm: true,
      steps: ['Lie on your back.', 'Bring the soles of your feet together and let the knees fall open.', 'Rest your hands on your belly and breathe slowly.'],
      feel: 'A soft, passive opening along the inner thighs.',
      avoid: 'Holding tension in the legs. Put pillows under the knees if needed.',
      pose: P(TOP, { l1: [-50, 50], l2: [50, -50], sl1: [1, 1, 0], sl2: [1, 1, 0], a1: [-40, 30], a2: [40, -30], hl: ['l1u', 'l2u'] }),
      from: { l1: [-30, 30], l2: [30, -30] } },

    { id: 'wide-fold', name: 'Wide-leg forward fold', areas: ['adductors', 'hamstrings'], focus: ['Inner thighs', 'Hamstrings'],
      pos: 'stand', hold: 45, sides: false,
      steps: ['Step your feet wide, toes forward.', 'Hinge at the hips and fold forward.', 'Rest your hands on the floor or hold your ankles.'],
      feel: 'Inner thighs and the backs of the legs.',
      avoid: 'Rounding from the upper back first. Lead with your hips.',
      pose: P(FSTAND, { y: 90, ts: -0.55, h: 0, l1: [-25, -25], l2: [25, 25], a1: [0, 0], sa1: [0.7, 0.7], a2: [0, 0], sa2: [0.7, 0.7], hl: ['l1u', 'l2u'] }),
      from: { ts: -0.2, h: 30 } },

    { id: 'side-lunge', name: 'Side lunge', areas: ['adductors', 'glutes'], focus: ['Inner thighs'],
      pos: 'stand', hold: 30, sides: true,
      steps: ['Stand with feet very wide.', 'Bend one knee and sit back over that heel.', 'Keep the other leg straight, toes up if you can.'],
      feel: 'The inner thigh of the straight leg.',
      avoid: 'Letting the bent knee collapse inward. Track it over your toes.',
      pose: { view: 'front', x: 105, y: 112, t: 180, l1: [-78, 0], l2: [57, 57], a1: [-10, 60], a2: [10, -60], hl: ['l2u'] },
      from: { y: 98, l1: [-50, -15], l2: [45, 45] } },

    { id: 'straddle', name: 'Seated straddle', areas: ['adductors', 'hamstrings'], focus: ['Inner thighs', 'Hamstrings'],
      pos: 'sit', hold: 45, sides: false, calm: true,
      steps: ['Sit with your legs wide in a V.', 'Sit tall, toes pointing up.', 'Walk your hands forward and lean in from your hips.'],
      feel: 'Inner thighs and the backs of the knees.',
      avoid: 'Rolling your knees in. Keep kneecaps facing up.',
      pose: P(FSIT, { ts: 0.72, h: 180, l1: [-100, -100], l2: [100, 100], a1: [-30, 0], a2: [30, 0], hl: ['l1u', 'l2u'] }),
      from: { ts: 1 } },

    // ─────────────── Hamstrings ───────────────
    { id: 'seated-fold', name: 'Seated forward fold', areas: ['hamstrings', 'lowerback', 'calves'], focus: ['Hamstrings', 'Calves'],
      pos: 'sit', hold: 45, sides: false, calm: true,
      steps: ['Sit with your legs straight out in front.', 'Hinge forward from your hips, not your lower back.', 'Reach toward your feet and let your head relax.'],
      feel: 'The backs of the legs, from the knees to the hips.',
      avoid: 'Yanking yourself forward. Let each breath out take you a little deeper.',
      pose: P(SIT, { t: 112, h: 100, a1: [80, 86], a2: [78, 84], hl: ['l1u', 'lowerback'] }),
      from: { t: 160, h: 150, a1: [40, 60], a2: [40, 60] } },

    { id: 'single-leg-fold', name: 'Single-leg seated fold', areas: ['hamstrings', 'lowerback'], focus: ['Hamstrings'],
      pos: 'sit', hold: 30, sides: true, calm: true,
      steps: ['Sit with one leg straight; bring the other foot to its inner thigh.', 'Turn to face the straight leg.', 'Hinge forward over it.'],
      feel: 'The back of the straight leg.',
      avoid: 'Locking the knee hard. Keep a micro-bend.',
      pose: P(SIT, { t: 118, h: 105, l2: [90, -90], sl2: [0.6, 0.45], a1: [78, 84], a2: [76, 84], hl: ['l1u'] }),
      from: { t: 162, h: 150, a1: [40, 60], a2: [40, 60] } },

    { id: 'lying-hamstring', name: 'Lying hamstring stretch', areas: ['hamstrings'], focus: ['Hamstrings'],
      pos: 'lie', hold: 45, sides: true, calm: true,
      steps: ['Lie on your back.', 'Lift one leg straight up and hold behind the thigh or calf.', 'Gently draw it toward you; keep the other leg long.'],
      feel: 'The back of the raised leg.',
      avoid: 'Bending the raised knee a lot. Lower the leg until it can stay straighter.',
      pose: P(LIE, { l1: [-160, -160], a1: [150, 105], a2: [148, 108], hl: ['l1u'] }),
      from: { l1: [-178, -178], a1: [160, 125], a2: [158, 125] } },

    { id: 'chair-hamstring', name: 'Heel-on-chair hamstring stretch', areas: ['hamstrings', 'calves'], focus: ['Hamstrings'],
      pos: 'stand', hold: 30, sides: true,
      steps: ['Put one heel on a chair seat, leg straight.', 'Keep your back flat.', 'Hinge forward from your hips until you feel it.'],
      feel: 'The back of the raised leg.',
      avoid: 'Rounding your back to reach further.',
      pose: { x: 82, y: 84, t: 150, l1: [64, 64, 150], l2: [-2, -2], a1: [8, 8], a2: [6, 6], hl: ['l1u'], props: [{ k: 'chair', x: 126, y: 120, w: 34 }] },
      from: { t: 176, a1: [-5, -5], a2: [-5, -5] } },

    { id: 'pyramid', name: 'Split-stance hinge', areas: ['hamstrings', 'calves'], focus: ['Hamstrings'],
      pos: 'stand', hold: 30, sides: true,
      steps: ['Step one foot forward about a leg-length.', 'Keep both legs straight and hips square.', 'Hinge forward over the front leg with hands on your hips or a desk.'],
      feel: 'The back of the front leg.',
      avoid: 'Rounding your back to reach the floor.',
      pose: { x: 100, y: 88, t: 112, h: 112, l1: [18, 18], l2: [-18, -18, 60], a1: [-30, -40], a2: [-32, -42], hl: ['l1u'] },
      from: { t: 168, h: 172 } },

    { id: 'down-dog', name: 'Downward dog', areas: ['hamstrings', 'calves', 'upperback', 'shoulders'], focus: ['Hamstrings', 'Calves', 'Lats'],
      pos: 'kneel', hold: 45, sides: false,
      steps: ['From hands and knees, tuck your toes and lift your hips.', 'Press your chest back toward your legs.', 'Pedal your heels toward the floor one at a time.'],
      feel: 'The backs of the legs, calves and through the shoulders.',
      avoid: 'Rounding your back. Bend your knees as much as you need.',
      pose: { x: 100, y: 97, t: 55, h: 30, l1: [-35, -35, 90], l2: [-35, -35, 90], a1: [55, 55, 90], a2: [55, 55, 90], hl: ['l1u', 'l1l', 'upperback'] },
      from: { l1: [-20, -50, 60] } },

    // ─────────────── Calves ───────────────
    { id: 'wall-calf', name: 'Wall calf stretch', areas: ['calves'], focus: ['Calves'],
      pos: 'stand', hold: 30, sides: true,
      steps: ['Hands on a wall, step one foot back.', 'Keep the back leg straight and heel down.', 'Lean your hips toward the wall.'],
      feel: 'The upper calf of the back leg.',
      avoid: 'Turning the back foot out. Toes point at the wall.',
      pose: { x: 110, y: 91, t: 155, l1: [-25, -25, 90], l2: [25, -10], a1: [95, 95], a2: [93, 93], hl: ['l1l'], props: [{ k: 'wall', x: 178 }] },
      from: { t: 170 } },

    { id: 'soleus', name: 'Bent-knee calf stretch', areas: ['calves'], focus: ['Soleus', 'Achilles'],
      pos: 'stand', hold: 30, sides: true,
      steps: ['Hands on a wall, back foot a short step behind.', 'Bend both knees, keeping the back heel down.', 'Sink until you feel the lower calf.'],
      feel: 'Low in the calf toward the Achilles.',
      avoid: 'Letting the back heel lift.',
      pose: { x: 110, y: 96, t: 160, l1: [-10, -32, 70], l2: [30, -12], a1: [93, 93], a2: [91, 91], hl: ['l1l'], props: [{ k: 'wall', x: 172 }] },
      from: { y: 92, t: 170 } },

    { id: 'toe-wall-calf', name: 'Toes-up-the-wall calf stretch', areas: ['calves'], focus: ['Calves', 'Achilles'],
      pos: 'stand', hold: 30, sides: true,
      steps: ['Face a wall and put the ball of one foot up on it, heel on the floor.', 'Keep that leg straight.', 'Bring your hips toward the wall.'],
      feel: 'The whole calf of the front leg.',
      avoid: 'Bending the front knee.',
      pose: { x: 100, y: 84, t: 172, l1: [14, 6, 150], l2: [-4, -2], a1: [15, 160], a2: [13, 160], hl: ['l1l'], props: [{ k: 'wall', x: 117 }] },
      from: { t: 182 } },

    // ─────────────── Wind-down ───────────────
    { id: 'legs-up-wall', name: 'Legs up the wall', areas: ['hamstrings', 'lowerback', 'calves'], focus: ['Hamstrings', 'Relaxation'],
      pos: 'lie', hold: 90, sides: false, calm: true,
      steps: ['Sit side-on to a wall, then swing your legs up as you lie back.', 'Scoot your hips close to the wall.', 'Let your arms rest and breathe slowly.'],
      feel: 'A light stretch in the backs of the legs and calm everywhere else.',
      avoid: 'Forcing straight legs. Back your hips away from the wall if they pull.',
      pose: { x: 132, y: 141, t: -90, l1: [180, 180, -100], l2: [178, 178, -100], a1: [60, 100], a2: [62, 100], hl: ['l1u'], props: [{ k: 'wall', x: 140 }] } },
  ];

  const AREAS = [
    { key: 'neck', name: 'Neck' },
    { key: 'shoulders', name: 'Shoulders' },
    { key: 'chest', name: 'Chest' },
    { key: 'upperback', name: 'Upper back & lats' },
    { key: 'arms', name: 'Arms' },
    { key: 'wrists', name: 'Wrists & forearms' },
    { key: 'lowerback', name: 'Lower back' },
    { key: 'hipflexors', name: 'Hip flexors' },
    { key: 'glutes', name: 'Glutes' },
    { key: 'adductors', name: 'Inner thighs' },
    { key: 'quads', name: 'Quads' },
    { key: 'hamstrings', name: 'Hamstrings' },
    { key: 'calves', name: 'Calves' },
  ];

  const POS = { stand: 'Standing', chair: 'Seated', kneel: 'Kneeling', sit: 'On the floor', lie: 'Lying down' };
  const POS_ORDER = { stand: 0, chair: 1, kneel: 2, sit: 3, lie: 4 };

  window.LIB = { STRETCHES: S, AREAS, POS, POS_ORDER, byId: Object.fromEntries(S.map(s => [s.id, s])) };
})();
