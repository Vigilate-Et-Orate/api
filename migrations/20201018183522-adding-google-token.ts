module.exports = {
  async up(db, _client) {
    await db
      .collection('users')
      .updateMany({}, { $set: { googleId: '', googleAccessToken: '' } })
  },

  async down(db, _client) {
    await db
      .collection('users')
      .updateMany({}, { $unset: { googleId: null, googleAccessToken: null } })
  },
}
