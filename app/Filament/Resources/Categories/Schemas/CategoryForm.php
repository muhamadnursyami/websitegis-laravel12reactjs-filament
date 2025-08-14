<?php

namespace App\Filament\Resources\Categories\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class CategoryForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')
                    ->required(),
                FileUpload::make('icon')
                    ->image()
                    ->disk('public')
                    ->directory('categories-icons')
                    ->visibility('public')
                    ->openable()
                    ->downloadable(),
            ]);
    }
}
