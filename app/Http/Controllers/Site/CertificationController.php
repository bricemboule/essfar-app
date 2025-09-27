<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use Inertia\Inertia;

class CertificationController extends Controller
{
    
    public function camec(){

        $programme = [
            'title' => 'Architecte Big Data et IA dans le Cloud',
        'description' => 'Cette certification forme des professionnels capables de concevoir et déployer des solutions Big Data et IA sur des environnements cloud pour des entreprises de toutes tailles.',
        'diplome' => 'Certification Professionnelle',
         'image' => '/Images/ing.jpeg',
    'documents' => [
        ['name' => 'Brochure', 'url' => '/pdf/licence.pdf'],
         ['name' => 'Dossier de candidature', 'url' => '/pdf/licence.pdf'],
    ],
        'sections' => [
            [
                'title' => 'Objectifs',
                'items' => [
                    'Maîtriser l’architecture Big Data sur le Cloud',
                    'Intégrer l’IA dans des solutions cloud scalables',
                    'Optimiser le traitement et l’analyse de données massives',
                ]
            ],
            [
                'title' => 'Compétences développées',
                'items' => [
                    'Cloud computing (AWS, Azure, GCP)',
                    'Big Data et data pipelines',
                    'Machine learning et IA en production',
                    'Sécurité et scalabilité des infrastructures cloud',
                ]
            ],
            [
                'title' => 'Méthodes pédagogiques',
                'items' => [
                    'Projets cloud et Big Data concrets',
                    'Mises en situation sur plateformes IA et Cloud',
                    'Ateliers pratiques avec encadrement',
                ]
            ],
            [
                'title' => 'Débouchés professionnels',
                'items' => [
                    'Architecte Cloud Big Data et IA',
                    'Data Engineer/ML Engineer Cloud',
                    'Consultant IA & Big Data',
                    'Responsable projets data et IA',
                ]
            ]
        ],
          'video_temoignage' => [
                      'titre' => 'Témoignage d\'un ancien étudiant',
                    'url' => '/videos/video.mp4',
                  'description' => 'Découvrez l\'expérience de notre ancien étudiant, qui partage son parcours et les bénéfices de cette formation.'
        ]
    ];

    return Inertia::render("Certificate/Show", ['programme' => $programme]);

    }

    public function developpeur_sql() {
        
        $programme = [
             
        'title' => 'Développeur SQL Avancé',
        'description' => 'Cette certification permet de maîtriser le langage SQL, la gestion de bases de données relationnelles, et l’optimisation des requêtes pour des environnements complexes. Les participants seront capables de concevoir, manipuler et analyser efficacement les données.',
        'diplome' => 'Certification Professionnelle',
         'image' => '/Images/ing.jpeg',
    'documents' => [
        ['name' => 'Brochure', 'url' => '/pdf/licence.pdf'],
         ['name' => 'Dossier de candidature', 'url' => '/pdf/licence.pdf'],
    ],
        'sections' => [
            [
                'title' => 'Objectifs',
                'items' => [
                    'Maîtriser SQL et les bases de données relationnelles',
                    'Optimiser les requêtes et performances des bases de données',
                    'Préparer à des missions de gestion et exploitation de données pour les entreprises',
                ]
            ],
            [
                'title' => 'Compétences développées',
                'items' => [
                    'Conception de bases de données relationnelles',
                    'Requêtes avancées et optimisation SQL',
                    'Gestion de transactions et sécurité des données',
                    'Analyse et extraction de données pour la prise de décision',
                ]
            ],
            [
                'title' => 'Méthodes pédagogiques',
                'items' => [
                    'Cours pratiques et exercices SQL',
                    'Études de cas et projets sur bases réelles',
                    'Laboratoires sur plateformes SQL',
                ]
            ],
            [
                'title' => 'Débouchés professionnels',
                'items' => [
                    'Développeur SQL',
                    'Analyste de données',
                    'Administrateur de bases de données',
                    'Consultant en data management',
                ]
            ]
    ],
      'video_temoignage' => [
                      'titre' => 'Témoignage d\'un ancien étudiant',
                    'url' => '/videos/video.mp4',
                  'description' => 'Découvrez l\'expérience de notre ancien étudiant, qui partage son parcours et les bénéfices de cette formation.'
        ]
];

        return Inertia::render('Certification/Show', ['programme' => $programme]);
    }


    public function architecte_ia_big_data() {

        $programme = [
'title' => 'Architecte de l\'IA et du Big Data',
        'description' => 'Cette certification forme des experts capables de concevoir et superviser des architectures Big Data intégrant l’intelligence artificielle pour des applications à grande échelle.',
        'diplome' => 'Certification Professionnelle',
        'image' => '/Images/ing.jpeg',
    'documents' => [
        ['name' => 'Brochure', 'url' => '/pdf/licence.pdf'],
         ['name' => 'Dossier de candidature', 'url' => '/pdf/licence.pdf'],
    ],
        'sections' => [
            [
                'title' => 'Objectifs',
                'items' => [
                    'Concevoir des architectures Big Data intégrant l’IA',
                    'Optimiser le traitement de données massives',
                    'Préparer à la direction de projets data et IA',
                ]
            ],
            [
                'title' => 'Compétences développées',
                'items' => [
                    'Data engineering et pipelines Big Data',
                    'Machine learning et deep learning pour grandes données',
                    'Gestion d’infrastructures cloud et distribuées',
                    'Sécurité et gouvernance des données',
                ]
            ],
            [
                'title' => 'Méthodes pédagogiques',
                'items' => [
                    'Projets pratiques sur datasets volumineux',
                    'Travaux sur architectures cloud et Big Data',
                    'Cas concrets de mise en production d’IA',
                ]
            ],
            [
                'title' => 'Débouchés professionnels',
                'items' => [
                    'Architecte Big Data et IA',
                    'Consultant en intelligence artificielle',
                    'Responsable Data Science',
                    'Chef de projet Big Data et IA',
                ]
            ]
        ],
          'video_temoignage' => [
                      'titre' => 'Témoignage d\'un ancien étudiant',
                    'url' => '/videos/video.mp4',
                  'description' => 'Découvrez l\'expérience de notre ancien étudiant, qui partage son parcours et les bénéfices de cette formation.'
        ]
    ];

        return Inertia::render('Certificatio/Show', ['programme' => $programme]);
    }


    public function developpeur_web_mobile(){

        $programme = [
            'title' => 'Développeur Fullstack Web et Mobile',
        'description' => 'Cette certification permet de maîtriser le développement d’applications web et mobiles en utilisant les technologies front-end et back-end modernes, avec une approche pratique et orientée projets.',
        'diplome' => 'Certification Professionnelle',
         'image' => '/Images/ing.jpeg',
    'documents' => [
        ['name' => 'Brochure', 'url' => '/pdf/licence.pdf'],
         ['name' => 'Dossier de candidature', 'url' => '/pdf/licence.pdf'],
    ],
        'sections' => [
            [
                'title' => 'Objectifs',
                'items' => [
                    'Développer des applications web et mobiles complètes',
                    'Maîtriser les technologies front-end et back-end',
                    'Préparer à des projets professionnels fullstack',
                ]
            ],
            [
                'title' => 'Compétences développées',
                'items' => [
                    'HTML, CSS, JavaScript, React, Angular',
                    'Node.js, PHP, Python, bases de données',
                    'Déploiement sur cloud et gestion d’infrastructure',
                    'Conception UI/UX et expérience utilisateur',
                ]
            ],
            [
                'title' => 'Méthodes pédagogiques',
                'items' => [
                    'Projets web et mobile concrets',
                    'Ateliers pratiques sur frameworks modernes',
                    'Suivi de mentor et code reviews',
                ]
            ],
            [
                'title' => 'Débouchés professionnels',
                'items' => [
                    'Développeur Fullstack',
                    'Ingénieur Frontend/Backend',
                    'Développeur mobile',
                    'Consultant en développement applicatif',
                ]
            ]
        ],
          'video_temoignage' => [
                      'titre' => 'Témoignage d\'un ancien étudiant',
                    'url' => '/videos/video.mp4',
                  'description' => 'Découvrez l\'expérience de notre ancien étudiant, qui partage son parcours et les bénéfices de cette formation.'
        ]
    ];

        return Inertia::render('Certification/Show', ['programme' => $programme]);
    }

    public function architecte_big_data(){

        $programme = [
            'title' => 'Architecte Big Data et IA dans le Cloud',
        'description' => 'Cette certification forme des professionnels capables de concevoir et déployer des solutions Big Data et IA sur des environnements cloud pour des entreprises de toutes tailles.',
        'diplome' => 'Certification Professionnelle',
         'image' => '/Images/ing.jpeg',
    'documents' => [
        ['name' => 'Brochure', 'url' => '/pdf/licence.pdf'],
         ['name' => 'Dossier de candidature', 'url' => '/pdf/licence.pdf'],
    ],
        'sections' => [
            [
                'title' => 'Objectifs',
                'items' => [
                    'Maîtriser l’architecture Big Data sur le Cloud',
                    'Intégrer l’IA dans des solutions cloud scalables',
                    'Optimiser le traitement et l’analyse de données massives',
                ]
            ],
            [
                'title' => 'Compétences développées',
                'items' => [
                    'Cloud computing (AWS, Azure, GCP)',
                    'Big Data et data pipelines',
                    'Machine learning et IA en production',
                    'Sécurité et scalabilité des infrastructures cloud',
                ]
            ],
            [
                'title' => 'Méthodes pédagogiques',
                'items' => [
                    'Projets cloud et Big Data concrets',
                    'Mises en situation sur plateformes IA et Cloud',
                    'Ateliers pratiques avec encadrement',
                ]
            ],
            [
                'title' => 'Débouchés professionnels',
                'items' => [
                    'Architecte Cloud Big Data et IA',
                    'Data Engineer/ML Engineer Cloud',
                    'Consultant IA & Big Data',
                    'Responsable projets data et IA',
                ]
            ]
        ],
          'video_temoignage' => [
                      'titre' => 'Témoignage d\'un ancien étudiant',
                    'url' => '/videos/video.mp4',
                  'description' => 'Découvrez l\'expérience de notre ancien étudiant, qui partage son parcours et les bénéfices de cette formation.'
        ]
    ];

    return Inertia::render('Certification/Show', ['programme'=> $programme]);
    }
}
