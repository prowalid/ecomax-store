const { z } = require('zod');

exports.saveSettingsSchema = z.object({
  value: z.union([
    z.record(z.string(), z.unknown()),
    z.array(z.unknown()),
  ]),
});
