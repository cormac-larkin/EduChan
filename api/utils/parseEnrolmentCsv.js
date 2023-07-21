import streamifier from "streamifier";
import csvParser from "csv-parser";


/**
 * Reads a CSV file containing Student numbers and returns an array containing all of the Student numbers.
 * 
 * @param {File} csvFile 
 * @returns {Promise<String[]>} An array of Student numbers extracted from the CSV file.
 */
const parseEnrolmentCsv = async (csvFile) => {
  try {
    const studentNumbers = [];

    const stream = streamifier.createReadStream(csvFile.data);

    await new Promise((resolve, reject) => {
      stream
        .pipe(csvParser())
        .on("data", (data) => {
          const studentNumber = data["student_number"];
          if (studentNumber) {
            studentNumbers.push(studentNumber);
          }
        })
        .on("end", () => resolve())
        .on("error", (error) => reject(error));
    });

    return studentNumbers;
  } catch (error) {
    throw error;
  }
};

export default parseEnrolmentCsv;
