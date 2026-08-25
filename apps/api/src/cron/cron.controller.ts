import {
  Controller,
  Post,
  Headers,
  UnauthorizedException,
  ServiceUnavailableException,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { timingSafeEqual } from 'crypto';
import { AppointmentRemindersService } from '../appointments/appointment-reminders.service';

/**
 * Déclencheur externe pour les tâches planifiées.
 *
 * Sur un hébergeur gratuit, le service s'endort après quelques minutes sans
 * trafic et `@nestjs/schedule`, qui est un minuteur en mémoire, ne s'exécute
 * plus. Un appel régulier depuis un cron externe (cron-job.org) réveille le
 * service *et* déclenche la vérification, ce que le minuteur interne ne peut
 * plus garantir seul.
 *
 * L'opération est idempotente : un rappel déjà envoyé n'est jamais renvoyé,
 * donc un appel trop fréquent est sans conséquence.
 */
@Controller('cron')
export class CronController {
  private readonly logger = new Logger(CronController.name);

  constructor(private readonly reminders: AppointmentRemindersService) {}

  @Post('reminders')
  @HttpCode(HttpStatus.OK)
  async runReminders(@Headers('x-cron-secret') secret?: string) {
    this.assertAuthorized(secret);

    const result = await this.reminders.checkAndSendReminders();
    this.logger.log(
      `Cron externe : ${result.sent24h} rappel(s) 24h, ${result.sent2h} rappel(s) 2h`,
    );

    return { ok: true, ...result, at: new Date().toISOString() };
  }

  private assertAuthorized(provided?: string) {
    const expected = process.env.CRON_SECRET;

    // Sans secret configuré, la route resterait ouverte à tous : on la ferme.
    if (!expected) {
      throw new ServiceUnavailableException('CRON_SECRET is not configured');
    }
    if (!provided) {
      throw new UnauthorizedException('Missing cron secret');
    }

    // Comparaison à durée constante : une comparaison naïve laisse fuir le
    // secret caractère par caractère en mesurant le temps de réponse.
    const a = Buffer.from(provided);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new UnauthorizedException('Invalid cron secret');
    }
  }
}
