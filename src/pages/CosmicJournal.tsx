/**
 * Arithmos V3 — Diario Cósmico
 *
 * El diario privado rediseñado con:
 * - Mood selector (emoji wheel)
 * - Cosmic tags (energía del día, signo, número personal)
 * - Escritura libre sin juzgar
 * - Historial con badges de mood
 */

import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useJournal } from "@/hooks/useJournal";
import { CosmicShell } from "@/ui/CosmicShell";
import { generateCosmicDay } from "@/engines/cosmic-feed";
import { useProfile } from "@/hooks/useProfile";
import { useHeartbeat, useTracking } from "@/hooks/useTracking";

/* ============================================================
   MOOD CONFIG
   ============================================================ */

const MOODS = [
  { id: "radiante", emoji: "✨", label: "Radiante", color: "hsl(45 90% 60%)" },
  { id: "expansiva", emoji: "🌊", label: "Expansiva", color: "hsl(200 80% 60%)" },
  { id: "introspectiva", emoji: "🌙", label: "Introspectiva", color: "hsl(270 80% 65%)" },
  { id: "guerrera", emoji: "🔥", label: "Guerrera", color: "hsl(15 90% 60%)" },
  { id: "serena", emoji: "🌿", label: "Serena", color: "hsl(145 60% 55%)" },
  { id: "overwhelmed", emoji: "🌪️", label: "En el caos", color: "hsl(310 70% 60%)" },
  { id: "agradecida", emoji: "💜", label: "Agradecida", color: "hsl(290 70% 65%)" },
  { id: "confusa", emoji: "🌫️", label: "En la niebla", color: "hsl(220 30% 60%)" },
] as const;

type MoodId = (typeof MOODS)[number]["id"];

const COSMIC_TAGS = [
  "portal energético",
  "luna llena",
  "luna nueva",
  "día de reflexión",
  "cierre de ciclo",
  "inicio de ciclo",
  "día de poder",
  "día de soltar",
  "sincronicidad",
  "sueño revelador",
];

/* ============================================================
   COMPONENTS
   ============================================================ */

function MoodSelector({ selected, onSelect }: { selected: MoodId | null; onSelect: (id: MoodId) => void }) {
  return (
    <div>
      <p
        className="text-xs uppercase tracking-widest mb-3"
        style={{ color: "hsl(270 60% 60%)", fontFamily: "var(--cosm-font-display)" }}
      >
        ¿Cómo estás hoy?
      </p>
      <div className="grid grid-cols-4 gap-2">
        {MOODS.map((mood) => (
          <motion.button
            key={mood.id}
            whileTap={{ scale: 0.93 }}
            onClick={() => onSelect(mood.id)}
            className="flex flex-col items-center gap-1 py-3 rounded-2xl"
            style={{
              background:
                selected === mood.id
                  ? `hsla(${mood.color.slice(4, -1)} / 0.25)`
                  : "hsla(260 40% 8% / 0.6)",
              border:
                selected === mood.id
                  ? `1.5px solid ${mood.color}`
                  : "1px solid hsla(270 60% 40% / 0.2)",
              transition: "all 0.2s",
            }}
          >
            <span style={{ fontSize: 22 }}>{mood.emoji}</span>
            <span
              className="text-[10px] font-medium leading-tight text-center"
              style={{
                fontFamily: "var(--cosm-font-body)",
                color: selected === mood.id ? mood.color : "hsl(260 10% 50%)",
              }}
            >
              {mood.label}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function TagChips({ selected, onToggle }: { selected: string[]; onToggle: (tag: string) => void }) {
  return (
    <div>
      <p
        className="text-xs uppercase tracking-widest mb-3"
        style={{ color: "hsl(270 60% 60%)", fontFamily: "var(--cosm-font-display)" }}
      >
        Etiquetas cósmicas
      </p>
      <div className="flex flex-wrap gap-2">
        {COSMIC_TAGS.map((tag) => {
          const isActive = selected.includes(tag);
          return (
            <button
              key={tag}
              onClick={() => onToggle(tag)}
              className="px-3 py-1.5 rounded-full text-xs font-medium"
              style={{
                fontFamily: "var(--cosm-font-body)",
                background: isActive
                  ? "linear-gradient(135deg, hsla(270 80% 60% / 0.3), hsla(310 80% 60% / 0.3))"
                  : "hsla(260 40% 8% / 0.6)",
                border: isActive
                  ? "1px solid hsla(270 80% 65% / 0.6)"
                  : "1px solid hsla(270 60% 40% / 0.2)",
                color: isActive ? "hsl(270 80% 75%)" : "hsl(260 10% 50%)",
                transition: "all 0.2s",
              }}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MoodBadge({ moodId }: { moodId: string }) {
  const mood = MOODS.find((m) => m.id === moodId);
  if (!mood) return null;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
      style={{
        background: `hsla(${mood.color.slice(4, -1)} / 0.15)`,
        border: `1px solid hsla(${mood.color.slice(4, -1)} / 0.4)`,
        color: mood.color,
        fontFamily: "var(--cosm-font-body)",
      }}
    >
      {mood.emoji} {mood.label}
    </span>
  );
}

/* ============================================================
   MAIN PAGE
   ============================================================ */

const CosmicJournal = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { profile, fetchProfile } = useProfile();
  const { entries, isLoading, fetchEntries, createEntry, deleteEntry } = useJournal(user?.id);
  const { trackEvent } = useTracking();
  useHeartbeat('cosmic_journal');

  const [isWriting, setIsWriting] = useState(false);
  const [viewing, setViewing] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedMood, setSelectedMood] = useState<MoodId | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Cosmic context for auto-tags
  const cosmicDay = profile
    ? generateCosmicDay(user?.id ?? "", profile.birthDate, profile.lifePathNumber)
    : null;

  useEffect(() => {
    if (!isAuthenticated) { navigate("/onboarding"); return; }
    fetchEntries();
    if (user?.id) fetchProfile(user.id);
  }, [isAuthenticated, navigate, fetchEntries, user?.id, fetchProfile]);

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  const handleSave = async () => {
    if (!content.trim()) return;
    setIsSaving(true);
    await createEntry(
      title.trim() || `${new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}`,
      content.trim(),
      {
        mood: selectedMood ?? undefined,
        cosmic_mood: cosmicDay?.cosmicMood,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        personal_day: cosmicDay?.numerology.personalDay,
        alignment_score: cosmicDay?.alignmentScore,
      }
    );
    trackEvent('journal_entry_created', 'cosmic_journal', { mood: selectedMood, tagsCount: selectedTags.length });
    setTitle(""); setContent(""); setSelectedMood(null); setSelectedTags([]);
    setIsWriting(false);
    setIsSaving(false);
  };

  const viewedEntry = entries.find((e) => e.id === viewing);

  return (
    <CosmicShell particles={false}>
      <div className="pb-24 min-h-screen">
        {/* Header */}
        <div
          className="sticky top-0 z-20 px-4 py-4 flex items-center justify-between"
          style={{
            background: "hsla(260 40% 4% / 0.9)",
            backdropFilter: "blur(16px)",
            borderBottom: "1px solid hsla(270 60% 40% / 0.15)",
          }}
        >
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm flex items-center gap-2"
            style={{ color: "hsl(260 10% 55%)", fontFamily: "var(--cosm-font-body)" }}
          >
            ← Cosmos
          </button>
          <h1
            className="text-base font-semibold"
            style={{ fontFamily: "var(--cosm-font-display)", color: "hsl(0 0% 95%)" }}
          >
            Diario 📓
          </h1>
          <button
            onClick={() => setIsWriting(true)}
            className="text-sm px-3 py-1.5 rounded-xl font-medium"
            style={{
              fontFamily: "var(--cosm-font-display)",
              background: "linear-gradient(135deg, hsl(270 80% 60%), hsl(310 80% 58%))",
              color: "hsl(0 0% 98%)",
            }}
          >
            + Escribir
          </button>
        </div>

        <div className="px-4 py-6 space-y-6">
          {/* Cosmic context banner */}
          {cosmicDay && (
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-2xl"
              style={{
                background: "hsla(270 60% 12% / 0.4)",
                border: "1px solid hsla(270 60% 40% / 0.2)",
              }}
            >
              <span style={{ fontSize: 20 }}>🌌</span>
              <div>
                <p
                  className="text-xs font-medium"
                  style={{ color: "hsl(270 80% 70%)", fontFamily: "var(--cosm-font-display)" }}
                >
                  Día personal {cosmicDay.numerology.personalDay} · Alineación {cosmicDay.alignmentScore}%
                </p>
                <p
                  className="text-[11px] mt-0.5"
                  style={{ color: "hsl(260 10% 50%)", fontFamily: "var(--cosm-font-body)" }}
                >
                  {cosmicDay.numerology.insight}
                </p>
              </div>
            </div>
          )}

          {/* Writer */}
          <AnimatePresence>
            {isWriting && (
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-5 p-5 rounded-3xl"
                style={{
                  background: "hsla(260 40% 7% / 0.8)",
                  border: "1px solid hsla(270 60% 40% / 0.25)",
                }}
              >
                <MoodSelector selected={selectedMood} onSelect={setSelectedMood} />

                <div>
                  <p
                    className="text-xs uppercase tracking-widest mb-2"
                    style={{ color: "hsl(270 60% 60%)", fontFamily: "var(--cosm-font-display)" }}
                  >
                    Título (opcional)
                  </p>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Dale nombre a este momento..."
                    style={{
                      width: "100%",
                      background: "hsla(260 40% 5% / 0.6)",
                      border: "1px solid hsla(270 60% 40% / 0.3)",
                      borderRadius: 12,
                      padding: "0.75rem 1rem",
                      color: "hsl(0 0% 95%)",
                      fontFamily: "var(--cosm-font-body)",
                      fontSize: "0.875rem",
                      outline: "none",
                    }}
                  />
                </div>

                <div>
                  <p
                    className="text-xs uppercase tracking-widest mb-2"
                    style={{ color: "hsl(270 60% 60%)", fontFamily: "var(--cosm-font-display)" }}
                  >
                    Tu espacio
                  </p>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Escribe sin juzgarte. Nadie más puede leer esto. ¿Qué está pasando en tu mundo interior ahora mismo?"
                    rows={5}
                    style={{
                      width: "100%",
                      background: "hsla(260 40% 5% / 0.6)",
                      border: "1px solid hsla(270 60% 40% / 0.3)",
                      borderRadius: 12,
                      padding: "0.75rem 1rem",
                      color: "hsl(0 0% 95%)",
                      fontFamily: "var(--cosm-font-body)",
                      fontSize: "0.875rem",
                      outline: "none",
                      resize: "none",
                      lineHeight: 1.7,
                    }}
                  />
                </div>

                <TagChips selected={selectedTags} onToggle={toggleTag} />

                <div className="flex gap-3">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSave}
                    disabled={isSaving || !content.trim()}
                    className="flex-1 py-3 rounded-2xl font-semibold text-sm"
                    style={{
                      fontFamily: "var(--cosm-font-display)",
                      background:
                        content.trim()
                          ? "linear-gradient(135deg, hsl(270 80% 60%), hsl(310 80% 58%))"
                          : "hsla(260 40% 20% / 0.4)",
                      color: content.trim() ? "hsl(0 0% 98%)" : "hsl(260 10% 40%)",
                      border: "none",
                    }}
                  >
                    {isSaving ? "Codificando..." : "Sellar en el Cosmos ✨"}
                  </motion.button>
                  <button
                    onClick={() => { setIsWriting(false); setTitle(""); setContent(""); setSelectedMood(null); setSelectedTags([]); }}
                    className="px-4 py-3 rounded-2xl text-sm"
                    style={{
                      fontFamily: "var(--cosm-font-body)",
                      color: "hsl(260 10% 50%)",
                      background: "hsla(260 40% 10% / 0.4)",
                      border: "1px solid hsla(270 60% 40% / 0.2)",
                    }}
                  >
                    Descartar Visión
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Entry list */}
          {isLoading ? (
            <p className="text-center text-sm" style={{ color: "hsl(260 10% 45%)", fontFamily: "var(--cosm-font-body)" }}>
              Sintonizando Frecuencias...
            </p>
          ) : entries.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <span style={{ fontSize: 48 }}>📖</span>
              <p className="text-sm" style={{ color: "hsl(260 10% 45%)", fontFamily: "var(--cosm-font-body)" }}>
                Tu diario está en blanco.<br />
                <span style={{ color: "hsl(270 60% 60%)" }}>El universo espera tus palabras.</span>
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setViewing(entry.id)}
                  className="p-4 rounded-2xl cursor-pointer group"
                  style={{
                    background: "hsla(260 40% 7% / 0.7)",
                    border: "1px solid hsla(270 60% 40% / 0.18)",
                    transition: "border-color 0.2s",
                  }}
                  whileHover={{ borderColor: "hsla(270 60% 40% / 0.45)" }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span
                          className="text-[11px]"
                          style={{ color: "hsl(260 10% 45%)", fontFamily: "var(--cosm-font-body)" }}
                        >
                          {new Date(entry.createdAt).toLocaleDateString("es-MX", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                        {(entry as any).mood && <MoodBadge moodId={(entry as any).mood} />}
                      </div>
                      <h3
                        className="text-sm font-semibold truncate mb-1"
                        style={{ fontFamily: "var(--cosm-font-display)", color: "hsl(0 0% 90%)" }}
                      >
                        {entry.title}
                      </h3>
                      <p
                        className="text-xs line-clamp-2"
                        style={{ color: "hsl(260 10% 50%)", fontFamily: "var(--cosm-font-body)", lineHeight: 1.6 }}
                      >
                        {entry.content}
                      </p>
                      {(entry as any).tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {((entry as any).tags as string[]).map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] px-2 py-0.5 rounded-full"
                              style={{
                                background: "hsla(270 60% 20% / 0.3)",
                                color: "hsl(270 60% 65%)",
                                fontFamily: "var(--cosm-font-body)",
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteEntry(entry.id); }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-opacity shrink-0"
                      style={{ color: "hsl(260 10% 40%)" }}
                    >
                      ✕
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Entry modal */}
        <AnimatePresence>
          {viewedEntry && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewing(null)}
              className="fixed inset-0 z-50 flex items-end justify-center p-4"
              style={{ background: "hsla(260 40% 4% / 0.85)", backdropFilter: "blur(16px)" }}
            >
              <motion.div
                initial={{ y: 60 }}
                animate={{ y: 0 }}
                exit={{ y: 60 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl p-6 space-y-4"
                style={{
                  background: "hsl(260 40% 7%)",
                  border: "1px solid hsla(270 60% 40% / 0.3)",
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs" style={{ color: "hsl(260 10% 45%)", fontFamily: "var(--cosm-font-body)" }}>
                      {new Date(viewedEntry.createdAt).toLocaleDateString("es-MX", {
                        weekday: "long", day: "numeric", month: "long", year: "numeric",
                      })}
                    </p>
                    <h2
                      className="text-lg font-bold"
                      style={{ fontFamily: "var(--cosm-font-display)", color: "hsl(0 0% 95%)" }}
                    >
                      {viewedEntry.title}
                    </h2>
                    {(viewedEntry as any).mood && <MoodBadge moodId={(viewedEntry as any).mood} />}
                  </div>
                  <button
                    onClick={() => setViewing(null)}
                    style={{ color: "hsl(260 10% 45%)", fontSize: 20 }}
                  >
                    ✕
                  </button>
                </div>

                <p
                  className="text-sm leading-relaxed whitespace-pre-wrap"
                  style={{ color: "hsl(260 10% 70%)", fontFamily: "var(--cosm-font-body)", lineHeight: 1.8 }}
                >
                  {viewedEntry.content}
                </p>

                {(viewedEntry as any).tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {((viewedEntry as any).tags as string[]).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-3 py-1 rounded-full"
                        style={{
                          background: "hsla(270 60% 20% / 0.3)",
                          color: "hsl(270 60% 65%)",
                          border: "1px solid hsla(270 60% 40% / 0.3)",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {viewedEntry.aiReflection && (
                  <div
                    className="p-4 rounded-2xl"
                    style={{ background: "hsla(270 60% 12% / 0.5)", border: "1px solid hsla(270 60% 40% / 0.25)" }}
                  >
                    <p
                      className="text-xs uppercase tracking-widest mb-2"
                      style={{ color: "hsl(270 60% 60%)", fontFamily: "var(--cosm-font-display)" }}
                    >
                      💜 Reflexión Cósmica
                    </p>
                    <p
                      className="text-sm italic leading-relaxed"
                      style={{ color: "hsl(270 60% 75%)", fontFamily: "var(--cosm-font-body)" }}
                    >
                      {viewedEntry.aiReflection}
                    </p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </CosmicShell>
  );
};

export default CosmicJournal;
