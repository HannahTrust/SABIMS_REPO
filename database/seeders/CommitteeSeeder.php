<?php

namespace Database\Seeders;

use App\Models\Committee;
use Illuminate\Database\Seeder;

class CommitteeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $committees = [
            [
                'name' => 'Committee on Health',
                'description' => 'Oversees health programs and policies.',
            ],
            [
                'name' => 'Committee on Agriculture',
                'description' => 'Handles agriculture and rural development matters.',
            ],
            [
                'name' => 'Committee on Social Services',
                'description' => 'Addresses social welfare and community services.',
            ],
            [
                'name' => 'Committee on Food',
                'description' => 'Responsible for food security and nutrition programs.',
            ],
            [
                'name' => 'Committee on Education',
                'description' => 'Oversees education and youth development.',
            ],
        ];

        foreach ($committees as $data) {
            Committee::updateOrCreate(
                ['name' => $data['name']],
                [
                    'description' => $data['description'] ?? null,
                ]
            );
        }
    }
}
