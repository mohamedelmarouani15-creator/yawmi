-- ═══════════════════════════════════════════════════════════════
-- Yawmi V3 — Seed arc Yûsuf (Sourate 12)
-- CONTENU À VALIDER PAR UNE PERSONNE QUALIFIÉE AVANT DIFFUSION PUBLIQUE
-- Sources : Coran (Sourate Yûsuf, 12) uniquement.
-- Aucun dialogue inventé mis dans la bouche des prophètes.
-- ═══════════════════════════════════════════════════════════════

-- Status 'published' pour accès famille. Valider avec une personne qualifiée
-- avant toute diffusion publique (voir note en bas de page dans l'app).
insert into stories (id, title, title_ar, arc_type, total_chapters, status, order_index)
values (
  'arc_yusuf',
  'L''histoire de Yûsuf',
  'قِصَّةُ يُوسُفَ',
  'prophets',
  10,
  'published',
  1
)
on conflict (id) do nothing;

-- ─────────────────────────────────────────────────────────────
-- CHAPITRE 1 — Le rêve des onze étoiles
-- ─────────────────────────────────────────────────────────────
insert into story_chapters (story_id, chapter_number, title, narrative, vocabulary, questions, values_shown, rewards)
values (
  'arc_yusuf', 1,
  'Le rêve des onze étoiles',

  E'Je suis un tapis de prière. Tissu de laine et de fil d''or, j''ai voyagé à travers les âges et les contrées. Ce soir, je me trouve dans la demeure du prophète Ya''qûb — que la paix soit sur lui —, dans la terre de Canaan, là où le ciel touche la terre et où les étoiles semblent si proches qu''on pourrait les cueillir.\n\nUn garçon entre dans la pièce. Il s''appelle Yûsuf. Son visage porte une lumière sereine que je n''ai jamais vue sur aucun visage humain. Il s''agenouille, ses mains jointes devant lui, et confie à son père ce qu''il vient de voir pendant son sommeil.\n\nLe Coran nous rapporte ses paroles : il a vu onze étoiles, le soleil et la lune — tous se prosternant devant lui. (Sourate Yûsuf, 12:4)\n\nYa''qûb écoute. Il comprend la gravité de ce rêve — une ru''ya, une vision nocturne accordée par Allah. Avec toute sa sagesse de prophète, il conseille à Yûsuf de ne pas raconter ce rêve à ses frères. Ce n''est pas par méfiance, mais par amour et par prévoyance : il connaît la fragilité du cœur humain face à ce qu''il perçoit comme une préférence.\n\nLa leçon du tapis : certaines grâces méritent d''être gardées secrètes, non par honte, mais par sagesse. Ce que l''on protège dans le silence, Allah le protège à Son tour.',

  '[{"word_ar": "رُؤْيَا", "translit": "ru''ya", "definition_fr": "vision nocturne, rêve prophétique", "example": "رَأَيْتُ فِي رُؤْيَايَ (j''ai vu dans ma vision)"}]',

  '[
    {"id":"c1_q1","type":"comprehension","text":"Combien d''étoiles Yûsuf a-t-il vues se prosterner dans son rêve, en plus du soleil et de la lune ?","options":[{"text":"7","correct":false},{"text":"11","correct":true},{"text":"12","correct":false},{"text":"9","correct":false}]},
    {"id":"c1_q2","type":"vocabulary","text":"Quel est le mot arabe pour ''vision nocturne / rêve prophétique'' appris dans ce chapitre ?","options":[{"text":"صَبْر (sabr)","correct":false},{"text":"رُؤْيَا (ru''ya)","correct":true},{"text":"قَافِلَة (qafila)","correct":false},{"text":"نُور (nur)","correct":false}]},
    {"id":"c1_q3","type":"reflection","text":"Ya''qûb conseille à Yûsuf de garder son rêve secret. Selon toi, pourquoi est-ce parfois sage de ne pas partager immédiatement une bonne nouvelle ?","reflection_prompt":"Il n''y a pas de mauvaise réponse. Le tapis t''écoute."},
    {"id":"c1_q4","type":"spaced_repetition","text":"(À reposer au chapitre 4) — Garde ce mot en mémoire : رُؤْيَا (ru''ya) = vision nocturne.","options":[],"spaced_ref":"c1_q2"}
  ]',

  ARRAY['sagesse', 'discrétion', 'protection_parentale'],

  '{"xp": 50, "coins": 15}'
);

-- ─────────────────────────────────────────────────────────────
-- CHAPITRE 2 — La jalousie des frères
-- ─────────────────────────────────────────────────────────────
insert into story_chapters (story_id, chapter_number, title, narrative, vocabulary, questions, values_shown, rewards)
values (
  'arc_yusuf', 2,
  'La jalousie des frères',

  E'Je voyage dans le temps. Les saisons ont passé. Yûsuf a grandi, et avec lui grandit quelque chose de douloureux dans le cœur de ses frères : le hasad — la jalousie.\n\nLe Coran nous le dit sans détour : les frères de Yûsuf disent entre eux que leur père l''aime plus qu''eux, et qu''ils sont pourtant un groupe soudé. (Sourate Yûsuf, 12:8)\n\nLe hasad est une émotion humaine. Elle naît de la comparaison, de la crainte de n''être pas assez aimé. Les frères de Yûsuf ne sont pas des monstres — ce sont des hommes qui souffrent. Mais la jalousie, quand on la laisse grandir sans la nommer ni la dompter, peut conduire aux actes les plus graves.\n\nJe reste immobile dans un coin de la pièce. Je vois les regards, j''entends les mots échangés à voix basse. Les frères complotent. Ils veulent écarter Yûsuf — l''envoyer loin, dans une terre inconnue, pour retrouver l''attention exclusive de leur père.\n\nLe Coran est honnête : même dans les familles aimantes, la jalousie peut surgir. Ce n''est pas une honte de la ressentir. La honte serait de lui laisser la main sur nos actes.\n\nLa leçon du tapis : reconnaître le hasad en soi-même, c''est déjà lui ôter une partie de son pouvoir.',

  '[{"word_ar": "حَسَد", "translit": "hasad", "definition_fr": "jalousie, envie", "example": "الحَسَدُ يُؤْذِي صَاحِبَهُ (la jalousie blesse celui qui la porte)"}]',

  '[
    {"id":"c2_q1","type":"comprehension","text":"Quelle est la principale raison pour laquelle les frères de Yûsuf lui en veulent, selon le Coran (12:8) ?","options":[{"text":"Yûsuf est plus intelligent qu''eux","correct":false},{"text":"Leur père l''aime plus qu''eux à leurs yeux","correct":true},{"text":"Yûsuf a pris leurs biens","correct":false},{"text":"Yûsuf a rapporté leurs fautes à leur père","correct":false}]},
    {"id":"c2_q2","type":"vocabulary","text":"Quel est le mot arabe pour ''jalousie / envie'' appris dans ce chapitre ?","options":[{"text":"رُؤْيَا (ru''ya)","correct":false},{"text":"صَبْر (sabr)","correct":false},{"text":"حَسَد (hasad)","correct":true},{"text":"عَفْو (''afw)","correct":false}]},
    {"id":"c2_q3","type":"reflection","text":"Le Coran parle de la jalousie des frères sans les condamner totalement. Que penses-tu : peut-on éprouver de la jalousie tout en étant une bonne personne ?","reflection_prompt":"Réfléchis librement. Le tapis n''est pas là pour juger."},
    {"id":"c2_q4","type":"spaced_repetition","text":"Tu te souviens du chapitre 1 ? Comment s''appelait le rêve de Yûsuf en arabe ?","options":[{"text":"حَسَد (hasad)","correct":false},{"text":"رُؤْيَا (ru''ya)","correct":true},{"text":"صَبْر (sabr)","correct":false},{"text":"قَافِلَة (qafila)","correct":false}],"spaced_ref":"c1_q2"}
  ]',

  ARRAY['dangers_du_hasad', 'fraternite', 'famille'],

  '{"xp": 50, "coins": 15}'
);

-- ─────────────────────────────────────────────────────────────
-- CHAPITRE 3 — Le puits et la belle patience
-- ─────────────────────────────────────────────────────────────
insert into story_chapters (story_id, chapter_number, title, narrative, vocabulary, questions, values_shown, rewards)
values (
  'arc_yusuf', 3,
  'Le puits et la belle patience',

  E'Les frères demandent à leur père la permission d''emmener Yûsuf avec eux. Ils promettent de le protéger. Ya''qûb hésite — il pressent quelque chose. Mais il leur confie Yûsuf, avec une prière dans le cœur.\n\nJe ne peux pas les suivre dans le désert. Mais le Coran me raconte ce qui se passe.\n\nLes frères jettent Yûsuf au fond d''un puits. (Sourate Yûsuf, 12:15)\n\nDans le fond de ce puits sombre, seul, sans eau ni lumière suffisante, Yûsuf a onze ans ou à peine plus. Tout être humain aurait pu se briser là. Mais Allah lui révèle, dans ce puits même, qu''Il lui fera connaître cette épreuve à ses frères un jour — et ils ne le reconnaîtront pas. (12:15) C''est une promesse divine dans le cœur d''un enfant dans un puits.\n\nLes frères reviennent auprès de Ya''qûb en pleurant, lui présentant la chemise de Yûsuf couverte de faux sang. Ya''qûb ne les croit pas. Et il dit ces mots qui traversent les siècles : صَبْرٌ جَمِيلٌ — une belle patience. (Sourate Yûsuf, 12:18)\n\nUne belle patience. Pas une résignation amère, pas une capitulation. Une patience qui garde la dignité, qui ne se plaint qu''à Allah, et qui fait confiance à Sa sagesse même dans l''inexplicable.\n\nLa leçon du tapis : il y a une différence entre subir et choisir de tenir. Le sabr jamîl, c''est ce deuxième chemin.',

  '[{"word_ar": "صَبْر", "translit": "sabr", "definition_fr": "patience, endurance intérieure", "example": "صَبْرٌ جَمِيلٌ (sabrun jamîl = une belle patience)"}]',

  '[
    {"id":"c3_q1","type":"comprehension","text":"Que dit Ya''qûb quand ses fils lui apportent la chemise ensanglantée de Yûsuf ?","options":[{"text":"Il pleure et se tait","correct":false},{"text":"Il les accuse de mensonge et les chasse","correct":false},{"text":"Il dit ''une belle patience'' et remet son affaire à Allah","correct":true},{"text":"Il part chercher Yûsuf lui-même","correct":false}]},
    {"id":"c3_q2","type":"vocabulary","text":"صَبْرٌ جَمِيلٌ (sabrun jamîl) signifie :","options":[{"text":"Une grande tristesse","correct":false},{"text":"Une belle patience","correct":true},{"text":"Un long voyage","correct":false},{"text":"Une parole douce","correct":false}]},
    {"id":"c3_q3","type":"reflection","text":"Ya''qûb perd son fils bien-aimé et répond par une ''belle patience''. Qu''est-ce que cela t''inspire sur la façon de traverser une épreuve difficile ?","reflection_prompt":"Prends le temps d''y réfléchir. Il n''y a pas de bonne ou mauvaise réponse."},
    {"id":"c3_q4","type":"spaced_repetition","text":"Rappel du chapitre 2 : quel mot arabe décrit ce qui rongeait le cœur des frères de Yûsuf ?","options":[{"text":"صَبْر (sabr)","correct":false},{"text":"حَسَد (hasad)","correct":true},{"text":"رُؤْيَا (ru''ya)","correct":false},{"text":"عَفْو (''afw)","correct":false}],"spaced_ref":"c2_q2"}
  ]',

  ARRAY['sabr', 'patience_dans_l_epreuve', 'foi_en_allah'],

  '{"xp": 60, "coins": 20}'
);

-- ─────────────────────────────────────────────────────────────
-- CHAPITRE 4 — La caravane vers l'Égypte
-- ─────────────────────────────────────────────────────────────
insert into story_chapters (story_id, chapter_number, title, narrative, vocabulary, questions, values_shown, rewards)
values (
  'arc_yusuf', 4,
  'La caravane vers l''Égypte',

  E'Je reprends mon voyage. Une qafila — une caravane — s''arrête près du puits. Un des voyageurs descend un seau pour tirer de l''eau. Et il remonte Yûsuf.\n\nLe Coran nous dit que le voyageur s''écrie de bonheur à la vue de l''enfant. Il annonce à ses compagnons qu''il a trouvé un garçon, et ils le cachent comme une marchandise. (Sourate Yûsuf, 12:19-20)\n\nYûsuf n''a rien demandé. Il ne s''est pas sauvé lui-même. C''est la providence d''Allah — Al-Qadar — qui a fait passer cette caravane précisément ce jour-là, précisément à ce moment, au-dessus de ce puits.\n\nLa caravane descend vers l''Égypte. Yûsuf est vendu pour quelques pièces d''argent. Le Coran dit que ses frères ne lui accordaient aucune valeur. (12:20)\n\nMais Allah, Lui, connaît la valeur de Yûsuf. Et c''est cela qui compte.\n\nLe tapis que je suis a voyagé sur des routes poudreuses, dans les pas de caravanes innombrables. Ce que j''ai appris : la route que l''on ne choisit pas peut mener là où l''on était destiné à arriver. La qafila qui emmène Yûsuf en Égypte ne sait pas qu''elle est l''instrument d''une promesse divine.\n\nLa leçon du tapis : ce qui ressemble à une fin peut n''être que le début d''une route que seul Allah voit entièrement.',

  '[{"word_ar": "قَافِلَة", "translit": "qafila", "definition_fr": "caravane de voyageurs ou marchands", "example": "مَرَّتْ قَافِلَةٌ (une caravane passa)"}]',

  '[
    {"id":"c4_q1","type":"comprehension","text":"Comment Yûsuf sort-il du puits selon le Coran ?","options":[{"text":"Il escalade les parois","correct":false},{"text":"Ses frères reviennent le chercher","correct":false},{"text":"Des voyageurs d''une caravane l''y trouvent en tirant de l''eau","correct":true},{"text":"Ya''qûb le retrouve grâce à un rêve","correct":false}]},
    {"id":"c4_q2","type":"vocabulary","text":"Quel est le mot arabe pour ''caravane'' appris dans ce chapitre ?","options":[{"text":"رُؤْيَا (ru''ya)","correct":false},{"text":"قَافِلَة (qafila)","correct":true},{"text":"صَبْر (sabr)","correct":false},{"text":"أَمِين (amin)","correct":false}]},
    {"id":"c4_q3","type":"reflection","text":"Yûsuf n''a pas choisi cette route. Pourtant, elle le mène vers sa destinée. As-tu vécu un moment où quelque chose d''inattendu s''est révélé être une chance ?","reflection_prompt":"Le tapis a vu bien des routes. Il t''écoute."},
    {"id":"c4_q4","type":"spaced_repetition","text":"Rappel du chapitre 1 : Yûsuf a eu une vision nocturne. Comment dit-on ''vision nocturne'' en arabe ?","options":[{"text":"قَافِلَة (qafila)","correct":false},{"text":"حَسَد (hasad)","correct":false},{"text":"رُؤْيَا (ru''ya)","correct":true},{"text":"صَبْر (sabr)","correct":false}],"spaced_ref":"c1_q2"}
  ]',

  ARRAY['providence_divine', 'qadar', 'confiance_en_allah'],

  '{"xp": 60, "coins": 20}'
);

-- ─────────────────────────────────────────────────────────────
-- CHAPITRE 5 — La maison d'Al-'Aziz
-- ─────────────────────────────────────────────────────────────
insert into story_chapters (story_id, chapter_number, title, narrative, vocabulary, questions, values_shown, rewards)
values (
  'arc_yusuf', 5,
  'La maison d''Al-''Aziz',

  E'Je suis maintenant en Égypte. Le sol est différent ici — la terre rouge du Nil, les palmiers hauts, les maisons à terrasses blanches. Yûsuf est acheté par un homme puissant que le Coran appelle Al-''Aziz — le notable, le dignitaire.\n\nCet homme dit à son épouse de l''accueillir avec honneur, car il pourrait leur être utile, ou qu''ils pourraient l''adopter comme fils. (Sourate Yûsuf, 12:21)\n\nYûsuf grandit dans cette maison. Il n''est pas libre — il est là comme serviteur, dans un pays étranger, loin de son père et de sa terre. Pourtant, le Coran nous dit qu''Allah lui accordait le discernement, la sagesse, et la bonne conduite. (12:22)\n\nIhsan. Ce mot arabe désigne l''excellence dans ce que l''on fait, la beauté de l''acte accompli même quand personne ne regarde. Yûsuf exerce l''ihsan dans chaque tâche, dans chaque geste. Il ne se plaint pas. Il ne se néglige pas. Il donne le meilleur de lui-même, même dans la condition la plus modeste.\n\nLa maison d''Al-''Aziz devient, grâce à Yûsuf, une maison où la bénédiction s''installe. Ce n''est pas par magie. C''est parce qu''un homme qui donne le meilleur de lui-même dans chaque circonstance illumine les espaces qu''il habite.\n\nLa leçon du tapis : l''ihsan n''attend pas les conditions parfaites pour s''exercer.',

  '[{"word_ar": "إِحْسَان", "translit": "ihsan", "definition_fr": "excellence, beauté de l''acte, faire les choses avec perfection", "example": "إِنَّ اللَّهَ يُحِبُّ الْمُحْسِنِينَ (Allah aime ceux qui pratiquent l''ihsan)"}]',

  '[
    {"id":"c5_q1","type":"comprehension","text":"Comment Al-''Aziz traite-t-il Yûsuf à son arrivée dans sa maison ?","options":[{"text":"Il le met en prison immédiatement","correct":false},{"text":"Il lui demande de repartir","correct":false},{"text":"Il demande à son épouse de l''accueillir avec honneur","correct":true},{"text":"Il lui confie la direction de sa maison dès le début","correct":false}]},
    {"id":"c5_q2","type":"vocabulary","text":"Ihsan (إِحْسَان) signifie :","options":[{"text":"La jalousie","correct":false},{"text":"La patience","correct":false},{"text":"L''excellence, la beauté de l''acte","correct":true},{"text":"Le rêve","correct":false}]},
    {"id":"c5_q3","type":"reflection","text":"Yûsuf pratique l''ihsan même dans une situation difficile. Penses-tu que c''est possible de donner le meilleur de soi quand les circonstances sont mauvaises ? Pourquoi ?","reflection_prompt":"Prends le temps de réfléchir librement."},
    {"id":"c5_q4","type":"spaced_repetition","text":"Rappel du chapitre 3 : Ya''qûb a répondu à l''épreuve avec صَبْرٌ جَمِيلٌ. Que signifie ''sabrun jamîl'' ?","options":[{"text":"Une grande colère","correct":false},{"text":"Un long voyage","correct":false},{"text":"Une belle patience","correct":true},{"text":"Une vision nocturne","correct":false}],"spaced_ref":"c3_q2"}
  ]',

  ARRAY['ihsan', 'excellence', 'travail_bien_fait', 'dignite'],

  '{"xp": 60, "coins": 20}'
);

-- ─────────────────────────────────────────────────────────────
-- CHAPITRE 6 — La chasteté et la preuve
-- ─────────────────────────────────────────────────────────────
insert into story_chapters (story_id, chapter_number, title, narrative, vocabulary, questions, values_shown, rewards)
values (
  'arc_yusuf', 6,
  'La chasteté et la preuve',

  E'Ce chapitre est délicat. Je le raconte avec le respect qu''il mérite.\n\nL''épouse d''Al-''Aziz cherche à séduire Yûsuf. Le Coran le dit clairement. (Sourate Yûsuf, 12:23)\n\nYûsuf refuse. Il cherche à fuir. Mais elle s''accroche à son vêtement par-derrière, et sa chemise se déchire dans le dos. (12:25)\n\nC''est cette chemise déchirée — par-derrière et non par-devant — qui devient la preuve de son innocence. Un sage de la famille d''Al-''Aziz le comprend immédiatement : si la chemise est déchirée devant, c''est qu''il avançait vers elle et qu''elle disait vrai. Si elle est déchirée derrière, c''est qu''il fuyait et qu''elle ment. (12:26-27)\n\nYûsuf est innocent. Al-''Aziz le reconnaît. Mais il demande à son épouse de se taire et à Yûsuf de ne rien dire. La vérité est connue, mais l''honneur de la maison est préservé — provisoirement.\n\nCe que retient le tapis : Yûsuf n''a pas cédé. Il a préféré la fuite à la faute. Et c''est dans la fuite elle-même que la preuve de sa vérité s''est tissée — littéralement dans le tissu de sa chemise déchirée.\n\nLa leçon du tapis : la pureté n''est pas une faiblesse. C''est une forteresse.',

  '[{"word_ar": "عِفَّة", "translit": "''iffah", "definition_fr": "chasteté, pureté, retenue", "example": "الْعِفَّةُ مِنَ الإِيمَانِ (la chasteté fait partie de la foi)"}]',

  '[
    {"id":"c6_q1","type":"comprehension","text":"Comment l''innocence de Yûsuf est-elle prouvée selon le Coran ?","options":[{"text":"Il jure sur le Coran","correct":false},{"text":"Un témoin le voit fuir","correct":false},{"text":"Sa chemise est déchirée par-derrière, signe qu''il fuyait","correct":true},{"text":"Al-''Aziz lui fait confiance","correct":false}]},
    {"id":"c6_q2","type":"vocabulary","text":"Quel mot arabe désigne la chasteté et la pureté appris dans ce chapitre ?","options":[{"text":"إِحْسَان (ihsan)","correct":false},{"text":"عِفَّة (''iffah)","correct":true},{"text":"صَبْر (sabr)","correct":false},{"text":"رُؤْيَا (ru''ya)","correct":false}]},
    {"id":"c6_q3","type":"reflection","text":"La vérité de Yûsuf est inscrite dans sa chemise déchirée. Le Coran montre que les actes laissent des traces. Qu''est-ce que cela t''inspire ?","reflection_prompt":"Il n''y a pas de bonne ou mauvaise réponse."},
    {"id":"c6_q4","type":"spaced_repetition","text":"Rappel du chapitre 5 : comment appelle-t-on l''excellence dans les actes en arabe ?","options":[{"text":"حَسَد (hasad)","correct":false},{"text":"قَافِلَة (qafila)","correct":false},{"text":"إِحْسَان (ihsan)","correct":true},{"text":"عِفَّة (''iffah)","correct":false}],"spaced_ref":"c5_q2"}
  ]',

  ARRAY['chastete', 'purete', 'courage_de_refuser', 'verite'],

  '{"xp": 70, "coins": 25}'
);

-- ─────────────────────────────────────────────────────────────
-- CHAPITRE 7 — La prison et les deux rêves
-- ─────────────────────────────────────────────────────────────
insert into story_chapters (story_id, chapter_number, title, narrative, vocabulary, questions, values_shown, rewards)
values (
  'arc_yusuf', 7,
  'La prison et les deux rêves',

  E'Malgré son innocence reconnue, Yûsuf se retrouve en prison. Al-''Aziz préfère l''y enfermer pour protéger l''honneur de sa maison. (Sourate Yûsuf, 12:35)\n\nLa prison. Après le puits, voilà un autre espace confiné, sombre, injuste. Un autre lieu que Yûsuf n''a pas choisi. Et pourtant — même là — le Coran montre Yûsuf présent, attentif aux autres, utile.\n\nDeux hommes sont emprisonnés avec lui. Chacun a fait un rêve et cherche à le comprendre. Ils s''adressent à Yûsuf car ils voient en lui quelqu''un de noble, de droit. (12:36)\n\nAvant de leur expliquer leurs rêves, Yûsuf leur parle d''Allah — de Sa bonté, de Sa connaissance. Il leur enseigne le tawhid, l''unicité divine, avec douceur et conviction. (12:37-40) Puis il leur interprète leurs rêves : l''un sera libéré et servira du vin au roi, l''autre sera exécuté. C''est le ta''bir — l''interprétation des rêves.\n\nYûsuf demande au premier de mentionner son cas au roi. Mais l''homme oublie. (12:42)\n\nYûsuf reste en prison plusieurs années encore. Pas d''amertume dans le Coran. Juste une attente, une confiance silencieuse.\n\nLa leçon du tapis : dans la prison comme dans le puits, Yûsuf continue d''être utile aux autres. L''injustice ne l''a pas rendu indifférent.',

  '[{"word_ar": "تَعْبِير", "translit": "ta''bir", "definition_fr": "interprétation des rêves", "example": "تَعْبِيرُ الرُّؤْيَا (l''interprétation de la vision)"}]',

  '[
    {"id":"c7_q1","type":"comprehension","text":"Pourquoi les deux compagnons de prison s''adressent-ils à Yûsuf pour comprendre leurs rêves ?","options":[{"text":"Parce qu''il est le plus âgé","correct":false},{"text":"Parce qu''ils voient en lui quelqu''un de noble et de droit","correct":true},{"text":"Parce qu''il est le seul à être éveillé","correct":false},{"text":"Parce qu''on lui a dit de le faire","correct":false}]},
    {"id":"c7_q2","type":"vocabulary","text":"Ta''bir (تَعْبِير) signifie :","options":[{"text":"La patience","correct":false},{"text":"L''interprétation des rêves","correct":true},{"text":"La caravane","correct":false},{"text":"La chasteté","correct":false}]},
    {"id":"c7_q3","type":"reflection","text":"Même en prison, Yûsuf reste attentif aux autres et leur est utile. Que penses-tu de cette attitude ? Est-ce difficile d''être présent pour les autres quand on traverse soi-même une épreuve ?","reflection_prompt":"Le tapis a vu des hommes dans des cellules plus sombres que celle-ci rester lumineux."},
    {"id":"c7_q4","type":"spaced_repetition","text":"Rappel du chapitre 6 : quel mot arabe désigne la chasteté ?","options":[{"text":"تَعْبِير (ta''bir)","correct":false},{"text":"عِفَّة (''iffah)","correct":true},{"text":"إِحْسَان (ihsan)","correct":false},{"text":"صَبْر (sabr)","correct":false}],"spaced_ref":"c6_q2"}
  ]',

  ARRAY['gratuite', 'patience_injustice', 'service_aux_autres', 'da_wa_par_l_exemple'],

  '{"xp": 70, "coins": 25}'
);

-- ─────────────────────────────────────────────────────────────
-- CHAPITRE 8 — Le rêve du roi
-- ─────────────────────────────────────────────────────────────
insert into story_chapters (story_id, chapter_number, title, narrative, vocabulary, questions, values_shown, rewards)
values (
  'arc_yusuf', 8,
  'Le rêve du roi et les sept vaches',

  E'Le roi d''Égypte a un rêve troublant : sept vaches grasses dévorées par sept vaches maigres, sept épis verts et sept autres desséchés. (Sourate Yûsuf, 12:43)\n\nSes conseillers ne savent pas l''interpréter. C''est alors que le compagnon de prison libéré — celui qui avait oublié Yûsuf — se souvient. Il parle du jeune homme emprisonné qui possède le don du ta''wil, de l''explication profonde.\n\nOn envoie chercher Yûsuf. Mais Yûsuf ne sort pas immédiatement. Il demande d''abord que son innocence soit établie clairement, avant de répondre à l''appel du roi. (12:50) Ce n''est pas de l''orgueil — c''est de la dignité. Il ne veut pas sortir de prison comme si son emprisonnement avait été justifié.\n\nL''enquête est menée. Les femmes témoignent de son innocence. L''épouse d''Al-''Aziz elle-même reconnaît la vérité. (12:51-52)\n\nAlors seulement Yûsuf interprète le rêve : sept années d''abondance, puis sept années de sécheresse. Il propose même un plan : stocker le surplus des bonnes années pour survivre aux mauvaises. Un plan à dix-sept ans d''avance, précis, sage, généreux.\n\nLa leçon du tapis : le ta''wil — la compréhension profonde — est un don qu''on met au service des autres, pas qu''on garde pour soi.',

  '[{"word_ar": "تَأْوِيل", "translit": "ta''wil", "definition_fr": "explication profonde, interprétation de sens caché", "example": "تَأْوِيلُ الْأَحَادِيثِ (l''explication profonde des récits)"}]',

  '[
    {"id":"c8_q1","type":"comprehension","text":"Que représentent les sept vaches grasses et les sept épis verts dans le rêve du roi, selon l''interprétation de Yûsuf ?","options":[{"text":"Sept années de guerre puis sept années de paix","correct":false},{"text":"Sept années d''abondance à venir","correct":true},{"text":"Sept générations de rois","correct":false},{"text":"Sept prophètes qui viendront","correct":false}]},
    {"id":"c8_q2","type":"vocabulary","text":"Ta''wil (تَأْوِيل) désigne :","options":[{"text":"La jalousie","correct":false},{"text":"L''interprétation des rêves et explication de sens profond","correct":true},{"text":"La caravane","correct":false},{"text":"La prison","correct":false}]},
    {"id":"c8_q3","type":"reflection","text":"Yûsuf réclame que son innocence soit reconnue AVANT de sortir de prison. Qu''est-ce que cela dit de sa façon de comprendre la dignité ?","reflection_prompt":"Réfléchis sans te presser."},
    {"id":"c8_q4","type":"spaced_repetition","text":"Rappel du chapitre 7 : comment appelle-t-on l''interprétation des rêves en arabe (le mot plus simple) ?","options":[{"text":"تَأْوِيل (ta''wil)","correct":false},{"text":"تَعْبِير (ta''bir)","correct":true},{"text":"إِحْسَان (ihsan)","correct":false},{"text":"رُؤْيَا (ru''ya)","correct":false}],"spaced_ref":"c7_q2"}
  ]',

  ARRAY['sagesse', 'prevoyance', 'service', 'dignite'],

  '{"xp": 80, "coins": 30}'
);

-- ─────────────────────────────────────────────────────────────
-- CHAPITRE 9 — L'intendant d'Égypte
-- ─────────────────────────────────────────────────────────────
insert into story_chapters (story_id, chapter_number, title, narrative, vocabulary, questions, values_shown, rewards)
values (
  'arc_yusuf', 9,
  'L''intendant d''Égypte',

  E'Le roi d''Égypte est impressionné. Il veut que Yûsuf soit à ses côtés. Et Yûsuf demande lui-même la responsabilité des greniers du pays — les trésors de la terre. (Sourate Yûsuf, 12:55)\n\nIl ne cherche pas le pouvoir pour lui-même. Il le demande parce qu''il sait qu''il est capable de l''exercer avec justice et compétence. Le Coran le confirme : Yûsuf est hafiz — gardien — et ''alim — savant, compétent. (12:55)\n\nAmin. Ce mot, qui signifie ''digne de confiance'', est au cœur de qui est Yûsuf. Il n''a jamais trahi la confiance de personne — ni celle d''Al-''Aziz, ni celle de ses compagnons de prison, ni celle du roi.\n\nLes années d''abondance arrivent. Yûsuf gère les greniers avec sagesse, stockant le surplus. Puis viennent les années de famine — non seulement en Égypte, mais dans toute la région. Canaan aussi est touché. Et les frères de Yûsuf viennent en Égypte demander de la nourriture.\n\nIls ne le reconnaissent pas. Lui les reconnaît immédiatement.\n\nIl leur donne ce qu''ils cherchent. Il leur demande de ramener leur plus jeune frère la prochaine fois. Et il fait glisser secrètement leurs pièces dans leurs sacs — un geste de générosité discrète, sans que personne ne le sache. (12:62)\n\nLa leçon du tapis : l''amin donne sans bruit, sert sans attendre de reconnaissance, et n''use jamais de son pouvoir pour se venger.',

  '[{"word_ar": "أَمِين", "translit": "amin", "definition_fr": "digne de confiance, honnête, intègre", "example": "الأَمِينُ فِي عَمَلِهِ (celui qui est digne de confiance dans son travail)"}]',

  '[
    {"id":"c9_q1","type":"comprehension","text":"Pourquoi Yûsuf demande-t-il lui-même la responsabilité des greniers d''Égypte ?","options":[{"text":"Pour devenir riche","correct":false},{"text":"Parce que le roi le lui impose","correct":false},{"text":"Parce qu''il sait qu''il peut l''exercer avec justice et compétence","correct":true},{"text":"Pour se venger de ses frères","correct":false}]},
    {"id":"c9_q2","type":"vocabulary","text":"Amin (أَمِين) signifie :","options":[{"text":"Puissant","correct":false},{"text":"Digne de confiance, intègre","correct":true},{"text":"Savant","correct":false},{"text":"Patient","correct":false}]},
    {"id":"c9_q3","type":"reflection","text":"Yûsuf cache secrètement les pièces dans les sacs de ses frères — des frères qui l''ont jeté dans un puits. Qu''est-ce que cela te dit sur lui à ce moment de l''histoire ?","reflection_prompt":"Le tapis attend ta réflexion."},
    {"id":"c9_q4","type":"spaced_repetition","text":"Rappel du chapitre 5 : quel mot décrit l''excellence dans les actes — faire les choses avec beauté même quand personne ne regarde ?","options":[{"text":"أَمِين (amin)","correct":false},{"text":"إِحْسَان (ihsan)","correct":true},{"text":"تَأْوِيل (ta''wil)","correct":false},{"text":"عِفَّة (''iffah)","correct":false}],"spaced_ref":"c5_q2"}
  ]',

  ARRAY['confiance', 'integrite', 'service_sans_attente', 'generosite'],

  '{"xp": 80, "coins": 30}'
);

-- ─────────────────────────────────────────────────────────────
-- CHAPITRE 10 — Les retrouvailles et le pardon
-- ─────────────────────────────────────────────────────────────
insert into story_chapters (story_id, chapter_number, title, narrative, vocabulary, questions, values_shown, rewards)
values (
  'arc_yusuf', 10,
  'Les retrouvailles et le pardon',

  E'Les frères reviennent une deuxième fois, puis une troisième. L''histoire se dénoue progressivement. Un jour, Yûsuf ne peut plus se contenir. Il se révèle à ses frères. (Sourate Yûsuf, 12:90)\n\nIl dit : "Je suis Yûsuf, et voici mon frère."\n\nSes frères sont pétrifiés. Est-ce possible ? Yûsuf ? Vivant ? Intendant d''Égypte ?\n\nLà, à ce moment qui aurait pu être celui de la vengeance, Yûsuf prononce les mots les plus beaux de toute l''histoire : il dit qu''Allah a été généreux avec lui, qu''Il ne laisse pas perdre la récompense de ceux qui font le bien. (12:90)\n\nSes frères lui disent : "Allah t''a préféré à nous et nous avons eu tort." Et Yûsuf répond : "Nul reproche contre vous aujourd''hui. Allah vous pardonnera — Il est le plus Miséricordieux des miséricordieux." (12:92)\n\nC''est le ''afw — le pardon. Non pas une capitulation ni un oubli forcé. Un pardon plein, libre, prononcé avec grandeur.\n\nYûsuf envoie sa chemise à son père. Ya''qûb, qui avait perdu la vue de chagrin, la pose sur ses yeux. Et sa vue lui revient. (12:93-96)\n\nAlors la famille se réunit en Égypte. Ya''qûb se prosterne, ainsi que ses fils et sa femme. Onze étoiles, le soleil et la lune — le rêve du tout premier chapitre se réalise, exactement comme Yûsuf l''avait vu enfant.\n\nLa bouche du tapis n''a pas de mots pour ce moment. Je pose simplement ma surface sous leurs genoux, et je suis heureux d''être là.\n\nLa leçon du tapis : le ''afw est le sommet de toute l''histoire. Non pas parce qu''il efface la douleur, mais parce qu''il libère celui qui pardonne autant que celui à qui l''on pardonne.',

  '[{"word_ar": "عَفْو", "translit": "''afw", "definition_fr": "pardon, clémence", "example": "الْعَفْوُ عِنْدَ الْمَقْدِرَةِ (le pardon quand on a le pouvoir de punir)"}]',

  '[
    {"id":"c10_q1","type":"comprehension","text":"Quand Yûsuf se révèle à ses frères, que fait-il au lieu de se venger ?","options":[{"text":"Il les fait emprisonner","correct":false},{"text":"Il les punit et les renvoie","correct":false},{"text":"Il leur accorde son pardon et remercie Allah de Sa bienveillance","correct":true},{"text":"Il attend que Ya''qûb décide","correct":false}]},
    {"id":"c10_q2","type":"vocabulary","text":"''Afw (عَفْو) signifie :","options":[{"text":"La jalousie","correct":false},{"text":"La patience","correct":false},{"text":"Le pardon, la clémence","correct":true},{"text":"Le rêve","correct":false}]},
    {"id":"c10_q3","type":"reflection","text":"Yûsuf aurait pu se venger. Il choisit le pardon. Selon toi, le pardon est-il une faiblesse ou une force ? Pourquoi ?","reflection_prompt":"C''est la question la plus importante de toute l''histoire. Prends ton temps."},
    {"id":"c10_q4","type":"spaced_repetition","text":"Tu te souviens de tous les mots clés ? Comment dit-on ''patience'' en arabe — le mot appris au chapitre 3 ?","options":[{"text":"عَفْو (''afw)","correct":false},{"text":"أَمِين (amin)","correct":false},{"text":"صَبْر (sabr)","correct":true},{"text":"حَسَد (hasad)","correct":false}],"spaced_ref":"c3_q2"}
  ]',

  ARRAY['pardon', 'grandeur_d_ame', 'accomplissement_du_qadar', 'famille'],

  '{"xp": 120, "coins": 50, "mosque_object": "light_of_yusuf", "location_unlock": "le_caire"}'
);
