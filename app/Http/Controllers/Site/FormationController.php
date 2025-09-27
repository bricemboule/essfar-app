<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use Inertia\Inertia;

class FormationController extends Controller
{
    
  public function Mathematiques(){

     $programme = [
        'title' => 'Mathématiques et Econimie-Finance-Assurance',
        'description' => 'La Licence en Mathématiques et Econimie-Finance-Assurance vise à former des étudiants capables de combiner des compétences mathématiques avancées avec des connaissances solides en économie, finance et assurance. L’objectif est de préparer des professionnels capables d’analyser des données économiques, de modéliser des risques financiers et assurantiels, et de prendre des décisions stratégiques basées sur des méthodes quantitatives.',
        'diplome' => 'Licence (BAC+3)',
        'image' => '/Images/ing.jpeg',
        'documents' => [
            ['name' => 'Brochure', 'url' => '/pdf/licence.pdf'],
            ['name' => 'Dossier de candidature', 'url' => '/pdf/licence.pdf'],
        ],
        'sections' => [
            [
                'title' => 'Objectifs',
                'items' => [
                    'Former des bacheliers aux métiers de l’actuariat',
                    'Apporter des bases solides en statistiques et finances'
                ]
            ],
            [
                'title' => 'Compétences développées',
                'items' => [
                  'Analyse mathématique, algèbre, probabilités et statistiques',
                  'Modélisation et résolution de problèmes complexes',
                  'Microéconomie et macroéconomie',
                  'Gestion financière, marchés financiers, évaluation d’actifs',
                  'Théorie du risque et produits d’assurance',
                  'Actuariat, modélisation des sinistres et prévision',
                  'Analyse de données et utilisation de logiciels spécialisés (Excel, R, Python…)',
                  'Capacité à travailler sur des projets interdisciplinaires et à communiquer des résultats complexes'
                ]
            ],
            [
                'title' => 'Niveau d’étude requis',
                'items' => [
                    'Bac scientifique',
                    'Entrée possible en Licence 2 et Licence 3'
                ]
            ],
            [
              'title' => 'Méthodes pédagogiques',
              'items' => [
                'Cours théoriques et travaux dirigés',
                'Projets pratiques et études de cas',
                'Stages en entreprise ou en laboratoire de recherche',
                'Utilisation d’outils informatiques pour la simulation et la modélisation'
              ]
            ],
            [
              'title' => 'Débouchés professionnels',
              'items' => [
                'Analyste financier ou économique',
                'Actuaire dans les assurances ou banques',
                'Gestionnaire de risques financiers et assurantiels',
                'Consultant en finance quantitative ou en modélisation des risques',
                'Poursuite d’études en Master (Finance, Actuariat, Data Science, Économie appliquée)'
              ]
            ]
        ],
        'video_temoignage' => [
                      'titre' => 'Témoignage d\'un ancien étudiant',
                    'url' => '/videos/video.mp4',
                  'description' => 'Découvrez l\'expérience de notre ancien étudiant, qui partage son parcours et les bénéfices de cette formation.'
        ],
    ];

    return Inertia::render('Formation/Show', ['programme' => $programme]);

  }

  public function Informatique(){
    $programme = [
    'title' => 'Informatique des Organisations',
    'description' => 'La Licence en Informatique des Organisations vise à former des étudiants capables de comprendre et de gérer les systèmes d’information au sein des entreprises et organisations. L’objectif est de préparer des professionnels aptes à concevoir, développer et administrer des solutions informatiques adaptées aux besoins organisationnels et stratégiques.',
    'diplome' => 'Licence (BAC+3)',
    'image' => '/Images/ing.jpeg',
    'documents' => [
        ['name' => 'Brochure', 'url' => '/pdf/licence.pdf'],
         ['name' => 'Dossier de candidature', 'url' => '/pdf/licence.pdf'],
    ],
    'sections' => [
        [
            'title' => 'Objectifs',
            'items' => [
                'Former des professionnels capables de gérer les systèmes d’information des organisations',
                'Apporter des compétences en développement, administration et sécurité des systèmes informatiques'
            ]
        ],
        [
            'title' => 'Compétences développées',
            'items' => [
                'Programmation et développement logiciel (Java, Python, C#, etc.)',
                'Bases de données et gestion de l’information',
                'Administration des réseaux et sécurité informatique',
                'Analyse et modélisation des processus organisationnels',
                'Gestion de projets informatiques',
                'Utilisation des outils collaboratifs et ERP',
                'Capacité à travailler en équipe et à communiquer avec des profils techniques et non techniques'
            ]
        ],
        [
            'title' => 'Niveau d’étude requis',
            'items' => [
                'Bac scientifique ou technologique (STI2D, STI ou S)',
                'Entrée possible en Licence 2 et Licence 3 selon parcours'
            ]
        ],
        [
            'title' => 'Méthodes pédagogiques',
            'items' => [
                'Cours théoriques et travaux dirigés',
                'Projets pratiques et études de cas',
                'Stages en entreprise pour une immersion professionnelle',
                'Laboratoires et ateliers pratiques pour le développement logiciel et la gestion des systèmes'
            ]
        ],
        [
            'title' => 'Débouchés professionnels',
            'items' => [
                'Administrateur ou analyste systèmes et réseaux',
                'Développeur logiciel ou web',
                'Consultant en systèmes d’information',
                'Chef de projet informatique',
                'Poursuite d’études en Master (Informatique, Management des SI, Cybersécurité, Data Science)'
            ]
        ]
    ],
    'video_temoignage' => [
                      'titre' => 'Témoignage d\'un ancien étudiant',
                    'url' => '/videos/video.mp4',
                  'description' => 'Découvrez l\'expérience de notre ancien étudiant, qui partage son parcours et les bénéfices de cette formation.'
        ]
];

 return Inertia::render('Formation/Show', ['programme' => $programme]);

  }

  public function Actuariat(){

    $programme = [
    'title' => 'Master Actuariat',
    'description' => 'Le Master en Actuariat forme des experts capables de mesurer, modéliser et gérer les risques financiers et assurantiels dans un environnement complexe et international. Les étudiants acquièrent des compétences avancées en mathématiques appliquées, statistiques, finance quantitative et analyse de données pour répondre aux besoins des entreprises d’assurance, banques et institutions financières.',
    'diplome' => 'Master (BAC+5)',
    'image' => '/Images/ing.jpeg',
    'documents' => [
        ['name' => 'Brochure', 'url' => '/pdf/Master.pdf'],
         ['name' => 'Dossier de candidature', 'url' => '/pdf/Master.pdf'],
    ],
    'sections' => [
        [
            'title' => 'Objectifs',
            'items' => [
                'Former des spécialistes de l’actuariat capables de gérer les risques complexes',
                'Développer des compétences avancées en finance quantitative, statistiques et modélisation des risques',
                'Préparer les étudiants à des carrières internationales dans les secteurs de l’assurance, des banques et de la finance'
            ]
        ],
        [
            'title' => 'Compétences développées',
            'items' => [
                'Mathématiques appliquées avancées et statistiques',
                'Modélisation financière et actuarielle',
                'Gestion des risques financiers et assurantiels',
                'Finance quantitative, évaluation d’actifs et produits dérivés',
                'Data analysis, programmation et utilisation de logiciels spécialisés (R, Python, SAS, Excel avancé)',
                'Analyse des marchés financiers et gestion de portefeuille',
                'Capacité à élaborer des stratégies de gestion des risques et à conseiller les entreprises'
            ]
        ],
        [
            'title' => 'Niveau d’étude requis',
            'items' => [
                'Licence en Mathématiques, Statistiques, Finance ou Actuariat',
                'Sélection basée sur dossier académique, lettre de motivation et éventuellement entretien'
            ]
        ],
        [
            'title' => 'Méthodes pédagogiques',
            'items' => [
                'Cours théoriques avancés et séminaires spécialisés',
                'Projets de recherche et études de cas complexes',
                'Stages en entreprise et missions professionnelles',
                'Travaux pratiques sur logiciels actuariels et financiers',
                'Participation à des conférences et ateliers professionnels'
            ]
        ],
        [
            'title' => 'Débouchés professionnels',
            'items' => [
                'Actuaire senior en assurance, banque ou mutuelle',
                'Consultant en gestion des risques et finance quantitative',
                'Analyste financier spécialisé en produits dérivés et gestion de portefeuille',
                'Chargé de modélisation et prévision des risques',
                'Poursuite possible en doctorat ou recherche académique en actuariat et finance quantitative'
            ]
        ]
    ],
    'video_temoignage' => [
                      'titre' => 'Témoignage d\'un ancien étudiant',
                    'url' => '/videos/video.mp4',
                  'description' => 'Découvrez l\'expérience de notre ancien étudiant, qui partage son parcours et les bénéfices de cette formation.'
        ],
];
return Inertia::render('Formation/Show', ['programme' => $programme]);
 
  }

  public function IngenierieFinanciere(){

$programme = [
    'title' => 'Master Ingénierie Financière',
    'description' => 'Le Master en Ingénierie Financière forme des experts capables de concevoir, analyser et gérer des produits financiers complexes et des stratégies d’investissement. Les étudiants développent des compétences avancées en finance quantitative, modélisation des risques, marchés financiers et instruments financiers dérivés, leur permettant d’opérer dans des banques, sociétés d’investissement et institutions financières.',
    'diplome' => 'Master (BAC+5)',
    'image' => '/Images/ing.jpeg',
    'documents' => [
        ['name' => 'Brochure', 'url' => '/pdf/Master.pdf'],
         ['name' => 'Dossier de candidature', 'url' => '/pdf/Master.pdf'],
    ],
    'sections' => [
        [
            'title' => 'Objectifs',
            'items' => [
                'Former des spécialistes capables de concevoir et gérer des produits financiers complexes',
                'Développer des compétences avancées en finance quantitative et modélisation des risques',
                'Préparer les étudiants à des carrières dans la banque, les marchés financiers et les sociétés d’investissement'
            ]
        ],
        [
            'title' => 'Compétences développées',
            'items' => [
                'Finance quantitative et mathématiques financières avancées',
                'Modélisation et gestion des risques financiers',
                'Évaluation et structuration de produits financiers dérivés',
                'Analyse des marchés financiers et stratégies d’investissement',
                'Gestion de portefeuille et optimisation des actifs',
                'Programmation et utilisation d’outils financiers (Python, R, MATLAB, Excel avancé)',
                'Capacité à conseiller et élaborer des stratégies financières complexes'
            ]
        ],
        [
            'title' => 'Niveau d’étude requis',
            'items' => [
                'Licence ou Master en Finance, Économie, Mathématiques, Actuariat ou disciplines similaires',
                'Sélection sur dossier académique et éventuellement entretien'
            ]
        ],
        [
            'title' => 'Méthodes pédagogiques',
            'items' => [
                'Cours théoriques et séminaires spécialisés',
                'Projets pratiques et études de cas sur marchés financiers',
                'Stages en entreprises et institutions financières',
                'Travaux sur logiciels et plateformes financières',
                'Participation à des conférences et workshops professionnels'
            ]
        ],
        [
            'title' => 'Débouchés professionnels',
            'items' => [
                'Trader ou analyste sur les marchés financiers',
                'Consultant en ingénierie financière ou gestion de risques',
                'Gestionnaire de portefeuille ou analyste en investissement',
                'Chargé de structuration de produits financiers dérivés',
                'Consultant en banque d’investissement ou société de conseil financier',
                'Poursuite possible en doctorat ou recherche académique en finance quantitative'
            ]
        ]
    ],
    'video_temoignage' => [
                      'titre' => 'Témoignage d\'un ancien étudiant',
                    'url' => '/videos/video.mp4',
                  'description' => 'Découvrez l\'expérience de notre ancien étudiant, qui partage son parcours et les bénéfices de cette formation.'
        ],
];

    return Inertia::render('Formation/Show', ['programme' => $programme]);
  }

  public function BigData(){
    $programme = [
    'title' => 'Master Statistique, Big Data et Intelligence Artificielle',
    'description' => 'Le Master en Statistique, Big Data et Intelligence Artificielle vise à former des experts capables de traiter, analyser et exploiter des volumes massifs de données pour résoudre des problématiques complexes. Les étudiants développent des compétences avancées en statistique, machine learning, intelligence artificielle et data engineering, leur permettant d’opérer dans des secteurs variés tels que la finance, la santé, l’assurance, l’industrie et le marketing.',
    'diplome' => 'Master (BAC+5)',
    'image' => '/Images/ing.jpeg',
    'documents' => [
        ['name' => 'Brochure', 'url' => '/pdf/Master.pdf'],
        ['name' => 'Dossier de candidature', 'url' => '/pdf/Master.pdf'],
    ],
    'sections' => [
        [
            'title' => 'Objectifs',
            'items' => [
                'Former des spécialistes capables d’analyser et exploiter des volumes massifs de données',
                'Développer des compétences avancées en statistiques, machine learning et intelligence artificielle',
                'Préparer les étudiants à des carrières dans la data science, l’IA et le Big Data dans des secteurs variés'
            ]
        ],
        [
            'title' => 'Compétences développées',
            'items' => [
                'Statistiques avancées et probabilités appliquées',
                'Machine learning, deep learning et intelligence artificielle',
                'Gestion et traitement de données massives (Big Data)',
                'Programmation et utilisation d’outils spécialisés (Python, R, SQL, Spark, TensorFlow, PyTorch)',
                'Analyse prédictive, modélisation et visualisation des données',
                'Capacité à concevoir des solutions basées sur l’IA pour résoudre des problèmes réels',
                'Communication des résultats et recommandations stratégiques basées sur les données'
            ]
        ],
        [
            'title' => 'Niveau d’étude requis',
            'items' => [
                'Licence ou Master en Mathématiques, Statistique, Informatique ou domaines similaires',
                'Sélection basée sur dossier académique et éventuellement entretien'
            ]
        ],
        [
            'title' => 'Méthodes pédagogiques',
            'items' => [
                'Cours théoriques et séminaires spécialisés',
                'Projets pratiques et études de cas sur données réelles',
                'Stages en entreprise et missions professionnelles',
                'Travaux sur plateformes Big Data et outils d’intelligence artificielle',
                'Participation à des conférences et workshops spécialisés'
            ]
        ],
        [
            'title' => 'Débouchés professionnels',
            'items' => [
                'Data Scientist ou Data Analyst',
                'Consultant en Big Data et intelligence artificielle',
                'Ingénieur en machine learning ou deep learning',
                'Analyste de données dans la finance, santé, marketing ou industrie',
                'Chef de projet en data science et IA',
                'Poursuite possible en doctorat ou recherche académique en IA et statistiques avancées'
            ]
        ]
    ],
    'video_temoignage' => [
                      'titre' => 'Témoignage d\'un ancien étudiant',
                    'url' => '/videos/video.mp4',
                  'description' => 'Découvrez l\'expérience de notre ancien étudiant, qui partage son parcours et les bénéfices de cette formation.'
        ],
];

     return Inertia::render('Formation/Show', ['programme' => $programme]);
  }

  public function Systeme_information(){

    $programme = [
    'title' => 'Master Systèmes d’Information',
    'description' => 'Le Master en Systèmes d’Information forme des experts capables de concevoir, gérer et optimiser les systèmes d’information au sein des organisations. Les étudiants acquièrent des compétences avancées en architecture des SI, gestion de projets informatiques, sécurité, analyse de données et transformation digitale, leur permettant de répondre aux besoins stratégiques des entreprises et institutions.',
    'diplome' => 'Master (BAC+5)',
    'image' => '/Images/ing.jpeg',
    'documents' => [
        ['name' => 'Brochure', 'url' => '/pdf/Master.pdf'],
        ['name' => 'Dossier de candidature', 'url' => '/pdf/Master.pdf'],
    ],
    'sections' => [
        [
            'title' => 'Objectifs',
            'items' => [
                'Former des spécialistes capables de gérer et optimiser les systèmes d’information des organisations',
                'Développer des compétences en architecture SI, sécurité, data management et transformation digitale',
                'Préparer les étudiants à des carrières stratégiques dans la gestion des systèmes d’information'
            ]
        ],
        [
            'title' => 'Compétences développées',
            'items' => [
                'Conception et administration des systèmes d’information',
                'Gestion de projets informatiques et transformation digitale',
                'Sécurité des systèmes et protection des données',
                'Analyse et exploitation des données pour la prise de décision',
                'Intégration des technologies émergentes (cloud computing, IoT, ERP)',
                'Programmation et utilisation d’outils informatiques spécialisés',
                'Communication et coordination avec des profils techniques et non techniques'
            ]
        ],
        [
            'title' => 'Niveau d’étude requis',
            'items' => [
                'Licence en Informatique, Systèmes d’Information, Gestion ou domaine similaire',
                'Sélection basée sur dossier académique et éventuellement entretien'
            ]
        ],
        [
            'title' => 'Méthodes pédagogiques',
            'items' => [
                'Cours théoriques et séminaires spécialisés',
                'Projets pratiques et études de cas organisationnels',
                'Stages en entreprise pour immersion professionnelle',
                'Travaux sur logiciels et plateformes informatiques',
                'Participation à des conférences et workshops spécialisés'
            ]
        ],
        [
            'title' => 'Débouchés professionnels',
            'items' => [
                'Consultant en systèmes d’information',
                'Chef de projet SI ou transformation digitale',
                'Administrateur ou architecte de systèmes d’information',
                'Analyste fonctionnel ou métier spécialisé en SI',
                'Responsable sécurité des systèmes d’information',
                'Poursuite possible en doctorat ou recherche académique en systèmes d’information'
            ]
        ]
    ],
    'video_temoignage' => [
                      'titre' => 'Témoignage d\'un ancien étudiant',
                    'url' => '/videos/video.mp4',
                  'description' => 'Découvrez l\'expérience de notre ancien étudiant, qui partage son parcours et les bénéfices de cette formation.'
        ],
];
     return Inertia::render('Formation/Show', ['programme' => $programme]);
  }
}
