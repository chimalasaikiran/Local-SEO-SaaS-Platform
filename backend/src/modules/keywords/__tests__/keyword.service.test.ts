import { KeywordService } from '../keyword.service';

describe('KeywordService', () => {
  describe('normalizeKeyword', () => {
    it('should lowercase keywords', () => {
      expect(KeywordService.normalizeKeyword('DENTIST')).toBe('dentist');
      expect(KeywordService.normalizeKeyword('Dentist Near Me')).toBe('dentist near me');
    });

    it('should trim whitespace', () => {
      expect(KeywordService.normalizeKeyword('  dentist  ')).toBe('dentist');
    });

    it('should collapse multiple spaces between words', () => {
      expect(KeywordService.normalizeKeyword('dentist     near    me')).toBe('dentist near me');
    });

    it('should handle combination of all cases', () => {
      expect(KeywordService.normalizeKeyword('  DENTIST   NEAR    ME  ')).toBe('dentist near me');
    });
  });
});
