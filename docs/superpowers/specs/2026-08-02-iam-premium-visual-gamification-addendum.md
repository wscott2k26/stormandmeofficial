# I AM Premium Visual and Ethical Gamification Addendum

**Date:** 2026-08-02  
**Owner:** Storm And Me LLC  
**Applies to:** `2026-08-02-iam-real-web-companion-design.md`  
**Status:** Binding design addendum, implementation not yet started

## 1. Purpose

Add the premium visual treatment and motivating progress system discussed in Google's earlier product guidance without turning I AM into a childish game, a generic chatbot wrapper, or a retention system that exploits distress.

This addendum is part of the approved I AM web-companion design. Where it adds detail, it governs the implementation.

## 2. Premium visual system

I AM must feel like a premium adult whole-life companion rather than a basic website embedded inside Storm And Me.

### Visual language

- Rich, restrained gradients that shift by lane and context.
- Deep charcoal or midnight surfaces with soft glass-like layering.
- Subtle light blooms, shadows, and edge highlights rather than loud neon everywhere.
- Consistent rounded corners, spacing, typography hierarchy, and icon treatment.
- Strong contrast and readable body copy at all supported viewport sizes.
- Premium but emotionally calm: never visually chaotic during vulnerable conversations.

### Lane identity

- **Him:** grounded, confident, calm depth; stronger contrast and structured surfaces.
- **Her:** warm, expressive, elegant depth; softer luminous transitions without stereotyped pink-only design.
- **Becoming:** balanced, adaptive, user-led palette with the broadest personalization range.

The lanes may change accents, language, and atmosphere, but they must not alter safety standards, feature access, or the quality of help.

### Context-aware gradients

Gradients may communicate state without pretending to diagnose emotion:

- Calm/reflective conversation: slow, low-contrast ambient gradient.
- Planning and action: slightly brighter directional gradient and clearer structure.
- Goal completion: brief warm glow or shimmer.
- Safety Path: visually quiet, high legibility, minimal animation, and no celebratory treatment.
- Error or offline state: restrained neutral warning treatment, not alarming red floods.

### Motion and feedback

- Press and tap feedback on all interactive controls.
- Smooth route and panel transitions.
- Subtle companion-orb movement while idle.
- Gentle typing/listening animation while a response is being prepared.
- Small sparkle, glow, or lift after a genuine completed action.
- Reduced-motion support disables nonessential movement.
- No endless animation designed to keep users staring at the screen.

## 3. Companion presence

I AM should have a recognizable premium companion presence, such as a living light orb or energy core, without presenting it as a human, lover, therapist, or conscious being.

The companion presence may:

- React subtly when the user sends a message.
- Shift atmosphere when a plan is created or progress is recorded.
- Offer concise encouragement tied to a real action.
- Reflect the selected lane and user-approved style settings.

It must not:

- Say the user is all it needs or that it needs the user.
- Express jealousy, abandonment, romantic attachment, or emotional dependence.
- Punish absence or shame the user for leaving.
- Suggest that a human is monitoring the conversation.

## 4. Ethical gamification model

The progress system is called **Momentum**, not an addictive points economy. It rewards real-world growth and honest reflection rather than message volume or time spent in the app.

### Momentum Hub

The signed-in dashboard becomes a whole-life progress hub containing:

- One optional Daily Move.
- Current Momentum level or progress bar.
- Active goals and the next smallest step.
- Recent wins selected or confirmed by the user.
- A `Continue` action that returns to a real conversation, plan, or goal.
- A life-area path showing progress across areas the user chose.
- The companion presence reacting briefly to completed progress.

### Daily Moves

Daily Moves are small, practical, optional actions such as:

- Write down the one task that matters most today.
- Take a ten-minute walk.
- Send one follow-up email.
- Review one bill.
- Check in with one trusted person.
- Spend five minutes preparing tomorrow.

Daily Moves must be editable, dismissible, and never generated from crisis disclosures as a retention mechanism.

### Momentum points

Momentum may be earned for completed real actions, including:

- Completing a user-confirmed goal step.
- Following through on a plan.
- Recording a real-world win.
- Reviewing and updating a goal.
- Completing an optional reflection.

Momentum is not earned for:

- Sending more chat messages.
- Sharing more intimate or traumatic details.
- Remaining online longer.
- Opening the app repeatedly.
- Entering crisis or abuse flows.
- Inviting contacts or posting publicly.

### Streak replacement

I AM will not use a fragile daily streak that resets to zero and creates guilt. It will use a **Rhythm** indicator:

- Tracks consistency across a flexible rolling window.
- Allows rest days without punishment.
- Does not display loss language such as `You broke your streak`.
- Can be hidden by the user.
- Never changes safety access or core AI quality.

### Levels and milestones

Milestones reflect meaningful progress rather than status competition. Suggested stages:

1. Starting
2. Building
3. Steady
4. Growing
5. Becoming

Names may change during visual review, but levels must not imply clinical recovery, superiority, or failure.

### Celebration moments

- Brief glow, shimmer, soft haptic later on mobile, or companion reaction.
- Clear statement of the real action completed.
- Optional encouraging message.
- No casino sounds, loot boxes, spinning wheels, random rewards, countdown pressure, or purchasable progress.
- Celebrations are disabled or subdued in Safety Path and crisis contexts.

## 5. Meaningful differentiation

The premium gradients and Momentum system are not decorative extras. They connect the real AI conversation to a user-controlled growth loop:

1. User describes a real challenge.
2. I AM helps clarify options and one next move.
3. User chooses whether to convert that move into a plan or goal.
4. The user completes the real-world step.
5. Momentum records and reflects the progress.
6. The companion later uses only user-approved memories and active goals to provide continuity.

This connection between conversation, agency, action, memory, goals, safety, and progress is the primary differentiator from a generic chat interface.

## 6. Interaction honesty

Every gamified or visual element must have a real function:

- Progress bars use real stored progress.
- Goal cards open real goal details.
- Daily Moves can be completed, skipped, edited, or replaced.
- Celebration appears only after a confirmed action succeeds.
- Companion reactions correspond to actual system state.
- Disabled features explain why they are unavailable.
- Nothing is styled like a button unless it is actionable.

## 7. Accessibility and emotional safety

- Gradients must preserve WCAG-compliant text contrast.
- Progress is never communicated by color alone.
- Animation has reduced-motion behavior.
- Screen readers receive concise progress and success announcements.
- Users may hide Momentum, Rhythm, celebrations, and companion motion.
- No leaderboard, social comparison, public ranking, or shame-based copy.
- No reward is tied to crisis disclosure, abuse disclosure, or frequency of emotional dependence.
- Safety before engagement remains the controlling principle.

## 8. Data requirements

The first implementation plan must verify whether the existing Supabase schema can safely represent:

- Daily Moves
- Goal-step completion
- Momentum events
- Rhythm calculations
- Milestones
- User visibility preferences

No production schema change is authorized by this addendum. Any required migration must be written, reviewed, tested outside production where possible, and separately approved before application.

## 9. Testing requirements

- Every interactive card and button has a tested handler.
- Momentum changes only after a successful confirmed write.
- Duplicate submissions cannot award duplicate progress.
- Rest days do not create negative or loss states.
- Crisis and Safety Path flows do not award points or launch celebrations.
- Reduced-motion and hidden-gamification settings work.
- Gradient contrast passes accessibility review across all lanes.
- Mobile and desktop layouts receive a visual review before merge.

## 10. Additional release gates

The I AM web companion cannot be called premium or complete until:

1. The visual system is consistent across auth, onboarding, Talk, goals, memories, settings, and Safety Path.
2. Gradients and motion are polished, restrained, responsive, and accessible.
3. Momentum is backed by real stored actions rather than mock numbers.
4. Daily Moves, goal progress, and celebrations work end to end.
5. No dead controls or fake progress remain.
6. No streak guilt, random rewards, dark patterns, or crisis-based engagement optimization exists.
7. The experience still passes Google's three ingredients: real utility, high-quality UX, and meaningful differentiation.

## 11. Scope control

The first working increment should prioritize:

1. Real AI chat.
2. Real plan and goal conversion.
3. A simple Momentum bar based on completed goal steps.
4. One optional Daily Move.
5. A restrained completion celebration.

Advanced levels, deeper personalization, and larger progression paths come only after the core AI and action loop is stable. This keeps the experience genuine rather than covering broken functionality with visual effects.