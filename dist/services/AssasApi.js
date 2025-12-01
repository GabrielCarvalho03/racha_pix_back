"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssasApi = void 0;
const axios_1 = __importDefault(require("axios"));
exports.AssasApi = axios_1.default.create({
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
