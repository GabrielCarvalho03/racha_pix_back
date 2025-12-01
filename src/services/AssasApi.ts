import axios from "axios";

export const AssasApi = axios.create({
  baseURL: "https://api.asaas.com/v3",
  headers: {
    access_token: process.env.ASSAS_KEY,
  },
});

// export const AssasApi = axios.create({
//   baseURL: "https://api-sandbox.asaas.com/v3",
//   headers: {
//     access_token: process.env.ASSAS_KEY,
//   },
// });
