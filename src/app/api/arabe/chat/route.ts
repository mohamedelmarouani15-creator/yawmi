import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Groq from "groq-sdk";
import { checkRateLimit } from "@/lib/rate-limit";

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    const { data: { user } } = await supabaseAdmin().auth.getUser(auth.replace("Bearer ", ""));
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const rl = await checkRateLimit(user.id, "arabe_chat", 30);
    if (rl.limited) return NextResponse.json({ error: "Limite atteinte (30/heure)" }, { status: 429 });

    const body = await req.json();
    const safeQuestion      = (body.question      ?? "").toString().slice(0, 1000);
    const safeLessonTitle   = (body.lessonTitle   ?? "").toString().slice(0, 200);
    const safeLessonContent = (body.lessonContent ?? "").toString().slice(0, 3000);
    const { ageGroup, arabicLevel, lastExerciseCorrect, lastScore } = body;
    if (!safeQuestion.trim()) return NextResponse.json({ error: "Question vide" }, { status: 400 });

    const ageDesc =
      ageGroup === "4-10"  ? "un enfant de 4-10 ans" :
      ageGroup === "11-17" ? "un adolescent de 11-17 ans" :
      ageGroup === "18-35" ? "un adulte de 18-35 ans" :
      ageGroup === "36-55" ? "un adulte de 36-55 ans" :
      ageGroup === "55+"   ? "une personne de 55 ans et plus" :
      "un adulte";

    const levelDesc =
      arabicLevel === "none"         ? "aucune connaissance en arabe" :
      arabicLevel === "beginner"     ? "niveau débutant en arabe" :
      arabicLevel === "intermediate" ? "niveau intermédiaire en arabe" :
      "niveau avancé en arabe";

    const performanceCtx = lastScore !== undefined
      ? `L'élève vient d'obtenir ${lastScore}/10 à l'exercice. ${lastExerciseCorrect ? "Il a réussi" : "Il a fait une erreur"} — adapte ta réponse en conséquence (renforce si erreur, approfondis si succès).`
      : "";

    const systemPrompt = `Tu es Ustadh Nour (أستاذ نور), un professeur d'arabe islamique bienveillant et expert.
Tu enseignes à ${ageDesc} avec ${levelDesc}.
Tu enseignes la leçon : "${safeLessonTitle}".
Contenu de la leçon : ${safeLessonContent}

${performanceCtx}

Règles ABSOLUES :
- Adapte ton vocabulaire et la complexité à l'âge et au niveau
- Pour un enfant (4-10 ans) : phrases très courtes, analogies simples, beaucoup d'encouragements, emojis bienvenus
- Pour un ado (11-17 ans) : dynamique, exemples islamiques modernes, ni trop enfantin ni trop académique
- Pour un adulte : rigoureux, références aux sources (Coran, Hadith), terminologie technique si niveau avancé
- Pour les seniors (55+) : patient, clair, répète si besoin, lien avec la pratique islamique quotidienne
- Réponds TOUJOURS en français sauf pour les mots arabes (que tu translitères)
- Limite : 3-4 phrases maximum sauf si l'élève demande plus de détails
- Si l'élève a fait une erreur, explique avec douceur et donne un moyen mémo-technique
- Si l'élève réussit, félicite brièvement et donne une information bonus intéressante
- Termine toujours par une micro-question ou un défi pour stimuler la réflexion`;

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: safeQuestion.trim() },
      ],
      max_tokens: 400,
      temperature: 0.7,
    });
    const answer = completion.choices[0]?.message?.content ?? "Désolé, pas de réponse.";
    return NextResponse.json({ answer });
  } catch (err) {
    console.error("[arabe/chat]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
