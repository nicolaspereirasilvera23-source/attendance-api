import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, sheets_v4 } from 'googleapis';
import { PrismaService } from '../prisma/prisma.service';

interface PlayerRow {
  id: string;
  code: string;
  name: string;
  age: number;
  timeInClub: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AttendanceRow {
  id: string;
  playerId: string;
  playerCode: string;
  playerName: string;
  date: string;
  createdAt: string;
}

@Injectable()
export class GoogleSheetsService implements OnModuleInit {
  private readonly logger = new Logger(GoogleSheetsService.name);
  private sheets: sheets_v4.Sheets | null = null;
  private spreadsheetId: string | null = null;
  private enabled = false;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  onModuleInit() {
    this.initialize();
  }

  private initialize() {
    try {
      const clientEmail = this.configService.get<string>(
        'GOOGLE_SHEETS_CLIENT_EMAIL',
      );
      const privateKey = this.configService.get<string>(
        'GOOGLE_SHEETS_PRIVATE_KEY',
      );
      this.spreadsheetId =
        this.configService.get<string>('GOOGLE_SHEETS_SPREADSHEET_ID') || null;

      if (!clientEmail || !privateKey || !this.spreadsheetId) {
        this.logger.warn(
          'Google Sheets credentials not configured. Sync disabled. ' +
            'Set GOOGLE_SHEETS_CLIENT_EMAIL, GOOGLE_SHEETS_PRIVATE_KEY, and GOOGLE_SHEETS_SPREADSHEET_ID to enable.',
        );
        this.enabled = false;
        return;
      }

      const auth = new google.auth.JWT({
        email: clientEmail,
        key: privateKey.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      this.sheets = google.sheets({ version: 'v4', auth });
      this.enabled = true;
      this.logger.log('Google Sheets service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Google Sheets service', error);
      this.enabled = false;
    }
  }

  async syncPlayer(player: PlayerRow): Promise<void> {
    if (!this.enabled || !this.sheets || !this.spreadsheetId) {
      return;
    }

    try {
      const sheetName = 'Jugadores';
      const values: string[][] = [
        [
          player.id,
          player.code,
          player.name,
          player.age.toString(),
          player.timeInClub.toString(),
          player.active ? 'Sí' : 'No',
          player.createdAt,
          player.updatedAt,
        ],
      ];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A:H`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values },
      });

      this.logger.debug(
        `Player synced to Google Sheets: ${player.code} - ${player.name}`,
      );
    } catch (error) {
      this.logger.error(`Failed to sync player ${player.code}`, error);
    }
  }

  async syncAttendance(attendance: AttendanceRow): Promise<void> {
    if (!this.enabled || !this.sheets || !this.spreadsheetId) {
      return;
    }

    try {
      const sheetName = 'Asistencias';
      const values: string[][] = [
        [
          attendance.id,
          attendance.playerId,
          attendance.playerCode,
          attendance.playerName,
          attendance.date,
          attendance.createdAt,
        ],
      ];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A:F`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values },
      });

      this.logger.debug(
        `Attendance synced to Google Sheets: ${attendance.playerCode} - ${attendance.playerName}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to sync attendance ${attendance.playerCode}`,
        error,
      );
    }
  }

  async syncAllPlayers(): Promise<void> {
    if (!this.enabled) {
      this.logger.warn('Google Sheets sync is disabled');
      return;
    }

    const players = await this.prisma.player.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    });

    for (const player of players) {
      await this.syncPlayer({
        id: player.id,
        code: player.code,
        name: player.name,
        age: player.age,
        timeInClub: player.timeInClub,
        active: player.active,
        createdAt: player.createdAt.toISOString(),
        updatedAt: player.updatedAt.toISOString(),
      });
    }

    this.logger.log(`Synced ${players.length} players to Google Sheets`);
  }

  async syncAllAttendances(): Promise<void> {
    if (!this.enabled) {
      this.logger.warn('Google Sheets sync is disabled');
      return;
    }

    const attendances = await this.prisma.attendance.findMany({
      include: { player: true },
      orderBy: { date: 'desc' },
    });

    for (const att of attendances) {
      await this.syncAttendance({
        id: att.id,
        playerId: att.playerId,
        playerCode: att.player.code,
        playerName: att.player.name,
        date: att.date.toISOString(),
        createdAt: att.createdAt.toISOString(),
      });
    }

    this.logger.log(
      `Synced ${attendances.length} attendances to Google Sheets`,
    );
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}
