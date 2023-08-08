/**
 * Formats the PostgreSQL timestamp string into a more readable version.
 *
 * @param {String} timestampString - A timestamp string retrieved from the database
 * @returns {String} A string containing the formatted timestamp
 */
function formatTimestamp(timestampString) {

  // If the timestamp is falsy, return N/A
  if(!timestampString) {
    return "N/A"
  }

  const timestamp = new Date(timestampString);

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = monthNames[timestamp.getUTCMonth()];
  const day = String(timestamp.getUTCDate()).padStart(2, "0");

  const hours = String(timestamp.getUTCHours()).padStart(2, "0");
  const minutes = String(timestamp.getUTCMinutes()).padStart(2, "0");

  return `${month} ${day} | ${hours}.${minutes}`;
}

export default formatTimestamp;
