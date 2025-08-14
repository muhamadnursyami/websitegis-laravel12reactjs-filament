<?php

namespace App\Filament\Resources\Laporans\Schemas;

use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TimePicker;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class LaporanForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('category_id')
                    ->label('Category')
                    ->relationship('category', 'name')
                    ->required(),
                TextInput::make('nama'),
                TextInput::make('email')
                    ->label('Email address')
                    ->email(),
                TextInput::make('telepon')
                    ->tel(),
                DatePicker::make('tanggal'),
                TimePicker::make('waktu'),
                TextInput::make('kondisi'),
                TextInput::make('detail_lokasi'),
                Textarea::make('deskripsi_laporan')
                    ->columnSpanFull(),
                FileUpload::make('gambar')
                    ->image()
                    ->disk('public')
                    ->directory('laporan-images')
                    ->visibility('public')
                    ->openable()
                    ->downloadable(),
                TextInput::make('latitude')
                    ->required()
                    ->numeric(),
                TextInput::make('longitude')
                    ->required()
                    ->numeric(),
                Toggle::make('status')
                    ->required(),
            ]);
    }
}
