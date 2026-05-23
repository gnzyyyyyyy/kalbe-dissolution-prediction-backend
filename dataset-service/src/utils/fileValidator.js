const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const xlsx = require("xlsx");

exports.validateFile = (filePath) => {
    const ext = path.extname(filePath).toLowerCase();

    // CSV
    if (ext === ".csv") {
        return new Promise((resolve, reject) => {
            const results = [];

            fs.createReadStream(filePath)
                .pipe(csv())
                .on("data", (data) => results.push(data))
                .on("end", () => {
                    if (results.length > 0) {
                        resolve(results);
                    } 
                    resolve(results)
                })
                .on("error", (error) => {
                    reject(error);
                });
        })
    }
    if (ext === ".xlsx" || ext === ".xls") {
        const workbook = xlsx.readFile(filePath)
        const sheetName = workbook.SheetNames[0]

        const sheet = workbook.Sheets[sheetName]

        const data = xlsx.utils.sheet_to_json(sheet)

        if (data.length === 0) {
            throw new Error("XLSX File is empty")
        }

        return data
    }

    throw new Error("Invalid file format")    
}