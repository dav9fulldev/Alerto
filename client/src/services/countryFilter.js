/**
 * Country bounding boxes for geospatial filtering
 * Format: [minLat, minLon, maxLat, maxLon]
 * Total: 195 countries + territories
 */

export const COUNTRY_BOUNDS = {
  // Americas - North
  "Canada": [41.68, -141.01, 83.11, -52.62],
  "USA": [24.52, -125.00, 49.38, -66.95],
  "Mexico": [14.54, -117.13, 32.72, -86.74],
  
  // Caribbean
  "Antigua_and_Barbuda": [16.98, -61.94, 17.73, -61.73],
  "Bahamas": [23.81, -87.62, 27.04, -73.93],
  "Barbados": [13.05, -59.54, 13.33, -59.42],
  "Belize": [15.88, -89.23, 18.50, -87.48],
  "Cuba": [19.82, -84.95, 23.27, -74.13],
  "Dominica": [15.20, -61.49, 15.64, -61.24],
  "Dominican_Republic": [17.54, -74.30, 20.00, -68.32],
  "Grenada": [12.00, -61.79, 12.54, -61.37],
  "Haiti": [18.03, -74.48, 20.09, -71.66],
  "Jamaica": [17.70, -78.37, 18.53, -76.79],
  "Puerto_Rico": [17.93, -67.27, 18.59, -65.58],
  "Saint_Kitts_and_Nevis": [17.08, -62.85, 17.42, -62.55],
  "Saint_Lucia": [13.71, -61.17, 14.27, -60.89],
  "Saint_Vincent_and_Grenadines": [12.58, -61.48, 13.38, -61.12],
  "Trinidad_and_Tobago": [10.04, -61.99, 10.89, -60.90],
  
  // Central America
  "Costa_Rica": [8.23, -85.95, 11.22, -82.55],
  "El_Salvador": [13.15, -90.13, 14.43, -88.10],
  "Guatemala": [14.10, -92.24, 17.82, -88.22],
  "Honduras": [14.97, -89.35, 17.62, -83.08],
  "Nicaragua": [10.71, -87.47, 15.50, -82.80],
  "Panama": [7.20, -82.98, 10.59, -77.14],
  
  // South America
  "Argentina": [-55.42, -73.63, -21.78, -53.63],
  "Bolivia": [-22.90, -69.64, -9.76, -57.51],
  "Brazil": [-33.77, -73.99, 5.27, -34.79],
  "Chile": [-56.53, -75.66, -17.50, -66.42],
  "Colombia": [0.80, -81.83, 13.41, -66.87],
  "Ecuador": [-5.50, -81.09, 1.45, -75.39],
  "Guyana": [1.17, -61.38, 8.60, -56.47],
  "Paraguay": [-27.63, -62.65, -19.29, -54.29],
  "Peru": [-18.35, -81.33, 0.04, -68.67],
  "Suriname": [1.84, -58.05, 6.04, -53.99],
  "Uruguay": [-34.97, -59.00, -33.64, -56.17],
  "Venezuela": [0.64, -73.35, 12.78, -59.80],
  
  // Europe - Western
  "Austria": [46.37, 9.53, 49.02, 16.98],
  "Belgium": [49.50, 2.39, 51.50, 6.40],
  "France": [42.80, -5.23, 51.14, 8.23],
  "Germany": [47.27, 5.87, 55.06, 15.04],
  "Ireland": [51.66, -10.56, 55.13, -5.43],
  "Luxembourg": [49.44, 5.73, 50.18, 6.24],
  "Monaco": [43.73, 7.41, 43.74, 7.42],
  "Netherlands": [50.75, 3.36, 53.52, 7.23],
  "Switzerland": [45.82, 5.96, 47.81, 10.49],
  "United_Kingdom": [50.00, -7.64, 58.63, 1.68],
  
  // Europe - Southern
  "Albania": [39.64, 19.27, 42.65, 21.06],
  "Andorra": [42.43, 1.41, 42.65, 1.79],
  "Bosnia_and_Herzegovina": [42.55, 15.77, 45.28, 19.62],
  "Croatia": [42.39, 12.39, 46.87, 19.39],
  "Cyprus": [34.57, 32.26, 35.23, 34.58],
  "Greece": [34.91, 19.37, 41.75, 28.24],
  "Italy": [36.62, 6.63, 47.12, 18.52],
  "Kosovo": [41.86, 19.76, 43.27, 21.79],
  "Malta": [35.80, 14.19, 36.08, 14.59],
  "Montenegro": [41.85, 18.45, 43.53, 20.36],
  "North_Macedonia": [40.84, 20.46, 42.40, 22.95],
  "Portugal": [36.84, -32.88, 42.15, -6.39],
  "San_Marino": [43.94, 12.41, 43.98, 12.46],
  "Serbia": [42.23, 18.82, 46.18, 23.01],
  "Slovenia": [45.42, 13.40, 46.86, 16.61],
  "Spain": [36.00, -9.30, 43.79, 3.31],
  "Vatican_City": [41.90, 12.45, 41.91, 12.46],
  
  // Europe - Eastern
  "Belarus": [51.26, 23.20, 56.15, 32.77],
  "Bulgaria": [40.36, 22.38, 44.23, 28.87],
  "Czech_Republic": [48.55, 12.09, 51.06, 18.86],
  "Hungary": [45.74, 16.20, 48.63, 22.90],
  "Poland": [49.00, 14.12, 54.84, 23.64],
  "Romania": [43.62, 20.26, 48.27, 29.63],
  "Slovakia": [47.73, 16.84, 49.61, 22.55],
  "Ukraine": [43.39, 22.14, 52.38, 40.23],
  
  // Europe - Nordic
  "Denmark": [54.55, 8.08, 57.75, 15.25],
  "Estonia": [57.52, 23.34, 59.61, 28.13],
  "Finland": [59.84, 19.08, 70.96, 31.59],
  "Iceland": [63.39, -24.54, 66.53, -13.50],
  "Latvia": [55.67, 20.97, 57.98, 27.02],
  "Lithuania": [53.89, 20.94, 56.45, 26.82],
  "Norway": [58.07, 4.70, 71.19, 31.29],
  "Sweden": [55.34, 11.27, 69.06, 24.17],
  
  // Russia & Central Asia
  "Kazakhstan": [40.61, 51.96, 55.38, 87.31],
  "Kyrgyzstan": [39.20, 69.29, 43.24, 80.96],
  "Russia": [41.19, 19.64, 81.86, 169.40],
  "Tajikistan": [36.74, 67.53, 37.55, 75.16],
  "Turkmenistan": [35.28, 52.50, 42.80, 66.69],
  "Uzbekistan": [37.18, 55.47, 45.61, 73.23],
  
  // Middle East & West Asia
  "Afghanistan": [29.35, 60.49, 37.23, 74.89],
  "Armenia": [38.84, 43.44, 40.28, 46.64],
  "Azerbaijan": [38.39, 44.76, 41.97, 50.60],
  "Bahrain": [25.87, 50.19, 26.28, 50.56],
  "Georgia": [41.05, 39.96, 43.58, 46.64],
  "Iran": [25.06, 44.05, 39.78, 63.32],
  "Iraq": [29.06, 39.94, 37.39, 48.57],
  "Israel": [29.34, 34.27, 33.42, 35.88],
  "Jordan": [29.20, 34.92, 32.81, 39.30],
  "Kuwait": [28.53, 46.55, 29.99, 48.43],
  "Lebanon": [33.06, 35.10, 34.80, 36.65],
  "Oman": [16.64, 51.99, 26.55, 60.50],
  "Palestine": [31.37, 34.26, 32.54, 35.55],
  "Qatar": [24.55, 50.74, 25.92, 51.61],
  "Saudi_Arabia": [16.38, 34.53, 32.16, 55.67],
  "Syria": [32.31, 35.70, 37.31, 42.43],
  "Turkey": [35.82, 25.80, 42.74, 44.82],
  "UAE": [22.63, 51.63, 26.21, 56.44],
  "Yemen": [12.59, 42.50, 19.00, 54.51],
  
  // South Asia
  "Bangladesh": [20.74, 88.01, 26.64, 92.67],
  "Bhutan": [27.00, 88.75, 28.35, 92.13],
  "India": [8.06, 68.18, 35.51, 97.25],
  "Maldives": [0.01, 72.69, 4.70, 73.75],
  "Nepal": [26.35, 80.06, 30.47, 88.17],
  "Pakistan": [23.52, 60.87, 37.08, 77.84],
  "Sri_Lanka": [5.92, 79.65, 9.84, 81.88],
  
  // East Asia
  "China": [18.20, 73.50, 53.56, 145.00],
  "Hong_Kong": [22.16, 113.83, 22.56, 114.44],
  "Japan": [30.08, 130.07, 45.52, 145.84],
  "Mongolia": [41.60, 87.75, 50.27, 119.77],
  "North_Korea": [37.67, 124.17, 43.01, 130.78],
  "South_Korea": [33.06, 125.06, 38.96, 131.87],
  "Taiwan": [21.87, 120.15, 25.30, 121.97],
  
  // Southeast Asia
  "Brunei": [4.00, 114.05, 5.05, 115.37],
  "Cambodia": [10.41, 102.34, 14.69, 107.64],
  "Indonesia": [-10.60, 95.29, 6.48, 141.04],
  "Laos": [14.07, 100.09, 22.50, 107.67],
  "Malaysia": [1.25, 99.64, 6.72, 119.26],
  "Myanmar": [9.15, 92.67, 28.84, 101.18],
  "Philippines": [5.58, 119.27, 19.60, 129.42],
  "Singapore": [1.13, 103.64, 1.47, 104.07],
  "Thailand": [5.61, 97.34, 20.47, 105.64],
  "Timor_Leste": [-9.41, 124.05, -8.13, 127.34],
  "Vietnam": [8.55, 102.14, 23.39, 109.46],
  
  // Oceania
  "Australia": [-43.64, 113.21, -10.90, 154.00],
  "Fiji": [-17.94, 177.04, -16.07, -177.49],
  "Kiribati": [-3.60, 169.13, 3.00, -150.24],
  "Marshall_Islands": [7.09, 165.27, 11.86, 171.38],
  "Micronesia": [3.13, 137.39, 10.27, 163.01],
  "Nauru": [-0.55, 166.91, -0.50, 166.96],
  "New_Zealand": [-47.29, 166.71, -34.40, 178.59],
  "Palau": [3.10, 131.12, 8.35, 134.72],
  "Papua_New_Guinea": [-12.23, 141.00, -0.90, 157.50],
  "Samoa": [-13.90, -172.80, -13.43, -171.39],
  "Solomon_Islands": [-12.38, 156.47, -6.60, 162.40],
  "Tonga": [-21.42, -175.36, -15.56, -173.04],
  "Tuvalu": [-8.53, 179.20, -5.95, -179.88],
  "Vanuatu": [-20.26, 166.51, -14.59, 167.84],
  
  // Africa - North
  "Algeria": [18.95, -8.68, 37.10, 12.00],
  "Egypt": [22.00, 24.70, 31.59, 36.92],
  "Libya": [19.50, 10.20, 33.17, 25.00],
  "Morocco": [27.08, -13.18, 36.00, -2.65],
  "Tunisia": [30.23, 8.46, 37.55, 11.50],
  "Sudan": [3.50, 21.81, 22.00, 38.41],
  "South_Sudan": [3.50, 24.23, 6.88, 35.31],
  
  // Africa - West
  "Benin": [6.50, 0.77, 12.42, 3.84],
  "Burkina_Faso": [9.61, -5.47, 15.08, 2.39],
  "Cape_Verde": [16.64, -25.36, 17.20, -22.67],
  "Côte_d'Ivoire": [4.40, -8.60, 10.52, -2.50],
  "Gambia": [13.04, -16.84, 13.81, -13.80],
  "Ghana": [4.74, -3.25, 11.17, 1.19],
  "Guinea": [7.42, -15.13, 12.59, -8.84],
  "Guinea_Bissau": [10.93, -15.10, 12.68, -13.64],
  "Liberia": [4.36, -12.38, 8.55, -7.57],
  "Mali": [10.16, -12.24, 25.16, 4.27],
  "Mauritania": [20.13, -17.07, 27.66, -8.67],
  "Niger": [11.70, -16.67, 23.52, 14.15],
  "Nigeria": [4.27, 2.69, 13.89, 14.68],
  "Senegal": [12.37, -17.53, 14.97, -11.47],
  "Sierra_Leone": [6.82, -13.29, 9.97, -10.23],
  "Togo": [6.12, 0.80, 11.14, 1.80],
  
  // Africa - Central
  "Cameroon": [1.73, 8.48, 12.98, 16.19],
  "Central_African_Republic": [2.23, 14.42, 11.01, 27.46],
  "Chad": [7.45, 14.20, 23.45, 27.60],
  "Congo": [-5.03, 12.00, 3.72, 25.34],
  "Democratic_Republic_of_Congo": [-13.26, 12.18, 5.39, 40.19],
  "Equatorial_Guinea": [0.92, 9.43, 3.74, 11.29],
  "Gabon": [-4.04, 8.60, 2.32, 14.50],
  "Sao_Tome_and_Principe": [0.01, 6.42, 1.70, 7.50],
  
  // Africa - East
  "Burundi": [-4.42, 29.02, -2.37, 30.87],
  "Comoros": [-12.38, 43.33, -11.17, 44.55],
  "Djibouti": [10.93, 41.80, 12.71, 43.42],
  "Eritrea": [12.37, 36.43, 17.82, 43.13],
  "Ethiopia": [3.42, 32.99, 14.88, 47.99],
  "Kenya": [-4.68, 33.91, 4.62, 41.90],
  "Madagascar": [-25.61, 43.23, -11.95, 50.48],
  "Mauritius": [-20.34, 57.30, -19.97, 57.80],
  "Mozambique": [-26.87, 30.22, -10.60, 40.84],
  "Rwanda": [-2.84, 28.86, -1.05, 30.90],
  "Seychelles": [-5.71, 55.21, -4.63, 55.79],
  "Somalia": [-1.68, 40.31, 11.98, 51.41],
  "Tanzania": [-11.72, 29.34, -0.95, 40.44],
  "Uganda": [-1.48, 29.34, 4.24, 35.00],
  "Zambia": [-17.96, 24.67, -8.23, 33.71],
  "Zimbabwe": [-22.27, 25.26, -15.62, 32.87],
  
  // Africa - Southern
  "Angola": [-18.02, 11.84, -4.38, 24.08],
  "Botswana": [-26.87, 19.99, -17.79, 29.43],
  "Eswatini": [-27.29, 30.82, -25.72, 32.13],
  "Lesotho": [-30.67, 27.01, -28.57, 29.45],
  "Namibia": [-28.88, 11.73, -16.97, 25.26],
  "South_Africa": [-34.84, 16.45, -22.13, 32.89],
  
  // Dependent territories
  "American_Samoa": [-14.06, -170.82, -13.90, -170.60],
  "Aruba": [12.01, -70.07, 12.21, -69.88],
  "Bermuda": [32.05, -64.88, 32.40, -64.64],
  "British_Virgin_Islands": [18.42, -64.73, 18.74, -64.56],
  "Cayman_Islands": [19.28, -81.40, 19.40, -79.74],
  "Curacao": [12.17, -69.06, 12.39, -68.76],
  "French_Guiana": [2.11, -54.60, 5.75, -51.64],
  "French_Polynesia": [-27.67, -157.41, -8.76, -134.43],
  "Guadeloupe": [16.06, -61.81, 16.51, -61.18],
  "Guam": [13.23, 144.64, 13.65, 144.96],
  "Martinique": [14.40, -61.20, 14.87, -60.82],
  "Montserrat": [16.68, -62.19, 16.79, -62.07],
  "New_Caledonia": [-22.67, 163.53, -19.65, 168.10],
  "Northern_Mariana_Islands": [14.11, 144.88, 20.55, 146.07],
  "Reunion": [-21.39, 55.22, -20.87, 55.84],
  "Sint_Maarten": [18.03, -63.19, 18.23, -63.01],
  "US_Virgin_Islands": [17.73, -65.15, 18.41, -64.57],
  "British_Indian_Ocean_Territory": [-7.48, 71.74, -5.27, 72.51],
  "Falkland_Islands": [-52.97, -61.39, -51.09, -57.75],
  "Saint_Helena": [-16.07, -5.75, -15.86, -5.62],
  "Turks_and_Caicos_Islands": [21.71, -72.28, 22.35, -71.10],
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
