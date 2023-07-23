/**
 * Takes an array of database message results and reformats them so that each message object contains an array of the user_ids of those who liked it.
 *
 * @param {[{}]} resultSet
 * @returns {[{}]}
 */
const attachLikesToMessage = (resultSet) => {
  return resultSet.rows.reduce((acc, row) => {
    const message = acc.find((m) => m.message_id === row.message_id);
    if (message) {
      message.likedBy.push(row.liker_id);
    } else {
      const { liker_id, ...cleanedMessage } = row;
      acc.push({
        ...cleanedMessage,
        likedBy: liker_id ? [liker_id] : [],
      });
    }
    return acc; // Return the accumulator after each iteration
  }, []);
};
export default attachLikesToMessage;
