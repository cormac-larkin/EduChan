import streamifier from "streamifier";
import csvParser from "csv-parser";


/**
 * Validates a CSV file containing Student numbers to ensure the file is in the correct format.
 * 
 * @param {File} csvFile 
 * @returns {Promise<Boolean>} True if the CSV file is valid, otherwise returns false.
 */
const validateCsv = async (csvFile) => {
  try {

    let isValid;
    
    const stream = streamifier.createReadStream(csvFile.data);

    await new Promise((resolve, reject) => {
      stream
        .pipe(csvParser())
        .on("data", (data) => {
          const studentNumber = data["student_number"];
          if (studentNumber) {
            isValid = true;
          } else {
            isValid = false;
          }
        })
        .on("end", () => resolve())
        .on("error", (error) => reject(error));
    });

    return isValid;
  } catch (error) {
    throw error;
  }
};

export default validateCsv;