# دليل الدقة البصرية — Size It Up

> **الغرض:** هذا الملف هو المرجع التشغيلي (Playbook) لأي عمل مستقبلي على اللعبة:
> إضافة صور/عناصر جديدة، تعديل القياس، تغيير طريقة العرض، أو صيانة المقبض.
> **الحالة:** القواعد هنا هي التي أوصلت اللعبة إلى الدقة الحالية. لا تتجاوزها بدون سبب موثّق.
> **آخر تحديث:** 2026-11-13
>
> **علاقته بـ `PROMPT-visual-only-game.md`:** ملف التصميم القديم يصف الفكرة العامة.
> هذا الملف يوثّق **التنفيذ الحالي**، خصوصًا بعد إزالة شريط القياس وربط المقبض بحافة الشكل.
> عند التعارض في موضوع القياس/المقبض، فالاعتماد على هذا الملف.
>
> **علاقته بـ `WORLD-MAPS-GAME-BLUEPRINT.md`:** ذاك ملف منفصل لبناء لعبة الدول بالمساحة (km²)
> كتطبيق مستقل. هذا الملف يبقى مرجع القياس البصري العام، وذاك يشرح لعبة الخرائط من الصفر.

---

## 0. الخلاصة التنفيذية

اللعبة دقيقة الآن لأنها تفصل بين ثلاثة أشياء لا تختلط:

1. **الحقيقة الرقمية:** قيمة `cm` المخزنة لكل جسم هي المصدر الوحيد للقياس.
2. **التمثيل البصري:** الشكل هو الذي يعرض هذه القيمة، عبر مقياس بكسل/سم ثابت للجولة.
3. **التفاعل:** السحب يغيّر التقدير بالنسبة لحركة المؤشر، وليس بالنسبة لموضع المقبض أو الصندوق.

المشاكل التي كانت تسبب انحرافًا بصريًا وحُلّت:

- letterboxing داخل SVG كان يجعل الرسم أصغر من صندوقه.
- مقبض التحجيم كان عند زاوية الصندوق، وقد تكون فارغة.
- المرجع كان يمكن أن يصغر أثناء تحجيم الهدف.
- الهدف كان يمكن أن يتحرك تحت المؤشر أثناء التحجيم.
- ظهور الشكل القديم لحظة تحميل الصور.

---

## 1. القواعد غير القابلة للكسر (Non-negotiables)

هذه القواعد هي عقد اللعبة. أي تعديل يكسر واحدة منها يعيد مشكلة الدقة:

1. **المرجع لا يتغير ولا يتحرك أثناء تحجيم الهدف.**
   - مقياس الجولة يُحسب من `startingDims` + `actualDims` فقط.
   - لا يدخل `estimateDims` (التقدير الحي) في `pairScalePxPerCm`.

2. **مركز الهدف ثابت أثناء التحجيم.**
   - يُثبّت على footprint البداية/الحقيقة، لا على التقدير الحي.
   - وإلا سيتبع الشكل المؤشر ويصبح التحجيم غير دقيق.

3. **التحجيم يعتمد على فرق حركة المؤشر (delta)، وليس على الإحداثيات المطلقة للمقبض.**

4. **المقبض مربوط بحافة الشكل المرسومة، وليس بزاوية الصندوق.**
   - للطول: منتصف أطول امتداد مرسوم على الحافة اليمنى.
   - للارتفاع: منتصف أطول امتداد مرسوم على الحافة العليا.

5. **كل ملف SVG يجب أن يحتوي `preserveAspectRatio="none"` في جذر `<svg>`.**
   - بدونها يعمل المتصفح letterbox داخل القناع، فيصغر الرسم ويظهر فراغ.

6. **لا تُرسم الصور قبل معرفة إطار المحتوى المعتم.**
   - `artReady` يمنع ظهور الشكل القديم/الصغير لحظة التحميل.

7. **لا أرقام، ولا وحدات، ولا أسماء محاور، ولا مساطر، ولا أقواس قياس قبل تثبيت التقدير.**
   - بعد التثبيت فقط تظهر القيمة الحقيقية.

8. **المقارنة بنفس المحور فقط.**
   - `length` مع `length`، و`height` مع `height`، و`wingspan` مع `wingspan`، إلخ.
   - لا يوجد fallback بين محورين.

9. **السحب للتحريك يبقى يعمل.**
   - جسم الهدف = تحريك.
   - المقبض = تحجيم.
   - عجلة الماوس فوق الهدف = تحجيم نسبي.

10. **العربية/RTL ليست طبقة تجميل.**
    - أسماء المرجع والهدف لا تُقص.
    - لا يوجد تمرير أفقي أو تداخل مع الكابشن.

11. **لا تغيّر منطق النقاط أو الجولات أو الوضع الأونلاين عند تعديل القياس.**
    - القياس البصري منفصل عن `scoring.ts` و`gameReducer.ts`.

---

## 2. كيف تعمل الدقة الآن (Measurement Contract)

### 2.1 البيانات

كل عنصر في `src/data/objects/*.ts` يملك:

```ts
{
  id: string;
  en: string;
  ar: string;
  axis: 'height' | 'width' | 'length' | 'diameter' | 'wingspan';
  cm: number;
  aspect: number;
  aspectOverride?: number;
  aspectSource?: 'published' | 'art';
  aspectNote?: string;
  measureStart?: number; // 0..1
  measureEnd?: number;   // 0..1
  difficulty: 1 | 2 | 3;
  domain?: Domain;
  art?: string;
  comparable?: boolean;
}
```

- `cm` = القيمة الحقيقية للمحور.
- `axis` = المحور الذي تُقارن به.
- `aspect` / `aspectOverride` = نسبة المحور المقاس إلى البعد غير المقاس.
- `measureStart` / `measureEnd` = الجزء من الشكل الذي يمثل `cm`.
  - أفقيًا: من اليسار إلى اليمين.
  - رأسيًا: من الأرض إلى أعلى الرسم.
  - الافتراضي: الشكل كامل.
- `art` = مجلد الصورة داخل `public/assets/objects/`، والافتراضي هو `categoryId`.

### 2.2 معادلات العرض

الملف المسؤول: `src/lib/geometry.ts`.

```ts
const start = clamp01(measureStart ?? 0);
const end   = clamp01(measureEnd ?? 1);
const lo    = Math.min(start, end);
const hi    = Math.max(start, end);
const fraction = Math.max(0.15, hi - lo);
```

> الكود الفعلي يرتّب `start` و`end` أولًا، فلا يهم إن جاءت القيم معكوسة.

المحور الأفقي (`length`, `wingspan`, `width`):

```ts
widthCm  = cm / fraction
heightCm = widthCm / aspect
```

المحور الرأسي (`height`):

```ts
heightCm = cm / fraction
widthCm  = cm * min(aspect, 1)
```

المحور `diameter`:

```ts
size = cm / fraction
widthCm = heightCm = size
```

**كيف تُختار نسبة العرض الفعلية؟**

الملف: `src/lib/geometry.ts` → `resolveDisplayAspect`.

1. إذا وُجد `aspectOverride` فهو الأولوية.
2. إذا كان المحور `wingspan` بدون override: يُستخدم `FALLBACK_WINGSPAN_ASPECT = 2.8` (لا يُؤخذ من pose الرسم).
3. إذا كان إطار الصورة جاهزًا: تُستخدم نسبة الإطار المقاس (`contentAspect`).
4. أخيرًا فقط: `aspect` من البيانات.

معنى ذلك أن `aspect` في البيانات هو **fallback**، وليس الحاكم، عند وجود صورة.
إذا كان الرسم نفسه غير دقيق، فالحل هو `aspectOverride` المشتق من القياس المنشور.

الطول المقاس بالبكسل:

```ts
measuredSpanPx = (axis === 'height' ? box.h : box.w) * fraction
```

وهذا هو "المسطرة الحقيقية": `cm` تُضرب في `scale`، ثم تُوزّع على `fraction` من الصندوق.

### 2.3 مقياس الجولة (لماذا المرجع ثابت؟)

الملف: `src/lib/stageFit.ts`.

```ts
widthScale  = (safeWidth - gap) / (reference.widthCm + targetWidth)
heightScale = safeHeight / max(reference.heightCm, targetHeight)
scale       = min(widthScale, heightScale)
```

في `GameStage.tsx`:

```ts
fitScale = pairScalePxPerCm(
  width, height,
  referenceDims,
  actualDims,
  stagePadding,
  [startingDims], // ← البداية فقط
);
```

- `actualDims` = الحجم الحقيقي للهدف.
- `startingDims` = حجم البداية (يساوي حجم المرجع تقريبًا، بعد clamp).
- **لا** يدخل `estimateDims` هنا. لذلك لا يصغر المرجع عندما يكبر الهدف.

القيم الحالية:

```ts
PLAY_STAGE_PADDING  = { top: 56, right: 88, bottom: 44, left: 24, gap: 48 }
REVEAL_STAGE_PADDING = { top: 72, right: 24, bottom: 56, left: 24, gap: 36 }
```

وفي `GameStage` يوجد هامش أيسر متجاوب لحماية كابشن المرجع:

```ts
leftPadding = max(24, min(92, width * 0.25))
```

### 2.4 تثبيت الهدف أثناء التحجيم

- `startingEstimateCm` يُجمّد عند تركيب المكوّن:

```ts
const startingEstimateCm = useRef(estimateCm).current;
```

- `GameStage` يُعاد تركيبه لكل جولة عبر `key={challenge.id}`، فلا تتسرب قيمة جولة إلى جولة.
- مركز الهدف يُحسب من الحجم الأكبر بين البداية والحقيقة:

```ts
targetCx = targetCenterX(
  width,
  max(startingDims.widthCm, actualDims.widthCm) * scale,
  stagePadding,
);
```

- أثناء السحب للتحريك، `targetAnchor` يُحدّث، لكن أثناء التحجيم يبقى ثابتًا.
- هذا يمنع "هروب" الشكل من تحت المؤشر.

### 2.5 التحجيم

الملف: `src/components/GameStage.tsx`.

- بداية السحب تسجل فقط:
  - `pointerId`
  - `mode: 'move' | 'resize'`
  - `startX`, `startY`
  - `startCm`
  - `anchor`

- أثناء التحجيم:

```ts
const { fraction } = measureSpan(target);

const deltaCm =
  target.axis === 'height'
    ? (-dy / scale) * fraction
    : ((2 * dx) / scale) * fraction;
```

- `2 * dx` لأن الصندوق يتمدد من الجهتين حول مركز ثابت.
- `fraction` لأن `cm` تمثل جزءًا من الشكل الكامل.
- لا يُقرأ موضع المقبض نفسه، ولا يلزم أن يكون المؤشر فوق الحافة.

- عجلة الماوس:

```ts
const WHEEL_STEP = 0.001;
const delta = event.deltaY * (deltaMode === 1 ? 16 : deltaMode === 2 ? 100 : 1);
const factor = clamp(Math.exp(-delta * WHEEL_STEP), 0.75, 1.33);
onEstimateChange(latestEstimateCm.current * factor);
```

- تُضاف عبر `addEventListener('wheel', ..., { passive: false })` حتى نمنع تمرير الصفحة.
- الأسهم: `KEYBOARD_STEP = 1.05`.

### 2.6 المقبض على الشكل

الملف: `src/lib/imageContent.ts`.

عند قياس الصورة:

- نرسمها على canvas بحجم أقصى 256 بكسل.
- نستخدم `ALPHA_THRESHOLD = 12`.
- نستخرج إطار المحتوى المعتم (`x`, `y`, `width`, `height`).
- نضيف أيضًا:

```ts
rightAnchor?: number;  // 0..1 داخل الإطار
leftAnchor?: number;
topAnchor?: number;
bottomAnchor?: number;
```

كل anchor هو **منتصف أطول امتداد معتم** على تلك الحافة.

ثم في `GameStage`:

```ts
const gripHorizontal = target.axis !== 'height';
const gripLeft = gripHorizontal ? 100 : topAnchor * 100;
const gripTop  = gripHorizontal ? rightAnchor * 100 : 0;
```

- المحور الأفقي: المقبض على الحافة اليمنى، عموديًا على منتصف الرسم عند تلك الحافة.
- المحور الرأسي: المقبض على الحافة العليا، أفقيًا على منتصف الرسم عند تلك الحافة.

بهذا لا يمكن أن يقع المقبض في زاوية صندوق فارغة.

### 2.7 الرسم والقناع

`src/components/SilhouetteObject.tsx`:

- يحوّل إطار المحتوى المعتم إلى أبعاد الصندوق.
- يستخدم `mask-size: 100% 100%`.
- `overflow-hidden` يمنع تجاوز الصندوق.
- إذا لم تكن الصورة موجودة: placeholder متقطع.
- إذا لم يكن الإطار جاهزًا: لا نعرض شيئًا حتى `artReady`.

`src/hooks/useImageContent.ts`:

- يحمّل الصورة مرة واحدة.
- يقيس الإطار.
- يخزنه في `Map` حسب `src`.
- يعيد `missing` / `available` / `frame`.

### 2.8 التخطيط واللغة

- المرجع: `pointer-events-none z-10`، فوق الهدف عند التداخل.
- الهدف: قابل للسحب، `touch-none`.
- الكابشن: `w-44 max-w-[46%]` في اللعب، `w-36` في الكشف.
- شريط التكبير: زاوية ثابتة حسب اتجاه اللغة.
- لا تستخدم `direction: rtl` على المسرح نفسه؛ المسرح `dir="ltr"`، والنصوص العربية تُعرض باتجاهها الطبيعي.

---

## 3. ما الذي جعل النتيجة دقيقة؟ (سجل الإصلاحات)

| المشكلة | السبب الجذري | الإصلاح | الدليل |
|---|---|---|---|
| الشكل يبدو أصغر من صندوقه والفراغ حوله كبير | `preserveAspectRatio="xMidYMid meet"` في SVG، فيعمل letterbox داخل القناع | تغيير كل الـ100 ملف إلى `preserveAspectRatio="none"` | صندوق 420×60 كان يرسم قرش الحوت بحجم ~60×60 قبل الإصلاح، وبعد الإصلاح امتلأ الصندوق |
| المقبض يقع في فراغ | كان عند زاوية الصندوق (`left-full top-0`) | anchor من البكسلات المعتمة على الحافة | قرش الحوت: المقبض عند 100% يمينًا و88.3% عموديًا، على حافة الذيل |
| المرجع يصغر أثناء التحجيم | `pairScalePxPerCm` كانت تستخدم التقدير الحي | تجميد `startingEstimateCm` واستخدام `startingDims` + `actualDims` فقط | أثناء تكبير الهدف من 256 إلى 312.7 بكسل، بقي المرجع 256×64 تمامًا |
| الهدف يتحرك تحت المؤشر | المركز كان يشتق من التقدير الحي | تجميد المركز على footprint البداية/الحقيقة | لا قفزات أثناء السحب أو العجلة |
| الشكل القديم يظهر لحظة التحميل | الرسم كان يُعرض قبل قياس إطار المحتوى | `artReady` قبل عرض الصور | لا وميض letterbox عند فتح الجولة |
| كابشن المرجع يُقص | المرجع قريب من حافة المسرح | هامش أيسر متجاوب + `max-w` للكابشن | العربية والإنجليزية بلا قص |
| شريط القياس يزحم المشهد ويكشف الإجابة | `DimensionGuide` | حُذف؛ الشكل نفسه هو الدليل | لا أرقام ولا أقواس قبل التثبيت |
| تحجيم غير دقيق بالماوس | الاعتماد على موضع المقبض/الإحداثيات | delta فقط + wheel native listener | نفس النتيجة من المقبض والعجلة |

### أرقام التحقق الحالية

- قرش الحوت داخل اللعبة: صندوق `256 × 53.3` بكسل، والبكسلات المرسومة `252 × 53`.
- أثناء تكبير الجسم الغامض: المرجع بقي `256 × 64` بكسل.
- الماعز (محور ارتفاع): المقبض عند `top: 0%` و`left: 42.16%`، أي على أعلى نقطة مرسومة.
- كل الـ100 ملف SVG تحت `public/assets/objects/` تحتوي `preserveAspectRatio="none"`.

---

## 4. خريطة الملفات الحرجة

| الملف | الدور | لا تكسره |
|---|---|---|
| `src/components/GameStage.tsx` | المسرح، السحب، التحجيم، العجلة، المقبض، الكابشن | تجميد المقياس والمركز |
| `src/components/SilhouetteObject.tsx` | تحويل إطار المحتوى إلى قناع | `mask-size: 100% 100%` و`overflow-hidden` |
| `src/lib/imageContent.ts` | قياس البكسلات المعتمة + anchors | alpha threshold والـ normalized anchors |
| `src/hooks/useImageContent.ts` | تحميل/تخزين إطار الصورة | لا تعيد القياس كل render |
| `src/lib/geometry.ts` | `visualDimensionsCm`, `measureSpan`, `measuredBox` | معادلات `fraction` |
| `src/lib/stageFit.ts` | `pairScalePxPerCm`, `groundY`, المراكز | لا تدخل التقدير الحي |
| `src/lib/gameReducer.ts` | بداية التقدير = حجم المرجع | لا تغيّر منطق النقاط |
| `src/components/PlayScreen.tsx` | ربط الجولة بالمسرح | `key={challenge.id}` ضروري |
| `src/components/online/RevealStage.tsx` | كشف الأونلاين | المقياس يشمل التقديرات + الحقيقة |
| `src/components/landing/CategoryCards.tsx` | صور البطاقات | تعمل مع `SilhouetteObject` |
| `src/components/LandmarkComparison.tsx` | مقارنة المعالم | يستخدم `maskSize: contain`، لا تغيّره |
| `src/data/objects/*.ts` | بيانات العناصر | `cm` و`aspect` و`measure*` |
| `src/data/duels.ts` | مبارزات منسقة | نفس المحور فقط |

---

## 5. دورة إضافة صورة/عنصر جديد (The Cycle)

اتبع الخطوات بالترتيب. لا تنتقل لخطوة قبل إنهاء سابقتها.

### الخطوة 0 — Define the object

- حدد العنصر: `id`, `en`, `ar`.
- حدد المحور: `length` / `height` / `wingspan` / `width` / `diameter`.
- حدد `cm` من مصدر موثوق.
- سجّل `sourceUrl` إن وُجد.
- إذا كان العنصر ملتفًا (ثعبان) أو غير قابل للتمثيل بصدق بصندوق، اجعله `comparable: false` أو لا تضفه.

### الخطوة 1 — Prepare the SVG

المواصفات المقبولة:

- شكل ظلّي واحد (silhouette) بلون واحد.
- خلفية شفافة تمامًا.
- لا إطار، لا نص، لا علامة مائية، لا تدرجات لونية.
- تعبئة معتمة (alpha) وليست `fill="none"` أو خطوطًا رفيعة فقط.
- الاتجاه الطبيعي للمحور:
  - `length`: رؤية جانبية كاملة، الجسم مفرود أفقيًا.
  - `height`: واقف/كامل من الأرض إلى أعلى نقطة.
  - `wingspan`: الأجنحة مبسوطة بالكامل.
  - `diameter`: رؤية أمامية/دائرية.
- يُفضّل أن يكون الرسم كبيرًا داخل لوحة SVG، لكن الفراغ الشفاف مقبول لأن الكود يقصّه.
- **مهم:** إذا كان الرسم عموديًا/مربعًا بينما المحور أفقي، سيتمدد بقوة. الأفضل رسم جانبي قانوني بدل الاعتماد على `aspectOverride`.

بعد وضع الملف في:

```
public/assets/objects/<art-folder>/<id>.svg
```

شغّل مثبّت `preserveAspectRatio` (القسم 7).

### الخطوة 2 — Verify the painted frame

- افتح اللعبة أو استخدم سكربت القسم 7.
- تأكد أن الإطار المعتم يغطي الرسم كاملًا (وليس الصندوق فقط).
- إذا كان الرسم في زاوية اللوحة أو صغيرًا جدًا، أعد رسمه أو أقصّ اللوحة قبل الإضافة.
- تحقق من أن الحافة اليمنى/العليا ليست شريحة رفيعة تختفي عند تصغير الشاشة.

### الخطوة 3 — Choose aspect / measure span

- تذكّر: عند وجود الصورة، نسبة العرض الافتراضية تأتي من **إطار الرسم المقاس**، وليس من `aspect` في البيانات. `aspect` يعمل كـ fallback فقط. لذلك إذا كان الرسم نفسه غير دقيق، `aspectOverride` هو الحل.
- إذا كان الرسم مطابقًا للنسب الحقيقية: لا تحتاج `aspectOverride`.
- إذا كان الرسم غير مطابق (مربع، ملتف، pose خاطئ): احسب `aspectOverride` من القياس المنشور:

```
length:    aspect = measuredLength / unmeasuredHeight
height:    aspect = width / measuredHeight   (غالبًا < 1)
wingspan:  aspect = wingspan / bodyDepth
```

- أضف `aspectSource: 'published'` و`aspectNote` بالاشتقاق.
- للحيوانات ذات الذيل:
  - `measureStart: 0`.
  - `measureEnd` = نسبة نهاية الجسم (قاعدة الذيل) إلى عرض الرسم المعتم.
  - تحقق بصريًا أن `measureEnd` يقع عند قاعدة الذيل، وليس في منتصف الجسم.
- للارتفاع مع قرون/أذن مستبعدة:
  - `measureEnd` أقل من 1 يعني استبعاد أعلى جزء.
  - تذكّر: `measureEnd` رأسيًا يُقاس من الأرض إلى الأعلى، والكود يعكس الاتجاه عند العرض.

### الخطوة 4 — Add the data entry

أضف العنصر إلى الملف المناسب:

- حيوانات/بحري/طيور: `src/data/objects/animals.ts`
- أبنية ومعالم: `src/data/objects/landmarks.ts`
- كل ما تبقّى (مركبات، طعام، رياضة، تقنية، عوالم): `src/data/objects/world.ts`

`MIXED_OBJECTS` يجمع الثلاثة تلقائيًا، فلا تكرر الإضافة هناك.

مثال:

```ts
{
  id: 'example_animal',
  en: 'Example Animal (Adult Body Length)',
  ar: 'حيوان مثال',
  axis: 'length',
  cm: 180,
  aspect: 1.6,
  aspectOverride: 1.6,
  aspectSource: 'published',
  aspectNote: '1.8 m body ÷ 1.12 m height ≈ 1.6.',
  measureStart: 0,
  measureEnd: 0.88,
  difficulty: 2,
  domain: 'animal',
  art: 'animals-new',
  sourceUrl: 'https://...',
}
```

### الخطوة 5 — Pair a reference

الملف: `src/data/duels.ts` و`src/lib/challenges.ts`.

- المرجع يجب أن يكون **نفس المحور**.
- النطاق المفضل: نسبة الحجم بين 0.45 و2.2.
- إن لم توجد مبارزة منسقة، `pickReference` تختار أقرب حجم لوغاريتميًا.
- لا تخلط بين حيوان مقطوع الذيل وحيوان كامل الذيل إذا كانت نسبة الاستبعاد متطرفة؛ قد تبدو المقارنة غير عادلة.
- بعد الإضافة، شغّل اللعبة وتحقق من ظهور العنصر كهدف وليس فقط كمرجع.

### الخطوة 6 — Verify the round

افتح الجولة وتأكد من:

- [ ] الرسم يملأ الصندوق (لا فراغ حوله).
- [ ] المقبض على الحافة المرسومة، وليس في زاوية فارغة.
- [ ] المرجع لا يتغير أثناء سحب المقبض.
- [ ] العجلة فوق الهدف تكبّر/تصغّر الهدف فقط.
- [ ] سحب جسم الهدف يحرّكه.
- [ ] لا أرقام/وحدات/محاور قبل التثبيت.
- [ ] الكابشن العربي والإنجليزي كامل.
- [ ] الجوال 360px واللابتوب.
- [ ] بعد التثبيت تظهر القيمة الحقيقية في بطاقة الإجابة.
- [ ] النقاط والجولات تعمل.

### الخطوة 7 — Build & commit

```bash
npm run typecheck
npm run lint
npm run build
```

---

## 6. Definition of Done

لا تعتبر الإضافة مكتملة حتى تتحقق كل النقاط:

- [ ] `npm run typecheck` يمر.
- [ ] `npm run lint` يمر.
- [ ] `npm run build` يمر.
- [ ] ملف SVG موجود في المسار الصحيح، وجذره `preserveAspectRatio="none"`.
- [ ] الصورة ليست مربعة/ملتفة لمحور أفقي بدون `aspectOverride` مبرر.
- [ ] `cm` و`aspect` و`aspectNote` موثقة.
- [ ] `measureEnd` صحيح إن كان العنصر مقطوع الذيل.
- [ ] الهدف والمرجع نفس المحور.
- [ ] لا تداخل بين الكابشن والصور أو أزرار التكبير.
- [ ] العربية والإنجليزية تعملان.
- [ ] لا أرقام قبل lock.
- [ ] المرجع ثابت (اختبار wheel + grip).
- [ ] المقبض على البكسل المرسوم.
- [ ] الوضع الأونلاين لم يتأثر.

---

## 7. أوامر وسكربتات جاهزة

### 7.1 فحص سريع لكل ملفات SVG

```powershell
$files = Get-ChildItem -Path 'public\assets\objects' -Recurse -Filter *.svg
$bad = @()
foreach ($f in $files) {
  $head = (Get-Content $f.FullName -TotalCount 12) -join "`n"
  if ($head -notmatch 'preserveAspectRatio="none"') { $bad += $f.FullName }
}
"Total: $($files.Count) | Bad: $($bad.Count)"
$bad
```

### 7.2 تثبيت `preserveAspectRatio="none"` (مع نسخة احتياطية)

```powershell
$backup = Join-Path $env:TEMP ('objects-svg-backup-' + (Get-Date -Format 'yyyyMMdd-HHmmss'))
New-Item -ItemType Directory -Path $backup -Force | Out-Null
Copy-Item -Path 'public\assets\objects\*' -Destination $backup -Recurse -Force
"Backup: $backup"

$utf8 = New-Object System.Text.UTF8Encoding($false)
$files = Get-ChildItem -Path 'public\assets\objects' -Recurse -Filter *.svg
$changed = 0

foreach ($f in $files) {
  $text = [System.IO.File]::ReadAllText($f.FullName)
  $m = [regex]::Match($text, '<svg\b[^>]*>', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
  if (-not $m.Success) { continue }

  $tag = $m.Value
  $clean = [regex]::Replace(
    $tag,
    '\s+preserveAspectRatio\s*=\s*("[^"]*"|''[^'']*'')',
    '',
    [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
  )
  $newTag = [regex]::Replace(
    $clean,
    '<svg\b',
    '<svg preserveAspectRatio="none"',
    [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
  )

  if ($newTag -ne $tag) {
    $updated = $text.Substring(0, $m.Index) + $newTag + $text.Substring($m.Index + $m.Length)
    [System.IO.File]::WriteAllText($f.FullName, $updated, $utf8)
    $changed++
  }
}

"Changed: $changed"
```

> لا تشغّل هذا السكربت على صور ليست ضمن `public/assets/objects/`.
> مجلد النسخ الاحتياطي خارج المشروع في `%TEMP%`، فلا تعتمد عليه كمصدر دائم.

### 7.3 فحص البكسلات المعتمة لأي SVG (في المتصفح)

افتح أي صفحة من اللعبة، ثم Console:

```js
async function auditSvg(src) {
  const img = new Image();
  img.src = src;
  await img.decode();

  const c = document.createElement('canvas');
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0);
  const d = ctx.getImageData(0, 0, c.width, c.height).data;

  let minX = c.width, minY = c.height, maxX = -1, maxY = -1, count = 0;
  for (let y = 0; y < c.height; y++) {
    for (let x = 0; x < c.width; x++) {
      if (d[(y * c.width + x) * 4 + 3] > 12) {
        count++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  return {
    natural: [c.width, c.height],
    frame: [maxX - minX + 1, maxY - minY + 1],
    aspect: (maxX - minX + 1) / (maxY - minY + 1),
    opaquePixels: count,
  };
}

await auditSvg('/assets/objects/animals/sheep.svg');
```

### 7.4 فحص ثبات المرجع أثناء التحجيم

في Console على جولة مفتوحة:

```js
const box = (el) => {
  const r = el.getBoundingClientRect();
  return { x: r.x, y: r.y, w: r.width, h: r.height };
};

const mystery = document.querySelector('[data-testid="mystery-object"]');
const reference = mystery.previousElementSibling;

const before = box(reference);
mystery.dispatchEvent(new WheelEvent('wheel', { deltaY: -200, bubbles: true, cancelable: true }));
await new Promise((r) => setTimeout(r, 250));
const after = box(reference);

console.log({ before, after, same: JSON.stringify(before) === JSON.stringify(after) });
```

---

## 8. أخطاء شائعة وحلولها

| العَرَض | السبب | الحل |
|---|---|---|
| الشكل صغير داخل صندوقه والفراغ كبير | SVG يعمل letterbox | `preserveAspectRatio="none"` |
| المقبض في فراغ | anchor عند زاوية الصندوق | استخدم `rightAnchor` / `topAnchor` |
| المرجع يصغر أثناء التحجيم | `estimateDims` دخلت في `pairScalePxPerCm` | استخدم `startingDims` + `actualDims` فقط |
| الشكل يقفز تحت المؤشر | المركز يتبع التقدير الحي | ثبّت `targetAnchor` أثناء التحجيم |
| الكابشن العربي مقصوص | المرجع قريب من الحافة | هامش أيسر متجاوب |
| الصورة تظهر لحظيًا بشكل قديم | الرسم قبل قياس الإطار | `artReady` |
| الذيل يُحسب ضمن `cm` بالخطأ | `measureEnd` غير مضبوط | اضبط `measureEnd` عند قاعدة الذيل |
| الحيوان يبدو مضغوطًا/طويلًا جدًا | رسم مربع أو pose خاطئ | `aspectOverride` أو رسم جانبي قانوني |
| المقارنة غير عادلة | محور مختلف أو ذيل بنسبة متطرفة | نفس المحور + مراجعة `measureEnd` |
| تحجيم العجلة يمرر الصفحة | listener passive | `{ passive: false }` |
| زر التكبير يغطي الشكل | z-index/الحشو | راجع `ZoomControls` و`stagePadding` |

---

## 9. برومت المستقبل (Copy-Paste)

### النسخة الإنجليزية (للوكيل البرمجي)

```text
You are working on "Size It Up", a visual size-guessing game built with React + TypeScript + Vite + Tailwind. It is bilingual (Arabic/English) with full RTL support.

FIRST, read these files before changing anything:
- PLAYBOOK-accurate-visual-sizing.md
- src/components/GameStage.tsx
- src/components/SilhouetteObject.tsx
- src/lib/geometry.ts
- src/lib/imageContent.ts
- src/lib/stageFit.ts
- src/hooks/useImageContent.ts
- src/data/objects/*.ts
- src/types/game.ts

TASK
Add the following new objects/images:
{{LIST_OF_OBJECTS_WITH_NAMES_AND_CM_OR_SOURCES}}

For each object, decide and document:
- id, en, ar
- axis: length | height | wingspan | width | diameter
- real cm and source URL
- SVG file path under public/assets/objects/<art-folder>/<id>.svg
- aspect or aspectOverride with a short derivation
- measureStart / measureEnd if a tail or an excluded part exists

NON-NEGOTIABLE RULES
1. The reference must never shrink, grow, or move while the mystery is resized.
   - pairScalePxPerCm must use startingDims + actualDims, never the live estimate.
2. The mystery centre must stay fixed during resize.
3. Resize must use pointer delta, not the grip's absolute coordinates.
4. The grip must anchor to the painted silhouette edge, not the bounding-box corner.
5. Every SVG root must have preserveAspectRatio="none".
6. Do not paint silhouettes before the opaque content frame is ready (artReady).
7. No numbers, units, axis names, rulers, brackets, or measurement labels during guessing.
8. Same-axis comparisons only.
9. Keep drag-to-move and wheel-to-resize.
10. Keep Arabic/RTL layouts intact.
11. Do not change scoring, round count, or online mode.

WORKFLOW
1. Inspect the provided images. Reject or redraw anything that is not a clean, transparent-background silhouette.
2. Run the preserveAspectRatio normalizer from the playbook.
3. Verify the painted content frame and the edge anchors with the browser audit snippet.
4. Add data entries to the correct file (animals.ts, landmarks.ts, or world.ts).
5. Pair each new target with a same-axis reference using duels.ts or the existing pickReference logic.
6. Run:
   npm run typecheck
   npm run lint
   npm run build
7. Open a real round and verify:
   - reference box is pixel-for-pixel identical before/after a wheel resize
   - the grip sits on a painted pixel
   - the silhouette fills its measured box
   - mobile 360px + desktop
   - Arabic + English
   - no pre-lock numbers or units
8. Report changed files, new assets, test evidence (numbers), and any open design notes.

DO NOT
- Do not "fix" a pair by changing its real cm.
- Do not use the SVG's natural pose as truth for a published measurement.
- Do not reintroduce a bracket or ruler.
- Do not remove pointer-events-none from the reference.
- Do not crop or dim excluded tails unless the user explicitly asks; current behavior keeps them visible and uses measureEnd only for cm.
- Do not modify the backup folder or rely on it as a permanent source.

DELIVERABLES
- Code changes
- New SVG assets
- Data entries
- Verification numbers
- A short note for any object that still needs a better canonical silhouette
```

### النسخة العربية المختصرة

```text
أضف الصور/العناصر التالية إلى لعبة Size It Up وفق الملف PLAYBOOK-accurate-visual-sizing.md:

{{قائمة العناصر + القياسات + المصادر}}

القواعد:
- المرجع ثابت تمامًا أثناء تحجيم الهدف.
- مركز الهدف ثابت أثناء التحجيم.
- التحجيم بفرق حركة المؤشر، وليس بموضع المقبض.
- المقبض على حافة الشكل المرسومة، وليس زاوية الصندوق.
- كل SVG: preserveAspectRatio="none" وخلفية شفافة وشكل ظلّي نظيف.
- لا أرقام/وحدات/مساطر/أقواس قبل التثبيت.
- نفس المحور فقط.
- العربية/RTL تعمل.
- لا تلمس النقاط أو الجولات أو الأونلاين.

الخطوات:
1. جهّز الصور واختبر الإطار المعتم.
2. أضف البيانات في الملف الصحيح.
3. اختر مرجعًا بنفس المحور.
4. شغّل typecheck + lint + build.
5. اختبر جولة فعلية: ثبات المرجع، المقبض على الشكل، الجوال، العربية.
6. سلّم تقريرًا بالتغييرات وأرقام التحقق.
```

---

## 10. ملاحظات مفتوحة وقرارات مستقبلية

هذه ليست أخطاء، لكنها نقاط تستحق قرارًا عند التوسع:

1. **الذيل المستبعد غير مُعلَّم بصريًا.**
   - `measureEnd` يستبعد الذيل من `cm`، لكن الشكل الكامل يظهر.
   - إذا قدّر اللاعب من طرف الأنف إلى طرف الذيل، قد يزيد التقدير.
   - الخيارات: تفتيح الجزء المستبعد، أو قصّه، أو قبول الانحياز.
   - حاليًا: الشكل الكامل يظهر، والقياس يستخدم `measureEnd`.

2. **الصور العمودية/المربعة للمحاور الأفقية.**
   - قرش الحوت مثال: لوحة مربعة تمددت إلى 4.8:1.
   - الأفضل مستقبلًا رسم جانبي قانوني بدل الاعتماد على التمدد.

3. **المقبض 32px قد يكون كبيرًا على الأجسام الصغيرة جدًا.**
   - مفيد للمس، لكنه يغطي جزءًا من الذيل الرفيع.
   - يمكن تصغيره إلى 28px عند الحاجة.

4. **لا توجد اختبارات آلية لإطار الصورة.**
   - الفحص الحالي يدوي عبر المتصفح.
   - أي إضافة صور جديدة يجب أن تمر بسكربت 7.3.

5. **ملفات `PROMPT-visual-only-game.md` و`CONTENT_PLAN.ar.md` قديمة جزئيًا.**
   - `CONTENT_PLAN` يذكر `mask-size: contain` وهذا لم يعد صحيحًا.
   - هذا الملف هو المرجع الحالي للقياس البصري.

---

## 11. سجل التغييرات المهمة

- إزالة `DimensionGuide` نهائيًا من اللعب والكشف.
- إضافة `artReady` لمنع وميض الصور.
- تجميد مقياس الجولة باستخدام `startingEstimateCm`.
- تثبيت مركز الهدف أثناء التحجيم.
- إضافة `rightAnchor` / `leftAnchor` / `topAnchor` / `bottomAnchor`.
- ربط المقبض بالحافة المرسومة.
- إضافة تحجيم بعجلة الماوس مع `passive: false`.
- استعادة السحب للتحريك.
- تحويل كل ملفات SVG إلى `preserveAspectRatio="none"`.
- تحديث نصوص المساعدة لتقول "المقبض" بدل "الزاوية".

---

**قاعدة أخيرة:** إذا احترت بين "شكل أجمل" و"قياس أصدق"، اختر القياس الأصدق. اللعبة قائمة على الثقة بالعين، وأي خداع بصري غير مقصود يهدم الفكرة.
