"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const server_1 = __importDefault(require("../src/server"));
async function handler(req, res) {
    await server_1.default.ready();
    server_1.default.server.emit("request", req, res);
}
