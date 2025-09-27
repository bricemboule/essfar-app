import { href } from "react-router-dom";

export const menuItems = [
    {
        label: "L’école",
        children: [
            { label: "Mot du Directeur", href: "/ecole/mot-du-directeur" },
            { label: "Notre Gouvernance", href: "/ecole/notre-gouvernance" },
            {
                label: "Projet Pédagogique",
                href: "/ecole/projet-pedagogique",
            },
            { label: "Nos Partenaires", href: "/ecole/partenaires" },
        ],
    },
    {
        label: "Étudier à ESSFAR",
        children: [
            {
                label: "Je suis un étudiant",
                href: "/etudier_a_essfar/etudiant",
            },
            { label: "Je suis salarié", href: "/etudier_a_essfar/salarier" },
            {
                label: "Nos formations",
                href: "/etudier_a_essfar/formations",
            },
            { label: "Admissions", href: "/etudier_a_essfar/admission" },
            {
                label: "Anciennes Epreuves",
                href: "/etudier_a_essfar/anciens_sujets",
            },
            {
                label: "Frais de scolarité",
                href: "/etudier_a_essfar/frais_scolarite",
            },
        ],
    },
    {
        label: "La Vie à ESSFAR",
        children: [
            { label: "Vie étudiante" },
            { label: "Clubs & Associations" },
            { label: "Événements" },
        ],
    },
    {
        label: "Nos Certifications",
        children: [
            {
                label: "Architecte Big Data et IA dans le Cloud",
                href: "/certifications/architecte_big_data",
            },
            {
                label: "Développeur Fullstack Web et Mobile",
                href: "/certifications/developpeur_web_mobile",
            },
            {
                label: "Architecte de l'IA et du Big Data",
                href: "/certifications/architecte_ia_big_data",
            },
            {
                label: "Développeur SQL Avancé",
                href: "/certifications/developpeur_sql",
            },
            {
                label: "Capital Market Excecutive Certificate",
                href: "/certifications/camec",
            },
        ],
    },
    {
        label: "L'international",
        children: [
            {
                label: "École Partenaire",
            },
            {
                label: "Offres de Mobilité",
            },
        ],
    },
    {
        label: "Entreprises",
        children: [{ label: "Partenaire" }, { label: "Incubateur" }],
    },
];
