// src/types/axios.d.ts
import "axios";

declare module "axios" {
  // Tambahkan flag custom untuk interceptor retry
  export interface InternalAxiosRequestConfig {
    __retry?: boolean;
  }
  export interface AxiosRequestConfig {
    __retry?: boolean;
  }
}
