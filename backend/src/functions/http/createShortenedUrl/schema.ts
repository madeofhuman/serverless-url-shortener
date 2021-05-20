export default {
  title: "create",
  type: "object",
  properties: {
    longUrl: { type: 'string' },
  },
  required: ['longUrl'],
  additionalProperties: false
} as const;
