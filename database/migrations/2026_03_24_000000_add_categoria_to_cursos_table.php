<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cursos', function (Blueprint $table) {
            if (! Schema::hasColumn('cursos', 'categoria')) {
                $table->string('categoria')->default('tecnologia')->after('estado');
            }
        });
    }

    public function down(): void
    {
        Schema::table('cursos', function (Blueprint $table) {
            if (Schema::hasColumn('cursos', 'categoria')) {
                $table->dropColumn('categoria');
            }
        });
    }
};
