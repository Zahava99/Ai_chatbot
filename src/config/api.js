
// Central API configuration
// const token = localStorage.getItem('jwtToken'); not use for now
//https://localhost:7269/api
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || "http://localhost:3000",
//   ALTER_URL: process.env.REACT_APP_API_ALTER_URL || "http://localhost:3000", //For PayOSAllPayments not use for now
  TIMEOUT: 10000,
  HEADERS: {
    'Authorization': `Bearer ${token}`,
    "Content-Type": "application/json",
  },
};