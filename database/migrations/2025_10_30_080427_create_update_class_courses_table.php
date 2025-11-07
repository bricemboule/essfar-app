<?php
// database/migrations/xxxx_xx_xx_update_class_courses_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('class_courses', function (Blueprint $table) {
    
            if (!Schema::hasColumn('class_courses', 'credits')) {
                $table->integer('credits')->nullable()->after('teacher_id')
                    ->comment('Crédits spécifiques pour cette classe. NULL = utiliser les crédits du cours');
            }
            
        
            if (!Schema::hasColumn('class_courses', 'is_mandatory')) {
                $table->boolean('is_mandatory')->default(true)->after('credits')
                    ->comment('Indique si le cours est obligatoire pour cette classe');
            }
        });
    }

    public function down()
    {
        Schema::table('class_courses', function (Blueprint $table) {
            $table->dropColumn(['credits', 'is_mandatory']);
        });
    }
};