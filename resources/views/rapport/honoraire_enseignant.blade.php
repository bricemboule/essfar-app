{{-- resources/views/reports/teacher-earnings-pdf.blade.php --}}
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rapport des Honoraires Enseignants</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 11px;
            color: #333;
            line-height: 1.4;
        }

        .header {
            text-align: center;
            margin-bottom: 20px;
            padding: 15px;
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            border-radius: 5px;
        }

        .header h1 {
            font-size: 20px;
            margin-bottom: 5px;
            text-transform: uppercase;
        }

        .header .period {
            font-size: 13px;
            font-weight: bold;
            margin-top: 8px;
        }

        .summary-boxes {
            display: table;
            width: 100%;
            margin-bottom: 20px;
            border-collapse: collapse;
        }

        .summary-box {
            display: table-cell;
            width: 25%;
            padding: 12px;
            text-align: center;
            border: 1px solid #dee2e6;
            background-color: #f8f9fa;
        }

        .summary-box .value {
            font-size: 16px;
            font-weight: bold;
            color: #28a745;
            margin-bottom: 3px;
        }

        .summary-box .label {
            font-size: 9px;
            color: #6c757d;
            text-transform: uppercase;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        table thead {
            background-color: #6c757d;
            color: white;
        }

        table thead th {
            padding: 10px;
            text-align: center;
            font-weight: bold;
            border: 1px solid #495057;
            font-size: 11px;
        }

        table tbody td {
            padding: 8px;
            border: 1px solid #dee2e6;
            font-size: 10px;
        }

        table tbody tr:nth-child(even) {
            background-color: #f8f9fa;
        }

        table tbody tr:hover {
            background-color: #e9ecef;
        }

        .text-center {
            text-align: center;
        }

        .text-right {
            text-align: right;
        }

        .text-left {
            text-align: left;
        }

        .font-bold {
            font-weight: bold;
        }

        .total-row {
            background-color: #28a745 !important;
            color: white;
            font-weight: bold;
            font-size: 11px;
        }

        .total-row td {
            padding: 12px 8px;
            border: 2px solid #1e7e34;
        }

        .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 3px;
            font-size: 9px;
            font-weight: bold;
        }

        .badge-info {
            background-color: #17a2b8;
            color: white;
        }

        .observations {
            margin-top: 20px;
            padding: 15px;
            background-color: #e7f3ff;
            border-left: 4px solid #17a2b8;
            border-radius: 3px;
        }

        .observations h3 {
            font-size: 13px;
            margin-bottom: 10px;
            color: #17a2b8;
        }

        .observations ul {
            margin-left: 20px;
        }

        .observations li {
            margin-bottom: 5px;
            font-size: 10px;
        }

        .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 2px solid #dee2e6;
            text-align: center;
            font-size: 9px;
            color: #6c757d;
        }

        .page-break {
            page-break-after: always;
        }

        @page {
            margin: 15mm;
        }
    </style>
</head>
<body>
    <!-- En-tête -->
    <div class="header">
        <h1>📊 Rapport des Honoraires Enseignants</h1>
        <div class="period">
            Période : Du {{ $startDate }} au {{ $endDate }}
        </div>
    </div>

    <!-- Résumé statistiques -->
    <div class="summary-boxes">
        <div class="summary-box">
            <div class="value">{{ number_format($totalEarnings, 0, ',', ' ') }} FCFA</div>
            <div class="label">Total Honoraires</div>
        </div>
        <div class="summary-box">
            <div class="value">{{ number_format($totalHours, 0, ',', ' ') }}h</div>
            <div class="label">Total Heures</div>
        </div>
        <div class="summary-box">
            <div class="value">{{ count($earnings) }}</div>
            <div class="label">Enseignants Actifs</div>
        </div>
        <div class="summary-box">
            <div class="value">{{ number_format($averageHourlyRate, 0, ',', ' ') }} FCFA</div>
            <div class="label">Tarif Moyen/h</div>
        </div>
    </div>

    <!-- Tableau des honoraires -->
    <table>
        <thead>
            <tr>
                <th style="width: 5%;">#</th>
                <th style="width: 35%;">Enseignant</th>
                <th style="width: 20%;">Heures effectuées</th>
                <th style="width: 20%;">Tarif horaire moyen</th>
                <th style="width: 20%;">Total à payer</th>
            </tr>
        </thead>
        <tbody>
            @foreach($earnings as $index => $earning)
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td class="font-bold">{{ $earning['name'] }}</td>
                <td class="text-center">
                    <span class="badge badge-info">{{ number_format($earning['total_hours'], 2, ',', ' ') }} h</span>
                </td>
                <td class="text-center">
                    {{ number_format($earning['avg_hourly_rate'], 0, ',', ' ') }} FCFA
                </td>
                <td class="text-right font-bold">
                    {{ number_format($earning['total_earnings'], 0, ',', ' ') }} FCFA
                </td>
            </tr>
            @endforeach
            
            <!-- Ligne de total -->
            <tr class="total-row">
                <td colspan="2" class="text-right">TOTAL GÉNÉRAL</td>
                <td class="text-center">{{ number_format($totalHours, 2, ',', ' ') }} h</td>
                <td class="text-center">{{ number_format($averageHourlyRate, 0, ',', ' ') }} FCFA</td>
                <td class="text-right">{{ number_format($totalEarnings, 0, ',', ' ') }} FCFA</td>
            </tr>
        </tbody>
    </table>

    <!-- Observations et analyses -->
    <div class="observations">
        <h3>📋 Résumé et Observations</h3>
        <ul>
            <li>
                <strong>Budget total :</strong> {{ number_format($totalEarnings, 0, ',', ' ') }} FCFA 
                versés à {{ count($earnings) }} enseignant(s) pour {{ number_format($totalHours, 0, ',', ' ') }} heures de cours.
            </li>
            <li>
                <strong>Tarif horaire moyen :</strong> {{ number_format($averageHourlyRate, 0, ',', ' ') }} FCFA
            </li>
            @if(count($earnings) > 0)
            @php
                $topEarner = collect($earnings)->sortByDesc('total_earnings')->first();
            @endphp
            <li>
                <strong>Enseignant le mieux rémunéré :</strong> {{ $topEarner['name'] }} 
                avec {{ number_format($topEarner['total_earnings'], 0, ',', ' ') }} FCFA
            </li>
            <li>
                <strong>Moyenne heures/enseignant :</strong> 
                {{ number_format($totalHours / count($earnings), 1, ',', ' ') }}h
            </li>
            @endif
            <li class="font-bold" style="margin-top: 8px; color: #6c757d;">
                ℹ️ Ce rapport inclut uniquement les séances marquées comme terminées durant la période sélectionnée.
            </li>
        </ul>
    </div>

    <!-- Pied de page -->
    <div class="footer">
        <p>Document généré le {{ $generatedDate }}</p>
        <p>Système de Gestion Scolaire - Rapport confidentiel</p>
    </div>
</body>
</html>