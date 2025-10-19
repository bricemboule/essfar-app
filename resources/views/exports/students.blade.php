<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Liste des étudiants</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #555; padding: 6px; text-align: left; }
        th { background: #f2f2f2; }
    </style>
</head>
<body>
    <h3 style="text-align:center;">Liste des étudiants </h3>
    <table>
        <thead>
            <tr>
                <th>Nom</th><th>Email</th><th>Sexe</th>
                <th>Classe</th><th>Année académique</th><th>Statut</th>
            </tr>
        </thead>
        <tbody>
            @foreach($students as $student)
            <tr>
                <td>{{ $student['Nom'] }}</td>
                <td>{{ $student['Email'] }}</td>
                <td>{{ $student['Sexe'] }}</td>
                <td>{{ $student['Classe'] }}</td>
                <td>{{ $student['Année académique'] }}</td>
                <td>{{ $student['Statut'] }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
