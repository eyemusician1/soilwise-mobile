import { Model } from '@nozbe/watermelondb';
import { date, field, readonly, text } from '@nozbe/watermelondb/decorators';

export default class Crop extends Model {
  static table = 'crops';

  @text('crop_id') cropId!: string;
  @text('crop_name') cropName!: string;
  @text('display_name') displayName!: string;
  @field('is_seasonal') isSeasonal!: boolean;
  @text('requirements_json') requirementsJson!: string;

  @readonly @date('created_at') createdAt!: Date;
}