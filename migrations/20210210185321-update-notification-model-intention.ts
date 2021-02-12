module.exports = {
  async up(db, _client) {
    await db
      .collection('notifications')
      .updateMany({}, { $set: { type: 'prayer', itemId: 'tmp' } })
  },

  async down(db, _client) {
    await db
      .collection('notifications')
      .updateMany({}, { $unset: { type: null, itemId: null } })
  },
}
