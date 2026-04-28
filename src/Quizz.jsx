import { useState, useEffect } from 'react'

const SUPABASE_URL = 'https://qglyfohuebgbuztjqaok.supabase.co'
const SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnbHlmb2h1ZWJnYnV6dGpxYW9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNTgxODQsImV4cCI6MjA5MTgzNDE4NH0.HKqxiTKQDV8zvfpTmE8RlDq_GsbwHATzfn1gyDkJLxQ'

// Les options sont stockées avec la bonne réponse identifiée par `correct: true`
// Le shuffle se fait au chargement pour chaque question
const ALL_QUESTIONS = [
  {
    type: 'vf',
    q: "Tu peux sauter quelques jours de routine d'engagement sans vraiment impacter tes résultats sur LinkedIn.",
    opts: ['Vrai', 'Faux'], c: 1,
    e: "Comme le sport, c'est la régularité quotidienne qui crée les résultats. Sauter des jours casse la dynamique — et l'algorithme le voit.",
  },
  {
    type: 'vf',
    q: "15 minutes de routine d'engagement par jour valent mieux que 2 heures une fois par semaine.",
    opts: ['Vrai', 'Faux'], c: 0,
    e: "La régularité prime sur le volume. 15 minutes tous les jours ancrent l'habitude, te gardent dans le radar de ta cible et envoient des signaux constants à l'algorithme.",
  },
  {
    type: 'qcm',
    q: "L'algorithme LinkedIn construit ton autorité thématique à partir de :",
    opts: [
      { text: "Tes 100 dernières interactions — LinkedIn analyse uniquement ta dernière semaine d'activité", correct: false },
      { text: "Tes 1000 dernières interactions — LinkedIn lit ta trajectoire complète pour comprendre qui tu es et vers qui te distribuer", correct: true },
      { text: "Tes posts uniquement — seul le contenu que tu publies est pris en compte, pas tes interactions", correct: false },
      { text: "Tes connexions — LinkedIn se base sur le profil de tes abonnés pour définir ton autorité", correct: false },
    ],
    e: "LinkedIn lit tes 1000 dernières interactions pour comprendre qui tu es et vers qui te distribuer. C'est pour ça que la régularité de ta routine compte autant.",
  },
  {
    type: 'vf',
    q: "La routine d'engagement ne sert qu'à gagner en visibilité — elle ne génère pas de clients directement.",
    opts: ['Vrai', 'Faux'], c: 1,
    e: "Un bon commentaire au bon endroit peut générer des visites de profil et des leads directement. C'est ce qui s'est passé avec Noely, qui a reçu des messages dès ses premières semaines de routine.",
  },
  {
    type: 'qcm',
    q: "Commenter sous le post d'un concurrent qui s'adresse à ta même cible peut te générer des leads parce que :",
    opts: [
      { text: "LinkedIn te recommande automatiquement à ses abonnés dès que tu interagis régulièrement avec son contenu", correct: false },
      { text: "Sa communauté est potentiellement ta cible — un commentaire pertinent pousse les lecteurs à visiter ton profil", correct: true },
      { text: "Ça augmente ta fréquence de publication perçue, ce qui améliore ta portée globale sur la plateforme", correct: false },
      { text: "Tu apparais dans les suggestions d'abonnement des personnes qui suivent ton concurrent", correct: false },
    ],
    e: "Si ton concurrent a la même cible que toi, sa communauté c'est potentiellement tes prospects. Un commentaire pertinent les pousse à cliquer sur ton profil — et c'est là que la magie opère.",
  },
  {
    type: 'vf',
    q: "Tu dois faire ta routine d'engagement uniquement les jours où tu publies un post.",
    opts: ['Vrai', 'Faux'], c: 1,
    e: "La routine d'engagement se fait tous les jours, que tu publies ou pas. C'est justement ça qui te garde dans le radar de ta cible même les jours sans contenu.",
  },
  {
    type: 'qcm',
    q: "Pourquoi bloquer un créneau fixe chaque jour pour sa routine d'engagement ?",
    opts: [
      { text: "Pour maximiser la portée de tes posts — l'algo favorise les comptes qui interagissent juste avant de publier", correct: false },
      { text: "Pour ancrer l'habitude et être régulier — un créneau fixe transforme la routine en automatisme et garantit la constance", correct: true },
      { text: "Parce que l'algorithme favorise les interactions matinales — les commentaires du matin ont plus de poids que ceux du soir", correct: false },
      { text: "Pour éviter une pénalité de fréquence — LinkedIn limite les interactions si elles ne sont pas réparties régulièrement", correct: false },
    ],
    e: "Un créneau fixe, c'est ce qui transforme la routine en automatisme. Thomas le fait chaque matin avec son café — 15-20 minutes et la journée peut commencer.",
  },
  {
    type: 'qcm',
    q: "Quelles sont les 4 thématiques de listes à construire en priorité dans sa routine d'engagement ?",
    opts: [
      { text: "Concurrents, médias, influenceurs, clients — pour couvrir toutes les sources de visibilité disponibles", correct: false },
      { text: "Concurrents, prestataires à audience similaire, top of mind, prospects — chaque liste a un objectif précis et complémentaire", correct: true },
      { text: "Clients, partenaires, médias, top of mind — pour construire une présence autour de son réseau existant", correct: false },
      { text: "Prospects, clients, concurrents, partenaires — pour mixer acquisition et fidélisation dans la même routine", correct: false },
    ],
    e: "Concurrents pour voler de la notoriété, prestataires à audience similaire pour toucher ta cible indirectement, top of mind pour la visibilité, et prospects pour chauffer les contacts avant de les démarcher.",
  },
  {
    type: 'vf',
    q: "La liste 'top of mind' sert principalement à générer des leads directs.",
    opts: ['Vrai', 'Faux'], c: 1,
    e: "La liste top of mind sert d'abord à gagner en visibilité auprès d'une grande audience. Ce sont des créateurs avec beaucoup d'abonnés — tu vas là pour être vu, pas forcément pour closer.",
  },
  {
    type: 'qcm',
    q: "Quel niveau d'engagement minimum est recommandé pour qu'un profil vaille la peine d'être dans ta liste de visibilité ?",
    opts: [
      { text: "Entre 0 et 15 likes par post — même avec peu d'engagement, la régularité de publication suffit pour justifier sa présence dans la liste", correct: false },
      { text: "Entre 15 et 30 likes par post minimum — en dessous, la portée est trop faible pour que ton commentaire soit vraiment vu", correct: true },
      { text: "Plus de 100 likes par post obligatoirement — seuls les gros comptes garantissent une visibilité réelle sur tes commentaires", correct: false },
      { text: "Le nombre de likes ne compte pas — seule la fréquence de publication et la thématique du profil sont des critères pertinents", correct: false },
    ],
    e: "En dessous de 15-30 likes par post, la portée est trop faible pour que ton commentaire soit vraiment vu. Sauf si le profil est ultra qualifié et que son audience colle parfaitement à ta cible.",
  },
  {
    type: 'vf',
    q: "Pour remplir ses listes, mieux vaut des profils qui publient régulièrement — au moins 2 à 3 fois par semaine.",
    opts: ['Vrai', 'Faux'], c: 0,
    e: "Des profils qui publient une fois par mois ne t'apportent rien. Tu veux des gens actifs pour avoir un roulement quotidien dans tes listes et toujours du contenu frais à commenter.",
  },
  {
    type: 'qcm',
    q: "Quelle est la bonne approche avant d'envoyer un DM à un prospect que tu ne connais pas encore ?",
    opts: [
      { text: "Envoyer directement une demande de connexion avec une note personnalisée — c'est la méthode la plus rapide pour entrer en contact", correct: false },
      { text: "Commenter ses posts pendant quelques jours, puis le contacter en DM — tu n'es plus un inconnu et le taux de réponse est bien meilleur", correct: true },
      { text: "Liker l'ensemble de ses posts récents puis envoyer un message automatisé — la combinaison like + message maximise la visibilité", correct: false },
      { text: "Attendre qu'il interagisse avec ton contenu en premier — ça prouve qu'il est déjà intéressé et garantit une meilleure réception", correct: false },
    ],
    e: "Commenter ses posts en amont te rend familier avant le premier contact. Quand tu envoies ton DM, tu n'es plus un inconnu — et parfois, c'est même lui qui vient vers toi en premier.",
  },
  {
    type: 'vf',
    q: "Chaque liste de profils sur LinkHub.gg peut contenir autant de personnes que tu veux.",
    opts: ['Vrai', 'Faux'], c: 1,
    e: "Chaque liste est limitée à environ 27 profils. C'est pour ça que Thomas crée plusieurs listes par thématique plutôt qu'une seule grande liste fourre-tout.",
  },
  {
    type: 'qcm',
    q: "Quel est le principal avantage de LinkHub.gg pour ta routine d'engagement ?",
    opts: [
      { text: "Il publie tes posts automatiquement au meilleur moment — il analyse ton audience pour optimiser l'heure de diffusion", correct: false },
      { text: "Il organise tes listes et filtre automatiquement les posts de plus de 24h — ce qui rend la routine rapide et sans scroll inutile", correct: true },
      { text: "Il analyse tes statistiques LinkedIn en temps réel — tu peux suivre l'impact de chaque commentaire sur ta portée globale", correct: false },
      { text: "Il envoie des demandes de connexion automatiques selon les critères de ta cible — pour automatiser entièrement l'acquisition", correct: false },
    ],
    e: "LinkHub.gg te fait un zoom sur les posts récents et t'évite le scroll infini. Dès qu'un post dépasse 24h, il te dit de passer à la liste suivante — ce qui rend la routine rapide et efficace.",
  },
  {
    type: 'vf',
    q: "Commenter un post publié il y a plus de 24 heures peut encore t'apporter de la visibilité.",
    opts: ['Vrai', 'Faux'], c: 1,
    e: "Un post de plus de 24h n'a plus de portée algorithmique. Ton commentaire ne sera vu par presque personne — c'est du temps perdu. Passe au suivant.",
  },
  {
    type: 'qcm',
    q: "Parmi ces commentaires, lequel apporte vraiment quelque chose ?",
    opts: [
      { text: "Super post, totalement d'accord avec tout ce que tu dis — continue comme ça !", correct: false },
      { text: "Merci pour le partage, c'est vraiment très inspirant et pertinent pour ma situation actuelle.", correct: false },
      { text: "Je nuancerai sur ce point : j'ai vécu l'inverse chez mes clients. Voici ce que j'ai observé concrètement...", correct: true },
      { text: "Intéressant. Je n'avais pas envisagé les choses sous cet angle-là, merci pour cette perspective.", correct: false },
    ],
    e: "Un commentaire qui apporte un point de vue, une expérience ou un contre-argument pousse les gens à cliquer sur ton profil. Les 3 autres ne t'apportent ni visibilité ni crédibilité.",
  },
  {
    type: 'vf',
    q: "Un commentaire vide comme 'Super post !' vaut mieux que pas de commentaire du tout.",
    opts: ['Vrai', 'Faux'], c: 1,
    e: "Un commentaire vide ne t'apporte aucune visibilité et l'algorithme le détecte comme un signal faible. Si t'as rien à dire sur un post, passe au suivant — c'est exactement ce que fait Thomas.",
  },
  {
    type: 'qcm',
    q: "Pourquoi est-il recommandé de faire ses premiers commentaires manuellement avant de laisser l'IA de LinkHub.gg prendre le relais ?",
    opts: [
      { text: "Parce que l'IA de LinkHub.gg ne fonctionne pas correctement au démarrage — elle a besoin d'une période de calibration technique", correct: false },
      { text: "Parce que l'IA apprend de tes propres commentaires pour reproduire ton ton de voix — sans base, elle génère des commentaires génériques", correct: true },
      { text: "Parce que LinkedIn pénalise les commentaires générés par IA — les publier manuellement au départ évite une restriction de compte", correct: false },
      { text: "Pour respecter les CGU de LinkedIn — la plateforme interdit l'automatisation des commentaires dans ses conditions d'utilisation", correct: false },
    ],
    e: "L'IA de LinkHub.gg s'entraîne sur tes commentaires existants. Si tu commences par des commentaires manuels avec ta vraie patte, l'IA va s'en approcher beaucoup mieux ensuite.",
  },
  {
    type: 'vf',
    q: "Donner un avis contraire au créateur du post dans les commentaires nuit à ta réputation.",
    opts: ['Vrai', 'Faux'], c: 1,
    e: "Au contraire — aller à l'encontre d'une idée avec des arguments, c'est ce qui te démarque. Les gens qui pensent comme toi vont cliquer sur ton profil plutôt que sur celui qui a fait le post.",
  },
  {
    type: 'qcm',
    q: "Pour construire ta liste 'audience similaire', quelle est la méthode recommandée ?",
    opts: [
      { text: "Chercher des profils au hasard dans ta niche via la barre de recherche LinkedIn et les ajouter sans critère particulier", correct: false },
      { text: "Regarder avec quels créateurs tes clients existants interagissent — ça révèle les thématiques qu'ils suivent vraiment", correct: true },
      { text: "Copier directement les listes de tes concurrents — si ça marche pour eux, ça marchera probablement pour toi aussi", correct: false },
      { text: "Utiliser uniquement la barre de recherche LinkedIn avec des mots-clés liés à ta niche pour trouver des profils pertinents", correct: false },
    ],
    e: "Tes clients actuels te donnent la meilleure info : regarde avec qui ils interagissent, identifie les thématiques récurrentes, et construis tes listes autour de ça.",
  },
]

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Pour les QCM : shuffler les options et garder trace de la bonne réponse
function prepareQuestions(questions) {
  return shuffle(questions).map(q => {
    if (q.type === 'vf') return q
    const shuffled = shuffle(q.opts)
    const correctIndex = shuffled.findIndex(o => o.correct)
    return {
      ...q,
      opts: shuffled.map(o => o.text),
      c: correctIndex,
    }
  })
}

function getScoreMsg(score, total) {
  const p = score / total
  if (p >= 0.85) return "Carton plein ! Tu as parfaitement assimilé les mécaniques de la routine — t'as plus qu'à la mettre en place."
  if (p >= 0.60) return "Bien joué ! Les bases sont là, mais quelques points méritent d'être revus avant de te lancer."
  return "Les fondations de la routine sont à consolider — c'est exactement ce qu'on va travailler ensemble."
}

async function sendToSupabase(name, email, score, questions, results) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/quiz_results`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        client_name: name,
        client_email: email || null,
        score,
        total_questions: questions.length,
        answers: results.map((r, i) => ({
          question: questions[i].q,
          reponse_choisie: questions[i].opts[r.selected],
          bonne_reponse: questions[i].opts[questions[i].c],
          correct: r.correct,
        })),
      }),
    })
  } catch (e) {
    console.error('Supabase error', e)
  }
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Parkinsans:wght@400;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  #qroot { font-family: 'Parkinsans', sans-serif; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2.5rem 1rem; color: #121C28; position: relative; overflow: hidden; background: #FAF9F2; }
  #qbg { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 0; }
  .blob { position: absolute; border-radius: 50%; background: #018EBB; filter: blur(100px); opacity: 0.25; }
  #grain { position: absolute; inset: 0; pointer-events: none; }
  .qouter { position: relative; z-index: 1; width: 100%; max-width: 640px; border-radius: 24px; border: 10px solid rgba(18,28,40,0.10); background: #FAF9F2; }
  .qcard { background: #FAF9F2; border-radius: 16px; padding: 2.5rem 2rem; width: 100%; }
  .btag { display: inline-block; background: #018EBB; color: #fff; font-size: 11px; font-weight: 700; letter-spacing: .08em; padding: 4px 12px; border-radius: 20px; margin-bottom: 1.25rem; text-transform: uppercase; }
  h1 { font-size: 22px; font-weight: 800; color: #121C28; line-height: 1.25; margin-bottom: .75rem; }
  .sub { font-size: 14px; color: #4a5568; line-height: 1.6; margin-bottom: 2rem; }
  .fg { margin-bottom: 1rem; }
  .fg label { display: block; font-size: 13px; font-weight: 700; color: #121C28; margin-bottom: 6px; }
  .fg input { width: 100%; padding: 12px 16px; border: 1.5px solid rgba(18,28,40,0.15); border-radius: 12px; font-size: 15px; font-family: 'Parkinsans', sans-serif; background: #fff; color: #121C28; outline: none; transition: border-color .2s; }
  .fg input:focus { border-color: #018EBB; }
  .btn-main { width: 100%; background: #121C28; color: #fff; border: none; border-radius: 12px; padding: 14px; font-size: 15px; font-weight: 700; font-family: 'Parkinsans', sans-serif; cursor: pointer; margin-top: 1.5rem; transition: background .2s; }
  .btn-main:hover { background: #1e2f44; }
  .btn-main:disabled { background: #b0b8c1; cursor: not-allowed; }
  .prog-wrap { margin-bottom: 1.75rem; }
  .prog-lbl { display: flex; justify-content: space-between; font-size: 12px; color: #718096; margin-bottom: 8px; }
  .prog-bg { height: 4px; background: rgba(18,28,40,0.08); border-radius: 4px; overflow: hidden; }
  .prog-fill { height: 4px; background: #018EBB; border-radius: 4px; transition: width .4s ease; }
  .qtag { display: inline-block; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; margin-bottom: .75rem; letter-spacing: .06em; }
  .qtag.vf { background: rgba(1,142,187,0.12); color: #016a8c; }
  .qtag.qcm { background: rgba(18,28,40,0.07); color: #4a5568; }
  .qtxt { font-size: 17px; font-weight: 700; line-height: 1.45; color: #121C28; margin-bottom: 1.25rem; }
  .opts { display: flex; flex-direction: column; gap: 9px; margin-bottom: 1.25rem; }
  .opt { padding: 13px 16px; border: 1.5px solid rgba(18,28,40,0.12); border-radius: 12px; font-size: 13.5px; font-family: 'Parkinsans', sans-serif; background: #fff; color: #121C28; cursor: pointer; text-align: left; line-height: 1.45; font-weight: 600; transition: all .15s; }
  .opt:hover:not(:disabled) { border-color: #018EBB; background: rgba(1,142,187,0.05); }
  .opt.correct { background: #f0fdf4; border-color: #22c55e; color: #14532d; }
  .opt.wrong { background: #fef2f2; border-color: #ef4444; color: #7f1d1d; }
  .opt.neutral-done { opacity: 0.38; cursor: default; }
  .expl { background: rgba(1,142,187,0.07); border-left: 3px solid #018EBB; border-radius: 0 12px 12px 0; padding: 12px 16px; font-size: 13px; line-height: 1.65; color: #2d4a5e; margin-bottom: 1.25rem; }
  .btn-next { background: #018EBB; color: #fff; border: none; border-radius: 12px; padding: 12px 28px; font-size: 14px; font-weight: 700; font-family: 'Parkinsans', sans-serif; cursor: pointer; transition: background .2s; }
  .btn-next:hover { background: #0179a0; }
  .score-big { font-size: 56px; font-weight: 800; color: #121C28; line-height: 1; }
  .score-lbl { font-size: 14px; color: #718096; margin-top: 6px; }
  .score-msg { font-size: 15px; font-weight: 600; line-height: 1.5; color: #121C28; margin-top: 1rem; padding: 1rem 1.25rem; background: rgba(1,142,187,0.07); border-radius: 12px; }
  .recap-title { font-size: 12px; font-weight: 700; color: #718096; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 1rem; margin-top: 1.75rem; }
  .recap-item { display: flex; align-items: flex-start; gap: 10px; padding: 11px 0; border-bottom: 1px solid rgba(18,28,40,0.07); }
  .ico { flex-shrink: 0; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; margin-top: 1px; }
  .ico.ok { background: #dcfce7; color: #166534; }
  .ico.ko { background: #fee2e2; color: #991b1b; }
`

function Background() {
  return (
    <div id="qbg">
      <div className="blob" style={{ width: '480px', height: '480px', top: '-140px', left: '-150px' }} />
      <div className="blob" style={{ width: '350px', height: '350px', top: '35%', right: '-100px' }} />
      <div className="blob" style={{ width: '300px', height: '300px', bottom: '-80px', left: '25%' }} />
      <svg id="grain" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <filter id="f">
          <feTurbulence type="fractalNoise" baseFrequency="0.68" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#f)" opacity="0.15" />
      </svg>
    </div>
  )
}

function HomeScreen({ onStart }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  return (
    <>
      <span className="btag">Quiz Module 2</span>
      <h1>Tu sais vraiment comment fonctionne la routine d'engagement ?</h1>
      <p className="sub">20 questions pour valider tes bases avant de te lancer.</p>
      <div className="fg">
        <label>Ton prénom <span style={{ color: '#ef4444' }}>*</span></label>
        <input type="text" placeholder="Ex : Thomas" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div className="fg">
        <label>Ton email <span style={{ color: '#718096', fontWeight: 400 }}>(optionnel)</span></label>
        <input type="email" placeholder="Ex : thomas@kalanis.fr" value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <button className="btn-main" disabled={!name.trim()} onClick={() => onStart(name.trim(), email.trim())}>
        Commencer le quiz
      </button>
    </>
  )
}

function QuizScreen({ questions, onFinish }) {
  const [cur, setCur] = useState(0)
  const [sel, setSel] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [results, setResults] = useState([])

  const q = questions[cur]
  const pct = Math.round((cur / questions.length) * 100)

  function handleSelect(i) {
    if (answered) return
    setSel(i)
    setAnswered(true)
    setResults(prev => [...prev, { selected: i, correct: i === q.c }])
  }

  function handleNext() {
    if (cur < questions.length - 1) {
      setCur(c => c + 1)
      setSel(null)
      setAnswered(false)
    } else {
      onFinish(results)
    }
  }

  function optClass(i) {
    if (!answered) return 'opt'
    if (i === q.c) return 'opt correct'
    if (i === sel) return 'opt wrong'
    return 'opt neutral-done'
  }

  return (
    <>
      <div className="prog-wrap">
        <div className="prog-lbl">
          <span>Question {cur + 1} / {questions.length}</span>
          <span>{pct}%</span>
        </div>
        <div className="prog-bg">
          <div className="prog-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <span className={`qtag ${q.type}`}>{q.type === 'vf' ? 'Vrai / Faux' : 'Choix multiple'}</span>
      <p className="qtxt">{q.q}</p>
      <div className="opts">
        {q.opts.map((o, i) => (
          <button key={i} className={optClass(i)} disabled={answered} onClick={() => handleSelect(i)}>{o}</button>
        ))}
      </div>
      {answered && (
        <>
          <div className="expl">{q.e}</div>
          <button className="btn-next" onClick={handleNext}>
            {cur < questions.length - 1 ? 'Question suivante' : 'Voir mes résultats'}
          </button>
        </>
      )}
    </>
  )
}

function ResultScreen({ name, email, questions, results }) {
  const [sent, setSent] = useState(false)
  const score = results.filter(r => r.correct).length

  useEffect(() => {
    sendToSupabase(name, email, score, questions, results).finally(() => setSent(true))
  }, [])

  return (
    <>
      <span className="btag">Résultats</span>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div className="score-big">{score}<span style={{ fontSize: '32px', color: '#718096' }}>/{questions.length}</span></div>
        <div className="score-lbl">bonnes réponses</div>
        <div className="score-msg">{getScoreMsg(score, questions.length)}</div>
      </div>
      <div className="recap-title">Détail des réponses</div>
      {results.map((r, i) => (
        <div key={i} className="recap-item">
          <div className={`ico ${r.correct ? 'ok' : 'ko'}`}>{r.correct ? '✓' : '✗'}</div>
          <div>
            <div style={{ fontWeight: 600, color: '#121C28', fontSize: '13px' }}>{questions[i].q}</div>
            <div style={{ color: '#4a5568', marginTop: '2px', fontSize: '12.5px' }}>
              Bonne réponse : {questions[i].opts[questions[i].c]}
            </div>
          </div>
        </div>
      ))}
      {!sent && <p style={{ textAlign: 'center', fontSize: '13px', color: '#718096', marginTop: '1rem' }}>Enregistrement...</p>}
    </>
  )
}

export default function Quiz() {
  const [screen, setScreen] = useState('home')
  const [participant, setParticipant] = useState({ name: '', email: '' })
  const [finalResults, setFinalResults] = useState([])
  const [questions] = useState(() => prepareQuestions(ALL_QUESTIONS))

  function handleStart(name, email) {
    setParticipant({ name, email })
    setScreen('quiz')
  }

  function handleFinish(results) {
    setFinalResults(results)
    setScreen('result')
  }

  return (
    <>
      <style>{css}</style>
      <div id="qroot">
        <Background />
        <div className="qouter">
          <div className="qcard">
            {screen === 'home' && <HomeScreen onStart={handleStart} />}
            {screen === 'quiz' && <QuizScreen questions={questions} onFinish={handleFinish} />}
            {screen === 'result' && (
              <ResultScreen
                name={participant.name}
                email={participant.email}
                questions={questions}
                results={finalResults}
              />
            )}
          </div>
        </div>
      </div>
    </>
  )
}
