import Papa from 'papaparse';
import * as XLSX from 'xlsx';

/**
 * Infer data type of an array of values
 */
export function inferColumnType(values) {
  const nonNulls = values.filter(v => v !== null && v !== undefined && String(v).trim() !== '');
  if (nonNulls.length === 0) return 'string';

  let numCount = 0;
  let dateCount = 0;
  let boolCount = 0;

  for (const val of nonNulls.slice(0, 100)) {
    const str = String(val).trim();
    
    // Check boolean
    if (['true', 'false', 'yes', 'no'].includes(str.toLowerCase())) {
      boolCount++;
      continue;
    }

    // Check numeric (including negative, float, currency stripped)
    const cleanNum = str.replace(/[$,€£%]/g, '');
    if (!isNaN(cleanNum) && !isNaN(parseFloat(cleanNum))) {
      numCount++;
      continue;
    }

    // Check date pattern
    if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(str) || /^\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/.test(str)) {
      const d = new Date(str);
      if (!isNaN(d.getTime())) {
        dateCount++;
        continue;
      }
    }
  }

  const sampleSize = Math.min(nonNulls.length, 100);
  if (numCount / sampleSize > 0.75) return 'number';
  if (dateCount / sampleSize > 0.75) return 'date';
  if (boolCount / sampleSize > 0.75) return 'boolean';
  return 'string';
}

/**
 * Profile schema and summary metrics for a dataset
 */
export function profileDataset(data, filename = 'Uploaded Dataset', fileSize = 0) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Dataset contains no readable records');
  }

  const rawColumns = Object.keys(data[0] || {});
  const rowCount = data.length;
  let totalMissingCells = 0;

  // Track duplicates using first 1000 rows
  const seenRows = new Set();
  let duplicateCount = 0;
  const sampleLimit = Math.min(rowCount, 2000);
  for (let i = 0; i < sampleLimit; i++) {
    const key = JSON.stringify(data[i]);
    if (seenRows.has(key)) {
      duplicateCount++;
    } else {
      seenRows.add(key);
    }
  }

  // Profile each column
  const columns = rawColumns.map(colName => {
    const values = data.map(row => row[colName]);
    const nulls = values.filter(v => v === null || v === undefined || String(v).trim() === '').length;
    totalMissingCells += nulls;
    const type = inferColumnType(values);

    // Compute distinct values
    const uniqueValues = new Set(values.filter(v => v !== null && v !== undefined && String(v).trim() !== ''));
    const uniqueCount = uniqueValues.size;

    // Numeric stats
    let min = null;
    let max = null;
    let avg = null;

    if (type === 'number') {
      const numericVals = values
        .map(v => (v !== null && v !== undefined ? parseFloat(String(v).replace(/[$,€£%]/g, '')) : NaN))
        .filter(n => !isNaN(n));

      if (numericVals.length > 0) {
        min = Math.min(...numericVals);
        max = Math.max(...numericVals);
        const sum = numericVals.reduce((acc, curr) => acc + curr, 0);
        avg = parseFloat((sum / numericVals.length).toFixed(2));
      }
    }

    return {
      name: colName,
      type,
      nullCount: nulls,
      nullPercentage: parseFloat(((nulls / rowCount) * 100).toFixed(1)),
      uniqueCount,
      min,
      max,
      avg
    };
  });

  const totalCells = rowCount * rawColumns.length;
  const overallCompleteness = totalCells > 0 ? parseFloat((((totalCells - totalMissingCells) / totalCells) * 100).toFixed(1)) : 100;
  
  // Calculate data health score (0 to 100)
  const missingPenalty = (100 - overallCompleteness) * 0.7;
  const duplicatePenalty = Math.min(20, (duplicateCount / sampleLimit) * 100 * 0.5);
  const healthScore = Math.max(10, Math.round(100 - missingPenalty - duplicatePenalty));

  return {
    id: `ds-${Date.now()}`,
    name: filename,
    fileSize,
    rowCount,
    columnCount: rawColumns.length,
    columns,
    data,
    sampleData: data.slice(0, 50),
    summary: {
      totalCells,
      totalMissingCells,
      missingPercentage: parseFloat(((totalMissingCells / (totalCells || 1)) * 100).toFixed(1)),
      duplicateRows: duplicateCount,
      completeness: overallCompleteness,
      healthScore
    },
    uploadedAt: new Date().toISOString(),
    isDemo: false
  };
}

/**
 * Parse a CSV File using PapaParse
 */
export function parseCsvFile(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors && results.errors.length > 0 && (!results.data || results.data.length === 0)) {
          reject(new Error(results.errors[0].message || 'Failed to parse CSV file'));
          return;
        }

        try {
          const profiled = profileDataset(results.data, file.name, file.size);
          resolve(profiled);
        } catch (err) {
          reject(err);
        }
      },
      error: (err) => {
        reject(new Error(err.message || 'Error reading CSV file'));
      }
    });
  });
}

/**
 * Parse an Excel File (.xlsx, .xls) using SheetJS
 */
export function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target.result;
        const workbook = XLSX.read(buffer, { type: 'array' });
        
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          throw new Error('Excel workbook contains no sheets');
        }

        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: null });

        if (!rawJson || rawJson.length === 0) {
          throw new Error('Excel sheet contains no data rows');
        }

        const profiled = profileDataset(rawJson, file.name, file.size);
        resolve(profiled);
      } catch (err) {
        reject(new Error(err.message || 'Error processing Excel file'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file from disk'));
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Master parser handling both CSV and Excel
 */
export async function parseUploadedDataset(file) {
  const extension = file.name.split('.').pop().toLowerCase();

  if (extension === 'csv') {
    return await parseCsvFile(file);
  } else if (['xlsx', 'xls'].includes(extension)) {
    return await parseExcelFile(file);
  } else {
    throw new Error(`Unsupported file format (.${extension}). Please upload CSV or Excel files.`);
  }
}
