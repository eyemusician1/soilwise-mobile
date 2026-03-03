import { Model } from '@nozbe/watermelondb';
import { date, field, readonly, text } from '@nozbe/watermelondb/decorators';

export default class Evaluation extends Model {
  static table = 'evaluation_results';

  @text('input_id') inputId!: string;
  @text('crop_id') cropId!: string;
  @text('season') season!: string | null;
  
  @field('lsi') lsi!: number;
  @text('lsc') lsc!: string;
  @text('full_classification') fullClassification!: string;
  @text('limiting_factors') limitingFactors!: string | null;
  
  @field('synced_to_server') syncedToServer!: boolean;
  @readonly @date('created_at') createdAt!: Date;
}