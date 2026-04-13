/**
 * Country bounding boxes for geospatial filtering
 * Format: [minLat, minLon, maxLat, maxLon]
 */

export const COUNTRY_BOUNDS = {
  "Haiti": [18.03, -74.48, 20.09, -71.66],
  "Dominican_Republic": [17.54, -74.30, 20.00, -68.32],
  "Jamaica": [17.70, -78.37, 18.53, -76.79],
  "Cuba": [19.82, -84.95, 23.27, -74.13],
  "Puerto_Rico": [17.93, -67.27, 18.59, -65.58],
  "Colombia": [0.80, -81.83, 13.41, -66.87],
  "Venezuela": [0.64, -73.35, 12.78, -59.80],
  "Ecuador": [-5.50, -81.09, 1.45, -75.39],
  "Peru": [-18.35, -81.33, 0.04, -68.67],
  "Brazil": [-33.77, -73.99, 5.27, -34.79],
  "Bolivia": [-22.90, -69.64, -9.76, -57.51],
  "Paraguay": [-27.63, -62.65, -19.29, -54.29],
  "Argentina": [-55.42, -73.63, -21.78, -53.63],
  "Chile": [-56.53, -75.66, -17.50, -66.42],
  "Uruguay": [-34.97, -59.00, -33.64, -56.17],
  "Philippines": [5.58, 119.27, 19.60, 129.42],
  "Indonesia": [-10.60, 95.29, 6.48, 141.04],
  "Vietnam": [8.55, 102.14, 23.39, 109.46],
  "Thailand": [5.61, 97.34, 20.47, 105.64],
  "Myanmar": [9.15, 92.67, 28.84, 101.18],
  "Cambodia": [10.41, 102.34, 14.69, 107.64],
  "Laos": [14.07, 100.09, 22.50, 107.67],
  "Pakistan": [23.52, 60.87, 37.08, 77.84],
  "Afghanistan": [29.35, 60.49, 37.23, 74.89],
  "Bangladesh": [20.74, 88.01, 26.64, 92.67],
  "Nepal": [26.35, 80.06, 30.47, 88.17],
  "India": [8.06, 68.18, 35.51, 97.25],
  "Sri_Lanka": [5.92, 79.65, 9.84, 81.88],
  "Turkey": [35.82, 25.80, 42.74, 44.82],
  "Syria": [32.31, 35.70, 37.31, 42.43],
  "Lebanon": [33.06, 35.10, 34.80, 36.65],
  "Palestine": [31.37, 34.26, 32.54, 35.55],
  "Israel": [29.34, 34.27, 33.42, 35.88],
  "Jordan": [29.20, 34.92, 32.81, 39.30],
  "Iraq": [29.06, 39.94, 37.39, 48.57],
  "Iran": [25.06, 44.05, 39.78, 63.32],
  "Saudi_Arabia": [16.38, 34.53, 32.16, 55.67],
  "Yemen": [12.59, 42.50, 19.00, 54.51],
  "Oman": [16.64, 51.99, 26.55, 60.50],
  "UAE": [22.63, 51.63, 26.21, 56.44],
  "Kenya": [-4.68, 33.91, 4.62, 41.90],
  "Tanzania": [-11.72, 29.34, -0.95, 40.44],
  "Uganda": [-1.48, 29.34, 4.24, 35.00],
  "Somalia": [-1.68, 40.31, 11.98, 51.41],
  "Ethiopia": [3.42, 32.99, 14.88, 47.99],
  "Djibouti": [10.93, 41.80, 12.71, 43.42],
  "Sudan": [3.50, 21.81, 22.00, 38.41],
  "South_Sudan": [3.50, 24.23, 6.88, 35.31],
  "Nigeria": [4.27, 2.69, 13.89, 14.68],
  "Cameroon": [1.73, 8.48, 12.98, 16.19],
  "Chad": [7.45, 14.20, 23.45, 27.60],
  "Libya": [19.50, 10.20, 33.17, 25.00],
  "Egypt": [22.00, 24.70, 31.59, 36.92],
  "MaliFrance": [10.16, -12.24, 25.16, 4.27],
  "Mauritania": [20.13, -17.07, 27.66, -8.67],
};

export const COUNTRY_LIST = Object.keys(COUNTRY_BOUNDS).sort();

/**
 * Check if a coordinate is within country bounds
 * @param {[lon, lat]} coordinates - [longitude, latitude]
 * @param {string} country - Country name
 * @returns {boolean}
 */
export const isCoordinateInCountry = (coordinates, country) => {
  if (!COUNTRY_BOUNDS[country]) return false;
  
  const [lon, lat] = coordinates;
  const [minLat, minLon, maxLat, maxLon] = COUNTRY_BOUNDS[country];
  
  return lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon;
};

/**
 * Get country name from coordinates
 * @param {[lon, lat]} coordinates
 * @returns {string|null}
 */
export const getCountryFromCoordinates = (coordinates) => {
  for (const country in COUNTRY_BOUNDS) {
    if (isCoordinateInCountry(coordinates, country)) {
      return country.replace(/_/g, ' ');
    }
  }
  return null;
};

/**
 * Filter reports by country
 * @param {Array} reports
 * @param {string} country
 * @returns {Array}
 */
export const filterReportsByCountry = (reports, country) => {
  if (!country || country === "All") {
    return reports;
  }
  
  return reports.filter(report => 
    isCoordinateInCountry(report.location.coordinates, country)
  );
};
