import { useState } from 'react';
import { LANDMARK_OBJECTS } from '@/data/objects/landmarks';
import { ExternalLink, ArrowLeftRight, Layers, Eye, Building2, Calendar, MapPin } from 'lucide-react';
import type { ObjectEntry } from '@/types/game';

export default function LandmarkComparison() {
  const [selectedAId, setSelectedAId] = useState<string>('burj-khalifa');
  const [selectedBId, setSelectedBId] = useState<string>('eiffel-tower');
  const [displayMode, setDisplayMode] = useState<'silhouette' | 'photo'>('silhouette');
  const [activeTab, setActiveTab] = useState<'dual' | 'all' | 'catalog'>('dual');

  const landmarkA = LANDMARK_OBJECTS.find((l) => l.id === selectedAId) || LANDMARK_OBJECTS[0];
  const landmarkB = LANDMARK_OBJECTS.find((l) => l.id === selectedBId) || LANDMARK_OBJECTS[2];

  const sortedLandmarks = [...LANDMARK_OBJECTS].sort((a, b) => b.cm - a.cm);
  const maxHeightCm = Math.max(...LANDMARK_OBJECTS.map((l) => l.cm)); // 82800 cm = 828m

  const ratio = (landmarkA.cm / landmarkB.cm).toFixed(2);
  const heightDiffM = Math.abs(landmarkA.cm - landmarkB.cm) / 100;

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-line pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-reference/30 bg-reference/10 px-3 py-1 text-xs font-semibold text-reference">
            <Building2 size={14} />
            <span>قسم المعالم والأبنية التاريخية | Architectural Heritage</span>
          </div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            مقارنة الأبنية والمعالم التاريخية
          </h1>
          <p className="mt-2 max-w-2xl text-base text-ink-muted">
            مقارنة دقيقة للأطوال والنسب الحقيقية لـ 10 من أشهر ناطحات السحاب وعجائب العمارة التاريخية في العالم، مع رسومات SVG مفرغة وروابط صور دقيقة.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex rounded-xl border border-line bg-stage p-1">
          <button
            type="button"
            onClick={() => setActiveTab('dual')}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition sm:text-sm ${
              activeTab === 'dual' ? 'bg-reference text-canvas font-semibold shadow' : 'text-ink-muted hover:text-ink'
            }`}
          >
            مقارنة ثنائية تفاعلية
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition sm:text-sm ${
              activeTab === 'all' ? 'bg-reference text-canvas font-semibold shadow' : 'text-ink-muted hover:text-ink'
            }`}
          >
            مقارنة الـ 10 معالم معاً
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('catalog')}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition sm:text-sm ${
              activeTab === 'catalog' ? 'bg-reference text-canvas font-semibold shadow' : 'text-ink-muted hover:text-ink'
            }`}
          >
            فهرس الروابط والـ SVG
          </button>
        </div>
      </div>

      {/* Tab 1: Dual Interactive Comparison */}
      {activeTab === 'dual' && (
        <div className="mt-8 flex flex-col gap-8">
          {/* Controls */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-line bg-stage p-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-reference">
                المعلم الأول (Landmark A)
              </label>
              <select
                aria-label="المعلم الأول (Landmark A)"
                value={selectedAId}
                onChange={(e) => setSelectedAId(e.target.value)}
                className="mt-2 w-full rounded-xl border border-line bg-canvas px-3 py-2.5 text-sm font-semibold text-ink outline-none transition focus:border-reference"
              >
                {LANDMARK_OBJECTS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.ar} - {item.en} ({(item.cm / 100).toFixed(0)}m)
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-2xl border border-line bg-stage p-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-mystery">
                المعلم الثاني (Landmark B)
              </label>
              <select
                aria-label="المعلم الثاني (Landmark B)"
                value={selectedBId}
                onChange={(e) => setSelectedBId(e.target.value)}
                className="mt-2 w-full rounded-xl border border-line bg-canvas px-3 py-2.5 text-sm font-semibold text-ink outline-none transition focus:border-mystery"
              >
                {LANDMARK_OBJECTS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.ar} - {item.en} ({(item.cm / 100).toFixed(0)}m)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col justify-between rounded-2xl border border-line bg-stage p-4 sm:col-span-2 lg:col-span-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">نمط العرض</span>
              <div className="mt-2 flex rounded-xl border border-line bg-canvas p-1">
                <button
                  type="button"
                  onClick={() => setDisplayMode('silhouette')}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition ${
                    displayMode === 'silhouette'
                      ? 'bg-reference/20 text-reference font-semibold'
                      : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  SVG مفرغ (Silhouette)
                </button>
                <button
                  type="button"
                  onClick={() => setDisplayMode('photo')}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition ${
                    displayMode === 'photo'
                      ? 'bg-reference/20 text-reference font-semibold'
                      : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  صورة حقيقية (Real Photo)
                </button>
              </div>
            </div>
          </div>

          {/* Quick ratio badge */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-stage/50 px-6 py-4 text-sm">
            <div className="flex items-center gap-2">
              <ArrowLeftRight size={18} className="text-action" />
              <span className="font-medium text-ink">
                <strong>{landmarkA.ar}</strong> ({(landmarkA.cm / 100).toFixed(1)}م) مقابل{' '}
                <strong>{landmarkB.ar}</strong> ({(landmarkB.cm / 100).toFixed(1)}م)
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs sm:text-sm">
              <span className="rounded-md bg-canvas px-3 py-1 font-mono text-ink-muted border border-line">
                النسبة: <strong className="text-ink">{ratio}x</strong>
              </span>
              <span className="rounded-md bg-canvas px-3 py-1 font-mono text-ink-muted border border-line">
                فرق الارتفاع: <strong className="text-ink">{heightDiffM.toFixed(1)} متر</strong>
              </span>
            </div>
          </div>

          {/* Scale Stage */}
          <div className="relative flex h-[460px] w-full flex-col justify-end overflow-hidden rounded-3xl border border-line bg-gradient-to-b from-[#090D18] to-stage px-4 pb-14 pt-8 sm:px-12 sm:pb-16">
            {/* Height Grid Lines */}
            <div className="pointer-events-none absolute inset-0 flex flex-col justify-between px-4 py-8 opacity-20 sm:px-8">
              {[800, 600, 400, 200, 100, 0].map((h) => (
                <div key={h} className="flex items-center border-b border-dashed border-ink-muted/40">
                  <span className="font-mono text-[10px] text-ink-muted">{h}m</span>
                </div>
              ))}
            </div>

            {/* Baseline */}
            <div className="absolute bottom-12 left-0 right-0 h-0.5 bg-line sm:bottom-14" />
            <div className="absolute bottom-4 left-6 text-[11px] font-mono tracking-wider text-ink-muted/60 uppercase">
              Common Ground Baseline (0m)
            </div>

            {/* Comparison objects side-by-side */}
            <div className="relative z-10 flex h-full w-full items-end justify-around">
              {/* Landmark A */}
              <DualStageObject landmark={landmarkA} mode={displayMode} color="#398EFF" maxHeightCm={maxHeightCm} />

              {/* Landmark B */}
              <DualStageObject landmark={landmarkB} mode={displayMode} color="#FF1029" maxHeightCm={maxHeightCm} />
            </div>
          </div>

          {/* Cards for Landmark A and B */}
          <div className="grid gap-6 md:grid-cols-2">
            <LandmarkDetailCard landmark={landmarkA} accentColor="border-reference/40" badgeColor="bg-reference" />
            <LandmarkDetailCard landmark={landmarkB} accentColor="border-mystery/40" badgeColor="bg-mystery" />
          </div>
        </div>
      )}

      {/* Tab 2: All 10 Landmarks Panorama */}
      {activeTab === 'all' && (
        <div className="mt-8 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-ink-muted">
              المعالم العشرة مرتبة من الأطول إلى الأقصر بنفس المقياس النسبي الدقيق (True Scale Comparison):
            </p>
            <div className="flex rounded-lg border border-line bg-stage p-1">
              <button
                type="button"
                onClick={() => setDisplayMode('silhouette')}
                className={`rounded px-2.5 py-1 text-xs ${
                  displayMode === 'silhouette' ? 'bg-reference text-canvas font-semibold' : 'text-ink-muted'
                }`}
              >
                SVG مفرغ
              </button>
              <button
                type="button"
                onClick={() => setDisplayMode('photo')}
                className={`rounded px-2.5 py-1 text-xs ${
                  displayMode === 'photo' ? 'bg-reference text-canvas font-semibold' : 'text-ink-muted'
                }`}
              >
                صورة
              </button>
            </div>
          </div>

          <div className="relative h-[520px] w-full overflow-x-auto rounded-3xl border border-line bg-gradient-to-b from-[#090D18] to-stage px-4 pb-16 pt-8 sm:px-8">
            {/* Grid markings */}
            <div className="pointer-events-none absolute inset-0 flex flex-col justify-between px-4 py-8 opacity-25">
              {[800, 600, 400, 300, 200, 100, 0].map((h) => (
                <div key={h} className="flex items-center border-b border-dashed border-ink-muted/40">
                  <span className="font-mono text-[10px] text-ink-muted">{h}m</span>
                </div>
              ))}
            </div>

            {/* Baseline */}
            <div className="absolute bottom-14 left-0 right-0 h-0.5 bg-line" />

            {/* 10 objects container */}
            <div className="relative z-10 flex h-full min-w-[900px] items-end justify-between gap-4 px-4">
              {sortedLandmarks.map((landmark) => {
                const heightPercent = (landmark.cm / maxHeightCm) * 88;
                return (
                  <button
                    key={landmark.id}
                    type="button"
                    onClick={() => {
                      setSelectedAId(landmark.id);
                      setActiveTab('dual');
                    }}
                    className="group flex flex-col items-center transition hover:-translate-y-1 focus:outline-none"
                    style={{ height: '100%', width: '85px', justifyContent: 'flex-end' }}
                  >
                    <div
                      className="relative w-full flex items-end justify-center transition-transform group-hover:scale-105"
                      style={{ height: `${heightPercent}%` }}
                    >
                      {displayMode === 'silhouette' ? (
                        <div
                          className="h-full w-full transition-opacity group-hover:opacity-100"
                          style={{
                            backgroundColor: '#398EFF',
                            WebkitMaskImage: `url(/assets/objects/landmarks/${landmark.id}.svg)`,
                            maskImage: `url(/assets/objects/landmarks/${landmark.id}.svg)`,
                            WebkitMaskRepeat: 'no-repeat',
                            maskRepeat: 'no-repeat',
                            WebkitMaskPosition: 'bottom center',
                            maskPosition: 'bottom center',
                            WebkitMaskSize: 'contain',
                            maskSize: 'contain',
                          }}
                        />
                      ) : (
                        <img
                          src={landmark.imageUrl}
                          alt={landmark.ar}
                          className="max-h-full max-w-full rounded-md object-contain drop-shadow"
                          loading="lazy"
                        />
                      )}
                    </div>
                    {/* Label below baseline */}
                    <div className="mt-3 flex flex-col items-center text-center">
                      <span className="font-mono text-xs font-bold text-ink">{(landmark.cm / 100).toFixed(0)}m</span>
                      <span className="line-clamp-1 text-[11px] font-medium text-ink-muted group-hover:text-reference">
                        {landmark.ar}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Catalog with Verified Links & SVGs */}
      {activeTab === 'catalog' && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LANDMARK_OBJECTS.map((landmark) => (
            <div
              key={landmark.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-line bg-stage transition hover:border-reference/50"
            >
              {/* Image & SVG preview banner */}
              <div className="relative flex h-48 w-full items-center justify-center overflow-hidden bg-canvas/60 p-4">
                <img
                  src={landmark.imageUrl}
                  alt={landmark.en}
                  className="absolute inset-0 h-full w-full object-cover opacity-25 filter blur-xs"
                />
                <div
                  className="relative z-10 h-36 w-24"
                  style={{
                    backgroundColor: '#F5F6FA',
                    WebkitMaskImage: `url(/assets/objects/landmarks/${landmark.id}.svg)`,
                    maskImage: `url(/assets/objects/landmarks/${landmark.id}.svg)`,
                    WebkitMaskRepeat: 'no-repeat',
                    maskRepeat: 'no-repeat',
                    WebkitMaskPosition: 'bottom center',
                    maskPosition: 'bottom center',
                    WebkitMaskSize: 'contain',
                    maskSize: 'contain',
                  }}
                />
                <span className="absolute bottom-2 right-2 rounded-md bg-canvas/80 px-2 py-0.5 text-xs font-mono font-semibold text-ink">
                  {(landmark.cm / 100).toFixed(1)} متر
                </span>
              </div>

              {/* Info */}
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-lg font-bold text-ink">{landmark.ar}</h3>
                  <span className="text-xs font-semibold text-ink-muted">{landmark.en}</span>
                </div>

                <p className="mt-1 flex items-center gap-1 text-xs text-ink-muted">
                  <MapPin size={12} className="text-action shrink-0" />
                  <span>{landmark.location}</span>
                </p>

                <p className="mt-3 text-xs leading-relaxed text-ink-muted line-clamp-2">
                  {landmark.descriptionAr}
                </p>

                {/* Actions / Links */}
                <div className="mt-auto pt-4 flex items-center justify-between border-t border-line text-xs font-medium">
                  <a
                    href={landmark.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-reference transition hover:underline"
                  >
                    <span>رابط الصورة</span>
                    <ExternalLink size={12} />
                  </a>

                  <a
                    href={`/assets/objects/landmarks/${landmark.id}.svg`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-ink-muted transition hover:text-ink hover:underline"
                  >
                    <span>ملف SVG</span>
                    <ExternalLink size={12} />
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAId(landmark.id);
                      setActiveTab('dual');
                    }}
                    className="rounded bg-line/80 px-2.5 py-1 text-ink hover:bg-reference hover:text-canvas transition"
                  >
                    مقارنة
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function DualStageObject({
  landmark,
  mode,
  color,
  maxHeightCm,
}: {
  landmark: ObjectEntry;
  mode: 'silhouette' | 'photo';
  color: string;
  maxHeightCm: number;
}) {
  const heightPercent = (landmark.cm / maxHeightCm) * 88;

  return (
    <div
      className="flex flex-col items-center justify-end"
      style={{ height: '100%', width: '40%' }}
    >
      <div
        className="relative flex items-end justify-center transition-all duration-500"
        style={{
          height: `${heightPercent}%`,
          width: '100%',
        }}
      >
        {mode === 'silhouette' ? (
          <div
            className="h-full w-full transition-colors duration-500"
            style={{
              backgroundColor: color,
              WebkitMaskImage: `url(/assets/objects/landmarks/${landmark.id}.svg)`,
              maskImage: `url(/assets/objects/landmarks/${landmark.id}.svg)`,
              WebkitMaskRepeat: 'no-repeat',
              maskRepeat: 'no-repeat',
              WebkitMaskPosition: 'bottom center',
              maskPosition: 'bottom center',
              WebkitMaskSize: 'contain',
              maskSize: 'contain',
            }}
          />
        ) : (
          <div className="relative flex h-full w-full items-end justify-center">
            <img
              src={landmark.imageUrl}
              alt={landmark.en}
              className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
              style={{
                filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.6))',
              }}
            />
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-col items-center text-center">
        <span className="font-mono text-sm font-bold text-ink">{(landmark.cm / 100).toFixed(1)} m</span>
        <span className="text-xs font-semibold text-ink-muted">{landmark.ar}</span>
      </div>
    </div>
  );
}

function LandmarkDetailCard({
  landmark,
  accentColor,
  badgeColor,
}: {
  landmark: ObjectEntry;
  accentColor: string;
  badgeColor: string;
}) {
  return (
    <div className={`flex flex-col rounded-3xl border bg-stage p-6 ${accentColor}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${badgeColor}`} />
            <h3 className="text-xl font-bold text-ink">{landmark.ar}</h3>
          </div>
          <p className="mt-0.5 text-sm text-ink-muted">{landmark.en}</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="font-mono text-2xl font-black text-ink">
            {(landmark.cm / 100).toFixed(1)} <span className="text-sm font-normal text-ink-muted">متر</span>
          </span>
          <span className="text-[11px] font-mono text-ink-muted">{landmark.cm.toLocaleString()} cm</span>
        </div>
      </div>

      {/* Quick metadata */}
      <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl border border-line bg-canvas/50 p-3 text-xs">
        <div className="flex items-center gap-2 text-ink-muted">
          <MapPin size={14} className="text-action shrink-0" />
          <span className="line-clamp-1">{landmark.location}</span>
        </div>
        <div className="flex items-center gap-2 text-ink-muted">
          <Calendar size={14} className="text-reference shrink-0" />
          <span>{landmark.yearBuilt}</span>
        </div>
      </div>

      {/* Descriptions */}
      <p className="mt-4 text-sm leading-relaxed text-ink/90">{landmark.descriptionAr}</p>
      <p className="mt-1 text-xs leading-relaxed text-ink-muted italic">{landmark.descriptionEn}</p>

      {/* External reference & SVG buttons */}
      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-line pt-4">
        {landmark.imageUrl && (
          <a
            href={landmark.imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-canvas px-3 py-1.5 text-xs font-medium text-ink transition hover:border-reference hover:text-reference"
          >
            <Eye size={13} />
            <span>عرض الصورة الأصلية عالية الدقة</span>
            <ExternalLink size={11} />
          </a>
        )}

        <a
          href={`/assets/objects/landmarks/${landmark.id}.svg`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-canvas px-3 py-1.5 text-xs font-medium text-ink transition hover:border-action hover:text-action"
        >
          <Layers size={13} />
          <span>فتح ملف الـ SVG المفرغ</span>
          <ExternalLink size={11} />
        </a>

        {landmark.sourceUrl && (
          <a
            href={landmark.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted hover:text-ink transition mr-auto"
          >
            <span>المصدر (Wikipedia)</span>
            <ExternalLink size={11} />
          </a>
        )}
      </div>
    </div>
  );
}
