export default {
  title: "create",
  type: "object",
  properties: {
    url: { type: 'string' },
  },
  required: ['longUrl', 'shortUrl'],
  additionalProperties: false
} as const;
