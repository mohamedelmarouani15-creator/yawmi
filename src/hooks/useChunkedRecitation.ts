import { useRef, useState, useCallback, useEffect } from "react";

interface Options {
  words: string[];          // mots attendus (texte arabe)
  isRecording: boolean;
  accessToken: string | null;
}

interface Result {
  confirmedWordIdx: number; // dernier mot confirmé par Whisper (-1 si aucun)
  resetConfirmed: () => void;
  pushChunk: (blob: Blob) => void; // appeler depuis ondataavailable du MediaRecorder parent
}

/**
 * Hook qui accumule des chunks audio et les envoie toutes les 2s à
 * /api/quran/recite-chunk pour obtenir l'index du dernier mot confirmé.
 *
 * Intégration dans FullPhase (Sprint 2B) :
 *   const { confirmedWordIdx, resetConfirmed, pushChunk } = useChunkedRecitation({
 *     words,
 *     isRecording: recState === "recording",
 *     accessToken: session?.access_token ?? null,
 *   });
 *
 *   // Dans startRec :
 *   mr.ondataavailable = (e) => {
 *     if (e.data.size > 0) {
 *       chunksRef.current.push(e.data);  // pour le scoring final
 *       pushChunk(e.data);               // pour le surlignage temps-réel
 *     }
 *   };
 *
 *   // Remplacer wordIdx par confirmedWordIdx dans WordHighlight.
 */
export function useChunkedRecitation({ words, isRecording, accessToken }: Options): Result {
  const [confirmedWordIdx, setConfirmedWordIdx] = useState(-1);
  const chunksRef    = useRef<Blob[]>([]);
  const intervalRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const isSendingRef = useRef(false);

  // Exposé au composant parent pour accumuler les chunks depuis MediaRecorder
  const pushChunk = useCallback((blob: Blob) => {
    chunksRef.current.push(blob);
  }, []);

  const sendChunk = useCallback(async () => {
    if (isSendingRef.current || chunksRef.current.length === 0) return;
    isSendingRef.current = true;

    // Copier et vider le buffer
    const chunksCopy = [...chunksRef.current];
    chunksRef.current = [];

    try {
      const blob = new Blob(chunksCopy, { type: "audio/webm" });
      const fd = new FormData();
      fd.append("audio", blob, "chunk.webm");
      fd.append("words", JSON.stringify(words));
      fd.append("offset", "0"); // toujours aligner depuis le début

      const res = await fetch("/api/quran/recite-chunk", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken ?? ""}` },
        body: fd,
      });
      if (res.ok) {
        const { confirmed_up_to } = await res.json() as { confirmed_up_to: number };
        if (typeof confirmed_up_to === "number" && confirmed_up_to >= 0) {
          setConfirmedWordIdx(prev => Math.max(prev, confirmed_up_to));
        }
      }
    } catch {
      // silent fail — le score final (recite/route.ts) reste authoritaire
    } finally {
      isSendingRef.current = false;
    }
  }, [words, accessToken]);

  // Démarrer/arrêter l'intervalle selon isRecording
  useEffect(() => {
    if (!isRecording) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // Vider le buffer quand on arrête
      chunksRef.current = [];
      return;
    }
    intervalRef.current = setInterval(sendChunk, 2000);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRecording, sendChunk]);

  const resetConfirmed = useCallback(() => {
    setConfirmedWordIdx(-1);
    chunksRef.current = [];
  }, []);

  return { confirmedWordIdx, resetConfirmed, pushChunk };
}
