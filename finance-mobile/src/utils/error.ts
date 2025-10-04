// src/utils/error.ts
import axios, { type AxiosError } from "axios";

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

export function getErrorMessage(e: unknown): string {
  if (axios.isAxiosError(e)) {
    const ax = e as AxiosError<unknown>;
    const data = ax.response?.data;

    // Coba baca pola umum: { error: string } atau { message: string }
    if (isRecord(data)) {
      const errVal = data["error"];
      if (typeof errVal === "string" && errVal.trim()) return errVal;

      const msgVal = data["message"];
      if (typeof msgVal === "string" && msgVal.trim()) return msgVal;
    }

    if (typeof ax.message === "string" && ax.message.trim()) return ax.message;
  }

  if (e instanceof Error) {
    return e.message;
  }

  try {
    return JSON.stringify(e);
  } catch {
    return "Terjadi kesalahan yang tidak diketahui.";
  }
}
